import { getDict } from "@/lib/i18n";
import { getFoundations, partyNifByFoundation } from "@/lib/foundations";
import { officeTies } from "@/lib/officeholder-ties";
import FoundationChannel from "@/components/FoundationChannel";

export const revalidate = 3600;

/**
 * The party-foundation channel, on its own route.
 *
 * It used to lead /financiacion. It moved because the two are answering
 * different questions from different registers: /financiacion reports the three
 * declared money flows a party is audited on, while this is a channel that runs
 * alongside them under a different statute — parties may take no corporate
 * money at all, their foundations may take it under disposición adicional
 * séptima. Folding the second into the first made the funding page read as one
 * ranked list of everything, which is what made it uninformative.
 *
 * The dossier pages at /fundacion/[slug] hang off this index.
 */
export default async function FoundationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale, bcp47, t } = getDict(localeParam);
  const data = await getFoundations();
  const offices = await officeTies(partyNifByFoundation(data));
  const F = t.foundationsPage;

  return (
    <main>
      <header className="rule-double pb-7 pt-8">
        <p className="eyebrow">{F.eyebrow}</p>
        <h1
          className="display mt-3 font-normal"
          style={{ fontSize: "clamp(32px,4.6vw,54px)", maxWidth: "24ch" }}
        >
          {F.titlePre}
          <span className="italic text-[var(--gold)]">{F.titleEmph}</span>
          {F.titlePost}
        </h1>
        <p
          className="mt-5"
          style={{ fontSize: "15.5px", lineHeight: 1.68, color: "var(--ink-2)", maxWidth: "70ch" }}
        >
          {F.standfirst}
        </p>
      </header>

      <FoundationChannel
        data={data}
        t={t}
        bcp47={bcp47}
        locale={locale}
        offices={offices.audit}
      />
    </main>
  );
}
