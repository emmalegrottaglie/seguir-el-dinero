import { promises as fs } from "node:fs";
import path from "node:path";
import { PARTIES } from "./parties";

// What the electoral money was declared to have bought.
//
// Extracted by scripts/extract-electoral-spending.py from the Tribunal de
// Cuentas fiscalización of an election's accounts. The extractor recomputes the
// report's own arithmetic for every formation and aborts on a mismatch, so the
// figures here reconcile with the report by construction.
//
// The categories are the report's, not ours, and that is the point. Spanish law
// caps two kinds of advertising — outdoor under LOREG art. 55 and press/radio
// under art. 58 — and those are itemised. Mailings of propaganda are accounted
// separately, outside the general spending limit. Everything else falls into one
// residual line, "Otros gastos ordinarios", which is not broken down further.

export interface FormationSpending {
  name: string;
  resources: {
    private: number;
    borrowing: number;
    subsidyAdvances: number;
    fromParty: number;
    other: number;
    total: number;
  };
  ordinary: {
    declared: number;
    outdoorAdvertising: number;
    pressRadioAdvertising: number;
    financialSettled: number;
    financialEstimated: number;
    otherOrdinary: number;
    reclassifiedNet: number;
    notSubsidisable: number;
    nonElectoral: number;
    mailingsInLimit: number;
    totalJustified: number;
  };
  mailings: {
    declared: number;
    otherMailing: number;
    reclassifiedNet: number;
    notSubsidisable: number;
    totalJustified: number;
    countWithSubsidyRight: number;
  };
  limits: {
    exceededMaximum: boolean | null;
    exceededOutdoorAdvertising: boolean | null;
  };
}

export interface SpendingFile {
  source: { body: string; report: string; approved: string; election: string; url: string };
  formations: FormationSpending[];
}

const FILE = path.join(process.cwd(), "data", "electoral-spending.json");
let cache: SpendingFile | null = null;

export async function getSpending(): Promise<SpendingFile> {
  if (cache) return cache;
  cache = JSON.parse(await fs.readFile(FILE, "utf-8")) as SpendingFile;
  return cache;
}

/**
 * The party each audited formation belongs to, by the name the report uses.
 *
 * Explicit rather than resolved by token matching, because five of these are
 * coalition labels that no rule resolves honestly — "AHORA REPÚBLICAS" shares
 * no word with any party's registered name, and "COALICIÓN POR UNA EUROPA
 * SOLIDARIA" shares none either. Where a coalition has several members the
 * NIF is the formation that led the list, which is what makes the colour
 * recognisable; the report's own full name is still what the chart labels it
 * with, so nothing here shortens a coalition to one of its parties in text.
 *
 * A name that is not here yields no NIF and the caller falls back to a neutral
 * fill, which is the honest outcome for a formation nobody has checked.
 */
const FORMATION_NIF: Record<string, string> = {
  "PARTIDO POPULAR": "G28570927",
  "PARTIDO SOCIALISTA OBRERO ESPAÑOL": "G28477727",
  VOX: "G86867108",
  PODEMOS: "G86976941",
  SUMAR: "G13855663",
  // ERC led the list; EH Bildu, BNG and Ara Més also stood on it.
  "AHORA REPÚBLICAS (ERC-EH BILDU-BNG-ARA MÉS)": "G08678120",
  "JUNTS I LLIURES PER EUROPA": "V13942677",
  // CEUS, led by the PNV.
  "COALICIÓN POR UNA EUROPA SOLIDARIA": "G48103956",
};

/** The NIF of the party a formation belongs to, or null if unmapped. */
export function formationNif(name: string): string | null {
  return FORMATION_NIF[name.trim().toUpperCase()] ?? null;
}

/**
 * The colour for a formation's segment: its party's, or a neutral grey where
 * the formation is not in the map. Never `undefined`, which an SVG paints
 * black.
 */
export function formationColor(name: string): string {
  const nif = formationNif(name);
  return (nif && PARTIES[nif]?.color) || "var(--grey-500)";
}

/** The two advertising lines are the only expenditure the law caps. */
export function advertising(f: FormationSpending): number {
  return f.ordinary.outdoorAdvertising + f.ordinary.pressRadioAdvertising;
}

export function financial(f: FormationSpending): number {
  return f.ordinary.financialSettled + f.ordinary.financialEstimated;
}

/**
 * Totals across every formation in the report, with the share of declared
 * ordinary spending that sits in the residual line.
 *
 * That share is the finding this layer exists to publish: it is the part of the
 * money whose destination the report does not state.
 */
export function spendingTotals(data: SpendingFile) {
  const t = data.formations.reduce(
    (acc, f) => ({
      declared: acc.declared + f.ordinary.declared,
      advertising: acc.advertising + advertising(f),
      financial: acc.financial + financial(f),
      other: acc.other + f.ordinary.otherOrdinary,
      mailings: acc.mailings + f.mailings.totalJustified,
      mailingCount: acc.mailingCount + f.mailings.countWithSubsidyRight,
    }),
    { declared: 0, advertising: 0, financial: 0, other: 0, mailings: 0, mailingCount: 0 },
  );
  return { ...t, otherShare: t.declared > 0 ? t.other / t.declared : 0 };
}

/** Formations ranked by declared ordinary spending, descending. */
export function rankedBySpending(data: SpendingFile): FormationSpending[] {
  return [...data.formations].sort((a, b) => b.ordinary.declared - a.ordinary.declared);
}
