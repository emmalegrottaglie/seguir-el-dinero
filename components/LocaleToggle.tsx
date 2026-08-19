"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_LABELS, LOCALE_COOKIE, type Locale } from "@/lib/locales";

export default function LocaleToggle({ current }: { current: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const change = (code: Locale) => {
    if (code === current) return;
    // Swap the leading /<locale> segment (or prepend it if somehow absent).
    const rest = pathname.replace(new RegExp(`^/(${LOCALES.join("|")})(?=/|$)`), "");
    const next = `/${code}${rest}`;
    // Remember the choice so the middleware honours it on non-prefixed visits.
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.push(next));
  };

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Idioma / Language"
      aria-busy={pending}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          onClick={() => change(code)}
          aria-pressed={code === current}
          title={LOCALE_LABELS[code]}
          className={`label-mono rounded px-2 py-1 transition-colors ${
            code === current
              ? "text-[var(--gold-bright)]"
              : "text-[var(--paper-faint)] hover:text-[var(--paper)]"
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
