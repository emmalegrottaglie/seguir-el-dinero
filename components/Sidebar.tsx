"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Dict, Locale } from "@/lib/i18n";
import LocaleToggle from "./LocaleToggle";

interface Item {
  href: string;
  label: string;
}

export default function Sidebar({ locale, nav }: { locale: Locale; nav: Dict["nav"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const data: Item[] = [
    { href: `/${locale}`, label: nav.panel },
    { href: `/${locale}/financiacion`, label: nav.funding },
    { href: `/${locale}/politicos`, label: nav.people },
    { href: `/${locale}/votaciones`, label: nav.votes },
  ];
  const about: Item[] = [{ href: `/${locale}/metodologia`, label: nav.methodology }];

  // Exact match for the dashboard root, prefix match for sections.
  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  const group = (title: string, items: Item[]) => (
    <div className="mb-7">
      <p className="label-mono mb-3 text-[var(--paper-faint)]">{title}</p>
      <ul className="flex flex-col gap-1">
        {items.map((it) => {
          const active = isActive(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`block rounded px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[var(--ink-3)] text-[var(--gold-bright)]"
                    : "text-[var(--paper-dim)] hover:bg-[var(--ink-2)] hover:text-[var(--paper)]"
                }`}
                style={active ? { boxShadow: "inset 2px 0 0 var(--gold)" } : undefined}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const inner = (
    <>
      <Link href={`/${locale}`} className="block px-3" onClick={() => setOpen(false)}>
        <span className="display block text-lg leading-tight text-[var(--paper)]">
          Seguir
          <br />
          el&nbsp;Dinero
        </span>
        <span className="eyebrow mt-2 block">Dossier · 001</span>
      </Link>

      <hr className="hairline my-6" />

      {group(nav.sectionData, data)}
      {group(nav.sectionAbout, about)}

      <div className="mt-auto px-3 pt-6">
        <LocaleToggle current={locale} />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="flex items-center justify-between px-5 py-4 lg:hidden">
        <Link href={`/${locale}`} className="display text-base text-[var(--paper)]">
          Seguir&nbsp;el&nbsp;Dinero
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={nav.menu}
          className="label-mono rounded border border-[var(--line-control)] px-3 py-1.5"
        >
          {nav.menu}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col border-b border-[var(--line)] px-2 pb-6 lg:hidden">{inner}</nav>
      )}

      {/* Desktop rail */}
      <nav className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-[var(--line)] px-2 py-7 lg:flex">
        {inner}
      </nav>
    </>
  );
}
