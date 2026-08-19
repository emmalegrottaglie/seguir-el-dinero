// Currency/number formatting helpers (es-ES locale, euros).

const eur0 = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const num0 = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });

export function euro(n: number): string {
  return eur0.format(n);
}

// Compact euro for tight spaces: "59,6 M €", "871 k €".
export function euroCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("es-ES", { maximumFractionDigits: 1 })} M €`;
  if (n >= 1_000) return `${Math.round(n / 1_000).toLocaleString("es-ES")} k €`;
  return `${Math.round(n)} €`;
}

export function integer(n: number): string {
  return num0.format(n);
}

export function percent(fraction: number, digits = 1): string {
  return `${(fraction * 100).toLocaleString("es-ES", { maximumFractionDigits: digits })} %`;
}

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(iso: string): string {
  // iso is "YYYY-MM-DD"; construct as UTC to avoid TZ drift.
  const [y, m, d] = iso.split("-").map(Number);
  return dateFmt.format(new Date(Date.UTC(y, m - 1, d)));
}
