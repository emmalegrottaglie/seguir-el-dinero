import Link from "next/link";
import { querySalaries, getSalaries } from "@/lib/salaries";
import { getDict } from "@/lib/i18n";
import { euro, euroCompact, integer } from "@/lib/format";

// Search and paging come from the query string, so this route renders per request.
export const dynamic = "force-dynamic";

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export default async function SueldosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; party?: string; page?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { q, party, page } = await searchParams;
  const { locale, bcp47, t } = getDict(localeParam);
  const s = t.salaries;

  const data = await getSalaries();
  const { results, total, page: current, pages, parties } = await querySalaries({
    q,
    party,
    page: Number(page) || 1,
  });

  const med = median(data.people.map((p) => p.gross));

  // Preserve the other filters when building a link.
  const href = (next: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { q, party, page: current, ...next };
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "" && !(k === "page" && v === 1)) sp.set(k, String(v));
    }
    const qs = sp.toString();
    return `/${locale}/sueldos${qs ? `?${qs}` : ""}`;
  };

  return (
    <main className="mx-auto max-w-5xl px-5 pb-8">
      <h1 className="display mt-6 text-4xl sm:text-5xl">{s.title}</h1>
      <p className="mt-5 max-w-2xl text-[var(--paper-dim)]">{s.intro}</p>

      <div className="mt-8 flex flex-wrap gap-8">
        <div>
          <p className="label-mono mb-1">{s.people}</p>
          <p className="mono text-2xl text-[var(--gold-bright)]">{integer(data.count, bcp47)}</p>
        </div>
        <div>
          <p className="label-mono mb-1">{s.median}</p>
          <p className="mono text-2xl text-[var(--paper)]">{euro(med, bcp47)}</p>
        </div>
      </div>

      {/* Search — plain GET form so it works without JS */}
      <form action={`/${locale}/sueldos`} method="get" className="panel mt-8 flex flex-wrap gap-3 p-4">
        {party && <input type="hidden" name="party" value={party} />}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder={s.searchPlaceholder}
          aria-label={s.search}
          className="mono min-w-0 flex-1 rounded border border-[var(--line-strong)] bg-[var(--ink-3)] px-3 py-2 text-sm text-[var(--paper)] outline-none focus:border-[var(--gold)]"
        />
        <button
          type="submit"
          className="label-mono rounded border border-[var(--gold)] bg-[var(--gold)] px-4 py-2 text-[var(--ink)]"
        >
          {s.search}
        </button>
      </form>

      {/* Party facets */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={href({ party: undefined, page: 1 })}
          className={`label-mono rounded-full border px-3 py-1.5 transition-colors ${
            !party
              ? "border-[var(--gold)] text-[var(--gold-bright)]"
              : "border-[var(--line-strong)] text-[var(--paper-faint)] hover:text-[var(--paper)]"
          }`}
        >
          {s.all}
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
        {integer(total, bcp47)} {s.results}
      </p>

      {/* Results */}
      <div className="mt-4 flex flex-col">
        {results.map((p) => (
          <div key={p.slug}>
            <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-4 sm:grid-cols-[1fr_10rem_8rem]">
              <div className="min-w-0">
                <p className="truncate text-[var(--paper)]">{p.name}</p>
                <p className="label-mono mt-1 truncate text-[var(--paper-dim)]">{p.role}</p>
              </div>
              <div className="hidden min-w-0 sm:block">
                {p.partyNif ? (
                  <Link
                    href={`/${locale}/party/${p.partyNif}`}
                    className="label-mono truncate text-[var(--gold)] hover:underline"
                  >
                    {p.partyShort}
                  </Link>
                ) : (
                  <span className="label-mono truncate text-[var(--paper-faint)]">{p.partyShort}</span>
                )}
                <p className="label-mono mt-1 truncate text-[var(--paper-faint)]">
                  {p.municipality ?? p.region ?? "—"}
                </p>
              </div>
              <p className="mono text-right text-sm text-[var(--paper)]">
                {euroCompact(p.gross, bcp47)}
              </p>
            </div>
            <hr className="hairline" />
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <p className="label-mono py-10 text-center text-[var(--paper-faint)]">{s.noResults}</p>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          {current > 1 ? (
            <Link href={href({ page: current - 1 })} className="label-mono hover:text-[var(--gold)]">
              ← {s.prev}
            </Link>
          ) : (
            <span />
          )}
          <span className="label-mono text-[var(--paper-faint)]">
            {s.page} {integer(current, bcp47)} {s.of} {integer(pages, bcp47)}
          </span>
          {current < pages ? (
            <Link href={href({ page: current + 1 })} className="label-mono hover:text-[var(--gold)]">
              {s.next} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}

      <p className="label-mono mt-10 text-[var(--paper-faint)]">{s.caveat}</p>
      <p className="label-mono mt-2 text-[var(--paper-faint)]">{s.sourceNote}</p>
    </main>
  );
}
