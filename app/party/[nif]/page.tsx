import Link from "next/link";
import { notFound } from "next/navigation";
import { getAggregation } from "@/lib/data";
import { BLOC_LABELS } from "@/lib/parties";
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

const KIND_LABEL: Record<SubsidyKind, string> = {
  ordinaria: "Financiación ordinaria",
  seguridad: "Gastos de seguridad",
  otra: "Otra",
};

export default async function PartyPage({
  params,
}: {
  params: Promise<{ nif: string }>;
}) {
  const { nif } = await params;
  const agg = await getAggregation();
  const party = agg.parties.find((p) => p.nif === nif);
  if (!party) notFound();

  const rank = agg.parties.findIndex((p) => p.nif === nif) + 1;
  const faces = politiciansByParty(nif);
  const donations = donationsByNif(nif);
  const years = [...new Set(party.grants.map((g) => g.year))].sort((a, b) => a - b);
  const maxYear = Math.max(...years.map((y) => party.byYear[y] ?? 0), 1);

  return (
    <main className="mx-auto max-w-4xl px-5 pb-8">
      <Link href="/" className="label-mono inline-block py-4 hover:text-[var(--gold)]">
        ← Volver al panel
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-start gap-4">
        <span
          className="mt-2 inline-block h-8 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: party.color }}
        />
        <div>
          <p className="eyebrow">
            Nº {String(rank).padStart(2, "0")} · {BLOC_LABELS[party.bloc]} · NIF {party.nif}
          </p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{party.displayName}</h1>
        </div>
      </div>

      {/* Total */}
      <div className="panel mt-8 flex flex-wrap items-end justify-between gap-6 p-6">
        <div>
          <p className="label-mono mb-2">Total recibido {years[0]}–{years.at(-1)}</p>
          <CountUp
            value={party.total}
            as="euro"
            className="mono block text-4xl text-[var(--gold-bright)] sm:text-5xl"
          />
        </div>
        <p className="mono text-sm text-[var(--paper-dim)]">
          {percent(party.share)} del total nacional
        </p>
      </div>

      {/* Faces of the party */}
      {faces.length > 0 && (
        <section className="mt-10">
          <h2 className="display section-tick text-xl">Caras del partido</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {faces.map((f) => (
              <Link
                key={f.slug}
                href={`/politician/${f.slug}`}
                className="panel px-4 py-3 transition-colors hover:border-[var(--line-strong)]"
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
        <h2 className="display section-tick text-xl">De dónde viene</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(["ordinaria", "seguridad", "otra"] as SubsidyKind[])
            .filter((k) => party.byKind[k] > 0)
            .map((k) => (
              <div key={k} className="panel p-5">
                <p className="label-mono mb-3">{KIND_LABEL[k]}</p>
                <p className="mono text-2xl text-[var(--paper)]">{euroCompact(party.byKind[k])}</p>
                <p className="mono mt-1 text-xs text-[var(--paper-faint)]">
                  {percent(party.byKind[k] / party.total)} de sus fondos
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* By year */}
      <section className="mt-12">
        <h2 className="display section-tick text-xl">Evolución anual</h2>
        <div className="mt-8 flex items-end gap-3 sm:gap-5">
          {years.map((y) => {
            const v = party.byYear[y] ?? 0;
            const h = Math.max((v / maxYear) * 160, 3);
            return (
              <div key={y} className="flex flex-1 flex-col items-center gap-2">
                <span className="mono text-xs text-[var(--paper-dim)]">{euroCompact(v)}</span>
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
          <h2 className="display section-tick text-xl">Financiación privada · {DONATIONS_SOURCE.year}</h2>
          <p className="label-mono mt-3">
            <a
              href={DONATIONS_SOURCE.url}
              target="_blank"
              rel="noopener noreferrer"
              className="src"
            >
              {DONATIONS_SOURCE.body} · {DONATIONS_SOURCE.report} ↗
            </a>
          </p>

          <div className="panel mt-8 flex flex-wrap items-end justify-between gap-6 p-6">
            <div>
              <p className="label-mono mb-2">Donaciones declaradas</p>
              <p className="mono text-3xl text-[var(--gold-bright)] sm:text-4xl">
                {euro(donations.total.amount)}
              </p>
            </div>
            <p className="mono text-sm text-[var(--paper-dim)]">
              {integer(donations.total.donors)} donantes
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
                      title={`${lab}: ${euro(tr.amount)} · ${tr.donors} donantes`}
                    />
                  ),
              )}
            </div>
            <div className="label-mono mt-3 flex flex-wrap gap-x-6 gap-y-1">
              <span><span className="text-[var(--paper-faint)]">■</span> &lt;1.000 € · {euroCompact(donations.small.amount)} ({donations.small.donors})</span>
              <span><span className="text-[var(--gold)]">■</span> 1.000–10.000 € · {euroCompact(donations.mid.amount)} ({donations.mid.donors})</span>
              <span><span className="text-[var(--red)]">■</span> &gt;10.000 € · {euroCompact(donations.large.amount)} ({donations.large.donors})</span>
            </div>
          </div>
          <p className="label-mono mt-4 text-[var(--paper-faint)]">
            Solo personas físicas (las donaciones de empresas están prohibidas). Dato anual del
            último informe disponible del Tribunal de Cuentas.
          </p>
        </section>
      )}

      {/* Grant ledger */}
      <section className="mt-14">
        <h2 className="display section-tick text-xl">
          Registro de concesiones
          <span className="label-mono ml-3 align-middle">{integer(party.grants.length)}</span>
        </h2>
        <div className="mt-8 flex flex-col">
          {party.grants.map((g) => (
            <div key={g.id}>
              <div className="grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-4 py-4">
                <span className="mono text-xs text-[var(--paper-dim)]">{formatDate(g.date)}</span>
                <span className="text-sm">
                  <span
                    className="mr-2 inline-block rounded px-2 py-0.5 text-[0.65rem] uppercase tracking-wider"
                    style={{
                      color: g.kind === "seguridad" ? "var(--red)" : "var(--gold)",
                      border: `1px solid ${g.kind === "seguridad" ? "var(--red)" : "var(--gold)"}44`,
                    }}
                  >
                    {KIND_LABEL[g.kind]}
                  </span>
                  <span className="text-[var(--paper-dim)]">Ejercicio {g.year}</span>
                  {g.legalUrl && (
                    <a
                      href={g.legalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-[var(--paper-faint)] underline decoration-dotted hover:text-[var(--gold)]"
                    >
                      base legal (BOE) ↗
                    </a>
                  )}
                </span>
                <span className="mono text-right text-sm text-[var(--paper)]">{euro(g.amount)}</span>
              </div>
              <hr className="hairline" />
            </div>
          ))}
        </div>
      </section>

      {/* News feed */}
      <section className="mt-14">
        <h2 className="display section-tick text-xl">En las noticias</h2>
        <p className="label-mono mt-3 text-[var(--paper-faint)]">
          Titulares recientes · Google News
        </p>
        <NewsFeed query={party.displayName} />
      </section>
    </main>
  );
}
