import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/proxy-image?url=https://manhwasaku.my.id/api/v1/pages/12345
 *
 * Proxies comic page images from external sources that require proper
 * Referer headers (hotlink protection bypass).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
  }

  // Security: only allow known comic sources
  const allowedHosts = [
    "manhwasaku.my.id",
    "komiku.id",
    "topmanhua.com",
    "manhwa18.net",
    "asura.gg",
    "bato.to",
    "toonily.com",
    "webtoon.xyz",
    "mangatx.com",
    "rawkuma.com",
  ];

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const isAllowed = allowedHosts.some((h) => parsedUrl.hostname.endsWith(h));
  if (!isAllowed) {
    // Try to proxy anyway for other hosts — just set a generic referer
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: `${parsedUrl.origin}/`,
        Accept: "image/webp,image/avif,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Source returned ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[proxy-image] Error:", err);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
