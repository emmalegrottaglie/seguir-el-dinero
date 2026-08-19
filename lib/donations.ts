// PRIVATE donations to political parties, ejercicio 2020.
// Source: Tribunal de Cuentas — Informe de fiscalización de las Cuentas Anuales
// de los Partidos Políticos, ejercicio 2020 (Informe nº 1573, aprobado
// 27/06/2024), "Gráfico 5. Donaciones del ejercicio 2020 por tramos".
// https://www.tcu.es/export/sites/portal/repositorio2/INFORME/2024/I1573.pdf
//
// These figures are transcribed verbatim from the consolidated table (p. 435 of
// the annexes). Amounts in euros. Tranches: <1.000 € / 1.000–10.000 € / >10.000 €.
// This is the only structured national source for private party donations, and it
// lags 1–2 years — hence a fixed snapshot, not a live feed.

export const DONATIONS_SOURCE = {
  year: 2020,
  body: "Tribunal de Cuentas",
  report: "Informe nº 1573 — Cuentas Anuales de los Partidos Políticos, ejercicio 2020",
  approved: "2024-06-27",
  url: "https://www.tcu.es/export/sites/portal/repositorio2/INFORME/2024/I1573.pdf",
  grandTotal: 2069099.03,
  grandDonors: 5754,
};

export interface Tranche {
  donors: number;
  amount: number;
}
export interface PartyDonations {
  nif?: string; // matches PARTIES/funding data when known
  label: string; // as printed in the report
  small: Tranche; // < 1.000 €
  mid: Tranche; // 1.000–10.000 €
  large: Tranche; // > 10.000 €
  total: Tranche;
}

export const DONATIONS_2020: PartyDonations[] = [
  { nif: "G28477727", label: "PSOE", small: { donors: 2615, amount: 269812.2 }, mid: { donors: 213, amount: 544693.9 }, large: { donors: 1, amount: 23000 }, total: { donors: 2829, amount: 837506.1 } },
  { nif: "G32014003", label: "BNG", small: { donors: 161, amount: 59790.58 }, mid: { donors: 116, amount: 333459.32 }, large: { donors: 7, amount: 94475 }, total: { donors: 284, amount: 487724.9 } },
  { nif: "G78269206", label: "IU", small: { donors: 542, amount: 87322.59 }, mid: { donors: 69, amount: 155315.47 }, large: { donors: 2, amount: 32971.07 }, total: { donors: 613, amount: 275609.13 } },
  { nif: "G86867108", label: "Vox", small: { donors: 1544, amount: 180440.92 }, mid: { donors: 29, amount: 43269 }, large: { donors: 1, amount: 20000 }, total: { donors: 1574, amount: 243709.92 } },
  { nif: "G08678120", label: "ERC", small: { donors: 112, amount: 31028.5 }, mid: { donors: 11, amount: 18238.83 }, large: { donors: 0, amount: 0 }, total: { donors: 123, amount: 49267.33 } },
  { nif: "G86976941", label: "Podemos", small: { donors: 50, amount: 17345.14 }, mid: { donors: 6, amount: 9934.4 }, large: { donors: 0, amount: 0 }, total: { donors: 56, amount: 27279.54 } },
  { nif: "G71206700", label: "EH Bildu", small: { donors: 2, amount: 1504 }, mid: { donors: 1, amount: 2045.64 }, large: { donors: 1, amount: 22000 }, total: { donors: 4, amount: 25549.64 } },
  { nif: "G64283310", label: "Ciudadanos", small: { donors: 41, amount: 4345.02 }, mid: { donors: 3, amount: 19616 }, large: { donors: 0, amount: 0 }, total: { donors: 44, amount: 23961.02 } },
  { nif: "G66848755", label: "PDeCAT", small: { donors: 28, amount: 6661.92 }, mid: { donors: 8, amount: 15000 }, large: { donors: 0, amount: 0 }, total: { donors: 36, amount: 21661.92 } },
  { nif: "G98282213", label: "Compromís", small: { donors: 17, amount: 5120.52 }, mid: { donors: 6, amount: 14276.21 }, large: { donors: 0, amount: 0 }, total: { donors: 23, amount: 19396.73 } },
  { nif: "G48103956", label: "PNV", small: { donors: 2, amount: 700 }, mid: { donors: 3, amount: 14539.36 }, large: { donors: 0, amount: 0 }, total: { donors: 5, amount: 15239.36 } },
  { label: "Barcelona en Comú", small: { donors: 90, amount: 13263 }, mid: { donors: 1, amount: 1400 }, large: { donors: 0, amount: 0 }, total: { donors: 91, amount: 14663 } },
  { nif: "G88309315", label: "Más Madrid", small: { donors: 22, amount: 6100 }, mid: { donors: 2, amount: 3500 }, large: { donors: 0, amount: 0 }, total: { donors: 24, amount: 9600 } },
  { nif: "G59736926", label: "CUP", small: { donors: 3, amount: 630 }, mid: { donors: 2, amount: 6733.44 }, large: { donors: 0, amount: 0 }, total: { donors: 5, amount: 7363.44 } },
  { nif: "G86273414", label: "Verdes Equo", small: { donors: 31, amount: 2887 }, mid: { donors: 1, amount: 2760 }, large: { donors: 0, amount: 0 }, total: { donors: 32, amount: 5647 } },
  { nif: "G28570927", label: "PP", small: { donors: 6, amount: 820 }, mid: { donors: 2, amount: 2300 }, large: { donors: 0, amount: 0 }, total: { donors: 8, amount: 3120 } },
  { nif: "G08564379", label: "PSC", small: { donors: 2, amount: 600 }, mid: { donors: 1, amount: 1200 }, large: { donors: 0, amount: 0 }, total: { donors: 3, amount: 1800 } },
];

export function donationsByNif(nif: string): PartyDonations | undefined {
  return DONATIONS_2020.find((d) => d.nif === nif);
}

// Sorted descending by total amount — for a standalone ranking.
export function donationsRanked(): PartyDonations[] {
  return [...DONATIONS_2020].sort((a, b) => b.total.amount - a.total.amount);
}
