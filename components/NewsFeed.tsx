"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { NewsItem } from "@/lib/news";
import type { NewsTopic } from "@/lib/news-sources.mjs";
import { DICTS, relativeTime, type Locale } from "@/lib/i18n";
import { useEntrance } from "@/lib/motion";

/**
 * Either a free-text `query` (Google News search, used for one party or one
 * politician) or a list of `topics` read from the curated feed registry.
 */
export default function NewsFeed({
  query,
  topics,
  locale,
}: {
  query?: string;
  topics?: NewsTopic[];
  locale: Locale;
}) {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const f = DICTS[locale].feed;
  const { rise, reduce } = useEntrance();

  const key = topics
    ? `topic=${topics.join(",")}&lang=${locale === "en" ? "en" : "es"}`
    : query
      ? `q=${encodeURIComponent(query)}`
      : "";

  useEffect(() => {
    if (!key) return;
    let alive = true;
    fetch(`/api/news?${key}`)
      .then((r) => r.json())
      .then((d: { items: NewsItem[] }) => {
        if (alive) setItems(d.items ?? []);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [key]);

  if (failed) return null;

  return (
    <div className="mt-8 flex flex-col">
      {items === null &&
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="py-4">
            <div
              className={`h-3 w-2/3 rounded bg-[var(--ink-3)] ${reduce ? "" : "animate-pulse"}`}
            />
            <hr className="hairline mt-4" />
          </div>
        ))}

      {items?.length === 0 && (
        <p className="label-mono py-6 text-[var(--paper-faint)]">{f.noRecent}</p>
      )}

      {items?.map((n, i) => (
        <motion.a
          key={n.link + i}
          href={n.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group block py-4"
          {...rise({ y: 6 }, { duration: 0.4, index: i })}
        >
          <p className="text-[var(--paper)] transition-colors group-hover:text-[var(--gold-bright)]">
            {n.title}
          </p>
          <p className="label-mono mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[var(--paper-faint)]">
            <span className="text-[var(--gold)]">{n.source}</span>
            <span>{relativeTime(n.date, locale)}</span>
            {/* An association's own statement is a different kind of item from a
                newspaper's report on it, so the distinction is shown. */}
            {n.sourceKind === "org" && <span>{f.fromOrg}</span>}
          </p>
          <hr className="hairline mt-4" />
        </motion.a>
      ))}
    </div>
  );
}
