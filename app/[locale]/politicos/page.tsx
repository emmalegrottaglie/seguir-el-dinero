import Link from "next/link";
import { querySalaries } from "@/lib/salaries";
import { getBadges, featuredSlugs, getProfile } from "@/lib/people";
import { getDict } from "@/lib/i18n";
import { euro, euroCompact, integer } from "@/lib/format";
import Avatar from "@/components/Avatar";

// Search and paging come from the query string.
export const dynamic = "force-dynamic";

export default async function PoliticosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; party?: string; page?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { q, party, page } = await searchParams;
  const { locale, bcp47, t } = getDict(localeParam);
  const P = t.people;
  const S = t.salaries;

  const { results, total, page: current, pages, parties } = await querySalaries({
    q,
    party,
    page: Number(page) || 1,
  });
  const badges = await getBadges();

  // Lead section: only profiles that actually carry a voting record. Hidden once
  // the visitor is searching, so it never competes with their own query.
  const featured = q || party ? [] : await featuredSlugs(9);
  const featuredProfiles = (await Promise.all(featured.map((s) => getProfile(s)))).flatMap((p) =>
    p ? [p] : [],
  );

  const href = (next: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { q, party, page: current, ...next };
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "" && !(k === "page" && v === 1)) sp.set(k, String(v));
    }
    const qs = sp.toString();
    return `/${locale}/politicos${qs ? `?${qs}` : ""}`;
  };

  return (
    <main className="mx-auto max-w-5xl px-5 pb-8">
      <h1 className="display mt-6 text-4xl sm:text-5xl">{P.title}</h1>
      <p className="mt-5 max-w-2xl text-[var(--paper-dim)]">{P.intro}</p>

      {/* Featured: rich profiles */}
      {featuredProfiles.length > 0 && (
        <section className="mt-12">
          <h2 className="display section-tick text-2xl">{P.featured}</h2>
          <p className="label-mono mt-4 text-[var(--paper-faint)]">{P.featuredNote}</p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProfiles.map(({ person, party: pty, portrait, social, record }) => (
              <Link
                key={person.slug}
                href={`/${locale}/politico/${person.slug}`}
                className="panel group flex flex-col gap-3 p-5 transition-colors hover:border-[var(--line-strong)]"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={person.name} portrait={portrait} color={pty?.color} size={48} />
                  <div className="min-w-0">
                    <p className="truncate group-hover:text-[var(--gold-bright)]">{person.name}</p>
                    <p className="label-mono mt-1 truncate text-[var(--paper-dim)]">
                      {person.partyShort}
                    </p>
                  </div>
                </div>
                <p className="label-mono truncate text-[var(--paper-faint)]">{person.role}</p>
                <div className="mono flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span className="text-[var(--paper)]">{euroCompact(person.gross, bcp47)}</span>
                  <span className="text-[var(--gold)]">
                    {integer(record.length, bcp47)} {P.hasRecord}
                  </span>
                  {social && <span className="text-[var(--paper-faint)]">{P.hasSocial}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Full register */}
      <section className="mt-14">
        <h2 className="display section-tick text-2xl">{P.directory}</h2>

        <form action={`/${locale}/politicos`} method="get" className="panel mt-8 flex flex-wrap gap-3 p-4">
          {party && <input type="hidden" name="party" value={party} />}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder={S.searchPlaceholder}
            aria-label={S.search}
            className="mono min-w-0 flex-1 rounded border border-[var(--line-strong)] bg-[var(--ink-3)] px-3 py-2 text-sm text-[var(--paper)] outline-none focus:border-[var(--gold)]"
          />
          <button
            type="submit"
            className="label-mono rounded border border-[var(--gold)] bg-[var(--gold)] px-4 py-2 text-[var(--ink)]"
          >
            {S.search}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={href({ party: undefined, page: 1 })}
            className={`label-mono rounded-full border px-3 py-1.5 transition-colors ${
              !party
                ? "border-[var(--gold)] text-[var(--gold-bright)]"
                : "border-[var(--line-strong)] text-[var(--paper-faint)] hover:text-[var(--paper)]"
            }`}
          >
            {S.all}
          </Link>
          {parties.map((p) => (
            <Link
              key={p.short}
              href={href({ party: p.short, page: 1 })}
              className={`label-mono rounded-full border px-3 py-1.5 transition-colors ${
                party === p.short
                  ? "border-[var(--gold)] text-[var(--gold-bright)]"
                  : "border-[var(--line-strong)] text-[var(--paper-faint)] hover:text-[var(--paper)]"
              }`}
            >
              {p.short} <span className="opacity-60">{p.count}</span>
            </Link>
          ))}
        </div>

        <p className="label-mono mt-6 text-[var(--paper-faint)]">
          {integer(total, bcp47)} {S.results}
        </p>

        <div className="mt-4 flex flex-col">
          {results.map((p) => {
            const b = badges.get(p.slug);
            return (
              <div key={p.slug}>
                <Link
                  href={`/${locale}/politico/${p.slug}`}
                  className="group grid grid-cols-[1fr_auto] items-baseline gap-4 py-4 sm:grid-cols-[1fr_9rem_8rem]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[var(--paper)] group-hover:text-[var(--gold-bright)]">
                      {p.name}
                      {b?.hasRecord && (
                        <span className="label-mono ml-2 text-[var(--gold)]">·{P.hasRecord}</span>
                      )}
                    </p>
                    <p className="label-mono mt-1 truncate text-[var(--paper-dim)]">{p.role}</p>
                  </div>
                  <div className="hidden min-w-0 sm:block">
                    <p className="label-mono truncate text-[var(--paper-dim)]">{p.partyShort}</p>
                    <p className="label-mono mt-1 truncate text-[var(--paper-faint)]">
                      {p.municipality ?? p.region ?? "—"}
                    </p>
                  </div>
                  <p className="mono text-right text-sm text-[var(--paper)]">
                    {euroCompact(p.gross, bcp47)}
                  </p>
                </Link>
                <hr className="hairline" />
              </div>
            );
          })}
        </div>

        {results.length === 0 && (
          <p className="label-mono py-10 text-center text-[var(--paper-faint)]">{S.noResults}</p>
        )}

        {pages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            {current > 1 ? (
              <Link href={href({ page: current - 1 })} className="label-mono hover:text-[var(--gold)]">
                ← {S.prev}
              </Link>
            ) : (
              <span />
            )}
            <span className="label-mono text-[var(--paper-faint)]">
              {S.page} {integer(current, bcp47)} {S.of} {integer(pages, bcp47)}
            </span>
            {current < pages ? (
              <Link href={href({ page: current + 1 })} className="label-mono hover:text-[var(--gold)]">
                {S.next} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </section>

      <p className="label-mono mt-10 text-[var(--paper-faint)]">{S.caveat}</p>
      <p className="label-mono mt-2 text-[var(--paper-faint)]">{S.sourceNote}</p>
    </main>
  );
}
