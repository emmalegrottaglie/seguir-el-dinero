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
    value: 1955,
    year: 2024,
    body: "Ministerio del Interior · Oficina Nacional contra los Delitos de Odio",
    url: "https://www.interior.gob.es/opencms/export/sites/default/.galleries/galeria-de-prensa/documentos-y-multimedia/balances-e-informes/2024/INFORME_Evolucion_delitos_de_odio_2024.pdf",
  },
  /**
   * Change on the previous year, as a percentage. Signed: 2024 fell, and a
   * figure published without its sign would read as another rise.
   */
  changePct: -13.8,
  racism: { value: 804, year: 2024 },
  sexualOrientationGenderIdentity: { value: 528, year: 2024 },
  /**
   * The previous year, kept so the fall is legible rather than implied. Every
   * 2024 figure reconciles against it: 2 268 × 0.862 = 1 955, 856 × 0.94 = 804,
   * 522 × 1.0115 = 528.
   */
  previous: {
    total: 2268,
    year: 2023,
    changePct: 21.35,
    racism: 856,
    sexualOrientationGenderIdentity: 522,
    url: "https://www.interior.gob.es/opencms/export/sites/default/.galleries/galeria-de-prensa/documentos-y-multimedia/balances-e-informes/2023/Informe_evolucion_delitos_odio_Espana_2023.pdf",
  },
  /**
   * Confirmation from a second ministry, which is why the 2024 update is here
   * at all: OBERAXE (Ministerio de Inclusión) published the same figures on
   * 28/07/2025, including a 71.9 % clearance rate and 905 people arrested or
   * investigated.
   */
  corroborationBody: "Observatorio Español del Racismo y la Xenofobia (OBERAXE)",
  corroborationUrl:
    "https://www.inclusion.gob.es/en/web/oberaxe/w/los-delitos-e-incidentes-de-odio-descendieron-un-13-8-en-2024-segun-el-ultimo-informe-del-ministerio-del-interior",
} as const;

/**
 * Prosecution output. Counted by the Fiscalía's specialised hate-crime service,
 * so it measures what the prosecution service did, not what was reported to the
 * police — the two are not subsets of one another and must not be added.
 */
export const PROSECUTED = {
  sentences: { value: 173, year: 2024 },
  convictions: { value: 129, year: 2024 },
  /** The remainder of the sentences. 129 + 44 = 173. */
  acquittals: { value: 44, year: 2024 },
  /**
   * Charge sheets citing racism or xenophobia as the discriminatory ground.
   *
   * This is the charge-sheet breakdown, which the Memoria reports separately
   * from the breakdown of investigations opened — where racism/xenophobia is
   * 150 and "nación u origen nacional" a further 127. The two sets count
   * different things at different stages and must never be conflated.
   */
  racismCharges: { value: 121, year: 2024 },
  /** All charge sheets, and the previous year, from which the growth derives. */
  charges: { value: 293, year: 2024 },
  chargesPrevious: { value: 210, year: 2023 },
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
 * tracker that lists only the accusation and not the outcome is not a
 * transparency tool. The court framed the poster as *legítima lucha ideológica*
 * within an election.
 *
 * The outcome is an archiving, not an acquittal. Both decisions are autos
 * confirming *sobreseimiento* at the instruction stage — a finding of no
 * *indicios* of an offence — and never a merits judgment, so "acquitted" would
 * overstate what any court decided.
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
  /**
   * What finally closed it. The Constitutional Court declined Podemos's amparo
   * for want of *especial trascendencia constitucional*, so the archiving is
   * definitive.
   */
  constitutional: {
    court: "Tribunal Constitucional",
    outcome: "amparo inadmitido",
    reported: "2023-01-23",
  },
  url: "https://noticias.juridicas.com/actualidad/noticias/16471-la-audiencia-de-madrid-archiva-la-causa-contra-el-cartel-electoral-sobre-menores-no-acompanados-de-vox/",
} as const;

export const CONVICTION_RATE_PCT = Math.round(
  (PROSECUTED.convictions.value / PROSECUTED.sentences.value) * 1000,
) / 10;

/**
 * Year-on-year growth in charge sheets, derived rather than transcribed so the
 * published percentage cannot drift from the counts it comes from.
 */
export const CHARGES_CHANGE_PCT = Math.round(
  (PROSECUTED.charges.value / PROSECUTED.chargesPrevious.value - 1) * 1000,
) / 10;
