import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/lib/people";
import { getDict } from "@/lib/i18n";
import { euro, euroCompact, integer, percent } from "@/lib/format";
import Avatar from "@/components/Avatar";
import PhotoCredit from "@/components/PhotoCredit";
import NewsFeed from "@/components/NewsFeed";
import BlueskyFeed from "@/components/BlueskyFeed";
import type { Ballot } from "@/lib/votes";

export const dynamic = "force-dynamic";

const BALLOT_COLOR: Record<string, string> = {
  Sí: "var(--gold)",
  No: "var(--red)",
  Abstención: "var(--paper-faint)",
};

export default async function PoliticoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) notFound();

  const { person, party, donations, portrait, social, record } = profile;
  const { locale, bcp47, t } = getDict(localeParam);
  const P = t.people;

  const ballotLabel = (b: Ballot) =>
    b === "Sí"
      ? t.votes.inFavour
      : b === "No"
        ? t.votes.against
        : b === "Abstención"
          ? t.votes.abstention
          : t.votes.noVote;

  // Group the record by topic so the rights-related votes read as one story.
  const byTopic = new Map<string, typeof record>();
  for (const r of record) {
    const list = byTopic.get(r.vote.topicLabel) ?? [];
    list.push(r);
    byTopic.set(r.vote.topicLabel, list);
  }

  return (
    <main className="mx-auto max-w-4xl px-5 pb-8">
      <Link href={`/${locale}/politicos`} className="label-mono inline-block py-4 hover:text-[var(--gold)]">
        {P.backToPeople}
      </Link>

      {/* Identity card */}
      <div className="panel mt-4 flex flex-wrap items-start gap-6 p-6">
        <div>
          <Avatar name={person.name} portrait={portrait} color={party?.color} size={104} />
          {portrait && <PhotoCredit portrait={portrait} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{person.role}</p>
          <h1 className="display mt-2 text-3xl sm:text-4xl">{person.name}</h1>
          <p className="label-mono mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {party ? (
              <Link href={`/${locale}/party/${party.nif}`} className="text-[var(--gold)] hover:underline">
                {party.displayName}
              </Link>
            ) : (
              <span className="text-[var(--paper-dim)]">{person.partyShort}</span>
            )}
            {(person.municipality || person.region) && (
              <span className="text-[var(--paper-faint)]">
                {person.municipality ?? person.region}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Money: their pay, and their party's funding — side by side, labelled */}
      <section className="mt-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="panel p-5">
            <p className="label-mono mb-2">{P.pay}</p>
            <p className="mono text-2xl text-[var(--paper)]">{euro(person.gross, bcp47)}</p>
            <p className="label-mono mt-1 text-[var(--paper-faint)]">{t.salaries.annual}</p>
          </div>
          {party && (
            <Link
              href={`/${locale}/party/${party.nif}`}
              className="panel group p-5 transition-colors hover:border-[var(--line-strong)]"
            >
              <p className="label-mono mb-2">{P.partyFunding}</p>
              <p className="mono text-2xl text-[var(--gold-bright)]">
                {euroCompact(party.total, bcp47)}
              </p>
              <p className="label-mono mt-1 text-[var(--paper-faint)]">
                {percent(party.share, bcp47)} {t.party.ofNational}
                {donations && ` · ${euroCompact(donations.total.amount, bcp47)} ${t.party.privateTitle.toLowerCase()}`}
              </p>
            </Link>
          )}
        </div>
        <p className="label-mono mt-4 text-[var(--paper-faint)]">{P.juxtaposition}</p>
      </section>

      {/* Recorded votes on rights legislation */}
      <section className="mt-12">
        <h2 className="display section-tick text-xl">{P.affects}</h2>
        <p className="label-mono mt-4 text-[var(--paper-faint)]">{P.affectsNote}</p>

        {record.length === 0 ? (
          <div className="panel mt-8 p-5">
            <p className="text-[var(--paper-dim)]">{P.noRecord}</p>
            <p className="label-mono mt-2 text-[var(--paper-faint)]">{P.noRecordExplain}</p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-6">
            {[...byTopic.entries()].map(([topic, items]) => (
              <div key={topic}>
                <p className="label-mono mb-3 text-[var(--gold)]">{topic}</p>
                <div className="flex flex-col">
                  {items.map(({ vote, ballot, group }) => {
                    const color = BALLOT_COLOR[ballot] ?? "var(--paper-faint)";
                    return (
                      <div key={vote.id}>
                        <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm text-[var(--paper)]">{vote.law}</p>
                            <p className="label-mono mt-1 flex flex-wrap gap-x-3 text-[var(--paper-faint)]">
                              <span>
                                {t.votes.kinds[vote.kind as keyof typeof t.votes.kinds] ??
                                  vote.kindLabel}
                              </span>
                              {!vote.binding && <span>· {t.votes.nonBinding}</span>}
                              <span>· {group}</span>
                              <span>· {vote.date}</span>
                              <a
                                className="src"
                                href={vote.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {t.votes.officialRecord}
                              </a>
                            </p>
                          </div>
                          <span
                            className="label-mono shrink-0 rounded border px-2 py-1"
                            style={{ color, borderColor: `${color}55` }}
                          >
                            {ballotLabel(ballot)}
                          </span>
                        </div>
                        <hr className="hairline" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Social */}
      {social?.bluesky && (
        <section className="mt-14">
          <div className="flex items-end justify-between">
            <h2 className="display section-tick text-xl">{t.politician.onBluesky}</h2>
            <a
              href={`https://bsky.app/profile/${social.bluesky}`}
              target="_blank"
              rel="noopener noreferrer"
              className="label-mono hover:text-[var(--gold)]"
            >
              @{social.bluesky} ↗
            </a>
          </div>
          <BlueskyFeed actor={social.bluesky} locale={locale} />
        </section>
      )}

      {/* News */}
      <section className="mt-14">
        <h2 className="display section-tick text-xl">{t.party.inNews}</h2>
        <p className="label-mono mt-3 text-[var(--paper-faint)]">{t.party.recentHeadlines}</p>
        <NewsFeed query={person.name} locale={locale} />
      </section>
    </main>
  );
}
