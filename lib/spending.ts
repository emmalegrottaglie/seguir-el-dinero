import { promises as fs } from "node:fs";
import path from "node:path";

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
