/**
 * What the judicial and electoral-board record actually says.
 *
 * Every record here survived the three-verifier panel in
 * research/hate-accountability.md at 3-0. The digest holds the wider material
 * that did not; only what was confirmed is published.
 *
 * The whole point of this layer is the status label, so the label is a type
 * rather than a string. Four things follow from that, and each one is a mistake
 * this file is built to make impossible:
 *
 *   * An archived case is `archived`, never "acquitted". Both decisions in the
 *     *menas* matter are autos confirming *sobreseimiento* at the instruction
 *     stage — a finding of no *indicios* — and never a merits judgment, so
 *     "acquitted" would overstate what any court decided.
 *   * An open case is `awaiting-trial`. An *auto de apertura de juicio oral* is
 *     an opening order, not a verdict, and there is no status in this union
 *     that would let it read as one.
 *   * An electoral board's order is `advertising-infringement` and nothing
 *     more. The Junta Electoral de Zona de Madrid expressly declared itself not
 *     competent over the content and opened no sanctioning file, so a record of
 *     it is a record about campaign timing.
 *   * A complaint *against* someone is `complaint-archived`, and the record
 *     says whose conduct it concerns. Vox's *querella* against Ione Belarra
 *     documents a complaint against her and never conduct by her.
 *
 * There is no score, ranking or index derived from any of this, and there never
 * should be. Records sit side by side; no cause is asserted.
 *
 * On publishing a live prosecution by name: the Herrero record processes a
 * living person's criminal-proceedings data, which engages art. 10 LOPDGDD and
 * LO 1/1982. It is published because she is an elected officeholder, the
 * opening order was reported by five outlets across the political spectrum, and
 * the label states exactly its procedural stage and nothing beyond it. That is
 * a different thing from the per-politician conviction tag this project
 * declined to build, which would have required attributing findings to people
 * from records that are pseudonymised at source.
 */

export type CourtStatus =
  | "archived"
  | "awaiting-trial"
  | "advertising-infringement"
  | "complaint-archived"
  | "none-on-record";

/** How prominently a status reads. Never a judgement about the person. */
export const STATUS_TONE: Record<CourtStatus, string> = {
  archived: "var(--ink-3)",
  "awaiting-trial": "var(--red)",
  "advertising-infringement": "var(--gold-deep)",
  "complaint-archived": "var(--ink-3)",
  "none-on-record": "var(--ink-3)",
};

export interface CourtRecord {
  id: string;
  status: CourtStatus;
  /** NIF of the party whose officeholders the record concerns, when it names one. */
  partyNif: string | null;
  /** The deciding bodies and dates, in order. */
  chain: { body: string; date: string; outcome: string }[];
  url: string;
  /** Section of research/hate-accountability.md this was confirmed in. */
  verifiedIn: string;
}

export const COURT_RECORDS: CourtRecord[] = [
  {
    id: "menas-2021",
    status: "archived",
    partyNif: "G86867108",
    chain: [
      {
        body: "Juzgado de Instrucción nº 53 de Madrid",
        date: "2021-04-29",
        outcome: "sobreseimiento",
      },
      {
        body: "Audiencia Provincial de Madrid, Sección Segunda",
        date: "2021-07-19",
        outcome: "archivo confirmado",
      },
      {
        body: "Tribunal Constitucional",
        date: "2023-01-23",
        outcome: "amparo inadmitido",
      },
    ],
    url: "https://noticias.juridicas.com/actualidad/noticias/16471-la-audiencia-de-madrid-archiva-la-causa-contra-el-cartel-electoral-sobre-menores-no-acompanados-de-vox/",
    verifiedIn: "El cartel de los menas",
  },
  {
    id: "herrero-valencia",
    status: "awaiting-trial",
    partyNif: "G86867108",
    chain: [
      {
        body: "Tribunal de Instancia de València, Sección de Instrucción nº 15",
        date: "2026-05-26",
        outcome: "auto de apertura de juicio oral",
      },
      {
        body: "Audiencia Provincial de Valencia, Sección Cuarta",
        date: "2026-05-27",
        outcome: "recurso desestimado",
      },
    ],
    url: "https://www.europapress.es/comunitat-valenciana/noticia-fiscalia-pide-tres-anos-carcel-concejala-vox-valencia-cecilia-herrero-delitos-odio-20260526.html",
    verifiedIn: "One live named prosecution",
  },
  {
    id: "jez-madrid-2023",
    status: "advertising-infringement",
    partyNif: "G86867108",
    chain: [
      {
        body: "Junta Electoral de Zona de Madrid",
        date: "2023-06-26",
        outcome: "retirada en plazo de un día",
      },
    ],
    url: "https://www.eldiario.es/politica/junta-electoral-ordena-vox-retirar-lona-calle-alcala_1_10333174.html",
    verifiedIn: "Electoral boards refuse the question",
  },
  {
    id: "belarra-querella",
    status: "complaint-archived",
    partyNif: "G86976941",
    chain: [
      {
        body: "Tribunal Supremo, Sala de lo Penal",
        date: "2021-07-29",
        outcome: "querella archivada",
      },
    ],
    url: "https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Tribunal-Supremo/Noticias-Judiciales/",
    verifiedIn: "Supreme Court records run both ways",
  },
];

/**
 * Records naming officeholders of a party.
 *
 * An empty result is not an absence of conduct, and the caller must say so —
 * it means no citable resolution is on file here. Nothing about the number of
 * records is comparable between parties: this is a hand-verified set of four,
 * not a census.
 */
export function recordsForParty(nif: string): CourtRecord[] {
  return COURT_RECORDS.filter((r) => r.partyNif === nif);
}
