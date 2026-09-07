import {
  advertising,
  financial,
  rankedBySpending,
  spendingTotals,
  type SpendingFile,
} from "@/lib/spending";
import { euroCompact, integer, percent } from "@/lib/format";
import type { Dict } from "@/lib/i18n";

/**
 * What an election's money was declared to have bought.
 *
 * The site could show which parties received public money and never what it
 * purchased. This is the first answer, and the answer is partly that the record
 * does not say: over half of declared ordinary spending sits in a single
 * residual line the report does not break down. The layout gives that residual
 * the same weight as the categories that are itemised, rather than burying it.
 */
export default function ElectoralSpending({ data, t, bcp47 }: { data: SpendingFile; t: Dict; bcp47: string }) {
  const s = t.spending;
  const totals = spendingTotals(data);
  const ranked = rankedBySpending(data);
  const max = ranked[0]?.ordinary.declared || 1;

  return (
    <section className="mx-auto mt-20 max-w-6xl px-5">
      <h2 className="display section-tick text-2xl">{s.title}</h2>
      <p className="mt-6 max-w-2xl text-[var(--paper-dim)]">{s.intro}</p>

      {/* The three shares of declared ordinary spending. The residual leads,
          because it is the largest and the least accountable. */}
      <div className="mt-8 flex flex-wrap gap-x-10 gap-y-6">
        <div>
          <p className="label-mono mb-2">{s.unexplained}</p>
          <p className="mono text-2xl text-[var(--red)]">{euroCompact(totals.other, bcp47)}</p>
          <p className="label-mono mt-1 text-[var(--paper-faint)]">
            {percent(totals.otherShare, bcp47)} {s.ofDeclared}
          </p>
        </div>
        <div>
          <p className="label-mono mb-2">{s.advertising}</p>
          <p className="mono text-2xl text-[var(--gold-bright)]">
            {euroCompact(totals.advertising, bcp47)}
          </p>
          <p className="label-mono mt-1 max-w-xs text-[var(--paper-faint)]">{s.cappedOnly}</p>
        </div>
        <div>
          <p className="label-mono mb-2">{s.mailings}</p>
          <p className="mono text-2xl text-[var(--paper)]">{euroCompact(totals.mailings, bcp47)}</p>
          <p className="label-mono mt-1 text-[var(--paper-faint)]">
            {integer(totals.mailingCount, bcp47)} {s.mailingItems}
          </p>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <caption className="max-w-3xl pb-4 text-left text-xs leading-relaxed text-[var(--paper-dim)]">
            {s.caption}
          </caption>
          <thead>
            <tr className="label-mono text-left text-[var(--paper-faint)]">
              <th scope="col" className="py-2 pr-4 font-normal">
                {s.formation}
              </th>
              <th scope="col" className="w-1/4 py-2 pr-4 font-normal">
                {s.split}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-normal">
                {s.advertising}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-normal">
                {s.unexplained}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 text-right font-normal">
                {s.declared}
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((f) => {
              const ads = advertising(f);
              const fin = financial(f);
              const declared = f.ordinary.declared || 1;
              const pct = (n: number) => `${(n / declared) * 100}%`;
              return (
                <tr key={f.name} className="border-t border-[var(--line)] align-middle">
                  <th scope="row" className="py-3 pr-4 text-left font-normal text-[var(--paper)]">
                    {f.name}
                  </th>
                  <td className="py-3 pr-4">
                    {/* Decoration: every figure in it is in the columns beside it. */}
                    <span
                      aria-hidden="true"
                      className="flex h-3 overflow-hidden rounded-sm bg-[var(--ink-3)]"
                      style={{ width: `${(f.ordinary.declared / max) * 100}%` }}
                    >
                      {ads > 0 && (
                        <span style={{ width: pct(ads), backgroundColor: "var(--gold)" }} />
                      )}
                      {fin > 0 && (
                        <span style={{ width: pct(fin), backgroundColor: "var(--paper-dim)" }} />
                      )}
                      {f.ordinary.otherOrdinary > 0 && (
                        <span
                          style={{
                            width: pct(f.ordinary.otherOrdinary),
                            backgroundColor: "var(--red)",
                          }}
                        />
                      )}
                    </span>
                  </td>
                  <td className="mono py-3 pr-3 text-right" style={{ color: "var(--gold)" }}>
                    {ads > 0 ? euroCompact(ads, bcp47) : "—"}
                  </td>
                  <td className="mono py-3 pr-3 text-right" style={{ color: "var(--red)" }}>
                    {f.ordinary.otherOrdinary > 0
                      ? euroCompact(f.ordinary.otherOrdinary, bcp47)
                      : "—"}
                  </td>
                  <td className="mono py-3 text-right text-[var(--paper)]">
                    {euroCompact(f.ordinary.declared, bcp47)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="panel mt-10 p-6">
        <p className="label-mono mb-3 text-[var(--gold)]">{s.gapTitle}</p>
        <p className="leading-relaxed text-[var(--paper-dim)]">{s.gapBody}</p>
      </div>

      <p className="label-mono mt-8">
        <a className="src" href={data.source.url} target="_blank" rel="noopener noreferrer">
          {data.source.body} · {data.source.report} ↗
        </a>
      </p>
    </section>
  );
}
