import Link from "next/link";
import { getVotes, tallyByGroup, nameKey, type Ballot } from "@/lib/votes";
import { getDict } from "@/lib/i18n";
import { integer } from "@/lib/format";

// The deputy search reads the query string.
export const dynamic = "force-dynamic";

const BALLOT_COLOR: Record<string, string> = {
  Sí: "var(--gold)",
  No: "var(--red)",
  Abstención: "var(--paper-faint)",
};

type Dict = ReturnType<typeof getDict>["t"];

function ballotLabel(b: Ballot, t: Dict): string {
  if (b === "Sí") return t.votes.inFavour;
  if (b === "No") return t.votes.against;
  if (b === "Abstención") return t.votes.abstention;
  return t.votes.noVote;
}

export default async function VotacionesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { q } = await searchParams;
  const { locale, bcp47, t } = getDict(localeParam);
  const v = t.votes;

  const data = await getVotes();

  // Deputy lookup: one row per person, showing their ballot on each tracked item.
  // The parliamentary group is stored per ballot, not per person: deputies change
  // group between legislatures, so a single group label would misattribute their
  // affiliation on the other legislature's votes.
  type Cast = { ballot: Ballot; group: string };
  let found: { name: string; ballots: Record<string, Cast> }[] = [];
  if (q?.trim()) {
    const needle = nameKey(q).split(" ").filter(Boolean);
    const people = new Map<string, { name: string; ballots: Record<string, Cast> }>();
    for (const vote of data.votes) {
      for (const dv of vote.votes) {
        const key = nameKey(dv.deputy);
        if (!needle.every((n) => key.includes(n))) continue;
        const rec = people.get(key) ?? { name: dv.deputy, ballots: {} };
        rec.ballots[vote.id] = { ballot: dv.vote, group: dv.group };
        people.set(key, rec);
      }
    }
    found = [...people.values()].sort((a, b) => a.name.localeCompare(b.name, "es")).slice(0, 40);
  }

  return (
    <main className="mx-auto max-w-4xl px-5 pb-8">
      <h1 className="display mt-6 text-4xl sm:text-5xl">{v.title}</h1>
      <p className="mt-5 max-w-2xl text-[var(--paper-dim)]">{v.intro}</p>

      {/* Deputy search */}
      <form action={`/${locale}/votaciones`} method="get" className="panel mt-8 flex flex-wrap gap-3 p-4">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder={v.searchPlaceholder}
          aria-label={v.searchLabel}
          className="mono min-w-0 flex-1 rounded border border-[var(--line-control)] bg-[var(--ink-3)] px-3 py-2 text-sm text-[var(--paper)] outline-none focus:border-[var(--gold)]"
        />
        <button
          type="submit"
          className="label-mono rounded border border-[var(--gold)] bg-[var(--gold)] px-4 py-2 text-[var(--ink)]"
        >
          {v.searchLabel}
        </button>
      </form>

      {q?.trim() && (
        <section className="mt-6">
          {found.length === 0 ? (
            <p className="label-mono py-4 text-[var(--paper-faint)]">{v.noMatch}</p>
          ) : (
            <>
              <p className="label-mono mb-3 text-[var(--paper-faint)]">
                {integer(found.length, bcp47)} {v.results}
              </p>
              <div className="flex flex-col">
                {found.map((p) => (
                  <div key={p.name}>
                    <div className="py-4">
                      <p className="text-[var(--paper)]">{p.name}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {data.votes.map((vote) => {
                          const cast = p.ballots[vote.id];
                          if (!cast) return null;
                          const color = BALLOT_COLOR[cast.ballot] ?? "var(--paper-faint)";
                          return (
                            <span
                              key={vote.id}
                              className="label-mono rounded border px-2 py-1"
                              style={{ color, borderColor: `${color}55` }}
                              title={vote.law}
                            >
                              {vote.law}: {ballotLabel(cast.ballot, t)}
                              <span className="ml-1.5 text-[var(--paper-faint)]">({cast.group})</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <hr className="hairline" />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* One block per tracked law */}
      {data.votes.map((vote) => {
        const groups = tallyByGroup(vote);
        const tot = vote.totals;
        const width = (n: number) => `${(n / Math.max(1, tot.presentes)) * 100}%`;
        return (
          <section key={vote.id} className="mt-14">
            <p className="eyebrow">{vote.topicLabel}</p>
            <h2 className="display section-tick mt-2 text-2xl">{vote.law}</h2>

            <p className="label-mono mt-5 flex flex-wrap items-center gap-2">
              <span
                className="rounded border px-2 py-1"
                style={{
                  color: vote.binding ? "var(--gold)" : "var(--paper-faint)",
                  borderColor: vote.binding ? "var(--gold)55" : "var(--line-strong)",
                }}
              >
                {v.kinds[vote.kind as keyof typeof v.kinds] ?? vote.kindLabel}
              </span>
              {!vote.binding && (
                <span className="text-[var(--paper-faint)]">· {v.nonBinding}</span>
              )}
              <span className="text-[var(--paper-faint)]">
                · {v.legislature} {vote.legislature}
              </span>
            </p>

            <p className="label-mono mt-6 flex flex-wrap gap-4">
              {vote.lawUrl && (
                <a className="src" href={vote.lawUrl} target="_blank" rel="noopener noreferrer">
                  {v.lawText}
                </a>
              )}
              <a className="src" href={vote.sourceUrl} target="_blank" rel="noopener noreferrer">
                {v.officialRecord}
              </a>
              <span className="text-[var(--paper-faint)]">
                {v.session} {vote.session} · {vote.date}
              </span>
            </p>

            {/* Overall result */}
            <div className="mt-6 flex h-6 overflow-hidden rounded-sm bg-[var(--ink-3)]">
              <div style={{ width: width(tot.afavor), backgroundColor: "var(--gold)" }} />
              <div style={{ width: width(tot.enContra), backgroundColor: "var(--red)" }} />
              <div style={{ width: width(tot.abstenciones), backgroundColor: "var(--paper-faint)" }} />
            </div>
            <div className="label-mono mt-3 flex flex-wrap gap-x-6 gap-y-1">
              <span style={{ color: "var(--gold)" }}>
                {v.inFavour} {integer(tot.afavor, bcp47)}
              </span>
              <span style={{ color: "var(--red)" }}>
                {v.against} {integer(tot.enContra, bcp47)}
              </span>
              <span className="text-[var(--paper-faint)]">
                {v.abstention} {integer(tot.abstenciones, bcp47)}
              </span>
              <span className="text-[var(--paper-faint)]">
                {v.present} {integer(tot.presentes, bcp47)}
              </span>
            </div>

            {/* Per-group breakdown */}
            <h3 className="label-mono mt-8">{v.byGroup}</h3>
            <div className="mt-3 flex flex-col">
              {groups.map((g) => {
                const total = g.si + g.no + g.abst + g.other;
                return (
                  <div key={g.group}>
                    <div className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 py-2.5">
                      <span className="mono text-sm text-[var(--paper)]">{g.group}</span>
                      <span className="flex h-3 overflow-hidden rounded-sm bg-[var(--ink-3)]">
                        {g.si > 0 && (
                          <span style={{ width: `${(g.si / total) * 100}%`, backgroundColor: "var(--gold)" }} />
                        )}
                        {g.no > 0 && (
                          <span style={{ width: `${(g.no / total) * 100}%`, backgroundColor: "var(--red)" }} />
                        )}
                        {g.abst > 0 && (
                          <span
                            style={{
                              width: `${(g.abst / total) * 100}%`,
                              backgroundColor: "var(--paper-faint)",
                            }}
                          />
                        )}
                      </span>
                      <span className="mono text-xs text-[var(--paper-faint)]">
                        {g.si}/{g.no}/{g.abst}
                      </span>
                    </div>
                    <hr className="hairline" />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="label-mono mt-12 text-[var(--paper-faint)]">{v.caveat}</p>
      <p className="label-mono mt-2 text-[var(--paper-faint)]">
        {data.source.name} ·{" "}
        <a className="src" href={data.source.url} target="_blank" rel="noopener noreferrer">
          congreso.es
        </a>
      </p>
      <p className="label-mono mt-6">
        <Link href={`/${locale}`} className="hover:text-[var(--gold)]">
          {t.common.backToPanel}
        </Link>
      </p>
    </main>
  );
}
