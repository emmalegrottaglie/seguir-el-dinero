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
  nav: {
    panel: "Panel",
    faces: "Caras",
    salaries: "Sueldos",
    people: "Políticos",
    votes: "Votaciones",
    methodology: "Metodología",
    funding: "Financiación",
    sectionData: "Datos",
    sectionAbout: "Sobre",
    menu: "Menú",
    skipToContent: "Saltar al contenido",
  },
  people: {
    title: "Políticos",
    intro:
      "Cada cargo público en activo: lo que cobra, la financiación de su partido, su voto registrado en leyes de derechos y, cuando existe, sus redes y los titulares en los que aparece.",
    featured: "Con voto registrado",
    featuredNote:
      "Perfiles con votación nominal documentada. El resto del registro aparece en el buscador.",
    directory: "Registro completo",
    hasRecord: "voto registrado",
    hasSocial: "redes",
    noRecord: "Sin voto registrado",
    noRecordExplain:
      "No consta ninguna votación nominal de esta persona en los asuntos que seguimos. No se deduce su postura a partir de su partido.",
    pay: "Retribución",
    partyFunding: "Financiación del partido",
    rightsRecord: "Voto en leyes de derechos",
    juxtaposition:
      "Voto registrado y financiación del partido se muestran juntos como asociación, no como causa: el dinero público no explica un voto concreto.",
    profile: "Ver perfil →",
    backToPeople: "← Políticos",
    affects: "Asuntos que afectan a minorías",
    affectsNote:
      "Leyes y mociones sobre derechos trans y LGTBI, salud sexual y reproductiva, y vivienda. Cada posición enlaza al acta oficial.",
  },
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
    byGroupCaption: "Un grupo por fila, con sus votos contados y el enlace a la financiación del partido cuando el grupo lo forma uno solo.",
    distribution: "Reparto",
    funding: "Financiación",
    severalParties: "Varios partidos",
    groupUnknown: "Grupo no identificado en el registro",
    groupNote:
      "Un grupo parlamentario no es un partido. Cuando el grupo lo forma un solo partido, la última columna enlaza a la financiación de ese partido; cuando lo forman varios, no se enlaza a ninguno, porque atribuir el dinero de una coalición a uno de sus miembros sería falso.",
    groupSource: "Composición de los grupos ↗",
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
  foundations: {
    title: "Fundaciones vinculadas a partidos",
    intro:
      "Las fundaciones y asociaciones ligadas a los partidos reciben dinero por su cuenta. Según el Tribunal de Cuentas, sus donaciones recibidas se duplicaron en 2021 y 2022 respecto a 2020.",
    privateDonations: "Donaciones privadas",
    publicSubsidies: "Subvenciones públicas",
    entities: "entidades auditadas",
    legalTitle: "Por qué importa",
    legalBody:
      "A los partidos les está prohibido recibir donaciones de personas jurídicas desde 2015. Estas fundaciones tampoco pueden aceptar donaciones de organismos, entidades o empresas públicas, y las donaciones de personas jurídicas privadas están sujetas a los mismos límites que las de los partidos. La diferencia está en una excepción: las entregas de dinero o bienes destinadas a financiar una actividad o un proyecto concreto de la fundación no se consideran donaciones, cuando responden a un interés común o al objeto estatutario de ambas entidades. Están obligadas a informar cada año al Ministerio de Hacienda.",
    gapTitle: "Lo que no muestra",
    gapBody:
      "El informe cubre los ejercicios 2021 y 2022. No hay datos posteriores publicados, y cuatro entidades aparecen sin partido porque el informe no indica su vínculo: no se les atribuye ninguno.",
    lawLink: "Ley Orgánica 8/2007, disposición adicional séptima ↗",
    tableTitle: "Por fundación",
    tableNote:
      "Donaciones y aportaciones recibidas, y subvenciones públicas, según los anexos III y IV del informe. El partido indicado es el que consta en el propio informe; cuando no lo indica, se deja en blanco.",
    entity: "Entidad",
    party: "Partido",
    donations: "Donaciones",
    subsidies: "Subvenciones",
    noPartyStated: "sin partido indicado",
    concentration: "concentración",
    concentrationNote:
      "de todas las donaciones a fundaciones vinculadas en 2021 y 2022 fue a una sola entidad.",
  },
  portal: {
    eyebrow: "Portal de transparencia política",
    titlePre: "Quién les paga, y ",
    titleEmph: "cómo votan",
    titlePost: ".",
    lead:
      "Seguimiento del dinero público y privado que reciben los partidos españoles, junto al voto registrado de sus cargos en las leyes que afectan a las personas trans y LGTBI, a la salud sexual y reproductiva, y al derecho a la vivienda.",
    statPublic: "Dinero público a partidos",
    statPrivate: "Donaciones privadas declaradas",
    statPeople: "Cargos públicos en activo",
    statVotes: "Votaciones seguidas",
    stanceTitle: "Cómo votó cada grupo",
    stanceNote:
      "Voto mayoritario de cada grupo, contado a partir de los votos nominales. Se indica el sentido del voto tal cual consta en el acta, no una interpretación: en votaciones de enmiendas, un No puede significar rechazar la enmienda y no oponerse a la ley. Consulta el acta oficial y el asunto de cada votación.",
    inFavourGroups: "Votó Sí",
    againstGroups: "Votó No",
    abstainGroups: "Se abstuvo",
    newsTitle: "Derechos LGTBI, trans y vivienda en la actualidad",
    newsNote:
      "Publicaciones recientes de una lista fija de medios y entidades. Las marcadas como publicación de la entidad son sus propios textos, y pueden tratar tanto de derechos como de su actividad.",
    newsSourcesLink: "Ver las fuentes",
    exploreTitle: "Explorar",
    exploreMoney: "El reparto del dinero público entre partidos, año a año.",
    explorePeople: "Cada cargo en activo: sueldo, partido y voto registrado.",
    exploreVotes: "Las votaciones seguidas, con desglose por grupo.",
    exploreMethod: "Fuentes, límites y qué no muestra esta herramienta.",
    linkFraming:
      "El dinero y los votos se publican juntos para poder consultarlos, no porque uno explique al otro. Una subvención pública no determina un voto concreto.",
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
    filterStatus: "{parties} partidos · {grants} concesiones · {total} con los filtros actuales",
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
    fromOrg: "publicación de la entidad",
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
    feedsTitle: "Fuentes de actualidad",
    feedsP1:
      "La portada no busca en la web abierta: lee una lista fija de canales RSS y Atom, de forma que el nombre de quien publica cada titular es siempre conocido y se muestra junto a él.",
    feedsGuard: (stale: number, item: number) =>
      `Una fuente cuya publicación más reciente supere los ${stale} días se considera apagada y se descarta por completo. Ninguna pieza con más de ${item} días entra en el panel, sea cual sea la fuente. Se muestran como máximo dos piezas por fuente, para que un medio que publica a diario no desplace a las entidades que publican una vez por semana.`,
    feedsSource: "Fuente",
    feedsKind: "Tipo",
    feedsTopics: "Temas",
    feedsOrg: "Entidad",
    feedsMedia: "Medio",
    feedsTopic: { lgtbi: "LGTBI y trans", vivienda: "Vivienda", pobreza: "Pobreza" },
    feedsExcludedP:
      "Estos canales se comprobaron y quedaron fuera. Se listan para que no se vuelvan a probar a ciegas y porque el primer caso es instructivo: un canal puede responder correctamente y llevar años sin publicar.",
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
  nav: {
    panel: "Dashboard",
    faces: "Faces",
    salaries: "Salaries",
    people: "Politicians",
    votes: "Votes",
    methodology: "Methodology",
    funding: "Funding",
    sectionData: "Data",
    sectionAbout: "About",
    menu: "Menu",
    skipToContent: "Skip to content",
  },
  people: {
    title: "Politicians",
    intro:
      "Every serving officeholder: what they are paid, how their party is funded, their recorded vote on rights legislation and, where it exists, their social presence and the headlines they appear in.",
    featured: "With a voting record",
    featuredNote:
      "Profiles with a documented roll-call vote. The rest of the register is in the search below.",
    directory: "Full register",
    hasRecord: "voting record",
    hasSocial: "social",
    noRecord: "No recorded vote",
    noRecordExplain:
      "This person has no roll-call vote on record for the items we track. Their position is not inferred from their party.",
    pay: "Pay",
    partyFunding: "Party funding",
    rightsRecord: "Vote on rights legislation",
    juxtaposition:
      "Recorded votes and party funding are shown side by side as association, not cause: public money does not explain any particular vote.",
    profile: "View profile →",
    backToPeople: "← Politicians",
    affects: "Issues affecting minorities",
    affectsNote:
      "Laws and motions on trans and LGBTI rights, sexual and reproductive health, and housing. Every position links to the official record.",
  },
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
    byGroupCaption: "One group per row, with its ballots counted and a link to the party's funding where the group is made up of one party.",
    distribution: "Split",
    funding: "Funding",
    severalParties: "Several parties",
    groupUnknown: "Group not in the registry",
    groupNote:
      "A parliamentary group is not a party. Where a group is made up of one party, the last column links to that party's funding; where it is a coalition, it links to none of them, because attributing a coalition's money to one member would be false.",
    groupSource: "Group composition ↗",
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
  foundations: {
    title: "Party-linked foundations",
    intro:
      "The foundations and associations tied to political parties receive money in their own right. According to the Court of Auditors, the donations they received doubled in 2021 and 2022 compared with 2020.",
    privateDonations: "Private donations",
    publicSubsidies: "Public subsidies",
    entities: "entities audited",
    legalTitle: "Why it matters",
    legalBody:
      "Parties have been barred from accepting donations from legal entities since 2015. These foundations likewise cannot accept donations from public bodies, entities or companies, and donations from private legal entities are subject to the same limits that apply to parties. The difference lies in one exception: money or assets given to finance a specific activity or project of the foundation are not treated as donations, where they answer to a common interest or to the statutory purpose of both entities. They must report annually to the Ministry of Finance.",
    gapTitle: "What this does not show",
    gapBody:
      "The report covers the 2021 and 2022 financial years. No later data is published, and four entities appear with no party because the report does not state their link: none is attributed to them.",
    lawLink: "Organic Law 8/2007, seventh additional provision ↗",
    tableTitle: "By foundation",
    tableNote:
      "Donations and contributions received, and public subsidies, from annexes III and IV of the report. The party shown is the one the report itself states; where it does not, the field is left blank.",
    entity: "Entity",
    party: "Party",
    donations: "Donations",
    subsidies: "Subsidies",
    noPartyStated: "no party stated",
    concentration: "concentration",
    concentrationNote:
      "of all donations to party-linked foundations in 2021 and 2022 went to a single entity.",
  },
  portal: {
    eyebrow: "Political transparency portal",
    titlePre: "Who pays them, and ",
    titleEmph: "how they vote",
    titlePost: ".",
    lead:
      "Tracking the public and private money Spanish parties receive, alongside the recorded votes of their officeholders on laws affecting trans and LGBTI people, sexual and reproductive health, and the right to housing.",
    statPublic: "Public money to parties",
    statPrivate: "Declared private donations",
    statPeople: "Serving officeholders",
    statVotes: "Votes tracked",
    stanceTitle: "How each group voted",
    stanceNote:
      "Each group's majority ballot, counted from the named votes. It reports the ballot as recorded, not an interpretation of intent: in a vote on amendments, a No can mean rejecting the amendment rather than opposing the law. Check the official record and the subject of each vote.",
    inFavourGroups: "Voted Yes",
    againstGroups: "Voted No",
    abstainGroups: "Abstained",
    newsTitle: "LGBTI, trans rights and housing in the news",
    newsNote:
      "Recent posts from a fixed list of outlets and organisations. Items marked as an organisation's own post are its own writing, and may cover its activities as much as rights news.",
    newsSourcesLink: "See the sources",
    exploreTitle: "Explore",
    exploreMoney: "How public money is split between parties, year by year.",
    explorePeople: "Every serving officeholder: pay, party and recorded vote.",
    exploreVotes: "The votes we track, broken down by group.",
    exploreMethod: "Sources, limits, and what this tool does not show.",
    linkFraming:
      "Money and votes are published together so they can be looked up, not because one explains the other. A public subsidy does not determine any particular vote.",
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
    filterStatus: "{parties} parties · {grants} grants · {total} under the current filters",
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
    fromOrg: "organisation's own post",
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
    feedsTitle: "News sources",
    feedsP1:
      "The front page does not search the open web: it reads a fixed list of RSS and Atom feeds, so the publisher of every headline is known and is shown next to it.",
    feedsGuard: (stale: number, item: number) =>
      `A source whose newest post is more than ${stale} days old is treated as dead and dropped whole. No item older than ${item} days enters the panel, whatever its source. At most two items per source are shown, so an outlet publishing daily cannot displace organisations that publish weekly.`,
    feedsSource: "Source",
    feedsKind: "Type",
    feedsTopics: "Topics",
    feedsOrg: "Organisation",
    feedsMedia: "Outlet",
    feedsTopic: { lgtbi: "LGBTI and trans", vivienda: "Housing", pobreza: "Poverty" },
    feedsExcludedP:
      "These feeds were checked and left out. They are listed so they are not blindly re-probed, and because the first case is instructive: a feed can answer perfectly well and still have published nothing for years.",
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
  nav: {
    panel: "Tauler",
    faces: "Cares",
    salaries: "Sous",
    people: "Polítics",
    votes: "Votacions",
    methodology: "Metodologia",
    funding: "Finançament",
    sectionData: "Dades",
    sectionAbout: "Sobre",
    menu: "Menú",
    skipToContent: "Salta al contingut",
  },
  people: {
    title: "Polítics",
    intro:
      "Cada càrrec públic en actiu: què cobra, el finançament del seu partit, el seu vot registrat en lleis de drets i, quan existeix, les seves xarxes i els titulars on apareix.",
    featured: "Amb vot registrat",
    featuredNote:
      "Perfils amb votació nominal documentada. La resta del registre és al cercador.",
    directory: "Registre complet",
    hasRecord: "vot registrat",
    hasSocial: "xarxes",
    noRecord: "Sense vot registrat",
    noRecordExplain:
      "No consta cap votació nominal d'aquesta persona en els assumptes que seguim. No es dedueix la seva postura a partir del seu partit.",
    pay: "Retribució",
    partyFunding: "Finançament del partit",
    rightsRecord: "Vot en lleis de drets",
    juxtaposition:
      "Vot registrat i finançament del partit es mostren junts com a associació, no com a causa: els diners públics no expliquen un vot concret.",
    profile: "Veure perfil →",
    backToPeople: "← Polítics",
    affects: "Assumptes que afecten minories",
    affectsNote:
      "Lleis i mocions sobre drets trans i LGBTI, salut sexual i reproductiva, i habitatge. Cada posició enllaça a l'acta oficial.",
  },
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
    byGroupCaption: "Un grup per fila, amb els seus vots comptats i l'enllaç al finançament del partit quan el grup el forma un de sol.",
    distribution: "Repartiment",
    funding: "Finançament",
    severalParties: "Diversos partits",
    groupUnknown: "Grup no identificat al registre",
    groupNote:
      "Un grup parlamentari no és un partit. Quan el grup el forma un sol partit, l'última columna enllaça al finançament d'aquest partit; quan el formen diversos, no s'enllaça a cap, perquè atribuir els diners d'una coalició a un dels seus membres seria fals.",
    groupSource: "Composició dels grups ↗",
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
  foundations: {
    title: "Fundacions vinculades a partits",
    intro:
      "Les fundacions i associacions lligades als partits reben diners pel seu compte. Segons el Tribunal de Comptes, les donacions rebudes es van duplicar el 2021 i el 2022 respecte al 2020.",
    privateDonations: "Donacions privades",
    publicSubsidies: "Subvencions públiques",
    entities: "entitats auditades",
    legalTitle: "Per què importa",
    legalBody:
      "Als partits els està prohibit rebre donacions de persones jurídiques des del 2015. Aquestes fundacions tampoc no poden acceptar donacions d'organismes, entitats o empreses públiques, i les donacions de persones jurídiques privades estan subjectes als mateixos límits que les dels partits. La diferència és una excepció: les entregues de diners o béns destinades a finançar una activitat o un projecte concret de la fundació no es consideren donacions, quan responen a un interès comú o a l'objecte estatutari de les dues entitats. Estan obligades a informar cada any al Ministeri d'Hisenda.",
    gapTitle: "Què no mostra",
    gapBody:
      "L'informe cobreix els exercicis 2021 i 2022. No hi ha dades posteriors publicades, i quatre entitats apareixen sense partit perquè l'informe no indica el seu vincle: no se'ls atribueix cap.",
    lawLink: "Llei Orgànica 8/2007, disposició addicional setena ↗",
    tableTitle: "Per fundació",
    tableNote:
      "Donacions i aportacions rebudes, i subvencions públiques, segons els annexos III i IV de l'informe. El partit indicat és el que consta al propi informe; quan no l'indica, es deixa en blanc.",
    entity: "Entitat",
    party: "Partit",
    donations: "Donacions",
    subsidies: "Subvencions",
    noPartyStated: "sense partit indicat",
    concentration: "concentració",
    concentrationNote:
      "de totes les donacions a fundacions vinculades el 2021 i el 2022 va anar a una sola entitat.",
  },
  portal: {
    eyebrow: "Portal de transparència política",
    titlePre: "Qui els paga, i ",
    titleEmph: "com voten",
    titlePost: ".",
    lead:
      "Seguiment dels diners públics i privats que reben els partits espanyols, juntament amb el vot registrat dels seus càrrecs en les lleis que afecten les persones trans i LGBTI, la salut sexual i reproductiva, i el dret a l'habitatge.",
    statPublic: "Diners públics als partits",
    statPrivate: "Donacions privades declarades",
    statPeople: "Càrrecs públics en actiu",
    statVotes: "Votacions seguides",
    stanceTitle: "Com va votar cada grup",
    stanceNote:
      "Vot majoritari de cada grup, comptat a partir dels vots nominals. Indica el sentit del vot tal com consta a l'acta, no una interpretació: en votacions d'esmenes, un No pot significar rebutjar l'esmena i no oposar-se a la llei. Consulta l'acta oficial i l'assumpte de cada votació.",
    inFavourGroups: "Va votar Sí",
    againstGroups: "Va votar No",
    abstainGroups: "Es va abstenir",
    newsTitle: "Drets LGBTI, trans i habitatge a l'actualitat",
    newsNote:
      "Publicacions recents d'una llista fixa de mitjans i entitats. Les marcades com a publicació de l'entitat són els seus propis textos, i poden tractar tant de drets com de la seva activitat.",
    newsSourcesLink: "Veure les fonts",
    exploreTitle: "Explorar",
    exploreMoney: "El repartiment dels diners públics entre partits, any a any.",
    explorePeople: "Cada càrrec en actiu: sou, partit i vot registrat.",
    exploreVotes: "Les votacions seguides, amb desglossament per grup.",
    exploreMethod: "Fonts, límits i què no mostra aquesta eina.",
    linkFraming:
      "Els diners i els vots es publiquen junts per poder consultar-los, no perquè l'un expliqui l'altre. Una subvenció pública no determina un vot concret.",
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
    filterStatus: "{parties} partits · {grants} concessions · {total} amb els filtres actuals",
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
    fromOrg: "publicació de l'entitat",
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
    feedsTitle: "Fonts d'actualitat",
    feedsP1:
      "La portada no cerca a la web oberta: llegeix una llista fixa de canals RSS i Atom, de manera que el nom de qui publica cada titular sempre es coneix i es mostra al costat.",
    feedsGuard: (stale: number, item: number) =>
      `Una font amb la publicació més recent de fa més de ${stale} dies es considera apagada i es descarta del tot. Cap peça de més de ${item} dies entra al panell, sigui quina sigui la font. Es mostren com a màxim dues peces per font, perquè un mitjà que publica cada dia no desplaci les entitats que publiquen un cop per setmana.`,
    feedsSource: "Font",
    feedsKind: "Tipus",
    feedsTopics: "Temes",
    feedsOrg: "Entitat",
    feedsMedia: "Mitjà",
    feedsTopic: { lgtbi: "LGBTI i trans", vivienda: "Habitatge", pobreza: "Pobresa" },
    feedsExcludedP:
      "Aquests canals es van comprovar i van quedar fora. Es llisten perquè no es tornin a provar a cegues i perquè el primer cas és instructiu: un canal pot respondre correctament i portar anys sense publicar.",
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
