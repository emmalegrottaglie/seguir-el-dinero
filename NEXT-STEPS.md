# Next steps

Planned work, with enough detail to pick any item up cold. Each entry states what the goal is,
what is already known, the concrete procedure, and the point at which the work should stop rather
than approximate. `AGENTS.md` covers the current architecture; this file covers what is not built
yet.

The ordering below is by expected value, not by difficulty.

---

## 1. Per-foundation detail — DONE (2026-08-31)

Report **nº 1.642** ("aportaciones percibidas por las fundaciones y demás entidades vinculadas o
dependientes de los partidos políticos … ejercicios 2021 y 2022", approved 25/09/2025) is now
extracted by `scripts/extract-foundations.py` into `data/foundations.json`: 38 entities, per-year
donations and public subsidies, with the linked party taken from the report's own wording.

How it was found, since the earlier attempts all failed: the `/es/partidos-politicos/Informes/`
index lists only 20 reports and does not include 1.642, and the press release's "Informe" and
"Resumen" links are flagged `data-oc-broken-link="true"` by the Tribunal's own CMS. The route that
worked was the site-wide search, POSTed to `/es/buscador/` from the page context. Use that first
next time.

Remaining in this area is item 4 below (donation years for the parties themselves).

## 2. EU political-advertising repository — BLOCKED, probed 2026-08-31

**Goal.** A live source for who paid for political advertising, how much, and who was targeted —
the one funding channel still invisible on the site.

**Status: not publicly accessible. Do not re-probe without a trigger.**

What was checked, so it is not repeated:

- Regulation (EU) 2024/900 applies in full since 10 October 2025; Implementing Regulation (EU)
  2026/818 of 9 April 2026 defines the repository's data structure, metadata, authentication and
  common API, applying from 10 April 2026.
- The Commission's site for the Regulation is <https://political-advertising.ec.europa.eu>. It
  hosts only the Article 26 election-dates portal and the Article 21 legal-representatives portal.
  No advertisement repository, no public API. The site's only occurrence of "repositor" is the
  title of the implementing regulation in a document list, and no launch date is announced.
- Other plausible hosts return nothing: `political-ads.europa.eu`,
  `repository.political-advertising.europa.eu`, `transparency.ec.europa.eu/political-advertising_en`
  all fail to resolve; `ec.europa.eu/political-advertising` is a 404.
- Even once live, the API authenticates via **EU Login** with JWTs, so access is credentialed. That
  needs the repo owner's own credentials — it is not something to work around.

**Re-check trigger.** A launch announcement on the portal above, or a Commission statement that
the first version of the repository is functional. Until then this item stays blocked.

**Stop condition, restated.** Do not substitute a scrape of per-platform ad libraries (Meta,
Google) and present it as the EU repository: an ad library is one company's view of its own
inventory, while the EU repository is meant to be comprehensive across providers. A
clearly-labelled per-platform layer is a legitimate but *different* feature, and would need its
own decision.

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

## 5. Context layer — wages, poverty, housing, and measures taken

**Goal.** Place what the country looks like next to who funds the parties and how they voted: wages
by sector, poverty and inequality, homelessness and empty housing, and a count of the measures
parties actually put through.

**Designed, not built.** The full design lives in `PLAN-CONTEXT-LAYER.md` — verified endpoints and
table ids, the traps in each dataset, ten visualisation proposals with a recommended build order,
and the framing rule that governs the lot. Read that file before starting; the sources were probed
on 2026-09-01 and the document records which ones lie.

**Step 1 of the build order is DONE (2026-09-01).** `lib/news-sources.mjs` holds the 15-source
registry, `lib/news.ts` parses both RSS and Atom, and both staleness guards are in place along with a
per-source cap and reader-language preference. `npm run check:feeds` is the health check. The
methodology page lists the registry and the excluded feeds. Next up is step 2, the INE ingest.

**Stop conditions.** No correlation measure, no derived score, no ordering of parties by anything
computed: facts side by side, never joined by an asserted cause. Never divide empty dwellings by
homeless people. Never plot the AROPE *Base 2013* and *objetivo Europa 2030* series as one line. In
INE data, treat a leading minus sign as a low-sample reliability flag, not a negative value. If the
Congreso *iniciativas* keyword filter cannot be made precise, publish the vote layer alone and say
so.

---

## Standing practice

- **Document every task in `CHANGELOG.md`** — what changed, why, the source behind any new
  figure, and what was deliberately left out.
- **Verify before publishing.** Two claims in this project were wrong on the first pass and were
  caught by checking: a group-position label that misrepresented EH Bildu on the Ley Trans
  amendment ballot, and an over-loose account of why party foundations matter. Both are recorded
  in `AGENTS.md`.
- **A gap stated on the page is worth more than a number that might be wrong.**
