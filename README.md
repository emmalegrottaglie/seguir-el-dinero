# Seguir el Dinero — Spanish party-funding tracker

A dashboard tracking the money behind Spanish political parties: the public state subsidies
they receive (pulled live from the official national subsidies database), the private
donations they declare, and the politicians attached to them.

Available in **Spanish, English and Catalan**.

## What it shows

| Layer | Source | Freshness |
|-------|--------|-----------|
| State subsidies to parties | BDNS / SNPSAP REST API | Live, refreshed daily |
| Private donations to parties | Tribunal de Cuentas report nº 1573 (2020) | Fixed snapshot, lagged 1–2 years |
| Individual politicians | Curated registry + Bluesky public API + Google News RSS | Feeds live |

### Honest limits

Read `/metodologia` in the app before drawing conclusions. In short:

- **Company donations to parties are illegal** in Spain. Since the 2015 reform of Organic Law
  8/2007 only individuals may donate, capped at €50,000/year, with no anonymous donations. So
  "corporations funding parties" barely exists as a legal category.
- **There is no per-politician funding figure.** Subsidies are granted to the party, not the
  person. Politician pages link to their party's funding instead of inventing a personal number.
- **Private data is not an API.** Donation figures come from annual Tribunal de Cuentas PDF
  reports, published one to two years late — hence a fixed snapshot rather than a live feed.
- **Bluesky handles are verified one by one** (follower count and bio) before a politician is
  added, because Bluesky has weak identity checks. Unverifiable handles are excluded.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind v4
- `motion` for animations
- Vercel KV / Upstash Redis for the refreshed data snapshot (filesystem fallback in dev)
- No API keys required: BDNS, Bluesky and Google News RSS are all public

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/es`. Also try `/en` and `/ca`.

Pull fresh data from BDNS into the local snapshot:

```bash
curl http://localhost:3000/api/refresh
```

If you have set `CRON_SECRET` locally (in `.env.local`), the endpoint is protected and the
call above returns 401. Pass the secret instead:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/refresh
```

## Data flow

```
BDNS /api/partidospoliticos/busqueda
        │  (lib/bdns.ts)
        ▼
GET /api/refresh ──► lib/store.ts ──► Vercel KV  (production)
                                 └──► data/subsidies.json  (local dev, committed seed)
        │
        ▼
lib/data.ts (read + cache) ──► lib/normalize.ts (aggregate) ──► app/[locale]/* (render)
```

The browser never calls BDNS directly — pages read the stored snapshot, so rendering is fast
and free of CORS and rate-limit problems. `data/subsidies.json` is committed so the app works
on a clean checkout before any refresh has run.

## Internationalization

Locale lives in the URL (`/es`, `/en`, `/ca`), which keeps pages statically generated.

- `middleware.ts` redirects unprefixed paths, choosing the locale from the `locale` cookie,
  then `Accept-Language`, then the Spanish default.
- `lib/locales.ts` holds the locale constants only, so the edge middleware does not pull in the
  translation tables.
- `lib/i18n.ts` holds the dictionaries and `getDict(locale)`.
- Numbers and dates are formatted with the locale's BCP-47 tag via `lib/format.ts`.

Party names, official job titles and cited report titles stay in their original language on
purpose — they are proper names, not UI copy.

## Deployment (Vercel)

1. Import the repository at vercel.com. Next.js is auto-detected; keep the default build settings.
2. **Storage** tab → create an Upstash for Redis / KV store and connect it to the project. This
   sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`, which `lib/store.ts` picks up automatically.
   Without it the daily refresh cannot persist, because Vercel's filesystem is read-only.
3. **Settings → Environment Variables** → add `CRON_SECRET` with a long random value:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Set this. Without it, `/api/refresh` is an unauthenticated public write endpoint.
4. Redeploy so the new environment variables take effect.

The daily cron (`/api/refresh`, 06:00) is declared in `vercel.json` and appears automatically
under **Settings → Cron Jobs**. Verify the whole chain with:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR-APP.vercel.app/api/refresh
```

A healthy response reports `"storage":{"configured":"kv","writtenTo":"kv"}`.

## Key files

| Path | Role |
|------|------|
| `lib/bdns.ts` | BDNS API client — endpoint, organ list, pagination |
| `lib/store.ts` | Snapshot persistence: Vercel KV in production, filesystem in dev |
| `lib/data.ts` | Load, cache and invalidate the aggregated snapshot |
| `lib/normalize.ts` | Parse `beneficiario` into NIF, classify subsidy kind, aggregate, filter |
| `lib/parties.ts` | Canonical NIF → party registry (name, colour, bloc) |
| `lib/politicians.ts` | Curated politicians with verified Bluesky handles |
| `lib/donations.ts` | Private donations 2020, transcribed from the Tribunal de Cuentas report |
| `lib/i18n.ts`, `lib/locales.ts` | Dictionaries and locale constants |
| `middleware.ts` | Locale redirects |
| `app/[locale]/page.tsx` + `components/Dashboard.tsx` | Overview: totals, filters, ranked bars |
| `app/[locale]/party/[nif]/page.tsx` | Party detail: public and private money, ledger, news |
| `app/[locale]/politician/[slug]/page.tsx` | Politician: party funding, Bluesky, news |
| `app/[locale]/metodologia/page.tsx` | Methodology and legal caveats |

## Sources

- [BDNS / SNPSAP — grants to political parties](https://www.infosubvenciones.es/bdnstrans/GE/es/concesiones/partidosPoliticos)
- [Tribunal de Cuentas — political parties](https://www.tcu.es/es/partidos-politicos/)
- [Organic Law 8/2007 on party financing](https://www.boe.es/buscar/act.php?id=BOE-A-2007-13022)
