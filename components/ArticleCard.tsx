import type { NewsItem } from "@/lib/news";

/**
 * One linked article, with its lead image where the feed publishes one.
 *
 * The image is routed through /api/news-image rather than the publisher's host,
 * so reading an LGBTQ+ organisation's article does not hand that organisation's
 * server the reader's IP address. It is a plain <img> and not next/image on
 * purpose: the optimiser wants a fixed list of remote hosts, and these are
 * fifteen publishers whose CDNs change under us — a broken image on every card
 * would cost more than the optimisation saves.
 *
 * A card without an image is not a lesser card. It drops the media block
 * entirely rather than showing a grey rectangle, so a text-only feed reads as
 * deliberate.
 */
export default function ArticleCard({
  item,
  ago,
  orgLabel,
  mediaLabel,
}: {
  item: NewsItem;
  /** Pre-formatted relative time, so this stays a server component. */
  ago: string;
  orgLabel: string;
  mediaLabel: string;
}) {
  const isOrg = item.sourceKind === "org";
  return (
    <article className="card">
      {item.image && (
        <div className="card-media">
          {/* Empty alt: the headline immediately below is the accessible name,
              and a decorative duplicate would make a screen reader announce the
              same article twice. */}
          <img
            src={`/api/news-image?url=${encodeURIComponent(item.image)}`}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <p className="label-mono mb-3 flex flex-wrap items-center gap-x-2">
          <span style={{ color: isOrg ? "var(--verd)" : "var(--gold)" }}>{item.source}</span>
          <span className="text-[var(--paper-faint)]">·</span>
          <span className="text-[var(--paper-faint)]">{isOrg ? orgLabel : mediaLabel}</span>
          {item.lang === "en" && <span className="text-[var(--paper-faint)]">· EN</span>}
        </p>

        <h3 className="display text-lg leading-snug">
          <a
            className="hover:text-[var(--gold-bright)] focus-visible:text-[var(--gold-bright)]"
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.title}
          </a>
        </h3>

        <p className="label-mono mt-auto pt-4 text-[var(--paper-faint)]">{ago}</p>
      </div>
    </article>
  );
}
