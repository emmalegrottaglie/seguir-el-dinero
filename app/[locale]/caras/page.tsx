import Link from "next/link";
import { POLITICIANS } from "@/lib/politicians";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";

export const revalidate = 3600;

export default async function CarasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const agg = await getAggregation();
  const { t } = getDict(locale);
  const colorOf = (nif: string) =>
    agg.parties.find((p) => p.nif === nif)?.color ?? "var(--paper-faint)";
  const partyOf = (nif: string) =>
    agg.parties.find((p) => p.nif === nif)?.shortName ?? "";

  return (
    <main className="mx-auto max-w-4xl px-5 pb-8">
      <h1 className="display mt-6 text-4xl sm:text-5xl">{t.caras.title}</h1>
      <p className="mt-5 max-w-xl text-[var(--paper-dim)]">{t.caras.intro}</p>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {POLITICIANS.map((p) => (
          <Link
            key={p.slug}
            href={`/${locale}/politician/${p.slug}`}
            className="panel group flex items-center gap-4 p-5 transition-colors hover:border-[var(--line-strong)]"
          >
            <span
              className="inline-block h-10 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: colorOf(p.partyNif) }}
            />
            <div className="min-w-0">
              <p className="text-lg group-hover:text-[var(--gold-bright)]">{p.name}</p>
              <p className="label-mono mt-1 truncate text-[var(--paper-dim)]">
                {partyOf(p.partyNif)} · {p.role}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <p className="label-mono mt-10 text-[var(--paper-faint)]">{t.caras.note}</p>
    </main>
  );
}
