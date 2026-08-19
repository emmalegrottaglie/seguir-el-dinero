import type { Metadata } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Seguir el Dinero · Subvenciones públicas a los partidos",
  description:
    "Rastreo de las subvenciones públicas estatales que reciben los partidos políticos españoles, con datos de la Base de Datos Nacional de Subvenciones (BDNS).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. Dark Reader) inject
    // attributes onto <html> before React hydrates; that mismatch is benign.
    <html lang="es" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}>
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" className="group flex items-baseline gap-3">
            <span className="display text-lg tracking-tight text-[var(--paper)]">
              Seguir&nbsp;el&nbsp;Dinero
            </span>
            <span className="eyebrow hidden sm:inline">Dossier ES · 001</span>
          </Link>
          <nav className="label-mono flex gap-6">
            <Link className="transition-colors hover:text-[var(--gold)]" href="/">
              Panel
            </Link>
            <Link className="transition-colors hover:text-[var(--gold)]" href="/caras">
              Caras
            </Link>
            <Link className="transition-colors hover:text-[var(--gold)]" href="/metodologia">
              Metodología
            </Link>
          </nav>
        </header>
        {children}
        <footer className="mx-auto max-w-6xl px-5 py-12">
          <hr className="hairline mb-6" />
          <div className="label-mono flex flex-col gap-2 sm:flex-row sm:justify-between">
            <span>
              Fuente · BDNS / SNPSAP — infosubvenciones.es
            </span>
            <span className="text-[var(--paper-faint)]">
              Muestra financiación PÚBLICA. Donaciones privadas: ver metodología.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
