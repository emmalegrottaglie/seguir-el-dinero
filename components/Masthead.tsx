"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dict, Locale } from "@/lib/i18n";
import LocaleToggle from "./LocaleToggle";

interface Tab {
  href: string;
  label: string;
  /** Tabs that carry the organisations' voice take the verdigris accent. */
  voice?: "state" | "org";
}

/**
 * The newspaper shell: a 6px ink bar, the masthead row, the tab nav.
 *
 * Replaces the 224px sidebar rail. The rail put six links before the content
 * on every page and spent a fifth of the viewport on navigation; a masthead
 * gives that width back to the data and reads as what this is — an edition of
 * a document, not an application.
 *
 * Client component only for `usePathname`, which is what marks the active tab.
 * The dateline is computed on the server and passed in, so there is nothing
 * for the client and the server to disagree about at hydration.
 */
export default function Masthead({
  locale,
  nav,
  masthead,
  dateline,
}: {
  locale: Locale;
  nav: Dict["nav"];
  masthead: Dict["masthead"];
  dateline: string;
}) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    { href: `/${locale}`, label: nav.panel },
    { href: `/${locale}/financiacion`, label: nav.funding },
    { href: `/${locale}/fundaciones`, label: nav.foundations },
    { href: `/${locale}/derechos`, label: nav.rights, voice: "org" },
    { href: `/${locale}/votaciones`, label: nav.votes },
    { href: `/${locale}/mapa`, label: nav.map, voice: "org" },
    { href: `/${locale}/politicos`, label: nav.people },
    { href: `/${locale}/metodologia`, label: nav.methodology },
  ];

  // Exact match for the portada root, prefix match for sections. /fundaciones
  // must not swallow /fundacion/[slug] and vice versa, so both are matched on
  // their own prefix; a dossier page marks the index tab active, which is
  // where the reader came from.
  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === href;
    if (href === `/${locale}/fundaciones`) {
      return pathname.startsWith(href) || pathname.startsWith(`/${locale}/fundacion/`);
    }
    if (href === `/${locale}/politicos`) {
      return (
        pathname.startsWith(href) ||
        pathname.startsWith(`/${locale}/politico/`) ||
        pathname.startsWith(`/${locale}/party/`)
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="mx-auto max-w-[1280px] px-[22px]">
      {/* Masthead row */}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-[var(--ink)] pb-3 pt-3.5">
        <div>
          <Link href={`/${locale}`} className="block">
            <span
              className="display block font-normal"
              style={{ fontSize: "clamp(38px,6.2vw,72px)", lineHeight: 0.9, letterSpacing: "-0.03em" }}
            >
              Seguir <span className="italic text-[var(--gold)]">el</span> Dinero
            </span>
          </Link>
          <p
            className="label-mono mt-1"
            style={{ fontSize: "13px", letterSpacing: "0.2em" }}
          >
            {masthead.edition}
          </p>
        </div>

        {/* Never wraps: the three lines are a single block of provenance and
            breaking them mid-line reads as a layout fault. */}
        <div
          className="flex flex-none flex-col items-end gap-1 text-right"
          style={{ fontSize: "11.5px", color: "var(--ink-3)", whiteSpace: "nowrap" }}
        >
          <span className="inline-flex items-center gap-1.5" style={{ color: "var(--verd-text)" }}>
            <span
              className="dot"
              aria-hidden
              style={{ width: 6, height: 6, background: "var(--verd)" }}
            />
            {masthead.live}
          </span>
          <span className="mono">
            {masthead.place} · {dateline}
          </span>
          <span>{masthead.sources}</span>
        </div>
      </div>

      {/* Tab nav */}
      <nav
        aria-label={masthead.navLabel}
        className="flex flex-wrap border-b-[3px] border-[var(--ink)]"
      >
        {tabs.map((tab, i) => {
          const active = isActive(tab.href);
          const org = tab.voice === "org";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              data-org={org ? "" : undefined}
              className={`nav-tab${active ? " nav-tab-active" : ""}`}
              style={i === tabs.length - 1 ? { borderRight: "none" } : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
        <div className="ml-auto flex items-center pl-4 pr-1">
          <LocaleToggle current={locale} />
        </div>
      </nav>
    </header>
  );
}
