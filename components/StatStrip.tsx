import type { ReactNode } from "react";

export interface StatItem {
  label: string;
  value: ReactNode;
  /** A status dot before the label. Omitted on strips that do not use one. */
  dot?: string;
  /** The figure's colour; defaults to ink. */
  color?: string;
  note?: string;
}

/**
 * The ticker strip on the portada and the stat strip on the section pages.
 *
 * One component for both because the anatomy is identical — a label row, a
 * display figure, a note — and the only differences are the cell minimum and
 * whether a status dot is present.
 *
 * Grid, never wrapping flex. A wrapped flex line stretches its items to fill
 * the row, so a last row holding two of six cells renders them at three times
 * the width of the others; `auto-fit` leaves the trailing columns empty
 * instead, which is what a newspaper strip should do.
 *
 * `labelMinHeight` exists so the figures share a baseline across cells even
 * when one label wraps to two lines and its neighbours do not.
 */
export default function StatStrip({
  items,
  min = 186,
  figureSize = 38,
  labelMinHeight = 34,
  className = "",
}: {
  items: StatItem[];
  min?: number;
  figureSize?: number;
  labelMinHeight?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid border-b border-[var(--line)] ${className}`}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))` }}
    >
      {items.map((it, i) => (
        <div
          key={it.label}
          className="flex flex-col px-5 pb-[15px] pt-4"
          style={{
            // No trailing rule on the last cell: it would double up with the
            // page's own right edge.
            borderRight: i === items.length - 1 ? "none" : "1px solid var(--line)",
          }}
        >
          <div className="flex gap-2" style={{ minHeight: labelMinHeight }}>
            {it.dot && (
              <span
                className="dot"
                aria-hidden
                style={{ width: 8, height: 8, marginTop: 5, background: it.dot }}
              />
            )}
            <span className="label-mono">{it.label}</span>
          </div>
          <p className="figure" style={{ fontSize: figureSize, color: it.color ?? "var(--ink)" }}>
            {it.value}
          </p>
          {it.note && (
            <p className="mt-1.5" style={{ fontSize: "11.5px", lineHeight: 1.45, color: "var(--ink-3)" }}>
              {it.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
