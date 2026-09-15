/**
 * The line under a chart that says where its numbers came from.
 *
 * Every figure on this site cites the body that produced it, and until now each
 * chart wrote that line by hand, which meant the wording drifted and one chart
 * carried a period the data no longer matched. Taking the source record itself
 * removes both failures: the period and the table number are whatever the
 * ingest recorded, not whatever was typed.
 *
 * `note` is for what the reader must know to read the chart correctly — a
 * definition that differs from the obvious one, a population the figure
 * excludes. It sits in the source line rather than in the prose above because a
 * caveat a reader meets after the chart is a caveat they meet too late.
 */
export interface ChartSource {
  /** The producing body, e.g. "INE" or "Tribunal de Cuentas". */
  publisher: string;
  /** The series or report as its publisher names it. */
  name: string;
  /** Period the figures cover, as the source states it. */
  period: string;
  url: string;
}

export default function SourceLine({
  sources,
  note,
  className = "",
}: {
  sources: ChartSource[];
  note?: string;
  className?: string;
}) {
  return (
    <p className={`label-mono mt-3 text-[var(--ink-3)] ${className}`}>
      {sources.map((s, i) => (
        <span key={s.url + s.name}>
          {i > 0 && " · "}
          <a className="src" href={s.url} target="_blank" rel="noopener noreferrer">
            {s.publisher}
          </a>
          {" "}
          {s.name} ({s.period})
        </span>
      ))}
      {note && <span className="block normal-case">{note}</span>}
    </p>
  );
}
