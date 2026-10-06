export interface Formation {
  short: string;
  nif: string | null;
  family: string;
}

/** The fields of a register row the join reads. */
export interface JoinRow {
  slug: string;
  name: string;
  partyNif: string | null;
}

/** The fields of a deputy the join reads. */
export interface JoinDeputy {
  name: string;
  formation: string | null;
}

export interface DeputyLink<R, D> {
  deputy: D;
  row: R;
  via: "name" | "alias";
}

export interface UnresolvedDeputy<R, D> {
  deputy: D;
  reason: "alias-missing" | "name-collision" | "party-family" | "candidate";
  candidates: R[];
}

export const FORMATIONS: Record<string, Formation>;
export const DEPUTY_ALIASES: Record<string, string>;
export function deputySlug(fullName: string): string;
export function formationOf(label: string | null): Formation | null;
export function familiesAgree(row: JoinRow, deputy: JoinDeputy): boolean;
export function linkDeputies<R extends JoinRow, D extends JoinDeputy>(
  register: R[],
  deputies: D[],
): {
  links: DeputyLink<R, D>[];
  congresoOnly: D[];
  unresolved: UnresolvedDeputy<R, D>[];
};
