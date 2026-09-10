"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { PARTIES } from "@/lib/parties";
import { GOVERNMENTS, GOVERNMENTS_SOURCE, shortName } from "@/lib/governments";
import type { HateTerritoryFile, RegionsFile } from "@/lib/regions";
import { formatDate, integer, rate } from "@/lib/format";
import Bar from "./chart/Bar";
import type { Dict } from "@/lib/i18n";

type LayerId = "gov" | "hate";

interface Cell {
  id: string;
  /** The fill for the active layer. */
  fill: string;
  /** What the tooltip and the table print for this territory. */
  value: string;
}

/**
 * Where each party governs, and what the hate-crime record says there.
 *
 * Two layers, both sourced. The design specified five; the other three were
 * supplied with sample values and are not here — see lib/regions.ts for why a
 * plausible number on a map is worse than a missing layer.
 *
 * The geometry is projected at build time, so this component only colours paths
 * and handles selection. It is a client component for the hover and click
 * behaviour; without JavaScript the map still renders, in the layer that loads
 * first, with the table below carrying every value as text.
 *
 * The ramp is built with CSS `color-mix(in oklab, …)` rather than a colour
 * library. Mixing in a perceptual space is the whole reason d3.interpolateLab
 * was specified for it, and the browser does that natively now; sampling from
 * 0.16 rather than 0 keeps the lightest step reading as a fill instead of as
 * empty ground.
 */
export default function RightsMap({
  regions,
  hate,
  M,
  bcp47,
}: {
  regions: RegionsFile;
  hate: HateTerritoryFile;
  /* Only this block, not the whole dictionary. `Dict` carries functions —
     news.hoursAgo among them — and a function cannot cross the server-to-client
     boundary, so passing `t` fails at prerender rather than at type-check. */
  M: Dict["map"];
  bcp47: string;
}) {
  const [layer, setLayer] = useState<LayerId>("gov");
  const [selected, setSelected] = useState("13");
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);

  const maxRate = useMemo(
    () => Math.max(...Object.values(hate.territories).map((h) => h.ratePer100k)),
    [hate],
  );

  const cells: Record<string, Cell> = useMemo(() => {
    const out: Record<string, Cell> = {};
    for (const r of regions.regions) {
      if (layer === "gov") {
        const g = GOVERNMENTS.find((x) => x.id === r.id);
        const colour = g?.partyNif ? PARTIES[g.partyNif]?.color : undefined;
        out[r.id] = {
          id: r.id,
          fill: colour ?? "var(--grey-300)",
          value: g ? g.partyLabel : M.noData,
        };
      } else {
        const h = hate.territories[r.id];
        // 0.16 → 1.0 of the ramp, so even the lowest territory reads as filled.
        const k = h ? 0.16 + (h.ratePer100k / maxRate) * 0.84 : 0;
        out[r.id] = {
          id: r.id,
          fill: h
            ? `color-mix(in oklab, var(--gold) ${(k * 100).toFixed(1)}%, #f4f2ee)`
            : "var(--grey-300)",
          value: h ? rate(h.ratePer100k, bcp47) : M.noData,
        };
      }
    }
    return out;
  }, [regions, hate, layer, maxRate, M.noData, bcp47]);

  const nameOf = useCallback(
    (id: string) => {
      const r = regions.regions.find((x) => x.id === id);
      return r ? shortName(id, r.name) : id;
    },
    [regions],
  );

  const onMove = (id: string) => (e: React.MouseEvent) => {
    const box = frame.current?.getBoundingClientRect();
    if (!box) return;
    setHover({ id, x: e.clientX - box.left, y: e.clientY - box.top });
  };

  const sel = regions.regions.find((r) => r.id === selected);
  const selGov = GOVERNMENTS.find((g) => g.id === selected);
  const selHate = hate.territories[selected];

  const layers: { id: LayerId; label: string; note: string }[] = [
    { id: "gov", label: M.layerGov, note: M.layerGovNote },
    { id: "hate", label: M.layerHate, note: M.layerHateNote },
  ];
  const activeNote = layers.find((l) => l.id === layer)!.note;

  // Ranked for the table: by party name on the government layer, by rate on the
  // hate-crime layer, which is the order each layer is actually read in.
  const ranked = useMemo(() => {
    const rows = regions.regions.map((r) => ({
      id: r.id,
      name: shortName(r.id, r.name),
      cell: cells[r.id],
      hate: hate.territories[r.id],
      gov: GOVERNMENTS.find((g) => g.id === r.id),
    }));
    return layer === "hate"
      ? rows.sort((a, b) => (b.hate?.ratePer100k ?? 0) - (a.hate?.ratePer100k ?? 0))
      : rows.sort(
          (a, b) =>
            (a.gov?.partyLabel ?? "").localeCompare(b.gov?.partyLabel ?? "") ||
            a.name.localeCompare(b.name),
        );
  }, [regions, cells, hate, layer]);

  return (
    <div>
      {/* Layer switch */}
      <div className="flex flex-wrap gap-1.5">
        {layers.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={layer === l.id}
            onClick={() => setLayer(l.id)}
            className="layer-btn"
          >
            {l.label}
          </button>
        ))}
      </div>
      <p
        className="mt-2"
        style={{ fontSize: "11.5px", lineHeight: 1.45, color: "var(--ink-3)", maxWidth: "66ch" }}
      >
        {activeNote}
      </p>

      <div
        className="mt-3 grid border border-[var(--line)]"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0, 306px)" }}
      >
        {/* Map */}
        <div ref={frame} className="relative min-w-0 p-3">
          <svg
            viewBox={`0 0 ${regions.viewBox.width} ${regions.viewBox.height}`}
            className="block h-auto w-full"
            role="group"
            aria-label={M.svgLabel}
          >
            {/* The Canaries are drawn to their own scale, so the box says so
                rather than letting them read as part of the same projection. */}
            <rect
              x={regions.insetBox.x}
              y={regions.insetBox.y}
              width={regions.insetBox.w}
              height={regions.insetBox.h}
              fill="none"
              stroke="var(--line)"
            />
            <text
              x={regions.insetBox.x}
              y={regions.insetBox.y - 6}
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: 9.5,
                letterSpacing: 1.4,
                fill: "var(--ink-3)",
              }}
            >
              CANARIAS
            </text>

            {regions.regions.map((r) => {
              const c = cells[r.id];
              const isSel = r.id === selected;
              const shared = {
                fill: c.fill,
                stroke: isSel ? "var(--ink)" : "var(--bg)",
                strokeWidth: isSel ? 1.8 : 0.8,
                className: "region",
                tabIndex: 0,
                role: "button",
                "aria-pressed": isSel,
                "aria-label": `${nameOf(r.id)}: ${c.value}`,
                onClick: () => setSelected(r.id),
                onFocus: () => setSelected(r.id),
                onMouseMove: onMove(r.id),
                onMouseLeave: () => setHover(null),
              };

              // Ceuta and Melilla project to a couple of pixels. Drawing the
              // real outline would leave two territories on the map that
              // cannot be seen, hovered or clicked, so they get a square at
              // their centroid instead - offset below the coast so the two do
              // not overlap Andalucia's edge - with an initial beside it.
              // Everything else about them behaves identically.
              if (r.tiny) {
                const [cx, cy] = r.centroid;
                const S = 11;
                // Melilla's centroid sits 8 units from the bottom of the
                // viewBox, so a label below its marker rendered outside the
                // frame and was clipped away entirely. Flip it above when
                // there is no room beneath.
                const below = cy + S + 10 < regions.viewBox.height;
                const labelY = below ? cy + S + 8 : cy - S / 2 - 5;
                return (
                  <g key={r.id}>
                    <rect
                      x={cx - S / 2}
                      y={cy - S / 2}
                      width={S}
                      height={S}
                      {...shared}
                    />
                    <text
                      x={cx}
                      y={labelY}
                      textAnchor="middle"
                      aria-hidden
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 600,
                        fontSize: 9.5,
                        fill: "var(--ink-3)",
                        pointerEvents: "none",
                      }}
                    >
                      {nameOf(r.id)}
                    </text>
                  </g>
                );
              }

              return <path key={r.id} d={r.d} {...shared} />;
            })}
          </svg>

          {hover && (
            <div
              role="presentation"
              className="pointer-events-none absolute z-10"
              style={{
                // Clamped to the frame so a territory at the right edge does
                // not push the tooltip out of the panel.
                left: Math.min(hover.x + 12, (frame.current?.clientWidth ?? 0) - 240),
                top: Math.max(hover.y - 12, 0),
                maxWidth: 230,
                background: "var(--ink)",
                color: "var(--bg)",
                borderRadius: 2,
                padding: "7px 10px",
                fontSize: 12,
                lineHeight: 1.35,
              }}
            >
              <b
                className="block"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13.5 }}
              >
                {nameOf(hover.id)}
              </b>
              <span className="mono">
                {layer === "gov"
                  ? cells[hover.id].value
                  : `${cells[hover.id].value} ${M.perHundredThousand}`}
              </span>
            </div>
          )}
        </div>

        {/* Drill-down */}
        <aside
          aria-live="polite"
          className="border-l border-[var(--line)] bg-[var(--surface)] px-4 pb-5 pt-3.5"
        >
          <h3 className="display text-[19px] font-semibold" style={{ letterSpacing: "-0.01em" }}>
            {sel ? shortName(sel.id, sel.name) : "—"}
          </h3>
          <p className="label-mono mt-1">{M.panelKicker}</p>
          {/* The legal name, which the short label above drops. */}
          <p className="mt-2" style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
            {sel?.name}
          </p>

          <dl className="mt-3">
            {[
              { k: M.rowPresident, v: selGov?.president ?? M.noData },
              { k: M.rowParty, v: selGov?.partyLabel ?? M.noData },
              {
                k: M.rowSince,
                v: selGov ? formatDate(selGov.since, bcp47) : M.noData,
              },
              {
                k: M.rowRecorded,
                v: selHate ? integer(selHate.total, bcp47) : M.noData,
              },
              {
                k: M.rowRate,
                v: selHate ? rate(selHate.ratePer100k, bcp47) : M.noData,
              },
            ].map((row) => (
              <div
                key={row.k}
                className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-[7px]"
                style={{ fontSize: "13px" }}
              >
                <dt style={{ color: "var(--ink-3)" }}>{row.k}</dt>
                <dd className="mono text-right">{row.v}</dd>
              </div>
            ))}
          </dl>

          {selHate && (
            <div className="mt-4">
              {[
                {
                  label: M.barSogi,
                  n: selHate.sexualOrientationGenderIdentity,
                  colour: "var(--verd)",
                },
                { label: M.barRacism, n: selHate.racism, colour: "var(--gold)" },
              ].map((b) => (
                <div key={b.label} className="mt-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>{b.label}</span>
                    <span className="mono" style={{ fontSize: "11.5px" }}>
                      {integer(b.n, bcp47)}
                    </span>
                  </div>
                  <Bar
                    className="mt-1"
                    segments={[{ value: b.n, color: b.colour, label: b.label }]}
                    total={Math.max(1, selHate.total)}
                    scale="share"
                    size="sm"
                  />
                </div>
              ))}
              <p className="mt-2" style={{ fontSize: "10.5px", lineHeight: 1.45, color: "var(--ink-3)" }}>
                {M.barsNote}
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Every value as text, in the order the active layer is read in. This is
          not a fallback for the map: a choropleth cannot be read to the
          precision of a number, and nineteen figures are worth having. */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <caption
            className="pb-3 text-left"
            style={{ fontSize: "12px", lineHeight: 1.55, color: "var(--ink-2)", maxWidth: "88ch" }}
          >
            {M.tableCaption}
          </caption>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              <th scope="col" className="label-mono py-2 text-left">
                {M.colTerritory}
              </th>
              <th scope="col" className="label-mono py-2 text-left">
                {M.rowPresident}
              </th>
              <th scope="col" className="label-mono whitespace-nowrap py-2 text-right">
                {M.rowRecorded}
              </th>
              <th scope="col" className="label-mono whitespace-nowrap py-2 text-right">
                {M.colRate}
              </th>
              <th scope="col" className="label-mono whitespace-nowrap py-2 text-right">
                {M.barSogi}
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((row) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: "1px solid var(--line-soft)",
                  background: row.id === selected ? "var(--surface)" : undefined,
                }}
              >
                <th scope="row" className="py-2 pr-3 text-left font-normal">
                  <span className="flex items-center gap-2">
                    <span
                      className="dot"
                      aria-hidden
                      style={{ width: 9, height: 9, background: row.cell.fill }}
                    />
                    {row.name}
                  </span>
                </th>
                <td className="py-2 pr-3" style={{ color: "var(--ink-2)" }}>
                  {row.gov ? `${row.gov.president} · ${row.gov.partyLabel}` : M.noData}
                </td>
                <td className="mono py-2 text-right">
                  {row.hate ? integer(row.hate.total, bcp47) : M.noData}
                </td>
                <td className="mono py-2 text-right">
                  {row.hate ? rate(row.hate.ratePer100k, bcp47) : M.noData}
                </td>
                <td className="mono py-2 text-right" style={{ color: "var(--verd-text)" }}>
                  {row.hate ? integer(row.hate.sexualOrientationGenderIdentity, bcp47) : M.noData}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sources and limits */}
      <div className="mt-6 border-t border-[var(--line)] pt-4">
        <p className="label-mono">{M.sourcesTitle}</p>
        <ul className="mt-2 flex flex-col gap-1.5" style={{ fontSize: "12px", lineHeight: 1.55 }}>
          <li>
            <a className="src" href={hate.source.url} target="_blank" rel="noopener noreferrer">
              {hate.source.body} · {hate.source.report} ↗
            </a>{" "}
            <span style={{ color: "var(--ink-3)" }}>
              {M.tablesLabel} {hate.source.tables.join(", ")}
            </span>
          </li>
          <li>
            <a
              className="src"
              href={GOVERNMENTS_SOURCE.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {GOVERNMENTS_SOURCE.body} ↗
            </a>{" "}
            <span style={{ color: "var(--ink-3)" }}>
              {M.checkedLabel} {formatDate(GOVERNMENTS_SOURCE.checked, bcp47)}
            </span>
          </li>
          <li>
            <a className="src" href={regions.source.url} target="_blank" rel="noopener noreferrer">
              {regions.source.body} ↗
            </a>{" "}
            <span style={{ color: "var(--ink-3)" }}>{regions.source.licence}</span>
          </li>
        </ul>
        <p
          className="mt-3"
          style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--ink-2)", maxWidth: "88ch" }}
        >
          {M.limits}
        </p>
        <p
          className="mt-2"
          style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--ink-3)", maxWidth: "88ch" }}
        >
          {M.missingLayers}
        </p>
      </div>
    </div>
  );
}
