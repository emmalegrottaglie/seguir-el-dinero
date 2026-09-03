import { PARTIES } from "./parties";

// Parliamentary groups, per legislature.
//
// The Congreso's vote records identify a deputy's group by a short code — "GS",
// "GCUP-EC-GC", "GPlu". Those codes are meaningless to a reader, so the site
// shows the group's name and, where it is honest to do so, links to that party's
// funding page.
//
// A group is not a party. Several of these are coalitions of parties that share
// one group in the chamber, and pointing such a group at a single party's
// financing would attribute other parties' money to it. So each entry is either:
//
//   • single-party — `party` holds the NIF, and the row links to its funding; or
//   • composite    — `parties` lists the parties observed in it, and the row
//                    links to none of them.
//
// The single-party classification is evidence-based, not assumed. Joining every
// deputy in `data/votes.json` to the officeholder register by folded name gives,
// for each group, the distribution of party labels among the deputies that
// match. The counts below are that join's output, and a group is only marked
// single-party where every matched deputy carries the same party.
//
//   XIV  GP   57/57 PP        XV  GP      89/89 PP
//   XIV  GS   55 PSOE + 2 unlabelled      GS      73/73 PSOE
//   XIV  GVOX 26 Vox + 2 unlabelled       GVOX    26/26 Vox
//   XIV  GR    4/4 ERC                    GR       5/5 ERC
//   XIV  GEH Bildu 4/4 EH Bildu           GEH Bildu 5/5 EH Bildu
//   XIV  GV (EAJ-PNV) 3/3 PNV             GV (EAJ-PNV) 3/3 PNV
//                                         GJxCAT   6/6 Junts
//   XIV  GCUP-EC-GC Sumar 6, Podemos 4  → composite
//   XIV  GPlu Junts 3, CM 1, BNG 1      → composite
//   XIV  GMx  PP 2, CC 1, Teruel Existe 1 → composite
//   XV   GMx  Podemos 4, UPN 1, BNG 1, CC 1 → composite
//
// Two entries are deliberately not decided by that join:
//
//   • GSUMAR — every matched deputy carries the register label "Sumar", but
//     that label is the coalition's, not a single party's, and the group's own
//     name is "Plurinacional SUMAR". Treated as composite, because linking it
//     to the Movimiento Sumar NIF would attribute a coalition's votes to one of
//     its components.
//   • GCs — no register rows match at all, the party having dissolved. Marked
//     single-party on the strength of the group's name being the party's name,
//     with that lack of evidence recorded here.

export interface GroupInfo {
  /** Group code as it appears in the Congreso vote record. */
  code: string;
  /** How the group is named in the chamber, in full. */
  name: string;
  /** A short label for narrow columns and inline lists. */
  short: string;
  /** NIF of the one party this group belongs to, when there is exactly one. */
  party?: string;
  /** Party labels observed in a composite group, for display only. */
  parties?: string[];
}

const XIV: GroupInfo[] = [
  { code: "GS", name: "Grupo Parlamentario Socialista", short: "PSOE", party: "G28477727" },
  { code: "GP", name: "Grupo Parlamentario Popular", short: "PP", party: "G28570927" },
  { code: "GVOX", name: "Grupo Parlamentario VOX", short: "Vox", party: "G86867108" },
  {
    code: "GCUP-EC-GC",
    name: "Grupo Parlamentario Confederal de Unidas Podemos-En Comú Podem-Galicia en Común",
    short: "Unidas Podemos",
    parties: ["Podemos", "IU", "Comuns"],
  },
  { code: "GR", name: "Grupo Parlamentario Republicano", short: "ERC", party: "G08678120" },
  {
    code: "GPlu",
    name: "Grupo Parlamentario Plural",
    short: "Plural",
    parties: ["Junts", "BNG", "Compromís"],
  },
  { code: "GMx", name: "Grupo Parlamentario Mixto", short: "Mixto", parties: ["CC", "UPN"] },
  { code: "GCs", name: "Grupo Parlamentario Ciudadanos", short: "Cs", party: "G64283310" },
  {
    code: "GV (EAJ-PNV)",
    name: "Grupo Parlamentario Vasco (EAJ-PNV)",
    short: "PNV",
    party: "G48103956",
  },
  { code: "GEH Bildu", name: "Grupo Parlamentario Euskal Herria Bildu", short: "EH Bildu", party: "G71206700" },
];

const XV: GroupInfo[] = [
  { code: "GS", name: "Grupo Parlamentario Socialista", short: "PSOE", party: "G28477727" },
  { code: "GP", name: "Grupo Parlamentario Popular", short: "PP", party: "G28570927" },
  { code: "GVOX", name: "Grupo Parlamentario VOX", short: "Vox", party: "G86867108" },
  {
    code: "GSUMAR",
    name: "Grupo Parlamentario Plurinacional SUMAR",
    short: "Sumar",
    parties: ["Sumar", "IU", "Comuns", "Más Madrid", "Compromís"],
  },
  { code: "GR", name: "Grupo Parlamentario Republicano", short: "ERC", party: "G08678120" },
  { code: "GJxCAT", name: "Grupo Parlamentario Junts per Catalunya", short: "Junts", party: "V13942677" },
  { code: "GMx", name: "Grupo Parlamentario Mixto", short: "Mixto", parties: ["Podemos", "BNG", "CC", "UPN"] },
  {
    code: "GV (EAJ-PNV)",
    name: "Grupo Parlamentario Vasco (EAJ-PNV)",
    short: "PNV",
    party: "G48103956",
  },
  { code: "GEH Bildu", name: "Grupo Parlamentario Euskal Herria Bildu", short: "EH Bildu", party: "G71206700" },
];

const BY_LEGISLATURE: Record<string, GroupInfo[]> = { XIV, XV };

/**
 * Resolve a vote record's group code. Returns null for a code not in the
 * registry, so the caller falls back to showing the raw code rather than
 * inventing a name for a group nobody has checked.
 */
export function groupInfo(legislature: string, code: string): GroupInfo | null {
  return BY_LEGISLATURE[legislature]?.find((g) => g.code === code) ?? null;
}

/** The party this group's funding link should point at, if any. */
export function groupParty(info: GroupInfo | null) {
  if (!info?.party) return null;
  const meta = PARTIES[info.party];
  return meta ? { nif: info.party, ...meta } : null;
}

/** Colour for the group's swatch: its party's, or a neutral tone when composite. */
export function groupColor(info: GroupInfo | null): string {
  const p = groupParty(info);
  return p ? p.color : "var(--paper-faint)";
}

/** Short display label, falling back to the raw code. */
export function groupLabel(legislature: string, code: string): string {
  return groupInfo(legislature, code)?.short ?? code;
}

export const GROUPS_SOURCE = "https://www.congreso.es/es/grupos/composicion-en-la-legislatura";
