import { cssPercent, euroExact, euroM, percent } from "@/lib/format";

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

/**
 * Declared electoral spending by formation, as a donut with a legend.
 *
 * Arcs are drawn as SVG paths rather than as a stroked circle with a dash
 * offset. A dashed stroke needs the circumference to divide evenly and offsets
 * every segment from a single origin, which puts a rounding error at the last
 * arc — visible as a hairline gap where the ring should close. Explicit paths
 * close exactly because each one ends where the next begins.
 *
 * Server component: there is no interaction here, and the legend carries every
 * value in text, so the chart is not the only way to read the data.
 */
export default function SpendDonut({
  slices,
  total,
  centreLabel,
  caption,
  bcp47,
}: {
  slices: DonutSlice[];
  total: number;
  centreLabel: string;
  caption: string;
  bcp47: string;
}) {
  const R = 98;
  const r = 62;
  const C = 110;

  // Start at twelve o'clock, run clockwise.
  let angle = -Math.PI / 2;
  const arcs = slices.map((s) => {
    const sweep = total > 0 ? (s.value / total) * Math.PI * 2 : 0;
    const a0 = angle;
    const a1 = angle + sweep;
    angle = a1;

    const pt = (rad: number, a: number) => `${C + rad * Math.cos(a)} ${C + rad * Math.sin(a)}`;
    // A sweep past a half turn needs the large-arc flag, or the path renders
    // as the shorter complement.
    const large = sweep > Math.PI ? 1 : 0;
    const d = [
      `M ${pt(R, a0)}`,
      `A ${R} ${R} 0 ${large} 1 ${pt(R, a1)}`,
      `L ${pt(r, a1)}`,
      `A ${r} ${r} 0 ${large} 0 ${pt(r, a0)}`,
      "Z",
    ].join(" ");
    return { ...s, d, share: total > 0 ? s.value / total : 0 };
  });

  return (
    <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
      <div className="flex flex-col items-center">
        {/* The chart repeats what the legend states in text, so it is hidden
            from assistive technology rather than given a label that would make
            a screen reader announce the same eight figures twice. */}
        <svg viewBox="0 0 220 220" width={200} height={200} aria-hidden focusable="false">
          {arcs.map((a) => (
            <path key={a.name} d={a.d} fill={a.color} stroke="var(--bg)" strokeWidth={1.5} />
          ))}
          <text
            x={C}
            y={C - 2}
            textAnchor="middle"
            className="display"
            style={{ fontSize: 26, fill: "var(--ink)" }}
          >
            {euroM(total, bcp47)}
          </text>
          <text
            x={C}
            y={C + 16}
            textAnchor="middle"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 10,
              letterSpacing: 1.6,
              fill: "var(--ink-3)",
            }}
          >
            {centreLabel}
          </text>
        </svg>
        <p
          className="mt-3 text-center"
          style={{ fontSize: "11.5px", lineHeight: 1.5, color: "var(--ink-3)", maxWidth: "42ch" }}
        >
          {caption}
        </p>
      </div>

      <ul className="flex flex-col self-center">
        {arcs.map((a) => (
          <li
            key={a.name}
            className="flex items-baseline gap-2.5 py-[7px]"
            style={{ borderBottom: "1px solid var(--line-soft)" }}
          >
            <span
              className="dot"
              aria-hidden
              style={{
                width: 11,
                height: 11,
                borderRadius: 1,
                background: a.color,
                transform: "translateY(1px)",
              }}
            />
            <span className="min-w-0 flex-1 truncate" style={{ fontSize: "13.5px" }}>
              {a.name}
            </span>
            <span className="mono" style={{ fontSize: "12.5px", color: "var(--ink-2)" }}>
              {euroExact(a.value, bcp47)}
            </span>
            <span
              className="mono text-right"
              style={{ width: 48, fontSize: "12.5px", color: "var(--ink-3)" }}
            >
              {percent(a.share, bcp47)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Exported for the callers that draw the same bars without the ring. */
export function shareWidth(value: number, total: number): string {
  return cssPercent(total > 0 ? value / total : 0);
}
