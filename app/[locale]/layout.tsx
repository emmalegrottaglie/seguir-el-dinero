import type { Metadata } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, LOCALES, isLocale } from "@/lib/i18n";
import Sidebar from "@/components/Sidebar";
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
        {/* Skip link: the sidebar repeats six links before the content on every
            page, so a keyboard or screen-reader user had to pass all of them
            each time.

            Deliberately not sr-only/focus:not-sr-only. That pair left the link
            2px tall when focused, because sr-only's `height: 1px` and `clip`
            survived the reset. Translating it out of view instead is
            deterministic: the element keeps its real size at all times, stays
            focusable and in the accessibility tree, and simply slides in. */}
        <a
          href="#main"
          className="label-mono absolute left-0 top-0 z-50 inline-flex min-h-11 -translate-y-full items-center rounded-br border border-[var(--gold)] bg-[var(--ink-2)] px-4 text-[var(--gold-bright)] transition-transform focus:translate-y-0"
        >
          {t.nav.skipToContent}
        </a>

        <div className="lg:flex">
          <Sidebar locale={locale} nav={t.nav} />
          {/* tabIndex -1 so the skip link actually moves focus here, not just
              the scroll position. */}
          <div id="main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
            {children}
            <footer className="mx-auto max-w-6xl px-5 py-12">
              <hr className="hairline mb-6" />
              <div className="label-mono flex flex-col gap-2 sm:flex-row sm:justify-between">
                <span>{t.footer.source}</span>
                <span className="text-[var(--paper-faint)]">{t.footer.caveat}</span>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
