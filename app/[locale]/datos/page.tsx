import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { DATASETS } from "@/lib/datasets";
import { integer, fill } from "@/lib/format";
import SourceLine from "@/components/chart/SourceLine";

export const revalidate = 3600;

/**
 * Every dataset this site publishes, one section per table, each as a CSV.
 *
 * `lib/datasets.ts` is the registry; this page only renders it, so a table
 * added there appears here without anything else changing. Every section
 * carries an `id`, which is the point of the page as much as the download
 * link is: a reader or a journalist can cite `/datos#salarios` for a specific
 * table rather than "the site's data" in general.
 */
export default async function DatosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale, bcp47, t } = getDict(localeParam);
  const D = t.datos;

  const rows = await Promise.all(
    DATASETS.map(async (d) => ({
      def: d,
      count: await d.count(),
      sources: await d.sources(),
    })),
  );

  return (
    <main className="mx-auto max-w-4xl pb-16">
      <p className="eyebrow pt-8">{D.eyebrow}</p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">{D.title}</h1>
      <p className="mt-5 max-w-[68ch] text-lg leading-relaxed text-[var(--ink-2)]">{D.lead}</p>
      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-[var(--ink-3)]">{D.columnsNote}</p>

      <div className="mt-4 flex flex-col">
        {rows.map(({ def, count, sources }) => {
          const meta = D.tables[def.id as keyof typeof D.tables];
          return (
            <section
              key={def.id}
              id={def.id}
              className="border-t border-[var(--line)] py-8"
              style={{ scrollMarginTop: "5rem" }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2 className="display section-tick text-xl">
                  <a href={`#${def.id}`} className="hover:text-[var(--gold-deep)]">
                    {meta.title}
                  </a>
                </h2>
                <span className="label-mono text-[var(--ink-3)]">{fill(D.rows, { count: integer(count, bcp47) })}</span>
              </div>

              <p className="mt-3 max-w-[68ch] leading-relaxed text-[var(--ink-2)]">{meta.description}</p>

              {def.perRowSourced ? (
                <p className="label-mono mt-3 text-[var(--ink-3)]">{D.perRowSourced}</p>
              ) : (
                <SourceLine sources={sources} className="mt-3" />
              )}

              <Link
                href={`/${locale}/datos/${def.id}`}
                className="layer-btn mt-4 inline-block"
                style={{ padding: "6px 14px", fontSize: "13px" }}
              >
                {D.download} ({def.id}.csv)
              </Link>
            </section>
          );
        })}
      </div>
    </main>
  );
}
