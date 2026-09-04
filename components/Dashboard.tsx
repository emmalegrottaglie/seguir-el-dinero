"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { Aggregation, SubsidyKind } from "@/lib/types";
import { BCP47, type Dict, type Locale } from "@/lib/i18n";
import { filterAggregation } from "@/lib/normalize";
import { euroCompact, integer, percent, formatDate } from "@/lib/format";
import CountUp from "./CountUp";

type KindFilter = SubsidyKind | "all";

export default function Dashboard({
  base,
  home,
  kinds,
  locale,
}: {
  base: Aggregation;
  home: Dict["home"];
  kinds: Dict["kinds"];
  locale: Locale;
}) {
  const bcp47 = BCP47[locale];
  const [kind, setKind] = useState<KindFilter>("all");
  const [years, setYears] = useState<number[]>([]); // empty = all years

  const kindTabs: { key: KindFilter; label: string }[] = [
    { key: "all", label: kinds.all },
    { key: "ordinaria", label: kinds.ordinaria },
    { key: "seguridad", label: kinds.seguridad },
  ];

  const agg = useMemo(
    () => filterAggregation(base, { kind, years }),
    [base, kind, years],
  );

  const maxTotal = agg.parties[0]?.total ?? 1;
  const totalGrants = agg.parties.reduce((s, p) => s + p.grants.length, 0);
  const updated = formatDate(base.generatedAt.slice(0, 10), bcp47);

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
          {home.eyebrow} · {base.years[0]}–{base.years.at(-1)}
        </motion.p>

        <motion.h1
          className="display mt-4 text-5xl leading-[0.92] sm:text-7xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
        >
          {home.titlePre}
          <span className="italic text-[var(--gold)]">{home.titleEmph}</span>
          {home.titlePost}
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-[var(--paper-dim)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {home.intro}
        </motion.p>

        {/* Grand total */}
        <motion.div
          className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div>
            <p className="label-mono mb-2">{home.totalLabel}</p>
            <CountUp
              value={agg.grandTotal}
              as="euro"
              bcp47={bcp47}
              className="mono block text-4xl text-[var(--gold-bright)] sm:text-6xl"
            />
          </div>
          <dl className="flex gap-8">
            <Stat label={home.parties} value={integer(agg.parties.length, bcp47)} />
            <Stat label={home.concessions} value={integer(totalGrants, bcp47)} />
            <Stat label={home.updated} value={updated} />
          </dl>
        </motion.div>
      </section>

      {/* ---------- Controls ---------- */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {kindTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setKind(tab.key)}
                aria-pressed={kind === tab.key}
                className={`label-mono inline-flex min-h-11 items-center rounded-full border px-4 transition-all ${
                  kind === tab.key
                    ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)]"
                    : "border-[var(--line-control)] text-[var(--paper-dim)] hover:border-[var(--gold)] hover:text-[var(--paper)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-mono mr-1 text-[var(--paper-faint)]">{home.year}</span>
            {base.years.map((y) => {
              const active = years.length === 0 || years.includes(y);
              return (
                <button
                  key={y}
                  onClick={() => toggleYear(y)}
                  aria-pressed={years.includes(y)}
                  className={`mono inline-flex min-h-11 items-center rounded border px-3 text-sm transition-all ${
                    years.includes(y)
                      ? "border-[var(--gold)] text-[var(--gold-bright)]"
                      : active
                        ? "border-[var(--line-control)] text-[var(--paper-dim)] hover:text-[var(--paper)]"
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
                className="label-mono ml-1 inline-flex min-h-11 items-center px-1 text-[var(--red)] hover:underline"
              >
                {home.reset}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Ranked bars ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-14">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="display section-tick text-2xl">{home.distribution}</h2>
          <div className="label-mono hidden items-center gap-4 sm:flex">
            <Legend color="var(--gold)" label={kinds.ordinaria} />
            <Legend color="var(--red)" label={kinds.seguridad} />
          </div>
        </div>

        {/* Filtering here mutates the list in place with no navigation, so without
            a status region a screen reader user gets no confirmation that
            anything happened. The search forms elsewhere on the site navigate,
            which announces itself, and so need no equivalent. */}
        <p role="status" className="label-mono mb-4 text-[var(--paper-dim)]">
          {home.filterStatus
            .replace("{parties}", integer(agg.parties.length, bcp47))
            .replace("{grants}", integer(totalGrants, bcp47))
            .replace("{total}", euroCompact(agg.grandTotal, bcp47))}
        </p>

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
                  href={`/${locale}/party/${p.nif}`}
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
                    <span className="mono text-sm text-[var(--paper)]">{euroCompact(p.total, bcp47)}</span>
                    <span className="mono text-xs text-[var(--paper-faint)]">{percent(p.share, bcp47)}</span>
                  </span>
                </Link>
                <hr className="hairline" />
              </motion.li>
            );
          })}
        </ol>
        {agg.parties.length === 0 && (
          <p className="label-mono py-10 text-center text-[var(--paper-faint)]">
            {home.noResults}
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
