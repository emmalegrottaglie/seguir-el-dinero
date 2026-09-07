// Official figures on hate crime in Spain, and what no Spanish authority has
// ever found about party campaign spending.
//
// Two separate things live in this file on purpose, and the page keeps them
// separate: aggregate hate-crime statistics from the state's own bodies, and the
// record of what happened when campaign material was actually taken to court.
// Neither is presented as explaining the other, and nothing here attributes
// anything to a named person.
//
// Every figure was verified against an official source before being written
// down. The research digest in research/hate-accountability.md holds the wider
// unverified material; only what survived checking is here.

export interface SourcedFigure {
  /** The number, as published. */
  value: number;
  /** Year the figure describes, not the year it was published. */
  year: number;
  /** Body that published it. */
  body: string;
  url: string;
}

/**
 * Police-recorded hate crimes and incidents. These are *hechos conocidos* —
 * offences and incidents reported to and recorded by the security forces — not
 * convictions, and the reports themselves acknowledge that many incidents never
 * reach the justice system at all.
 */
export const RECORDED = {
  total: {
    value: 2268,
    year: 2023,
    body: "Ministerio del Interior · Oficina Nacional contra los Delitos de Odio",
    url: "https://www.interior.gob.es/opencms/export/sites/default/.galleries/galeria-de-prensa/documentos-y-multimedia/balances-e-informes/2023/Informe_evolucion_delitos_odio_Espana_2023.pdf",
  },
  /** Change on the previous year, as a percentage. */
  changePct: 21.35,
  racism: { value: 856, year: 2023 },
  sexualOrientationGenderIdentity: { value: 522, year: 2023 },
} as const;

/**
 * Prosecution output. Counted by the Fiscalía's specialised hate-crime service,
 * so it measures what the prosecution service did, not what was reported to the
 * police — the two are not subsets of one another and must not be added.
 */
export const PROSECUTED = {
  sentences: { value: 173, year: 2024 },
  convictions: { value: 129, year: 2024 },
  /** Charge sheets citing racism or xenophobia as the discriminatory ground. */
  racismCharges: { value: 121, year: 2024 },
  /** Year-on-year growth in charge sheets, as a percentage. */
  chargesChangePct: 40,
  body: "Fiscalía General del Estado · Memoria anual",
  url: "https://www.fiscal.es/memorias/memoria2025/FISCALIA_SITE/index.html",
  /** Official summary of the same figures, from a second ministry. */
  summaryBody: "Observatorio Español del Racismo y la Xenofobia (OBERAXE)",
  summaryUrl:
    "https://www.inclusion.gob.es/web/oberaxe/w/la-memoria-anual-2024-de-la-fiscalia-general-del-estado-senala-un-aumento-de-escritos-de-acusacion-por-delitos-de-odio-y-discriminacion",
} as const;

/**
 * The one time Spanish campaign material was prosecuted as a hate crime, and
 * how it ended.
 *
 * Recorded because the outcome was negative and stating it is the point: a
 * tracker that lists only the accusation and not the acquittal is not a
 * transparency tool. The court framed the poster as *legítima lucha ideológica*
 * within an election.
 */
export const MENAS_CASE = {
  material: "Un mena, 4.700 euros al mes; tu abuela, 426 euros al mes",
  party: "Vox",
  election: "Asamblea de Madrid, 2021",
  firstInstance: {
    court: "Juzgado de Instrucción nº 53 de Madrid",
    date: "2021-04-29",
    outcome: "sobreseimiento",
  },
  appeal: {
    court: "Audiencia Provincial de Madrid, Sección Segunda",
    date: "2021-07-19",
    outcome: "archivo confirmado",
  },
  /** Who appealed the dismissal — the prosecution service among them. */
  appellants: ["Fiscalía", "PSOE", "Podemos", "Izquierda Unida", "Unidas Podemos", "Progresa"],
  url: "https://noticias.juridicas.com/actualidad/noticias/16471-la-audiencia-de-madrid-archiva-la-causa-contra-el-cartel-electoral-sobre-menores-no-acompanados-de-vox/",
} as const;

export const CONVICTION_RATE_PCT = Math.round(
  (PROSECUTED.convictions.value / PROSECUTED.sentences.value) * 1000,
) / 10;
