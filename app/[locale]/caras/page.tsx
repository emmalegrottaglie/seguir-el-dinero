import Link from "next/link";
import { POLITICIANS } from "@/lib/politicians";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import Avatar from "@/components/Avatar";
import { portraitFor, photoSource } from "@/lib/photos";

export const revalidate = 3600;

export default async function CarasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const agg = await getAggregation();
  const { t } = getDict(locale);
  // Portraits resolved up-front so the cards can render on the server.
  const portraits = Object.fromEntries(
    await Promise.all(POLITICIANS.map(async (p) => [p.slug, await portraitFor(p.name)] as const)),
  );
  const photoSrc = await photoSource();
  const colorOf = (nif: string) =>
    agg.parties.find((p) => p.nif === nif)?.color ?? "var(--paper-faint)";
  const partyOf = (nif: string) =>
    agg.parties.find((p) => p.nif === nif)?.shortName ?? "";

  return (
    <main className="mx-auto max-w-4xl px-5 pb-8">
      <h1 className="display mt-6 text-4xl sm:text-5xl">{t.caras.title}</h1>
      <p className="mt-5 max-w-xl text-[var(--paper-dim)]">{t.caras.intro}</p>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {POLITICIANS.map((p) => {
          const portrait = portraits[p.slug];
          return (
          <Link
            key={p.slug}
            href={`/${locale}/politician/${p.slug}`}
            className="panel group flex items-center gap-4 p-5 transition-colors hover:border-[var(--line-strong)]"
          >
            <Avatar
              name={p.name}
              portrait={portrait}
              color={colorOf(p.partyNif)}
              size={52}
            />
            <div className="min-w-0">
              <p className="text-lg group-hover:text-[var(--gold-bright)]">{p.name}</p>
              <p className="label-mono mt-1 truncate text-[var(--paper-dim)]">
                {partyOf(p.partyNif)} · {p.role}
              </p>
              {portrait && (
                <p className="label-mono mt-1 truncate text-[var(--paper-faint)]">
                  Foto: {portrait.author ?? "Wikimedia Commons"} · {portrait.licence}
                </p>
              )}
            </div>
          </Link>
          );
        })}
      </div>

      <p className="label-mono mt-10 text-[var(--paper-faint)]">{t.caras.note}</p>
      <p className="label-mono mt-2 text-[var(--paper-faint)]">
        Fotos ·{" "}
        <a className="src" href={photoSrc.url} target="_blank" rel="noopener noreferrer">
          {photoSrc.name}
        </a>{" "}
        (licencias libres, con autor y licencia indicados)
      </p>
    </main>
  );
}
