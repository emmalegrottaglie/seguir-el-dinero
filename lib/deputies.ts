import { promises as fs } from "node:fs";
import path from "node:path";

export type FilingKind = "bienes" | "intereses" | "actividades";

export interface Filing {
  kind: FilingKind;
  /** From the filename; null for the activities register, which Congreso does not date. */
  date: string | null;
  url: string;
}

/** A sitting deputy, as Congreso's open data and the deputy's own ficha describe them. */
export interface Deputy {
  slug: string;
  /** Congreso's spelling, "Apellidos, Nombre" — the same spelling the roll calls use. */
  name: string;
  /** "Nombre Apellidos", from the ficha. */
  fullName: string;
  cod: number;
  ficha: string;
  role: "Diputado" | "Diputada";
  constituency: string;
  /** Electoral list as Congreso spells it, e.g. "PSC-PSOE", "SUMAR". */
  formation: string;
  group: string;
  since: string;
  /** Every declaration the ficha links, oldest first. */
  filings: Filing[];
}

export interface DeputiesData {
  generatedAt: string;
  source: { name: string; url: string };
  legislature: string;
  count: number;
  deputies: Deputy[];
}

const FILE = path.join(process.cwd(), "data", "deputies.json");
let cache: DeputiesData | null = null;

/** Written by scripts/fetch-deputies.mjs; read once per server instance. */
export async function getDeputies(): Promise<DeputiesData> {
  if (cache) return cache;
  cache = JSON.parse(await fs.readFile(FILE, "utf-8")) as DeputiesData;
  return cache;
}
