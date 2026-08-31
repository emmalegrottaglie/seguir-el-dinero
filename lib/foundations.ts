// Money reaching the foundations and associations tied to political parties.
//
// Source: Tribunal de Cuentas, "Las fundaciones y entidades vinculadas a los
// partidos políticos duplicaron en 2021 y 2022 sus donaciones recibidas respecto
// al ejercicio 2020" (press release, 26 September 2025), reporting its audit of
// the 2021 and 2022 financial years.
// https://tcu.es/es/Comunicacion-y-Espacio-Divulgativo/Las-fundaciones-y-entidades-vinculadas-a-los-partidos-politicos-duplicaron-en-2021-y-2022-sus-donaciones-recibidas-respecto-al-ejercicio-2020/
//
// These are the aggregate figures the Tribunal published. The per-foundation
// breakdown lives in the full report, which is not loaded here — so this layer
// names no individual foundation and attributes nothing to a specific party.

export const FOUNDATIONS_SOURCE = {
  body: "Tribunal de Cuentas",
  title:
    "Las fundaciones y entidades vinculadas a los partidos políticos duplicaron en 2021 y 2022 sus donaciones recibidas respecto al ejercicio 2020",
  published: "2025-09-26",
  url: "https://tcu.es/es/Comunicacion-y-Espacio-Divulgativo/Las-fundaciones-y-entidades-vinculadas-a-los-partidos-politicos-duplicaron-en-2021-y-2022-sus-donaciones-recibidas-respecto-al-ejercicio-2020/",
  /** Legal basis for how these entities may be funded. */
  lawUrl: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-13022",
};

export interface FoundationYear {
  year: number;
  /** Private donations received, in euros. */
  privateDonations: number;
  /** Public subsidies received, in euros. */
  publicSubsidies: number;
  /** Entities covered by the audit that year. */
  entities: number;
}

export const FOUNDATION_YEARS: FoundationYear[] = [
  { year: 2021, privateDonations: 3_800_000, publicSubsidies: 2_400_000, entities: 36 },
  { year: 2022, privateDonations: 4_100_000, publicSubsidies: 2_500_000, entities: 34 },
];

export function foundationTotals() {
  return FOUNDATION_YEARS.reduce(
    (acc, y) => ({
      privateDonations: acc.privateDonations + y.privateDonations,
      publicSubsidies: acc.publicSubsidies + y.publicSubsidies,
    }),
    { privateDonations: 0, publicSubsidies: 0 },
  );
}
