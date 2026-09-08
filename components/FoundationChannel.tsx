import Link from "next/link";
import {
  channelTotals,
  displayName,
  namedDeals,
  rankedEntities,
  registrationTally,
  FOUNDATIONS_LAW_URL,
  type FoundationsFile,
} from "@/lib/foundations";
import { euro, euroCompact, integer, percent } from "@/lib/format";
import type { Dict } from "@/lib/i18n";

/**
 * The party-linked foundation channel.
 *
 * A reader arrives expecting corporate money, because that is the story the
 * legal asymmetry suggests: parties may take none, their foundations may. The
 * audited figures say otherwise, so party money leads and the corporate line
 * sits beside it at its real size. The named counterparties get their own table
 * because they are the only companies the report actually identifies, and the
 * compliance verdict travels with each one.
 */
export default function FoundationChannel({
  data,
  t,
  bcp47,
  locale,
}: {
  data: FoundationsFile;
  t: Dict;
  bcp47: string;
  locale: string;
}) {
  const F = t.foundations;
  const totals = channelTotals(data);
  const ranked = rankedEntities(data);
  const deals = namedDeals(data);
  const reg = registrationTally(data);
  const max = ranked[0] ? ranked[0].contributions + ranked[0].subsidies : 1;

  return (
    <section className="mx-auto mt-20 max-w-6xl px-5">
      <h2 className="display section-tick text-2xl">{F.title}</h2>
      <p className="mt-6 max-w-3xl text-[var(--paper-dim)]">{F.intro}</p>

      {/* Party money first: it is nine tenths of the total and the least
          expected, so putting the corporate figure here would mislead by
          prominence even while being accurate. */}
      <div className="mt-8 flex flex-wrap gap-x-10 gap-y-6">
        <div>
          <p className="label-mono mb-2">{F.fromParty}</p>
          <p className="mono text-2xl text-[var(--gold-bright)]">
            {euroCompact(totals.party, bcp47)}
          </p>
          <p className="label-mono mt-1 text-[var(--paper-faint)]">
            {percent(totals.partyShare, bcp47)} {F.ofContributions}
          </p>
        </div>
        <div>
          <p className="label-mono mb-2">{F.fromCompanies}</p>
          <p className="mono text-2xl text-[var(--red)]">
            {euroCompact(totals.companies, bcp47)}
          </p>
          <p className="label-mono mt-1 text-[var(--paper-faint)]">
            {percent(totals.companiesShare, bcp47)} {F.ofContributions}
          </p>
        </div>
        <div>
          <p className="label-mono mb-2">{F.fromIndividuals}</p>
          <p className="mono text-2xl text-[var(--paper)]">
            {euroCompact(totals.individuals, bcp47)}
          </p>
          <p className="label-mono mt-1 text-[var(--paper-faint)]">
            {percent(totals.individualsShare, bcp47)} {F.ofContributions}
          </p>
        </div>
        <div>
          <p className="label-mono mb-2">{F.publicSubsidies}</p>
          <p className="mono text-2xl text-[var(--gold)]">
            {euroCompact(totals.subsidies, bcp47)}
          </p>
          <p className="label-mono mt-1 max-w-xs text-[var(--paper-faint)]">{F.publicNote}</p>
        </div>
      </div>

      {/* The only companies the report names, with the disclosure verdict. */}
      <h3 className="display mt-14 text-xl">{F.counterpartyTitle}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--paper-dim)]">
        {F.counterpartyNote}
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <caption className="sr-only">{F.counterpartyTitle}</caption>
          <thead>
            <tr className="label-mono text-left text-[var(--paper-faint)]">
              <th scope="col" className="py-2 pr-4 font-normal">
                {F.counterparty}
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                {F.entity}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 pr-4 font-normal">
                {F.exercise}
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                {F.consideration}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 pr-4 text-right font-normal">
                {F.total}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 font-normal">
                {F.duties}
              </th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d, i) => (
              <tr key={`${d.slug}-${d.exercise}-${i}`} className="border-t border-[var(--line)]">
                <th scope="row" className="py-3 pr-4 text-left font-normal text-[var(--paper)]">
                  {d.counterparties.join(" · ")}
                </th>
                <td className="py-3 pr-4 text-[var(--paper-dim)]">
                  <Link className="hover:text-[var(--gold)]" href={`/${locale}/fundacion/${d.slug}`}>
                    {displayName(d.entity)}
                  </Link>
                </td>
                <td className="mono py-3 pr-4 text-[var(--paper-faint)]">{d.exercise}</td>
                <td className="py-3 pr-4 text-[var(--paper-faint)]">{d.consideration ?? "—"}</td>
                <td className="mono py-3 pr-4 text-right text-[var(--paper)]">
                  {d.amount === null ? "—" : euro(d.amount, bcp47)}
                </td>
                <td
                  className="label-mono py-3"
                  style={{
                    color:
                      d.compliant === false
                        ? "var(--red)"
                        : d.compliant === true
                          ? "var(--paper-dim)"
                          : "var(--paper-faint)",
                  }}
                >
                  {d.compliant === false
                    ? F.dutiesFailed
                    : d.compliant === true
                      ? F.dutiesMet
                      : F.dutiesUnclear}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Every audited entity, so the named deals above are not mistaken for
          the whole channel. */}
      <h3 className="display mt-14 text-xl">{F.tableTitle}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--paper-dim)]">
        {F.tableNote}
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-sm">
          <caption className="sr-only">{F.tableTitle}</caption>
          <thead>
            <tr className="label-mono text-left text-[var(--paper-faint)]">
              <th scope="col" className="py-2 pr-4 font-normal">
                {F.entity}
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                {F.party}
              </th>
              <th scope="col" className="w-1/6 py-2 pr-4 font-normal">
                {F.total}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-normal">
                {F.fromParty}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-normal">
                {F.fromCompanies}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-normal">
                {F.publicSubsidies}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 text-right font-normal">
                {F.findings}
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((e) => {
              const all = e.contributions + e.subsidies;
              const pct = (n: number) => `${all > 0 ? (n / all) * 100 : 0}%`;
              return (
                <tr key={e.slug} className="border-t border-[var(--line)] align-middle">
                  <th scope="row" className="py-3 pr-4 text-left font-normal text-[var(--paper)]">
                    <Link className="hover:text-[var(--gold)]" href={`/${locale}/fundacion/${e.slug}`}>
                      {displayName(e.name)}
                    </Link>
                  </th>
                  <td className="py-3 pr-4 text-[var(--paper-dim)]">
                    {e.partyNif ? (
                      <Link className="hover:text-[var(--gold)]" href={`/${locale}/party/${e.partyNif}`}>
                        {e.party}
                      </Link>
                    ) : (
                      (e.party ?? <span className="text-[var(--paper-faint)]">{F.noPartyStated}</span>)
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {/* Decoration: every figure in it is in the columns beside it. */}
                    <span
                      aria-hidden="true"
                      className="flex h-3 overflow-hidden rounded-sm bg-[var(--ink-3)]"
                      style={{ width: `${(all / max) * 100}%` }}
                    >
                      {e.party_ > 0 && (
                        <span style={{ width: pct(e.party_), backgroundColor: "var(--gold-bright)" }} />
                      )}
                      {e.companies > 0 && (
                        <span style={{ width: pct(e.companies), backgroundColor: "var(--red)" }} />
                      )}
                      {e.individuals > 0 && (
                        <span style={{ width: pct(e.individuals), backgroundColor: "var(--paper-dim)" }} />
                      )}
                      {e.subsidies > 0 && (
                        <span style={{ width: pct(e.subsidies), backgroundColor: "var(--gold)" }} />
                      )}
                    </span>
                  </td>
                  <td className="mono py-3 pr-3 text-right" style={{ color: "var(--gold-bright)" }}>
                    {e.party_ > 0 ? euroCompact(e.party_, bcp47) : "—"}
                  </td>
                  <td className="mono py-3 pr-3 text-right" style={{ color: "var(--red)" }}>
                    {e.companies > 0 ? euroCompact(e.companies, bcp47) : "—"}
                  </td>
                  <td className="mono py-3 pr-3 text-right" style={{ color: "var(--gold)" }}>
                    {e.subsidies > 0 ? euroCompact(e.subsidies, bcp47) : "—"}
                  </td>
                  <td className="mono py-3 text-right text-[var(--paper-dim)]">
                    {e.findingCount > 0 ? integer(e.findingCount, bcp47) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="panel p-6">
          <p className="label-mono mb-3 text-[var(--gold)]">{F.registerTitle}</p>
          <p className="leading-relaxed text-[var(--paper-dim)]">{F.registerBody}</p>
          <p className="label-mono mt-4 text-[var(--paper-faint)]">
            {integer(reg.registered, bcp47)} / {integer(reg.total, bcp47)} {F.entities} ·{" "}
            {reg.exercise}
          </p>
        </div>
        <div className="panel p-6">
          <p className="label-mono mb-3 text-[var(--gold)]">{F.repeatedTitle}</p>
          <p className="leading-relaxed text-[var(--paper-dim)]">{F.repeatedBody}</p>
        </div>
      </div>

      <div className="panel mt-6 p-6">
        <p className="label-mono mb-3 text-[var(--gold)]">{F.legalTitle}</p>
        <p className="leading-relaxed text-[var(--paper-dim)]">{F.legalBody}</p>
        <p className="label-mono mt-4">
          <a className="src" href={FOUNDATIONS_LAW_URL} target="_blank" rel="noopener noreferrer">
            {F.lawLink}
          </a>
        </p>
      </div>

      <div className="panel mt-6 p-6">
        <p className="label-mono mb-3 text-[var(--gold)]">{F.gapTitle}</p>
        <p className="leading-relaxed text-[var(--paper-dim)]">{F.gapBody}</p>
      </div>

      <p className="label-mono mt-8">
        <a className="src" href={data.source.url} target="_blank" rel="noopener noreferrer">
          {data.source.body} · {data.source.report} ↗
        </a>
      </p>
    </section>
  );
}
