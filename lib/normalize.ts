import type {
  Aggregation,
  ConcesionRecord,
  Grant,
  PartyTotals,
  Snapshot,
  SubsidyKind,
} from "./types";
import { partyMeta } from "./parties";

// Split "G28570927 PARTIDO POPULAR" into its NIF prefix and name.
export function parseBeneficiario(beneficiario: string): { nif: string; name: string } {
  const trimmed = beneficiario.trim();
  const sep = trimmed.indexOf(" ");
  if (sep === -1) return { nif: trimmed, name: trimmed };
  return { nif: trimmed.slice(0, sep), name: trimmed.slice(sep + 1).trim() };
}

// Classify a subsidy by its convocatoria text.
export function classifyKind(convocatoria: string): SubsidyKind {
  const c = convocatoria.toLowerCase();
  // Source spelling varies: "financiación ordinaria" / "financiación ordinara" (sic).
  if (c.includes("ordina")) return "ordinaria";
  if (c.includes("seguridad")) return "seguridad";
  return "otra";
}

const EMPTY_KINDS = (): Record<SubsidyKind, number> => ({ ordinaria: 0, seguridad: 0, otra: 0 });

function toGrant(r: ConcesionRecord): Grant {
  const { nif, name } = parseBeneficiario(r.beneficiario);
  return {
    id: r.id,
    nif,
    rawName: name,
    amount: r.importe,
    date: r.fechaConcesion,
    year: Number(r.fechaConcesion.slice(0, 4)),
    kind: classifyKind(r.convocatoria),
    convocatoria: r.convocatoria.trim(),
    legalUrl: r.urlBR,
    organ: [r.nivel2, r.nivel3].filter(Boolean).join(" · "),
  };
}

// Aggregate a raw snapshot into per-party totals, sorted by total descending.
export function aggregate(snapshot: Snapshot): Aggregation {
  const grants = snapshot.records.map(toGrant);
  const byNif = new Map<string, Grant[]>();
  for (const g of grants) {
    const list = byNif.get(g.nif);
    if (list) list.push(g);
    else byNif.set(g.nif, [g]);
  }

  const grandTotal = grants.reduce((s, g) => s + g.amount, 0);
  const yearSet = new Set<number>();

  const parties: PartyTotals[] = [];
  for (const [nif, list] of byNif) {
    const meta = partyMeta(nif, list[0].rawName);
    const byKind = EMPTY_KINDS();
    const byYear: Record<number, number> = {};
    let total = 0;
    for (const g of list) {
      total += g.amount;
      byKind[g.kind] += g.amount;
      byYear[g.year] = (byYear[g.year] ?? 0) + g.amount;
      yearSet.add(g.year);
    }
    list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.amount - a.amount));
    parties.push({
      nif,
      displayName: meta.displayName,
      shortName: meta.shortName,
      color: meta.color,
      bloc: meta.bloc,
      total,
      byKind,
      byYear,
      grants: list,
      share: grandTotal ? total / grandTotal : 0,
    });
  }

  parties.sort((a, b) => b.total - a.total);

  return {
    generatedAt: snapshot.generatedAt,
    source: snapshot.source,
    grandTotal,
    years: [...yearSet].sort((a, b) => a - b),
    parties,
  };
}

// Recompute an aggregation filtered to a subset of years and/or a single kind.
export function filterAggregation(
  agg: Aggregation,
  opts: { years?: number[]; kind?: SubsidyKind | "all" },
): Aggregation {
  const years = opts.years && opts.years.length ? new Set(opts.years) : null;
  const kind = opts.kind && opts.kind !== "all" ? opts.kind : null;
  if (!years && !kind) return agg;

  const parties: PartyTotals[] = [];
  let grandTotal = 0;
  for (const p of agg.parties) {
    const grants = p.grants.filter(
      (g) => (!years || years.has(g.year)) && (!kind || g.kind === kind),
    );
    if (!grants.length) continue;
    const byKind = EMPTY_KINDS();
    const byYear: Record<number, number> = {};
    let total = 0;
    for (const g of grants) {
      total += g.amount;
      byKind[g.kind] += g.amount;
      byYear[g.year] = (byYear[g.year] ?? 0) + g.amount;
    }
    grandTotal += total;
    parties.push({ ...p, total, byKind, byYear, grants });
  }
  parties.sort((a, b) => b.total - a.total);
  for (const p of parties) p.share = grandTotal ? p.total / grandTotal : 0;

  return { ...agg, grandTotal, parties };
}
