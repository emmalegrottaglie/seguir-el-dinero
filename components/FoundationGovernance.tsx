import { governanceFor, type Source, type Tie } from "@/lib/foundation-people";
import type { Dict } from "@/lib/i18n";

/**
 * Who governs one party-linked entity, and what else those people hold.
 *
 * The design constraint here is evidentiary, not visual. Report nº 1.642 records
 * the money and never the people, so every name below is hand-checked against a
 * source that is cited next to it — and the source's *kind* changes how the
 * claim reads. A filing by the entity itself is shown as a statement of record;
 * a press report is shown with its publisher and date in the sentence, so a
 * reader can weigh it differently. They are never mixed into one list.
 *
 * Where no board could be established, that is printed too. Apartado Seis of
 * disposición adicional séptima requires these entities to publish, and the
 * Tribunal found that many did not; an empty section would read as our omission
 * rather than theirs.
 */
export default function FoundationGovernance({
  foundation,
  t,
}: {
  foundation: string;
  t: Dict;
}) {
  const F = t.foundations;
  const gov = governanceFor(foundation);
  if (gov.people.length === 0 && !gov.gap && !gov.rename) return null;

  const kindLabel = (kind: Source["kind"]) =>
    kind === "registry"
      ? F.peopleKindRegistry
      : kind === "official"
        ? F.peopleKindOfficial
        : kind === "foundation"
          ? F.peopleKindFoundation
          : F.peopleKindPress;

  /** A press claim carries its attribution in the sentence, not in a footnote. */
  const attribution = (source: Source) =>
    source.kind === "press"
      ? F.peoplePress.replace("{publisher}", source.publisher).replace("{date}", source.date)
      : `${kindLabel(source.kind)} · ${source.date}`;

  return (
    <section className="mt-14 border-t border-[var(--line)] pt-8">
      <h2 className="display section-tick text-xl">{F.peopleTitle}</h2>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--ink-2)]">
        {F.peopleNote}
      </p>

      {gov.rename && (
        <div className="panel mt-6 p-5">
          <p className="label-mono mb-2 text-[var(--gold-deep)]">{F.peopleRenameTitle}</p>
          <p className="text-sm leading-relaxed text-[var(--ink-2)]">
            {F.peopleRenameBody
              .replace("{report}", gov.rename.reportName)
              .replace("{when}", gov.rename.when)
              .replace("{current}", gov.rename.currentName)}
          </p>
          <p className="label-mono mt-3">
            <a
              className="src"
              href={gov.rename.source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {gov.rename.source.publisher} ↗
            </a>
          </p>
        </div>
      )}

      {gov.gap && (
        <div className="panel mt-6 p-5">
          <p className="label-mono mb-2 text-[var(--red)]">{F.peopleGapTitle}</p>
          <p className="text-sm leading-relaxed text-[var(--ink-2)]">{gov.gap.reason}</p>
        </div>
      )}

      {gov.people.length > 0 && (
        <ul className="mt-6 flex flex-col divide-y divide-[var(--line)]">
          {gov.people.map((p) => (
            <li key={p.person} className="py-4">
              <p className="text-[var(--ink)]">{p.person}</p>

              {p.roles.map((role, i) => (
                <p key={i} className="label-mono mt-1 text-[var(--ink-2)]">
                  {role.role}
                  {role.since && ` · ${F.peopleSince} ${role.since}`}
                  {" · "}
                  <span className="text-[var(--ink-3)]">
                    <a
                      className="src"
                      href={role.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {attribution(role.source)} ↗
                    </a>
                  </span>
                </p>
              ))}

              {p.ties.length > 0 && (
                <>
                  <p className="label-mono mt-3 text-[var(--ink-3)]">{F.peopleAlso}</p>
                  <ul className="mt-1 flex flex-col gap-1">
                    {p.ties.map((tie, i) => (
                      <TieLine key={i} tie={tie} F={F} attribution={attribution} />
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TieLine({
  tie,
  F,
  attribution,
}: {
  tie: Tie;
  F: Dict["foundations"];
  attribution: (s: Source) => string;
}) {
  // Corporate ties are the ones a reader came for, so they carry the accent
  // colour. A role the source puts in the past is labelled as past — a stale
  // role shown as current misrepresents the person.
  const colour =
    tie.kind === "corporate"
      ? "var(--red)"
      : tie.kind === "government" || tie.kind === "public-body"
        ? "var(--gold)"
        : "var(--ink-2)";
  return (
    <li className="text-sm leading-relaxed">
      <span style={{ color: colour }}>{tie.organisation}</span>
      <span className="text-[var(--ink-2)]"> — {tie.role}</span>
      {tie.former && (
        <span className="label-mono ml-2 text-[var(--ink-3)]"> ({F.peopleFormer})</span>
      )}
      <span className="label-mono text-[var(--ink-3)]">
        {" · "}
      </span>
      <span className="label-mono text-[var(--ink-3)]">
        <a className="src" href={tie.source.url} target="_blank" rel="noopener noreferrer">
          {attribution(tie.source)} ↗
        </a>
      </span>
    </li>
  );
}
