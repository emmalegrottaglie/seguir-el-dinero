import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { euro, euroCompact, integer } from "@/lib/format";
import {
  FOUNDATION_YEARS,
  FOUNDATIONS_SOURCE,
  foundationTotals,
} from "@/lib/foundations";
import Dashboard from "@/components/Dashboard";

export const revalidate = 3600;

export default async function FinanciacionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const agg = await getAggregation();
  const { locale, bcp47, t } = getDict(localeParam);
  const F = t.foundations;

  const totals = foundationTotals();
  const maxBar = Math.max(
    ...FOUNDATION_YEARS.map((y) => y.privateDonations + y.publicSubsidies),
    1,
  );

  return (
    <main>
      <Dashboard base={agg} home={t.home} kinds={t.kinds} locale={locale} />

      {/* Party-linked foundations: a separate channel from the parties themselves */}
      <section className="mx-auto mt-20 max-w-6xl px-5">
        <h2 className="display section-tick text-2xl">{F.title}</h2>
        <p className="mt-6 max-w-2xl text-[var(--paper-dim)]">{F.intro}</p>

        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-6">
          <div>
            <p className="label-mono mb-2">{F.privateDonations}</p>
            <p className="mono text-2xl text-[var(--gold-bright)]">
              {euro(totals.privateDonations, bcp47)}
            </p>
            <p className="label-mono mt-1 text-[var(--paper-faint)]">2021 + 2022</p>
          </div>
          <div>
            <p className="label-mono mb-2">{F.publicSubsidies}</p>
            <p className="mono text-2xl text-[var(--paper)]">
              {euro(totals.publicSubsidies, bcp47)}
            </p>
            <p className="label-mono mt-1 text-[var(--paper-faint)]">2021 + 2022</p>
          </div>
        </div>

        {/* Per-year split */}
        <div className="mt-10 flex flex-col gap-5">
          {FOUNDATION_YEARS.map((y) => {
            const pct = (n: number) => `${(n / maxBar) * 100}%`;
            return (
              <div key={y.year}>
                <div className="label-mono mb-2 flex flex-wrap items-baseline gap-x-4">
                  <span className="mono text-[var(--paper)]">{y.year}</span>
                  <span style={{ color: "var(--gold)" }}>
                    {F.privateDonations} {euroCompact(y.privateDonations, bcp47)}
                  </span>
                  <span className="text-[var(--paper-dim)]">
                    {F.publicSubsidies} {euroCompact(y.publicSubsidies, bcp47)}
                  </span>
                  <span className="text-[var(--paper-faint)]">
                    {integer(y.entities, bcp47)} {F.entities}
                  </span>
                </div>
                <div className="flex h-5 overflow-hidden rounded-sm bg-[var(--ink-3)]">
                  <div
                    style={{ width: pct(y.privateDonations), backgroundColor: "var(--gold)" }}
                  />
                  <div
                    style={{
                      width: pct(y.publicSubsidies),
                      backgroundColor: "var(--paper-faint)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* The legal mechanism, stated precisely */}
        <div className="panel mt-10 p-6">
          <p className="label-mono mb-3 text-[var(--gold)]">{F.legalTitle}</p>
          <p className="leading-relaxed text-[var(--paper-dim)]">{F.legalBody}</p>
          <p className="label-mono mt-4">
            <a className="src" href={FOUNDATIONS_SOURCE.lawUrl} target="_blank" rel="noopener noreferrer">
              {F.lawLink}
            </a>
          </p>
        </div>

        {/* What is deliberately absent */}
        <div className="mt-8">
          <p className="label-mono mb-2 text-[var(--paper-dim)]">{F.gapTitle}</p>
          <p className="label-mono max-w-2xl leading-relaxed text-[var(--paper-faint)]">
            {F.gapBody}
          </p>
        </div>

        <p className="label-mono mt-8">
          <a className="src" href={FOUNDATIONS_SOURCE.url} target="_blank" rel="noopener noreferrer">
            {FOUNDATIONS_SOURCE.body} · {FOUNDATIONS_SOURCE.published} ↗
          </a>
        </p>
      </section>
    </main>
  );
}
