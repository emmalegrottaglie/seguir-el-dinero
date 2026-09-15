import Bar from "./chart/Bar";
import SourceLine from "./chart/SourceLine";
import { euro } from "@/lib/format";
import type { Indicators } from "@/lib/indicators";
import { jornadaSplit, nationalWages, sectorLadder, sourceFor } from "@/lib/indicators";
import type { Dict } from "@/lib/i18n";

/**
 * What the country earns, by sector, so the rest of the site has a scale.
 *
 * Every sector is drawn rather than one being selected, because a selector
 * shows the reader a figure they chose and hides the nineteen they did not.
 * The finding here is the spread — energy supply pays three and a quarter times
 * what hostelería pays — and a spread is only visible when it is all on screen.
 *
 * The mean is deliberately not alone. EAES's headline figure is a mean over a
 * long upper tail, and the median is €5,043 below it; a page that printed only
 * the average would tell most readers their own wage is unusually low. Both are
 * printed, with the tenth and ninetieth percentiles, so the shape is visible
 * and not just its centre.
 */
export default function WageLadder({
  indicators,
  t,
  bcp47,
}: {
  indicators: Indicators;
  t: Dict["contexto"];
  bcp47: string;
}) {
  const W = t.wages;
  const ladder = sectorLadder(indicators);
  const national = nationalWages(indicators);
  const jornada = jornadaSplit(indicators);
  const top = ladder[0]?.value ?? 0;
  const src = sourceFor(indicators, "sector");
  const pct = sourceFor(indicators, "percentiles");

  return (
    <section className="mt-12">
      <h2 className="display section-tick text-2xl">{W.title}</h2>
      <p className="mt-6 leading-relaxed text-[var(--ink-2)]">
        {W.intro
          .replace("{mean}", euro(national.mean, bcp47))
          .replace("{median}", euro(national.median, bcp47))
          .replace("{p10}", euro(national.p10, bcp47))
          .replace("{p90}", euro(national.p90, bcp47))}
      </p>

      <ul className="mt-8 flex flex-col gap-4">
        {ladder.map((s) => (
          <li key={s.sector}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <span style={{ fontSize: "14px" }}>
                {s.sector}
                {/* INE flags a cell whose sample is 100-500 observations. It is
                    a real figure with a stated weakness, so it is shown and
                    marked rather than dropped or shown unmarked. */}
                {s.lowSample && (
                  <span className="label-mono ml-2 text-[var(--ink-3)]">{W.lowSample}</span>
                )}
              </span>
              <span className="mono whitespace-nowrap" style={{ fontSize: "13px" }}>
                {euro(s.value ?? 0, bcp47)}
              </span>
            </div>
            <Bar
              className="mt-1.5"
              segments={[{ value: s.value ?? 0, color: "var(--gold)", label: s.sector }]}
              total={top}
              scale="compare"
              size="sm"
            />
          </li>
        ))}
      </ul>

      <SourceLine
        sources={[
          { publisher: "INE", name: src.name, period: src.period, url: src.url },
          { publisher: "INE", name: pct.name, period: pct.period, url: pct.url },
        ]}
        note={W.sourceNote}
      />

      {/* The single caveat that changes how every figure above should be read:
          EAES counts part-time workers in the same mean as full-time ones, so
          none of these numbers is "what the job pays". */}
      <p className="mt-6 leading-relaxed text-[var(--ink-2)]">
        {W.jornada
          .replace(
            "{full}",
            euro(jornada.find((j) => j.jornada.includes("completo"))?.value ?? 0, bcp47),
          )
          .replace(
            "{part}",
            euro(jornada.find((j) => j.jornada.includes("parcial"))?.value ?? 0, bcp47),
          )}
      </p>

      <p className="mt-4 leading-relaxed text-[var(--ink-2)]">
        {W.spread
          .replace("{high}", ladder[0]?.sector ?? "")
          .replace("{highValue}", euro(ladder[0]?.value ?? 0, bcp47))
          .replace("{low}", ladder[ladder.length - 1]?.sector ?? "")
          .replace("{lowValue}", euro(ladder[ladder.length - 1]?.value ?? 0, bcp47))
          .replace(
            "{ratio}",
            ((ladder[0]?.value ?? 0) / (ladder[ladder.length - 1]?.value || 1)).toLocaleString(
              bcp47,
              { maximumFractionDigits: 2 },
            ),
          )}
      </p>
    </section>
  );
}
