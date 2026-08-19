import { NextResponse } from "next/server";
import { fetchNews } from "@/lib/news";

export const revalidate = 1800;

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q");
  if (!q) return NextResponse.json({ items: [] });
  try {
    const items = await fetchNews(q, 8);
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json({ items: [] });
  }
}
