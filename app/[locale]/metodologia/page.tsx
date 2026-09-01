import Link from "next/link";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { euro, integer, formatDate } from "@/lib/format";
import { NEWS_SOURCES, EXCLUDED_FEEDS } from "@/lib/news-sources.mjs";
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
            <thead>
              <tr className="label-mono text-left text-[var(--paper-faint)]">
                <th className="py-2 pr-4 font-normal">{m.feedsSource}</th>
                <th className="py-2 pr-4 font-normal">{m.feedsKind}</th>
                <th className="py-2 font-normal">{m.feedsTopics}</th>
              </tr>
            </thead>
            <tbody>
              {NEWS_SOURCES.map((s) => (
                <tr key={s.id} className="border-t border-[var(--line)]">
                  <td className="py-2.5 pr-4">
                    <a className="src" href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.name}
                    </a>
                  </td>
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
