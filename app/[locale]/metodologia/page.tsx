import Link from "next/link";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { euro, integer, percent, signedPercent, formatDate } from "@/lib/format";
import { NEWS_SOURCES, EXCLUDED_FEEDS } from "@/lib/news-sources.mjs";
import {
  RECORDED,
  PROSECUTED,
  MENAS_CASE,
  CONVICTION_RATE_PCT,
  CHARGES_CHANGE_PCT,
} from "@/lib/hate-context";
import { ITEM_MAX_AGE_DAYS, SOURCE_STALE_DAYS } from "@/lib/news";

export const revalidate = 3600;

export default async function MetodologiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const agg = await getAggregation();
  const { locale, bcp47, t } = getDict(localeParam);
  const m = t.method;
  const updated = formatDate(agg.generatedAt.slice(0, 10), bcp47);

  return (
    <main className="mx-auto max-w-3xl px-5 pb-8">
      <Link href={`/${locale}`} className="label-mono inline-block py-4 hover:text-[var(--gold)]">
        {t.common.backToPanel}
      </Link>

      <h1 className="display mt-4 text-4xl sm:text-5xl">{m.title}</h1>
      <p className="mt-6 text-lg text-[var(--paper-dim)]">{m.lead}</p>

      <Block title={m.showTitle}>
        <p>
          {m.showP1a}
          <strong>{m.showP1emph}</strong>
          {m.showP1b}
          <strong>
            {integer(agg.parties.length, bcp47)} {t.home.parties.toLowerCase()}
          </strong>
          {m.showP1c}
          <strong>{euro(agg.grandTotal, bcp47)}</strong>
          {m.showP1d}
          {updated}.
        </p>
        <p>{m.showP2}</p>
        <ul>
          <li>{m.showB1}</li>
          <li>{m.showB2}</li>
        </ul>
      </Block>

      <Block title={m.privTitle}>
        <p>{m.privP1}</p>
        <ul>
          <li>{m.privB1}</li>
          <li>{m.privB2}</li>
        </ul>
      </Block>

      <Block title={m.polTitle}>
        <p>{m.polP1}</p>
      </Block>

      <Block title={m.roadTitle}>
        <ul>
          <li>{m.roadB1}</li>
          <li>{m.roadB2}</li>
          <li>{m.roadB3}</li>
        </ul>
      </Block>

      {/* The news registry, listed in full: a reader can check who the portal
          reads, and which feeds it deliberately does not. */}
      <Block title={m.feedsTitle}>
        <p>{m.feedsP1}</p>
        {/* Not label-mono: that class uppercases, and a whole paragraph in
            capitals is hard to read. */}
        <p className="text-sm text-[var(--paper-faint)]">
          {m.feedsGuard(SOURCE_STALE_DAYS, ITEM_MAX_AGE_DAYS)}
        </p>

        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">{m.feedsTitle}</caption>
            <thead>
              <tr className="label-mono text-left text-[var(--paper-faint)]">
                <th scope="col" className="py-2 pr-4 font-normal">{m.feedsSource}</th>
                <th scope="col" className="py-2 pr-4 font-normal">{m.feedsKind}</th>
                <th scope="col" className="py-2 font-normal">{m.feedsTopics}</th>
              </tr>
            </thead>
            <tbody>
              {NEWS_SOURCES.map((s) => (
                <tr key={s.id} className="border-t border-[var(--line)]">
                  <th scope="row" className="py-2.5 pr-4 text-left font-normal">
                    <a className="src" href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.name}
                    </a>
                  </th>
                  <td className="label-mono py-2.5 pr-4 text-[var(--paper-dim)]">
                    {s.kind === "org" ? m.feedsOrg : m.feedsMedia}
                    {s.lang === "en" ? " · EN" : ""}
                  </td>
                  <td className="label-mono py-2.5 text-[var(--paper-faint)]">
                    {s.topics.map((topic) => m.feedsTopic[topic]).join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4">{m.feedsExcludedP}</p>
        <ul>
          {EXCLUDED_FEEDS.map((f) => (
            <li key={f.url}>
              <span className="text-[var(--paper)]">{f.name}</span>{" "}
              <span className="text-[var(--paper-faint)]">— {f.reason}</span>
            </li>
          ))}
        </ul>
      </Block>

      {/* Official hate-crime figures, and the record of what happened when
          campaign material was actually taken to court. Both are here because
          the money and the votes elsewhere on this site mean little without
          them; neither is presented as explaining the other. */}
      <Block title={m.ctxTitle}>
        <p>{m.ctxLead}</p>

        <div className="mt-2 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <p className="label-mono mb-3 text-[var(--paper-dim)]">{m.ctxRecordedTitle}</p>
            <p className="mono text-3xl text-[var(--gold-bright)]">
              {integer(RECORDED.total.value, bcp47)}
            </p>
            <p className="label-mono mt-1 text-[var(--paper-faint)]">
              {RECORDED.total.year} · {signedPercent(RECORDED.changePct / 100, bcp47)}{" "}
              {m.ctxChangeYear}
            </p>
            <ul className="mt-4">
              <li>
                <span className="mono text-[var(--paper)]">
                  {integer(RECORDED.racism.value, bcp47)}
                </span>{" "}
                {m.ctxRacism}
              </li>
              <li>
                <span className="mono text-[var(--paper)]">
                  {integer(RECORDED.sexualOrientationGenderIdentity.value, bcp47)}
                </span>{" "}
                {m.ctxLgtbi}
              </li>
            </ul>
            <p className="mt-4 text-sm text-[var(--paper-faint)]">{m.ctxRecordedNote}</p>
            <p className="label-mono mt-3">
              <a className="src" href={RECORDED.total.url} target="_blank" rel="noopener noreferrer">
                {RECORDED.total.body} ↗
              </a>
            </p>
          </div>

          <div>
            <p className="label-mono mb-3 text-[var(--paper-dim)]">{m.ctxProsecutedTitle}</p>
            <p className="mono text-3xl text-[var(--gold-bright)]">
              {integer(PROSECUTED.convictions.value, bcp47)}
              <span className="text-xl text-[var(--paper-dim)]">
                {" / "}
                {integer(PROSECUTED.sentences.value, bcp47)}
              </span>
            </p>
            <p className="label-mono mt-1 text-[var(--paper-faint)]">
              {PROSECUTED.convictions.year} · {m.ctxConvictions} ·{" "}
              {percent(CONVICTION_RATE_PCT / 100, bcp47)}
            </p>
            <ul className="mt-4">
              <li>
                <span className="mono text-[var(--paper)]">
                  {integer(PROSECUTED.racismCharges.value, bcp47)}
                </span>{" "}
                {m.ctxCharges}
              </li>
              <li>
                <span className="mono text-[var(--paper)]">
                  {signedPercent(CHARGES_CHANGE_PCT / 100, bcp47)}
                </span>{" "}
                {m.ctxChangeYear}
              </li>
            </ul>
            <p className="mt-4 text-sm text-[var(--paper-faint)]">{m.ctxProsecutedNote}</p>
            <p className="label-mono mt-3 flex flex-col gap-1">
              <a className="src" href={PROSECUTED.url} target="_blank" rel="noopener noreferrer">
                {PROSECUTED.body} ↗
              </a>
              <a
                className="src"
                href={PROSECUTED.summaryUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {PROSECUTED.summaryBody} ↗
              </a>
            </p>
          </div>
        </div>

        {/* The negative finding. Stated as prominently as any figure, because it
            is the answer to the question the site invites. */}
        <div className="panel mt-8 p-6">
          <p className="label-mono mb-3 text-[var(--gold)]">{m.ctxFindingTitle}</p>
          <p className="leading-relaxed text-[var(--paper-dim)]">{m.ctxFindingBody}</p>
        </div>

        <p className="label-mono mt-8 mb-2 text-[var(--paper-dim)]">{m.ctxCaseTitle}</p>
        <p className="text-sm leading-relaxed text-[var(--paper-faint)]">{m.ctxCaseBody}</p>
        <p className="label-mono mt-3">
          <a className="src" href={MENAS_CASE.url} target="_blank" rel="noopener noreferrer">
            {MENAS_CASE.appeal.court} ↗
          </a>
        </p>

        <p className="mt-8 text-sm leading-relaxed text-[var(--paper-faint)]">{m.ctxNoTag}</p>
      </Block>

      <Block title={m.srcTitle}>
        <ul>
          <li>
            <a className="src" href="https://www.infosubvenciones.es/bdnstrans/GE/es/concesiones/partidosPoliticos" target="_blank" rel="noopener noreferrer">
              {m.src1}
            </a>
          </li>
          <li>
            <a className="src" href="https://www.tcu.es/es/partidos-politicos/" target="_blank" rel="noopener noreferrer">
              {m.src2}
            </a>
          </li>
          <li>
            <a className="src" href="https://www.boe.es/buscar/act.php?id=BOE-A-2007-13022" target="_blank" rel="noopener noreferrer">
              {m.src3}
            </a>
          </li>
        </ul>
      </Block>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="display section-tick text-2xl">{title}</h2>
      <div className="prose-dossier mt-8 flex flex-col gap-4 text-[var(--paper-dim)] leading-relaxed">
        {children}
      </div>
    </section>
  );
}
