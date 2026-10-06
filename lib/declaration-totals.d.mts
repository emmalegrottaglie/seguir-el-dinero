export interface DeclarationTotals {
  income: number | null;
  financial: number | null;
  debts: number | null;
  irpf: number | null;
}

/** The fields the totals read; AssetDeclaration satisfies it. */
export interface TotalsInput {
  income: { amount: number | null }[];
  irpf: number | null;
  deposits: { amount: number | null }[];
  otherAssets: { amount: number | null }[];
  loans: { pending: number | null }[];
}

export function declarationTotals(d: TotalsInput): DeclarationTotals;
