import Link from "next/link";
import type { KeyVote } from "@/lib/votes";
import { tallyByGroup } from "@/lib/votes";
import { groupInfo, groupParty, GROUPS_SOURCE } from "@/lib/groups";
import type { Dict, Locale } from "@/lib/i18n";

/**
 * How each parliamentary group voted, as a table rather than a row of coloured
 * bars.
 *
 * The previous version printed the raw Congreso group code and a "116/0/1"
 * triplet, so the codes meant nothing to a reader and the numbers' meaning was
 * carried only by the colour of the bars. Here the group is named, the three
 * counts sit in their own labelled columns, and the bar is decoration that
 * repeats what the numbers already say.
 *
 * The funding link is the point of the last column, and it is deliberately
 * absent for coalition groups: a group is not a party, and pointing a
 * multi-party group at one party's money would misattribute it. See lib/groups.ts.
 */
export default function GroupBreakdown({
  vote,
  t,
  locale,
}: {
  vote: KeyVote;
  t: Dict;
  locale: Locale;
}) {
  const groups = tallyByGroup(vote);
  const v = t.votes;

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        {/* Not label-mono: it uppercases, and this is a sentence. */}
        <caption className="max-w-3xl pb-4 text-left text-xs leading-relaxed text-[var(--paper-dim)]">
          {v.byGroupCaption}
        </caption>
        <thead>
          <tr className="label-mono text-left text-[var(--paper-faint)]">
            <th scope="col" className="py-2 pr-4 font-normal">
              {v.group}
            </th>
            <th scope="col" className="w-1/3 py-2 pr-4 font-normal">
              {v.distribution}
            </th>
            {/* nowrap: "En contra" at label-mono's 0.14em tracking wraps to two
                lines and squeezes the numeric columns. */}
            <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-normal">
              {v.inFavour}
            </th>
            <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-normal">
              {v.against}
            </th>
            <th scope="col" className="whitespace-nowrap py-2 pr-4 text-right font-normal">
              {v.abstention}
            </th>
            <th scope="col" className="py-2 font-normal">
              {v.funding}
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const info = groupInfo(vote.legislature, g.group);
            const party = groupParty(info);
            const total = g.si + g.no + g.abst + g.other || 1;
            const seg = (n: number) => `${(n / total) * 100}%`;

            return (
              <tr key={g.group} className="border-t border-[var(--line)] align-middle">
                {/* Identity: the party's own colour as a rule, the group's name,
                    and the raw code kept visible so a reader can match it to the
                    official record. */}
                <th scope="row" className="py-3 pr-4 text-left font-normal">
                  <span className="flex items-baseline gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-1 h-3.5 w-[3px] shrink-0 rounded-full"
                      style={{ backgroundColor: party ? party.color : "var(--line-control)" }}
                    />
                    <span className="min-w-0">
                      <span className="block text-[var(--paper)]">
                        {info ? info.short : g.group}
                      </span>
                      <span className="label-mono block text-[var(--paper-faint)]">
                        {info ? info.name : v.groupUnknown}
                      </span>
                      {info && (
                        <span className="mono block text-xs text-[var(--paper-faint)]">
                          {g.group}
                        </span>
                      )}
                    </span>
                  </span>
                </th>

                {/* Decoration only: every number in it is in the columns to the right. */}
                <td className="py-3 pr-4">
                  <span
                    aria-hidden="true"
                    className="flex h-3 overflow-hidden rounded-sm bg-[var(--ink-3)]"
                  >
                    {g.si > 0 && (
                      <span style={{ width: seg(g.si), backgroundColor: "var(--gold)" }} />
                    )}
                    {g.no > 0 && (
                      <span style={{ width: seg(g.no), backgroundColor: "var(--red)" }} />
                    )}
                    {g.abst > 0 && (
                      <span style={{ width: seg(g.abst), backgroundColor: "var(--paper-dim)" }} />
                    )}
                  </span>
                </td>

                <td className="mono py-3 pr-3 text-right" style={{ color: "var(--gold)" }}>
                  {g.si || "—"}
                </td>
                <td className="mono py-3 pr-3 text-right" style={{ color: "var(--red)" }}>
                  {g.no || "—"}
                </td>
                <td className="mono py-3 pr-4 text-right text-[var(--paper-dim)]">
                  {g.abst || "—"}
                </td>

                <td className="label-mono py-3">
                  {party ? (
                    <Link
                      href={`/${locale}/party/${party.nif}`}
                      className="src whitespace-nowrap"
                    >
                      {party.shortName} →
                    </Link>
                  ) : (
                    <span className="text-[var(--paper-faint)]">
                      {v.severalParties}
                      {info?.parties && (
                        <span className="block normal-case tracking-normal">
                          {info.parties.join(" · ")}
                        </span>
                      )}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Not label-mono: it uppercases, and this is prose. */}
      <p className="mt-4 max-w-3xl text-xs leading-relaxed text-[var(--paper-faint)]">
        {v.groupNote}{" "}
        <a className="src" href={GROUPS_SOURCE} target="_blank" rel="noopener noreferrer">
          {v.groupSource}
        </a>
      </p>
    </div>
  );
}
