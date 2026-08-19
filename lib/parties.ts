import type { Bloc } from "./types";

// Canonical registry of parties, keyed by NIF (the join key across all data layers).
// Colors are muted, dossier-friendly tones — recognisable but tuned to the palette.
export interface PartyMeta {
  shortName: string;
  displayName: string;
  color: string;
  bloc: Bloc;
}

export const PARTIES: Record<string, PartyMeta> = {
  G28570927: { shortName: "PP", displayName: "Partido Popular", color: "#4a86c5", bloc: "derecha" },
  G28477727: { shortName: "PSOE", displayName: "Partido Socialista Obrero Español", color: "#d64545", bloc: "izquierda" },
  G86867108: { shortName: "Vox", displayName: "Vox", color: "#7bab54", bloc: "derecha" },
  G08564379: { shortName: "PSC", displayName: "Partit dels Socialistes de Catalunya", color: "#e0736f", bloc: "izquierda" },
  G78269206: { shortName: "IU", displayName: "Izquierda Unida", color: "#b5343a", bloc: "izquierda" },
  G13855663: { shortName: "Sumar", displayName: "Movimiento Sumar", color: "#c7527f", bloc: "izquierda" },
  G86976941: { shortName: "Podemos", displayName: "Podemos", color: "#8b5cc4", bloc: "izquierda" },
  V13942677: { shortName: "Junts", displayName: "Junts per Catalunya", color: "#2ba39a", bloc: "nacionalista" },
  G71206700: { shortName: "EH Bildu", displayName: "Euskal Herria Bildu", color: "#4fa06a", bloc: "nacionalista" },
  G67072074: { shortName: "Comuns", displayName: "Catalunya en Comú", color: "#3fae86", bloc: "izquierda" },
  G08678120: { shortName: "ERC", displayName: "Esquerra Republicana de Catalunya", color: "#e0a44a", bloc: "nacionalista" },
  G48103956: { shortName: "PNV", displayName: "Eusko Alderdi Jeltzalea — PNV", color: "#5a9b4e", bloc: "nacionalista" },
  G88309315: { shortName: "Más Madrid", displayName: "Más Madrid", color: "#59bd84", bloc: "izquierda" },
  G98282213: { shortName: "Compromís", displayName: "Coalició Compromís", color: "#e0902a", bloc: "regionalista" },
  G32014003: { shortName: "BNG", displayName: "Bloque Nacionalista Galego", color: "#5aa5cf", bloc: "nacionalista" },
  V38319562: { shortName: "CC", displayName: "Coalición Canaria", color: "#e6c94a", bloc: "regionalista" },
  G31096274: { shortName: "UPN", displayName: "Unión del Pueblo Navarro", color: "#3a6ea5", bloc: "regionalista" },
  G86273414: { shortName: "Equo", displayName: "Equo", color: "#66a83f", bloc: "izquierda" },
  G44677813: { shortName: "Drago", displayName: "Partido Drago Canarias", color: "#33b0a0", bloc: "regionalista" },
  G67833186: { shortName: "Alianza Verde", displayName: "Alianza Verde", color: "#5c9e35", bloc: "izquierda" },
  G57910457: { shortName: "Més", displayName: "Més per Mallorca", color: "#e08a3a", bloc: "regionalista" },
  // Historical / coalition NIFs present in the 2022–2026 record set.
  G64283310: { shortName: "Cs", displayName: "Ciudadanos", color: "#e8843a", bloc: "derecha" },
  G66848755: { shortName: "PDeCAT", displayName: "Partit Demòcrata Europeu Català", color: "#2a9d8f", bloc: "nacionalista" },
  G59736926: { shortName: "CUP", displayName: "Candidatura d'Unitat Popular", color: "#e0c14a", bloc: "nacionalista" },
  V98725781: { shortName: "Compromís (coal.)", displayName: "Coalició Compromís (Bloc-Iniciativa-Verds)", color: "#e0902a", bloc: "regionalista" },
  G38319562: { shortName: "CC (coal.)", displayName: "Coalición Canaria (coalición)", color: "#e6c94a", bloc: "regionalista" },
  G39036579: { shortName: "PRC", displayName: "Partido Regionalista de Cantabria", color: "#4a9b6e", bloc: "regionalista" },
  G74297664: { shortName: "Foro", displayName: "Foro de Ciudadanos (Foro Asturias)", color: "#3a6ea5", bloc: "regionalista" },
};

const FALLBACK_COLORS = ["#9a8f7d", "#8a8072", "#a89a84"];

export function partyMeta(nif: string, rawName: string): PartyMeta {
  const known = PARTIES[nif];
  if (known) return known;
  // Unknown NIF (new party appears in a future refresh): degrade gracefully.
  const clean = rawName.replace(/\s+/g, " ").trim();
  return {
    shortName: clean.length > 22 ? clean.slice(0, 20) + "…" : clean,
    displayName: clean,
    color: FALLBACK_COLORS[nif.charCodeAt(1) % FALLBACK_COLORS.length],
    bloc: "otro",
  };
}

export const BLOC_LABELS: Record<Bloc, string> = {
  derecha: "Derecha",
  izquierda: "Izquierda",
  nacionalista: "Nacionalista",
  regionalista: "Regionalista",
  otro: "Otro",
};
