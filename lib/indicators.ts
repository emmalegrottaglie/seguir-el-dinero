import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * The country's own numbers, so the site's numbers have something to be read
 * against.
 *
 * Everything here is INE, ingested by `scripts/fetch-ine.mjs` and never
 * transcribed. Three rules from `PLAN-CONTEXT-LAYER.md` §0 are enforced in this
 * module rather than left to each page:
 *
 * 1. A low-sample figure keeps its flag. INE marks a cell whose sample is
 *    between 100 and 500 observations with a leading minus sign; the ingest
 *    turns that into `lowSample`, and a caller that drops it publishes a shaky
 *    figure as a firm one.
 * 2. A poverty series is always selected by its base. The same ECV table can
 *    carry both the Base 2013 AROPE definition and the objetivo Europa 2030
 *    one; they are different definitions and must never be merged, so the base
 *    is a required argument and a missing base throws rather than falling back.
 * 3. An undefined cell stays undefined. `percent` is null where INE publishes
 *    no value, and null is not zero.
 *
 * Nothing in this module joins an indicator to a party, a vote or a salary.
 * Facts are put side by side on the page; they are never combined into a score.
 */

export interface SourceRef {
  id: string;
  operation: string;
  table: string;
  name: string;
  /** The single period every series in that table carries. */
  period: string;
  url: string;
}

export interface SectorWage {
  sector: string;
  sex: string;
  value: number | null;
  lowSample: boolean;
}

export interface JornadaWage {
  jornada: string;
  sex: string;
  value: number | null;
  lowSample: boolean;
}

export interface PercentileWage {
  region: string;
  sex: string;
  /** "Media" | "Percentil 10" | "Cuartil inferior" | "Mediana" | … verbatim. */
  measure: string;
  value: number | null;
  lowSample: boolean;
}

export interface SmiTranche {
  /** "De 0 a 1 SMI" … "Más de 8 SMI", verbatim from INE. */
  tranche: string;
  sex: string;
  jornada: string;
  percent: number | null;
  lowSample: boolean;
}

export interface PovertyRow {
  sex: string;
  ageGroup: string;
  indicator: string;
  base: string;
  percent: number | null;
}

export interface RegionalPovertyRow {
  region: string;
  group: string;
  indicator: string;
  base: string;
  percent: number | null;
}

export interface Indicators {
  generatedAt: string;
  sources: SourceRef[];
  wages: {
    sector: SectorWage[];
    jornada: JornadaWage[];
    percentiles: PercentileWage[];
    smiTranches: SmiTranche[];
  };
  poverty: { national: PovertyRow[]; regional: RegionalPovertyRow[] };
}

const FILE = path.join(process.cwd(), "data", "indicators.json");

let cache: Indicators | null = null;

export async function getIndicators(): Promise<Indicators> {
  if (cache) return cache;
  cache = JSON.parse(await fs.readFile(FILE, "utf-8")) as Indicators;
  return cache;
}

/** INE's label for the whole population, used wherever a total is wanted. */
export const BOTH_SEXES = "Ambos sexos";
/** INE's label for the national aggregate in a table that also has regions. */
export const NATIONAL = "Total Nacional";
/** The AROPE base this site publishes. Stated, never assumed. */
export const AROPE_BASE = "Base 2013";

export function sourceFor(indicators: Indicators, id: string): SourceRef {
  const hit = indicators.sources.find((s) => s.id === id);
  if (!hit) throw new Error(`no ingested source for "${id}"`);
  return hit;
}

/**
 * Sectors with a headline wage, largest first, excluding the "all sections"
 * aggregate — which is the comparison line, not one of the bars.
 */
export function sectorLadder(indicators: Indicators): SectorWage[] {
  return indicators.wages.sector
    .filter((r) => r.sex === BOTH_SEXES && r.sector !== "Todas las secciones" && r.value !== null)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
}

/** The three national headline figures a wage chart must print together. */
export function nationalWages(indicators: Indicators): {
  mean: number;
  median: number;
  p10: number;
  p90: number;
  q1: number;
  q3: number;
} {
  const pick = (measure: string) => {
    const hit = indicators.wages.percentiles.find(
      (r) => r.region === NATIONAL && r.sex === BOTH_SEXES && r.measure === measure,
    );
    if (!hit || hit.value === null) throw new Error(`EAES has no national "${measure}"`);
    return hit.value;
  };
  return {
    mean: pick("Media"),
    median: pick("Mediana"),
    p10: pick("Percentil 10"),
    p90: pick("Percentil 90"),
    q1: pick("Cuartil inferior"),
    q3: pick("Cuartil superior"),
  };
}

/** The SMI tranches for the whole workforce, in INE's own order. */
export function smiLadder(indicators: Indicators): SmiTranche[] {
  const order = indicators.wages.smiTranches
    .filter((r) => r.sex === BOTH_SEXES && r.jornada === "Total")
    .filter((r) => r.percent !== null);
  if (order.length === 0) throw new Error("no headline SMI tranches ingested");
  return order;
}

/** Full-time versus part-time, which EAES's headline figure blends together. */
export function jornadaSplit(indicators: Indicators): JornadaWage[] {
  return indicators.wages.jornada.filter((r) => r.sex === BOTH_SEXES && r.jornada !== "Total");
}

/**
 * One national poverty indicator, for one age group, on one stated base.
 *
 * The base is required rather than defaulted: an AROPE rate on the Base 2013
 * definition and one on the objetivo Europa 2030 definition are different
 * measurements that happen to share a name, and a default would let a caller
 * mix them without noticing.
 */
export function povertyRate(
  indicators: Indicators,
  opts: { indicatorStartsWith: string; ageGroup: string; base: string },
): PovertyRow | null {
  const hits = indicators.poverty.national.filter(
    (r) =>
      r.sex === BOTH_SEXES &&
      r.ageGroup === opts.ageGroup &&
      r.base === opts.base &&
      r.indicator.startsWith(opts.indicatorStartsWith),
  );
  // An ambiguous match is dropped rather than guessed, as everywhere else on
  // this site: two rows matching means the filter no longer identifies one
  // series, and picking the first would publish an arbitrary one.
  return hits.length === 1 ? hits[0] : null;
}

/** Every base present in the ingested poverty data, so a page can say which it shows. */
export function povertyBases(indicators: Indicators): string[] {
  return [...new Set(indicators.poverty.national.map((r) => r.base))];
}
