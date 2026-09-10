# AGENTS.md — Seguir el Dinero

Working guide for anyone (agent or human) continuing this project. The README is the
reader-facing document; this one covers how the thing is built, why it is built that way, and
where the sharp edges are. `NEXT-STEPS.md` covers the planned work and how to carry it out.

## What this is

A transparency portal on the money and votes behind Spanish politics, in Spanish, English and
Catalan, deployed on Vercel.

| Layer | Source | Freshness |
|-------|--------|-----------|
| State subsidies to parties | BDNS / SNPSAP REST API | Live, daily cron |
| Private donations to parties | Tribunal de Cuentas report 1573 (2020) | Fixed, transcribed |
| Party-linked foundations | Tribunal de Cuentas report 1.642 (2021–22) | Fixed, per-dossier |
| Electoral spending by category | Tribunal de Cuentas report 1.628 (EP 2024) | Fixed, per-formation |
| Public salaries of officeholders | Registro de Altos Cargos CSV export | Rebuilt from script |
| Key roll-call votes | Congreso de los Diputados open data | Rebuilt from script |
| Portraits | Wikipedia / Wikimedia Commons | Rebuilt from script |
| Politician social + news | Bluesky public API, Google News RSS | Live per request |
| Rights, housing and poverty news | Curated RSS/Atom registry in `lib/news-sources.mjs` | Live per request, 30 min cache |

Stack: **Next.js 15 (App Router) + TypeScript + Tailwind v4 + `motion`**.

## The rule that shaped everything: do not fabricate

This app makes claims about named real people. Every figure and every identity link is either
pulled from an official source or transcribed from a cited one. Where a source could not be
verified, the feature was cut rather than faked.

- **No inferred political stances.** The original brief asked for each politician's position on
  trans rights, abortion and housing. That was declined and replaced with recorded roll-call
  votes. Most of the register is local councillors, including 3,944 "Independiente" entries with
  no national record; attributing invented positions to them would be defamation-shaped at
  scale. A person shows a position only if their vote is on record, and someone with no record
  shows "sin voto registrado" plus a note that their position is **not** inferred from their
  party — never a blank that reads as absence of opinion.
- **Money and votes are juxtaposed, never causally linked.** Both the landing page and every
  profile carry a line stating they are published together so they can be looked up, not because
  one explains the other.
- **Ballot language, not interpretation.** Group positions are labelled "votó Sí / votó No / se
  abstuvo", not "a favor / en contra". This matters: on the Ley 4/2023 ballot — which was on the
  Senate's amendments — an "en contra" reading put EH Bildu against the trans law, when a No
  there can mean rejecting the amendment. Each card shows the actual subject of the ballot.
- **Vote kinds are labelled.** A *proposición no de Ley* or a *moción* is a non-binding position
  statement, not the passage of a law, and the UI says so. Amendment votes are excluded from the
  published set so the selection cannot be cherry-picked.
- **Tally verification.** `scripts/fetch-votes.mjs` pins each published vote by
  (legislature, session, number) with the tally expected on the official record, and refuses to
  publish when they disagree — that catches grabbing the wrong ballot.
- **No fuzzy identity matching.** Portraits attach only when the Wikipedia article title equals
  the person's name. Social handles link to register rows by token-subset, accepted only when
  exactly one row qualifies. An ambiguous match is dropped, because a wrong link would attribute
  someone else's accounts or face to a named person.
- **Bluesky handles verified one by one** (follower count and bio). Two impersonation accounts
  were caught and excluded during the build.
- **Per-politician funding does not exist** and is not invented. Subsidies go to parties;
  profiles link to the party's funding instead.

## The foundation channel runs the other way

Worth stating because the obvious guess is wrong, and the site used to imply it.
Parties may take **no** corporate money (LO 8/2007 art. 5: no *personas juríicas*, no anonymous
donations, €50,000 a year per individual, and a donor holding a live public contract must be
refused). Their **foundations** are governed by *disposición adicional séptima*, where legal
entities *may* donate — over €120,000 by public deed, notified to the Tribunal de Cuentas within
three months, donor identity published.

So the arrow runs into the foundations. But in the audited figures the corporate share is small:
across 2021–22, **89.8% of the €7.9M of contributions came from the parties themselves** and 4.6%
from companies, with €4.9M of public subsidies on top. The page leads with party money for that
reason. Do not rewrite it around a corporate-capture framing the figures do not support.

## The people layer is curated, and its sources are typed

`lib/foundation-people.ts` names living people, so it carries stricter rules than any other layer
and the types enforce them:

- **One dated source per record**, with a URL. A record without one does not exist.
- **`SourceKind` drives the rendering.** `registry` and `official` read as statements of record;
  `press` renders as *"según <publisher> (<date>)"*. They are never merged or counted together.
  This is the ODIHR rule the research verified 3-0: the label must match the evidentiary status of
  the source.
- **Nothing is inferred.** No score, no ranking, no derived edge. A tie exists only where a named
  source states it. `former: true` where the source puts a role in the past.
- **Names join by `nameKey`**, so an ambiguous match is dropped rather than guessed, exactly as with
  portraits and social handles.

**Chase the primary source.** Three secondary sources were wrong here. Wikipedia lists an
eight-member Disenso board from 2020 against the foundation's own filing of three. A 2017 PSOE
announcement of the Fundación Pablo Iglesias board would have published Félix Bolaños as its
secretary today. And a press report had Pablo Iglesias presiding over Podemos's foundation with
Monedero as director, where the entity's own patronato page shows neither and only one name in
common. Where a board could not be established at all, that goes in `BOARD_GAPS` and prints on the
dossier — the absence is a finding, because apartado Seis requires publication.

## The design system, and the two accents that are not text colours

The visual system is light newsprint: ground `#f3f2f2`, ink `#201f1d`, Cormorant Garamond for
every heading and display figure and Lora for everything else. Two structural rules run through
it and both are load-bearing rather than stylistic: **no shadows anywhere** — structure is
carried entirely by hairlines, so a panel that needs to read as separate gets a rule, not
elevation — and **radius is 2px**, except dots at 50%.

The thing most likely to be got wrong: `--gold` and `--verd` are **fill and border colours, and
never text**. Measured on the ground, `--gold` is 3.02:1 and `--verd` is 4.38:1. Both clear the
3:1 that WCAG 1.4.11 asks of a control boundary or a graphic; both fail the 4.5:1 that normal
text needs. So text takes `--gold-deep` (5.97:1) and `--verd-text` (5.28:1, and 4.87:1 on the
surface, so it passes on both grounds the site paints). The one exception is display type at
32px and up, where the large-text threshold puts the bar at 3:1 and `--gold` passes as designed —
the masthead wordmark and the `h1` emphasis spans.

The design handoff's own contrast table asserts that verdigris passes AA and that `#605d5d` is
7.0:1. Neither is true (4.38:1 and 5.83:1). Measure; do not read.

Two further traps, both of which have cost time here:

- **A localised percentage is not a CSS length.** `es-ES` renders 0.545 as "54,5", and a bar
  given `width: 54,5%` collapses to nothing rather than erroring. Use `cssPercent()` for layout
  and `percent()` for display, and never one for the other.
- **`.eyebrow` and `.label-mono` must stay in `@layer base`.** They set colour and size, which
  Tailwind utilities routinely override; authored unlayered they beat every utility regardless of
  specificity, because unlayered styles win over every cascade layer. `:where()` does not fix it —
  the problem is layer order, not specificity.

## The court record's status is a type, not a string

`lib/court-records.ts` holds the four resolutions that passed the 3-0 panel in
`research/hate-accountability.md`. The status label is the entire point of the component, so it
is a union type rather than translated copy, which makes four specific errors unrepresentable:

- an archived case is `archived`, **never** "acquitted" — both *menas* decisions are autos
  confirming *sobreseimiento* at the instruction stage, a finding of no *indicios*, and never a
  merits judgment;
- an open case is `awaiting-trial`, and there is no status that would let an *auto de apertura de
  juicio oral* read as a verdict;
- an electoral board's order is `advertising-infringement` and nothing more, because the Junta
  Electoral de Zona expressly declared itself not competent over the content;
- a complaint *against* someone is `complaint-archived`, and the record says whose conduct it
  concerns.

The copy is translated three ways; the tag is not, so no translation can turn an archiving into
an acquittal. A party with nothing on file gets an explicit card saying so and saying what it
does not mean — rendering nothing would read as a clean record, and rendering "0" would invite a
comparison four hand-verified records cannot support.

Publishing a live prosecution by name (the Herrero record) processes a living person's
criminal-proceedings data and engages art. 10 LOPDGDD and LO 1/1982. It is published because she
is an elected officeholder, the opening order was reported by five outlets across the spectrum,
and the label states its procedural stage and nothing beyond it. That is a different thing from
the per-politician conviction tag this project declined to build, which would have required
attributing findings from records that are pseudonymised at source.

## The officeholder join needs two conditions, and a name is not one of them

`lib/officeholder-ties.ts` attaches the public offices in `data/salaries.json` to the people who
govern the party foundations. It is the only join here that connects a **named living private
individual** to a record neither they nor the foundation published, so a wrong match would put
someone else's public office against a named person. Two conditions must both hold:

1. **One distinct post per folded name.** `nameKey` is order-independent and accent-folded, which
   is what lets "Apellidos, Nombre" meet "Nombre Apellidos". It is not an identity. Measured:
   6,670 officeholders resolve to 6,663 folded names, three of which cover genuinely different
   posts — 0.045 %. A key covering more than one post yields nothing, never the first of them.
2. **The party must agree** with the party the audit report links the foundation to, or the
   officeholder must be recorded as unaffiliated (how the register carries government delegates
   and senior appointees). This is what turns a name match into evidence: two people who happen
   to share a folded name have no reason to share a party with a foundation neither was matched
   on. All fourteen current matches agree, and each was read by eye.

The office is stated **as the register had it on the register's own last-updated date**, which
travels on every tie and is rendered. There is no per-person date and no active flag, so a title
that has since changed hands is the register's staleness, shown as such. And nothing asserts that
a board seat and an office are connected — two public records about one person, side by side.

`npm run check:office-join` fails rather than warns, on the assumption underneath the join (the
collision ceiling), on the `ROLES` literal still being parseable, on every published slug
existing in the register, and on the join not having silently stopped matching.

It does **not** re-check the party condition, on purpose. That would mean reimplementing
`partyNifFor` in JavaScript — the report writes "Partido Socialista Obrero Español" where the
register writes "PSOE" — and a second copy of a rule drifts from the first. The script's own
first draft tried it with substring matching and failed all ten PSOE and PNV matches, which is
the drift in miniature.

## Every bar goes through one primitive, and its scale is a required prop

`components/chart/Bar.tsx` is the only bar on this site. Before it there were thirteen
hand-rolled ones at six different heights, with two incompatible scale conventions and the same
three donation tranches drawn in three palettes on pages two clicks apart. A chart that looks
consistent and is not misleads by implication, which is worse than having no chart.

- **`scale` is required.** `"share"` = the segments are parts of a whole and fill the track.
  `"compare"` = the bar's own length is its share of the largest row in the set, and the segments
  divide that length. It is required precisely because the old bars each had a convention and none
  of them stated it.
- **Four named heights** — `sm` 8, `md` 12, `lg` 20, `xl` 28.
- **`BarLegend` takes the bar's own segments array.** A hand-written legend drifts from its bar;
  that happened here when a swatch was darkened for contrast and stopped matching its segment.
- **A 2px floor per segment.** Linearly scaled, thirteen of the seventeen donation rows fell under
  four pixels and a real figure rendered as nothing. The floor is a small acknowledged distortion,
  defensible only because every one of these charts prints the exact figure beside it — so any new
  chart using `Bar` must do the same, and must carry the note saying what it is scaled against.

`lib/chart-colors.ts` decides each category's colour once. Bar fills are graphics, so 3:1 applies
rather than 4.5:1 — but a legend *label* is text, which is why `BarLegend` colours the swatch and
never the label.

Two traps this replaced, both worth knowing: `partyMeta` picked its fallback colour with
`nif.charCodeAt(1)`, which is `NaN` for an empty NIF, and `FALLBACK_COLORS[NaN]` is `undefined` —
which an SVG `fill` paints **black**, silently, so the donut was monochrome and looked deliberate.
And a label wrapper that is `absolute` with no width collapses to 0×0, so absolutely-positioned
children resolve their percentages against nothing and stack at one point.

## Architecture / where things live

### Routes (all under `app/[locale]/`)

| Path | Role |
|------|------|
| `page.tsx` | The front page: ticker, lead investigation, the organisations' rail, the three registers, three columns |
| `financiacion/page.tsx` | The three declared money flows: electoral spending (donut + the report's lines), 2020 donations by tranche, subsidies |
| `fundaciones/page.tsx` | The foundation channel: who pays the party foundations and who governs them |
| `fundacion/[slug]/page.tsx` | One party-linked entity: money in by source, public money by grantor, findings |
| `mapa/page.tsx` | The territorial map: which party governs each community, and the recorded hate-crime rate there |
| `politicos/page.tsx` | Politician directory: featured record-holders + the full register |
| `politico/[slug]/page.tsx` | One person: pay, party funding, recorded ballots, social, news |
| `party/[nif]/page.tsx` | Party detail: formation switcher, public + private money, faces, ledger, group stances, court record, news |
| `votaciones/page.tsx` | Tracked votes: the money→party→vote flow, then result, per-group breakdown, deputy search |
| `derechos/page.tsx` | The rights section: the LGBTQ+ organisations' own feeds, with images, plus the source directory |
| `metodologia/page.tsx` | Methodology and legal caveats |

`/sueldos`, `/caras` and `/politician/[slug]` are redirects in `next.config.ts` — the salary and
Caras sections were merged into `politicos`.

`app/api/`: `refresh` (BDNS pull, cron-protected), `news`, `bluesky`, `news-image`.

`news-image` is an **allowlisted** image proxy, and both halves of that matter. Feed images are
served through this origin so a reader who opens the rights section does not hand their IP
address to fifteen third-party hosts — several of them LGBTQ+ organisations, where who reads
them is the last thing to leak. And the allowlist is what keeps it from being an SSRF tool and a
bandwidth piñata: only hosts vouched for by `lib/news-sources.mjs` (plus their subdomains and
the `www.`/bare counterpart) are fetched, only responses declaring `image/*` are returned, and
the response carries `nosniff` and a `sandbox` CSP because the bytes are someone else's.

`/api/news` has two modes. `?q=` is a free-text Google News search, used on party and politician
pages. `?topic=lgtbi,vivienda,pobreza&lang=es` reads the curated feed registry in
`lib/news-sources.mjs`, used on the portal. Two guards apply to the registry mode, and both exist
because of feeds that failed silently:

- **Source staleness.** A source whose newest item is older than a year is dropped whole. dosmanzanas
  serves HTTP 200 with ten items whose newest post is February 2024, so a status-code check calls it
  healthy — only the item dates reveal it.
- **Item age.** Nothing older than 120 days enters the panel, whatever the source.

Two further rules keep the panel representative: at most two items per source, so a daily outlet
cannot bury organisations that post weekly, and items in the reader's language sort first. Feeds are
parsed for both RSS (`<item>`) and Atom (`<entry>`) — El Salto publishes Atom, and the RSS-only
parser returned an empty array for it without erroring. Run `npm run check:feeds` after editing the
registry; it fails on any source that is unreachable, unparseable or stale.

One gotcha worth keeping: `provivienda.org` answers 403 to a descriptive bot User-Agent and 200 to an
ordinary browser one, so `FEED_HEADERS` in the registry sends the browser string.

### Library

| Path | Role |
|------|------|
| `lib/bdns.ts` | BDNS API client (endpoint, organ list, pagination) |
| `lib/store.ts` | Snapshot persistence: Vercel KV in production, filesystem in dev |
| `lib/data.ts` | Load + cache the aggregation; `invalidate()` after refresh |
| `lib/normalize.ts` | Parse `beneficiario` into NIF, classify subsidy kind, aggregate, filter |
| `lib/parties.ts` | Canonical NIF → party (name, colour, bloc) |
| `lib/donations.ts` | Private donations 2020, transcribed from the TdC report |
| `lib/foundations.ts` | Party-linked foundations 2021–22, per-dossier + the legal mechanism |
| `lib/foundation-people.ts` | Curated: who governs each foundation, and their outside roles, one dated source per record |
| `lib/salaries.ts` | Officeholder pay: load, accent-folded search, paging, party facets |
| `lib/votes.ts` | Roll-call votes: load, `positionsFor`, `tallyByGroup`, `stancesByParty`, `voteDateISO`, `newestFirst` |
| `lib/regions.ts` | The communities' projected geometry and the per-territory hate-crime figures (file loaders + types) |
| `lib/governments.ts` | Curated: who holds each community's presidency, and since when. Free of Node imports, so the map's client component can read it |
| `lib/court-records.ts` | The four verified judicial and electoral-board resolutions, with the status as a **type** |
| `lib/officeholder-ties.ts` | The board-member → public-office join, gated on one-post-per-name **and** party agreement |
| `lib/chart-colors.ts` | Each chart category's colour, decided once |
| `lib/investitures.ts` | Per community: the investiture arithmetic, and the recorded tally where verified |
| `lib/spending.ts` | Electoral spending, plus `formationNif`/`formationColor` for the report's coalition labels |
| `lib/photos.ts` | Portrait lookup, `portraitKeys` for bulk tests |
| `lib/politicians.ts` | Curated politicians with verified Bluesky handles |
| `lib/people.ts` | **The join.** Assembles one profile from every dataset that knows the person |
| `lib/name-key.mjs` | Shared name folding — `foldText`, `foldTokens`, `nameKey` |
| `lib/news.ts` | Feed fetching and merging: RSS + Atom, staleness guards, per-source cap |
| `lib/news-sources.mjs` | The feed registry itself, plus the excluded feeds and why |
| `lib/i18n.ts` / `lib/locales.ts` | Dictionaries / locale constants (keeps middleware light) |
| `lib/format.ts` | Currency, number and date formatting, locale-aware via BCP-47 tag |
| `middleware.ts` | Redirects unprefixed paths to `/{locale}/…` |

`lib/name-key.mjs` is plain JS with a `.d.mts` beside it **on purpose**: the build scripts and
the app must fold names with the identical implementation, or portrait and social lookups
silently miss. Do not fork it.

### Components

`Masthead` (the ink bar, masthead row and tab nav — replaced `Sidebar`), `StatStrip` (the ticker
and the section stat strips, one component because the anatomy is identical), `SpendDonut`,
`DonationsTable`, `ElectoralSpending`, `VoteFlow` (the money→party→vote ribbons), `RightsMap`
(the only client-side chart), `CourtRecords`, `PartySwitcher`, `FoundationChannel` +
`FoundationGovernance`, `Dashboard` (party funding, client), `StanceByGroup`, `ArticleCard`,
`Avatar` + `PhotoCredit`, `NewsFeed`, `BlueskyFeed`, `CountUp`, `LocaleToggle`.

Data files in `data/`: `subsidies.json` (live), `salaries.json` (~1.7 MB), `votes.json`,
`photos.json`, `foundations.json`, `electoral-spending.json`, `regions.json` (projected SVG
paths), `hate-territory.json`.

Read server-side only — pages render a filtered slice, so the browser never receives the large
datasets. `data/_*.json` are scraper caches and are gitignored. `regions.json` is the one file
whose contents do reach the browser, as props on `RightsMap`; that is why the build script
rounds the path data to one decimal place.

**A client component may not import a module that reads the filesystem.** `RightsMap` imported
`lib/regions.ts` for its curated presidency data and pulled `node:fs` into the browser bundle,
which fails the build outright. The split is by who needs what: `lib/governments.ts` is pure
data, `lib/regions.ts` owns the loaders. The same boundary bites a second way — `Dict` carries
functions (`news.hoursAgo`), and a function cannot cross to a client component, so pass the one
block a component needs (`Dict["map"]`) and never the whole dictionary.

Locale comes from the URL (`/es`, `/en`, `/ca`), which keeps pages statically generated. Pages
that read query strings (`politicos`, `votaciones`) render per request.

## Data pipelines

```bash
npm run build:salaries -- "path/to/sueldos-cargos-publicos-espana.csv"
npm run build:votes            # fetches the votes pinned in KEY_VOTES
npm run discover:votes -- XV   # shortlists candidate votes for review; publishes nothing
npm run build:photos           # Wikimedia portraits; re-run to top up after throttling
npm run build:foundations -- path/to/I1642.pdf   # needs pypdf: pip install pypdf
npm run build:spending -- path/to/I1628.pdf      # electoral spending by category
npm run build:hate-territory -- path/to/INFORME_odio_2024.pdf   # per-community hate-crime figures
npm run build:regions          # projects the community geometry into data/regions.json
curl http://localhost:3000/api/refresh   # subsidies (add the CRON_SECRET header if set)
npm run check:feeds            # health-checks every news feed; non-zero on a dead or stale one
npm run check:office-join      # guards the board-member → public-office join; non-zero on a break
npm run check:investitures     # guards the investiture arithmetic; non-zero on a sum that does not close
```

Endpoint notes that cost real time to work out:

- **BDNS party subsidies** live at `/api/partidospoliticos/busqueda`, *not* under
  `/api/concesiones/`. Returns the full set in one page.
- **Congreso votaciones** needs a browser User-Agent or it blocks the request. The portlet takes
  `targetLegislatura` as a **Roman numeral** and `targetDate` as **DD/MM/YYYY**; the landing page
  embeds `diasVotaciones`, listing every plenary day, so sessions are enumerable. Day pages carry
  vote titles and tallies in the HTML, so discovery reads day pages rather than thousands of
  per-vote JSONs. Per-vote filenames contain an opaque timestamp and cannot be constructed.
- **TdC reports** are addressable as
  `https://www.tcu.es/export/sites/portal/repositorio2/INFORME/<year>/I<number>.pdf`, where `<year>`
  is the **approval** year, not the year the report covers — report 1.628 audits the June 2024
  election and lives under `/2025/`. A wrong URL does not 404: it redirects to the site-wide search,
  whose HTML usefully lists PDF links, including the `resumen/NR_I<number>.pdf` summary. But the
  `/es/partidos-politicos/Informes/` index lists only 20 reports and does not include 1.642. The
  site-wide POST search at `/es/buscador/` does find it, and it is the only route that worked —
  the press release's own "Informe" and "Resumen" links carry `data-oc-broken-link="true"`.
- **Wikipedia and Commons** throttle anonymous clients hard (429). The photo script backs off
  exponentially and caches both passes. Commons returns file titles with spaces while
  `pageimage` gives underscores — keys must be normalised or the licence lookup silently misses.

## The map ships two data layers plus the investiture overlay; three layers had no source

The design specified five. An LGBTI rights index, the state of trans-law reform and vote share
for the parties that voted against the tracked bills arrived with sample values and are not
published: a plausible-looking number on a map is read as a measurement, and the page says so
rather than leaving the absence to be noticed.

The investiture overlay **is** now drawn, and how it is drawn is the point. A hatch meaning "Vox
is in this government" would have been false for part of the period it described — Vox left three
of those governments in July 2024 — so what is marked instead is a **dated vote**, which cannot go
stale.

`lib/investitures.ts` keeps two claims apart. The **arithmetic** (chamber size, PP and Vox seats)
says whether the PP could reach an absolute majority alone. The **recorded tally**, where verified,
says who actually supplied the winning votes. They can disagree, because a failed absolute-majority
round is retried on a **simple majority** where abstentions suffice — so "PP was short alone" does
not establish that Vox invested anyone. The overlay therefore has two hatch densities, and drawing
them the same would present the weaker claim as the stronger one.

Eight communities qualify, not the five the press reported, because "a PP–Vox pact" and "PP could
not reach a majority alone" are different questions. Four have a verified tally.

`npm run check:investitures` fails rather than warns, and it exists because the research was
unreliable in ways that would have shipped: a source reported Aragón at 65 seats while stating a
majority of 34 (implying the real 67), and four chamber sizes in that table were wrong — correcting
them **removed La Rioja from the layer entirely**, since PP's 17 of 33 is a majority. Another
reversed Vox's and Més's seat counts. So a votes-in-favour breakdown must sum to its own total, a
round must fit inside its chamber, no party may vote beyond its seats, and a community must not be
listed if the PP already held a majority there. Only the for-column must close; the against column
is not load-bearing and the sources disagree on its detail.

The overlay draws only on the government layer, because an overlay on the hate-crime ramp would
imply a link between the two that nothing here supports, and it carries `pointer-events: none` so
the region beneath stays clickable.

The two layers that did ship are held to the usual standard:
`scripts/extract-hate-territory.py` aborts unless every row reconciles against its own printed
total, the table reconciles against the national figure in `lib/hate-context.ts`, **and** both
published motivation columns reconcile against their own national figures. That last guard is the
one that proves the columns are aligned: fourteen integers on a line are positional, and a
one-column shift would leave every row summing correctly while attributing racism figures to
orientation. It caught the report carrying four tables of identical shape, where a
whole-document scan kept the last and reconciled to 1,405 against a national 1,955.

## Run / verify

```bash
npm install
npm run dev
```

Do **not** run `npm run build` while `npm run dev` is running — they share `.next` and the dev
server dies with `Cannot find module './586.js'`. Stop the dev server, or clear `.next` after.

Sanity checks: portal shows €300.6M public and €2.1M private; PP at rank 01 on `/financiacion`;
PSOE party page shows €837,506 in 2020 donations; `/es/politicos?q=diaz` returns 90 results;
`/es/votaciones` lists 9 votes; Rufián votes Sí and Abascal No on all three XIV-legislature laws;
a featured profile (e.g. `/es/politico/gabriel-rufian-romero`) shows ballots in all three topics.

## Deploy (Vercel)

1. Import the repo; Next.js is auto-detected.
2. **Storage** → add an Upstash for Redis / KV store. It sets `KV_REST_API_URL` and
   `KV_REST_API_TOKEN`, which `lib/store.ts` picks up. Without it the daily refresh cannot
   persist, because Vercel's filesystem is read-only.
3. Set `CRON_SECRET`. Without it `/api/refresh` is an unauthenticated public write endpoint.
4. Redeploy so the new variables take effect.

The daily cron is declared in `vercel.json` and appears under **Settings → Cron Jobs**.

## Dependency notes

`package.json` pins `engines.node` to 22.x and carries an `overrides` block for `postcss` and
`sharp`. That block is deliberate: Next pinned a nested `postcss` at 8.4.31 (four advisories) and
`sharp` at 0.34.5 (libvips CVEs), and npm's only proposed fix was `next@16.3.3`, a semver-major.
The overrides take `npm audit` to zero without forcing that upgrade. Keep them until Next itself
ships newer transitives. A stale Vercel-generated branch proposing `next@15.5.9` was closed as a
downgrade — see PR #1.

## Working habits worth keeping

Measured on 2026-09-07 with `caveman learn`: `Bash(cd)` was the heaviest tool shape in the scanned
window at 35.8% of 1,082,573 tool-output tokens, over 1,388 calls. Two notes came out of looking at
it, neither of which is a big win on its own:

- **The `cd` prefix is redundant.** The Bash tool's working directory persists between calls, and
  `git -C <path>` covers the rest. A `cd` inside a compound command can also trigger a permission
  prompt, which the tool's own guidance warns about.
- **The output volume is diffuse, not one bad habit.** Broken down by verb it was `echo` 55k,
  `git` 37k, `cat` 34k, `python` 31k, `node` 27k, `for` 25k, `sed` 23k — median 115-494 tokens per
  call. There is no single offender to fix, so the practice is simply to cap output at the source:
  `| head -N`, `--stat` over a full diff, and quiet flags.

This is recorded here rather than in `CLAUDE.md` on purpose. `CLAUDE.md` is injected into every
turn, so a rule there costs tokens forever; the measured saving here is diffuse and unproven, and
paying a permanent prefix cost to chase it would be the wrong trade.

## Known gaps

- **Foundations years.** Report 1.642 covers 2021 and 2022 only; nothing later is published.
  Four of the 38 audited entities carry no party because the report does not state their link.
- **Vote coverage.** 268 of the register's rows have a roll-call record; the rest show nothing by
  design. 9 votes are tracked across two legislatures.
- **Social coverage.** 6 verified Bluesky handles. Bluesky skews left in Spain, so PP and Vox
  leaders have no verifiable account there — a property of the platform, stated on the site.
- **Donations years.** Only ejercicio 2020 (report 1573). Later reports are 700-page PDFs.
- **Map layers.** Two of the five designed, plus the investiture overlay. The three with no citable
  per-community source are covered above.
- **Vox in government now.** Deliberately not drawn: that is a standing arrangement, and three of
  those governments changed in July 2024. It needs its own dated record of entries and departures.
- **The officeholder join publishes 14 of 53 board members.** The other 39 have no row in the
  register, which is the ordinary case for a trustee holding no public office — not a failure to
  find them. Nothing is inferred for the rest.
- **Autonomous presidencies.** Curated in `lib/governments.ts` against one secondary source, dated
  `2026-09-09`. There is no machine-readable national register of them; each community's own
  official gazette is the primary route and has not been walked.
- **Small phones.** Not designed for. Every multi-column section is `auto-fit` with a stated
  minimum so columns drop one at a time, but the flow diagram in particular needs a rethink below
  ~600px — probably a sorted list rather than ribbons.
- **Images.** Both slots on the front page are hatched placeholders awaiting licensed imagery. A
  placeholder that looked like a photograph would be a claim about something never photographed.
- **News registry.** 15 sources, no Catalan-language feed among them, so `/ca` readers are
  served the Spanish ones. Arcópoli is live but has published nothing in 201 days. Organisation
  feeds mix rights news with their own activity announcements — one COGAM item in the live feed
  is a hiking outing. That is labelled rather than keyword-filtered, because filtering an
  organisation's own feed by keyword would be arbitrary.
