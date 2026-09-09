"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { Aggregation, SubsidyKind } from "@/lib/types";
import { BCP47, type Dict, type Locale } from "@/lib/i18n";
import { filterAggregation } from "@/lib/normalize";
import { euroCompact, integer, percent, formatDate } from "@/lib/format";
import { stagger } from "@/lib/motion";
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
      {/* ---------- The state-subsidy channel ----------
          This section used to carry the page's <h1>, which bound the title to
          the least surprising of the three money channels. The page owns the
          title now; this is a section heading like the other two. */}
      <section className="mx-auto mt-20 max-w-6xl pb-10">
        <h2 className="display section-tick text-2xl">{home.channelTitle}</h2>

        <p className="mt-6 max-w-xl text-[var(--ink-2)]">{home.intro}</p>

        {/* Grand total */}
        <div
          className="enter mt-10 flex flex-wrap items-end gap-x-10 gap-y-6"
          style={{ "--enter-y": "16px", "--enter-delay": "0.3s" } as CSSProperties}
        >
          <div>
            <p className="label-mono mb-2">{home.totalLabel}</p>
            <CountUp
              value={agg.grandTotal}
              as="euro"
              bcp47={bcp47}
              className="mono block text-4xl text-[var(--gold-deep)] sm:text-6xl"
            />
          </div>
          <dl className="flex gap-8">
            <Stat label={home.parties} value={integer(agg.parties.length, bcp47)} />
            <Stat label={home.concessions} value={integer(totalGrants, bcp47)} />
            <Stat label={home.updated} value={updated} />
          </dl>
        </div>
      </section>

      {/* ---------- Controls ---------- */}
      <section className="mx-auto max-w-6xl">
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
                    : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--gold)] hover:text-[var(--ink)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-mono mr-1 text-[var(--ink-3)]">{home.year}</span>
            {base.years.map((y) => {
              const active = years.length === 0 || years.includes(y);
              return (
                <button
                  key={y}
                  onClick={() => toggleYear(y)}
                  aria-pressed={years.includes(y)}
                  className={`mono inline-flex min-h-11 items-center rounded border px-3 text-sm transition-all ${
                    years.includes(y)
                      ? "border-[var(--gold)] text-[var(--gold-deep)]"
                      : active
                        ? "border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)]"
                        : "border-transparent text-[var(--ink-3)] opacity-40 hover:opacity-100"
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
      <section className="mx-auto max-w-6xl pt-14">
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
        <p role="status" className="label-mono mb-4 text-[var(--ink-2)]">
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
              // initial={false} so the row is visible in the server-rendered HTML;
              // `layout` still animates reordering when a filter changes.
              <motion.li key={p.nif} layout initial={false}>
                <Link
                  href={`/${locale}/party/${p.nif}`}
                  className="group enter grid grid-cols-[2rem_1fr] items-center gap-x-4 gap-y-2 rounded-md px-2 py-4 transition-colors hover:bg-[var(--surface)] sm:grid-cols-[2rem_11rem_1fr_9rem]"
                  style={
                    { "--enter-y": "0", "--enter-delay": `${stagger(i)}s` } as CSSProperties
                  }
                >
                  <span className="mono text-sm text-[var(--ink-3)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="flex items-center gap-2 font-medium">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="truncate group-hover:text-[var(--gold-deep)]">
                      {p.shortName}
                    </span>
                  </span>

                  {/* bar track */}
                  <span className="col-span-2 flex h-6 items-center overflow-hidden rounded-sm bg-[var(--track)] sm:col-span-1">
                    <Bar width={wOrd} color={p.color} index={i} />
                    <Bar width={wSeg} color="var(--red)" index={i} step={1} striped />
                    <Bar width={wOtra} color="var(--ink-3)" index={i} step={2} />
                  </span>

                  <span className="col-start-2 flex items-baseline justify-between gap-3 sm:col-start-4 sm:justify-end">
                    <span className="mono text-sm text-[var(--ink)]">{euroCompact(p.total, bcp47)}</span>
                    <span className="mono text-xs text-[var(--ink-3)]">{percent(p.share, bcp47)}</span>
                  </span>
                </Link>
                <hr className="hairline" />
              </motion.li>
            );
          })}
        </ol>
        {agg.parties.length === 0 && (
          <p className="label-mono py-10 text-center text-[var(--ink-3)]">
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
  index,
  step = 0,
  striped,
}: {
  width: number;
  color: string;
  /** Row position; the delay is the capped stagger for that row. */
  index: number;
  /** Which segment of the row this is, so the three grow in sequence. */
  step?: 0 | 1 | 2;
  striped?: boolean;
}) {
  if (width <= 0) return null;
  // The real width is in the HTML and the growth is a CSS transform, so the bar
  // is the right size without JavaScript. Animating `width` from 0 the old way
  // shipped `width: 0px` inline and left every bar invisible until hydration.
  return (
    <span
      className="enter-bar h-full"
      style={
        {
          width: `${width}%`,
          backgroundColor: color,
          backgroundImage: striped
            ? "repeating-linear-gradient(45deg, rgba(0,0,0,0.25) 0 3px, transparent 3px 6px)"
            : undefined,
          "--enter-delay": `${stagger(index) + step * 0.05}s`,
        } as CSSProperties
      }
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-mono mb-1">{label}</dt>
      <dd className="mono text-lg text-[var(--ink)]">{value}</dd>
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
