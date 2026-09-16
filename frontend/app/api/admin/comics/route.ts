import { NextResponse } from "next/server";
import { getComicsStore, createComic, deleteComic } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ success: true, data: getComicsStore() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, cover, backdrop, description, type, genres, status, slug, initialChapterTitle, initialPages } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: "Judul komik wajib diisi." }, { status: 400 });
    }

    const created = createComic({
      title,
      cover,
      backdrop,
      description,
      type: type || "Manhwa",
      genres: Array.isArray(genres) ? genres : ["Action", "Fantasy"],
      status: status || "ongoing",
      rating: 4.8,
      slug,
      initialChapterTitle,
      initialPages
    });

    return NextResponse.json({
      success: true,
      message: `Komik "${created.title}" berhasil ditambahkan oleh Admin!`,
      data: created
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal membuat komik." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ success: false, message: "slug is required" }, { status: 400 });
    }

    const success = deleteComic(slug);
    if (!success) {
      return NextResponse.json({ success: false, message: "Komik tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Komik berhasil dihapus." });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error deleting comic" }, { status: 500 });
  }
}