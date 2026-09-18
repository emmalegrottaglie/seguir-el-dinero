/**
 * One identity per comunidad autónoma, across four sources that each name them
 * differently.
 *
 * The map keys on INE's two-digit codes, and so do the governments, the
 * hate-crime file and the provinces. The two remaining sources do not:
 *
 * - The register of senior appointments writes "Comunidad Valenciana",
 *   "Islas Baleares", "País Vasco".
 * - INE's own survey tables invert the name so it sorts under the right letter:
 *   "Rioja, La", "Balears, Illes", "Asturias, Principado de", and they space the
 *   hyphen in "Castilla - La Mancha".
 *
 * Fuzzy matching across those would work most of the time, which is the problem:
 * the failure mode is a page headed with a reader's own province showing another
 * region's government and another region's poverty rate. So the aliases are
 * written out, and `npm run check:territories` fails the build if any source
 * ever emits a string this table does not carry.
 *
 * Same posture as `FORMATION_NIF` in `lib/spending.ts`, and for the same reason:
 * where names are the only join key available, an explicit table is the honest
 * implementation and a similarity score is not.
 */

export interface Territory {
  /** INE's two-digit code. The canonical id everywhere on this site. */
  id: string;
  /** As `data/regions.json` names it — the map's own label. */
  mapName: string;
  /** As the register of senior appointments writes it. */
  registerName: string;
  /**
   * As INE's survey tables write it, or null if INE stops naming it at all.
   *
   * Carrying the name is not a promise that every table has a row for it. EAES
   * publishes wage percentiles for the seventeen comunidades and not for Ceuta
   * or Melilla, while the poverty tables do carry both, so absence is a fact
   * about one series rather than about the territory. A page asks the series it
   * is drawing and states the gap where there is one.
   */
  ineName: string | null;
}

export const TERRITORIES: Territory[] = [
  { id: "01", mapName: "Andalucía", registerName: "Andalucía", ineName: "Andalucía" },
  { id: "02", mapName: "Aragón", registerName: "Aragón", ineName: "Aragón" },
  {
    id: "03",
    mapName: "Principado de Asturias",
    registerName: "Asturias",
    ineName: "Asturias, Principado de",
  },
  { id: "04", mapName: "Illes Balears", registerName: "Islas Baleares", ineName: "Balears, Illes" },
  { id: "05", mapName: "Canarias", registerName: "Canarias", ineName: "Canarias" },
  { id: "06", mapName: "Cantabria", registerName: "Cantabria", ineName: "Cantabria" },
  { id: "07", mapName: "Castilla y León", registerName: "Castilla y León", ineName: "Castilla y León" },
  {
    id: "08",
    mapName: "Castilla-La Mancha",
    registerName: "Castilla-La Mancha",
    ineName: "Castilla - La Mancha",
  },
  { id: "09", mapName: "Cataluña/Catalunya", registerName: "Cataluña", ineName: "Cataluña" },
  {
    id: "10",
    mapName: "Comunitat Valenciana",
    registerName: "Comunidad Valenciana",
    ineName: "Comunitat Valenciana",
  },
  { id: "11", mapName: "Extremadura", registerName: "Extremadura", ineName: "Extremadura" },
  { id: "12", mapName: "Galicia", registerName: "Galicia", ineName: "Galicia" },
  {
    id: "13",
    mapName: "Comunidad de Madrid",
    registerName: "Comunidad de Madrid",
    ineName: "Madrid, Comunidad de",
  },
  {
    id: "14",
    mapName: "Región de Murcia",
    registerName: "Región de Murcia",
    ineName: "Murcia, Región de",
  },
  {
    id: "15",
    mapName: "Comunidad Foral de Navarra",
    registerName: "Navarra",
    ineName: "Navarra, Comunidad Foral de",
  },
  { id: "16", mapName: "País Vasco/Euskadi", registerName: "País Vasco", ineName: "País Vasco" },
  { id: "17", mapName: "La Rioja", registerName: "La Rioja", ineName: "Rioja, La" },
  {
    id: "18",
    mapName: "Ciudad Autónoma de Ceuta",
    registerName: "Ceuta",
    ineName: "Ceuta",
  },
  {
    id: "19",
    mapName: "Ciudad Autónoma de Melilla",
    registerName: "Melilla",
    ineName: "Melilla",
  },
];

const BY_ID = new Map(TERRITORIES.map((t) => [t.id, t]));
const BY_REGISTER = new Map(TERRITORIES.map((t) => [t.registerName, t]));
const BY_INE = new Map(
  TERRITORIES.filter((t) => t.ineName !== null).map((t) => [t.ineName as string, t]),
);

export function territoryById(id: string): Territory | null {
  return BY_ID.get(id) ?? null;
}

/** The territory a register row's `region` names, or null when it names none. */
export function territoryForRegister(region: string | null): Territory | null {
  return region === null ? null : BY_REGISTER.get(region) ?? null;
}

/** The territory an INE series names, or null when the name is unknown here. */
export function territoryForIne(region: string): Territory | null {
  return BY_INE.get(region) ?? null;
}
