import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * The 52 provinces, and the comunidad autónoma each one sits in.
 *
 * This is the bridge between what a reader knows about themselves and what this
 * site publishes. Everything here is measured per comunidad autónoma, and
 * almost nobody thinks of where they live that way first — they know their town
 * and they know their postcode. The first two digits of a Spanish postcode are
 * the province code, and a province belongs to exactly one comunidad autónoma,
 * so those two digits are the whole journey.
 *
 * Because it is a lookup rather than a geocode, no address is needed and no
 * service is called: a postcode can be resolved in the reader's own browser and
 * never sent anywhere. The page that takes one says so.
 *
 * Built by `scripts/build-provinces.mjs` from INE's own province and comunidad
 * value lists, with the mapping taken from INE's hierarchy rather than typed
 * out — 52 rows of two-digit codes is exactly the sort of table that acquires a
 * silent transposition.
 */

export type { Province } from "./postcode";
import type { Province } from "./postcode";

export interface ProvincesFile {
  generatedAt: string;
  source: { body: string; name: string; url: string };
  provinces: Province[];
}

const FILE = path.join(process.cwd(), "data", "provinces.json");

let cache: ProvincesFile | null = null;

export async function getProvinces(): Promise<ProvincesFile> {
  if (cache) return cache;
  cache = JSON.parse(await fs.readFile(FILE, "utf-8")) as ProvincesFile;
  return cache;
}

export async function provinceBySlug(slug: string): Promise<Province | null> {
  const { provinces } = await getProvinces();
  return provinces.find((p) => p.slug === slug) ?? null;
}
