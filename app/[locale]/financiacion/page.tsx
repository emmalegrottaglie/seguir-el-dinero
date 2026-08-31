import Link from "next/link";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { euro, euroCompact, integer, percent } from "@/lib/format";
import {
  getFoundations,
  foundationYears,
  foundationTotals,
  rankedEntities,
  FOUNDATIONS_LAW_URL,
} from "@/lib/foundations";
import Dashboard from "@/components/Dashboard";

export const revalidate = 3600;

export default async function FinanciacionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const [agg, fnd] = await Promise.all([getAggregation(), getFoundations()]);
  const { locale, bcp47, t } = getDict(localeParam);
  const F = t.foundations;

  const years = foundationYears(fnd);
  const totals = foundationTotals(fnd);
  const ranked = rankedEntities(fnd);
  const top = ranked[0];
  const topShare = totals.donations > 0 ? top.donations / totals.donations : 0;
  const maxBar = Math.max(...years.map((y) => fnd.years[String(y)].donations), 1);

  return (
    <main>
      <Dashboard base={agg} home={t.home} kinds={t.kinds} locale={locale} />

      {/* Party-linked foundations: a channel separate from the parties themselves */}
      <section className="mx-auto mt-20 max-w-6xl px-5">
        <h2 className="display section-tick text-2xl">{F.title}</h2>
        <p className="mt-6 max-w-2xl text-[var(--paper-dim)]">{F.intro}</p>

        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-6">
          <div>
            <p className="label-mono mb-2">{F.privateDonations}</p>
            <p className="mono text-2xl text-[var(--gold-bright)]">
              {euro(totals.donations, bcp47)}
            </p>
            <p className="label-mono mt-1 text-[var(--paper-faint)]">
              {years[0]}–{years.at(-1)}
            </p>
          </div>
          <div>
            <p className="label-mono mb-2">{F.publicSubsidies}</p>
            <p className="mono text-2xl text-[var(--paper)]">{euro(totals.subsidies, bcp47)}</p>
            <p className="label-mono mt-1 text-[var(--paper-faint)]">
              {years[0]}–{years.at(-1)}
            </p>
          </div>
          <div>
            <p className="label-mono mb-2">{F.concentration}</p>
            <p className="mono text-2xl text-[var(--red)]">{percent(topShare, bcp47)}</p>
            <p className="label-mono mt-1 max-w-xs text-[var(--paper-faint)]">
              {F.concentrationNote}
            </p>
          </div>
        </div>

        {/* Per-year split */}
        <div className="mt-10 flex flex-col gap-5">
          {years.map((y) => {
            const row = fnd.years[String(y)];
            return (
              <div key={y}>
                <div className="label-mono mb-2 flex flex-wrap items-baseline gap-x-4">
                  <span className="mono text-[var(--paper)]">{y}</span>
                  <span style={{ color: "var(--gold)" }}>
                    {F.privateDonations} {euroCompact(row.donations, bcp47)}
                  </span>
                  <span className="text-[var(--paper-dim)]">
                    {F.publicSubsidies} {euroCompact(row.subsidies, bcp47)}
                  </span>
                  <span className="text-[var(--paper-faint)]">
                    {integer(row.entities, bcp47)} {F.entities}
                  </span>
                </div>
                <div className="flex h-5 overflow-hidden rounded-sm bg-[var(--ink-3)]">
                  <div
                    style={{
                      width: `${(row.donations / maxBar) * 100}%`,
                      backgroundColor: "var(--gold)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Per-foundation table */}
        <h3 className="display section-tick mt-14 text-xl">{F.tableTitle}</h3>
        <p className="label-mono mt-4 max-w-2xl text-[var(--paper-faint)]">{F.tableNote}</p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <thead>
              <tr className="label-mono text-left text-[var(--paper-faint)]">
                <th className="py-2 pr-4 font-normal">{F.entity}</th>
                <th className="py-2 pr-4 font-normal">{F.party}</th>
                <th className="py-2 pr-4 text-right font-normal">{F.donations}</th>
                <th className="py-2 text-right font-normal">{F.subsidies}</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((e) => (
                <tr key={e.name} className="border-t border-[var(--line)]">
                  <td className="py-2.5 pr-4 text-[var(--paper)]">{e.name}</td>
                  <td className="label-mono py-2.5 pr-4">
                    {e.party ? (
                      e.nif ? (
                        <Link href={`/${locale}/party/${e.nif}`} className="text-[var(--gold)] hover:underline">
                          {e.party}
                        </Link>
                      ) : (
                        <span className="text-[var(--paper-dim)]">{e.party}</span>
                      )
                    ) : (
                      <span className="text-[var(--paper-faint)]">{F.noPartyStated}</span>
                    )}
                  </td>
                  <td className="mono py-2.5 pr-4 text-right text-[var(--gold-bright)]">
                    {e.donations > 0 ? euroCompact(e.donations, bcp47) : "—"}
                  </td>
                  <td className="mono py-2.5 text-right text-[var(--paper-dim)]">
                    {e.subsidies > 0 ? euroCompact(e.subsidies, bcp47) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* The legal mechanism, stated precisely */}
        <div className="panel mt-12 p-6">
          <p className="label-mono mb-3 text-[var(--gold)]">{F.legalTitle}</p>
          <p className="leading-relaxed text-[var(--paper-dim)]">{F.legalBody}</p>
          <p className="label-mono mt-4">
            <a className="src" href={FOUNDATIONS_LAW_URL} target="_blank" rel="noopener noreferrer">
              {F.lawLink}
            </a>
          </p>
        </div>

        {/* What the layer still does not cover */}
        <div className="mt-8">
          <p className="label-mono mb-2 text-[var(--paper-dim)]">{F.gapTitle}</p>
          <p className="label-mono max-w-2xl leading-relaxed text-[var(--paper-faint)]">
            {F.gapBody}
          </p>
        </div>

        <p className="label-mono mt-8">
          <a className="src" href={fnd.source.url} target="_blank" rel="noopener noreferrer">
            {fnd.source.body} · {fnd.source.report} ↗
          </a>
        </p>
      </section>
    </main>
  );
}
