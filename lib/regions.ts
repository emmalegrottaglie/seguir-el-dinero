import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * The autonomous communities: their geometry, and what the hate-crime record
 * says about each. Who governs them is in lib/governments.ts, which is kept
 * free of Node imports so the map's client component can read it.
 *
 * Geometry is projected once at build time by scripts/build-regions.mjs, so the
 * map is server-rendered and needs no charting library in the browser. The
 * hate-crime figures are extracted from the Ministerio del Interior's annual
 * report by scripts/extract-hate-territory.py, which aborts unless every row
 * reconciles against its own total and both published motivation columns
 * reconcile against the national figures.
 *
 * Two layers ship. Three more were designed and are not here, because no
 * citable per-community source exists for them yet: an LGBTI rights index, the
 * state of trans-law reform, and vote share for the parties that voted against
 * the tracked bills. Sample numbers were supplied with the design and are
 * deliberately not used — a plausible-looking figure on a map is read as a
 * measurement.
 */

export interface RegionShape {
  /** INE autonomous-community code, 01–19. The join key for every layer. */
  id: string;
  /** Verbatim from the IGN geometry, including its bilingual forms. */
  name: string;
  /** True for the Canaries, drawn in an inset box rather than in place. */
  inset: boolean;
  /** SVG path data in the file's own viewBox. */
  d: string;
  /** Projected centre, for the label or marker of a territory too small to see. */
  centroid: [number, number];
  /**
   * The projected outline is below the size at which it can be seen or
   * clicked. True for Ceuta and Melilla, decided by projected area at build
   * time rather than by naming them here.
   */
  tiny: boolean;
}

export interface RegionsFile {
  source: { body: string; licence: string; url: string; retrieved: string };
  viewBox: { width: number; height: number };
  insetBox: { x: number; y: number; w: number; h: number };
  regions: RegionShape[];
}

export interface TerritoryHate {
  /** The name as the report prints it, typographical errors included. */
  reportName: string;
  total: number;
  ratePer100k: number;
  administrative: number;
  sexualOrientationGenderIdentity: number;
  racism: number;
  ideology: number;
}

export interface HateTerritoryFile {
  source: { body: string; report: string; url: string; tables: string[] };
  year: number;
  national: { total: number; ratePer100k: number };
  /** Rows the report records with no territory. Kept so the totals reconcile. */
  unlocated: Record<string, { total: number }>;
  territories: Record<string, TerritoryHate>;
}

const REGIONS_FILE = path.join(process.cwd(), "data", "regions.json");
const HATE_FILE = path.join(process.cwd(), "data", "hate-territory.json");

let regionsCache: RegionsFile | null = null;
let hateCache: HateTerritoryFile | null = null;

export async function getRegions(): Promise<RegionsFile> {
  if (regionsCache) return regionsCache;
  regionsCache = JSON.parse(await fs.readFile(REGIONS_FILE, "utf-8")) as RegionsFile;
  return regionsCache;
}

export async function getHateTerritory(): Promise<HateTerritoryFile> {
  if (hateCache) return hateCache;
  hateCache = JSON.parse(await fs.readFile(HATE_FILE, "utf-8")) as HateTerritoryFile;
  return hateCache;
}

