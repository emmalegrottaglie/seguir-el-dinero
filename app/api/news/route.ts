import { NextResponse } from "next/server";
import { fetchNews, fetchTopicNews } from "@/lib/news";
import type { NewsTopic } from "@/lib/news-sources.mjs";

export const revalidate = 1800;

const TOPICS: NewsTopic[] = ["lgtbi", "vivienda", "pobreza"];

const CACHE = { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" };

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  // Topic mode reads the curated feed registry; query mode is a free-text
  // Google News search, still used for individual parties and politicians.
  const topicParam = params.get("topic");
  if (topicParam) {
    const topics = topicParam
      .split(",")
      .map((t) => t.trim())
      .filter((t): t is NewsTopic => (TOPICS as string[]).includes(t));
    if (topics.length === 0) return NextResponse.json({ items: [], dropped: [] });
    // Readers get their own language first, then Spanish. The housing registry has
    // Catalan feeds; the other topics have none, so Catalan readers see Spanish first there.
    const lang = params.get("lang");
    const prefer = lang === "en" || lang === "ca" ? lang : "es";
    try {
      const { items, dropped } = await fetchTopicNews(topics, 8, prefer);
      return NextResponse.json({ items, dropped }, { headers: CACHE });
    } catch {
      return NextResponse.json({ items: [], dropped: [] });
    }
  }

  const q = params.get("q");
  if (!q) return NextResponse.json({ items: [] });
  try {
    const items = await fetchNews(q, 8);
    return NextResponse.json({ items }, { headers: CACHE });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
