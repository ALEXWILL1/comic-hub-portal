import { NextResponse } from "next/server";
import { addChapterToComic } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { slug, title, customNumber, customPages } = await request.json();
    
    if (!slug) {
      return NextResponse.json({ success: false, message: "slug is required" }, { status: 400 });
    }

    const updated = addChapterToComic(slug, title, customNumber, customPages);

    if (!updated) {
      return NextResponse.json({ success: false, message: "Comic not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Chapter for ${updated.title} added successfully!`,
      data: updated
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}