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
