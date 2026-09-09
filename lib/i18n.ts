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
    rights: "Derechos",
    map: "Mapa",
    foundations: "Fundaciones",
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
    eyebrow: "Votaciones nominales",
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
  map: {
    eyebrow: "Mapa territorial",
    title: "Dónde manda cada partido, y qué consta registrado allí",
    standfirst:
      "Pase el cursor para ver la comunidad. Pulse para fijarla en el panel. Las dos capas se muestran por separado y ninguna explica a la otra.",
    svgLabel: "Mapa de las comunidades autónomas",
    layerGov: "Gobierno autonómico",
    layerGovNote:
      "El partido de quien presidía cada comunidad en la fecha de comprobación, con la fecha en que tomó posesión. No es el resultado de las elecciones ni la composición del gobierno: es quién ocupa la presidencia.",
    layerHate: "Delitos de odio registrados",
    layerHateNote:
      "Tasa de delitos, infracciones administrativas y otros incidentes de odio por cada 100.000 habitantes, 2024. Son hechos conocidos por las fuerzas de seguridad, no condenas: la cifra depende de cuánto se denuncia y de cómo registra cada policía lo que se denuncia.",
    perHundredThousand: "por 100.000 hab.",
    panelKicker: "Ficha territorial",
    rowPresident: "Presidencia",
    rowParty: "Partido",
    rowSince: "Desde",
    rowRecorded: "Hechos conocidos 2024",
    rowRate: "Tasa por 100.000 hab.",
    barSogi: "Orientación sexual e identidad de género",
    barRacism: "Racismo y xenofobia",
    barsNote:
      "Dos de las doce motivaciones que distingue el informe, como proporción de los hechos conocidos de esa comunidad.",
    noData: "No consta",
    tableCaption:
      "Un territorio por fila, con las dos capas del mapa como cifras. El orden sigue a la capa activa: por partido en la de gobierno, por tasa en la de delitos de odio.",
    colTerritory: "Territorio",
    colRate: "Tasa / 100.000",
    sourcesTitle: "Fuentes",
    tablesLabel: "tablas",
    checkedLabel: "comprobado el",
    limits:
      "Los hechos conocidos incluyen infracciones administrativas y otros incidentes, no sólo delitos, y no son condenas. Las dos comunidades con policía autonómica propia —la Policía Foral de Navarra y la Ertzaintza— encabezan la tabla de tasas, lo que dice algo sobre cómo se registra y no necesariamente sobre dónde ocurre más. Un incidente del informe no consta en ningún territorio y por eso las columnas de aquí suman uno menos que la cifra nacional.",
    missingLayers:
      "El diseño de esta sección preveía tres capas más: un índice de derechos LGTBI, el estado de las reformas de las leyes trans y el voto a las formaciones que votaron en contra de las normas que este portal sigue. No están porque no hay todavía una fuente citable por comunidad para ninguna de las tres. Tampoco está el sombreado que marcaría las investiduras que dependieron de Vox: cinco presidencias del PP se investieron con sus votos en julio de 2023 y Vox salió de tres de esos gobiernos en julio de 2024, así que un sombreado fijo sería falso para parte del periodo que parecería describir.",
  },
  masthead: {
    edition: "Edición nº 001",
    live: "Datos en directo · BDNS",
    place: "Madrid",
    sources: "Fuentes: BDNS · Tribunal de Cuentas · Congreso",
    navLabel: "Secciones",
  },
  footer: {
    source:
      "Seguir el Dinero · Datos abiertos BDNS, Tribunal de Cuentas y Congreso de los Diputados",
    caveat: "Los hechos van uno junto a otro; ninguna causa se afirma",
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
  fundingStats: {
    eyebrow: "Los tres cauces del dinero",
    subsidies: "Subvenciones del Estado",
    subsidiesNote: "Total acumulado en la BDNS · actualizado a diario",
    donations: "Donaciones privadas 2020",
    donationsNote: "{donors} donantes declarados",
    electoral: "Gasto electoral 2024",
    electoralNote: "Gasto ordinario declarado en las europeas",
    capped: "Publicidad con tope legal",
    cappedNote: "{amount} · LOREG arts. 55 y 58",
    residual: "Línea residual sin desglosar",
    residualNote: "{amount} en una sola partida",
  },
  foundationsPage: {
    eyebrow: "El cauce que corre al revés",
    titlePre: "Quién paga a las ",
    titleEmph: "fundaciones",
    titlePost: " de los partidos, y quién las gobierna",
    standfirst:
      "A los partidos les está prohibido aceptar dinero de empresas; a sus fundaciones vinculadas no. Pero en las cifras auditadas el dinero de empresas es la parte pequeña, y casi nueve de cada diez euros que entran los pone el propio partido. Aquí están las entidades, sus cuentas y los patronatos que las dirigen.",
  },
  foundations: {
    title: "Quién paga a las fundaciones de los partidos",
    intro:
      "Cada partido tiene fundaciones y asociaciones vinculadas que reciben dinero por su cuenta. A los partidos les está prohibido aceptar dinero de empresas; a sus fundaciones no. Pero al mirar las cifras auditadas, el dinero de empresas es la parte pequeña: casi nueve de cada diez euros que entran los pone el propio partido.",
    fromParty: "Del propio partido",
    fromCompanies: "De empresas",
    fromIndividuals: "De particulares",
    publicSubsidies: "Subvenciones públicas",
    ofContributions: "de las aportaciones declaradas",
    publicNote: "Dinero público concedido a las fundaciones, aparte de las aportaciones.",
    entities: "entidades auditadas",
    contributionCount: "Aportaciones",
    origin: "Origen",
    counterpartyTitle: "Empresas y entidades con nombre en el informe",
    counterpartyNote:
      "El dinero de empresas casi nunca llega como donación, sino como convenio de colaboración con una contraprestación. El informe nombra a la contraparte sólo en estos casos, e indica si se cumplieron los tres deberes del apartado Cinco de la disposición adicional séptima: elevar a documento público, comunicar al Tribunal de Cuentas en tres meses y publicar en la web.",
    counterparty: "Contraparte",
    consideration: "Contraprestación",
    duties: "Deberes de publicidad",
    dutiesMet: "cumplidos",
    dutiesFailed: "incumplidos",
    dutiesUnclear: "el informe no lo precisa",
    registerTitle: "El registro obligatorio está casi vacío",
    registerBody:
      "La disposición adicional cuarta de la Ley Orgánica 6/2002 obliga a estas entidades a inscribirse en el Registro de Partidos Políticos. A 31 de diciembre de 2022 sólo constaban inscritas 18 fundaciones y 3 entidades de las fiscalizadas. El Tribunal de Cuentas pide al Ministerio del Interior que reclame las inscripciones pendientes, y ya lo había pedido en su informe anterior.",
    repeatedTitle: "Pedido dos veces, sin cumplir",
    repeatedBody:
      "Las siete recomendaciones de este informe son las mismas que el Tribunal de Cuentas ya formuló en su informe nº 1.533, sobre el ejercicio 2020, aprobado el 28 de septiembre de 2023. Las tres dirigidas al Gobierno siguen sin cumplirse porque no se ha modificado la ley. Las dirigidas a las propias fundaciones —ajustar su actividad a sus fines y presentar un plan de saneamiento cuando su patrimonio es negativo— tampoco se han cumplido.",
    legalTitle: "Qué permite la ley",
    legalBody:
      "Desde la reforma de 2015, un partido no puede aceptar donaciones de personas jurídicas, ni donaciones anónimas, ni más de 50.000 euros al año de una misma persona física, y debe rechazar el dinero de quien tenga un contrato público vigente. Sus fundaciones se rigen por la disposición adicional séptima: ahí las personas jurídicas sí pueden donar. Por encima de 120.000 euros la donación debe elevarse a documento público, toda donación de una persona jurídica debe comunicarse al Tribunal de Cuentas en tres meses y la identidad del donante debe publicarse. No pueden recibir dinero de organismos, entidades o empresas públicas.",
    lawLink: "Ley Orgánica 8/2007, disposición adicional séptima ↗",
    tableTitle: "Entidad por entidad",
    tableNote:
      "Una fila por entidad, sumando los ejercicios que el informe fiscaliza. El partido es el que consta en el propio informe. La última columna cuenta los incumplimientos que el Tribunal recoge en su ficha.",
    entity: "Entidad",
    party: "Partido",
    total: "Total recibido",
    findings: "Incumplimientos",
    noPartyStated: "sin partido indicado",
    gapTitle: "Lo que no muestra",
    gapBody:
      "El informe cubre 2021 y 2022; no hay datos posteriores publicados. No dice quiénes son las personas jurídicas que donaron: nombra a la contraparte sólo cuando el dinero llegó como convenio de colaboración. Y su propia aritmética falla en un punto, que se señala en la ficha correspondiente.",
    dossierEyebrow: "Entidad vinculada a un partido",
    identityTitle: "Datos generales",
    supervisor: "Protectorado o administración competente",
    constituted: "Año de constitución",
    registryLabel: "Registro de Partidos Políticos",
    registryYes: "inscrita",
    registryNo: "no inscrita",
    registryUnstated: "el informe no lo indica",
    notStated: "no consta",
    moneyInTitle: "De dónde vino el dinero",
    publicByTitle: "Dinero público, por organismo",
    grantingBody: "Organismo",
    dealsTitle: "Convenios de colaboración",
    findingsTitle: "Lo que encontró el Tribunal de Cuentas",
    noFindings: "El informe no recoge incumplimientos para este ejercicio.",
    accountsTitle: "Cuentas del ejercicio",
    netEquity: "Patrimonio neto",
    income: "Ingresos",
    expense: "Gastos",
    result: "Resultado",
    discrepancyTitle: "La aritmética del informe no cuadra aquí",
    discrepancyBody:
      "El informe declara {stated} pero sus propias partidas suman {itemised}, una diferencia de {difference}. Se publican las dos cifras porque el error es de la fuente, no de esta web.",
    exercise: "Ejercicio",
    backToChannel: "← Volver a las fundaciones",
    allEntities: "Ver la ficha",
    peopleTitle: "Quién lo gobierna",
    peopleNote:
      "Cargos en el patronato y en los órganos de gobierno, según la fuente que se cita en cada caso y con su fecha. Se distingue lo que consta en un registro o en una publicación de la propia entidad de lo que sólo consta en prensa. No se deduce nada: un cargo aparece sólo si una fuente con nombre lo afirma.",
    peopleAlso: "También consta",
    peopleFormer: "cargo pasado",
    peoplePress: "según {publisher} ({date})",
    peopleSince: "desde",
    peopleGapTitle: "Sin patronato publicado",
    peopleRenameTitle: "La entidad cambió de nombre",
    peopleRenameBody: "El informe la llama «{report}». Desde {when} se denomina «{current}».",
    peopleKindRegistry: "registro oficial",
    peopleKindOfficial: "fuente oficial",
    peopleKindFoundation: "publicación de la propia entidad",
    peopleKindPress: "prensa",
    peopleCoveragePress: "{press} de esos registros se apoyan en prensa y se muestran como tal.",
    peopleCoverageTitle: "Quién gobierna estas entidades",
    peopleCoverage:
      "Patronato documentado en {documented} de {entities} entidades auditadas: {people} personas y {ties} cargos externos, cada uno con su fuente y su fecha. Donde no se localizó un patronato publicado, la ficha lo dice.",
  },
  rights: {
    eyebrow: "Voces de las organizaciones",
    titlePre: "Lo que publican las ",
    titleEmph: "entidades",
    titlePost: ", en su propia voz",
    intro:
      "El resto de esta web mira al Estado: sus subvenciones, sus auditorías, sus votaciones registradas. Esta sección hace lo contrario y recoge lo que publican las propias organizaciones de derechos LGTBI, con su nombre delante de cada pieza.",
    orgsTitle: "Publicado por las organizaciones",
    orgsNote:
      "Ocho organizaciones, cada una a través de su propio canal. Van primero porque son fuente directa: hablan de sí mismas y de su trabajo, no de segunda mano.",
    mediaTitle: "Cobertura en medios",
    mediaNote:
      "Medios que cubren estos temas de forma continuada. Se muestran aparte para que quede claro qué es fuente directa y qué es cobertura.",
    directoryTitle: "De dónde sale todo esto",
    directoryNote:
      "El registro completo de canales que lee esta sección. Se enlaza cada organización para poder ir a la fuente y no sólo a lo que publicó esta quincena.",
    kindOrg: "Organizaciones",
    kindMedia: "Medios",
    empty:
      "Ningún canal ha devuelto piezas recientes. No es una afirmación sobre la actualidad: es un fallo de lectura, y se corrige solo cuando los canales responden.",
    droppedNote: "Canales que no respondieron en esta carga:",
    caveat:
      "Esta web no edita, resume ni reescribe estas piezas: muestra el titular, la fecha y el enlace al original. Las imágenes son las que publica cada canal y se sirven a través de este sitio, no directamente desde el servidor de la organización, para no exponer la IP de quien lee. El orden es por fecha, con las fuentes en el idioma de la página primero.",
    methodLink: "Cómo se eligieron estos canales, y cuáles se descartaron ↗",
    homeTitle: "Derechos LGTBI, en voz de las organizaciones",
    homeCta: "Ver la sección de derechos",
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
    titlePre: "El dinero de los ",
    titleEmph: "partidos",
    titlePost: ", canal por canal",
    channelTitle: "Subvenciones estatales a los partidos",
    subtitle:
      "Tres canales, cada uno con su fuente oficial: lo que el Estado les entrega, lo que declararon haber gastado en una campaña y lo que declararon recibir de particulares. El dinero de las fundaciones vinculadas tiene su propia sección.",
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
  voteFlow: {
    title: "Dinero declarado y voto registrado, uno junto a otro",
    sourceHead: "Donaciones privadas declaradas · 2020",
    outcomeHead: "Voto del grupo",
    caveat:
      "El grosor del trazo es la cuantía declarada, no una relación causal. Los dos registros son públicos, independientes y de años distintos: nada aquí afirma que el uno explique al otro.",
    scope:
      "{included} formaciones, las que tienen a la vez donaciones declaradas en el informe y un grupo propio con voto registrado en este llamamiento. Fuente del dinero: {report}.",
    excluded:
      "Quedan fuera, por no tener grupo propio en esta legislatura o no constar en el informe:",
  },
  donationsTable: {
    title: "Donaciones privadas declaradas, 2020",
    caption:
      "Una formación por fila, ordenadas por importe declarado. La barra reparte el total de cada partido entre los tres tramos del informe y está escalada contra el mayor total, no contra el total nacional.",
    rank: "Nº",
    party: "Formación",
    byTranche: "Reparto por tramos",
    total: "Total",
    donors: "Donantes",
    donorsWord: "donantes",
    tranchesNote:
      "Tramos del informe: menos de 1.000 €, de 1.000 a 10.000 €, más de 10.000 €.",
    trancheSmall: "Menos de 1.000 €",
    trancheMid: "De 1.000 a 10.000 €",
    trancheLarge: "Más de 10.000 €",
    legalNote:
      "Las empresas no pueden donar a los partidos desde la reforma de 2015 de la LO 8/2007: sólo personas físicas, con un máximo de 50.000 € al año y sin donaciones anónimas. No existe una cifra de financiación por político, y esta web no la calcula.",
  },
  spending: {
    eyebrow: "Gasto electoral · europeas de 2024",
    donutCentre: "DECLARADO",
    donutCaption:
      "Gasto ordinario declarado por cada formación en las elecciones europeas del 9 de junio de 2024.",
    linesTitle: "En qué se declaró gastado",
    lineAdvertising: "Publicidad exterior y en prensa y radio",
    lineAdvertisingNote:
      "Los dos únicos gastos con límite legal propio: arts. 55 y 58 de la LOREG.",
    lineResidual: "Línea residual, sin desglose en el informe",
    lineResidualNote:
      "«Otros gastos ordinarios». Es la mayor parte del gasto y el informe no dice en qué se fue.",
    lineFinancial: "Costes financieros y otros conceptos",
    lineFinancialNote: "Intereses liquidados y estimados de las operaciones de crédito.",
    lineMailings: "Envíos postales, aparte del gasto ordinario",
    lineMailingsNote:
      "{count} envíos con derecho a subvención. No entran en el gasto ordinario ni en el límite general, así que no tienen porcentaje de esa cifra: la barra va completa para decir que el denominador es otro.",
    title: "En qué se declaró gastado el dinero electoral",
    intro:
      "El Tribunal de Cuentas fiscaliza las cuentas de cada elección y desglosa el gasto declarado. Sólo dos tipos de publicidad tienen límite legal y aparecen detallados; el resto del gasto ordinario se agrupa en una única línea que el informe no desglosa.",
    unexplained: "Sin desglosar",
    ofDeclared: "del gasto ordinario declarado",
    advertising: "Publicidad",
    cappedOnly:
      "Publicidad exterior (art. 55 LOREG) y en prensa y radio (art. 58). Son los dos únicos gastos con límite propio.",
    mailings: "Envíos de propaganda",
    mailingItems: "envíos con derecho a subvención",
    declared: "Declarado",
    formation: "Formación",
    split: "Reparto",
    caption:
      "Una formación por fila, con el gasto ordinario declarado y cuánto de él corresponde a publicidad con límite legal frente a la línea residual «Otros gastos ordinarios». Los envíos de propaganda se contabilizan aparte y no entran en estas columnas.",
    gapTitle: "Lo que el registro no dice",
    gapBody:
      "«Otros gastos ordinarios» es una sola línea sin desglose y es la mayor parte del gasto declarado. El informe no dice en qué se gastó, y la ley no obliga a detallarlo: la publicidad digital no es una categoría con límite propio, y el propio Tribunal de Cuentas ha recomendado al Gobierno que legisle para que lo sea. Estas cifras son gasto declarado y fiscalizado, no una imputación de nada a nadie.",
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
    ctxTitle: "Qué dice el registro oficial sobre los delitos de odio",
    ctxLead:
      "Estas cifras son del Estado, no de esta web. Se publican aquí porque el dinero y los votos que recoge este sitio no significan nada sin el contexto de lo que ocurre en el país. No se afirma que una cosa explique la otra.",
    ctxRecordedTitle: "Hechos registrados por la policía",
    ctxRecordedNote:
      "Son hechos conocidos por las Fuerzas y Cuerpos de Seguridad: denuncias e incidentes registrados, no condenas. Los propios informes reconocen que muchos casos nunca llegan a la justicia, así que la cifra es un suelo, no un total.",
    ctxProsecutedTitle: "Actuación de la Fiscalía",
    ctxProsecutedNote:
      "Cuenta lo que hizo el Ministerio Fiscal, no lo que se denunció a la policía. Las dos series no son subconjuntos una de la otra y no deben sumarse.",
    ctxRacism: "por racismo o xenofobia",
    ctxLgtbi: "por orientación sexual o identidad de género",
    ctxSentences: "sentencias recibidas",
    ctxConvictions: "condenatorias",
    ctxCharges: "escritos de acusación por racismo o xenofobia",
    ctxChangeYear: "frente al año anterior",
    ctxFindingTitle: "Lo que ninguna autoridad ha declarado",
    ctxFindingBody:
      "Ninguna autoridad española ha resuelto que el gasto de campaña de un partido constituyera delito de odio. La Junta Electoral ordenó retirar una lona de Vox en Madrid, pero por el artículo 53 de la LOREG —propaganda fuera del periodo de campaña— y declinó expresamente pronunciarse sobre su contenido. El único intento penal conocido acabó archivado.",
    ctxCaseTitle: "El caso de los «menas», y cómo terminó",
    ctxCaseBody:
      "El cartel electoral de Vox para la Asamblea de Madrid de 2021 fue denunciado como delito de odio. El Juzgado de Instrucción nº 53 de Madrid lo sobreseyó el 29 de abril de 2021 y la Sección Segunda de la Audiencia Provincial de Madrid confirmó el archivo el 19 de julio de 2021, encuadrándolo en la «legítima lucha ideológica» de una campaña. Recurrieron el archivo la Fiscalía, el PSOE, Podemos, Izquierda Unida, la coalición Unidas Podemos y la asociación Progresa. Se recoge aquí precisamente porque el resultado fue negativo: un registro que enumere la acusación y no el archivo no es una herramienta de transparencia.",
    ctxNoTag:
      "Por eso esta web no etiqueta a nadie como «instigador de odio». No existe un registro público de condenas por persona que un particular pueda consultar y publicar: el artículo 10 de la LOPDGDD reserva los datos de condenas penales a las autoridades públicas, el CENDOJ disocia los datos personales antes de difundir las sentencias, y el Tribunal Constitucional (STC 58/2018) considera determinante que una persona pueda ser recuperada por su nombre. Se publican cifras agregadas oficiales y procedimientos concretos con su resultado; no inferencias.",
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
    rights: "Rights",
    map: "Map",
    foundations: "Foundations",
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
    eyebrow: "Recorded divisions",
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
  map: {
    eyebrow: "Territorial map",
    title: "Where each party governs, and what is on record there",
    standfirst:
      "Hover to read a community. Click to pin it to the panel. The two layers are shown separately and neither explains the other.",
    svgLabel: "Map of the autonomous communities",
    layerGov: "Regional government",
    layerGovNote:
      "The party of whoever held each community's presidency on the date checked, with the date they took office. It is not the election result and not the composition of the government: it is who holds the presidency.",
    layerHate: "Recorded hate crime",
    layerHateNote:
      "Rate of hate offences, administrative infractions and other incidents per 100,000 inhabitants, 2024. These are facts recorded by the security forces, not convictions: the figure depends on how much is reported and on how each police force records what is reported.",
    perHundredThousand: "per 100,000",
    panelKicker: "Territorial record",
    rowPresident: "President",
    rowParty: "Party",
    rowSince: "In office since",
    rowRecorded: "Recorded, 2024",
    rowRate: "Rate per 100,000",
    barSogi: "Sexual orientation and gender identity",
    barRacism: "Racism and xenophobia",
    barsNote:
      "Two of the twelve motivations the report distinguishes, as a proportion of that community's recorded facts.",
    noData: "Not on record",
    tableCaption:
      "One territory per row, with both map layers as figures. The order follows the active layer: by party on the government layer, by rate on the hate-crime one.",
    colTerritory: "Territory",
    colRate: "Rate / 100,000",
    sourcesTitle: "Sources",
    tablesLabel: "tables",
    checkedLabel: "checked",
    limits:
      "Recorded facts include administrative infractions and other incidents, not only offences, and they are not convictions. The two communities with their own regional police forces — the Policía Foral de Navarra and the Ertzaintza — head the rate table, which says something about how incidents are recorded and not necessarily about where more of them happen. One incident in the report is recorded in no territory at all, which is why the columns here sum to one less than the national figure.",
    missingLayers:
      "This section was designed with three further layers: an LGBTI rights index, the state of trans-law reform, and vote share for the formations that voted against the measures this site tracks. They are absent because there is no citable per-community source for any of the three yet. So is the hatching that would mark investitures dependent on Vox: five PP presidencies were invested with its votes in July 2023 and Vox then left three of those governments in July 2024, so one fixed overlay would be false for part of the period it appeared to describe.",
  },
  masthead: {
    edition: "Edition no. 001",
    live: "Live data · BDNS",
    place: "Madrid",
    sources: "Sources: BDNS · Court of Auditors · Congress",
    navLabel: "Sections",
  },
  footer: {
    source:
      "Seguir el Dinero · Open data from the BDNS, the Court of Auditors and the Congress of Deputies",
    caveat: "Facts are placed side by side; no cause is asserted",
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
  fundingStats: {
    eyebrow: "The three channels the money runs through",
    subsidies: "State subsidies",
    subsidiesNote: "Running total in the BDNS · updated daily",
    donations: "Private donations, 2020",
    donationsNote: "{donors} declared donors",
    electoral: "Electoral spending, 2024",
    electoralNote: "Ordinary spending declared for the European elections",
    capped: "Advertising under a legal cap",
    cappedNote: "{amount} · LOREG arts. 55 and 58",
    residual: "Residual line, not broken down",
    residualNote: "{amount} in a single item",
  },
  foundationsPage: {
    eyebrow: "The channel that runs the other way",
    titlePre: "Who pays the parties’ ",
    titleEmph: "foundations",
    titlePost: ", and who governs them",
    standfirst:
      "Parties may accept no corporate money at all; their linked foundations may. But in the audited figures corporate money is the small part, and nearly nine in every ten euros coming in are put there by the party itself. Here are the entities, their accounts, and the boards that run them.",
  },
  foundations: {
    title: "Who pays the parties' foundations",
    intro:
      "Every party has linked foundations and associations that take money in their own right. Parties may not accept money from companies; their foundations may. But in the audited figures the corporate share is the small one: almost nine of every ten euros coming in are put there by the party itself.",
    fromParty: "From the party itself",
    fromCompanies: "From companies",
    fromIndividuals: "From individuals",
    publicSubsidies: "Public subsidies",
    ofContributions: "of declared contributions",
    publicNote: "Public money granted to the foundations, on top of the contributions.",
    entities: "audited entities",
    contributionCount: "Contributions",
    origin: "Source",
    counterpartyTitle: "Companies and entities the report names",
    counterpartyNote:
      "Corporate money almost never arrives as a donation. It arrives as a collaboration agreement with something given in return, and the report names the counterparty only in those cases — stating whether the three duties in apartado Cinco of disposición adicional séptima were met: raise it to a public deed, notify the Tribunal de Cuentas within three months, and publish it on the website.",
    counterparty: "Counterparty",
    consideration: "In return",
    duties: "Disclosure duties",
    dutiesMet: "met",
    dutiesFailed: "not met",
    dutiesUnclear: "the report does not settle it",
    registerTitle: "The compulsory register is nearly empty",
    registerBody:
      "Disposición adicional cuarta of Ley Orgánica 6/2002 obliges these entities to register in the Registro de Partidos Políticos. At 31 December 2022 only 18 foundations and 3 entities of those audited were registered. The Tribunal de Cuentas asks the Interior Ministry to chase the rest — as it had already asked in its previous report.",
    repeatedTitle: "Asked twice, still unmet",
    repeatedBody:
      "This report's seven recommendations are the same ones the Tribunal de Cuentas made in report nº 1.533 on the 2020 exercise, approved on 28 September 2023. The three addressed to the Government remain unmet because the law was never amended. Those addressed to the foundations themselves — keep to their own stated purposes, and produce a recovery plan where equity is negative — have not been met either.",
    legalTitle: "What the law allows",
    legalBody:
      "Since the 2015 reform a party may not accept donations from legal entities, nor anonymous donations, nor more than €50,000 a year from one individual, and must refuse money from anyone holding a live public contract. Its foundations are governed instead by disposición adicional séptima, where legal entities may donate. Above €120,000 the donation must be raised to a public deed, every donation from a legal entity must be notified to the Tribunal de Cuentas within three months, and the donor's identity must be published. They may not take money from public bodies, entities or companies.",
    lawLink: "Ley Orgánica 8/2007, disposición adicional séptima ↗",
    tableTitle: "Entity by entity",
    tableNote:
      "One row per entity, adding the exercises the report audits. The party is the one the report itself states. The last column counts the breaches the Tribunal records in that entity's own dossier.",
    entity: "Entity",
    party: "Party",
    total: "Total received",
    findings: "Breaches",
    noPartyStated: "no party stated",
    gapTitle: "What this does not show",
    gapBody:
      "The report covers 2021 and 2022; nothing later has been published. It does not say which legal entities donated — it names the counterparty only where the money arrived as a collaboration agreement. And its own arithmetic fails in one place, which is flagged on the dossier concerned.",
    dossierEyebrow: "Entity linked to a party",
    identityTitle: "Identity",
    supervisor: "Supervising administration",
    constituted: "Year constituted",
    registryLabel: "Registro de Partidos Políticos",
    registryYes: "registered",
    registryNo: "not registered",
    registryUnstated: "the report does not say",
    notStated: "not stated",
    moneyInTitle: "Where the money came from",
    publicByTitle: "Public money, by granting body",
    grantingBody: "Granting body",
    dealsTitle: "Collaboration agreements",
    findingsTitle: "What the Tribunal de Cuentas found",
    noFindings: "The report records no breaches for this exercise.",
    accountsTitle: "Accounts for the exercise",
    netEquity: "Net equity",
    income: "Income",
    expense: "Expenditure",
    result: "Result",
    discrepancyTitle: "The report's arithmetic does not add up here",
    discrepancyBody:
      "The report states {stated} while its own lines sum to {itemised}, a difference of {difference}. Both figures are published, because the error is the source's and not this site's.",
    exercise: "Exercise",
    backToChannel: "← Back to the foundations",
    allEntities: "Open the dossier",
    peopleTitle: "Who governs it",
    peopleNote:
      "Roles on the board and in the governing bodies, each according to the source cited beside it and carrying that source's date. What stands in a register or in the entity's own disclosure is kept apart from what stands only in the press. Nothing is inferred: a role appears only where a named source states it.",
    peopleAlso: "Also on record",
    peopleFormer: "former role",
    peoplePress: "according to {publisher} ({date})",
    peopleSince: "since",
    peopleGapTitle: "No board published",
    peopleRenameTitle: "The entity changed its name",
    peopleRenameBody: "The report calls it “{report}”. Since {when} it trades as “{current}”.",
    peopleKindRegistry: "official register",
    peopleKindOfficial: "official filing",
    peopleKindFoundation: "the entity's own disclosure",
    peopleKindPress: "press",
    peopleCoveragePress: "{press} of those records rest on journalism and are shown as such.",
    peopleCoverageTitle: "Who governs these entities",
    peopleCoverage:
      "A board is documented for {documented} of the {entities} audited entities: {people} people and {ties} outside roles, each with its source and date. Where no published board could be found, the dossier says so.",
  },
  rights: {
    eyebrow: "The organisations' own voices",
    titlePre: "What the ",
    titleEmph: "organisations",
    titlePost: " publish, in their own words",
    intro:
      "The rest of this site looks at the state: its subsidies, its audits, its recorded votes. This section does the opposite and carries what the LGBTQ+ rights organisations publish themselves, with their name in front of every piece.",
    orgsTitle: "Published by the organisations",
    orgsNote:
      "Eight organisations, each through its own channel. They come first because they are first-hand: they are writing about themselves and their own work, not relaying it.",
    mediaTitle: "Coverage in the press",
    mediaNote:
      "Outlets that cover these subjects continuously. Shown separately so it stays clear what is first-hand and what is coverage.",
    directoryTitle: "Where all of this comes from",
    directoryNote:
      "The full registry of channels this section reads. Each organisation is linked so you can go to the source, not only to whatever it published this fortnight.",
    kindOrg: "Organisations",
    kindMedia: "Press",
    empty:
      "No channel returned anything recent. That is not a statement about the news: it is a read failure, and it clears itself when the channels answer.",
    droppedNote: "Channels that did not answer on this load:",
    caveat:
      "This site does not edit, summarise or rewrite these pieces: it shows the headline, the date and a link to the original. The images are the ones each channel publishes, served through this site rather than straight from the organisation's server, so a reader's IP address is not exposed. Order is by date, with sources in the page's language first.",
    methodLink: "How these channels were chosen, and which were rejected \u2197",
    homeTitle: "LGBTQ+ rights, in the organisations' own voices",
    homeCta: "Open the rights section",
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
    titlePre: "Party money, ",
    titleEmph: "channel",
    titlePost: " by channel",
    channelTitle: "State subsidies to the parties",
    subtitle:
      "Three channels, each with its own official source: what the state hands them, what they declared spending on a campaign, and what they declared receiving from individuals. The money reaching their linked foundations has a section of its own.",
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
  voteFlow: {
    title: "Declared money and recorded vote, side by side",
    sourceHead: "Declared private donations · 2020",
    outcomeHead: "Group’s vote",
    caveat:
      "The thickness of a ribbon is the amount declared, not a causal relation. The two registers are public, independent and from different years: nothing here asserts that one explains the other.",
    scope:
      "{included} formations — those with both declared donations in the report and a group of their own with a recorded vote in this division. Money source: {report}.",
    excluded:
      "Left out, for having no group of their own in this legislature or not appearing in the report:",
  },
  donationsTable: {
    title: "Declared private donations, 2020",
    caption:
      "One formation per row, ordered by declared amount. The bar splits each party's total across the report's three tranches and is scaled against the largest total, not against the national one.",
    rank: "No.",
    party: "Formation",
    byTranche: "Split by tranche",
    total: "Total",
    donors: "Donors",
    donorsWord: "donors",
    tranchesNote:
      "The report's tranches: under €1,000, €1,000–10,000, over €10,000.",
    trancheSmall: "Under €1,000",
    trancheMid: "€1,000–10,000",
    trancheLarge: "Over €10,000",
    legalNote:
      "Companies have not been able to donate to parties since the 2015 reform of LO 8/2007: natural persons only, capped at €50,000 a year, with no anonymous gifts. There is no per-politician funding figure, and this site does not compute one.",
  },
  spending: {
    eyebrow: "Electoral spending · 2024 European elections",
    donutCentre: "DECLARED",
    donutCaption:
      "Ordinary spending declared by each formation for the European elections of 9 June 2024.",
    linesTitle: "What it was declared to have bought",
    lineAdvertising: "Outdoor, press and radio advertising",
    lineAdvertisingNote:
      "The only two kinds of spending with a cap of their own: LOREG arts. 55 and 58.",
    lineResidual: "Residual line, not broken down in the report",
    lineResidualNote:
      "“Otros gastos ordinarios”. It is most of the spending, and the report does not say where it went.",
    lineFinancial: "Financial costs and other items",
    lineFinancialNote: "Settled and estimated interest on credit facilities.",
    lineMailings: "Mailings, accounted separately from ordinary spending",
    lineMailingsNote:
      "{count} mailings carrying a subsidy entitlement. They are outside ordinary spending and outside the general cap, so they have no share of that figure: the bar runs full width to say the denominator is a different one.",
    title: "What the electoral money was declared to have bought",
    intro:
      "The Tribunal de Cuentas audits each election's accounts and itemises the declared spending. Only two kinds of advertising carry a legal cap and appear broken out; the rest of ordinary spending is grouped into a single line the report does not break down.",
    unexplained: "Not broken down",
    ofDeclared: "of declared ordinary spending",
    advertising: "Advertising",
    cappedOnly:
      "Outdoor advertising (LOREG art. 55) and press and radio (art. 58). These are the only two expenses with a cap of their own.",
    mailings: "Propaganda mailings",
    mailingItems: "mailings carrying a subsidy entitlement",
    declared: "Declared",
    formation: "Formation",
    split: "Split",
    caption:
      "One formation per row, with its declared ordinary spending and how much of it is capped advertising against the residual line “Otros gastos ordinarios”. Propaganda mailings are accounted separately and are not in these columns.",
    gapTitle: "What the record does not say",
    gapBody:
      "“Otros gastos ordinarios” is a single line with no breakdown, and it is most of the declared spending. The report does not say what it bought, and the law does not require it to: digital advertising is not a category with its own cap, and the Tribunal de Cuentas has itself recommended that the Government legislate to make it one. These are declared and audited figures, not an imputation of anything to anyone.",
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
    ctxTitle: "What the official record says about hate crime",
    ctxLead:
      "These figures are the state's, not this site's. They are here because the money and the votes this site collects mean nothing without the context of what happens in the country. Neither is claimed to explain the other.",
    ctxRecordedTitle: "Incidents recorded by the police",
    ctxRecordedNote:
      "These are hechos conocidos — reports and incidents recorded by the security forces, not convictions. The reports themselves acknowledge that many cases never reach the justice system, so the figure is a floor, not a total.",
    ctxProsecutedTitle: "Prosecution activity",
    ctxProsecutedNote:
      "This counts what the prosecution service did, not what was reported to the police. The two series are not subsets of one another and must not be added.",
    ctxRacism: "for racism or xenophobia",
    ctxLgtbi: "for sexual orientation or gender identity",
    ctxSentences: "sentences received",
    ctxConvictions: "convictions",
    ctxCharges: "charge sheets citing racism or xenophobia",
    ctxChangeYear: "on the previous year",
    ctxFindingTitle: "What no authority has found",
    ctxFindingBody:
      "No Spanish authority has ever ruled that a party's campaign spending constituted a hate crime. The electoral board ordered a Vox banner in Madrid taken down, but under Article 53 LOREG — propaganda outside the campaign period — and expressly declined to rule on its content. The one known criminal attempt was archived.",
    ctxCaseTitle: "The «menas» case, and how it ended",
    ctxCaseBody:
      "Vox's campaign poster for the 2021 Madrid Assembly election was reported as a hate crime. Juzgado de Instrucción nº 53 de Madrid dismissed the case on 29 April 2021, and Sección Segunda of the Audiencia Provincial de Madrid confirmed the archiving on 19 July 2021, framing it within the legitimate ideological struggle of an election campaign. The dismissal was appealed by the Fiscalía, PSOE, Podemos, Izquierda Unida, the Unidas Podemos coalition and the Progresa association. It is recorded here precisely because the outcome was negative: a record that lists the accusation and not the acquittal is not a transparency tool.",
    ctxNoTag:
      "This is why the site tags nobody as a «hate instigator». There is no public per-person register of convictions a private party may consult and republish: Article 10 LOPDGDD reserves criminal-conviction data to public authorities, CENDOJ dissociates personal data before disseminating judgments, and the Constitutional Court (STC 58/2018) treats retrievability of a person by name as the decisive harm. Official aggregates and specific proceedings with their outcome are published; inferences are not.",
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
    rights: "Drets",
    map: "Mapa",
    foundations: "Fundacions",
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
    eyebrow: "Votacions nominals",
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
  map: {
    eyebrow: "Mapa territorial",
    title: "On manà cada partit, i què hi consta registrat",
    standfirst:
      "Passeu el cursor per veure la comunitat. Premeu per fixar-la al panell. Les dues capes es mostren per separat i cap no explica l'altra.",
    svgLabel: "Mapa de les comunitats autònomes",
    layerGov: "Govern autonòmic",
    layerGovNote:
      "El partit de qui presidia cada comunitat a la data de comprovació, amb la data en què va prendre possessió. No és el resultat de les eleccions ni la composició del govern: és qui ocupa la presidència.",
    layerHate: "Delictes d'odi registrats",
    layerHateNote:
      "Taxa de delictes, infraccions administratives i altres incidents d'odi per cada 100.000 habitants, 2024. Són fets coneguts per les forces de seguretat, no condemnes: la xifra depèn de quant es denuncia i de com registra cada policia el que es denuncia.",
    perHundredThousand: "per 100.000 hab.",
    panelKicker: "Fitxa territorial",
    rowPresident: "Presidència",
    rowParty: "Partit",
    rowSince: "Des de",
    rowRecorded: "Fets coneguts 2024",
    rowRate: "Taxa per 100.000 hab.",
    barSogi: "Orientació sexual i identitat de gènere",
    barRacism: "Racisme i xenofòbia",
    barsNote:
      "Dues de les dotze motivacions que distingeix l'informe, com a proporció dels fets coneguts d'aquella comunitat.",
    noData: "No consta",
    tableCaption:
      "Un territori per fila, amb les dues capes del mapa com a xifres. L'ordre segueix la capa activa: per partit a la de govern, per taxa a la de delictes d'odi.",
    colTerritory: "Territori",
    colRate: "Taxa / 100.000",
    sourcesTitle: "Fonts",
    tablesLabel: "taules",
    checkedLabel: "comprovat el",
    limits:
      "Els fets coneguts inclouen infraccions administratives i altres incidents, no només delictes, i no són condemnes. Les dues comunitats amb policia autonòmica pròpia —la Policia Foral de Navarra i l'Ertzaintza— encapçalen la taula de taxes, cosa que diu alguna cosa sobre com es registra i no necessàriament sobre on passa més. Un incident de l'informe no consta en cap territori, i per això les columnes d'aquí sumen un menys que la xifra estatal.",
    missingLayers:
      "El disseny d'aquesta secció preveia tres capes més: un índex de drets LGTBI, l'estat de les reformes de les lleis trans i el vot a les formacions que van votar en contra de les normes que aquest portal segueix. No hi són perquè encara no hi ha una font citable per comunitat per a cap de les tres. Tampoc no hi és l'ombrejat que marcaria les investidures que van dependre de Vox: cinc presidències del PP es van investir amb els seus vots el juliol del 2023 i Vox va sortir de tres d'aquells governs el juliol del 2024, així que un ombrejat fix seria fals per a part del període que semblaria descriure.",
  },
  masthead: {
    edition: "Edició nº 001",
    live: "Dades en directe · BDNS",
    place: "Madrid",
    sources: "Fonts: BDNS · Tribunal de Comptes · Congrés",
    navLabel: "Seccions",
  },
  footer: {
    source:
      "Seguir el Dinero · Dades obertes de la BDNS, el Tribunal de Comptes i el Congrés dels Diputats",
    caveat: "Els fets van un al costat de l’altre; no s’afirma cap causa",
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
  fundingStats: {
    eyebrow: "Els tres canals del diner",
    subsidies: "Subvencions de l'Estat",
    subsidiesNote: "Total acumulat a la BDNS · actualitzat diàriament",
    donations: "Donacions privades 2020",
    donationsNote: "{donors} donants declarats",
    electoral: "Despesa electoral 2024",
    electoralNote: "Despesa ordinària declarada a les europees",
    capped: "Publicitat amb límit legal",
    cappedNote: "{amount} · LOREG arts. 55 i 58",
    residual: "Línia residual sense desglossar",
    residualNote: "{amount} en una sola partida",
  },
  foundationsPage: {
    eyebrow: "El canal que corre a l'inrevés",
    titlePre: "Qui paga les ",
    titleEmph: "fundacions",
    titlePost: " dels partits, i qui les governa",
    standfirst:
      "Als partits els està prohibit acceptar diners d'empreses; a les seves fundacions vinculades no. Però en les xifres auditades el diner d'empreses és la part petita, i gairebé nou de cada deu euros que entren els posa el mateix partit. Aquí hi ha les entitats, els seus comptes i els patronats que les dirigeixen.",
  },
  foundations: {
    title: "Qui paga les fundacions dels partits",
    intro:
      "Cada partit té fundacions i associacions vinculades que reben diners pel seu compte. Als partits els està prohibit acceptar diners d'empreses; a les seves fundacions, no. Però en les xifres auditades els diners d'empreses són la part petita: gairebé nou de cada deu euros que entren els posa el propi partit.",
    fromParty: "Del propi partit",
    fromCompanies: "D'empreses",
    fromIndividuals: "De particulars",
    publicSubsidies: "Subvencions públiques",
    ofContributions: "de les aportacions declarades",
    publicNote: "Diners públics concedits a les fundacions, al marge de les aportacions.",
    entities: "entitats auditades",
    contributionCount: "Aportacions",
    origin: "Origen",
    counterpartyTitle: "Empreses i entitats amb nom a l'informe",
    counterpartyNote:
      "Els diners d'empreses gairebé mai arriben com a donació, sinó com a conveni de col·laboració amb una contraprestació. L'informe nomena la contrapart només en aquests casos, i indica si es van complir els tres deures de l'apartat Cinc de la disposició addicional setena: elevar a document públic, comunicar al Tribunal de Comptes en tres mesos i publicar-ho al web.",
    counterparty: "Contrapart",
    consideration: "Contraprestació",
    duties: "Deures de publicitat",
    dutiesMet: "complerts",
    dutiesFailed: "incomplerts",
    dutiesUnclear: "l'informe no ho precisa",
    registerTitle: "El registre obligatori és gairebé buit",
    registerBody:
      "La disposició addicional quarta de la Llei Orgànica 6/2002 obliga aquestes entitats a inscriure's al Registre de Partits Polítics. A 31 de desembre de 2022 només hi constaven inscrites 18 fundacions i 3 entitats de les fiscalitzades. El Tribunal de Comptes demana al Ministeri de l'Interior que reclami les inscripcions pendents, i ja ho havia demanat a l'informe anterior.",
    repeatedTitle: "Demanat dues vegades, sense complir",
    repeatedBody:
      "Les set recomanacions d'aquest informe són les mateixes que el Tribunal de Comptes ja va formular a l'informe nº 1.533, sobre l'exercici 2020, aprovat el 28 de setembre de 2023. Les tres dirigides al Govern segueixen sense complir-se perquè no s'ha modificat la llei. Les dirigides a les mateixes fundacions —ajustar l'activitat als seus fins i presentar un pla de sanejament quan el patrimoni és negatiu— tampoc s'han complert.",
    legalTitle: "Què permet la llei",
    legalBody:
      "Des de la reforma de 2015, un partit no pot acceptar donacions de persones juríiques, ni donacions anònimes, ni més de 50.000 euros l'any d'una mateixa persona física, i ha de rebutjar els diners de qui tingui un contracte públic vigent. Les seves fundacions es regeixen per la disposició addicional setena: allà les persones juríiques sí que poden donar. Per damunt de 120.000 euros la donació s'ha d'elevar a document públic, tota donació d'una persona jurídica s'ha de comunicar al Tribunal de Comptes en tres mesos i la identitat del donant s'ha de publicar. No poden rebre diners d'organismes, entitats o empreses públiques.",
    lawLink: "Llei Orgànica 8/2007, disposició addicional setena ↗",
    tableTitle: "Entitat per entitat",
    tableNote:
      "Una fila per entitat, sumant els exercicis que l'informe fiscalitza. El partit és el que consta al propi informe. L'última columna compta els incompliments que el Tribunal recull a la seva fitxa.",
    entity: "Entitat",
    party: "Partit",
    total: "Total rebut",
    findings: "Incompliments",
    noPartyStated: "sense partit indicat",
    gapTitle: "Què no mostra",
    gapBody:
      "L'informe cobreix 2021 i 2022; no hi ha dades posteriors publicades. No diu qui són les persones juríiques que van donar: nomena la contrapart només quan els diners van arribar com a conveni de col·laboració. I la seva pròpia aritmètica falla en un punt, que s'assenyala a la fitxa corresponent.",
    dossierEyebrow: "Entitat vinculada a un partit",
    identityTitle: "Dades generals",
    supervisor: "Protectorat o administració competent",
    constituted: "Any de constitució",
    registryLabel: "Registre de Partits Polítics",
    registryYes: "inscrita",
    registryNo: "no inscrita",
    registryUnstated: "l'informe no ho indica",
    notStated: "no consta",
    moneyInTitle: "D'on van venir els diners",
    publicByTitle: "Diners públics, per organisme",
    grantingBody: "Organisme",
    dealsTitle: "Convenis de col·laboració",
    findingsTitle: "Què va trobar el Tribunal de Comptes",
    noFindings: "L'informe no recull incompliments per a aquest exercici.",
    accountsTitle: "Comptes de l'exercici",
    netEquity: "Patrimoni net",
    income: "Ingressos",
    expense: "Despeses",
    result: "Resultat",
    discrepancyTitle: "L'aritmètica de l'informe no quadra aquí",
    discrepancyBody:
      "L'informe declara {stated} però les seves pròpies partides sumen {itemised}, una diferència de {difference}. Es publiquen les dues xifres perquè l'error és de la font, no d'aquest web.",
    exercise: "Exercici",
    backToChannel: "← Tornar a les fundacions",
    allEntities: "Veure la fitxa",
    peopleTitle: "Qui el governa",
    peopleNote:
      "Càrrecs al patronat i als òrgans de govern, segons la font que se cita en cada cas i amb la seva data. Es distingeix el que consta en un registre o en una publicació de la mateixa entitat del que només consta en premsa. No es dedueix res: un càrrec apareix només si una font amb nom l'afirma.",
    peopleAlso: "També consta",
    peopleFormer: "càrrec passat",
    peoplePress: "segons {publisher} ({date})",
    peopleSince: "des de",
    peopleGapTitle: "Sense patronat publicat",
    peopleRenameTitle: "L'entitat va canviar de nom",
    peopleRenameBody: "L'informe l'anomena «{report}». Des de {when} es denomina «{current}».",
    peopleKindRegistry: "registre oficial",
    peopleKindOfficial: "font oficial",
    peopleKindFoundation: "publicació de la mateixa entitat",
    peopleKindPress: "premsa",
    peopleCoveragePress: "{press} d'aquests registres es basen en premsa i es mostren com a tals.",
    peopleCoverageTitle: "Qui governa aquestes entitats",
    peopleCoverage:
      "Patronat documentat en {documented} de {entities} entitats auditades: {people} persones i {ties} càrrecs externs, cada un amb la seva font i la seva data. On no es va localitzar un patronat publicat, la fitxa ho diu.",
  },
  rights: {
    eyebrow: "Veus de les organitzacions",
    titlePre: "El que publiquen les ",
    titleEmph: "entitats",
    titlePost: ", amb la seva pr\u00f2pia veu",
    intro:
      "La resta d'aquest web mira l'Estat: les seves subvencions, les seves auditories, les seves votacions registrades. Aquesta secci\u00f3 fa el contrari i recull el que publiquen les mateixes organitzacions de drets LGTBI, amb el seu nom davant de cada pe\u00e7a.",
    orgsTitle: "Publicat per les organitzacions",
    orgsNote:
      "Vuit organitzacions, cada una a trav\u00e9s del seu propi canal. Van primer perqu\u00e8 s\u00f3n font directa: parlen d'elles mateixes i de la seva feina, no de segona m\u00e0.",
    mediaTitle: "Cobertura als mitjans",
    mediaNote:
      "Mitjans que cobreixen aquests temes de manera continuada. Es mostren a part perqu\u00e8 quedi clar qu\u00e8 \u00e9s font directa i qu\u00e8 \u00e9s cobertura.",
    directoryTitle: "D'on surt tot aix\u00f2",
    directoryNote:
      "El registre complet de canals que llegeix aquesta secci\u00f3. S'enlla\u00e7a cada organitzaci\u00f3 per poder anar a la font i no nom\u00e9s al que va publicar aquesta quinzena.",
    kindOrg: "Organitzacions",
    kindMedia: "Mitjans",
    empty:
      "Cap canal ha retornat pe\u00e7es recents. No \u00e9s una afirmaci\u00f3 sobre l'actualitat: \u00e9s una fallada de lectura, i es corregeix sola quan els canals responen.",
    droppedNote: "Canals que no van respondre en aquesta c\u00e0rrega:",
    caveat:
      "Aquest web no edita, resumeix ni reescriu aquestes pe\u00e7es: mostra el titular, la data i l'enlla\u00e7 a l'original. Les imatges s\u00f3n les que publica cada canal i se serveixen a trav\u00e9s d'aquest lloc, no directament des del servidor de l'organitzaci\u00f3, per no exposar la IP de qui llegeix. L'ordre \u00e9s per data, amb les fonts en l'idioma de la p\u00e0gina primer.",
    methodLink: "Com es van triar aquests canals, i quins es van descartar \u2197",
    homeTitle: "Drets LGTBI, amb la veu de les organitzacions",
    homeCta: "Veure la secci\u00f3 de drets",
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
    titlePre: "El diner dels ",
    titleEmph: "partits",
    titlePost: ", canal per canal",
    channelTitle: "Subvencions estatals als partits",
    subtitle:
      "Tres canals, cada un amb la seva font oficial: el que l’Estat els lliura, el que van declarar haver gastat en una campanya i el que van declarar rebre de particulars. El diner de les fundacions vinculades té la seva pròpia secció.",
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
  voteFlow: {
    title: "Diner declarat i vot registrat, un al costat de l’altre",
    sourceHead: "Donacions privades declarades · 2020",
    outcomeHead: "Vot del grup",
    caveat:
      "El gruix del traç és la quantia declarada, no una relació causal. Els dos registres són públics, independents i d’anys diferents: res d’això afirma que l’un expliqui l’altre.",
    scope:
      "{included} formacions, les que tenen alhora donacions declarades a l’informe i un grup propi amb vot registrat en aquesta votació. Font del diner: {report}.",
    excluded:
      "En queden fora, per no tenir grup propi en aquesta legislatura o no constar a l’informe:",
  },
  donationsTable: {
    title: "Donacions privades declarades, 2020",
    caption:
      "Una formació per fila, ordenades per import declarat. La barra reparteix el total de cada partit entre els tres trams de l'informe i està escalada contra el total més alt, no contra el total estatal.",
    rank: "Núm.",
    party: "Formació",
    byTranche: "Repartiment per trams",
    total: "Total",
    donors: "Donants",
    donorsWord: "donants",
    tranchesNote:
      "Trams de l'informe: menys de 1.000 €, de 1.000 a 10.000 €, més de 10.000 €.",
    trancheSmall: "Menys de 1.000 €",
    trancheMid: "De 1.000 a 10.000 €",
    trancheLarge: "Més de 10.000 €",
    legalNote:
      "Les empreses no poden donar als partits des de la reforma del 2015 de la LO 8/2007: només persones físiques, amb un màxim de 50.000 € l'any i sense donacions anònimes. No existeix una xifra de finançament per polític, i aquesta web no la calcula.",
  },
  spending: {
    eyebrow: "Despesa electoral · europees del 2024",
    donutCentre: "DECLARAT",
    donutCaption:
      "Despesa ordinària declarada per cada formació a les eleccions europees del 9 de juny de 2024.",
    linesTitle: "En què es va declarar gastat",
    lineAdvertising: "Publicitat exterior i a premsa i ràdio",
    lineAdvertisingNote:
      "Les dues úniques despeses amb límit legal propi: arts. 55 i 58 de la LOREG.",
    lineResidual: "Línia residual, sense desglossament a l'informe",
    lineResidualNote:
      "«Otros gastos ordinarios». És la major part de la despesa i l'informe no diu on va anar.",
    lineFinancial: "Costos financers i altres conceptes",
    lineFinancialNote: "Interessos liquidats i estimats de les operacions de crèdit.",
    lineMailings: "Enviaments postals, a part de la despesa ordinària",
    lineMailingsNote:
      "{count} enviaments amb dret a subvenció. No entren en la despesa ordinària ni en el límit general, així que no tenen percentatge d'aquella xifra: la barra va completa per dir que el denominador és un altre.",
    title: "En què es va declarar gastat el diner electoral",
    intro:
      "El Tribunal de Comptes fiscalitza els comptes de cada elecció i desglossa la despesa declarada. Només dos tipus de publicitat tenen límit legal i apareixen detallats; la resta de la despesa ordinària s'agrupa en una única línia que l'informe no desglossa.",
    unexplained: "Sense desglossar",
    ofDeclared: "de la despesa ordinària declarada",
    advertising: "Publicitat",
    cappedOnly:
      "Publicitat exterior (art. 55 LOREG) i a premsa i ràdio (art. 58). Són les dues úniques despeses amb límit propi.",
    mailings: "Trameses de propaganda",
    mailingItems: "trameses amb dret a subvenció",
    declared: "Declarat",
    formation: "Formació",
    split: "Repartiment",
    caption:
      "Una formació per fila, amb la despesa ordinària declarada i quina part correspon a publicitat amb límit legal davant la línia residual «Otros gastos ordinarios». Les trameses de propaganda es comptabilitzen a part i no entren en aquestes columnes.",
    gapTitle: "Què no diu el registre",
    gapBody:
      "«Otros gastos ordinarios» és una sola línia sense desglossament i és la major part de la despesa declarada. L'informe no diu en què es va gastar, i la llei no obliga a detallar-ho: la publicitat digital no és una categoria amb límit propi, i el mateix Tribunal de Comptes ha recomanat al Govern que legisli perquè ho sigui. Aquestes xifres són despesa declarada i fiscalitzada, no una imputació de res a ningú.",
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
    ctxTitle: "Què diu el registre oficial sobre els delictes d'odi",
    ctxLead:
      "Aquestes xifres són de l'Estat, no d'aquest web. Es publiquen aquí perquè els diners i els vots que recull aquest lloc no signifiquen res sense el context del que passa al país. No s'afirma que una cosa expliqui l'altra.",
    ctxRecordedTitle: "Fets registrats per la policia",
    ctxRecordedNote:
      "Són fets coneguts per les Forces i Cossos de Seguretat: denúncies i incidents registrats, no condemnes. Els mateixos informes reconeixen que molts casos no arriben mai a la justícia, així que la xifra és un mínim, no un total.",
    ctxProsecutedTitle: "Actuació de la Fiscalia",
    ctxProsecutedNote:
      "Compta el que va fer el Ministeri Fiscal, no el que es va denunciar a la policia. Les dues sèries no són subconjunts l'una de l'altra i no s'han de sumar.",
    ctxRacism: "per racisme o xenofòbia",
    ctxLgtbi: "per orientació sexual o identitat de gènere",
    ctxSentences: "sentències rebudes",
    ctxConvictions: "condemnatòries",
    ctxCharges: "escrits d'acusació per racisme o xenofòbia",
    ctxChangeYear: "respecte a l'any anterior",
    ctxFindingTitle: "Què no ha declarat cap autoritat",
    ctxFindingBody:
      "Cap autoritat espanyola ha resolt que la despesa de campanya d'un partit constituís un delicte d'odi. La Junta Electoral va ordenar retirar una lona de Vox a Madrid, però per l'article 53 de la LOREG —propaganda fora del període de campanya— i va declinar expressament pronunciar-se sobre el contingut. L'únic intent penal conegut va acabar arxivat.",
    ctxCaseTitle: "El cas dels «menas», i com va acabar",
    ctxCaseBody:
      "El cartell electoral de Vox per a l'Assemblea de Madrid del 2021 va ser denunciat com a delicte d'odi. El Jutjat d'Instrucció núm. 53 de Madrid el va sobreseure el 29 d'abril de 2021 i la Secció Segona de l'Audiència Provincial de Madrid va confirmar l'arxivament el 19 de juliol de 2021, emmarcant-lo en la «legítima lluita ideològica» d'una campanya. Van recórrer l'arxivament la Fiscalia, el PSOE, Podemos, Esquerra Unida, la coalició Unidas Podemos i l'associació Progresa. Es recull aquí precisament perquè el resultat va ser negatiu: un registre que enumeri l'acusació i no l'arxivament no és una eina de transparència.",
    ctxNoTag:
      "Per això aquest web no etiqueta ningú com a «instigador d'odi». No existeix un registre públic de condemnes per persona que un particular pugui consultar i publicar: l'article 10 de la LOPDGDD reserva les dades de condemnes penals a les autoritats públiques, el CENDOJ dissocia les dades personals abans de difondre les sentències, i el Tribunal Constitucional (STC 58/2018) considera determinant que una persona pugui ser recuperada pel seu nom. Es publiquen xifres agregades oficials i procediments concrets amb el seu resultat; no inferències.",
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
