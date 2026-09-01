export type FeedFormat = "rss" | "atom";

/** Topics the portal groups news under. Kept small on purpose. */
export type NewsTopic = "lgtbi" | "vivienda" | "pobreza";

export interface NewsSource {
  id: string;
  /** Displayed next to every item from this source. */
  name: string;
  url: string;
  format: FeedFormat;
  topics: NewsTopic[];
  lang: "es" | "en";
  /** `org` = the organisation's own publication. `media` = a news outlet. */
  kind: "org" | "media";
  /** Newest item at the 2026-09-01 probe, as an ISO date. Provenance, not logic. */
  probedNewest: string;
}

export interface ExcludedFeed {
  name: string;
  url: string;
  reason: string;
}

export const SOURCE_STALE_DAYS: number;
export const ITEM_MAX_AGE_DAYS: number;
export const FEED_HEADERS: Record<string, string>;
export const NEWS_SOURCES: NewsSource[];
export const EXCLUDED_FEEDS: ExcludedFeed[];
export function sourcesForTopics(topics: NewsTopic[]): NewsSource[];
