import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { MIN_QUERY, search, type ResultKind } from "@/lib/search";
import { fill, integer } from "@/lib/format";
import SearchBox from "@/components/SearchBox";

// The query is a search param, so the page is rendered per request. Nothing
// here is cacheable by URL in any useful way — the register is the only large
// input and it is already cached in the module.
export const dynamic = "force-dynamic";

/**
 * One search across everything the site publishes.
 *
 * A plain form GET, so it works without JavaScript, the URL is shareable, and
 * the browser announces the change of context by navigating — the same
 * mechanism `/politicos` already relies on. There is no typeahead: an index of
 * the 6,670-row register shipped to every visitor would cost every reader to
 * save the few who search.
 *
 * Two things the page states rather than leaving a reader to infer. It says
 * what is searched — names and titles, not the text of the reports behind them
 * — because a search that finds nothing otherwise reads as proof the thing is
 * absent. And every group prints how many matches exist beyond the ones shown,
 * so a truncated list is visibly truncated.
 */
export default async function BuscarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { q } = await searchParams;
  const { locale, bcp47, t } = getDict(localeParam);
  const S = t.search;

  const query = (q ?? "").trim();
  const outcome = await search(query, locale);

  const kindLabel = (k: ResultKind) => S.kinds[k as keyof typeof S.kinds];

  return (
    <main className="mx-auto max-w-4xl pb-16">
      <p className="eyebrow pt-8">{S.eyebrow}</p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">{S.title}</h1>

      <SearchBox locale={locale} t={S} defaultValue={query} autoFocus size="lg" />

      <p className="mt-4 max-w-[68ch] text-sm leading-relaxed text-[var(--ink-3)]">{S.scope}</p>

      {query.length === 0 ? null : query.length < MIN_QUERY ? (
        // Not "no results": the query was never run. Saying nothing matched a
        // single letter would be a claim about the data rather than about the
        // search.
        <p className="mt-12 text-lg text-[var(--ink-2)]">
          {fill(S.tooShort, { min: integer(MIN_QUERY, bcp47) })}
        </p>
      ) : outcome.total === 0 ? (
        <section className="mt-12">
          <p className="text-lg text-[var(--ink-2)]">{fill(S.empty, { query })}</p>
          <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-[var(--ink-3)]">
            {S.emptyHint}
          </p>
        </section>
      ) : (
        <>
          <p className="label-mono mt-8" role="status">
            {fill(S.count, { total: integer(outcome.total, bcp47), query })}
          </p>

          <div className="mt-2 flex flex-col">
            {outcome.groups.map((group) => (
              <section key={group.kind} className="mt-8">
                <h2 className="display section-tick text-xl">{kindLabel(group.kind)}</h2>
                <ul className="mt-4 flex flex-col">
                  {group.results.map((r) => (
                    <li key={r.href + r.title} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                      <Link
                        href={r.href}
                        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3 hover:text-[var(--gold-deep)]"
                      >
                        <span>{r.title}</span>
                        {r.detail && (
                          <span
                            className="label-mono text-[var(--ink-3)]"
                            style={{ textTransform: "none", letterSpacing: "0.02em" }}
                          >
                            {r.detail}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* A truncated list says how much it truncated. Otherwise the
                    eight rows shown read as the whole answer. */}
                {group.more > 0 && (
                  <p className="label-mono mt-3 text-[var(--ink-3)]">
                    {fill(S.more, { more: integer(group.more, bcp47) })}
                  </p>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
