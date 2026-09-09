import { COURT_RECORDS, STATUS_TONE, recordsForParty, type CourtRecord } from "@/lib/court-records";
import { formatDate } from "@/lib/format";
import type { Dict } from "@/lib/i18n";

/**
 * The judicial and electoral-board record, with its procedural stage attached.
 *
 * The status tag is the component, not decoration on it. Each record's copy
 * comes from lib/i18n so it can be read in three languages, but the tag itself
 * comes from the typed status in lib/court-records.ts, so no translation can
 * turn an archiving into an acquittal or an opening order into a verdict.
 *
 * A party with nothing on file gets an explicit card saying so, and saying what
 * that does and does not mean. Rendering nothing would read as a clean record;
 * rendering "0" would invite a comparison the four hand-verified records here
 * cannot support.
 */
export default function CourtRecords({
  t,
  bcp47,
  partyNif,
}: {
  t: Dict;
  bcp47: string;
  /** Restrict to one party's officeholders; omit for every record. */
  partyNif?: string;
}) {
  const C = t.court;
  const records = partyNif ? recordsForParty(partyNif) : COURT_RECORDS;

  if (records.length === 0) {
    return (
      <div className="pt-1">
        <p
          className="tag"
          style={{ color: STATUS_TONE["none-on-record"], display: "inline-block" }}
        >
          {C.statusNone}
        </p>
        <p className="mt-2.5" style={{ fontSize: "13px", lineHeight: 1.6 }}>
          {C.noneBody}
        </p>
        <p className="mt-1.5" style={{ fontSize: "11.5px", lineHeight: 1.5, color: "var(--ink-3)" }}>
          {C.noneNote}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {records.map((r, i) => (
        <li
          key={r.id}
          className="py-3.5"
          style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}
        >
          <Item record={r} C={C} bcp47={bcp47} />
        </li>
      ))}
      <li className="pt-3.5" style={{ borderTop: "1px solid var(--line)" }}>
        <p style={{ fontSize: "11.5px", lineHeight: 1.55, color: "var(--ink-3)" }}>{C.policy}</p>
      </li>
    </ul>
  );
}

function Item({
  record,
  C,
  bcp47,
}: {
  record: CourtRecord;
  C: Dict["court"];
  bcp47: string;
}) {
  const copy = C.records[record.id as keyof typeof C.records];
  return (
    <>
      <p className="tag" style={{ color: STATUS_TONE[record.status] }}>
        {C.status[record.status as keyof typeof C.status]}
      </p>
      <p className="mt-2.5" style={{ fontSize: "13.5px", lineHeight: 1.6 }}>
        {copy.text}
      </p>
      {/* The chain of bodies and dates, so the stage is checkable and not just
          asserted by the tag above. */}
      <ul className="mt-2 flex flex-col gap-0.5">
        {record.chain.map((step) => (
          <li key={`${step.body}-${step.date}`} style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
            <span className="mono">{formatDate(step.date, bcp47)}</span> · {step.body} ·{" "}
            <em style={{ fontStyle: "italic" }}>{step.outcome}</em>
          </li>
        ))}
      </ul>
      <p className="mt-1.5" style={{ fontSize: "11.5px", lineHeight: 1.5, color: "var(--ink-3)" }}>
        {copy.note}{" "}
        <a className="src" href={record.url} target="_blank" rel="noopener noreferrer">
          {C.sourceLink} ↗
        </a>
      </p>
    </>
  );
}
