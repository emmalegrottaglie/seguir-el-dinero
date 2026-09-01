import {
  FEED_HEADERS,
  ITEM_MAX_AGE_DAYS,
  NEWS_SOURCES,
  SOURCE_STALE_DAYS,
  sourcesForTopics,
  type NewsSource,
  type NewsTopic,
} from "./news-sources.mjs";

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  date: string; // ISO
  /** Registry id of the source. Stable, unlike the display name. */
  sourceId?: string;
  /** `org` when the item comes from an organisation's own publication. */
  sourceKind?: "org" | "media";
  lang?: "es" | "en";
}

const FETCH_TIMEOUT_MS = 12_000;

/**
 * At most this many items per source in a merged panel. Without it the panel is
 * a ranking of who publishes most often: a daily outlet posting four times a day
 * buries every organisation that posts weekly, even though the organisations are
 * the reason this registry exists.
 */
const PER_SOURCE_CAP = 2;

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

/** Read an attribute off the first occurrence of a tag — Atom links are self-closing. */
function attr(block: string, tag: string, name: string): string {
  const m = block.match(new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`, "s"));
  return m ? decode(m[1]) : "";
}

function isoDate(raw: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/**
 * Drop tracking parameters. El Salto appends `?utm_source=feed`, which would
 * otherwise defeat de-duplication when the same article arrives from two feeds.
 */
function cleanLink(raw: string): string {
  if (!raw) return "";
  try {
    const u = new URL(raw);
    for (const key of [...u.searchParams.keys()]) {
      if (key.startsWith("utm_")) u.searchParams.delete(key);
    }
    return u.toString();
  } catch {
    return raw;
  }
}

// RSS 2.0: <channel><item><title><link><pubDate>
function parseRss(xml: string): { title: string; link: string; date: string; source: string }[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? [];
  return blocks.map((raw) => {
    const rawTitle = pick(raw, "title");
    const source = pick(raw, "source");
    // Google News appends " - Source" to titles; drop it when it duplicates <source>.
    const title =
      source && rawTitle.endsWith(` - ${source}`)
        ? rawTitle.slice(0, -(source.length + 3))
        : rawTitle;
    return {
      title,
      link: cleanLink(pick(raw, "link")),
      date: isoDate(pick(raw, "pubDate") || pick(raw, "dc:date")),
      source,
    };
  });
}

// Atom: <feed><entry><title><link href/><updated>. El Salto publishes this, and
// the previous RSS-only parser returned an empty array for it without erroring.
function parseAtom(xml: string): { title: string; link: string; date: string; source: string }[] {
  const blocks = xml.match(/<entry[\s>][\s\S]*?<\/entry>/g) ?? [];
  return blocks.map((raw) => ({
    title: pick(raw, "title"),
    link: cleanLink(attr(raw, "link", "href") || pick(raw, "id")),
    date: isoDate(pick(raw, "updated") || pick(raw, "published")),
    source: "",
  }));
}

function parseFeed(xml: string, format: NewsSource["format"]) {
  return format === "atom" ? parseAtom(xml) : parseRss(xml);
}

async function getFeed(url: string, revalidate: number): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: FEED_HEADERS,
      signal: controller.signal,
      next: { revalidate },
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function ageDays(iso: string, now: number): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Infinity : (now - t) / 86_400_000;
}

export interface DroppedSource {
  id: string;
  name: string;
  reason: "unreachable" | "unparseable" | "stale" | "undated";
  newest?: string;
}

export interface TopicNews {
  items: NewsItem[];
  /**
   * Sources that contributed nothing and why. Surfaced so a feed going dark is
   * observable rather than silently shrinking the panel.
   */
  dropped: DroppedSource[];
}

/**
 * Read one source, applying the source-level staleness guard. A source whose
 * newest item predates SOURCE_STALE_DAYS is dropped whole: it is publishing
 * nothing, and its old items would misrepresent themselves as news.
 */
async function readSource(
  source: NewsSource,
  now: number,
): Promise<{ items: NewsItem[]; dropped?: DroppedSource }> {
  const xml = await getFeed(source.url, 1800);
  if (!xml) {
    return { items: [], dropped: { id: source.id, name: source.name, reason: "unreachable" } };
  }

  const parsed = parseFeed(xml, source.format).filter((p) => p.title && p.link);
  if (parsed.length === 0) {
    return { items: [], dropped: { id: source.id, name: source.name, reason: "unparseable" } };
  }

  const dated = parsed.filter((p) => p.date);
  if (dated.length === 0) {
    return { items: [], dropped: { id: source.id, name: source.name, reason: "undated" } };
  }

  const newest = dated.reduce((a, b) => (a.date > b.date ? a : b)).date;
  if (ageDays(newest, now) > SOURCE_STALE_DAYS) {
    return {
      items: [],
      dropped: { id: source.id, name: source.name, reason: "stale", newest },
    };
  }

  const items = dated
    .filter((p) => ageDays(p.date, now) <= ITEM_MAX_AGE_DAYS)
    .map((p) => ({
      title: p.title,
      link: p.link,
      source: source.name,
      date: p.date,
      sourceId: source.id,
      sourceKind: source.kind,
      lang: source.lang,
    }));

  return { items };
}

/**
 * Merge the registry's feeds for the given topics. Sources are read in parallel
 * and independently: one failing feed removes itself from the result and is
 * reported, it does not empty the panel.
 */
export async function fetchTopicNews(
  topics: NewsTopic[],
  limit = 8,
  /**
   * Language the reader is on. Items in that language sort ahead of the rest, so
   * a Spanish page is not led by two English items merely because the European
   * organisations publish more often than the Spanish ones.
   */
  preferLang: "es" | "en" = "es",
  now = Date.now(),
): Promise<TopicNews> {
  const sources = sourcesForTopics(topics);
  const results = await Promise.all(sources.map((s) => readSource(s, now)));

  const dropped = results.flatMap((r) => (r.dropped ? [r.dropped] : []));
  const seen = new Set<string>();
  const perSource = new Map<string, number>();
  const items: NewsItem[] = [];
  const overflow: NewsItem[] = [];

  const rank = (i: NewsItem) => (i.lang === preferLang ? 0 : 1);

  for (const item of results
    .flatMap((r) => r.items)
    .sort((a, b) => rank(a) - rank(b) || b.date.localeCompare(a.date))) {
    if (seen.has(item.link)) continue;
    seen.add(item.link);

    // Keyed on the registry id, not the display name: two entries could share a
    // name and would then share one cap counter.
    const key = item.sourceId ?? item.source;
    const used = perSource.get(key) ?? 0;
    if (used >= PER_SOURCE_CAP) {
      overflow.push(item);
      continue;
    }
    perSource.set(key, used + 1);
    items.push(item);
  }

  // Only if the capped set cannot fill the panel do the most prolific sources
  // get their extra items back; the panel is then re-sorted so it still reads
  // newest first.
  const merged = items
    .concat(overflow)
    .slice(0, limit)
    .sort((a, b) => rank(a) - rank(b) || b.date.localeCompare(a.date));

  return { items: merged, dropped };
}

/** Fetch recent Spanish-language news for a free-text query via Google News RSS. */
export async function fetchNews(query: string, limit = 8): Promise<NewsItem[]> {
  const url =
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(query) +
    "&hl=es&gl=ES&ceid=ES:es";

  const xml = await getFeed(url, 1800);
  if (!xml) return [];

  return parseRss(xml)
    .filter((p) => p.title && p.link)
    .slice(0, limit)
    .map((p) => ({
      title: p.title,
      link: p.link,
      source: p.source || "Google News",
      date: p.date,
      sourceKind: "media" as const,
    }));
}

/** Every source in the registry, and the guard thresholds, for the methodology page. */
export { NEWS_SOURCES, SOURCE_STALE_DAYS, ITEM_MAX_AGE_DAYS };
export type { NewsSource, NewsTopic };
