export interface NewsItem {
  title: string;
  link: string;
  source: string;
  date: string; // ISO
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&[a-z]+;|&#39;/gi, (m) => ENTITIES[m] ?? m)
    .trim();
}

function pick(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "s"));
  return m ? decode(m[1]) : "";
}

// Fetch recent Spanish-language news for a query via Google News RSS (free, no key).
export async function fetchNews(query: string, limit = 8): Promise<NewsItem[]> {
  const url =
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(query) +
    "&hl=es&gl=ES&ceid=ES:es";

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SeguirElDinero/1.0)" },
    next: { revalidate: 1800 }, // 30 min
  });
  if (!res.ok) return [];

  const xml = await res.text();
  const items = xml.match(/<item>(.*?)<\/item>/gs) ?? [];

  return items.slice(0, limit).map((raw) => {
    const rawTitle = pick(raw, "title");
    const source = pick(raw, "source");
    // Google appends " - Source" to titles; drop it when it duplicates <source>.
    const title =
      source && rawTitle.endsWith(` - ${source}`)
        ? rawTitle.slice(0, -(source.length + 3))
        : rawTitle;
    const pub = pick(raw, "pubDate");
    return {
      title,
      link: pick(raw, "link"),
      source: source || "Google News",
      date: pub ? new Date(pub).toISOString() : "",
    };
  });
}
