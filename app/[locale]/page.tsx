import Link from "next/link";
import { getAggregation } from "@/lib/data";
import { getSalaries } from "@/lib/salaries";
import { getVotes } from "@/lib/votes";
import { DONATIONS_SOURCE } from "@/lib/donations";
import { getDict } from "@/lib/i18n";
import { euro, euroCompact, integer } from "@/lib/format";
import StanceByGroup from "@/components/StanceByGroup";
import NewsFeed from "@/components/NewsFeed";

export const revalidate = 3600;

// Rights-focused news: kept as a query so the source stays auditable, and it is
// the same feed component used on party and politician pages.
const RIGHTS_QUERY = "LGTBI trans derechos Congreso España";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale, bcp47, t } = getDict(localeParam);
  const P = t.portal;

  const [agg, salaries, votes] = await Promise.all([getAggregation(), getSalaries(), getVotes()]);

  // Rights-affecting items lead the stance section; housing follows.
  const order = ["lgtbi", "aborto", "vivienda"];
  const tracked = [...votes.votes].sort(
    (a, b) => order.indexOf(a.topic) - order.indexOf(b.topic) || (b.session ?? 0) - (a.session ?? 0),
  );

  const cards = [
    { href: `/${locale}/financiacion`, label: t.nav.funding, note: P.exploreMoney },
    { href: `/${locale}/politicos`, label: t.nav.people, note: P.explorePeople },
    { href: `/${locale}/votaciones`, label: t.nav.votes, note: P.exploreVotes },
    { href: `/${locale}/metodologia`, label: t.nav.methodology, note: P.exploreMethod },
  ];

  return (
    <main className="mx-auto max-w-5xl px-5 pb-8">
      {/* Masthead */}
      <section className="pt-6 sm:pt-12">
        <p className="eyebrow">{P.eyebrow}</p>
        <h1 className="display mt-4 max-w-3xl text-4xl leading-[0.95] sm:text-6xl">
          {P.titlePre}
          <span className="italic text-[var(--gold)]">{P.titleEmph}</span>
          {P.titlePost}
        </h1>
        <p className="mt-6 max-w-2xl text-[var(--paper-dim)]">{P.lead}</p>

        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          <Stat label={P.statPublic} value={euroCompact(agg.grandTotal, bcp47)} accent />
          <Stat
            label={P.statPrivate}
            value={euroCompact(DONATIONS_SOURCE.grandTotal, bcp47)}
            sub={String(DONATIONS_SOURCE.year)}
          />
          <Stat label={P.statPeople} value={integer(salaries.count, bcp47)} />
          <Stat label={P.statVotes} value={integer(votes.count, bcp47)} />
        </dl>

        <p className="label-mono mt-8 max-w-2xl text-[var(--paper-faint)]">{P.linkFraming}</p>
      </section>

      {/* Stance: how each group voted on the tracked items */}
      <section className="mt-16">
        <h2 className="display section-tick text-2xl">{P.stanceTitle}</h2>
        <p className="label-mono mt-4 max-w-2xl text-[var(--paper-faint)]">{P.stanceNote}</p>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {tracked.map((vote) => (
            <StanceByGroup key={vote.id} vote={vote} t={t} />
          ))}
        </div>

        <p className="label-mono mt-6">
          <Link href={`/${locale}/votaciones`} className="src">
            {t.nav.votes} →
          </Link>
        </p>
      </section>

      {/* Rights news */}
      <section className="mt-16">
        <h2 className="display section-tick text-2xl">{P.newsTitle}</h2>
        <p className="label-mono mt-4 text-[var(--paper-faint)]">{P.newsNote}</p>
        <NewsFeed query={RIGHTS_QUERY} locale={locale} />
      </section>

      {/* Navigation */}
      <section className="mt-16">
        <h2 className="display section-tick text-2xl">{P.exploreTitle}</h2>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="panel group p-5 transition-colors hover:border-[var(--line-strong)]"
            >
              <p className="text-lg group-hover:text-[var(--gold-bright)]">{c.label}</p>
              <p className="label-mono mt-2 text-[var(--paper-dim)]">{c.note}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="label-mono mb-2">{label}</dt>
      <dd
        className="mono text-xl sm:text-2xl"
        style={{ color: accent ? "var(--gold-bright)" : "var(--paper)" }}
      >
        {value}
      </dd>
      {sub && <p className="label-mono mt-1 text-[var(--paper-faint)]">{sub}</p>}
    </div>
  );
}
