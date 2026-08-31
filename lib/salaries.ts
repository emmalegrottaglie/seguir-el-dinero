import { promises as fs } from "node:fs";
import path from "node:path";
import { foldText } from "./name-key.mjs";

export interface Officeholder {
  slug: string;
  name: string;
  role: string;
  partyLabel: string;
  partyNif: string | null;
  partyShort: string;
  region: string | null;
  municipality: string | null;
  gross: number;
  monthly: number | null;
}

export interface SalaryData {
  generatedAt: string;
  source: { name: string; via: string; updated: string | null };
  count: number;
  people: Officeholder[];
}

const FILE = path.join(process.cwd(), "data", "salaries.json");

let cache: SalaryData | null = null;

// The dataset is ~1.8 MB, so it is read once per server instance and never sent
// to the browser wholesale — pages render a filtered slice.
export async function getSalaries(): Promise<SalaryData> {
  if (cache) return cache;
  const raw = await fs.readFile(FILE, "utf-8");
  cache = JSON.parse(raw) as SalaryData;
  return cache;
}

// Strip accents/case so "Diaz" matches "Díaz".
const fold = foldText;

export interface SalaryQuery {
  q?: string;
  party?: string; // partyShort
  page?: number;
  perPage?: number;
}

export interface SalaryPage {
  results: Officeholder[];
  total: number;
  page: number;
  pages: number;
  parties: { short: string; count: number }[];
}

export async function querySalaries(opts: SalaryQuery): Promise<SalaryPage> {
  const data = await getSalaries();
  const perPage = opts.perPage ?? 50;

  // Apply the text filter first: the party facets are counted over this set, so
  // the number on each chip matches what selecting it actually returns.
  let matching = data.people;
  if (opts.q) {
    const needle = fold(opts.q.trim());
    if (needle) {
      matching = matching.filter(
        (p) =>
          fold(p.name).includes(needle) ||
          fold(p.role).includes(needle) ||
          fold(p.municipality ?? "").includes(needle) ||
          fold(p.region ?? "").includes(needle),
      );
    }
  }

  let list = matching;
  if (opts.party) list = list.filter((p) => p.partyShort === opts.party);

  // Party facet counts over the text-filtered set, excluding the party filter
  // itself so the user can switch between parties.
  const counts = new Map<string, number>();
  for (const p of matching) counts.set(p.partyShort, (counts.get(p.partyShort) ?? 0) + 1);
  const parties = [...counts.entries()]
    .map(([short, count]) => ({ short, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, opts.page ?? 1), pages);
  const start = (page - 1) * perPage;

  return { results: list.slice(start, start + perPage), total, page, pages, parties };
}

export async function getOfficeholder(slug: string): Promise<Officeholder | undefined> {
  const data = await getSalaries();
  return data.people.find((p) => p.slug === slug);
}

// Aggregate pay by party, for joining against the BDNS subsidy figures.
export async function salaryTotalsByNif(): Promise<Map<string, { total: number; count: number }>> {
  const data = await getSalaries();
  const out = new Map<string, { total: number; count: number }>();
  for (const p of data.people) {
    if (!p.partyNif) continue;
    const cur = out.get(p.partyNif) ?? { total: 0, count: 0 };
    cur.total += p.gross;
    cur.count += 1;
    out.set(p.partyNif, cur);
  }
  return out;
}
