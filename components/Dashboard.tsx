"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { Aggregation, SubsidyKind } from "@/lib/types";
import { filterAggregation } from "@/lib/normalize";
import { euroCompact, integer, percent, formatDate } from "@/lib/format";
import CountUp from "./CountUp";

type KindFilter = SubsidyKind | "all";

const KIND_TABS: { key: KindFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "ordinaria", label: "Financiación ordinaria" },
  { key: "seguridad", label: "Gastos de seguridad" },
];

export default function Dashboard({ base }: { base: Aggregation }) {
  const [kind, setKind] = useState<KindFilter>("all");
  const [years, setYears] = useState<number[]>([]); // empty = all years

  const agg = useMemo(
    () => filterAggregation(base, { kind, years }),
    [base, kind, years],
  );

  const maxTotal = agg.parties[0]?.total ?? 1;
  const totalGrants = agg.parties.reduce((s, p) => s + p.grants.length, 0);
  const updated = formatDate(base.generatedAt.slice(0, 10));

  const toggleYear = (y: number) =>
    setYears((prev) => (prev.includes(y) ? prev.filter((v) => v !== y) : [...prev, y]));

  return (
    <div>
      {/* ---------- Masthead ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-6 pb-10 sm:pt-12">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Subvenciones estatales · {base.years[0]}–{base.years.at(-1)}
        </motion.p>

        <motion.h1
          className="display mt-4 text-5xl leading-[0.92] sm:text-7xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
        >
          ¿Quién financia a<br />
          los <span className="italic text-[var(--gold)]">partidos</span>?
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-[var(--paper-dim)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          El dinero público que el Estado entrega a cada partido, tomado en directo
          de la Base de Datos Nacional de Subvenciones. Filtra por año y por tipo de
          ayuda para ver el reparto.
        </motion.p>

        {/* Grand total */}
        <motion.div
          className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div>
            <p className="label-mono mb-2">Total concedido (selección)</p>
            <CountUp
              value={agg.grandTotal}
              as="euro"
              className="mono block text-4xl text-[var(--gold-bright)] sm:text-6xl"
            />
          </div>
          <dl className="flex gap-8">
            <Stat label="Partidos" value={integer(agg.parties.length)} />
            <Stat label="Concesiones" value={integer(totalGrants)} />
            <Stat label="Actualizado" value={updated} />
          </dl>
        </motion.div>
      </section>

      {/* ---------- Controls ---------- */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {KIND_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setKind(t.key)}
                className={`label-mono rounded-full border px-4 py-2 transition-all ${
                  kind === t.key
                    ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)]"
                    : "border-[var(--line-strong)] text-[var(--paper-dim)] hover:border-[var(--gold)] hover:text-[var(--paper)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-mono mr-1 text-[var(--paper-faint)]">Ejercicio</span>
            {base.years.map((y) => {
              const active = years.length === 0 || years.includes(y);
              return (
                <button
                  key={y}
                  onClick={() => toggleYear(y)}
                  className={`mono rounded border px-3 py-1.5 text-sm transition-all ${
                    years.includes(y)
                      ? "border-[var(--gold)] text-[var(--gold-bright)]"
                      : active
                        ? "border-[var(--line-strong)] text-[var(--paper-dim)] hover:text-[var(--paper)]"
                        : "border-transparent text-[var(--paper-faint)] opacity-40 hover:opacity-100"
                  }`}
                >
                  {y}
                </button>
              );
            })}
            {years.length > 0 && (
              <button
                onClick={() => setYears([])}
                className="label-mono ml-1 text-[var(--red)] hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Ranked bars ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-14">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="display section-tick text-2xl">Reparto por partido</h2>
          <div className="label-mono hidden items-center gap-4 sm:flex">
            <Legend color="var(--gold)" label="Ordinaria" />
            <Legend color="var(--red)" label="Seguridad" />
          </div>
        </div>

        <ol className="flex flex-col">
          {agg.parties.map((p, i) => {
            const wOrd = (p.byKind.ordinaria / maxTotal) * 100;
            const wSeg = (p.byKind.seguridad / maxTotal) * 100;
            const wOtra = (p.byKind.otra / maxTotal) * 100;
            return (
              <motion.li
                key={p.nif}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.035, 0.5) }}
              >
                <Link
                  href={`/party/${p.nif}`}
                  className="group grid grid-cols-[2rem_1fr] items-center gap-x-4 gap-y-2 rounded-md px-2 py-4 transition-colors hover:bg-[var(--ink-2)] sm:grid-cols-[2rem_11rem_1fr_9rem]"
                >
                  <span className="mono text-sm text-[var(--paper-faint)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="flex items-center gap-2 font-medium">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="truncate group-hover:text-[var(--gold-bright)]">
                      {p.shortName}
                    </span>
                  </span>

                  {/* bar track */}
                  <span className="col-span-2 flex h-6 items-center overflow-hidden rounded-sm bg-[var(--ink-3)] sm:col-span-1">
                    <Bar width={wOrd} color={p.color} delay={i * 0.03} />
                    <Bar width={wSeg} color="var(--red)" delay={i * 0.03 + 0.05} striped />
                    <Bar width={wOtra} color="var(--paper-faint)" delay={i * 0.03 + 0.08} />
                  </span>

                  <span className="col-start-2 flex items-baseline justify-between gap-3 sm:col-start-4 sm:justify-end">
                    <span className="mono text-sm text-[var(--paper)]">{euroCompact(p.total)}</span>
                    <span className="mono text-xs text-[var(--paper-faint)]">{percent(p.share)}</span>
                  </span>
                </Link>
                <hr className="hairline" />
              </motion.li>
            );
          })}
        </ol>
        {agg.parties.length === 0 && (
          <p className="label-mono py-10 text-center text-[var(--paper-faint)]">
            No hay concesiones para esta selección.
          </p>
        )}
      </section>
    </div>
  );
}

function Bar({
  width,
  color,
  delay,
  striped,
}: {
  width: number;
  color: string;
  delay: number;
  striped?: boolean;
}) {
  if (width <= 0) return null;
  return (
    <motion.span
      className="h-full"
      style={{
        backgroundColor: color,
        backgroundImage: striped
          ? "repeating-linear-gradient(45deg, rgba(0,0,0,0.25) 0 3px, transparent 3px 6px)"
          : undefined,
      }}
      initial={{ width: 0 }}
      animate={{ width: `${width}%` }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-mono mb-1">{label}</dt>
      <dd className="mono text-lg text-[var(--paper)]">{value}</dd>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="inline-block h-2.5 w-4 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
