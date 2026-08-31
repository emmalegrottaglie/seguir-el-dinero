import type { KeyVote } from "@/lib/votes";
import { tallyByGroup } from "@/lib/votes";
import type { Dict } from "@/lib/i18n";

/**
 * Which parliamentary groups backed, opposed or abstained on one vote.
 *
 * A group's position is the majority of its own named ballots — counted, not
 * assigned — so a group appears under "against" only because most of its
 * deputies are recorded voting No. Individual deputies who broke with their
 * group are visible on their own profile, which is the authoritative view.
 */
export default function StanceByGroup({ vote, t }: { vote: KeyVote; t: Dict }) {
  const groups = tallyByGroup(vote);

  const bucket = { si: [] as string[], no: [] as string[], abst: [] as string[] };
  for (const g of groups) {
    const max = Math.max(g.si, g.no, g.abst);
    if (max === 0) continue;
    if (g.si === max) bucket.si.push(g.group);
    else if (g.no === max) bucket.no.push(g.group);
    else bucket.abst.push(g.group);
  }

  const tot = vote.totals;
  const width = (n: number) => `${(n / Math.max(1, tot.presentes)) * 100}%`;

  const row = (label: string, names: string[], color: string) =>
    names.length > 0 && (
      <p className="label-mono flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span style={{ color }}>{label}</span>
        <span className="text-[var(--paper-dim)]">{names.join(" · ")}</span>
      </p>
    );

  return (
    <div className="panel p-5">
      <p className="eyebrow">{vote.topicLabel}</p>
      <p className="mt-2 text-[var(--paper)]">{vote.law}</p>

      {(vote.expediente || vote.title) && (
        <p className="label-mono mt-2 line-clamp-2 text-[var(--paper-dim)]">
          {vote.expediente || vote.title}
        </p>
      )}

      <p className="label-mono mt-2 flex flex-wrap gap-x-3 text-[var(--paper-faint)]">
        <span>{t.votes.kinds[vote.kind as keyof typeof t.votes.kinds] ?? vote.kindLabel}</span>
        {!vote.binding && <span>· {t.votes.nonBinding}</span>}
        <span>· {vote.date}</span>
        <a className="src" href={vote.sourceUrl} target="_blank" rel="noopener noreferrer">
          {t.votes.officialRecord}
        </a>
      </p>

      <div className="mt-4 flex h-3 overflow-hidden rounded-sm bg-[var(--ink-3)]">
        <div style={{ width: width(tot.afavor), backgroundColor: "var(--gold)" }} />
        <div style={{ width: width(tot.enContra), backgroundColor: "var(--red)" }} />
        <div style={{ width: width(tot.abstenciones), backgroundColor: "var(--paper-faint)" }} />
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {row(t.portal.inFavourGroups, bucket.si, "var(--gold)")}
        {row(t.portal.againstGroups, bucket.no, "var(--red)")}
        {row(t.portal.abstainGroups, bucket.abst, "var(--paper-faint)")}
      </div>
    </div>
  );
}
