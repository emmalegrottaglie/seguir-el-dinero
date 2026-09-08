import { nameKey } from "./name-key.mjs";

// Who governs the party-linked foundations, and what else those people hold.
//
// This layer is hand-curated and hand-checked. There is no scraper and there
// could not be one: report nº 1.642 records the money but never the people, and
// board membership is published inconsistently — one foundation posts a PDF,
// another sits behind a bot check, a third publishes nothing. That unevenness
// is itself recorded below, because "not published" is a finding when
// disposición adicional séptima apartado Seis requires publication.
//
// The rules, which the types enforce and the page shows:
//
//   * Every record carries exactly one source, with a URL and a date. A record
//     without one does not exist.
//   * `kind` states the evidentiary status of that source, and the page renders
//     accordingly: a registry or official filing reads as a statement of
//     record, a press report reads as "según <publisher> (<date>)". They are
//     never merged or counted together. This follows the rule the research
//     verified at 3-0 from ODIHR: the label must match the evidentiary status
//     of the source record.
//   * Nothing is inferred. A tie exists only where a named source states it,
//     and there is no derived score, ranking or network metric anywhere.
//   * Dates are shown, not hidden. A board list is a snapshot; publishing a
//     2017 list as current would have said Félix Bolaños was this foundation's
//     secretary today, when he is a minister and the board has changed twice.
//
// A person appearing here holds a role in an entity that receives public money
// and is legally tied to a political party. That is the public-interest basis
// for naming them, and it is the limit of it: private life is not in scope.

export type SourceKind =
  /** An official public register — the strongest available. */
  | "registry"
  /** A filing or statement by a public authority. */
  | "official"
  /** The foundation's or party's own published disclosure. */
  | "foundation"
  /** Journalism. Rendered with its publisher and date attached. */
  | "press";

export interface Source {
  publisher: string;
  title: string;
  url: string;
  /** ISO date of the source itself, `YYYY-MM-DD` or `YYYY-MM` where that is all it gives. */
  date: string;
  kind: SourceKind;
}

/** A role held inside a party-linked foundation. */
export interface Role {
  /** Entity name as report nº 1.642 writes it, which is the join key. */
  foundation: string;
  person: string;
  /** The role as the source states it, not normalised. */
  role: string;
  /** Where the source gives an appointment date. */
  since?: string;
  until?: string;
  source: Source;
}

/** A role the same person holds outside the foundation. */
export interface Tie {
  person: string;
  organisation: string;
  role: string;
  kind: "corporate" | "government" | "public-body" | "party" | "academic" | "other";
  /** True where the source presents the role as past rather than current. */
  former?: boolean;
  source: Source;
}

/** An entity whose current board could not be established, and why. */
export interface BoardGap {
  foundation: string;
  /** What was tried and what happened, in the source's own terms where possible. */
  reason: string;
  url?: string;
}

/** A change of name, so a reader is not looking for an entity that renamed itself. */
export interface Rename {
  /** Name in report nº 1.642. */
  reportName: string;
  currentName: string;
  when: string;
  source: Source;
}

// ─── Sources ──────────────────────────────────────────────────────────────────

const DISENSO_PDF: Source = {
  publisher: "Fundación Disenso",
  title: "Patronato de Gobierno (transparencia)",
  url: "https://fundaciondisenso.org/wp-content/uploads/2024/09/FD_Patronato-de-Gobierno.pdf",
  date: "2024-09",
  kind: "foundation",
};

const FPI_PAGE: Source = {
  publisher: "Fundación Pablo Iglesias",
  title: "Miembros del patronato de la FPI",
  url: "https://fpabloiglesias.es/nosotros/patronato/",
  // The page's own article:modified_time.
  date: "2026-07-02",
  kind: "foundation",
};

const SABINO_PAGE: Source = {
  publisher: "Sabino Arana Fundazioa",
  title: "Fundación Sabino Arana — patronato",
  url: "https://www.sabinoarana.eus/es/fundacion-sabino-arana",
  date: "2026-09-08",
  kind: "foundation",
};

const REFORMISMO_PAGE: Source = {
  publisher: "Fundación Reformismo 21",
  title: "Quiénes somos — gobernanza",
  url: "https://reformismo21.org/quienes-somos/",
  date: "2026-09-08",
  kind: "foundation",
};

const IRD_PAGE: Source = {
  publisher: "Instituto República y Democracia",
  title: "Patronato",
  url: "https://institutorepublica.info/quienes-somos/patronato/",
  // The page's own dateModified.
  date: "2024-04-09",
  kind: "foundation",
};

const ELDIARIO_IRD: Source = {
  publisher: "eldiario.es",
  title:
    "Instituto República y Democracia: Podemos cambia el nombre de su fundación con Pablo Iglesias al frente",
  url: "https://www.eldiario.es/politica/instituto-republica-democracia-cambia-nombre-fundacion-pablo-iglesias-frente_1_8393154.html",
  date: "2021-10-15",
  kind: "press",
};

// ─── Roles inside the foundations ─────────────────────────────────────────────

export const ROLES: Role[] = [
  // Fundación Disenso (Vox). Three trustees, per the foundation's own PDF. Note
  // that Wikipedia still lists an eight-member board from 2020; the foundation's
  // filing supersedes it, which is why the primary source was chased.
  { foundation: "FUNDACIÓN DISENSO", person: "Santiago Abascal", role: "patrono", source: DISENSO_PDF },
  { foundation: "FUNDACIÓN DISENSO", person: "Enrique Cabanas", role: "patrono", source: DISENSO_PDF },
  { foundation: "FUNDACIÓN DISENSO", person: "Pablo Sáez", role: "patrono", source: DISENSO_PDF },

  // Fundación Pablo Iglesias (PSOE), 20 trustees.
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "María Luisa Carcedo", role: "presidenta", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Francisco Martín Aguirre", role: "secretario", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Pilar Bernabé García", role: "patrona", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Félix Bolaños García", role: "patrono", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Carmen Calvo Poyato", role: "patrona", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Julián Casanova", role: "patrono", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Ana María Fuentes Pacheco", role: "patrona", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Manuel García Salgado", role: "patrono", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Iván García Yustos", role: "patrono", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Hana Jalloul Muro", role: "patrona", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "César Luena López", role: "patrono", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Pau Marí Klose", role: "patrono", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Mª Reyes Maroto Illera", role: "patrona", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Ana Martínez Rus", role: "patrona", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "María Jesús Montero", role: "patrona", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Cristina Narbona Ruiz", role: "patrona", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Pedro Sánchez Pérez-Castejón", role: "patrono", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Rafael Simancas Simancas", role: "patrono", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Rebeca Torró Soler", role: "patrona", source: FPI_PAGE },
  { foundation: "FUNDACIÓN PABLO IGLESIAS", person: "Manuela Villa Acosta", role: "patrona", source: FPI_PAGE },

  // Sabino Arana Fundazioa (PNV). The only party foundation to hold the Haz
  // Foundation's "t de transparente" seal, and the only one here publishing an
  // appointment date for every trustee.
  { foundation: "FUNDACIÓN SABINO ARANA", person: "Arantxa Tapia Otaegi", role: "presidenta", since: "2025-11-11", source: SABINO_PAGE },
  { foundation: "FUNDACIÓN SABINO ARANA", person: "Ainara Zelaia Markaida", role: "vicepresidenta", since: "2023-10-15", source: SABINO_PAGE },
  { foundation: "FUNDACIÓN SABINO ARANA", person: "Aitor Alzola Martínez de Antoñana", role: "tesorero", since: "2012-04-16", source: SABINO_PAGE },
  { foundation: "FUNDACIÓN SABINO ARANA", person: "Ignacio Etxeberria Olañeta", role: "secretario", since: "2008-02-28", source: SABINO_PAGE },
  { foundation: "FUNDACIÓN SABINO ARANA", person: "Leire Naberan Etxabe", role: "vocal", since: "2025-11-11", source: SABINO_PAGE },
  { foundation: "FUNDACIÓN SABINO ARANA", person: "Miren Azkarate Villar", role: "vocal", since: "2023-10-15", source: SABINO_PAGE },
  { foundation: "FUNDACIÓN SABINO ARANA", person: "Mikel Hidalgo Bordegarai", role: "vocal", since: "2023-10-15", source: SABINO_PAGE },
  { foundation: "FUNDACIÓN SABINO ARANA", person: "Asier Barandiaran Amarika", role: "vocal", since: "2023-07-27", source: SABINO_PAGE },
  { foundation: "FUNDACIÓN SABINO ARANA", person: "Daniel Camblong", role: "vocal", since: "2023-07-27", source: SABINO_PAGE },

  // Fundación Concordia y Libertad (PP), which now trades as Reformismo 21.
  // Its patronato is small; the advisory council is where the party leadership
  // and the corporate figures sit, so both are recorded with the role stated.
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Pablo Vázquez", role: "presidente ejecutivo del patronato", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Montserrat Iglesias", role: "vicepresidenta del patronato", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Gabriel Elorriaga", role: "patrono, director del seminario institucional", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Noemí Gámez", role: "patrona", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Román Escolano", role: "vocal del patronato", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Aurora Nacarino-Bravo", role: "patrona", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Alberto Núñez Feijóo", role: "presidente del consejo asesor", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Fátima Báñez", role: "consejo asesor", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "María Eugenia Clemente", role: "consejo asesor", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Verónica Pascual", role: "consejo asesor", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Román Escolano", role: "consejo asesor", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Elena Pisonero", role: "consejo asesor", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Alicia Richart", role: "consejo asesor", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Luis Garicano", role: "consejo asesor", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Teresa Freixes", role: "consejo asesor", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Ramón Gil-Casares", role: "consejo asesor", source: REFORMISMO_PAGE },
  { foundation: "FUNDACIÓN CONCORDIA Y LIBERTAD", person: "Rafael Matesanz", role: "consejo asesor", source: REFORMISMO_PAGE },

  // Fundación Instituto República y Democracia (Podemos), from the entity's own
  // patronato page. This replaced a press-sourced list: eldiario.es reported in
  // October 2021 that Pablo Iglesias had taken the presidency with Juan Carlos
  // Monedero as director, and the foundation's own page shows neither of them
  // and a different board — of the six names in that article only Orencio Osuna
  // remains. The press record is kept below, under RENAMES, for the one fact it
  // still evidences: the change of name.
  //
  // "Patrona" against Miguel Ángel Andrés Llamas is the page's own wording and
  // is left as written, because the rule here is to record the role as the
  // source states it rather than to correct the source.
  { foundation: "FUNDACIÓN INSTITUTO REPÚBLICA Y DEMOCRACIA", person: "José Julio Rodríguez Fernández", role: "presidente", source: IRD_PAGE },
  { foundation: "FUNDACIÓN INSTITUTO REPÚBLICA Y DEMOCRACIA", person: "Orencio Osuna Muñoz", role: "secretario", source: IRD_PAGE },
  { foundation: "FUNDACIÓN INSTITUTO REPÚBLICA Y DEMOCRACIA", person: "Nacho Ramos", role: "patrono", source: IRD_PAGE },
  { foundation: "FUNDACIÓN INSTITUTO REPÚBLICA Y DEMOCRACIA", person: "Laura Arroyo Gárate", role: "patrona", source: IRD_PAGE },
  { foundation: "FUNDACIÓN INSTITUTO REPÚBLICA Y DEMOCRACIA", person: "Miguel Ángel Andrés Llamas", role: "patrona", source: IRD_PAGE },
];

// ─── What the same people hold elsewhere ──────────────────────────────────────
//
// Only roles the cited source itself states. Where a source describes a role in
// the past tense, `former` is set and the page says so, because a stale role
// presented as current misrepresents the person.

export const TIES: Tie[] = [
  // Stated by the PP foundation's own governance page.
  { person: "Alberto Núñez Feijóo", organisation: "Partido Popular", role: "presidente nacional", kind: "party", source: REFORMISMO_PAGE },
  { person: "Fátima Báñez", organisation: "Fundación CEOE", role: "presidenta", kind: "corporate", source: REFORMISMO_PAGE },
  { person: "Fátima Báñez", organisation: "Gobierno de España", role: "ministra de Empleo y Seguridad Social", kind: "government", former: true, source: REFORMISMO_PAGE },
  { person: "María Eugenia Clemente", organisation: "Alestis Aerospace", role: "consejera delegada", kind: "corporate", source: REFORMISMO_PAGE },
  { person: "Verónica Pascual", organisation: "Telefónica", role: "consejera", kind: "corporate", source: REFORMISMO_PAGE },
  { person: "Pablo Vázquez", organisation: "Renfe", role: "presidente", kind: "public-body", former: true, source: REFORMISMO_PAGE },
  { person: "Pablo Vázquez", organisation: "Ineco", role: "presidente", kind: "public-body", former: true, source: REFORMISMO_PAGE },
  { person: "Román Escolano", organisation: "Gobierno de España", role: "ministro de Economía", kind: "government", former: true, source: REFORMISMO_PAGE },
  { person: "Román Escolano", organisation: "Banco Europeo de Inversiones", role: "directivo", kind: "public-body", source: REFORMISMO_PAGE },
  { person: "Gabriel Elorriaga", organisation: "Gobierno de España", role: "secretario de Estado", kind: "government", former: true, source: REFORMISMO_PAGE },
  { person: "Ramón Gil-Casares", organisation: "Gobierno de España", role: "embajador en Estados Unidos, Egipto, Sudán y Sudáfrica", kind: "government", former: true, source: REFORMISMO_PAGE },
  { person: "Rafael Matesanz", organisation: "Organización Nacional de Trasplantes", role: "fundador y director", kind: "public-body", former: true, source: REFORMISMO_PAGE },
  { person: "Montserrat Iglesias", organisation: "INAEM", role: "directora", kind: "public-body", former: true, source: REFORMISMO_PAGE },

  // Stated by the PNV foundation's own page.
  { person: "Arantxa Tapia Otaegi", organisation: "Sabino Arana Fundazioa", role: "doctora en Ingeniería Industrial", kind: "academic", source: SABINO_PAGE },
  { person: "Miren Azkarate Villar", organisation: "Universidad del País Vasco", role: "catedrática de Filología Vasca", kind: "academic", source: SABINO_PAGE },

  // Stated by the Podemos foundation's own patronato page.
  { person: "José Julio Rodríguez Fernández", organisation: "Gobierno de España", role: "director de Gabinete del Vicepresidente Segundo (15/01/2020–30/03/2021)", kind: "government", former: true, source: IRD_PAGE },
  { person: "José Julio Rodríguez Fernández", organisation: "Fuerzas Armadas", role: "militar profesional de carrera, retirado", kind: "public-body", former: true, source: IRD_PAGE },
  { person: "Miguel Ángel Andrés Llamas", organisation: "Universidad de Salamanca", role: "investigador, doctor en Derecho administrativo", kind: "academic", source: IRD_PAGE },
];

// ─── Entities whose board could not be established ────────────────────────────
//
// Published because the absence is the point. Apartado Seis of disposición
// adicional séptima requires these entities to publish, and report nº 1.642
// itself finds that 16 of them did not publish their 2021 accounts and 14 their
// 2022 accounts. An empty section would read as work not done.

export const BOARD_GAPS: BoardGap[] = [
  {
    foundation: "FUNDACIÓN RAMÓN RUBIAL",
    reason:
      "No se localizó una publicación propia del patronato. Es la entidad con más incumplimientos de publicidad en el informe: dos convenios con personas jurídicas sin elevar a documento público, sin comunicar al Tribunal de Cuentas y sin publicar en su web.",
  },
  {
    foundation: "FUNDACIÓN IRATZAR",
    reason: "No se localizó una publicación propia del patronato.",
  },
  {
    foundation: "FUNDACIÓN RAFAEL CAMPALANS",
    reason: "No se localizó una publicación propia del patronato.",
  },
  {
    foundation: "FUNDACIÓN GALIZA SEMPRE",
    reason: "No se localizó una publicación propia del patronato.",
  },
  {
    foundation: "FUNDACIÓN INSTITUTO 25 DE MAYO PARA LA DEMOCRACIA",
    reason:
      "La entidad pasó a llamarse Instituto República y Democracia en 2021. El patronato publicado corresponde a la entidad renombrada, y figura en su ficha.",
  },
];

// ─── Renames ──────────────────────────────────────────────────────────────────
//
// Report nº 1.642 uses the name in force during the audited exercise. Two of
// these entities have since renamed themselves, so a reader searching the
// current name would not find them — and one of them appears twice in the
// report under both names.

export const RENAMES: Rename[] = [
  {
    reportName: "FUNDACIÓN CONCORDIA Y LIBERTAD",
    currentName: "Fundación Reformismo 21",
    when: "2023",
    source: {
      publisher: "Fundación Reformismo 21",
      title: "Historia",
      url: "https://reformismo21.org/historia/",
      date: "2026-09-08",
      kind: "foundation",
    },
  },
  {
    reportName: "FUNDACIÓN INSTITUTO 25 DE MAYO PARA LA DEMOCRACIA",
    currentName: "Fundación Instituto República y Democracia",
    when: "2021",
    source: ELDIARIO_IRD,
  },
];

// ─── Lookups ──────────────────────────────────────────────────────────────────

/**
 * Match on a folded, order-independent name key, so "Bolaños García, Félix" and
 * "Félix Bolaños García" resolve to the same person. This is the same helper the
 * portrait and social-handle joins use, and the same rule applies: a key that
 * does not match exactly is not a match, and nothing is guessed.
 */
const tieIndex = new Map<string, Tie[]>();
for (const tie of TIES) {
  const key = nameKey(tie.person);
  const list = tieIndex.get(key);
  if (list) list.push(tie);
  else tieIndex.set(key, [tie]);
}

export interface Governance {
  roles: Role[];
  /** One entry per person who holds a role here, with whatever else is on record. */
  people: { person: string; roles: Role[]; ties: Tie[] }[];
  gap?: BoardGap;
  rename?: Rename;
}

/** Everything on record about who governs one entity. */
export function governanceFor(foundationName: string): Governance {
  const roles = ROLES.filter((r) => r.foundation === foundationName);
  const byPerson = new Map<string, { person: string; roles: Role[]; ties: Tie[] }>();
  for (const role of roles) {
    const key = nameKey(role.person);
    const entry = byPerson.get(key);
    if (entry) entry.roles.push(role);
    else byPerson.set(key, { person: role.person, roles: [role], ties: tieIndex.get(key) ?? [] });
  }
  return {
    roles,
    people: [...byPerson.values()],
    gap: BOARD_GAPS.find((g) => g.foundation === foundationName),
    rename: RENAMES.find((r) => r.reportName === foundationName),
  };
}

/** How much of the channel's governance is on record at all. */
export function governanceCoverage(foundationNames: string[]) {
  const documented = new Set(ROLES.map((r) => r.foundation));
  const covered = foundationNames.filter((n) => documented.has(n));
  return {
    entities: foundationNames.length,
    documented: covered.length,
    people: new Set(ROLES.map((r) => nameKey(r.person))).size,
    ties: TIES.length,
    /** Records resting on journalism rather than on a filing or a register. */
    fromPress:
      ROLES.filter((r) => r.source.kind === "press").length +
      TIES.filter((t) => t.source.kind === "press").length,
  };
}
