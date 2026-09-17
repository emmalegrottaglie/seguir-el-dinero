/**
 * Resolving a postcode to a province, with nothing that touches the filesystem.
 *
 * Split out of `lib/provinces.ts` deliberately. That module reads
 * `data/provinces.json` and therefore imports `node:fs`, and a client component
 * that imports `node:fs` does not fail at runtime — it fails the build. The
 * postcode box is a client component, so the pure arithmetic lives here and the
 * 52 rows are handed to it as a prop.
 */

export interface Province {
  /** Two-digit INE code, and the first two digits of every postcode in it. */
  code: string;
  /** Official name, in reading order, bilingual where the province is. */
  name: string;
  /** URL segment, from the first of a bilingual pair. */
  slug: string;
  /** The comunidad autónoma it belongs to, as a `lib/territories.ts` id. */
  territoryId: string;
}

/**
 * The province a Spanish postcode falls in, from its first two digits.
 *
 * Pure string arithmetic, so it runs in the reader's browser: the postcode is
 * resolved where it was typed and is never part of a request. Returns null for
 * anything that is not five digits, or whose prefix is not one of the 52 codes,
 * rather than guessing at a nearby one.
 */
export function provinceForPostcode(postcode: string, provinces: Province[]): Province | null {
  const digits = postcode.trim();
  if (!/^\d{5}$/.test(digits)) return null;
  return provinces.find((p) => p.code === digits.slice(0, 2)) ?? null;
}
