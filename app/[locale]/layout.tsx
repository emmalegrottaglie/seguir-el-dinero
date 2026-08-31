import type { Metadata } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, LOCALES, isLocale } from "@/lib/i18n";
import LocaleToggle from "@/components/LocaleToggle";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-plex",
  weight: ["400", "500", "600"],
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = getDict(locale);
  return { title: t.meta.title, description: t.meta.description };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { t } = getDict(locale);

  return (
    // suppressHydrationWarning: browser extensions (e.g. Dark Reader) inject
    // attributes onto <html> before React hydrates; that mismatch is benign.
    <html lang={locale} suppressHydrationWarning>
      <body className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}>
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
          <Link href={`/${locale}`} className="group flex items-baseline gap-3">
            <span className="display text-lg tracking-tight text-[var(--paper)]">
              Seguir&nbsp;el&nbsp;Dinero
            </span>
            <span className="eyebrow hidden sm:inline">Dossier · 001</span>
          </Link>
          <div className="flex items-center gap-5 sm:gap-6">
            <nav className="label-mono flex gap-4 sm:gap-6">
              <Link className="transition-colors hover:text-[var(--gold)]" href={`/${locale}`}>
                {t.nav.panel}
              </Link>
              <Link className="transition-colors hover:text-[var(--gold)]" href={`/${locale}/caras`}>
                {t.nav.faces}
              </Link>
              <Link className="transition-colors hover:text-[var(--gold)]" href={`/${locale}/sueldos`}>
                {t.nav.salaries}
              </Link>
              <Link className="transition-colors hover:text-[var(--gold)]" href={`/${locale}/votaciones`}>
                {t.nav.votes}
              </Link>
              <Link
                className="transition-colors hover:text-[var(--gold)]"
                href={`/${locale}/metodologia`}
              >
                {t.nav.methodology}
              </Link>
            </nav>
            <LocaleToggle current={locale} />
          </div>
        </header>
        {children}
        <footer className="mx-auto max-w-6xl px-5 py-12">
          <hr className="hairline mb-6" />
          <div className="label-mono flex flex-col gap-2 sm:flex-row sm:justify-between">
            <span>{t.footer.source}</span>
            <span className="text-[var(--paper-faint)]">{t.footer.caveat}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
