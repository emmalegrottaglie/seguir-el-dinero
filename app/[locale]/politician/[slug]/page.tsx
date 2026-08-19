import Link from "next/link";
import { notFound } from "next/navigation";
import { getPolitician, POLITICIANS } from "@/lib/politicians";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { euroCompact } from "@/lib/format";
import NewsFeed from "@/components/NewsFeed";
import BlueskyFeed from "@/components/BlueskyFeed";

export const revalidate = 3600;

export function generateStaticParams() {
  return POLITICIANS.map((p) => ({ slug: p.slug }));
}

export default async function PoliticianPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const politician = getPolitician(slug);
  if (!politician) notFound();

  const agg = await getAggregation();
  const party = agg.parties.find((p) => p.nif === politician.partyNif);
  const { locale, bcp47, t } = getDict(localeParam);

  return (
    <main className="mx-auto max-w-3xl px-5 pb-8">
      <Link href={`/${locale}/caras`} className="label-mono inline-block py-4 hover:text-[var(--gold)]">
        {t.common.backToFaces}
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-start gap-4">
        <span
          className="mt-2 inline-block h-8 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: party?.color ?? "var(--paper-faint)" }}
        />
        <div>
          <p className="eyebrow">{politician.role}</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{politician.name}</h1>
        </div>
      </div>

      {/* Party funding link (individuals aren't funded directly) */}
      {party && (
        <Link
          href={`/${locale}/party/${party.nif}`}
          className="panel mt-8 flex items-center justify-between gap-4 p-5 transition-colors hover:border-[var(--line-strong)]"
        >
          <div>
            <p className="label-mono mb-1">{t.politician.partyFunding}</p>
            <p className="text-lg" style={{ color: party.color }}>
              {party.displayName}
            </p>
          </div>
          <div className="text-right">
            <p className="mono text-xl text-[var(--gold-bright)]">{euroCompact(party.total, bcp47)}</p>
            <p className="label-mono mt-1 text-[var(--paper-faint)]">{t.politician.seeBreakdown}</p>
          </div>
        </Link>
      )}
      <p className="label-mono mt-3 text-[var(--paper-faint)]">{t.politician.caveat}</p>

      {/* Bluesky */}
      {politician.bluesky && (
        <section className="mt-14">
          <div className="flex items-end justify-between">
            <h2 className="display section-tick text-xl">{t.politician.onBluesky}</h2>
            <a
              href={`https://bsky.app/profile/${politician.bluesky}`}
              target="_blank"
              rel="noopener noreferrer"
              className="label-mono hover:text-[var(--gold)]"
            >
              @{politician.bluesky} ↗
            </a>
          </div>
          <BlueskyFeed actor={politician.bluesky} locale={locale} />
        </section>
      )}

      {/* News */}
      <section className="mt-14">
        <h2 className="display section-tick text-xl">{t.party.inNews}</h2>
        <p className="label-mono mt-3 text-[var(--paper-faint)]">{t.party.recentHeadlines}</p>
        <NewsFeed query={politician.name} locale={locale} />
      </section>
    </main>
  );
}
