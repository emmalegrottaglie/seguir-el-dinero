import {
  BCP47,
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "./locales";

// Re-export the locale constants so existing "@/lib/i18n" imports keep working.
export * from "./locales";

const es = {
  meta: {
    title: "Seguir el Dinero · Subvenciones públicas a los partidos",
    description:
      "Rastreo de las subvenciones públicas estatales que reciben los partidos políticos españoles, con datos de la Base de Datos Nacional de Subvenciones (BDNS).",
  },
  nav: { panel: "Panel", faces: "Caras", salaries: "Sueldos", votes: "Votaciones", methodology: "Metodología" },
  votes: {
    title: "Votaciones clave",
    intro:
      "Posiciones registradas en votaciones nominales del Congreso sobre asuntos concretos. Cada posición es un voto realmente emitido y verificable, no una opinión atribuida.",
    caveat:
      "Cada votación se etiqueta según su tipo: unas aprueban leyes, otras son proposiciones no de Ley o mociones, que no son vinculantes. Se excluyen las votaciones de enmiendas. Un diputado aparece solo si consta su voto; no se deduce la postura de nadie a partir de su partido.",
    searchLabel: "Buscar diputado",
    searchPlaceholder: "Apellido o nombre…",
    inFavour: "A favor",
    against: "En contra",
    abstention: "Abstención",
    noVote: "No vota",
    present: "Presentes",
    byGroup: "Por grupo parlamentario",
    group: "Grupo",
    officialRecord: "Acta oficial ↗",
    lawText: "Texto de la ley ↗",
    session: "Sesión",
    noMatch: "Sin votos registrados para esa búsqueda.",
    results: "diputados",
    kinds: {
      ley: "Votación final de ley",
      toma: "Toma en consideración",
      pnl: "Proposición no de Ley",
      mocion: "Moción consecuencia de interpelación",
    },
    nonBinding: "no vinculante",
    legislature: "Legislatura",
  },
  salaries: {
    title: "Sueldos públicos",
    intro:
      "Retribuciones de los cargos públicos en activo, según el Registro de Altos Cargos y los portales de transparencia. Busca por nombre, cargo, municipio o comunidad.",
    search: "Buscar",
    searchPlaceholder: "Nombre, cargo, municipio…",
    party: "Partido",
    all: "Todos",
    role: "Cargo",
    where: "Ámbito",
    annual: "Bruto anual",
    people: "cargos",
    results: "resultados",
    noResults: "Sin resultados para esta búsqueda.",
    prev: "Anterior",
    next: "Siguiente",
    page: "Página",
    of: "de",
    median: "Mediana",
    sourceNote: "Fuente · Registro de Altos Cargos / transparencia.gob.es",
    caveat:
      "Retribución del cargo, no patrimonio ni ingresos privados. Solo cargos marcados como activos en la fuente.",
  },
  footer: {
    source: "Fuente · BDNS / SNPSAP — infosubvenciones.es",
    caveat: "Muestra financiación PÚBLICA. Donaciones privadas: ver metodología.",
  },
  common: {
    backToPanel: "← Volver al panel",
    backToFaces: "← Caras",
    nif: "NIF",
  },
  blocs: {
    derecha: "Derecha",
    izquierda: "Izquierda",
    nacionalista: "Nacionalista",
    regionalista: "Regionalista",
    otro: "Otro",
  },
  kinds: {
    ordinaria: "Financiación ordinaria",
    seguridad: "Gastos de seguridad",
    otra: "Otra",
    all: "Todas",
  },
  home: {
    eyebrow: "Subvenciones estatales",
    titlePre: "¿Quién financia a los ",
    titleEmph: "partidos",
    titlePost: "?",
    intro:
      "El dinero público que el Estado entrega a cada partido, tomado en directo de la Base de Datos Nacional de Subvenciones. Filtra por año y por tipo de ayuda para ver el reparto.",
    totalLabel: "Total concedido (selección)",
    parties: "Partidos",
    concessions: "Concesiones",
    updated: "Actualizado",
    year: "Ejercicio",
    reset: "Reset",
    distribution: "Reparto por partido",
    noResults: "No hay concesiones para esta selección.",
  },
  party: {
    totalReceived: "Total recibido",
    ofNational: "del total nacional",
    facesTitle: "Caras del partido",
    whereFrom: "De dónde viene",
    ofItsFunds: "de sus fondos",
    yearlyEvolution: "Evolución anual",
    privateTitle: "Financiación privada",
    donationsDeclared: "Donaciones declaradas",
    donors: "donantes",
    privateCaveat:
      "Solo personas físicas (las donaciones de empresas están prohibidas). Dato anual del último informe disponible del Tribunal de Cuentas.",
    ledgerTitle: "Registro de concesiones",
    exercise: "Ejercicio",
    legalBasis: "base legal (BOE) ↗",
    inNews: "En las noticias",
    recentHeadlines: "Titulares recientes · Google News",
  },
  politician: {
    partyFunding: "Financiación pública de su partido",
    seeBreakdown: "ver desglose →",
    caveat: "Las subvenciones públicas se conceden al partido, no a la persona.",
    onBluesky: "En Bluesky",
  },
  caras: {
    title: "Caras",
    intro:
      "Políticos individuales: su partido y financiación pública, su actividad en Bluesky y los titulares en los que aparecen. Los perfiles de Bluesky están verificados uno a uno.",
    note:
      "La lista es una muestra curada. Bluesky tiene, a día de hoy, mayor presencia de la izquierda; líderes de PP y Vox no tienen cuenta verificable allí.",
  },
  feed: {
    justNow: "hace un momento",
    hoursAgo: (n: number) => `hace ${n} h`,
    daysAgo: (n: number) => `hace ${n} d`,
    noRecent: "Sin resultados recientes.",
    cannotLoad: "No se pudieron cargar publicaciones ahora mismo.",
    reposted: "↻ Republicado",
  },
  method: {
    title: "Metodología y límites",
    lead: "Esta herramienta es honesta sobre lo que puede y no puede mostrar. Léelo antes de sacar conclusiones.",
    showTitle: "Qué muestra",
    showP1a: "Las ",
    showP1emph: "subvenciones públicas estatales",
    showP1b:
      " concedidas a los partidos políticos, extraídas en directo de la Base de Datos Nacional de Subvenciones (BDNS / SNPSAP), el registro oficial del Ministerio de Hacienda. Actualmente ",
    showP1c: " y un total de ",
    showP1d: ". Datos actualizados el ",
    showP2: "Se distinguen dos tipos de ayuda estatal anual:",
    showB1: "Financiación ordinaria — la subvención principal, repartida según representación parlamentaria.",
    showB2: "Gastos de seguridad — ayudas para gastos de protección.",
    privTitle: "Financiación privada (parcial)",
    privP1:
      "Cada partido muestra también sus donaciones privadas declaradas, transcritas del Informe nº 1573 del Tribunal de Cuentas (ejercicio 2020). Con dos advertencias importantes:",
    privB1:
      "Las donaciones de empresas están prohibidas. Desde la reforma de 2015 de la Ley Orgánica 8/2007, las personas jurídicas no pueden donar a partidos; sólo personas físicas, con un máximo de 50.000 €/año y sin donaciones anónimas.",
    privB2:
      "Lo privado no es un API. Estos datos sólo se publican en los informes anuales en PDF del Tribunal de Cuentas, con uno o dos años de retraso; por eso es una foto fija de 2020 y no un dato en directo.",
    polTitle: "Políticos individuales",
    polP1:
      "La sección Caras reúne políticos individuales con su partido, su actividad en Bluesky y los titulares en los que aparecen. No hay una cifra de «financiación por político»: las subvenciones se conceden al partido, no a la persona. Cada perfil de Bluesky se ha verificado uno a uno; a día de hoy la izquierda tiene más presencia allí, y líderes de PP y Vox no tienen cuenta verificable.",
    roadTitle: "Hoja de ruta",
    roadB1:
      "Hecho — Subvenciones públicas en directo (BDNS); donaciones privadas 2020 (Tribunal de Cuentas); políticos individuales con Bluesky y noticias.",
    roadB2:
      "Siguiente — Más ejercicios de donaciones del Tribunal de Cuentas y fundaciones vinculadas a partidos (ingesta periódica de PDF, no en directo).",
    roadB3:
      "Después — Contratación pública y grafo de vínculos entre partidos, fundaciones y adjudicatarios, etiquetado siempre como asociación, no prueba de influencia.",
    srcTitle: "Fuentes",
    src1: "BDNS / SNPSAP — concesiones a partidos políticos ↗",
    src2: "Tribunal de Cuentas — partidos políticos ↗",
    src3: "Ley Orgánica 8/2007 sobre financiación de partidos ↗",
  },
};

type Dict = typeof es;

const en: Dict = {
  meta: {
    title: "Follow the Money · Public subsidies to Spanish parties",
    description:
      "Tracking the public state subsidies that Spanish political parties receive, with data from the National Subsidies Database (BDNS).",
  },
  nav: { panel: "Dashboard", faces: "Faces", salaries: "Salaries", votes: "Votes", methodology: "Methodology" },
  votes: {
    title: "Key votes",
    intro:
      "Positions recorded in roll-call votes of the Congress on specific items. Each position is a ballot actually cast and verifiable, not an opinion attributed to anyone.",
    caveat:
      "Each vote is labelled by type: some pass laws, others are non-legislative motions, which are not binding. Amendment votes are excluded. A deputy appears only if their vote is on record; nobody's stance is inferred from their party.",
    searchLabel: "Search deputy",
    searchPlaceholder: "Surname or name…",
    inFavour: "In favour",
    against: "Against",
    abstention: "Abstention",
    noVote: "Did not vote",
    present: "Present",
    byGroup: "By parliamentary group",
    group: "Group",
    officialRecord: "Official record ↗",
    lawText: "Text of the law ↗",
    session: "Session",
    noMatch: "No recorded votes for that search.",
    results: "deputies",
    kinds: {
      ley: "Final vote on a law",
      toma: "Leave to proceed",
      pnl: "Non-legislative motion",
      mocion: "Motion following an urgent interpellation",
    },
    nonBinding: "non-binding",
    legislature: "Legislature",
  },
  salaries: {
    title: "Public salaries",
    intro:
      "Pay for serving public officeholders, from the Register of Senior Officials and government transparency portals. Search by name, role, municipality or region.",
    search: "Search",
    searchPlaceholder: "Name, role, municipality…",
    party: "Party",
    all: "All",
    role: "Role",
    where: "Scope",
    annual: "Gross annual",
    people: "officeholders",
    results: "results",
    noResults: "No results for this search.",
    prev: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    median: "Median",
    sourceNote: "Source · Register of Senior Officials / transparencia.gob.es",
    caveat:
      "Pay for the post — not personal wealth or private income. Only posts marked active in the source.",
  },
  footer: {
    source: "Source · BDNS / SNPSAP — infosubvenciones.es",
    caveat: "Shows PUBLIC funding. Private donations: see methodology.",
  },
  common: {
    backToPanel: "← Back to dashboard",
    backToFaces: "← Faces",
    nif: "Tax ID",
  },
  blocs: {
    derecha: "Right",
    izquierda: "Left",
    nacionalista: "Nationalist",
    regionalista: "Regionalist",
    otro: "Other",
  },
  kinds: {
    ordinaria: "Ordinary funding",
    seguridad: "Security costs",
    otra: "Other",
    all: "All",
  },
  home: {
    eyebrow: "State subsidies",
    titlePre: "Who funds the ",
    titleEmph: "parties",
    titlePost: "?",
    intro:
      "The public money the State hands each party, pulled live from the National Subsidies Database. Filter by year and aid type to see the split.",
    totalLabel: "Total awarded (selection)",
    parties: "Parties",
    concessions: "Grants",
    updated: "Updated",
    year: "Year",
    reset: "Reset",
    distribution: "Breakdown by party",
    noResults: "No grants for this selection.",
  },
  party: {
    totalReceived: "Total received",
    ofNational: "of the national total",
    facesTitle: "Faces of the party",
    whereFrom: "Where it comes from",
    ofItsFunds: "of its funds",
    yearlyEvolution: "Yearly evolution",
    privateTitle: "Private financing",
    donationsDeclared: "Declared donations",
    donors: "donors",
    privateCaveat:
      "Individuals only (company donations are banned). Annual figure from the latest available Court of Auditors report.",
    ledgerTitle: "Grant ledger",
    exercise: "Year",
    legalBasis: "legal basis (BOE) ↗",
    inNews: "In the news",
    recentHeadlines: "Recent headlines · Google News",
  },
  politician: {
    partyFunding: "Public funding of their party",
    seeBreakdown: "see breakdown →",
    caveat: "Public subsidies are granted to the party, not the individual.",
    onBluesky: "On Bluesky",
  },
  caras: {
    title: "Faces",
    intro:
      "Individual politicians: their party and public funding, their Bluesky activity and the headlines they appear in. Every Bluesky profile is verified one by one.",
    note:
      "This is a curated sample. Bluesky today skews left; PP and Vox leaders have no verifiable account there.",
  },
  feed: {
    justNow: "just now",
    hoursAgo: (n: number) => `${n}h ago`,
    daysAgo: (n: number) => `${n}d ago`,
    noRecent: "No recent results.",
    cannotLoad: "Couldn't load posts right now.",
    reposted: "↻ Reposted",
  },
  method: {
    title: "Methodology and limits",
    lead: "This tool is honest about what it can and cannot show. Read this before drawing conclusions.",
    showTitle: "What it shows",
    showP1a: "The ",
    showP1emph: "public state subsidies",
    showP1b:
      " granted to political parties, pulled live from the National Subsidies Database (BDNS / SNPSAP), the official registry of the Ministry of Finance. Currently ",
    showP1c: " and a total of ",
    showP1d: ". Data updated on ",
    showP2: "Two kinds of annual state aid are distinguished:",
    showB1: "Ordinary funding — the main subsidy, distributed by parliamentary representation.",
    showB2: "Security costs — aid for protection expenses.",
    privTitle: "Private financing (partial)",
    privP1:
      "Each party also shows its declared private donations, transcribed from Court of Auditors Report no. 1573 (fiscal year 2020). With two important caveats:",
    privB1:
      "Company donations are banned. Since the 2015 reform of Organic Law 8/2007, legal entities cannot donate to parties; only individuals, capped at €50,000/year and with no anonymous donations.",
    privB2:
      "Private data is not an API. It is only published in the Court of Auditors' annual PDF reports, one or two years late; hence a fixed 2020 snapshot, not live data.",
    polTitle: "Individual politicians",
    polP1:
      "The Faces section gathers individual politicians with their party, their Bluesky activity and the headlines they appear in. There is no 'funding per politician' figure: subsidies are granted to the party, not the person. Every Bluesky profile has been verified one by one; today the left has more presence there, and PP and Vox leaders have no verifiable account.",
    roadTitle: "Roadmap",
    roadB1:
      "Done — Live public subsidies (BDNS); private donations 2020 (Court of Auditors); individual politicians with Bluesky and news.",
    roadB2:
      "Next — More donation years from the Court of Auditors and party-linked foundations (periodic PDF ingest, not live).",
    roadB3:
      "Later — Public procurement and a graph of links between parties, foundations and contractors, always labelled association, not proof of influence.",
    srcTitle: "Sources",
    src1: "BDNS / SNPSAP — grants to political parties ↗",
    src2: "Court of Auditors — political parties ↗",
    src3: "Organic Law 8/2007 on party financing ↗",
  },
};

const ca: Dict = {
  meta: {
    title: "Seguir el Diner · Subvencions públiques als partits",
    description:
      "Seguiment de les subvencions públiques estatals que reben els partits polítics espanyols, amb dades de la Base de Dades Nacional de Subvencions (BDNS).",
  },
  nav: { panel: "Tauler", faces: "Cares", salaries: "Sous", votes: "Votacions", methodology: "Metodologia" },
  votes: {
    title: "Votacions clau",
    intro:
      "Posicions registrades en votacions nominals del Congrés sobre assumptes concrets. Cada posició és un vot realment emès i verificable, no una opinió atribuïda.",
    caveat:
      "Cada votació s'etiqueta segons el seu tipus: unes aproven lleis, altres són proposicions no de Llei o mocions, que no són vinculants. S'exclouen les votacions d'esmenes. Un diputat apareix només si consta el seu vot; no es dedueix la postura de ningú a partir del seu partit.",
    searchLabel: "Cerca diputat",
    searchPlaceholder: "Cognom o nom…",
    inFavour: "A favor",
    against: "En contra",
    abstention: "Abstenció",
    noVote: "No vota",
    present: "Presents",
    byGroup: "Per grup parlamentari",
    group: "Grup",
    officialRecord: "Acta oficial ↗",
    lawText: "Text de la llei ↗",
    session: "Sessió",
    noMatch: "Sense vots registrats per a aquesta cerca.",
    results: "diputats",
    kinds: {
      ley: "Votació final de llei",
      toma: "Presa en consideració",
      pnl: "Proposició no de Llei",
      mocion: "Moció conseqüència d'interpel·lació",
    },
    nonBinding: "no vinculant",
    legislature: "Legislatura",
  },
  salaries: {
    title: "Sous públics",
    intro:
      "Retribucions dels càrrecs públics en actiu, segons el Registre d'Alts Càrrecs i els portals de transparència. Cerca per nom, càrrec, municipi o comunitat.",
    search: "Cerca",
    searchPlaceholder: "Nom, càrrec, municipi…",
    party: "Partit",
    all: "Tots",
    role: "Càrrec",
    where: "Àmbit",
    annual: "Brut anual",
    people: "càrrecs",
    results: "resultats",
    noResults: "Sense resultats per a aquesta cerca.",
    prev: "Anterior",
    next: "Següent",
    page: "Pàgina",
    of: "de",
    median: "Mediana",
    sourceNote: "Font · Registre d'Alts Càrrecs / transparencia.gob.es",
    caveat:
      "Retribució del càrrec, no patrimoni ni ingressos privats. Només càrrecs marcats com a actius a la font.",
  },
  footer: {
    source: "Font · BDNS / SNPSAP — infosubvenciones.es",
    caveat: "Mostra finançament PÚBLIC. Donacions privades: vegeu metodologia.",
  },
  common: {
    backToPanel: "← Tornar al tauler",
    backToFaces: "← Cares",
    nif: "NIF",
  },
  blocs: {
    derecha: "Dreta",
    izquierda: "Esquerra",
    nacionalista: "Nacionalista",
    regionalista: "Regionalista",
    otro: "Altre",
  },
  kinds: {
    ordinaria: "Finançament ordinari",
    seguridad: "Despeses de seguretat",
    otra: "Altra",
    all: "Totes",
  },
  home: {
    eyebrow: "Subvencions estatals",
    titlePre: "Qui finança els ",
    titleEmph: "partits",
    titlePost: "?",
    intro:
      "Els diners públics que l'Estat lliura a cada partit, extrets en directe de la Base de Dades Nacional de Subvencions. Filtra per any i per tipus d'ajut per veure el repartiment.",
    totalLabel: "Total concedit (selecció)",
    parties: "Partits",
    concessions: "Concessions",
    updated: "Actualitzat",
    year: "Exercici",
    reset: "Reset",
    distribution: "Repartiment per partit",
    noResults: "No hi ha concessions per a aquesta selecció.",
  },
  party: {
    totalReceived: "Total rebut",
    ofNational: "del total nacional",
    facesTitle: "Cares del partit",
    whereFrom: "D'on ve",
    ofItsFunds: "dels seus fons",
    yearlyEvolution: "Evolució anual",
    privateTitle: "Finançament privat",
    donationsDeclared: "Donacions declarades",
    donors: "donants",
    privateCaveat:
      "Només persones físiques (les donacions d'empreses estan prohibides). Dada anual de l'últim informe disponible del Tribunal de Comptes.",
    ledgerTitle: "Registre de concessions",
    exercise: "Exercici",
    legalBasis: "base legal (BOE) ↗",
    inNews: "A les notícies",
    recentHeadlines: "Titulars recents · Google News",
  },
  politician: {
    partyFunding: "Finançament públic del seu partit",
    seeBreakdown: "veure desglossament →",
    caveat: "Les subvencions públiques es concedeixen al partit, no a la persona.",
    onBluesky: "A Bluesky",
  },
  caras: {
    title: "Cares",
    intro:
      "Polítics individuals: el seu partit i finançament públic, la seva activitat a Bluesky i els titulars on apareixen. Els perfils de Bluesky estan verificats un a un.",
    note:
      "La llista és una mostra curada. Bluesky té, ara mateix, més presència de l'esquerra; líders del PP i Vox no hi tenen compte verificable.",
  },
  feed: {
    justNow: "ara mateix",
    hoursAgo: (n: number) => `fa ${n} h`,
    daysAgo: (n: number) => `fa ${n} d`,
    noRecent: "Sense resultats recents.",
    cannotLoad: "No s'han pogut carregar les publicacions ara mateix.",
    reposted: "↻ Republicat",
  },
  method: {
    title: "Metodologia i límits",
    lead: "Aquesta eina és honesta sobre el que pot i no pot mostrar. Llegeix-ho abans de treure conclusions.",
    showTitle: "Què mostra",
    showP1a: "Les ",
    showP1emph: "subvencions públiques estatals",
    showP1b:
      " concedides als partits polítics, extretes en directe de la Base de Dades Nacional de Subvencions (BDNS / SNPSAP), el registre oficial del Ministeri d'Hisenda. Actualment ",
    showP1c: " i un total de ",
    showP1d: ". Dades actualitzades el ",
    showP2: "Es distingeixen dos tipus d'ajut estatal anual:",
    showB1: "Finançament ordinari — la subvenció principal, repartida segons representació parlamentària.",
    showB2: "Despeses de seguretat — ajuts per a despeses de protecció.",
    privTitle: "Finançament privat (parcial)",
    privP1:
      "Cada partit mostra també les seves donacions privades declarades, transcrites de l'Informe núm. 1573 del Tribunal de Comptes (exercici 2020). Amb dos advertiments importants:",
    privB1:
      "Les donacions d'empreses estan prohibides. Des de la reforma de 2015 de la Llei Orgànica 8/2007, les persones jurídiques no poden donar a partits; només persones físiques, amb un màxim de 50.000 €/any i sense donacions anònimes.",
    privB2:
      "Allò privat no és una API. Aquestes dades només es publiquen als informes anuals en PDF del Tribunal de Comptes, amb un o dos anys de retard; per això és una foto fixa de 2020 i no una dada en directe.",
    polTitle: "Polítics individuals",
    polP1:
      "La secció Cares reuneix polítics individuals amb el seu partit, la seva activitat a Bluesky i els titulars on apareixen. No hi ha una xifra de «finançament per polític»: les subvencions es concedeixen al partit, no a la persona. Cada perfil de Bluesky s'ha verificat un a un; ara mateix l'esquerra hi té més presència, i líders del PP i Vox no hi tenen compte verificable.",
    roadTitle: "Full de ruta",
    roadB1:
      "Fet — Subvencions públiques en directe (BDNS); donacions privades 2020 (Tribunal de Comptes); polítics individuals amb Bluesky i notícies.",
    roadB2:
      "Següent — Més exercicis de donacions del Tribunal de Comptes i fundacions vinculades a partits (ingesta periòdica de PDF, no en directe).",
    roadB3:
      "Després — Contractació pública i graf de vincles entre partits, fundacions i adjudicataris, etiquetat sempre com a associació, no prova d'influència.",
    srcTitle: "Fonts",
    src1: "BDNS / SNPSAP — concessions a partits polítics ↗",
    src2: "Tribunal de Comptes — partits polítics ↗",
    src3: "Llei Orgànica 8/2007 sobre finançament de partits ↗",
  },
};

export const DICTS: Record<Locale, Dict> = { es, en, ca };
export type { Dict };

// Resolve a locale (from a route param) to its dictionary + BCP-47 tag.
export function resolveLocale(param: string | undefined): Locale {
  return isLocale(param) ? param : DEFAULT_LOCALE;
}

export function getDict(param: string | undefined): {
  locale: Locale;
  bcp47: string;
  t: Dict;
} {
  const locale = resolveLocale(param);
  return { locale, bcp47: BCP47[locale], t: DICTS[locale] };
}

// Locale-aware "x ago" formatter shared by the feed components.
export function relativeTime(iso: string, locale: Locale): string {
  if (!iso) return "";
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const h = Math.round((Date.now() - ms) / 3.6e6);
  const f = DICTS[locale].feed;
  if (h < 1) return f.justNow;
  if (h < 24) return f.hoursAgo(h);
  return f.daysAgo(Math.round(h / 24));
}
