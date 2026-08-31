import { promises as fs } from "node:fs";
import path from "node:path";
import { PARTIES } from "./parties";
import { foldTokens } from "./name-key.mjs";

// Money reaching the foundations and associations tied to political parties.
//
// Extracted by scripts/extract-foundations.py from Tribunal de Cuentas report
// nº 1.642 (approved 25/09/2025), annexes III and IV. The extractor verifies its
// own sums against each annex's TOTALES row and aborts on a mismatch, so the
// figures here reconcile with the report by construction.
//
// The party attributed to each entity is the one the report itself names, in its
// sentence "La <entity>, vinculada a la formación política <party>". Entities
// whose link the report does not state carry party: null and are shown that way
// rather than matched by name.

export interface FoundationYearFigures {
  donations: number;
  subsidies: number;
}

export interface FoundationEntity {
  name: string;
  /** Party as named by the report; null when the report does not state it. */
  party: string | null;
  years: Record<string, FoundationYearFigures>;
}

export interface FoundationsFile {
  source: { body: string; report: string; approved: string; url: string };
  years: Record<string, { donations: number; subsidies: number; entities: number }>;
  entities: FoundationEntity[];
}

const FILE = path.join(process.cwd(), "data", "foundations.json");
let cache: FoundationsFile | null = null;

export async function getFoundations(): Promise<FoundationsFile> {
  if (cache) return cache;
  const parsed = JSON.parse(await fs.readFile(FILE, "utf-8")) as FoundationsFile;
  cache = parsed;
  return parsed;
}

// The legal basis, which is what makes this channel worth publishing at all.
export const FOUNDATIONS_LAW_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-2007-13022";

/** Years present in the data, ascending. */
export function foundationYears(data: FoundationsFile): number[] {
  return Object.keys(data.years)
    .map(Number)
    .sort((a, b) => a - b);
}

/** Totals across every year in the file. */
export function foundationTotals(data: FoundationsFile) {
  return Object.values(data.years).reduce(
    (acc, y) => ({
      donations: acc.donations + y.donations,
      subsidies: acc.subsidies + y.subsidies,
    }),
    { donations: 0, subsidies: 0 },
  );
}

/** Entities ranked by total donations across all years, descending. */
export function rankedEntities(data: FoundationsFile) {
  return data.entities
    .map((e) => {
      const donations = Object.values(e.years).reduce((s, y) => s + y.donations, 0);
      const subsidies = Object.values(e.years).reduce((s, y) => s + y.subsidies, 0);
      return { ...e, donations, subsidies, nif: partyNifFor(e.party) };
    })
    .sort((a, b) => b.donations - a.donations || b.subsidies - a.subsidies);
}

/**
 * Link a report-stated party name to the NIF-keyed registry so the entity can
 * point at that party's funding page. Matching is on the registry entry's own
 * words appearing in the report's name; an ambiguous result yields null, because
 * pointing a foundation at the wrong party would misattribute its money.
 */
function partyNifFor(party: string | null): string | null {
  if (!party) return null;
  const tokens = new Set(foldTokens(party));
  const hits = Object.entries(PARTIES).filter(([, meta]) => {
    const words = foldTokens(meta.displayName).filter((w) => w.length > 3);
    return words.length > 0 && words.every((w) => tokens.has(w));
  });
  return hits.length === 1 ? hits[0][0] : null;
}
