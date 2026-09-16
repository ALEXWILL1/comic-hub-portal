import { NextResponse } from "next/server";
import { getComicsStore } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const comic = getComicsStore().find(c => c.slug === params.slug);
  
  if (!comic) {
    return NextResponse.json({ success: false, message: "Comic not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: comic });
}
