# Seguir el Dinero — Spanish party-funding tracker

A slick, self-updating dashboard of the **public state subsidies** granted to Spanish
political parties, pulled live from the Base de Datos Nacional de Subvenciones (BDNS / SNPSAP).

This is **Phase 1** (public money). See `/metodologia` in the app for the honest limits and the
roadmap toward private financing (foundations, large donors, procurement ties).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind v4
- `motion` for animations
- Data: BDNS public REST API — no API key required

## Data flow

```
BDNS /api/partidospoliticos/busqueda  ──(lib/bdns.ts)──►  data/subsidies.json (snapshot)
                                                                │
                          lib/normalize.ts (aggregate) ◄────────┘
                                    │
                          app/* (server components render)
```

- **`GET /api/refresh`** pulls the full party-subsidy set from BDNS and rewrites
  `data/subsidies.json`. On Vercel it runs daily via the cron in `vercel.json`.
  Protect it in production by setting the `CRON_SECRET` env var (Vercel Cron sends it
  as a Bearer token automatically).
- The frontend never calls BDNS directly — it reads the committed/served snapshot, so the
  page is fast and CORS/rate-limit-free.

> On Vercel's read-only filesystem the cron write does not persist across invocations; when
> Phase 2 lands, move the snapshot to Vercel Postgres/KV (see the plan). For local dev the
> file write works fully.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

Refresh the data snapshot from the live source:

```bash
curl http://localhost:3000/api/refresh
```

## Key files

| Path | Role |
|------|------|
| `lib/bdns.ts` | BDNS API client (endpoint, organ list, pagination) |
| `lib/normalize.ts` | Parse `beneficiario` → NIF, classify subsidy kind, aggregate, filter |
| `lib/parties.ts` | Canonical NIF → party registry (name, colour, bloc) |
| `lib/data.ts` | Load + cache the snapshot, write refreshes |
| `app/page.tsx` + `components/Dashboard.tsx` | Overview: totals, filters, ranked bars |
| `app/party/[nif]/page.tsx` | Per-party detail: breakdown, yearly evolution, ledger |
| `app/metodologia/page.tsx` | Methodology + legal caveats |
