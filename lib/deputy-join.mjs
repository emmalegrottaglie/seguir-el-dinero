// Joins Congreso's roster of sitting deputies to the pay register. Plain JS so that
// lib/people.ts and scripts/check-deputies.mjs run the very same rule: a second copy of a join
// rule drifts from the first (AGENTS.md, on check:office-join).
//
// A deputy and a register row are treated as one person only when both conditions hold, the same
// two the officeholder-ties join uses:
//
//   1. Exactly one register row carries the deputy's folded name, or DEPUTY_ALIASES names the row.
//   2. Their party families agree, or one side records no party.
//
// A deputy whose name appears nowhere in the register, not even as a subset of a longer name,
// gets a profile of their own. Everything in between is left unresolved and reported rather than
// guessed, because a wrong link would put one person's declarations on another person's page.

import { foldText, foldTokens, nameKey } from "./name-key.mjs";

/**
 * Electoral formations as Congreso's open data spells them. `nif` is set only where the label
 * names a single party, so it can link to that party's funding. SUMAR was a coalition list and
 * the PSOE regional federations are not separate registrants in the subsidy data, so they keep
 * their label and link nowhere, as GroupBreakdown does for composite groups.
 */
export const FORMATIONS = {
  PP: { short: "PP", nif: "G28570927", family: "pp" },
  VOX: { short: "Vox", nif: "G86867108", family: "vox" },
  PSOE: { short: "PSOE", nif: "G28477727", family: "psoe" },
  "PSC-PSOE": { short: "PSC", nif: "G08564379", family: "psoe" },
  "PsdeG-PSOE": { short: "PsdeG-PSOE", nif: null, family: "psoe" },
  "PSIB-PSOE": { short: "PSIB-PSOE", nif: null, family: "psoe" },
  "PSE-EE (PSOE)": { short: "PSE-EE (PSOE)", nif: null, family: "psoe" },
  "PSN-PSOE": { short: "PSN-PSOE", nif: null, family: "psoe" },
  SUMAR: { short: "Sumar", nif: null, family: "sumar" },
  "EAJ-PNV": { short: "PNV", nif: "G48103956", family: "pnv" },
  "EH Bildu": { short: "EH Bildu", nif: "G71206700", family: "bildu" },
  ERC: { short: "ERC", nif: "G08678120", family: "erc" },
  "JxCAT-JUNTS": { short: "Junts", nif: "V13942677", family: "junts" },
  UPN: { short: "UPN", nif: "G31096274", family: "upn" },
  BNG: { short: "BNG", nif: "G32014003", family: "bng" },
  CCa: { short: "CC", nif: "V38319562", family: "cc" },
};

/**
 * Party family of a register row, by the NIF the register build attached. A family is only a
 * consistency check between two records of one person, never a claim about membership: PSC sits
 * with PSOE, and the parties that stood on the 2023 SUMAR list sit with Sumar.
 */
const FAMILY_BY_NIF = {
  G28570927: "pp",
  G28477727: "psoe",
  G08564379: "psoe",
  G86867108: "vox",
  G48103956: "pnv",
  G08678120: "erc",
  G71206700: "bildu",
  V13942677: "junts",
  G64283310: "cs",
  G88309315: "sumar",
  G13855663: "sumar",
  G78269206: "sumar",
  G86976941: "sumar",
  G98282213: "sumar",
  V38319562: "cc",
  G31096274: "upn",
  G32014003: "bng",
  G39036579: "prc",
  G74297664: "foro",
};

/**
 * Deputies the register carries under a longer or shorter form of the same name, each read by
 * eye against the register row's post and party before being listed. Keyed by Congreso's own
 * spelling ("Apellidos, Nombre"), valued by register slug. check:deputies proposes candidates;
 * nothing joins on a candidate until it is listed here.
 *
 * Reviewed 2026-10-05. Every row below was the only candidate, holds a Congreso post in the
 * register (Diputado/a, "Diputada del/en el Congreso", Presidenta de la Mesa), is carried with
 * the municipality "Madrid" the register gives Congress deputies, and agrees on party family.
 */
export const DEPUTY_ALIASES = {
  "Armengol Socias, Francina": "francina-armengol-i-socias",
  "Cuesta Rodríguez, María": "maria-del-socorro-cuesta-rodriguez",
  "González Herdaro, Ana": "ana-maria-gonzalez-herdaro",
  "Iniesta Egido, Isabel": "isabel-belen-iniesta-egido",
  "Lago Peñas, Manuel": "jose-manuel-lago-penas",
  "Leal Fernández, Isaura": "maria-isaura-leal-fernandez",
  "Otero García, Mercedes": "maria-mercedes-otero-garcia",
  "Plaza García, Inés": "ines-maria-plaza-garcia",
  "Quintana Carballo, Rosa": "rosa-maria-quintana-carballo",
  "Sánchez Díaz, María Carmen": "maria-del-carmen-sanchez-diaz",
  "Tellado Filgueira, Miguel": "miguel-angel-tellado-filgueira",
  "Teniente Sánchez, Cristina": "cristina-elena-teniente-sanchez",
};

/** URL segment for a deputy outside the register, in the register's own slug style. */
export function deputySlug(fullName) {
  return foldText(fullName)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formationOf(label) {
  return FORMATIONS[label] ?? null;
}

export function familiesAgree(row, deputy) {
  const a = row.partyNif ? FAMILY_BY_NIF[row.partyNif] : undefined;
  const b = FORMATIONS[deputy.formation]?.family;
  return !a || !b || a === b;
}

/** Register rows whose name contains the deputy's name, or is contained in it. */
function candidatesFor(deputy, indexed) {
  const tokens = foldTokens(deputy.name);
  const own = new Set(tokens);
  return indexed
    .filter(
      ({ t }) => tokens.every((x) => t.has(x)) || (t.size >= 3 && [...t].every((x) => own.has(x))),
    )
    .map(({ row }) => row);
}

export function linkDeputies(register, deputies) {
  const byKey = new Map();
  for (const row of register) {
    const k = nameKey(row.name);
    byKey.set(k, [...(byKey.get(k) ?? []), row]);
  }
  const bySlug = new Map(register.map((row) => [row.slug, row]));
  const indexed = register.map((row) => ({ row, t: new Set(foldTokens(row.name)) }));

  const links = [];
  const congresoOnly = [];
  const unresolved = [];

  for (const deputy of deputies) {
    const alias = DEPUTY_ALIASES[deputy.name];
    let row = null;
    let via = "name";
    if (alias) {
      row = bySlug.get(alias) ?? null;
      via = "alias";
      if (!row) {
        unresolved.push({ deputy, reason: "alias-missing", candidates: [] });
        continue;
      }
    } else {
      const hits = byKey.get(nameKey(deputy.name)) ?? [];
      if (hits.length > 1) {
        unresolved.push({ deputy, reason: "name-collision", candidates: hits });
        continue;
      }
      row = hits[0] ?? null;
    }

    if (row) {
      if (familiesAgree(row, deputy)) links.push({ deputy, row, via });
      else unresolved.push({ deputy, reason: "party-family", candidates: [row] });
      continue;
    }

    const candidates = candidatesFor(deputy, indexed);
    if (candidates.length) unresolved.push({ deputy, reason: "candidate", candidates });
    else congresoOnly.push(deputy);
  }

  return { links, congresoOnly, unresolved };
}
