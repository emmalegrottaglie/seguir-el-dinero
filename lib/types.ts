// Shape of a single concession record as returned by BDNS / stored in the snapshot.
export interface ConcesionRecord {
  id: number;
  codConcesion: string;
  fechaConcesion: string; // ISO date "YYYY-MM-DD"
  beneficiario: string; // "<NIF> <NAME>", e.g. "G28570927 PARTIDO POPULAR"
  instrumento: string;
  importe: number;
  ayudaEquivalente: number;
  urlBR: string; // link to legal basis (BOE)
  numeroConvocatoria: string;
  idConvocatoria: number;
  convocatoria: string; // e.g. "...(Financiación Ordinaria) ejercicio 2026..."
  nivel1: string; // ESTADO
  nivel2: string; // MINISTERIO DEL INTERIOR
  nivel3: string; // D.G. DE POLÍTICA INTERIOR
  rutaConvocatoria?: string;
}

export interface Snapshot {
  generatedAt: string;
  source: {
    system: string;
    organos: string;
    url: string;
    query?: string;
    endpoint?: string;
  };
  records: ConcesionRecord[];
}

// Kind of subsidy, parsed from the convocatoria text.
export type SubsidyKind = "ordinaria" | "seguridad" | "otra";

// A single normalized concession (record + derived fields).
export interface Grant {
  id: number;
  nif: string;
  rawName: string;
  amount: number;
  date: string;
  year: number;
  kind: SubsidyKind;
  convocatoria: string;
  legalUrl: string;
  organ: string; // nivel2 + nivel3
}

// Aggregated totals for one party.
export interface PartyTotals {
  nif: string;
  displayName: string;
  shortName: string;
  color: string;
  bloc: Bloc;
  total: number;
  byKind: Record<SubsidyKind, number>;
  byYear: Record<number, number>;
  grants: Grant[];
  share: number; // fraction of grand total
}

export type Bloc =
  | "derecha"
  | "izquierda"
  | "nacionalista"
  | "regionalista"
  | "otro";

export interface Aggregation {
  generatedAt: string;
  source: Snapshot["source"];
  grandTotal: number;
  years: number[];
  parties: PartyTotals[];
}
