import Link from "next/link";
import { getDict, relativeTime } from "@/lib/i18n";
import { fetchTopicNews } from "@/lib/news";
import { NEWS_SOURCES } from "@/lib/news-sources.mjs";
import ArticleCard from "@/components/ArticleCard";

// Half an hour, matching /api/news. The feeds themselves publish far less
// often than that, and the registry's own staleness guards are in lib/news.
export const revalidate = 1800;

/**
 * The rights section: what the organisations themselves are publishing.
 *
 * Every other page here reports on the state — its subsidies, its audits, its
 * recorded votes. This one hands the microphone to the organisations whose
 * people those votes are about, and the ordering is the argument: the eight
 * LGBTQ+ NGOs in the registry come first, under their own names, and the press
 * follows separately. A reader can tell at a glance whether a claim comes from
 * an organisation or from a newspaper, which is the same rule the foundation
 * people layer applies to sources.
 *
 * Rendered on the server rather than fetched by the client, unlike the portal's
 * NewsFeed. A section that exists to give these organisations a platform should
 * not be the one part of the site that needs JavaScript to appear.
 */
export default async function DerechosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale, t } = getDict(localeParam);
  const r = t.rights;

  const prefer = locale === "en" ? "en" : "es";
  const { items, dropped } = await fetchTopicNews(["lgtbi"], 24, prefer);

  const orgItems = items.filter((i) => i.sourceKind === "org");
  const mediaItems = items.filter((i) => i.sourceKind !== "org");

  const orgs = NEWS_SOURCES.filter((s) => s.topics.includes("lgtbi") && s.kind === "org");
  const media = NEWS_SOURCES.filter((s) => s.topics.includes("lgtbi") && s.kind === "media");

  const ago = (iso: string) => relativeTime(iso, locale);

  return (
    <main className="mx-auto max-w-6xl pb-8">
      <Link href={`/${locale}`} className="label-mono inline-block py-4 hover:text-[var(--gold-deep)]">
        {t.common.backToPanel}
      </Link>

      <header className="mt-4 max-w-3xl">
        <p className="eyebrow" style={{ color: "var(--verd-text)" }}>
          {r.eyebrow}
        </p>
        <h1 className="display mt-4 text-4xl leading-[0.95] sm:text-6xl">
          {r.titlePre}
          <span className="italic" style={{ color: "var(--verd-text)" }}>
            {r.titleEmph}
          </span>
          {r.titlePost}
        </h1>
        <p className="mt-6 text-lg text-[var(--ink-2)]">{r.intro}</p>
      </header>

      {/* The organisations' own publications, first and largest. */}
      <section className="mt-16">
        <h2 className="display section-tick text-2xl">{r.orgsTitle}</h2>
        <p className="mt-6 max-w-2xl text-[var(--ink-2)]">{r.orgsNote}</p>

        {orgItems.length === 0 ? (
          <p className="panel mt-8 p-6 text-[var(--ink-2)]">{r.empty}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {orgItems.map((item) => (
              <ArticleCard
                key={item.link}
                item={item}
                ago={ago(item.date)}
                orgLabel={r.kindOrg}
                mediaLabel={r.kindMedia}
              />
            ))}
          </div>
        )}
      </section>

      {mediaItems.length > 0 && (
        <section className="mt-20">
          <h2 className="display section-tick text-2xl">{r.mediaTitle}</h2>
          <p className="mt-6 max-w-2xl text-[var(--ink-2)]">{r.mediaNote}</p>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mediaItems.map((item) => (
              <ArticleCard
                key={item.link}
                item={item}
                ago={ago(item.date)}
                orgLabel={r.kindOrg}
                mediaLabel={r.kindMedia}
              />
            ))}
          </div>
        </section>
      )}

      {/* The registry itself, so a reader can go straight to a source rather
          than only reading what it happened to publish this fortnight. */}
      <section className="mt-20">
        <h2 className="display section-tick text-2xl">{r.directoryTitle}</h2>
        <p className="mt-6 max-w-2xl text-[var(--ink-2)]">{r.directoryNote}</p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="panel panel-org p-6">
            <p className="label-mono mb-4" style={{ color: "var(--verd-text)" }}>
              {r.kindOrg}
            </p>
            <ul className="flex flex-col gap-3">
              {orgs.map((s) => (
                <li key={s.id}>
                  <a
                    className="src"
                    href={new URL(s.url).origin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.name} ↗
                  </a>
                  {s.lang === "en" && (
                    <span className="label-mono ml-2 text-[var(--ink-3)]">EN</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-6">
            <p className="label-mono mb-4 text-[var(--gold-deep)]">{r.kindMedia}</p>
            <ul className="flex flex-col gap-3">
              {media.map((s) => (
                <li key={s.id}>
                  <a
                    className="src"
                    href={new URL(s.url).origin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* A feed that failed is named. The methodology page lists the ones that
          were tested and rejected; this reports the ones that broke today. */}
      {dropped.length > 0 && (
        <p className="label-mono mt-10 text-[var(--ink-3)]">
          {r.droppedNote} {dropped.map((d) => d.name).join(" · ")}
        </p>
      )}

      <p className="mt-12 max-w-3xl text-sm leading-relaxed text-[var(--ink-3)]">
        {r.caveat}
      </p>

      <p className="label-mono mt-6">
        <Link className="src" href={`/${locale}/metodologia`}>
          {r.methodLink}
        </Link>
      </p>
    </main>
  );
}
