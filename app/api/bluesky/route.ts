import { NextResponse } from "next/server";
import { fetchAuthorFeed } from "@/lib/bluesky";

export const revalidate = 900;

export async function GET(request: Request) {
  const actor = new URL(request.url).searchParams.get("actor");
  if (!actor) return NextResponse.json({ posts: [] });
  try {
    const posts = await fetchAuthorFeed(actor, 6);
    return NextResponse.json(
      { posts },
      { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } },
    );
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
