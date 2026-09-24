import { NextResponse } from "next/server";
import { createComic, addChapterToComic, getComicsStore } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { url, pages } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, message: "URL wajib diisi." }, { status: 400 });
    }

    // Validate pages array — must have at least 1 valid image URL
    const validPages: string[] = Array.isArray(pages)
      ? pages.filter((p: string) => typeof p === "string" && (p.startsWith("http://") || p.startsWith("https://")))
      : [];

    if (validPages.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Masukkan minimal 1 URL gambar halaman komik agar episode bisa ditampilkan ke user."
      }, { status: 400 });
    }

    const cleanUrl = url.trim().replace(/\/$/, "");
    const segments = cleanUrl.split("/");
    const rawSlug = segments[segments.length - 1] || segments[segments.length - 2] || "imported-comic";
    
    const chapterMatch = rawSlug.match(/(?:chapter|ch)[-_]?(\d+)/i) || cleanUrl.match(/(?:chapter|ch)[-_]?(\d+)/i);
    const chapterNum = chapterMatch ? parseInt(chapterMatch[1], 10) : null;

    let baseSlug = rawSlug.replace(/(?:chapter|ch)[-_]?\d+/i, "").replace(/(^-|-$)+/g, "");
    if (!baseSlug) {
      // Try to extract from a parent path segment
      const pathSegments = cleanUrl.replace(/https?:\/\/[^/]+/, "").split("/").filter(Boolean);
      baseSlug = pathSegments.find(s => !s.match(/^(chapter|ch)[-_]?\d+$/i) && s !== "manhua" && s !== "manga" && s !== "manhwa") || "imported-manhwa";
    }

    const extractedTitle = baseSlug
      .split("-")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const existing = getComicsStore().find(c => c.slug === baseSlug || c.title.toLowerCase() === extractedTitle.toLowerCase());

    if (existing) {
      const targetChNum = chapterNum || (existing.chapters[0]?.chapterNumber || 0) + 1;
      const updated = addChapterToComic(
        existing.slug,
        `Chapter ${targetChNum}`,
        targetChNum,
        validPages
      );
      return NextResponse.json({
        success: true,
        action: "chapter_added",
        message: `Berhasil meng-import Chapter ${targetChNum} untuk "${existing.title}" dengan ${validPages.length} halaman!`,
        data: updated
      });
    } else {
      const newComic = createComic({
        title: extractedTitle,
        slug: baseSlug,
        cover: validPages[0], // Use first page as cover
        backdrop: validPages[0],
        description: `Baca komik ${extractedTitle} Bahasa Indonesia terbaru. Di-import dari ${new URL(url).hostname}.`,
        type: url.toLowerCase().includes("manhua") ? "Manhua" : url.toLowerCase().includes("manga") ? "Manga" : "Manhwa",
        genres: ["Action", "Fantasy", "Supernatural"],
        status: "ongoing",
        rating: 4.9,
        initialChapterTitle: `Chapter ${chapterNum || 1}`,
        initialPages: validPages
      });

      return NextResponse.json({
        success: true,
        action: "comic_created",
        message: `Berhasil meng-import Komik Baru "${newComic.title}" dengan ${validPages.length} halaman!`,
        data: newComic
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal meng-import dari URL." }, { status: 500 });
  }
}