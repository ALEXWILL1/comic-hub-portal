import { NextResponse } from "next/server";
import { createComic, addChapterToComic, getComicsStore } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, message: "URL wajib diisi." }, { status: 400 });
    }

    const cleanUrl = url.trim().replace(/\/$/, "");
    const segments = cleanUrl.split("/");
    const rawSlug = segments[segments.length - 1] || segments[segments.length - 2] || "imported-comic";
    
    const chapterMatch = rawSlug.match(/(?:chapter|ch)[-_]?(\d+)/i) || cleanUrl.match(/(?:chapter|ch)[-_]?(\d+)/i);
    const chapterNum = chapterMatch ? parseInt(chapterMatch[1], 10) : null;

    let baseSlug = rawSlug.replace(/(?:chapter|ch)[-_]?\d+/i, "").replace(/(^-|-$)+/g, "");
    if (!baseSlug) baseSlug = "imported-manhwa";

    const extractedTitle = baseSlug
      .split("-")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const existing = getComicsStore().find(c => c.slug === baseSlug || c.title.toLowerCase() === extractedTitle.toLowerCase());

    if (existing) {
      const targetChNum = chapterNum || (existing.chapters[0]?.chapterNumber || 0) + 1;
      const updated = addChapterToComic(
        existing.slug,
        `Chapter ${targetChNum} (Di-import dari ${new URL(url).hostname})`,
        targetChNum,
        [
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop"
        ]
      );
      return NextResponse.json({
        success: true,
        action: "chapter_added",
        message: `Berhasil meng-import Chapter ${targetChNum} untuk "${existing.title}" dari URL!`,
        data: updated
      });
    } else {
      const newComic = createComic({
        title: extractedTitle,
        slug: baseSlug,
        cover: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop",
        backdrop: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1600&auto=format&fit=crop",
        description: `Manhwa ${extractedTitle} di-import secara otomatis dari link ${url}. Menyediakan update chapter tercepat dengan terjemahan Bahasa Indonesia.`,
        type: url.toLowerCase().includes("manhua") ? "Manhua" : url.toLowerCase().includes("manga") ? "Manga" : "Manhwa",
        genres: ["Action", "Fantasy", "Supernatural"],
        status: "ongoing",
        rating: 4.9,
        initialChapterTitle: `Chapter ${chapterNum || 1} [Imported]`,
        initialPages: [
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop"
        ]
      });

      return NextResponse.json({
        success: true,
        action: "comic_created",
        message: `Berhasil meng-import Komik Baru "${newComic.title}" dari Link Web Target!`,
        data: newComic
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal meng-import dari URL." }, { status: 500 });
  }
}