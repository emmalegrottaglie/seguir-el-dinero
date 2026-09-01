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
| Party-linked foundations | Tribunal de Cuentas report 1.642 (2021–22) | Fixed, per-entity |
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

## Architecture / where things live

### Routes (all under `app/[locale]/`)

| Path | Role |
|------|------|
| `page.tsx` | The portal: headline figures, how each group voted, rights news, section cards |
| `financiacion/page.tsx` | Party funding dashboard + the party-linked foundations channel |
| `politicos/page.tsx` | Politician directory: featured record-holders + the full register |
| `politico/[slug]/page.tsx` | One person: pay, party funding, recorded ballots, social, news |
| `party/[nif]/page.tsx` | Party detail: public + private money, faces, ledger, news |
| `votaciones/page.tsx` | Tracked votes: result, per-group breakdown, deputy search |
| `metodologia/page.tsx` | Methodology and legal caveats |

`/sueldos`, `/caras` and `/politician/[slug]` are redirects in `next.config.ts` — the salary and
Caras sections were merged into `politicos`.

`app/api/`: `refresh` (BDNS pull, cron-protected), `news`, `bluesky`.

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
| `lib/foundations.ts` | Party-linked foundations 2021–22, per-entity + the legal mechanism |
| `lib/salaries.ts` | Officeholder pay: load, accent-folded search, paging, party facets |
| `lib/votes.ts` | Roll-call votes: load, `positionsFor`, `tallyByGroup` |
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

`Sidebar` (left rail + mobile menu), `Dashboard` (party funding, client), `StanceByGroup`
(per-vote group positions), `Avatar` + `PhotoCredit` (portrait with initials fallback and the
licence credit), `NewsFeed`, `BlueskyFeed`, `CountUp`, `LocaleToggle`.

Data files in `data/`: `subsidies.json` (live), `salaries.json` (~1.7 MB), `votes.json`,
`photos.json`, `foundations.json`. Read server-side only — pages render a filtered slice, so the browser never
receives the large datasets. `data/_*.json` are scraper caches and are gitignored.

Locale comes from the URL (`/es`, `/en`, `/ca`), which keeps pages statically generated. Pages
that read query strings (`politicos`, `votaciones`) render per request.

## Data pipelines

```bash
npm run build:salaries -- "path/to/sueldos-cargos-publicos-espana.csv"
npm run build:votes            # fetches the votes pinned in KEY_VOTES
npm run discover:votes -- XV   # shortlists candidate votes for review; publishes nothing
npm run build:photos           # Wikimedia portraits; re-run to top up after throttling
npm run build:foundations -- path/to/I1642.pdf   # needs pypdf: pip install pypdf
curl http://localhost:3000/api/refresh   # subsidies (add the CRON_SECRET header if set)
npm run check:feeds            # health-checks every news feed; non-zero on a dead or stale one
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
  `https://www.tcu.es/export/sites/portal/repositorio2/INFORME/<year>/I<number>.pdf`, but the
  `/es/partidos-politicos/Informes/` index lists only 20 reports and does not include 1.642. The
  site-wide POST search at `/es/buscador/` does find it, and it is the only route that worked —
  the press release's own "Informe" and "Resumen" links carry `data-oc-broken-link="true"`.
- **Wikipedia and Commons** throttle anonymous clients hard (429). The photo script backs off
  exponentially and caches both passes. Commons returns file titles with spaces while
  `pageimage` gives underscores — keys must be normalised or the licence lookup silently misses.

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

## Known gaps

- **Foundations years.** Report 1.642 covers 2021 and 2022 only; nothing later is published.
  Four of the 38 audited entities carry no party because the report does not state their link.
- **Vote coverage.** 268 of the register's rows have a roll-call record; the rest show nothing by
  design. 9 votes are tracked across two legislatures.
- **Social coverage.** 6 verified Bluesky handles. Bluesky skews left in Spain, so PP and Vox
  leaders have no verifiable account there — a property of the platform, stated on the site.
- **Donations years.** Only ejercicio 2020 (report 1573). Later reports are 700-page PDFs.
- **News registry.** 15 sources, no Catalan-language feed among them, so `/ca` readers are
  served the Spanish ones. Arcópoli is live but has published nothing in 201 days. Organisation
  feeds mix rights news with their own activity announcements — one COGAM item in the live feed
  is a hiking outing. That is labelled rather than keyword-filtered, because filtering an
  organisation's own feed by keyword would be arbitrary.
