import { NextResponse } from "next/server";
import { getComicsStore } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const genre = searchParams.get("genre");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort"); // 'latest' | 'trending' | 'rating'

  let list = [...getComicsStore()];

  if (type && type !== "all") {
    list = list.filter(c => c.type.toLowerCase() === type.toLowerCase());
  }

  if (genre && genre !== "all") {
    list = list.filter(c => c.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }

  if (sort === "latest") {
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } else if (sort === "trending") {
    list.sort((a, b) => (a.rank || 99) - (b.rank || 99));
  } else if (sort === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  }

  return NextResponse.json({
    success: true,
    total: list.length,
    data: list
  });
}
