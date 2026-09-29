import { NextResponse } from "next/server";
import { createComic, addChapterToComic, getComicsStore } from "@/lib/data";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow longer execution for scraping

// ─────────────────────────────────────────────
// Helper: fetch HTML from a URL with browser-like headers
// ─────────────────────────────────────────────
async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xhtml+xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8",
      Referer: "https://manhwasaku.my.id/",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

// ─────────────────────────────────────────────
// Helper: extract JSON payload from Next.js __next_f.push RSC stream
// ─────────────────────────────────────────────
function extractNextData(html: string): Record<string, unknown> {
  try {
    const matches = html.match(/self\.__next_f\.push\(\[1,"(.+?)"\]/g);
    if (!matches) return {};
    let combined = "";
    for (let i = 0; i < matches.length; i++) {
      const inner = matches[i].replace(/^self\.__next_f\.push\(\[1,"/, "").replace(/"\]\)$/, "");
      try { combined += JSON.parse('"' + inner + '"'); } catch { combined += inner; }
    }
    return { raw: combined };
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────
// Parser: Extract comic metadata from manhwasaku listing page HTML
// ─────────────────────────────────────────────
function parseComicMetadata(html: string, baseUrl: string) {
  const origin = new URL(baseUrl).origin;

  // Title
  const titleMatch = html.match(/<title>Baca\s+(.+?)\s+(?:Manhwa|Manga|Manhua)[^<]*<\/title>/i) ||
    html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : "Imported Comic";

  // Cover image URL
  const coverMatch = html.match(/\/api\/v1\/images\/cover\/([^"'\s]+)/);
  const coverPath = coverMatch ? `/api/v1/images/cover/${coverMatch[1]}` : null;
  const coverUrl = coverPath ? `${origin}${coverPath}` : "";

  // Description from JSON-LD or meta
  const descMatch = html.match(/"description":"([^"]+)"/);
  const description = descMatch
    ? descMatch[1].replace(/\\r\\n/g, " ").replace(/\\n/g, " ").trim()
    : `Baca komik ${title} Bahasa Indonesia terbaru.`;

  // Genres
  const genres: string[] = [];
  const genreRegex = /\/browse\?genre=([^"&]+)/g;
  let gm: RegExpExecArray | null;
  const genreSet = new Set<string>();
  while ((gm = genreRegex.exec(html)) !== null) {
    genreSet.add(decodeURIComponent(gm[1]));
  }
  genreSet.forEach((g) => { if (genres.length < 5) genres.push(g); });

  // Author
  const authorMatch = html.match(/"author":\{"@type":"Person","name":"([^"]+)"\}/);
  const author = authorMatch ? authorMatch[1] : "Unknown";

  // Status
  const isCompleted = html.includes("Completed") || html.includes("Tamat");
  const status: "ongoing" | "completed" = isCompleted ? "completed" : "ongoing";

  // Type
  const typeMatch = html.match(/manhwa|manga|manhua/i);
  const rawType = typeMatch ? typeMatch[0].toLowerCase() : "manhwa";
  const type =
    rawType === "manga" ? "Manga" : rawType === "manhua" ? "Manhua" : "Manhwa";

  // Chapter URLs from the listing page
  // Pattern: href="/webtoon/<id>/chapter/<chapter-slug>"
  // manhwasaku example: /webtoon/131241-solo-max-level-newbie/chapter/solo-max-level-newbie-chapter-278
  const chapterLinkRegex = /href="(\/webtoon\/[^"]+\/chapter\/[^"]+)"/g;
  const chapterLinks: { url: string; num: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = chapterLinkRegex.exec(html)) !== null) {
    const href = m[1];
    // Try multiple patterns to extract chapter number:
    // 1. "chapter-278" at end of URL
    // 2. "-chapter-278" pattern
    // 3. Any trailing number after "chapter"
    const numMatch =
      href.match(/[-_]chapter[-_](\d+(?:\.\d+)?)(?:[^/\d]|$)/i) ||
      href.match(/chapter[-_](\d+(?:\.\d+)?)(?:[^/\d]|$)/i) ||
      href.match(/(\d+(?:\.\d+)?)(?:[^/\d]|$)/);

    if (numMatch) {
      const num = parseFloat(numMatch[1]);
      if (num > 0) { // Avoid chapter 0
        const fullUrl = `${origin}${href}`;
        if (!chapterLinks.some((c) => c.num === num)) {
          chapterLinks.push({ url: fullUrl, num });
        }
      }
    }
  }

  // Sort: ascending order so we process ch1 first
  chapterLinks.sort((a, b) => a.num - b.num);

  return { title, coverUrl, description, genres, author, status, type, chapterLinks };
}

// ─────────────────────────────────────────────
// Parser: Extract page image URLs from a chapter page HTML
// ─────────────────────────────────────────────
function parseChapterPages(html: string, baseUrl: string): string[] {
  const origin = new URL(baseUrl).origin;

  // Strategy 1: Extract from Next.js RSC stream — most reliable
  // The RSC payload contains: "pages":["/api/v1/pages/4469762",...]
  const rscPagesCheck = html.match(/"pages":\["(\/api\/v1\/pages\/[^"]+)"/);
  if (rscPagesCheck) {
    const pageResults: string[] = [];
    const pageRe = /"\/api\/v1\/pages\/(\d+)"/g;
    let pm: RegExpExecArray | null;
    while ((pm = pageRe.exec(html)) !== null) {
      pageResults.push(`${origin}/api/v1/pages/${pm[1]}`);
    }
    if (pageResults.length > 0) return pageResults;
  }

  // Strategy 2: Extract from img src attributes with /api/v1/pages/ pattern
  const imgResults: string[] = [];
  const imgRe = /src="(\/api\/v1\/pages\/\d+)"/g;
  let im: RegExpExecArray | null;
  while ((im = imgRe.exec(html)) !== null) {
    imgResults.push(`${origin}${im[1]}`);
  }
  if (imgResults.length > 0) return imgResults;

  // Strategy 3: Extract direct CDN image URLs
  const directResults: string[] = [];
  const directRe = /src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/g;
  let dm: RegExpExecArray | null;
  while ((dm = directRe.exec(html)) !== null) {
    const u = dm[1];
    if (!u.includes("/_next/") && !u.includes("cover") && !u.includes("icon")) {
      directResults.push(u);
    }
  }
  if (directResults.length > 0) return directResults;

  return [];
}

// ─────────────────────────────────────────────
// Helper: wrap external image URL through local proxy
// This bypasses hotlink protection on source sites
// ─────────────────────────────────────────────
function proxyUrl(imageUrl: string): string {
  // Only proxy external URLs, not already-local ones
  if (!imageUrl.startsWith("http")) return imageUrl;
  return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
}

// ─────────────────────────────────────────────
// Helper: generate a URL-safe slug from a title
// ─────────────────────────────────────────────
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─────────────────────────────────────────────
// POST /api/admin/import-manhwa
// Body: { url: string, maxChapters?: number }
// ─────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, maxChapters } = body as { url: string; maxChapters?: number };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, message: "URL wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUrl = url.trim().replace(/\/$/, "");

    // ── Step 1: Fetch and parse the comic listing page ──────────────────────
    let listingHtml: string;
    try {
      listingHtml = await fetchPage(cleanUrl);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json(
        { success: false, message: `Gagal mengakses URL: ${msg}` },
        { status: 400 }
      );
    }

    const meta = parseComicMetadata(listingHtml, cleanUrl);

    if (meta.chapterLinks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tidak ada chapter yang ditemukan di halaman ini. Pastikan URL adalah halaman utama komik (bukan chapter).",
        },
        { status: 400 }
      );
    }

    // ── Step 2: Determine slug and check if comic already exists ────────────
    const slug = toSlug(meta.title);
    const store = getComicsStore();
    const existing = store.find((c) => c.slug === slug);

    // Limit chapters to scrape
    const limit = maxChapters && maxChapters > 0 ? maxChapters : meta.chapterLinks.length;
    // When importing for the first time, import all chapters up to limit
    // When comic exists, only import chapters that don't exist yet
    let chaptersToProcess = meta.chapterLinks.slice(0, limit);

    if (existing) {
      const existingNums = new Set(existing.chapters.map((c) => c.chapterNumber));
      chaptersToProcess = chaptersToProcess.filter((c) => !existingNums.has(c.num));
    }

    if (chaptersToProcess.length === 0 && existing) {
      return NextResponse.json({
        success: true,
        action: "no_new_chapters",
        message: `Komik "${existing.title}" sudah ada dan semua chapter sudah diimport. Total: ${existing.chapters.length} chapter.`,
        data: { title: existing.title, slug: existing.slug, chapters: existing.chapters.length },
      });
    }

    // ── Step 3: Scrape each chapter page for image URLs ─────────────────────
    const importedChapters: { num: number; pages: number }[] = [];
    const errors: string[] = [];

    // Process in batches of 3 to avoid hammering the server
    const batchSize = 3;
    let currentComic = existing || null;

    for (let i = 0; i < chaptersToProcess.length; i += batchSize) {
      const batch = chaptersToProcess.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async ({ url: chUrl, num }) => {
          try {
            const chHtml = await fetchPage(chUrl);
            const rawPages = parseChapterPages(chHtml, chUrl);

            if (rawPages.length === 0) {
              errors.push(`Chapter ${num}: Tidak ada gambar ditemukan`);
              return;
            }

            // Proxy all page images through our local endpoint
            const pages = rawPages.map(proxyUrl);
            const coverProxied = meta.coverUrl ? proxyUrl(meta.coverUrl) : pages[0];

            if (!currentComic) {
              // Create the comic with the first chapter
              currentComic = createComic({
                title: meta.title,
                slug,
                cover: coverProxied,
                backdrop: coverProxied,
                description: meta.description,
                type: meta.type as "Manhwa" | "Manga" | "Manhua",
                genres: meta.genres.length > 0 ? meta.genres : ["Action", "Fantasy"],
                status: meta.status,
                rating: 4.8,
                initialChapterTitle: `Chapter ${num}`,
                initialPages: pages,
              });
              // Fix chapter number if it's not chapter 1
              if (num !== 1 && currentComic) {
                const ch = currentComic.chapters[0];
                if (ch) {
                  ch.chapterNumber = num;
                  ch.id = `ch-${num}`;
                  ch.title = `Chapter ${num}`;
                }
              }
            } else {
              currentComic = addChapterToComic(slug, `Chapter ${num}`, num, pages);
            }

            importedChapters.push({ num, pages: pages.length });
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`Chapter ${num}: ${msg}`);
          }
        })
      );

      // Small delay between batches to be polite to the source server
      if (i + batchSize < chaptersToProcess.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    // ── Step 4: Build response ───────────────────────────────────────────────
    const totalChapters = importedChapters.length;
    const totalPages = importedChapters.reduce((s, c) => s + c.pages, 0);

    if (totalChapters === 0) {
      return NextResponse.json({
        success: false,
        message: `Gagal mengimport chapter. ${errors.length > 0 ? errors[0] : "Tidak ada gambar yang berhasil di-scrape."}`,
        errors,
      });
    }

    return NextResponse.json({
      success: true,
      action: existing ? "chapters_added" : "comic_created",
      message: `✅ Berhasil import "${meta.title}"! ${totalChapters} chapter (${totalPages} halaman total) sudah masuk ke database dan siap dilihat user!${errors.length > 0 ? ` (${errors.length} chapter gagal)` : ""}`,
      data: {
        title: meta.title,
        slug,
        totalChapters,
        totalPages,
        importedChapters,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[import-manhwa] Fatal error:", msg);
    return NextResponse.json(
      { success: false, message: `Terjadi error: ${msg}` },
      { status: 500 }
    );
  }
}
