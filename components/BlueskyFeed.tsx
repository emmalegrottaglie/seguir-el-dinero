"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { BlueskyPost } from "@/lib/bluesky";
import { DICTS, relativeTime, type Locale } from "@/lib/i18n";
import { useEntrance } from "@/lib/motion";

export default function BlueskyFeed({ actor, locale }: { actor: string; locale: Locale }) {
  const [posts, setPosts] = useState<BlueskyPost[] | null>(null);
  const f = DICTS[locale].feed;
  const { rise, reduce } = useEntrance();

  useEffect(() => {
    let alive = true;
    fetch(`/api/bluesky?actor=${encodeURIComponent(actor)}`)
      .then((r) => r.json())
      .then((d: { posts: BlueskyPost[] }) => alive && setPosts(d.posts ?? []))
      .catch(() => alive && setPosts([]));
    return () => {
      alive = false;
    };
  }, [actor]);

  return (
    <div className="mt-8 flex flex-col gap-4">
      {posts === null &&
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="panel p-4">
            <div
              className={`h-3 w-full rounded bg-[var(--ink-3)] ${reduce ? "" : "animate-pulse"}`}
            />
            <div
              className={`mt-2 h-3 w-3/5 rounded bg-[var(--ink-3)] ${reduce ? "" : "animate-pulse"}`}
            />
          </div>
        ))}

      {posts?.length === 0 && (
        <p className="label-mono py-4 text-[var(--paper-faint)]">{f.cannotLoad}</p>
      )}

      {posts?.map((p, i) => (
        <motion.a
          key={p.url + i}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="panel group block p-4 transition-colors hover:border-[var(--line-strong)]"
          {...rise({ y: 6 }, { duration: 0.4, index: i })}
        >
          {p.isRepost && <p className="label-mono mb-1 text-[var(--paper-faint)]">{f.reposted}</p>}
          <p className="whitespace-pre-wrap text-[var(--paper)]">{p.text}</p>
          <p className="label-mono mt-3 flex gap-4 text-[var(--paper-faint)]">
            <span className="text-[var(--gold)]">{relativeTime(p.createdAt, locale)}</span>
            <span>♡ {p.likes.toLocaleString("es-ES")}</span>
            <span>↻ {p.reposts.toLocaleString("es-ES")}</span>
          </p>
        </motion.a>
      ))}
    </div>
  );
}
