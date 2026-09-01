# Changelog

Record of what changed, why, and what was deliberately left out. Entries are newest first. New
figures name their source; corrections and gaps are recorded alongside the work, not omitted.

---

## 2026-09-01 — Fixed the two critical contrast defects (P1, P2)

Two WCAG 1.4.3 failures from the audit, fixed together because they were entangled.

**P1 — the cascade defect.** `.label-mono` set `color: var(--paper-dim)` from an unlayered rule.
Tailwind v4 emits utilities inside `@layer utilities`, and **unlayered styles beat every cascade
layer regardless of specificity**, so the class won against any `text-[var(--…)]` written beside it.
62 call sites silently rendered `--paper-dim`. The visible casualty was the active filter chip on
`/financiacion` and `/votaciones`, which asks for `--ink` on `--gold` and rendered **1.14 : 1** — the
control telling the reader which filter is selected was the least readable text on the page.

The audit's first diagnosis was wrong and is corrected in `PLAN-VISUAL.md`: it said "same
specificity, defined later" and proposed `:where(.label-mono)`. Applying that changed nothing, and
measuring it is what showed why — `:where()` drops specificity to zero but does not touch layer
order. The fix that works is moving `.label-mono` and `.eyebrow` into `@layer base`, which loses to
`utilities` by layer order.

**P2 — the failing token.** `--paper-faint` was `#6f6857`, **3.48 : 1** on `--ink`, below the 4.5 : 1
that normal text needs, and used at `text-xs` and `text-sm`. It is now `#8a8270`, **5.06 : 1**, in
the same warm-grey family. This had to ship with P1: fixing the cascade alone would have newly
exposed the 43 elements that were accidentally being rescued by it.

**Verified in the browser, not assumed.** The active chip now measures **8.30 : 1** (`rgb(16,14,10)`
on gold); a probe with `label-mono text-[var(--ink)]` computes `rgb(16,14,10)`; a probe with
`label-mono text-[var(--paper-faint)]` computes `#8a8270` at 5.06 : 1. A sweep then walked every
visible text-bearing element on nine route/locale combinations, composited each against its real
background, and applied the large-text threshold by measured size and weight. **Eight of the nine
routes now report zero contrast failures.**

**One new finding, from that sweep.** `/es/politicos` reports four. The avatar initials use the
party's brand colour as text on `--ink-3`, and three party colours fall under 4.5 : 1 at 16.3 px:
`#8b5cc4` (3.61), `#d64545` (3.92), `#c7527f` (4.04). Recorded as P4 and **not fixed**: the initials
are `aria-hidden` and sit beside the person's name, so treating them as incidental decoration is
defensible, and the honest fixes — initials in `--paper` with the brand colour kept for the ring, or
a lighter tile — are design decisions rather than defect repairs. Lightening the party colours
themselves is not on the table, since those are the parties' own identities.

**Deliberately left out.** Only P1 and P2 were in scope. P3 (chip borders at 1.77 : 1), O1 (no skip
link), O2 (Escape does not close the mobile menu), O3 (target size), R1 (no `aria-pressed`), R2 (no
live regions) and R3 (table semantics) are unchanged and still listed in `PLAN-VISUAL.md` §2b. Also
recorded there: `.display`, `.mono`, `.src` and `.panel` remain unlayered and carry the same latent
trap as P1, with no measured casualty today.

Typecheck clean, production build clean at 104 pages.

---

## 2026-09-01 — Design critique and WCAG 2.1 AA audit (no code shipped)

Audited the running app rather than the source: seven routes at 1440×900 and 375×812, nine
route/locale combinations for the accessibility pass. Contrast was read with `getComputedStyle` on
live elements and composited against the real background, keyboard behaviour was driven with real key
events, and reflow was tested at 320 CSS px. Findings and the plan are in `PLAN-VISUAL.md`. Nothing
was changed in the app.

**The cascade bug that hid two others.** `.label-mono` in `app/globals.css` sets a colour. It has the
same specificity as a Tailwind colour utility and is defined after the Tailwind layers, so it
silently wins — **every element combining `label-mono` with a `text-[var(--…)]` utility renders
`--paper-dim` regardless of what the code says, across 62 occurrences.** Two are visible failures:
the active filter chip on `/es/financiacion` and `/es/votaciones` asks for `--ink` on `--gold` and
renders `--paper-dim` on `--gold` at **1.14 : 1**. The control that tells the reader which filter is
selected is the least readable text on the page.

**A token below AA.** `--paper-faint` `#6f6857` on `--ink` is **3.48 : 1**, under the 4.5 : 1 normal
text needs. 21 elements render at it today; 43 more are masked by the cascade bug. The two defects
must be fixed in the same change, because fixing the cascade alone newly exposes those 43.

**Five more, all verified in the browser.** Escape does not close the mobile menu (`aria-expanded`
stays `"true"`). No route carries a skip link, though the sidebar's six links precede `<main>` every
time. All eight filter chips lack `aria-pressed`, so with the contrast defect the selected state is
unavailable both visually and programmatically. There are no live regions anywhere, on pages whose
entire result set is replaced by filtering or searching. The chips' only boundary measures
**1.77 : 1** where non-text contrast needs 3 : 1.

**What passes was checked, not assumed**, and is recorded so a future pass does not redo it: correct
`lang` per locale, exactly one `<h1>` and no skipped heading levels on all nine, `<main>`/`<nav>`/
`<footer>` present, every image with `alt`, every control with an accessible name, the search field
labelled, focus visible under real keyboard use, and reflow clean at 320 px with the wide table
scrolling inside its own box. One caveat recorded with the pass: the site contains **no `:focus` rule
at all**, so the focus ring is entirely the browser's default — adequate today, but undesigned on a
near-black ground.

**The visual finding.** A data-journalism site with **zero `<svg>` and zero `<canvas>` on any
route** — every chart is a `div` with a percentage width, and the politician profile, party page and
directory have no chart at all. `data/photos.json` holds 133 portraits against 6,670 register rows,
so the directory is 98% initials. The plan proposes a small server-rendered chart primitive rather
than a charting framework, converting the 54 existing bars first, then one lead visual per page.

The page it recommends starting with is `/metodologia`: the project's strongest quality is that it
states its gaps, and those gaps are currently only prose. A coverage chart — 133 of 6,670 portraits,
268 of 6,670 with a roll-call record, 4,964 of 6,670 with a published salary — makes the honesty
visible.

**Deliberately left out.** No code changes, no token edits, and no screen-reader claims: an NVDA or
VoiceOver pass over the profile and votes pages is listed as outstanding, along with a check of
whether the vote cards work without colour vision. Automated checks catch roughly a third of real
barriers and the document says so.

---

## 2026-09-01 — News source registry, Atom support, and two staleness guards

First implementation step of the context layer designed in `PLAN-CONTEXT-LAYER.md`. The portal's
news panel no longer runs a Google News search: it reads a fixed, auditable list of RSS and Atom
feeds, so the publisher of every headline is known.

**Fixed a real bug.** `lib/news.ts` matched `<item>` only, so it returned an empty array for Atom
feeds — El Salto publishes Atom — without raising an error. The parser now handles both `<item>` and
`<entry>`, and reads Atom's self-closing `<link href>` attribute rather than element text.

**New registry.** `lib/news-sources.mjs` holds 15 verified sources with their format, topics,
language, whether they are an organisation or an outlet, and the date of their newest item at the
2026-09-01 probe. It follows the `lib/name-key.mjs` precedent — a `.mjs` module with a `.d.mts`
declaration — so the app and the build script read the same list rather than two copies. Seven
deliberately excluded feeds are listed with the reason each was left out.

**Two guards, each from an observed failure.** A source whose newest item is more than 365 days old
is dropped whole; nothing older than 120 days enters the panel regardless of source. The reason is
dosmanzanas: the most obvious LGBTI news source in Spain serves HTTP 200 with ten items whose newest
post is 23 February 2024. A status-code check calls that healthy, and it would have filled a "recent
news" panel with two-year-old articles.

**Two further rules, added after watching the merged output.** At most two items per source, because
the first working version was four-fifths Shangay — sorting purely by date makes the panel a ranking
of who publishes most often, burying the organisations the registry exists to include. And items in
the reader's language sort first, because TGEU and ILGA-Europe post daily in English and had taken
the top of the Spanish page. Catalan readers get the Spanish sources first; the registry has no
Catalan feed and Spanish is the nearer of the two.

**Provenance shown, not just used.** Every item carries its source name, and items from an
organisation's own site are marked as such — an association's statement about a law is not the same
kind of item as a newspaper's report on it. The methodology page now lists the whole registry with
links, the guard thresholds in words, and the excluded feeds with their reasons, in all three
languages. The portal's news heading now says rights *and* housing, which is what the panel actually
contains, and the note states plainly that organisation posts may cover their own activities as much
as rights news — one COGAM item in the live feed is a hiking outing, and filtering organisation
feeds by keyword would be arbitrary where labelling them is not.

**New check.** `npm run check:feeds` fetches every registered feed, reports the age of its newest
item, and exits non-zero on any source that is unreachable, unparseable or stale. It has one retry
per source: fetching fifteen feeds at once produces the occasional timeout, and a health check that
reports transient failures as dead feeds is one people learn to ignore. It found two things this
run — `provivienda.org` answers 403 to a descriptive bot User-Agent and 200 to an ordinary browser
one (so `FEED_HEADERS` sends the browser string), and Arcópoli is live but has published nothing in
201 days, which the report marks with `~` rather than treating as a failure.

**Verified.** All 15 sources live, 0 failing. `/api/news?topic=lgtbi,vivienda&lang=es` returns eight
items across six distinct Spanish sources with an empty `dropped` list; `lang=en` puts the English
organisations first. Typecheck clean, production build clean at 104 pages, no console errors.

**Deliberately left out.** No keyword filtering of organisation feeds, no attempt to rank items by
relevance, and no new statistical figures — the INE ingest is the next step, not this one. Query mode
is unchanged, so party and politician pages still use Google News.

**Two review findings fixed before the branch went further.** Both were drift risks rather than
present bugs, and both were cheap:

- `SOURCE_STALE_DAYS` and `ITEM_MAX_AGE_DAYS` were defined twice, once in `lib/news.ts` and once in
  `scripts/check-feeds.mjs`. Changing one would have left the health check passing feeds the live
  code then filtered out. They now live in `lib/news-sources.mjs` and both consumers import them.
- The per-source cap was keyed on the display name. Two registry entries sharing a name would have
  shared one counter. It is keyed on the registry id now, and `check:feeds` refuses to run at all if
  any `id`, `name` or `url` is duplicated — the uniqueness the cap relies on is checked rather than
  assumed. Verified by constructing a duplicate and confirming the detection fires.

---

## 2026-09-01 — Context layer designed and sources verified (no code shipped)

Planning task. The site answers who funds the parties and how they voted; the missing third side is
what the country those parties govern actually looks like — wages by sector, poverty, homelessness,
empty housing — placed next to politician pay, party funding and roll-call votes. This entry records
the source verification behind the new design document `PLAN-CONTEXT-LAYER.md`. No feature code was
written.

**Sources confirmed working.** The INE JSON API (Tempus3, `servicios.ine.es/wstempus`, no key) is the
spine of the layer. Verified live: `OPERACIONES_DISPONIBLES`, `TABLAS_OPERACION`, `DATOS_TABLA`.
Operation 140 EAES table `28185` returns 57 series of gross annual wage by CNAE section and sex for
2024; operation 155 ECV table `67240` returns 96 AROPE series with 2025 values. EAES 2024 headline
figures for sanity-checking an ingest: mean €29,540.26, median €24,497.17, mode €16,520.18, highest
sector energy supply €57,931.81, lowest hostelería €17,653.42. AROPE 2025: 25.7% overall, 33.9% for
under-16s.

**Traps found before they could reach a chart.** Three matter enough to name here:

- In INE data a **leading minus sign is a reliability flag, not a negative number** — it marks a
  sample of 100–500 observations. `Mujeres. Industrias extractivas` returns `-51101.45`, meaning
  €51,101.45 with a variability warning. An ingest that takes the value at face value will draw
  negative wages.
- Not every table listed by `TABLAS_OPERACION` is populated: table `80181` answers
  `{"status": "No existen series para la tabla"}`. Probe before depending on one.
- The same ECV table carries both the *Base 2013* AROPE series and the *objetivo Europa 2030*
  series. They are different definitions and must never be plotted as one line.

**Housing: two official numbers that disagree, recorded as such.** INE's Censo 2021 counts ~3.8M
empty dwellings (14.4% of stock), detected by absent or minimal electricity consumption, with 45% of
them in municipalities under 10,000 inhabitants and a reference date of 1 January 2021 — a pandemic
year, which is the basis of the standing criticism of the method. The Ministerio de Vivienda's 2025
data instead reports ~7.7M non-principal dwellings (28.6%) on a different method. Both will be
shown, with the methodological difference stated, rather than picking the larger figure.

On homelessness the current INE figure is the *Encuesta de centros y servicios de atención a personas
sin hogar* **2024**: an average 34,145 people over 18 staying daily in care centres, up 57.5% on
2022, across 1,376 centres. The widely-quoted 28,552 is the superseded 2022 edition. The plan
explicitly forbids dividing empty homes by homeless people: it is arithmetically true,
geographically false, and would discredit the rest of the site. The honest treatment is a map
placing empty-dwelling density against housing stress in the same geography.

**News feeds: probed every candidate rather than trusting the list.** Twelve feeds work and are
fresh, including Shangay, FELGTBI+, Fundación Triángulo, COGAM, Euforia, Plataforma Trans, Arcópoli,
TGEU, ILGA-Europe, Pikara, Provivienda and Hogar Sí. Two findings changed the design:

- **dosmanzanas is dormant.** Its feed returns HTTP 200 with ten items whose newest post is 23
  February 2024. It is the first LGBTI news source anyone would reach for, and it would have filled a
  "latest news" panel with two-year-old articles while looking perfectly healthy.
- **El Salto publishes Atom, not RSS.** The parser in `lib/news.ts` matches `<item>` only, so it
  returns an empty array for `<feed>`/`<entry>` documents. A latent bug, found by probing rather than
  by a user noticing an empty panel.

Consequently `lib/news.ts` is to become a registry of named sources with a format field, an Atom
branch, and a **staleness guard** that drops any source whose newest item is older than a threshold
and reports it in a build log, so the dosmanzanas failure mode cannot recur silently. Dead or
unreachable at probe time, recorded so they are not re-probed blindly: chrysallis.org.es,
kifkif.info, fundacion26d.org, lambdavalencia.org, observatoriolgtb.org, and both feed paths on
eapn.es.

**Deliberately left out.** Nothing was built, no numbers were added to the site, and no correlation
measure of any kind was designed. The framing decision taken earlier in the project stands and is
restated at the top of the plan: facts are placed side by side, never joined by an asserted cause. No
trend lines between votes and poverty rates, no derived "harm score", no ordering of parties by
anything computed. Press articles — including the ones that prompted this work — are treated as leads
only; every figure on the page will cite the statistical office, ministry or audit body that produced
it.

Also left for the build phase, not decided here: the exact AEAT *Distribución salarios* file URL (the
open-data catalogue page exposes no direct links, so each year's publication page has to be opened —
a discovery step of the same class as the Tribunal de Cuentas report hunt), and whether keyword
filtering of the Congreso *iniciativas* dataset can be made precise enough to publish at all.

---

## 2026-08-31 — EU political-ad repository: probed, not usable yet (no code shipped)

Investigated the European repository for online political advertisements as a live source for who
paid for political advertising, how much, and who was targeted. **It is not publicly accessible,
so nothing was built.** Recording the result so the probe is not repeated.

What the law provides. Regulation (EU) 2024/900 has applied in full since 10 October 2025 and
requires political ads to carry the sponsor, the amounts paid and the targeting criteria.
Commission Implementing Regulation (EU) 2026/818 of 9 April 2026 defines the repository's common
data structure, standardised metadata, authentication and common API, and its provisions apply
from 10 April 2026 — nearly five months before this check.

What actually exists. The Commission's site for the Regulation is
<https://political-advertising.ec.europa.eu>. It hosts exactly two portals: the Article 26 portal
for Member States to file election and referendum dates, and the Article 21 portal linking
national registers of legal representatives for non-EU providers. There is no repository of
advertisements and no public API. Searching the site's own text for "repositor" returns a single
hit: the *title* of the implementing regulation, listed among documents. No launch date is
announced, although the implementing regulation says the date "should be announced on the public
portal of the repository sufficiently in advance".

Two further blockers even once it exists. The implementing regulation specifies authentication via
**EU Login** with JSON Web Tokens, so the API is credentialed rather than open; and the regulation
defines standards for the architecture, not an operational endpoint — the portal address is to be
announced separately and has not been.

Deliberately not substituted: per-platform ad libraries (Meta, Google) do exist and would produce
*something*. They were not used, because presenting a platform-by-platform scrape as the EU
repository would misrepresent both provenance and completeness — the EU repository is meant to be
comprehensive across providers, an ad library is one company's view of its own inventory. That
remains available as a clearly-labelled separate layer if wanted, but it is not this.

Re-check trigger: a launch announcement on the portal above, or a Commission statement that the
first version of the repository is functional.

---

## 2026-08-31 — Per-foundation detail from Tribunal de Cuentas report 1.642

`/financiacion` now names every audited party-linked foundation instead of showing only
aggregates. 38 entities, with donations and public subsidies per year and the party each is
linked to.

**Source.** Report nº 1.642, "Informe de fiscalización de las aportaciones percibidas por las
fundaciones y demás entidades vinculadas o dependientes de los partidos políticos y de los gastos
de programas y actividades de estas financiados con cargo a subvenciones públicas, ejercicios 2021
y 2022", approved 25 September 2025. Annexes III (2021) and IV (2022) carry the consolidated
tables. Extracted by the new `scripts/extract-foundations.py` into `data/foundations.json`.

**How it was located**, after the previous attempt gave up: the `/es/partidos-politicos/Informes/`
index lists only 20 reports and does not include this one, and the press release's own "Informe"
and "Resumen" links are flagged `data-oc-broken-link="true"` by the Tribunal's CMS — the publisher
links to its own report are broken. The route that worked was the site-wide search POSTed to
`/es/buscador/`. That is now recorded in `AGENTS.md` and `NEXT-STEPS.md` so the dead ends are not
retried.

**Verification.** The extractor sums its own parsed rows and compares them to each annex's
TOTALES row, aborting on a mismatch. That guard earned its place immediately: the first run
reported `2021 donations: extracted 3735060.25 but the report totals 3813743.67`, a €78,683.42
shortfall. Cause: the row pattern excluded digits from entity names, so "Fundación 14 de Abril",
"Fundación Instituto 25 de Mayo para la Democracia" and "Asociación Movimiento Ciudadano Madrid
2019" were silently skipped. Anchoring the amounts by their decimal comma instead fixed it, and
both years now reconcile exactly: €3,813,743.67 / €2,394,338.06 for 2021 and €4,122,985.46 /
€2,539,219.75 for 2022.

**Party attribution comes from the report, not from us.** Links are read from its own sentence
"La <entity>, vinculada a la formación política <party>", which covers 34 of the 38 entities. The
other four are shown as "sin partido indicado" rather than matched by name, and the report-stated
party name is joined to the NIF registry only when exactly one registry entry matches.

**What this surfaces.** Fundación Disenso, linked to Vox, received €5,091,920 across the two
years — **64.2%** of all donations to party-linked foundations. The page now leads with that
concentration figure. Next are Fundación Iratzar (Sortu, €1,007,500), Fundación Pablo Iglesias
(PSOE, €559,459) and Fundación Sabino Arana (PNV, €544,002).

**Still not covered:** the report covers 2021 and 2022 only, nothing later is published, and four
entities carry no party because the report does not state one. Both facts are stated on the page.

---

## 2026-08-31 — Docs: architecture refresh, next steps, this changelog

- Rewrote `AGENTS.md`. It had gone stale: it still documented `/sueldos`, `/caras` and
  `/politician/[slug]` as live routes when those are now redirects, and it had no sidebar,
  `/politicos`, `/politico/[slug]`, `/financiacion` or foundations layer. It now carries the real
  route and library inventory, the honesty rules with the two concrete near-misses that produced
  them, the endpoint findings that cost time to work out, the dependency-overrides rationale, and
  a known-gaps section.
- Added `NEXT-STEPS.md`: the planned work, each item with what is already known, the procedure,
  and explicit stop conditions. It records what was already tried on the foundations-report hunt
  so it is not repeated — the report-index gap, the `I<number>.pdf` URL pattern, the fact that a
  `HEAD` probe returns 200 with a zero body for most numbers and so cannot identify a report,
  that I1612 and I1611 are the wrong reports, and that the TdC search endpoint needs a session.
- Added this changelog, and adopted documenting each task here as standing practice.

No application code changed in this entry.

---

## 2026-08-31 — Dependencies: cleared postcss and sharp advisories without a Next major

`npm audit` reported three high findings attributed to `next`, but only as the parent of two
transitive dependencies:

- **postcss** — Next pinned a nested copy at 8.4.31, inside the vulnerable range for four
  advisories: CSS-stringify XSS (GHSA-qx2v-qp2m-jg93) and three `sourceMappingURL` path
  traversals disclosing arbitrary `.map` files (GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp,
  GHSA-r28c-9q8g-f849). Our own build already used 8.5.26 via `@tailwindcss/postcss`.
- **sharp** — 0.34.5, below the 0.35.0 carrying the libvips CVE fixes (GHSA-f88m-g3jw-g9cj:
  CVE-2026-33327, -33328, -35590, -35591).

Fixed with an `overrides` block pinning `postcss` to `^8.5.26` and `sharp` to `^0.35.0`. Result:
**3 high → 0 vulnerabilities**, nested postcss deduped away, sharp at 0.35.4, build still clean at
104 pages. npm's only proposed fix was `next@16.3.3`, a semver-major; the overrides reach the same
audit result without forcing that upgrade, so moving to Next 16 stays a deliberate decision.

Neither advisory was reachable in this app as configured — the postcss ones need
attacker-controlled CSS or `sourceMappingURL` comments, and the only CSS in the build is ours plus
Tailwind; the sharp CVEs need image processing, and `next/image` is used solely with `unoptimized`.
Pinned anyway, because "not reachable today" depends on choices a later change could reverse.

Also closed a Vercel-generated branch and its PR #1, which proposed `next` 15.5.4 → 15.5.9. It was
cut eight commits back, would have been a downgrade of the pin from 15.5.23, still contained a
`refresh` script that had since been removed, and 15.5.9 sits inside both vulnerable ranges so it
would not have cleared the audit either.

---

## 2026-08-31 — Party-linked foundations layer

`/financiacion` gained the foundations channel: private donations and public subsidies per year —
2021, €3.8M and €2.4M across 36 audited entities; 2022, €4.1M and €2.5M across 34 — sourced to the
Tribunal de Cuentas release of 26 September 2025 reporting that these donations doubled against
2020.

**A framing claim was corrected before shipping.** The section was going to say that foundations
are simply the route corporate money can still take. That is too loose. Under the seventh
additional provision of LO 8/2007 these entities cannot accept donations from public bodies or
companies at all, and donations from private legal entities carry the same limits that apply to
parties. The actual difference is narrower: money given to finance a *specific activity or
project* of the foundation is not legally treated as a donation, where it answers to a common
interest or to both entities' statutory purpose. The page explains that mechanism instead.

**Deliberately absent:** the per-foundation breakdown. The full report was not locatable from the
published index without a large blind PDF hunt, so only the Tribunal's aggregates are loaded, and
the page states under "lo que no muestra" that no foundation is named and no amount is attributed
to any particular party.

---

## 2026-08-31 — Landing page rebuilt as a transparency portal

The home page is now an entry point rather than a single chart: what the site tracks, the headline
figures (€300.6M public money, €2.1M declared private donations, 6,670 officeholders, 9 votes
tracked), how each parliamentary group voted on the tracked items, a rights-focused news feed, and
cards into the four sections. The full party dashboard moved to `/financiacion` with its own
sidebar entry. `components/StanceByGroup.tsx` reports each group's majority ballot, counted from
that group's own named votes.

**A labelling error was caught by spot-checking.** Groups were first bucketed as "a favor" /
"en contra", which put EH Bildu in "en contra" on Ley 4/2023 — but that ballot was on the Senate's
amendments, where a No can mean rejecting the amendment rather than opposing the law. On a site
about exactly this issue that would have misrepresented a party's position. The buckets now use
ballot language ("votó Sí" / "votó No" / "se abstuvo"), each card shows the actual subject of the
ballot, and the note states this is the vote as recorded, not an interpretation of intent.

The framing line under the figures states that money and votes are published together so they can
be looked up, not because one explains the other.

---

## 2026-08-31 — Sidebar navigation and a unified politician directory

- `components/Sidebar.tsx`: persistent left rail on desktop (Datos / Sobre groups), collapsible
  menu on mobile, active-item highlight, locale toggle at the foot. The header nav is gone.
- `/sueldos` and `/caras` merged into `/politicos`; both, and `/politician/[slug]`, now redirect.
  A lead section cards the profiles that carry a roll-call record, ranked by how much material
  exists, hidden while the visitor searches. The full register of 6,670 keeps search, party facets
  and paging.
- `/politico/[slug]`: portrait or initials, post and party, the person's pay beside their party's
  public funding and declared private donations, their recorded ballots grouped by topic (trans
  and LGBTI rights, sexual and reproductive health, housing) with vote kind, non-binding marker,
  the group they sat in *at that vote*, and a link to the official record. Bluesky and news feeds
  where they exist.
- `lib/people.ts` performs the join. Curated handles carry a short public name ("Óscar Puente")
  while the register carries the full legal name ("Óscar Puente Santiago"), so they are linked by
  matching every token of the short name into the register's tokens, accepted only when exactly
  one row qualifies. An ambiguous match is dropped rather than guessed, because a wrong link would
  attribute someone else's accounts to a named person.

Someone with no roll-call record shows "sin voto registrado" plus a note that their position is
not inferred from their party — not a blank that reads as absence of opinion.

**Performance note:** the directory first took over 300 seconds because badge-building did 6,670
sequential awaits. Rewritten to set-based lookups: ~6s cold in dev, sub-second warm.

---

## Earlier work (merged as PR #2)

- Public salaries index: 6,670 active officeholders from the Registro de Altos Cargos export,
  accent-folded search, party facets, 74.8% matched to the BDNS party registry by NIF.
- Key roll-call votes: 9 votes from Congreso de los Diputados open data across the XIV and XV
  legislatures, each pinned by hand with the tally expected on the official record and refused if
  the tally disagrees. Vote kinds labelled; amendment votes excluded.
- Portraits: 133 freely-licensed images from Wikimedia Commons, attached only on an exact
  article-title match, with author and licence rendered wherever the image appears.
- Internationalisation: ES / EN / CA under `/[locale]`, with locale-aware number and date
  formatting.
- Live BDNS subsidy tracker with a daily Vercel cron and KV-backed snapshot persistence.
