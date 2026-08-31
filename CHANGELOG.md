# Changelog

Record of what changed, why, and what was deliberately left out. Entries are newest first. New
figures name their source; corrections and gaps are recorded alongside the work, not omitted.

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
