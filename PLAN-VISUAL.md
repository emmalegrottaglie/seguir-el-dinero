# Design critique, accessibility audit, and plan: making the portal visual

Audited 2026-09-01 against the running app: seven routes at 1440×900 and at 375×812, with contrast
ratios and element counts measured in the page rather than estimated by eye. Everything numbered
below was measured; where a figure is stated, the method is stated with it.

The site is at refinement stage — the dossier art direction is settled and working. This is not a
redesign. It is a set of measured defects to fix, a WCAG 2.1 AA audit in §2b, and one deliberate
absence to fill.

---

## 1. Overall impression

The art direction is genuinely good and should not be touched: ink ground, warm paper text, a single
gold accent, serif display against mono labels, film grain, the gold aura at the top. It reads as an
investigative dossier, which is exactly right for the subject, and it does not look like a generic
dashboard.

The biggest opportunity is not styling. It is that **a data-journalism site currently contains no
charts**. Across all seven routes there are **zero `<svg>` and zero `<canvas>` elements**. Every
"chart" is a `div` whose width is a percentage — 27 on the portal, 27 on `/votaciones`, 2 on
`/financiacion`, and none at all on the politician profile, the party page or the directory. The
data is the story, and right now the reader has to assemble it from numerals in prose.

---

## 2. Defects, measured

### 🔴 D1 — `.label-mono` silently overrides every text colour set beside it

**Fixed 2026-09-01.** `.label-mono` in `app/globals.css` set `color: var(--paper-dim)` from an
*unlayered* rule. Tailwind v4 emits its utilities inside `@layer utilities`, and **unlayered styles
beat every cascade layer regardless of specificity**, so the class won against any `text-[var(--…)]`
set beside it. **62 call sites silently rendered `--paper-dim`.**

The first diagnosis here said "same specificity, defined later" and proposed `:where(.label-mono)`.
That was wrong, and trying it proved it: `:where()` drops specificity to zero but changes nothing
about layer order, and the chip still measured 1.14 : 1. The fix that works is moving `.label-mono`
and `.eyebrow` into `@layer base`, which loses to `utilities` by layer order. Recorded because the
same trap applies to every custom class in this file.

Most are harmless — they ask for `--paper-faint` and get `--paper-dim`, which is darker text becoming
lighter, so contrast improves. Two are not harmless:

| Where | Code asks for | Actually renders | Contrast |
|---|---|---|---|
| Active filter chip, `components/Dashboard.tsx:113` | `--ink` on `--gold` | `--paper-dim` on `--gold` | **1.14 : 1** |
| Active chip, `app/[locale]/votaciones/page.tsx:76` | `--ink` on `--gold` | `--paper-dim` on `--gold` | **1.14 : 1** |
| Reset button, `components/Dashboard.tsx:145` | `--red` | `--paper-dim` | n/a |

1.14 : 1 is invisible. The currently-selected filter — the one control that tells the reader what
they are looking at — is the least readable text on the page. Confirmed by reading
`getComputedStyle` on the live elements on both routes, not inferred from the source.

**Applied.** `.label-mono` and `.eyebrow` now live in `@layer base`. Verified in the browser: a
probe element with `label-mono text-[var(--ink)]` computes `rgb(16, 14, 10)`, and the active chip
measures 8.30 : 1 on both filtered routes.

Still unlayered and carrying the same latent trap: `.display`, `.mono`, `.src`, `.panel`. None has a
measured casualty today — `.display` sets `line-height: 0.95` and the one page using `leading-[…]`
asks for 0.95 as well — but a future `leading-` or `text-` utility on them will be ignored.

### 🔴 D2 — `--paper-faint` fails WCAG AA for body text

`--paper-faint` `#6f6857` on `--ink` `#100e0a` is **3.48 : 1**. AA needs 4.5 : 1 for normal text and
3.0 : 1 for large. It is used 80 times, of which **21 render at that ratio for real** — the other 43
are masked by D1 and would start failing the moment D1 is fixed. Several are `text-xs` and
`text-sm`, well inside "normal text".

| Token | On `--ink` | AA normal | AA large |
|---|---|---|---|
| `--paper` | 14.99 | pass | pass |
| `--paper-dim` | 7.27 | pass | pass |
| **`--paper-faint`** | **3.48** | **fail** | pass |
| `--gold` | 8.30 | pass | pass |
| `--gold-bright` | 11.91 | pass | pass |
| `--red` | 4.70 | pass | pass |

**Applied.** `--paper-faint` is now `#8a8270`, **5.06 : 1**, same warm-grey family. Shipped in the
same change as D1, which was necessary: fixing D1 alone would have newly exposed the 43 masked
elements to the failing value.

### 🔴 D3 — reduced motion is declared but not honoured

`@media (prefers-reduced-motion: reduce)` in `globals.css` disables `scroll-behavior` and nothing
else. Four components animate with `motion`, and none consult `useReducedMotion()`. A reader who has
asked their OS for less motion still gets every fade-and-rise entrance.

This is also visible as a plain rendering problem: capturing the portal 1.2 s after load caught the
`<h1>` at `opacity: 0.058` and the lead paragraph at `opacity: 0`, i.e. a screen that is blank where
the headline should be. On a slow device that window is longer.

**Fix.** A shared `useReducedMotion()` check in the four animating components, collapsing entrance
variants to their final state. And cap the stagger: entrance delays currently scale with index.

### 🟡 D4 — the directory is 98 % initials

`data/photos.json` holds **133 portraits against 6,670 register rows: 2.0 % coverage**. The
politician directory — the largest section of the site, and the one users will spend most time in —
is therefore a grid of coloured initials. That is the honest fallback and the licence rule behind it
is right, but it means the most visual page has almost no imagery.

**Fix.** Not more scraping under looser rules — the exact-name-match and licence gates stay. Instead
make the initials tile a designed object rather than a placeholder: party colour as a field, the
person's role and chamber as typographic furniture, a consistent duotone treatment so a page of them
reads as a deliberate grid rather than a page of missing images. And put the coverage figure on the
page, because "133 of 6,670 have a freely-licensed portrait" is itself a fact about the commons.

### 🟡 D5 — touch targets

34 interactive elements measure under 44 px tall at 375 px wide: the "Menú" button at 31 px, filter
chips at 34–35 px, year chips at 34 px. They clear WCAG 2.2's AA minimum (2.5.8, 24 × 24 px) but sit
under the 44 px in platform guidance and WCAG 2.5.5.

**Fix.** `py-2.5` on the chips and a 44 px minimum on the menu button. Cheap.

### 🟢 What is already right

- **No horizontal page scroll at 375 px.** The wide foundations table scrolls inside its own
  `overflow-x-auto` box, which is the correct pattern and is often got wrong.
- The palette is disciplined: one accent, one alert colour, three text weights.
- `.section-tick`, `.eyebrow` and the panel gradient give sections rhythm without boxes everywhere.
- Portrait attribution is rendered wherever a photo appears — a licence obligation met in the UI.
- Locale lives in the URL and the toggle is always reachable.

---

## 2b. WCAG 2.1 AA audit — full pass, 2026-09-01

Nine route/locale combinations tested in the running app: structure and naming parsed from the
served HTML, contrast and focus measured with `getComputedStyle` on live elements, keyboard
behaviour driven with real key events, reflow tested at 320 CSS px. Ratios below are computed from
the actual rendered colours, including alpha compositing against the page background.

**Issues found: 8 · Critical 2 · Major 3 · Minor 3.** P1, P2 and P3 were fixed on 2026-09-01 and
re-verified; P4 was found by the verification sweep that followed P1 and P2.

**On P3's fix.** `--line-strong` was doing two jobs: the boundary of interactive controls and
decorative rules and hover states. Raising it wholesale would have thickened panel edges and card
hovers that are not UI boundaries at all. Instead there is now a separate `--line-control` token at
`rgba(236, 226, 205, 0.4)` — **3.22 : 1** over `--ink` — used on the filter and year chips, the party
facet chips, both search fields and the mobile menu button. `--line` and `--line-strong` keep the
decorative work. Verified across the three filtered routes: every interactive control measures
≥ 3 : 1, worst case 3.22, and the active states sit at 8.30 on the gold border.

### Perceivable

| # | Issue | Criterion | Severity | Fix |
|---|---|---|---|---|
| P1 | ~~Active filter chip renders `--paper-dim` on `--gold` at **1.14 : 1**~~ **FIXED 2026-09-01** — now `--ink` on `--gold` at **8.30 : 1** | 1.4.3 Contrast | 🔴 Critical | done |
| P2 | ~~`--paper-faint` `#6f6857` is **3.48 : 1**~~ **FIXED 2026-09-01** — token is now `#8a8270`, **5.06 : 1** | 1.4.3 Contrast | 🔴 Critical | done |
| P3 | ~~Chips have no boundary other than a 1 px `--line-strong` border at **1.77 : 1**~~ **FIXED 2026-09-01** — a new `--line-control` token at **3.22 : 1** carries every interactive boundary | 1.4.11 Non-text contrast | 🟡 Major | done |

| P4 | Avatar initials use the party's brand colour as text on `--ink-3`. Three party colours fall under 4.5 : 1 at 16.3 px: `#8b5cc4` (3.61), `#d64545` (3.92), `#c7527f` (4.04) | 1.4.3 Contrast | 🟢 Minor | Borderline — see below |

**On P4.** The initials carry `aria-hidden="true"` and sit immediately beside the person's name, so
they are redundant decoration rather than content, which is the case for treating them as incidental
text under 1.4.3. It is a defensible exemption but not a clean one. Fixing it properly is a design
decision and not mine to take: lightening the party colours misrepresents party identity, so the
better options are keeping the brand colour for the ring and tinted field while setting the initials
themselves in `--paper`, or raising the tile background contrast. Left for a decision.

### Operable

| # | Issue | Criterion | Severity | Fix |
|---|---|---|---|---|
| O1 | No skip link on any of the nine routes. The sidebar's six links are repeated before `<main>` on every page | 2.4.1 Bypass Blocks | 🟡 Major | A visually-hidden "skip to content" link that reveals on focus, targeting `<main>` |
| O2 | **Escape does not close the mobile menu.** Verified: `aria-expanded` stays `"true"` after Escape. Focus also stays on the trigger when the panel opens | 2.1.2 / 2.4.3 | 🟡 Major | Close on Escape, move focus into the panel on open and back to the trigger on close |
| O3 | 34 interactive elements under 44 × 44 px at 375 px wide (menu button 31 px, chips 34–35 px) | 2.5.5 (AAA) / 2.5.8 AA | 🟢 Minor | Clears the 24 px AA minimum; raise to 44 px anyway |

### Robust

| # | Issue | Criterion | Severity | Fix |
|---|---|---|---|---|
| R1 | All 8 filter chips lack `aria-pressed`, so a screen reader cannot tell which filter is active. Combined with P1, the selected state is unavailable both visually and programmatically | 4.1.2 Name, Role, Value | 🟡 Major | `aria-pressed={isActive}` on every toggle chip |
| R2 | **No live regions anywhere** (0 across all routes). Filtering `/es/financiacion` and searching `/es/politicos` replace the result set with no announcement | 4.1.3 Status Messages | 🟡 Major | `role="status"` on a result-count node: "28 partidos, 300,6 M €" |
| R3 | `<th>` elements carry no `scope` (4 on `/financiacion`, 3 on `/metodologia`); neither table has a `<caption>` | 1.3.1 Info and Relationships | 🟢 Minor | Both tables are simple single-header-row, so association is already programmatically determinable — add `scope="col"` and a caption as good practice, not as a failure fix |

### Passing, and worth keeping

Confirmed rather than assumed:

- **`lang` is correct per locale** — `es`, `en`, `ca` all served correctly (3.1.1).
- **One `<h1>` per route, no skipped heading levels** on any of the nine (1.3.1, 2.4.6).
- **`<main>`, `<nav>`, `<footer>` present on every route** (1.3.1). No `<header>` element, which is fine — the sidebar is the nav.
- **Every image has `alt`; every link and button has an accessible name; every input is labelled.** The search field carries `aria-label="Buscar"` plus a descriptive placeholder (1.1.1, 2.4.4, 3.3.2, 4.1.2).
- **Focus is visible under real keyboard use** — `:focus-visible` matches on Tab and the browser draws its default ring (2.4.7). Note the caveat: there is **not one `:focus` rule in the site's CSS**, so the indicator is entirely the user agent's. On this near-black ground it should be designed rather than inherited, but it is not a failure today.
- **Reflow passes at 320 CSS px** — no horizontal page scroll; the wide foundations table scrolls inside its own box; the only overflowing elements are `truncate` ellipses, which is intended (1.4.10, and 1.4.4 follows).
- **The mobile menu button sets `aria-expanded` correctly**, false → true on open (4.1.2).
- **Portrait attribution and licence are rendered wherever a photo appears**, which is both a licence obligation and useful non-text context.

### Not tested here

Automated and scripted checks catch perhaps a third of real barriers. Still outstanding: a pass with
an actual screen reader (NVDA or VoiceOver) over the politician profile and the votes page, where the
per-group ballot cards carry meaning through layout; and a check of whether the vote result colours
are distinguishable without colour vision (1.4.1 Use of Colour) — the group cards use red/gold/paper
to distinguish Sí, No and abstention, and whether the text label alone is sufficient needs a human
looking at it.

### Priority

1. **P1 + P2** — one selector change and one token value. Fixes the invisible active control and the
   failing text colour, and P2 must land with P1 or 43 elements newly break.
2. **R1 + R2 + O2** — the filter chips and the mobile menu. These are the site's only stateful
   controls and all three defects sit on them.
3. **O1, P3, O3, R3** — skip link, control boundaries, target size, table semantics.

## 3. Visual hierarchy

**What draws the eye first** on the portal: the serif `<h1>`, correctly — once it has finished
animating in.

**What draws it second:** nothing in particular, and that is the problem. The headline figures
(€300.6 M public, €2.1 M private) are set as text in a `<dl>` at roughly body scale. The single most
important comparison on the site — two orders of magnitude between public and private money — is
carried entirely by the reader parsing two numerals. It should be the first *shape* they see.

**Reading flow** is a single column of stacked sections at a consistent rhythm. It is calm and it
works, but every section has the same visual weight, so nothing signals "this is the finding" versus
"this is context". The pages read like a well-set report and not like a story with a lede.

---

## 4. The plan: making it visual

Ordered so that each step ships on its own. Steps 0–2 are corrective; 3 onward add.

### Step 0 — clear the WCAG audit in §2b

Not visual work, but everything below inherits the colour system and the control patterns, so it
goes first. Take it in the priority order at the end of §2b. It is measurable: re-run the contrast
table and confirm every token pairing passes AA, confirm the active chip reads `--ink` on `--gold`
(8.30 : 1), confirm Escape closes the menu, and confirm a result-count status node exists on both
filtered pages.

### Step 1 — a charting primitive, not a charting library

The plan in `PLAN-CONTEXT-LAYER.md` already settled this: stay hand-rolled, add `d3-scale` /
`d3-shape` only if a real need appears, no charting framework. What is missing is the shared piece
every chart needs. Build `components/chart/` with:

- `Frame` — viewBox, responsive sizing, axis rules in `--line`, the site's type scale for ticks.
- `Bars`, `Line`, `Dots` — thin wrappers over `<rect>`, `<path>`, `<circle>`.
- `Marker` — a labelled reference line, since almost every chart here needs one (the SMI, the median,
  the national mean).
- `SourceLine` — the citation strip already used in prose, as a chart footer.
- `DataTable` — every chart renders an accessible table alongside, toggleable. This is civic data;
  a chart that only works visually excludes people.

Server-rendered SVG, no client JS unless a chart is interactive. This matches the existing pages,
which are static, and it keeps the bundle where it is.

### Step 2 — replace the `div`-width bars with real bars

The 27 + 27 existing percentage-width divs become `Bars`. Same look, but they gain axes, ticks,
labels and a table, and they stop being invisible to a screen reader.

### Step 3 — give each page one lead visual

The rule: **every page opens with one image that carries its finding**, then prose supports it.

| Route | Lead visual | What it shows |
|---|---|---|
| `/` portal | Public vs private money at true scale, one axis | The 140× gap, as a shape |
| `/financiacion` | Sankey: state → party → linked foundation | The route the money takes, which nobody else renders |
| `/politicos` | Salary distribution strip with the register plotted on it | Where public pay sits, before you search |
| `/politico/[slug]` | The person's ballots as a compact grid + their pay against the register's distribution | Currently zero visuals on a page that is entirely about one person |
| `/party/[nif]` | Stacked money over time in the party's own colour | Currently two bars |
| `/votaciones` | Group-by-vote matrix | The juxtaposition grid from the context-layer plan |
| `/metodologia` | Coverage bars: what fraction of each dataset is actually populated | Turns the honesty section into something you can see |

That last one deserves emphasis. The site's strongest quality is that it states its gaps. Right now
those gaps are prose. **A coverage chart — 133 of 6,670 portraits, 268 of 6,670 with a roll-call
record, 4,964 of 6,670 with a published salary, 2 of N donation years — makes the honesty visible**,
and no comparable site does that.

### Step 4 — the context layer's charts

`PLAN-CONTEXT-LAYER.md` §6 already specifies ten. Build them on the Step 1 primitives, in its order:
wage ladder, SMI-multiples histogram, housing map, indexed divergence lines.

### Step 5 — motion that means something

Once D3 is fixed, spend the motion budget where it carries information rather than on entrances:
bars growing from zero on first view, the count-up on figures that are already there, a marker line
sliding when a filter changes. Everything gated on `useReducedMotion()`.

---

## 5. Priority

1. **D1 + D2** — an invisible active filter and a failing text token, both one-line fixes to a token
   and a selector. Highest ratio of harm removed to effort.
2. **Step 1 + Step 2** — the chart primitives, then convert what already exists. Nothing new is
   claimed; the existing bars simply become real, accessible, labelled charts.
3. **Step 3, starting with `/metodologia` and `/politico/[slug]`** — the coverage chart because it is
   unique to this project, and the profile page because it is the page with the most words and the
   fewest pictures.

D4 and D5 ride along with Step 3.
