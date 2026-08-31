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
        <div className="lg:flex">
          <Sidebar locale={locale} nav={t.nav} />
          <div className="min-w-0 flex-1">
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
