"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { BlueskyPost } from "@/lib/bluesky";

function relative(iso: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.round(diff / 3.6e6);
  if (h < 1) return "hace un momento";
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
}

export default function BlueskyFeed({ actor }: { actor: string }) {
  const [posts, setPosts] = useState<BlueskyPost[] | null>(null);

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
            <div className="h-3 w-full animate-pulse rounded bg-[var(--ink-3)]" />
            <div className="mt-2 h-3 w-3/5 animate-pulse rounded bg-[var(--ink-3)]" />
          </div>
        ))}

      {posts?.length === 0 && (
        <p className="label-mono py-4 text-[var(--paper-faint)]">
          No se pudieron cargar publicaciones ahora mismo.
        </p>
      )}

      {posts?.map((p, i) => (
        <motion.a
          key={p.url + i}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="panel group block p-4 transition-colors hover:border-[var(--line-strong)]"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4) }}
        >
          {p.isRepost && <p className="label-mono mb-1 text-[var(--paper-faint)]">↻ Republicado</p>}
          <p className="whitespace-pre-wrap text-[var(--paper)]">{p.text}</p>
          <p className="label-mono mt-3 flex gap-4 text-[var(--paper-faint)]">
            <span className="text-[var(--gold)]">{relative(p.createdAt)}</span>
            <span>♡ {p.likes.toLocaleString("es-ES")}</span>
            <span>↻ {p.reposts.toLocaleString("es-ES")}</span>
          </p>
        </motion.a>
      ))}
    </div>
  );
}
