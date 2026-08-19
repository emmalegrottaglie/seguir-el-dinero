// Locale constants only — no dictionaries. Kept dependency-free so the edge
// middleware and client components can import it without pulling in the full
// es/en/ca translation tables.

export type Locale = "es" | "en" | "ca";
export const LOCALES: Locale[] = ["es", "en", "ca"];
export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  es: "Español",
  en: "English",
  ca: "Català",
};

// BCP-47 tags for Intl formatting (numbers, dates).
export const BCP47: Record<Locale, string> = {
  es: "es-ES",
  en: "en-GB",
  ca: "ca-ES",
};

export function isLocale(v: string | undefined): v is Locale {
  return v === "es" || v === "en" || v === "ca";
}
