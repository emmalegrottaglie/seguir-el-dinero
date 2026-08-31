# AGENTS.md — Seguir el Dinero

Working guide for anyone (agent or human) continuing this project. The README is the
reader-facing document; this one covers how the thing is built, why it is built that way, and
where the sharp edges are.

## What this is

A dashboard tracking the money and votes behind Spanish politics, in Spanish, English and Catalan:

| Layer | Source | Freshness |
|-------|--------|-----------|
| State subsidies to parties | BDNS / SNPSAP REST API | Live, daily cron |
| Private donations to parties | Tribunal de Cuentas report 1573 (2020) | Fixed, transcribed |
| Public salaries of officeholders | Registro de Altos Cargos CSV export | Rebuilt from script |
| Key roll-call votes | Congreso de los Diputados open data | Rebuilt from script |
| Portraits | Wikipedia / Wikimedia Commons | Rebuilt from script |
| Politician social + news | Bluesky public API, Google News RSS | Live per request |

Stack: **Next.js 15 (App Router) + TypeScript + Tailwind v4 + `motion`**, deployed on **Vercel**
(live, Hobby tier, with a KV store for the refreshed snapshot).

## The rule that shaped everything: do not fabricate

This app makes claims about named real people. Every figure and every identity link is either
pulled from an official source or transcribed from a cited one. Where a source could not be
verified, the feature was cut rather than faked. Concretely:

- **No inferred political stances.** The original request was to describe each politician's
  position on trans rights, abortion and housing. That was declined and replaced with recorded
  roll-call votes. Most of the salary register is local councillors, including 3,944
  "Independiente" entries with no national record; attributing invented positions to them would
  be defamation-shaped at scale. A person shows a position only if their vote is on record.
- **No stance implied by party.** Party membership is never used to fill in a missing vote.
- **Vote kinds are labelled.** A *proposición no de Ley* or a *moción* is a non-binding position
  statement, not the passage of a law, and the UI says so. Amendment votes are excluded so the
  selection cannot be cherry-picked.
- **Tally verification.** `scripts/fetch-votes.mjs` pins each published vote by
  (legislature, session, number) together with the tally expected on the official record, and
  refuses to publish when they disagree — that catches grabbing the wrong ballot.
- **No fuzzy identity matching.** Portraits attach only when the Wikipedia article title equals
  the person's name (accent- and order-insensitive). A wrong face beside a named politician is a
  misidentification, not a cosmetic bug. Everyone else gets initials.
- **Bluesky handles verified one by one** (follower count and bio). Two impersonation accounts
  were caught and excluded during the build.
- **Per-politician funding does not exist** and is not invented. Subsidies go to parties;
  politician pages link to their party's funding instead.

## Architecture / where things live

| Path | Role |
|------|------|
| `lib/bdns.ts` | BDNS API client (endpoint, organ list, pagination) |
| `lib/store.ts` | Snapshot persistence: Vercel KV in production, filesystem in dev |
| `lib/data.ts` | Load + cache the aggregation; `invalidate()` after refresh |
| `lib/normalize.ts` | Parse `beneficiario` into NIF, classify subsidy kind, aggregate, filter |
| `lib/parties.ts` | Canonical NIF → party (name, colour, bloc) |
| `lib/donations.ts` | Private donations 2020, transcribed from the TdC report |
| `lib/salaries.ts` | Officeholder pay: load, accent-folded search, paging, party join |
| `lib/votes.ts` | Roll-call votes: load, `nameKey`, `positionsFor`, `tallyByGroup` |
| `lib/photos.ts` | Portrait lookup by folded name |
| `lib/politicians.ts` | Curated politicians with verified Bluesky handles |
| `lib/bluesky.ts` + `app/api/bluesky` | Bluesky public AppView feed |
| `lib/news.ts` + `app/api/news` | Google News RSS feed |
| `lib/i18n.ts` | Dictionaries (es/en/ca) + `getDict(locale)`, `relativeTime` |
| `lib/locales.ts` | Locale constants only — keeps the edge middleware off the dictionaries |
| `lib/format.ts` | Currency/number/date formatting, locale-aware via BCP-47 tag |
| `middleware.ts` | Redirects unprefixed paths to `/{locale}/…` (cookie → Accept-Language → default) |
| `app/[locale]/page.tsx` + `components/Dashboard.tsx` | Overview: totals, filters, ranked bars |
| `app/[locale]/party/[nif]/page.tsx` | Party detail: public + private money, faces, ledger, news |
| `app/[locale]/politician/[slug]/page.tsx` + `app/[locale]/caras` | Politician pages + index |
| `app/[locale]/sueldos/page.tsx` | Salary index: search, party facets, paging |
| `app/[locale]/votaciones/page.tsx` | Key votes: result, per-group breakdown, deputy search |
| `app/[locale]/metodologia/page.tsx` | Methodology and legal caveats |
| `components/Avatar.tsx`, `components/PhotoCredit.tsx` | Portrait with initials fallback + credit |
| `components/LocaleToggle.tsx` | Header ES/EN/CA switch (navigates to the swapped-locale URL) |

Data files in `data/`: `subsidies.json` (live, refreshed), `salaries.json` (~1.7 MB),
`votes.json`, `photos.json`. All are read server-side only — pages render a filtered slice, so
the browser never receives the large datasets. `data/_*.json` are scraper caches and are ignored.

Locale comes from the URL (`/es`, `/en`, `/ca`), which keeps pages statically generated. The
salaries and votes pages read query strings and so render per request.

## Data pipelines

Each dataset has a script that writes a JSON file. Only the subsidies layer refreshes itself.

```bash
npm run build:salaries -- "path/to/sueldos-cargos-publicos-espana.csv"
npm run build:votes            # fetches the pinned votes in KEY_VOTES
npm run discover:votes -- XV   # shortlist candidate votes for review; publishes nothing
npm run build:photos           # Wikimedia portraits; re-run to top up after throttling
curl http://localhost:3000/api/refresh   # subsidies (add the CRON_SECRET header if set)
```

Endpoint notes that were not obvious and cost time to find:

- **BDNS party subsidies** live at a dedicated endpoint, `/api/partidospoliticos/busqueda`,
  *not* under `/api/concesiones/`. It returns the full set (currently 232 records) in one page.
- **Congreso votaciones** needs a browser User-Agent or it blocks the request. The portlet takes
  `targetLegislatura` as a **Roman numeral** and `targetDate` as **DD/MM/YYYY**; the landing page
  embeds `diasVotaciones`, which lists every plenary day of the legislature, so all sessions are
  enumerable. Day pages carry vote titles and tallies in the HTML, so discovery reads day pages
  rather than thousands of per-vote JSONs. Per-vote file names contain an opaque timestamp and
  cannot be constructed — the links must be scraped.
- **Wikipedia and Commons** throttle anonymous clients hard (429). The photo script backs off
  exponentially and caches both passes to disk so a re-run tops up instead of restarting. Commons
  returns file titles with spaces while `pageimage` gives underscores — the keys must be
  normalised or the licence lookup silently misses.

## Run / verify

```bash
npm install
npm run dev
```

Do **not** run `npm run build` while `npm run dev` is running — they share `.next` and the dev
server breaks with `Cannot find module './586.js'`. Stop the dev server, or clear `.next` after.

Sanity checks: home total EUR 300.6M, PP at rank 01; PSOE party page shows EUR 837,506 in 2020
private donations; `/es/sueldos?q=diaz` returns 90 results (accent folding works); `/es/votaciones`
lists 9 votes; Rufián votes Sí and Abascal votes No on all three XIV-legislature laws.

## Deploy (Vercel)

1. Import the repo; Next.js is auto-detected.
2. **Storage** → add an Upstash for Redis / KV store. It sets `KV_REST_API_URL` and
   `KV_REST_API_TOKEN`, which `lib/store.ts` picks up. Without it the daily refresh cannot
   persist, because Vercel's filesystem is read-only.
3. Set `CRON_SECRET`. Without it `/api/refresh` is an unauthenticated public write endpoint.
4. Redeploy so the new variables take effect.

The daily cron is declared in `vercel.json` and appears under **Settings → Cron Jobs**.

## Known issues

Open findings from the last review, highest first:

1. **`scripts/fetch-photos.mjs` licence allowlist is unanchored** — `CC BY-NC` and `CC BY-ND`
   pass the gate. Current data contains none, but the next run could publish a NonCommercial or
   NoDerivatives image. Fix before re-running the photo script.
2. **Deputy search shows a stale parliamentary group** — the group is taken from the first
   matching vote, so the 16 deputies who changed group are mislabelled for one legislature. Store
   the group per vote.
3. `lib/photos.ts` caches a read failure permanently, and the empty source renders as an empty
   anchor on the Caras page.
4. Party facet counts on `/sueldos` are computed over the whole dataset while results are
   text-filtered, so the numbers contradict the visible count.
5. `scripts/build-salaries.mjs` dedupes duplicate slugs by file order, so a re-export can change
   a published salary.
6. The accent-folded name key is reimplemented in four places; portrait matching breaks silently
   if they drift. Extract one shared helper.

## Roadmap

- **Votes**: extend beyond the current 9 pinned items; `discover:votes` already shortlists
  candidates per legislature. 212 of 619 current `Diputado/a` rows have a record; the rest show
  nothing by design.
- **Donations**: only ejercicio 2020 is loaded. Later Tribunal de Cuentas reports are 700-page
  PDFs; the consolidated table is "Gráfico N. Donaciones del ejercicio N por tramos" in the annexes.
- **Party foundations**: public subsidies are small (~EUR 350k/yr) and messy in BDNS; the real
  corporate money is private donations to the foundations, also only in TdC PDFs.
- **Procurement ties**: contracts joined to parties and foundations, labelled as association,
  never as proof of influence.
- **More politicians / social**: expand `lib/politicians.ts`, verifying each handle first.
  X/Twitter needs a paid API key; Mastodon is a free option alongside Bluesky.
