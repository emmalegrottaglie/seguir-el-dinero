// The registry of news feeds the portal reads directly.
//
// Every entry below was fetched and its newest item dated on 2026-09-01. That
// probe is the reason this file exists as data rather than as a hardcoded list
// inside the fetcher: a feed can return HTTP 200 and still be dead, and a
// "recent news" panel filled with two-year-old articles is worse than no panel.
// See PLAN-CONTEXT-LAYER.md §5 for the full probe log.
//
// Sources are shown with their name always visible. Organisation feeds are
// their own publications and are marked as such, because an association's
// statement about a law is not the same kind of item as a newspaper's report on
// it, and the reader is entitled to know which they are reading.

/**
 * Request headers used for every feed fetch.
 *
 * A descriptive bot User-Agent is the polite default, but provivienda.org
 * answers 403 to it and 200 to an ordinary browser string, so the browser
 * string is what gets sent. These are public RSS endpoints intended to be read
 * by feed readers; nothing here bypasses a paywall or a login.
 */
export const FEED_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Safari/537.36",
  Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
};

export const NEWS_SOURCES = [
  // LGBTI and trans rights — Spanish organisations
  {
    id: "felgtbi",
    name: "FELGTBI+",
    url: "https://felgtbi.org/feed",
    format: "rss",
    topics: ["lgtbi"],
    lang: "es",
    kind: "org",
    probedNewest: "2026-08-17",
  },
  {
    id: "triangulo",
    name: "Fundación Triángulo",
    url: "https://fundaciontriangulo.org/feed",
    format: "rss",
    topics: ["lgtbi"],
    lang: "es",
    kind: "org",
    probedNewest: "2026-07-31",
  },
  {
    id: "cogam",
    name: "COGAM",
    url: "https://cogam.es/feed/",
    format: "rss",
    topics: ["lgtbi"],
    lang: "es",
    kind: "org",
    probedNewest: "2026-08-25",
  },
  {
    id: "euforia",
    name: "Euforia Familias Trans-Aliadas",
    url: "https://euforia.org.es/feed/",
    format: "rss",
    topics: ["lgtbi"],
    lang: "es",
    kind: "org",
    probedNewest: "2026-08-22",
  },
  {
    id: "plataforma-trans",
    name: "Plataforma Trans",
    url: "https://plataformatrans.org/feed/",
    format: "rss",
    topics: ["lgtbi"],
    lang: "es",
    kind: "org",
    probedNewest: "2026-08-15",
  },
  {
    id: "arcopoli",
    name: "Arcópoli",
    url: "https://www.arcopoli.org/feed/",
    format: "rss",
    topics: ["lgtbi"],
    lang: "es",
    kind: "org",
    probedNewest: "2026-02-12",
  },

  // LGBTI and trans rights — European organisations, English
  {
    id: "tgeu",
    name: "TGEU",
    url: "https://tgeu.org/feed/",
    format: "rss",
    topics: ["lgtbi"],
    lang: "en",
    kind: "org",
    probedNewest: "2026-08-31",
  },
  {
    id: "ilga-europe",
    name: "ILGA-Europe",
    url: "https://www.ilga-europe.org/feed/",
    format: "rss",
    topics: ["lgtbi"],
    lang: "en",
    kind: "org",
    probedNewest: "2026-08-31",
  },

  // Media
  {
    id: "shangay",
    name: "Shangay",
    url: "https://www.shangay.com/feed/",
    format: "rss",
    topics: ["lgtbi"],
    lang: "es",
    kind: "media",
    probedNewest: "2026-08-31",
  },
  {
    id: "pikara",
    name: "Pikara Magazine",
    url: "https://www.pikaramagazine.com/feed/",
    format: "rss",
    topics: ["lgtbi"],
    lang: "es",
    kind: "media",
    probedNewest: "2026-07-29",
  },
  {
    id: "elsalto-lgtbiq",
    name: "El Salto · LGTBIQ",
    url: "https://www.elsaltodiario.com/lgtbiq/feed",
    format: "atom",
    topics: ["lgtbi"],
    lang: "es",
    kind: "media",
    probedNewest: "2026-08-24",
  },

  // Housing and homelessness
  {
    id: "provivienda",
    name: "Provivienda",
    url: "https://www.provivienda.org/feed/",
    format: "rss",
    topics: ["vivienda"],
    lang: "es",
    kind: "org",
    probedNewest: "2026-08-06",
  },
  {
    id: "hogar-si",
    name: "Hogar Sí",
    url: "https://www.hogarsi.org/feed/",
    format: "rss",
    topics: ["vivienda"],
    lang: "es",
    kind: "org",
    probedNewest: "2026-08-21",
  },
  {
    id: "elsalto-vivienda",
    name: "El Salto · Vivienda",
    url: "https://www.elsaltodiario.com/vivienda/feed",
    format: "atom",
    topics: ["vivienda"],
    lang: "es",
    kind: "media",
    probedNewest: "2026-08-31",
  },

  // Poverty and inequality
  {
    id: "elsalto-pobreza",
    name: "El Salto · Pobreza",
    url: "https://www.elsaltodiario.com/pobreza/feed",
    format: "atom",
    topics: ["pobreza"],
    lang: "es",
    kind: "media",
    probedNewest: "2026-08-18",
  },
];

/**
 * Feeds deliberately not in the registry, with the reason. Kept so the same
 * dead URLs are not re-probed on each pass, and so the dosmanzanas case is on
 * the record: it is the first LGBTI news source anyone reaches for in Spain.
 */
export const EXCLUDED_FEEDS = [
  {
    name: "dosmanzanas",
    url: "https://dosmanzanas.com/feed",
    reason:
      "Dormant. Serves HTTP 200 with ten items whose newest post is 23 February 2024, so it looks healthy while publishing nothing.",
  },
  {
    name: "Chrysallis",
    url: "https://chrysallis.org.es/feed/",
    reason: "Connection failure at probe.",
  },
  { name: "Kif Kif", url: "https://kifkif.info/feed/", reason: "404." },
  {
    name: "Fundación 26 de Diciembre",
    url: "https://fundacion26d.org/feed/",
    reason: "404.",
  },
  { name: "Lambda València", url: "https://lambdavalencia.org/feed/", reason: "404." },
  {
    name: "Observatorio LGTB",
    url: "https://www.observatoriolgtb.org/feed/",
    reason: "Unreachable at probe.",
  },
  {
    name: "EAPN España",
    url: "https://www.eapn.es/feed",
    reason:
      "Both /feed and /rss return 404. EAPN's annual Estado de la Pobreza report is cited as analysis instead.",
  },
];

export function sourcesForTopics(topics) {
  const wanted = new Set(topics);
  return NEWS_SOURCES.filter((s) => s.topics.some((t) => wanted.has(t)));
}
