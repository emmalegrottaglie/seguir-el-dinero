/**
 * Who holds each community's presidency.
 *
 * Curated and reviewed, like lib/politicians.ts and lib/foundation-people.ts —
 * there is no machine-readable national register of autonomous presidencies.
 * Every row carries the date the president took office, because a table without
 * dates cannot be checked and quietly goes stale: the Valencian presidency
 * changed hands in December 2025 within the same legislature and the same
 * party, which a partyless snapshot would have hidden.
 *
 * `party` is the NIF from lib/parties.ts where the party is in that registry,
 * so the colour comes from the one place party colours are defined.
 *
 * What is deliberately absent: whether a president's investiture depended on
 * Vox. The design specified that as a hatch overlay on this layer and it is the
 * most interesting thing on it, but it is not shippable from what is verified
 * here. Five PP presidencies were invested with Vox votes in July 2023 and
 * Vox then left three of those governments in July 2024, so one static overlay
 * would be wrong for part of the period it appeared to describe; and the
 * arrangement in at least one community has changed again since. It needs the
 * per-community investiture votes transcribed from each parliament's own
 * record, which is its own verification pass.
 */
export interface Government {
  id: string;
  president: string;
  /** NIF in PARTIES, or null for a party outside that registry. */
  partyNif: string | null;
  partyLabel: string;
  /** ISO date the president took office. */
  since: string;
}

export const GOVERNMENTS_SOURCE = {
  body: "Anexo: Presidencias autonómicas españolas",
  url: "https://es.wikipedia.org/wiki/Anexo:Presidencias_auton%C3%B3micas_espa%C3%B1olas",
  checked: "2026-09-09",
} as const;

export const GOVERNMENTS: Government[] = [
  { id: "01", president: "Juanma Moreno", partyNif: "G28570927", partyLabel: "PP", since: "2019-01-18" },
  { id: "02", president: "Jorge Azcón", partyNif: "G28570927", partyLabel: "PP", since: "2023-08-11" },
  { id: "03", president: "Adrián Barbón", partyNif: "G28477727", partyLabel: "PSOE", since: "2019-07-20" },
  { id: "04", president: "Marga Prohens", partyNif: "G28570927", partyLabel: "PP", since: "2023-07-07" },
  { id: "05", president: "Fernando Clavijo", partyNif: "V38319562", partyLabel: "CC", since: "2023-07-14" },
  { id: "06", president: "María José Sáenz de Buruaga", partyNif: "G28570927", partyLabel: "PP", since: "2023-07-05" },
  { id: "07", president: "Alfonso Fernández Mañueco", partyNif: "G28570927", partyLabel: "PP", since: "2019-07-12" },
  { id: "08", president: "Emiliano García-Page", partyNif: "G28477727", partyLabel: "PSOE", since: "2015-07-04" },
  { id: "09", president: "Salvador Illa", partyNif: "G08564379", partyLabel: "PSC", since: "2024-08-10" },
  { id: "10", president: "Juanfran Pérez Llorca", partyNif: "G28570927", partyLabel: "PP", since: "2025-12-02" },
  { id: "11", president: "María Guardiola", partyNif: "G28570927", partyLabel: "PP", since: "2023-07-17" },
  { id: "12", president: "Alfonso Rueda", partyNif: "G28570927", partyLabel: "PP", since: "2022-05-14" },
  { id: "13", president: "Isabel Díaz Ayuso", partyNif: "G28570927", partyLabel: "PP", since: "2019-08-19" },
  { id: "14", president: "Fernando López Miras", partyNif: "G28570927", partyLabel: "PP", since: "2017-04-27" },
  { id: "15", president: "María Chivite", partyNif: "G28477727", partyLabel: "PSN-PSOE", since: "2019-08-06" },
  { id: "16", president: "Imanol Pradales", partyNif: "G48103956", partyLabel: "PNV", since: "2024-06-22" },
  { id: "17", president: "Gonzalo Capellán", partyNif: "G28570927", partyLabel: "PP", since: "2023-07-05" },
  { id: "18", president: "Juan Jesús Vivas", partyNif: "G28570927", partyLabel: "PP", since: "2001-02-06" },
  { id: "19", president: "Juan José Imbroda", partyNif: "G28570927", partyLabel: "PP", since: "2023-07-08" },
];

export function governmentFor(id: string): Government | undefined {
  return GOVERNMENTS.find((g) => g.id === id);
}

/**
 * A shortened display name for a community.
 *
 * The geometry carries the IGN's full legal names — "Comunidad Foral de
 * Navarra", "Cataluña/Catalunya" — which are correct and belong in the dossier
 * panel, but are too long for a legend row or a tooltip title. The map is
 * explicit rather than derived: trimming "Comunidad de " or splitting on "/"
 * would be a rule that silently produces the wrong answer the first time a name
 * does not fit it.
 */
const SHORT: Record<string, string> = {
  "01": "Andalucía",
  "02": "Aragón",
  "03": "Asturias",
  "04": "Illes Balears",
  "05": "Canarias",
  "06": "Cantabria",
  "07": "Castilla y León",
  "08": "Castilla-La Mancha",
  "09": "Catalunya",
  "10": "C. Valenciana",
  "11": "Extremadura",
  "12": "Galicia",
  "13": "Madrid",
  "14": "Murcia",
  "15": "Navarra",
  "16": "Euskadi",
  "17": "La Rioja",
  "18": "Ceuta",
  "19": "Melilla",
};

export function shortName(id: string, fallback: string): string {
  return SHORT[id] ?? fallback;
}
