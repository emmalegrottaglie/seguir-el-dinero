// Registry of individual politicians. Each entry is manually curated and each
// Bluesky handle was VERIFIED (follower count + bio) before inclusion — Bluesky
// has weak identity checks, so unverifiable/squatted handles are excluded.
//
// Note: as of 2026, Bluesky-active Spanish politicians skew left/progressive;
// most PP and Vox leaders have no verifiable presence there. This is a property
// of the platform, not an editorial choice.
//
// There is deliberately NO per-politician funding figure: public subsidies are
// paid to parties, not individuals (see /metodologia). Each politician links to
// their party's public funding instead.

export interface Politician {
  slug: string;
  name: string;
  role: string;
  partyNif: string; // links to the party in PARTIES / the funding data
  bluesky?: string; // verified handle
  blueskyFollowers?: number; // approx, at time of verification (2026-08)
}

export const POLITICIANS: Politician[] = [
  {
    slug: "oscar-puente",
    name: "Óscar Puente",
    role: "Ministro de Transportes y Movilidad Sostenible",
    partyNif: "G28477727", // PSOE
    bluesky: "oscarpuente.bsky.social",
    blueskyFollowers: 63000,
  },
  {
    slug: "gabriel-rufian",
    name: "Gabriel Rufián",
    role: "Portavoz de ERC en el Congreso",
    partyNif: "G08678120", // ERC
    bluesky: "grufian.bsky.social",
    blueskyFollowers: 47000,
  },
  {
    slug: "yolanda-diaz",
    name: "Yolanda Díaz",
    role: "Vicepresidenta Segunda del Gobierno",
    partyNif: "G13855663", // Sumar
    bluesky: "yolandadiaz.bsky.social",
    blueskyFollowers: 39000,
  },
  {
    slug: "ione-belarra",
    name: "Ione Belarra",
    role: "Secretaria General de Podemos",
    partyNif: "G86976941", // Podemos
    bluesky: "ionebelarra.bsky.social",
    blueskyFollowers: 24000,
  },
  {
    slug: "ernest-urtasun",
    name: "Ernest Urtasun",
    role: "Ministro de Cultura",
    partyNif: "G67072074", // Catalunya en Comú
    bluesky: "ernesturtasun.bsky.social",
    blueskyFollowers: 13000,
  },
  {
    slug: "gerardo-pisarello",
    name: "Gerardo Pisarello",
    role: "Diputado (Sumar / Comuns)",
    partyNif: "G67072074", // Catalunya en Comú
    bluesky: "gerardopisarello.bsky.social",
    blueskyFollowers: 3700,
  },
];

export function getPolitician(slug: string): Politician | undefined {
  return POLITICIANS.find((p) => p.slug === slug);
}

export function politiciansByParty(nif: string): Politician[] {
  return POLITICIANS.filter((p) => p.partyNif === nif);
}
