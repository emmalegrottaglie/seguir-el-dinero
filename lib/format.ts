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

export function integer(n: number, locale = "es-ES"): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n);
}

export function percent(fraction: number, locale = "es-ES", digits = 1): string {
  return `${(fraction * 100).toLocaleString(locale, { maximumFractionDigits: digits })} %`;
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
