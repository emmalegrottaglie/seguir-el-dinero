// Currency/number formatting helpers. Each accepts a BCP-47 locale tag
// (default es-ES) so figures follow the selected UI language.

export function euro(n: number, locale = "es-ES"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

// Compact euro for tight spaces: "59,6 M €", "871 k €".
export function euroCompact(n: number, locale = "es-ES"): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })} M €`;
  if (n >= 1_000) return `${Math.round(n / 1_000).toLocaleString(locale)} k €`;
  return `${Math.round(n)} €`;
}

/** The exact figure to the cent, as the audit reports print it. */
export function euroExact(n: number, locale = "es-ES"): string {
  return `${n.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

/** Millions, for headline figures: "18,43 M€". */
export function euroM(n: number, locale = "es-ES", digits = 2): string {
  return `${(n / 1_000_000).toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} M€`;
}

/**
 * A fraction as a CSS length.
 *
 * Kept separate from `percent()` on purpose. A localised percentage is not a
 * parseable CSS length — `es-ES` renders 0.545 as "54,5", and a bar given
 * `width: 54,5%` silently collapses to nothing rather than erroring. Display
 * formatting and layout formatting therefore never share a helper.
 */
export function cssPercent(fraction: number, digits = 3): string {
  const clamped = Math.max(0, Math.min(1, fraction));
  return `${(clamped * 100).toFixed(digits)}%`;
}

/**
 * A rate per 100 000, to the two decimals the source publishes.
 *
 * `toLocaleString` alone drops a trailing zero, so a published 14,00 came out
 * as 14 and 10,80 as 10,8 - a quiet loss of the precision the report states.
 */
export function rate(n: number, locale = "es-ES"): string {
  return n.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function integer(n: number, locale = "es-ES"): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n);
}

export function percent(fraction: number, locale = "es-ES", digits = 1): string {
  return `${(fraction * 100).toLocaleString(locale, { maximumFractionDigits: digits })} %`;
}

/**
 * A year-on-year change with its direction always visible.
 *
 * A bare percentage sitting next to a count reads as growth by default, so a
 * fall has to carry its sign. Negative values already arrive with the locale's
 * own minus sign — not always an ASCII hyphen — so only the positive case needs
 * a prefix here.
 */
export function signedPercent(fraction: number, locale = "es-ES", digits = 1): string {
  const body = percent(fraction, locale, digits);
  return fraction > 0 ? `+${body}` : body;
}

export function formatDate(iso: string, locale = "es-ES"): string {
  // iso is "YYYY-MM-DD"; construct as UTC to avoid TZ drift.
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
