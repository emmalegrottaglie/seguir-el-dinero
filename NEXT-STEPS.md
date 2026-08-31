# Next steps

Planned work, with enough detail to pick any item up cold. Each entry states what the goal is,
what is already known, the concrete procedure, and the point at which the work should stop rather
than approximate. `AGENTS.md` covers the current architecture; this file covers what is not built
yet.

The ordering below is by expected value, not by difficulty.

---

## 1. Per-foundation detail (in progress)

**Goal.** Attribute foundation money to named foundations and, where the report states it, to the
party each is linked to — replacing the aggregate-only view in `lib/foundations.ts`.

**What is known.** The Tribunal de Cuentas press release of 26 September 2025 gives the
aggregates now on the site: 2021 — €3.8M private donations, €2.4M public subsidies, 36 entities;
2022 — €4.1M and €2.5M, 34 entities. The per-foundation breakdown is in the underlying report,
which the release does not link.

**What was already tried, so it is not repeated.**

- `https://www.tcu.es/es/partidos-politicos/Informes/` lists reports, but its visible entries stop
  short of this one. The foundations-inclusive title pattern is
  *"Informe de Fiscalización de los estados contables de los partidos políticos y de las
  aportaciones percibidas por las fundaciones y demás entidades vinculadas"* — matching that
  phrase is the reliable way to recognise the right report.
- Report numbers are addressable as
  `https://www.tcu.es/export/sites/portal/repositorio2/INFORME/<year>/I<number>.pdf`.
  A `HEAD` probe of I1614–I1636 in the 2025 folder returns 200 for most numbers with
  `size_download: 0`, so a HEAD is **not** sufficient to identify a report.
- I1612 was fetched and is the 2023 local-elections audit (851 pages, 54 MB) — the wrong one.
  I1611 is a subcontracting audit. Blind full downloads are expensive; do not brute-force.
- `https://www.tcu.es/searcher/document/DocumentSearch.action` responds 302 to an unauthenticated
  GET; it needs a session, so it cannot be queried directly with curl.

**Procedure.**

1. Prefer identification over download. Drive the TdC site in the browser (the preview browser
   works; `curl` is blocked without a browser User-Agent) and use its own search UI to find the
   report covering ejercicios 2021 and 2022, then read the report number off the result.
2. Only then fetch that one PDF.
3. Extract with `pypdf`, the same way `data/donations.ts` was produced: locate the consolidated
   annex table — for donations it was *"Gráfico N. Donaciones del ejercicio N por tramos"*, so
   search page text for a comparable *"aportaciones"* / *"fundaciones"* table — and transcribe it
   verbatim into a typed module rather than parsing at runtime.
4. Cross-check the transcribed rows against the release's aggregates. If the per-foundation rows
   do not sum to €3.8M / €4.1M, that discrepancy must be understood before publishing, not
   smoothed over.
5. Extend `lib/foundations.ts` with the named rows, keeping the existing aggregate figures and
   the legal-mechanism text. Add the per-foundation table to `/financiacion`, and link each
   foundation to its party's page only where the report itself states the link.

**Stop conditions.** If the report cannot be identified, keep the aggregates and leave the
"lo que no muestra" block in place. If the report names foundations but not their party links, do
**not** infer the link from the foundation's name — publish the foundations without party
attribution and say so.

---

## 2. EU political-advertising repository

**Goal.** A live source for who paid for political advertising, how much, and who was targeted —
the one funding channel currently invisible on the site.

**What is known.** Regulation (EU) 2024/900 has applied in full since 10 October 2025. It requires
political ads to be labelled with the sponsor, the amounts paid, and the targeting criteria used.
A European Repository for online political advertisements is being established, and an
implementing act of 9 April 2026 sets its data structure, metadata standards and API
specification. Source:
<https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/democracy-eu-citizenship-anti-corruption/democracy-and-electoral-rights/transparency-and-targeting-political-advertising_en>

**Procedure.**

1. Probe before designing anything: find the repository's actual endpoint and confirm it serves
   data for Spain. The implementing act defines the API, but an act defining a schema is not
   evidence that a populated endpoint exists.
2. If populated: build `lib/adverts.ts` plus a fetch script following the pattern of
   `scripts/fetch-votes.mjs` — pull, store a typed snapshot in `data/`, render server-side.
3. Join to parties by sponsor name via `lib/name-key.mjs`, accepting only unambiguous matches,
   exactly as the social-handle join does.

**Stop conditions.** If the endpoint is unpopulated or Spain-empty, write the finding into
`CHANGELOG.md` and stop. Do not substitute a scrape of ad-library pages from individual platforms
and present it as the EU repository — different provenance, different completeness.

---

## 3. Wider verified social coverage

**Goal.** More profiles carrying a social feed. Currently 6 verified handles in
`lib/politicians.ts` against 6,670 register rows.

**Procedure.** For each candidate, query the Bluesky public API
(`app.bsky.actor.getProfile`) and accept the handle only on evidence: follower count in the
thousands, a bio consistent with the person's public role, and posting history. Two
impersonation accounts were rejected this way during the original build — a fake "Feijóo" with 4
followers and 0 posts, and a fake "Mónica García" with 3 followers. Record the follower count at
verification time, as the existing entries do.

Mastodon is a reasonable second free source. X/Twitter requires a paid API key; if that is ever
wanted, it should sit behind an env var rather than being hardcoded.

**Stop conditions.** Never add a handle on name similarity alone. An unverifiable handle is left
out, and the site already states that Bluesky's Spanish presence skews left, so PP and Vox
leaders having no account there is a platform fact and not a coverage failure to paper over.

---

## 4. More donation years

**Goal.** Private donations beyond ejercicio 2020.

**What is known.** `lib/donations.ts` holds 2020 from Tribunal de Cuentas report 1573, transcribed
from the annex table *"Gráfico 5. Donaciones del ejercicio 2020 por tramos"* (page 435 of the
annexes in an 851-page-class PDF). Later exercises follow the same report series.

**Procedure.** Same as item 1: identify the report, fetch once, locate the equivalently-named
annex table, transcribe verbatim into the typed module with its own source block, and add a year
selector to the party page rather than overwriting 2020.

---

## Standing practice

- **Document every task in `CHANGELOG.md`** — what changed, why, the source behind any new
  figure, and what was deliberately left out.
- **Verify before publishing.** Two claims in this project were wrong on the first pass and were
  caught by checking: a group-position label that misrepresented EH Bildu on the Ley Trans
  amendment ballot, and an over-loose account of why party foundations matter. Both are recorded
  in `AGENTS.md`.
- **A gap stated on the page is worth more than a number that might be wrong.**
