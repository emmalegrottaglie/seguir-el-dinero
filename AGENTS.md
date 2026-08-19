# AGENTS.md — Seguir el Dinero

Build log and working guide for this project, for any agent (or human) continuing it.
Written incrementally as the app was built.

## What this is

A slick, self-updating dashboard tracking the money behind Spanish political parties:
- **Public state subsidies** to parties (live, from BDNS) — the core.
- **Private donations** to parties (from Tribunal de Cuentas reports) — snapshot, lagged.
- **Individual politicians** — party link + verified Bluesky feed + news feed.

Stack: **Next.js 15 (App Router) + TypeScript + Tailwind v4 + `motion`**, deploy target **Vercel**.

## The one rule that shaped everything: don't fabricate

This app makes claims about real people and organisations. Every figure and every social
handle is either pulled live from an official API or transcribed from a cited source.
When a data source couldn't be verified, the feature was **not** built rather than faked.
Two concrete examples from the build:
- Bluesky handles were verified one-by-one (follower count + bio). Two impostor/squatted
  handles (a fake "Feijóo", a fake "Mónica García") were caught and excluded.
- Per-politician *funding* was refused as a feature: that data does not exist (money goes to
  parties, not individuals). Politician pages link to their party's funding instead.

## Steps we followed

1. **Assessed feasibility from the sources** (infobae, infosubvenciones, gardena, transparencia).
   Key realisation: the request is two projects — public money (easy, live) and private/"ties"
   (hard; corporate donations are banned since 2015, private data lives in TdC PDFs).
2. **Reverse-engineered the BDNS API** by inspecting the party-subsidies page's network calls
   (via the browser). Found the dedicated endpoint `/api/partidospoliticos/busqueda?vpd=GE&...`
   returning the full 232-record set (2022–2026, €300.6M). See `lib/bdns.ts`.
3. **Scaffolded Next.js manually** (folder name has a space → `create-next-app` refused; wrote
   `package.json`/`tsconfig`/configs by hand).
4. **Built the data layer**: parse `beneficiario` → NIF, classify subsidy kind, aggregate/filter
   (`lib/normalize.ts`); canonical NIF→party registry with colours/blocs (`lib/parties.ts`).
5. **Built the UI** in an investigative "dossier" aesthetic (Fraunces + IBM Plex Mono, gold-on-ink,
   film grain, `motion` reveals): overview dashboard, party detail, methodology page.
6. **Wired the live refresh**: `/api/refresh` pulls BDNS and writes a snapshot; daily Vercel cron.
7. **Fixed a hydration warning** — caused by the Dark Reader browser extension, not our code:
   added `suppressHydrationWarning` to `<html>`.
8. **Made refresh persist on Vercel** (`lib/store.ts`): Vercel KV / Upstash Redis via plain fetch
   when its env vars exist, else filesystem. Vercel's FS is read-only, so KV is needed in prod.
9. **Added a news feed** (`lib/news.ts` + `/api/news`): Google News RSS, free, no key.
10. **Added individual politicians** (`lib/politicians.ts`): verified Bluesky handles + party link;
    Bluesky feed (`lib/bluesky.ts`, public AppView API) and news feed on each politician page.
11. **Added private donations** (`lib/donations.ts`): transcribed from Tribunal de Cuentas report
    I1573 ("Gráfico 5. Donaciones del ejercicio 2020"), shown per party with tranche breakdown.

## Architecture / where things live

| Path | Role |
|------|------|
| `lib/bdns.ts` | BDNS API client (endpoint, organ list, pagination) |
| `lib/store.ts` | Snapshot persistence: Vercel KV (prod) / filesystem (dev), with fallback |
| `lib/data.ts` | Load + cache the aggregation; `invalidate()` after refresh |
| `lib/normalize.ts` | Parse `beneficiario`→NIF, classify kind, aggregate, filter |
| `lib/parties.ts` | Canonical NIF → party (name, colour, bloc) |
| `lib/politicians.ts` | Curated, **verified** individual politicians (Bluesky handles) |
| `lib/bluesky.ts` / `app/api/bluesky` | Bluesky public AppView feed |
| `lib/news.ts` / `app/api/news` | Google News RSS feed |
| `lib/donations.ts` | Private donations 2020 (TdC, cited) |
| `data/subsidies.json` | Committed snapshot / seed (refreshed by `/api/refresh`) |
| `app/page.tsx` + `components/Dashboard.tsx` | Overview: totals, filters, ranked bars |
| `app/party/[nif]/page.tsx` | Party detail: public + private money, faces, ledger, news |
| `app/politician/[slug]/page.tsx` + `app/caras` | Individual politician pages + index |
| `app/metodologia/page.tsx` | Methodology + legal caveats |

## Run / verify

```bash
npm install
npm run dev            # http://localhost:3000
curl http://localhost:3000/api/refresh   # pull live BDNS data into the snapshot
```

Sanity checks: overview grand total ≈ €300.6M; PP is rank 01; PSOE party page shows
€837,506 in private donations (2020); `/politician/oscar-puente` shows a live Bluesky feed.

## Deploy (Vercel)

1. `npx vercel` (or connect the repo).
2. Add a **KV / Upstash Redis** store in the Vercel dashboard — it sets `KV_REST_API_URL` and
   `KV_REST_API_TOKEN`, which `lib/store.ts` picks up automatically (no code change).
3. Set `CRON_SECRET` to protect `/api/refresh`; the daily cron is in `vercel.json`.

## Roadmap / open work

- **TdC donations**: only ejercicio 2020 is loaded (report I1573). Add later years as the
  Tribunal de Cuentas publishes them; the report is a 700-page PDF — the consolidated table is
  "Gráfico 5. Donaciones del ejercicio N por tramos" in the annexes.
- **Party foundations** (FAES etc.): public subsidies are small (~€350k/yr) and messy in BDNS;
  the real corporate money is private donations to foundations, also in TdC PDFs.
- **Politician public pay + assets**: Congreso/Senado publish salaries and asset declarations
  (mostly per-MP PDFs). Not yet ingested — needs a verifiable source pass; do not estimate.
- **More politicians / social**: expand `lib/politicians.ts` (verify each handle first). X/Twitter
  needs a paid API key; Mastodon is another free option alongside Bluesky.
