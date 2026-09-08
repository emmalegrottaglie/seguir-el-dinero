import type { CSSProperties } from "react";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { getFoundations } from "@/lib/foundations";
import { getSpending } from "@/lib/spending";
import Dashboard from "@/components/Dashboard";
import ElectoralSpending from "@/components/ElectoralSpending";
import FoundationChannel from "@/components/FoundationChannel";

export const revalidate = 3600;

/**
 * The money channels, most revealing first.
 *
 * This page used to be the state-subsidy dashboard under a title that promised
 * to answer who funds the parties. It answered a narrower question than it
 * asked, and the ranked bar chart of 28 parties was the least surprising thing
 * on it. So the order now runs by what the reader cannot get elsewhere: the
 * foundation channel, then what an election's money was declared to have
 * bought, then the subsidies as the baseline the other two sit against.
 *
 * The page owns its own <h1>. Dashboard used to, which left the title bound to
 * the least important section.
 */
export default async function FinanciacionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const [agg, fnd, spend] = await Promise.all([
    getAggregation(),
    getFoundations(),
    getSpending(),
  ]);
  const { locale, bcp47, t } = getDict(localeParam);

  return (
    <main>
      <header className="mx-auto max-w-6xl px-5 pt-10">
        <p className="eyebrow enter" style={{ "--enter-y": "8px" } as CSSProperties}>
          {t.home.eyebrow} · {agg.years[0]}–{agg.years.at(-1)}
        </p>
        <h1
          className="display enter mt-4 text-5xl leading-[0.92] sm:text-7xl"
          style={{ "--enter-y": "14px", "--enter-delay": "0.05s" } as CSSProperties}
        >
          {t.home.titlePre}
          <span className="italic text-[var(--gold)]">{t.home.titleEmph}</span>
          {t.home.titlePost}
        </h1>
        {/* Says which channels are here and which are not, so the title cannot
            be read as a claim to cover all party finance. */}
        <p className="mt-6 max-w-2xl text-lg text-[var(--paper-dim)]">{t.home.subtitle}</p>
      </header>

      <FoundationChannel data={fnd} t={t} bcp47={bcp47} locale={locale} />

      <ElectoralSpending data={spend} t={t} bcp47={bcp47} />

      <Dashboard base={agg} home={t.home} kinds={t.kinds} locale={locale} />
    </main>
  );
}
