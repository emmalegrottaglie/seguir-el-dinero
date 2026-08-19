import Link from "next/link";
import { notFound } from "next/navigation";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { euro, euroCompact, integer, percent, formatDate } from "@/lib/format";
import CountUp from "@/components/CountUp";
import NewsFeed from "@/components/NewsFeed";
import { politiciansByParty } from "@/lib/politicians";
import { donationsByNif, DONATIONS_SOURCE } from "@/lib/donations";
import type { SubsidyKind } from "@/lib/types";

export const revalidate = 3600;

export async function generateStaticParams() {
  const agg = await getAggregation();
  return agg.parties.map((p) => ({ nif: p.nif }));
}

export default async function PartyPage({
  params,
}: {
  params: Promise<{ locale: string; nif: string }>;
}) {
  const { locale: localeParam, nif } = await params;
  const agg = await getAggregation();
  const party = agg.parties.find((p) => p.nif === nif);
  if (!party) notFound();

  const { locale, bcp47, t } = getDict(localeParam);
  const kindLabel: Record<SubsidyKind, string> = {
    ordinaria: t.kinds.ordinaria,
    seguridad: t.kinds.seguridad,
    otra: t.kinds.otra,
  };

  const rank = agg.parties.findIndex((p) => p.nif === nif) + 1;
  const faces = politiciansByParty(nif);
  const donations = donationsByNif(nif);
  const years = [...new Set(party.grants.map((g) => g.year))].sort((a, b) => a - b);
  const maxYear = Math.max(...years.map((y) => party.byYear[y] ?? 0), 1);

  return (
    <main className="mx-auto max-w-4xl px-5 pb-8">
      <Link href={`/${locale}`} className="label-mono inline-block py-4 hover:text-[var(--gold)]">
        {t.common.backToPanel}
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-start gap-4">
        <span
          className="mt-2 inline-block h-8 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: party.color }}
        />
        <div>
          <p className="eyebrow">
            Nº {String(rank).padStart(2, "0")} · {t.blocs[party.bloc]} · {t.common.nif} {party.nif}
          </p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{party.displayName}</h1>
        </div>
      </div>

      {/* Total */}
      <div className="panel mt-8 flex flex-wrap items-end justify-between gap-6 p-6">
        <div>
          <p className="label-mono mb-2">
            {t.party.totalReceived} {years[0]}–{years.at(-1)}
          </p>
          <CountUp
            value={party.total}
            as="euro"
            bcp47={bcp47}
            className="mono block text-4xl text-[var(--gold-bright)] sm:text-5xl"
          />
        </div>
        <p className="mono text-sm text-[var(--paper-dim)]">
          {percent(party.share, bcp47)} {t.party.ofNational}
        </p>
      </div>

      {/* Faces of the party */}
      {faces.length > 0 && (
        <section className="mt-10">
          <h2 className="display section-tick text-xl">{t.party.facesTitle}</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {faces.map((f) => (
              <Link
                key={f.slug}
                href={`/${locale}/politician/${f.slug}`}
                className="panel group px-4 py-3 transition-colors hover:border-[var(--line-strong)]"
              >
                <span className="group-hover:text-[var(--gold-bright)]">{f.name}</span>
                <span className="label-mono ml-2 text-[var(--paper-faint)]">{f.role}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* By kind */}
      <section className="mt-10">
        <h2 className="display section-tick text-xl">{t.party.whereFrom}</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(["ordinaria", "seguridad", "otra"] as SubsidyKind[])
            .filter((k) => party.byKind[k] > 0)
            .map((k) => (
              <div key={k} className="panel p-5">
                <p className="label-mono mb-3">{kindLabel[k]}</p>
                <p className="mono text-2xl text-[var(--paper)]">{euroCompact(party.byKind[k], bcp47)}</p>
                <p className="mono mt-1 text-xs text-[var(--paper-faint)]">
                  {percent(party.byKind[k] / party.total, bcp47)} {t.party.ofItsFunds}
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* By year */}
      <section className="mt-12">
        <h2 className="display section-tick text-xl">{t.party.yearlyEvolution}</h2>
        <div className="mt-8 flex items-end gap-3 sm:gap-5">
          {years.map((y) => {
            const v = party.byYear[y] ?? 0;
            const h = Math.max((v / maxYear) * 160, 3);
            return (
              <div key={y} className="flex flex-1 flex-col items-center gap-2">
                <span className="mono text-xs text-[var(--paper-dim)]">{euroCompact(v, bcp47)}</span>
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${h}px`,
                    background: `linear-gradient(180deg, ${party.color}, ${party.color}55)`,
                  }}
                />
                <span className="mono text-xs text-[var(--paper-faint)]">{y}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Private donations (Tribunal de Cuentas) */}
      {donations && (
        <section className="mt-14">
          <h2 className="display section-tick text-xl">
            {t.party.privateTitle} · {DONATIONS_SOURCE.year}
          </h2>
          <p className="label-mono mt-3">
            <a href={DONATIONS_SOURCE.url} target="_blank" rel="noopener noreferrer" className="src">
              {DONATIONS_SOURCE.body} · {DONATIONS_SOURCE.report} ↗
            </a>
          </p>

          <div className="panel mt-8 flex flex-wrap items-end justify-between gap-6 p-6">
            <div>
              <p className="label-mono mb-2">{t.party.donationsDeclared}</p>
              <p className="mono text-3xl text-[var(--gold-bright)] sm:text-4xl">
                {euro(donations.total.amount, bcp47)}
              </p>
            </div>
            <p className="mono text-sm text-[var(--paper-dim)]">
              {integer(donations.total.donors, bcp47)} {t.party.donors}
            </p>
          </div>

          {/* tranche split by amount */}
          <div className="mt-6">
            <div className="flex h-6 overflow-hidden rounded-sm bg-[var(--ink-3)]">
              {(
                [
                  ["< 1.000 €", donations.small, "var(--paper-faint)"],
                  ["1.000–10.000 €", donations.mid, "var(--gold)"],
                  ["> 10.000 €", donations.large, "var(--red)"],
                ] as const
              ).map(
                ([lab, tr, color]) =>
                  tr.amount > 0 && (
                    <div
                      key={lab}
                      style={{
                        width: `${(tr.amount / donations.total.amount) * 100}%`,
                        backgroundColor: color,
                      }}
                      title={`${lab}: ${euro(tr.amount, bcp47)} · ${tr.donors} ${t.party.donors}`}
                    />
                  ),
              )}
            </div>
            <div className="label-mono mt-3 flex flex-wrap gap-x-6 gap-y-1">
              <span><span className="text-[var(--paper-faint)]">■</span> &lt;1.000 € · {euroCompact(donations.small.amount, bcp47)} ({donations.small.donors})</span>
              <span><span className="text-[var(--gold)]">■</span> 1.000–10.000 € · {euroCompact(donations.mid.amount, bcp47)} ({donations.mid.donors})</span>
              <span><span className="text-[var(--red)]">■</span> &gt;10.000 € · {euroCompact(donations.large.amount, bcp47)} ({donations.large.donors})</span>
            </div>
          </div>
          <p className="label-mono mt-4 text-[var(--paper-faint)]">{t.party.privateCaveat}</p>
        </section>
      )}

      {/* Grant ledger */}
      <section className="mt-14">
        <h2 className="display section-tick text-xl">
          {t.party.ledgerTitle}
          <span className="label-mono ml-3 align-middle">{integer(party.grants.length, bcp47)}</span>
        </h2>
        <div className="mt-8 flex flex-col">
          {party.grants.map((g) => (
            <div key={g.id}>
              <div className="grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-4 py-4">
                <span className="mono text-xs text-[var(--paper-dim)]">{formatDate(g.date, bcp47)}</span>
                <span className="text-sm">
                  <span
                    className="mr-2 inline-block rounded px-2 py-0.5 text-[0.65rem] uppercase tracking-wider"
                    style={{
                      color: g.kind === "seguridad" ? "var(--red)" : "var(--gold)",
                      border: `1px solid ${g.kind === "seguridad" ? "var(--red)" : "var(--gold)"}44`,
                    }}
                  >
                    {kindLabel[g.kind]}
                  </span>
                  <span className="text-[var(--paper-dim)]">{t.party.exercise} {g.year}</span>
                  {g.legalUrl && (
                    <a
                      href={g.legalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-[var(--paper-faint)] underline decoration-dotted hover:text-[var(--gold)]"
                    >
                      {t.party.legalBasis}
                    </a>
                  )}
                </span>
                <span className="mono text-right text-sm text-[var(--paper)]">{euro(g.amount, bcp47)}</span>
              </div>
              <hr className="hairline" />
            </div>
          ))}
        </div>
      </section>

      {/* News feed */}
      <section className="mt-14">
        <h2 className="display section-tick text-xl">{t.party.inNews}</h2>
        <p className="label-mono mt-3 text-[var(--paper-faint)]">{t.party.recentHeadlines}</p>
        <NewsFeed query={party.displayName} locale={locale} />
      </section>
    </main>
  );
}
