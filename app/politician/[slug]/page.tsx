import Link from "next/link";
import { notFound } from "next/navigation";
import { getPolitician, POLITICIANS } from "@/lib/politicians";
import { getAggregation } from "@/lib/data";
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const politician = getPolitician(slug);
  if (!politician) notFound();

  const agg = await getAggregation();
  const party = agg.parties.find((p) => p.nif === politician.partyNif);

  return (
    <main className="mx-auto max-w-3xl px-5 pb-8">
      <Link href="/caras" className="label-mono inline-block py-4 hover:text-[var(--gold)]">
        ← Caras
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
          href={`/party/${party.nif}`}
          className="panel mt-8 flex items-center justify-between gap-4 p-5 transition-colors hover:border-[var(--line-strong)]"
        >
          <div>
            <p className="label-mono mb-1">Financiación pública de su partido</p>
            <p className="text-lg" style={{ color: party.color }}>
              {party.displayName}
            </p>
          </div>
          <div className="text-right">
            <p className="mono text-xl text-[var(--gold-bright)]">{euroCompact(party.total)}</p>
            <p className="label-mono mt-1 text-[var(--paper-faint)]">ver desglose →</p>
          </div>
        </Link>
      )}
      <p className="label-mono mt-3 text-[var(--paper-faint)]">
        Las subvenciones públicas se conceden al partido, no a la persona.
      </p>

      {/* Bluesky */}
      {politician.bluesky && (
        <section className="mt-14">
          <div className="flex items-end justify-between">
            <h2 className="display section-tick text-xl">En Bluesky</h2>
            <a
              href={`https://bsky.app/profile/${politician.bluesky}`}
              target="_blank"
              rel="noopener noreferrer"
              className="label-mono hover:text-[var(--gold)]"
            >
              @{politician.bluesky} ↗
            </a>
          </div>
          <BlueskyFeed actor={politician.bluesky} />
        </section>
      )}

      {/* News */}
      <section className="mt-14">
        <h2 className="display section-tick text-xl">En las noticias</h2>
        <p className="label-mono mt-3 text-[var(--paper-faint)]">Titulares recientes · Google News</p>
        <NewsFeed query={politician.name} />
      </section>
    </main>
  );
}
