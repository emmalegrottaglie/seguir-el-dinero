/**
 * The Salario Mínimo Interprofesional, one entry per year, transcribed by hand
 * from the Real Decreto that set it.
 *
 * This is a small, slow, legally-defined series — the government sets it once
 * a year — so it gets the treatment `lib/donations.ts` already established for
 * a figure of that shape: a typed module with an explicit source per row,
 * reviewed by eye, not an ingest script. There is nothing here for a scraper
 * to fetch; each Real Decreto is a page of legal text with one number in it.
 *
 * Every entry resolves at `https://www.boe.es/buscar/act.php?id=<boe.id>`.
 *
 * 2021 is not uniform, and the entry says so rather than hiding it behind one
 * annual figure. Real Decreto 817/2021 raised the SMI to €965/month, but only
 * from 1 September 2021 — January through August that year stayed at 2020's
 * €950/month under Real Decreto 231/2020, which remained in force until then.
 * €965/month is the figure everyone cites as "the 2021 SMI" and is what this
 * module stores, but a calculation that needs the full year should read the
 * note, not assume twelve (or fourteen) months at one rate.
 */

export interface Boe {
  id: string;
  title: string;
  date: string; // ISO, the decree's own date
  url: string;
}

export interface SmiYear {
  year: number;
  /** Gross euros per payment. */
  monthly: number;
  /** 14 for every year on record so far — 12 ordinary months plus two extra payments. */
  payments: number;
  /** monthly × payments. */
  annual: number;
  /** ISO date the rate actually took effect, which is not always 1 January. */
  effectiveFrom: string;
  boe: Boe;
  note?: string;
}

function boeUrl(id: string): string {
  return `https://www.boe.es/buscar/act.php?id=${id}`;
}

export const SMI_BY_YEAR: SmiYear[] = [
  {
    year: 2020,
    monthly: 950,
    payments: 14,
    annual: 13300,
    effectiveFrom: "2020-01-01",
    boe: {
      id: "BOE-A-2020-1652",
      title: "Real Decreto 231/2020, de 4 de febrero, por el que se fija el salario mínimo interprofesional para 2020",
      date: "2020-02-04",
      url: boeUrl("BOE-A-2020-1652"),
    },
  },
  {
    year: 2021,
    monthly: 965,
    payments: 14,
    annual: 13510,
    effectiveFrom: "2021-09-01",
    boe: {
      id: "BOE-A-2021-15770",
      title: "Real Decreto 817/2021, de 28 de septiembre, por el que se fija el salario mínimo interprofesional para 2021",
      date: "2021-09-28",
      url: boeUrl("BOE-A-2021-15770"),
    },
    note: "Solo vigente desde el 1 de septiembre de 2021. De enero a agosto de 2021 rigió el SMI de 2020 (950 €/mes), fijado por el Real Decreto 231/2020, que permaneció en vigor hasta esa fecha.",
  },
  {
    year: 2022,
    monthly: 1000,
    payments: 14,
    annual: 14000,
    effectiveFrom: "2022-01-01",
    boe: {
      id: "BOE-A-2022-2851",
      title: "Real Decreto 152/2022, de 22 de febrero, por el que se fija el salario mínimo interprofesional para 2022",
      date: "2022-02-22",
      url: boeUrl("BOE-A-2022-2851"),
    },
  },
  {
    year: 2023,
    monthly: 1080,
    payments: 14,
    annual: 15120,
    effectiveFrom: "2023-01-01",
    boe: {
      id: "BOE-A-2023-3982",
      title: "Real Decreto 99/2023, de 14 de febrero, por el que se fija el salario mínimo interprofesional para 2023",
      date: "2023-02-14",
      url: boeUrl("BOE-A-2023-3982"),
    },
  },
  {
    year: 2024,
    monthly: 1134,
    payments: 14,
    annual: 15876,
    effectiveFrom: "2024-01-01",
    boe: {
      id: "BOE-A-2024-2251",
      title: "Real Decreto 145/2024, de 6 de febrero, por el que se fija el salario mínimo interprofesional para 2024",
      date: "2024-02-06",
      url: boeUrl("BOE-A-2024-2251"),
    },
  },
  {
    year: 2025,
    monthly: 1184,
    payments: 14,
    annual: 16576,
    effectiveFrom: "2025-01-01",
    boe: {
      id: "BOE-A-2025-2576",
      title: "Real Decreto 87/2025, de 11 de febrero, por el que se fija el salario mínimo interprofesional para 2025",
      date: "2025-02-11",
      url: boeUrl("BOE-A-2025-2576"),
    },
  },
  {
    year: 2026,
    monthly: 1221,
    payments: 14,
    annual: 17094,
    effectiveFrom: "2026-01-01",
    boe: {
      id: "BOE-A-2026-3815",
      title: "Real Decreto 126/2026, de 18 de febrero, por el que se fija el salario mínimo interprofesional para 2026",
      date: "2026-02-18",
      url: boeUrl("BOE-A-2026-3815"),
    },
  },
];

export function smiForYear(year: number): SmiYear | null {
  return SMI_BY_YEAR.find((s) => s.year === year) ?? null;
}

/** The most recent year on record. */
export function currentSmi(): SmiYear {
  return SMI_BY_YEAR[SMI_BY_YEAR.length - 1];
}

/**
 * How many multiples of a year's SMI a gross annual figure represents.
 *
 * Defaults to the current year, since every figure in `data/salaries.json` is
 * a present-day snapshot rather than tied to a specific past year.
 */
export function multiplesOfSmi(annualGross: number, year?: number): number {
  const smi = year ? smiForYear(year) : currentSmi();
  if (!smi) throw new Error(`no SMI on record for ${year}`);
  return annualGross / smi.annual;
}
