"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { NewsItem } from "@/lib/news";

function relative(iso: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.round(diff / 3.6e6);
  if (h < 1) return "hace un momento";
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}

export default function NewsFeed({ query }: { query: string }) {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/news?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d: { items: NewsItem[] }) => {
        if (alive) setItems(d.items ?? []);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [query]);

  if (failed) return null;

  return (
    <div className="mt-8 flex flex-col">
      {items === null &&
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="py-4">
            <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--ink-3)]" />
            <hr className="hairline mt-4" />
          </div>
        ))}

      {items?.length === 0 && (
        <p className="label-mono py-6 text-[var(--paper-faint)]">Sin resultados recientes.</p>
      )}

      {items?.map((n, i) => (
        <motion.a
          key={n.link + i}
          href={n.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group block py-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
        >
          <p className="text-[var(--paper)] transition-colors group-hover:text-[var(--gold-bright)]">
            {n.title}
          </p>
          <p className="label-mono mt-1.5 flex gap-3 text-[var(--paper-faint)]">
            <span className="text-[var(--gold)]">{n.source}</span>
            <span>{relative(n.date)}</span>
          </p>
          <hr className="hairline mt-4" />
        </motion.a>
      ))}
    </div>
  );
}
