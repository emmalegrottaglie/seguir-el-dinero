# Changelog

Record of what changed, why, and what was deliberately left out. Entries are newest first. New
figures name their source; corrections and gaps are recorded alongside the work, not omitted.

---

## 2026-09-10 — The officeholder join, matched on two conditions rather than on a name

The foundation people layer and the officeholder register were both already
ingested, and stage 3 deliberately left them unjoined. This joins them: the public
offices held by the people who govern the party foundations, on each entity's
dossier.

It is the only join in this project that attaches a **named living private
individual** to a record neither they nor the foundation published, so it was
measured before it was built rather than after.

### What the measurement said

- The register holds **6,670 officeholders resolving to 6,663 folded names**, and
  only **three** of those keys cover genuinely different posts — a collision rate
  of **0.045 %**. Low, and not zero.
- Of the **53** curated board members, **14 match exactly one post**, **39 have no
  row at all** (the ordinary case for a trustee who holds no public office), and
  **0 are ambiguous**.

### Two conditions, both required

**One distinct post per folded name.** `nameKey` is order-independent and
accent-folded, which is what lets "Apellidos, Nombre" meet "Nombre Apellidos". It
is not an identity. A key covering more than one post therefore yields nothing
rather than the first of them.

**The party must agree.** The officeholder's party must be the party the audit
report links the foundation to, or the officeholder must be recorded as
unaffiliated — which is how the register carries government delegates and senior
appointees. This is what turns a name match into evidence: two different people
who happen to share a folded name have no reason at all to share a party with a
foundation neither was matched on.

All fourteen agree, and the agreement is the corroboration: every Fundación Pablo
Iglesias match is PSOE or a PSOE-appointed independent, both Sabino Arana matches
are PNV, and the Concordia y Libertad match is PP. Each pairing was also read by
eye against the board it came from.

### What is not claimed

The office is the office **as the register stated it on its own last-updated
date**, which every tie carries and renders. The register has no per-person date
and no active flag, so a title that has since changed hands is the register's
staleness, presented as such and never as a current fact this site asserts.

And nothing says a person's office and their board seat have anything to do with
each other. They are two public records about one person placed side by side — the
same rule the money and the votes are published under, and the page says so in
those words.

`/fundaciones` states the join's coverage and, more importantly, its refusals: how
many people were not in the register, how many were dropped as ambiguous, and how
many were dropped for party disagreement. A match rate alone would read as a
quality score; the drop conditions are what make the rate mean anything.

### A label that was inventing something

The tie's organisation slot was first filled from the register's
`region`/`municipality` columns, falling back to "Administración General del
Estado" where both were null. That was wrong twice over: the fallback is a label
the register never states, and where the columns *are* populated their meaning
changes with the row type — where a government delegate operates, the constituency
a deputy was elected in, the administration a regional consejera serves. Folding
all of that into one "organisation" meant inventing a fact.

The office title now carries the fact, and the region is a qualifier shown only
when the register gives one. So it reads "Ministro de la Presidencia, Justicia y
Relaciones con las Cortes" and, for the Basque consejera, "CONSEJERA DE DESARROLLO
ECONÓMICO… — País Vasco".

### A latent contrast bug the join would have exposed

`TieLine` set government and public-body ties in raw `--gold`, which is 3.02:1 on
the ground — a fill colour, below AA as 14px text. The contrast audit had passed
`/es/fundacion/fundacion-disenso` only because Disenso has no government tie. This
join creates fourteen of them, so it would have shipped fourteen failures. Fixed to
`--gold-deep`, and the audit now covers the three dossiers that carry them.

### The guard

`npm run check:office-join` fails rather than warns. It checks the assumption the
whole join rests on — that a folded name is nearly always unique in this register,
against a 0.5 % ceiling — plus the things a refreshed export could silently break:
that the `ROLES` literal is still parseable (otherwise the party condition would be
checked against nothing), that no published match links to a slug the register does
not carry, and that the join has not silently stopped matching anything.

It deliberately does **not** re-check the party condition. Doing so would mean
reimplementing `partyNifFor` in JavaScript, because the audit report writes
"Partido Socialista Obrero Español" where the register writes "PSOE" — and a second
copy of that rule would drift from the first. A drifted check is worse than no
check. The first draft of this script did attempt it, compared the two naming
styles by substring, and failed all ten PSOE and PNV matches; that is exactly the
drift the rule now avoids.

**Verified.** Typecheck clean, build clean at 231 pages, the guard passes, all three
tie links resolve to a real person page, all three locales render the dossiers, and
**0 contrast failures across 18 routes** — the thirteen from the redesign plus the
three foundation dossiers that now carry government ties and the two other locales
of the index.

---

## 2026-09-09 — The light newsprint redesign, a sourced territorial map, and a typed court record

The design handoff replaces the dark "dossier" system with a light newsprint one. The route
structure, the data layer and the honesty rules stay as they were; the shell, the palette, the type
and three screens are new.

### The shell

The 224px sidebar rail is gone, replaced by a 6px ink bar, a masthead row and a tab nav. The rail
put six links before the content on every page and spent a fifth of the viewport on navigation. A
masthead gives that width back to the data, and reads as what this is — an edition of a document,
not an application.

Fonts drop from three to two. **Cormorant Garamond** carries every heading, kicker, tab and display
figure; **Lora** carries body, meta and table amounts. The third face was a monospace loaded only to
get tabular figures, which both of these provide, so `.mono` is now the body face with
`font-variant-numeric: tabular-nums` — which is what nearly every call site was using it for.

The masthead dateline is formatted on the server from the request date, in `Europe/Madrid`. A
client-side date would either mismatch at hydration or be absent from the HTML; the layout carries
`revalidate = 3600` so the shell refreshes on the same cadence as the pages inside it.

### Two corrections to the handoff's own contrast table

Both were found by measuring rather than by reading, and both matter:

- **`#605d5d`** — the lightest permitted text colour — is stated as 7.0:1 on the ground and measures
  **5.83:1**. It still clears WCAG AA at the 10.5–12px it is used at, so nothing changed except the
  comment: no decision here should rest on the stated figure.
- **Verdigris `#2f7d70`** is stated to pass AA and measures **4.38:1**, which fails the 4.5:1 normal
  text needs — and it was specified for 10.5px organisation names and stance tags. It is now a
  graphic colour only (bar segments, dots, borders, the live-data dot), exactly as the design already
  rules for gold, and every verdigris *text* use takes a new `--verd-text` at **5.28:1** on the
  ground and **4.87:1** on the surface, so it passes on both grounds the site paints.

The same split now applies to gold, which the design states and then breaks in a few places:
`--gold` at 3.02:1 is a fill and a border, `--gold-deep` at 5.97:1 is text. The one exception is the
display italics — the masthead wordmark and the `h1` emphasis spans — which run at 32px and up,
where WCAG's large-text threshold puts the bar at 3:1 and `#b68235` passes as designed.

**Verified across every page**: an audit resolving each element's inline colour against the tokens
in `app/globals.css` reports **0 failures on all 13 routes** (three locales of the portada, plus
funding, foundations, map, votes, rights, politicians, methodology, two party pages and a foundation
dossier). It found 34 that the in-browser pass had missed, in components whose accent is chosen at
runtime rather than written as a class.

One of those fixes exposed a second defect. The donations legend on a party page drew its swatches
as a "■" character coloured with the bar's own token; darkening it for contrast fixed the ratio and
broke what a legend is for, because the swatch no longer matched the segment it labelled. It is now
an `aria-hidden` span block reading from the same array as the bar, which is the pattern the rest of
the site already uses, and the two cannot drift apart.

Also fixed while there: the grant tag's border was `` `1px solid ${token}44` ``, which concatenates a
hex alpha suffix onto a `var()` reference and yields `var(--gold)44` — not a colour, so the border
had been silently falling back to `currentColor`.

### /financiacion holds three channels, and the foundations moved

The page is now the stat strip, a donut of declared electoral spending by formation, the report's own
spending lines, the 2020 donations table by tranche, and the subsidy dashboard as the baseline the
others sit against.

**The foundation channel moved to `/fundaciones`.** The two were answering different questions from
different statutes — parties may take no corporate money at all, their foundations may take it under
*disposición adicional séptima* — and folding the second into the first made the funding page read as
one ranked list of everything, which is what made it uninformative in the first place.

The donut's arcs are explicit SVG paths rather than a stroked circle with a dash offset. A dashed
stroke needs the circumference to divide evenly and offsets every segment from one origin, which
puts the rounding error at the last arc, visible as a hairline gap where the ring should close.

The three spending lines partition declared ordinary spending exactly, so their percentages add to
100 %. Mailings do not belong to that total at all — they are accounted separately, outside the
general cap — so the fourth row runs full width against a note rather than taking a share of a
denominator it is not part of.

### /mapa — two layers, not the five designed

The other three layers came with sample values, and are not here. An LGBTI rights index, the state of
trans-law reform, and vote share for the parties that voted against the tracked bills have **no
citable per-community source**, and a plausible-looking number on a map is read as a measurement.

So is the hatch overlay marking investitures that depended on Vox, which is the most interesting
thing the government layer could carry. Five PP presidencies were invested with its votes in July
2023 and Vox then left three of those governments in July 2024, so one static overlay would be false
for part of the period it appeared to describe — and at least one arrangement has changed again
since. It needs each parliament's own investiture record, which is its own verification pass. The
page says all of this, rather than leaving the absence to be noticed.

What the two shipped layers do have behind them:

- **`scripts/extract-hate-territory.py`** reads the Ministerio del Interior's 2024 report — section
  2.2 for the rate per 100,000 inhabitants and annex 7.1 for counts by community and motivation. It
  aborts rather than warning. Every row must reconcile against its own printed total; the whole table
  must reconcile against the national figure already in `lib/hate-context.ts`; and **both motivation
  columns the site publishes must reconcile against their own national figures.**

  That last guard is the one that proves the columns are aligned. Fourteen integers on a line are
  positional, and a single-column shift would leave every row summing correctly while attributing
  racism figures to orientation. It caught a real defect on the first run: the document carries four
  tables of identical shape (*hechos conocidos* and *victimizaciones*, each by community and by
  province, then again for *detenidos* and *esclarecidos*), so a whole-document scan matched all of
  them and kept the last — reconciling to 1,405 against a national total of 1,955. Scoped to annex
  7.1, it reconciles exactly: 1,955, of which one incident is recorded in no territory, which is why
  the orientation column sums to 527 against a national 528.

- **`lib/governments.ts`** carries the presidency of each of the 19 territories with the date it was
  taken. Curated and dated, because a table without dates cannot be checked and goes stale quietly:
  the Valencian presidency changed hands in December 2025 within the same legislature and the same
  party, which a partyless snapshot would have hidden.

**What the figures are, precisely**, and the page says so: *hechos conocidos* are facts reported to
and recorded by the security forces — including administrative infractions — not convictions and not
incidence. The two communities with their own police forces (Policía Foral de Navarra, Ertzaintza)
head the rate table, which says something about how incidents are recorded and not necessarily about
where more of them happen.

`scripts/build-regions.mjs` projects the geometry once at build time rather than loading d3 and
topojson in the browser to compute a result that never changes. Ceuta and Melilla are about 19 km²
each and project to a couple of pixels, so the script also emits a centroid and a projected-area
flag, and the component draws a minimum-size marker for anything below the threshold — otherwise two
territories are on the map but cannot be seen, hovered or clicked. The threshold is on rendered area,
so it decides which territories need one rather than naming the two; it picked out exactly 18 and 19.
Melilla's centroid sits 8 units from the bottom of the viewBox, so its label flips above the marker
when there is no room beneath, which there is not.

The choropleth ramp uses CSS `color-mix(in oklab, …)` rather than a colour library. Mixing in a
perceptual space is the whole reason `d3.interpolateLab` was specified for it, the browser does that
natively now, and sampling from 0.16 rather than 0 keeps the lightest step reading as a fill instead
of as empty ground.

Every value is also a row in a table below the map. That is not a fallback: a choropleth cannot be
read to the precision of a number, and nineteen figures are worth having.

### The money→party→vote flow, on /votaciones

Ribbon thickness is the amount declared in 2020; the column it lands in is how that party's group
voted in 2026. The caveat saying the two are independent public registers of different years, and
that neither explains the other, sits **beside** the chart rather than under it.

Only parties whose group maps to them one-to-one appear. A party inside a composite group has no
stance of its own in the record, and handing it the group's majority would be the inference this
project refuses everywhere else — so those parties are **named as excluded** instead of dropped. Each
outcome node is exactly as tall as the ribbons it receives, so the two columns reconcile without a
second scale: verified at 399 units on both sides, 6 formations in and 6 named out.

That rule now lives once, as `stancesByParty()` in `lib/votes.ts`, and the party ficha uses it too.

### The court record, as a type rather than as copy

`lib/court-records.ts` holds the four resolutions that survived the three-verifier panel in
`research/hate-accountability.md` at 3-0. The status label is the whole point of the component, so it
is a union type and not a string, which makes four specific mistakes unrepresentable:

- an archived case is `archived`, **never "acquitted"** — both decisions in the *menas* matter are
  autos confirming *sobreseimiento* at the instruction stage, a finding of no *indicios*, never a
  merits judgment;
- an open case is `awaiting-trial`, and an *auto de apertura de juicio oral* cannot read as a verdict
  because no status in the union would let it;
- an electoral board's order is `advertising-infringement` and nothing more, because the Junta
  Electoral de Zona de Madrid expressly declared itself not competent over the content and opened no
  sanctioning file;
- a complaint *against* someone is `complaint-archived`, and the record says whose conduct it
  concerns: Vox's *querella* against Ione Belarra documents a complaint against her, never conduct by
  her.

The copy is translated in three languages; the tag is not, so no translation can turn an archiving
into an acquittal. A party with nothing on file gets an explicit card saying so and saying what that
does and does not mean — rendering nothing would read as a clean record, and rendering "0" would
invite a comparison four hand-verified records cannot support.

**On publishing a live prosecution by name.** The Herrero record processes a living person's
criminal-proceedings data, which engages art. 10 LOPDGDD and LO 1/1982. It is published because she
is an elected officeholder, the opening order was reported by five outlets across the political
spectrum, and the label states its procedural stage and nothing beyond it. That is a different thing
from the per-politician conviction tag this project declined to build, which would have required
attributing findings to people from records that are pseudonymised at source.

### The party ficha

A formation switcher, taking whichever parties carry a declared-donations record rather than the
design's fixed five, so the row cannot list a party whose page is empty nor omit one that appears
when the next audit lands. The active tab is underlined in the party's **own** colour, because the
reader is inside one party's dossier and the accent should say which.

Below the money: how the group voted on each tracked division, and the court record for that party.

The two kinds of gap are now distinguished, which matters more than it sounds. Sumar leads the Grupo
Plurinacional SUMAR, which also holds IU, Comuns, Más Madrid and Compromís, so the group has a
majority but it is not Sumar-the-party's own — attributing it to Sumar's NIF and not to IU's would be
arbitrary. That reads **"En grupo compartido · Sumar"**. A party that was not in the chamber at all
reads **"Sin representación"**. A single label for both would have said something false about one of
them: Sumar's six XV divisions are the first case and its three XIV ones the second.

`sharedGroupFor()` matches on `shortName` from the party registry against the labels in a composite
group's `parties`, exactly and case-sensitively. Those labels are written to be the registry's own
short names, so this is a lookup rather than a guess, and a label that stops matching produces no
group instead of the wrong one.

### The portada

A ticker of the six figures the site rests on; the lead, which is the one finding a reader cannot get
elsewhere; the organisations' own voices beside it; the three public registers summarised; then three
columns of detail.

**Every figure comes from the data layer.** The prototype hardcoded them, which is right for a
prototype and would rot here within one refresh. Computed rather than transcribed, they land on the
design's verified values exactly: subsidies 300,6 M€, donations 2,07 M€, electoral 18,43 M€, 9
divisions, 12 donors above €10,000, the residual at 54,5 % of €10,052,187.82, and the donor/money
tranche split at 91,6 / 8,2 / 0,2 % against 33,3 / 57,4 / 9,3 %.

The lead's ghost numeral is **truncated, not rounded**: the share is 54.5 %, and rounding it to 55
would put a numeral on the page contradicting the 54,5 % in the standfirst two inches below it.

The reportage column's single-cheque headline reads €23,000 from the data, not from the copy: where a
party's top tranche holds exactly one donor, its total *is* that gift, and that is the only
individual figure the report permits without inventing anything.

Both image slots are hatched placeholders awaiting licensed imagery. A placeholder that looked like a
photograph would be a claim about something that was never photographed.

### Bugs fixed along the way

- **`data/votes.json` stores dates as `D/M/YYYY`.** `formatDate` threw `RangeError: Invalid time
  value` on them, and picking "the most recent division" by string comparison put 25/6/2026 before
  27/11/2025. `lib/votes.ts` now owns `voteDateISO()` and `newestFirst()`.
- **Every face on every party page was a 404**: they linked to `/politician/${slug}` and the route is
  `/politico/[slug]`.
- `lib/groups.ts` still returned `var(--paper-faint)` for a composite group's swatch — a token the new
  sheet does not define. The token sweep had walked `app/` and `components/` but not `lib/`; its guard
  now covers all three.
- `RightsMap` is a client component, so importing `lib/regions.ts` pulled `node:fs` into the browser
  bundle. The curated presidency data moved to `lib/governments.ts`, which is free of Node imports,
  and `lib/regions.ts` keeps the file loaders and types.
- Passing the whole `Dict` to `RightsMap` failed at prerender: `Dict` carries functions
  (`news.hoursAgo` among them) and a function cannot cross the server-to-client boundary. It takes
  `Dict["map"]`.

### New helpers

`lib/format.ts` gains `cssPercent()`, because a localised percentage is not a parseable CSS length —
`es-ES` renders 0.545 as "54,5" and a bar given `width: 54,5%` collapses silently rather than
erroring, so display formatting and layout formatting never share a helper. And `rate()`, because
`toLocaleString` drops a trailing zero and turned the report's published 14,00 into 14.

### Left out, deliberately

- The design handoff bundle itself is gitignored. It is an input rather than product, and it carries
  a third-party streaming-template runtime the handoff says not to port.
- Three map layers and the Vox-investiture hatch, above.
- A small-phone layout. The flow diagram in particular needs a rethink below ~600px — probably a
  sorted list rather than ribbons.

**Verified.** Typecheck clean; build clean at **231 pages**; the extractor reconciles to the national
total and both published motivation columns; the flow diagram's columns balance at 399 units;
**0 contrast failures across 13 routes**; the map's marker threshold selects exactly Ceuta and
Melilla; and all three locales render every new screen.

---

## 2026-09-08 — A rights section in the organisations' own voices, images, and a cooler accent

Three things: article images where the feeds publish them, a dedicated LGBTQ+ rights section built on
the eight NGO feeds already in the registry, and a polish pass on the palette and cards.

### The rights section

`/derechos` — new, and the ordering is the argument. The eight organisations in
`lib/news-sources.mjs` come first under their own names, the three outlets follow in a separate
block, and a directory at the bottom links every channel so a reader can go to the source rather
than only to whatever it published this fortnight. Every other page on this site reports on the
state; this one carries what the organisations publish about themselves.

**Server-rendered, unlike the portal's `NewsFeed`.** A section that exists to give these
organisations a platform should not be the one part of the site that needs JavaScript to appear. All
three locales ship 24 cards in the HTML.

Feeds that fail are named on the page. The methodology page already lists the seven that were tested
and rejected; this reports the ones that broke on this load.

### Images, proxied rather than hotlinked

`lib/news.ts` now extracts a lead image per entry, trying candidates in descending order of how
deliberate they are: `<enclosure type="image/*">`, then `<media:content medium="image">`, then
`<media:thumbnail>`, and only last the first `<img>` in the entry body — which may equally be a
tracking pixel or a share badge. Anything that is not plainly an `http(s)` image URL is dropped, and
obvious trackers (`1x1`, `pixel.`, `/track`, `spacer.gif`) are skipped.

**New `app/api/news-image/route.ts` serves them through this origin.** Rendering `<img src>` at the
publisher would hand every reader's IP address, user agent and referring page to fifteen third-party
hosts. Several belong to LGBTQ+ organisations, and who reads them is precisely what should not leak;
the same holds for the housing and poverty feeds. Proxying also makes the images survive publishers
that block hotlinking — a broken image on every card is worse than no images.

The allowlist is the other half. An open image proxy is a server-side request forgery tool, so only
hosts vouched for by the registry are fetched — plus their subdomains, since WordPress sites serve
from CDN shards, and the `www.`/bare counterpart, which is what makes `shangay.com` resolve against
the registry's `www.shangay.com`. Only responses declaring `image/*` are returned, capped at 4 MB,
with `X-Content-Type-Options: nosniff` and a `sandbox` CSP because the bytes are someone else's.

Verified by request: a registry host returns `200 image/jpeg`; a foreign host `403`; the cloud
metadata address `169.254.169.254` `403`; a missing `url` `400`. On the page, 18 of 18 images load
and none break, and the server HTML contains **zero** hotlinked `src`.

`NewsFeed` gets the same images as a small thumbnail rather than full-width media, because it sits in
a narrow column beside other panels where a 16:9 image per row would push the headlines out of it.

### Palette and cards

The palette was gold and red on brown throughout, which made every accent read as the same kind of
emphasis. A verdigris counter-accent now carries the organisations' own voice — the NGO feeds, the
rights section — without leaving the aged-document world the rest of the site lives in. Measured on
`--ink`: `--verd` **7.76:1**, `--verd-bright` **11.57:1**, both clear of WCAG AA's 4.5:1. A source
label is verdigris when it is an organisation and gold when it is an outlet, everywhere it appears,
so provenance is legible before the text is read.

Also: a third cooler light in the page aura and a vignette, so a long page darkens at its edges
instead of ending in a flat field; panels gained an inset highlight along the top edge and a real
shadow; and a new `.card` treatment with a fixed 16:9 media block, a diagonal hatch behind it so a
slow image never reflows the grid, a gradient tint so white-heavy press photography does not punch a
hole in a dark page, and a slight desaturation that pulls photography from fifteen publishers towards
one palette.

Card images carry empty `alt`: the headline immediately below is the accessible name, and a
decorative duplicate would make a screen reader announce the same article twice.

**Verified.** Typecheck clean, build clean at 225 pages (104 → 221 → 225), zero contrast failures on
the new page, images load in the browser and in the server HTML, and all three locales render.

---

## 2026-09-08 — Who governs the party foundations, and how each claim is sourced

The money layer landed earlier today. This is the part it could not answer: report nº 1.642 records
what these entities received and never who runs them. `lib/foundation-people.ts` does, for the
entities that move real money, and every record carries one dated source with its evidentiary status
attached.

**Coverage: a board documented for 5 of the 39 audited entities — 53 people and 18 outside roles.**
Small on purpose. Board membership is published unevenly, and where it could not be established the
dossier says so rather than showing an empty section.

### The rules, enforced in the types

- **One dated source per record**, with a resolvable URL. A record without one does not exist.
- **`SourceKind` drives the rendering.** `registry` and `official` read as statements of record;
  `press` renders as *"según {publisher} ({date})"*. They are never merged or counted together —
  the ODIHR rule this project verified 3-0 in the research: the label must match the evidentiary
  status of its source.
- **Nothing is inferred.** No score, no ranking, no derived edge. A tie exists only where a named
  source states it, and `former: true` where the source puts the role in the past, because a stale
  role shown as current misrepresents a living person.
- **Names join by `nameKey`**, so an ambiguous match is dropped rather than guessed — the same rule
  the portrait and social-handle joins already follow.

### Chasing the primary source overturned three secondary ones

This is the finding of the exercise, and it is why the layer is small rather than broad:

- **Wikipedia lists an eight-member Fundación Disenso board** from 2020. The foundation's own
  transparency filing lists **three**: Santiago Abascal, Enrique Cabanas and Pablo Sáez.
- **A 2017 PSOE announcement** of the Fundación Pablo Iglesias board was the most recent list
  reachable without a bot check. Publishing it would have said **Félix Bolaños is the foundation's
  secretary today** — he is a minister, and the board has changed twice since. The foundation's own
  page (last modified 2026-07-02) gives the real 20-member board.
- **eldiario.es reported in October 2021** that Pablo Iglesias had taken the presidency of Podemos's
  foundation with Juan Carlos Monedero as director. The entity's own patronato page (modified
  2024-04-09) shows **neither of them**, and of the six names in that article only Orencio Osuna
  remains. The press record is kept for the one fact it still evidences: the change of name.

A fourth, smaller trap: a search summary offered a different and larger Podemos board than the
article it was summarising. Only fetched sources are recorded.

### What the boards actually show

- **Fundación Pablo Iglesias (PSOE)** — 20 trustees including **Pedro Sánchez**, **María Jesús
  Montero**, **Félix Bolaños**, Carmen Calvo, Cristina Narbona, Reyes Maroto, Pilar Bernabé, Rebeca
  Torró and César Luena. A foundation that took €451,260 of public subsidies in 2022 is governed by
  a board carrying the Prime Minister and the Finance Minister.
- **Fundación Concordia y Libertad (PP)**, which now trades as **Reformismo 21** — a six-member
  patronato under Pablo Vázquez (former Renfe and Ineco president), with an advisory council chaired
  by **Alberto Núñez Feijóo** and carrying the corporate ties: **Verónica Pascual**, a Telefónica
  board member; **Fátima Báñez**, president of Fundación CEOE and a former minister; **María Eugenia
  Clemente**, chief executive of Alestis Aerospace; plus Román Escolano (former Economy Minister,
  now at the European Investment Bank) and Ramón Gil-Casares.
- **Sabino Arana Fundazioa (PNV)** — nine trustees, and the only entity here publishing an
  appointment date for every one of them, from 2008 to November 2025. It is also the only party
  foundation holding the Haz Foundation's *"t de transparente"* seal. Its board is professionals
  rather than serving politicians, chaired by Arantxa Tapia Otaegi.
- **Fundación Disenso (Vox)** — three trustees, chaired in effect by the party's own president.
- **Fundación Instituto República y Democracia (Podemos)** — five, under José Julio Rodríguez
  Fernández, a retired career officer who was chief of staff to the Second Vice-President between
  January 2020 and March 2021.

### Renames, which the report cannot show

Report nº 1.642 uses the name in force during the audited exercise, and two of these entities have
since renamed themselves — so a reader searching the current name finds nothing, and one of them
appears in the report twice under both names. Both renames are now recorded and printed on the
dossier: **Concordia y Libertad → Reformismo 21 (2023)** and **Instituto 25 de Mayo para la
Democracia → Instituto República y Democracia (2021)**.

### Gaps, printed rather than hidden

`BOARD_GAPS` records the entities whose board could not be established, with the reason. Fundación
Ramón Rubial is the pointed one: no published patronato was found, and it is also the entity with
the most publicity breaches in the report — two agreements with companies, none of them deeded,
notified or published. Apartado Seis of disposición adicional séptima requires these entities to
publish; report 1.642 finds 16 did not publish their 2021 accounts and 14 their 2022 accounts. An
empty section would read as our omission rather than theirs.

### On the page

`components/FoundationGovernance.tsx` sits on each dossier directly under the identity block — who
runs it belongs next to what it is, not beneath the money. Each person shows their role or roles
with the source and date, then their outside roles, with corporate ties in the accent colour and
past roles labelled as past. The channel section carries a short coverage panel stating how much is
documented and pointing at the dossiers, rather than flattening forty boards into one list; its
press-count sentence renders only when the count is above zero, so a zero does not read as a
disclaimer about records that do not exist.

**Verified.** Every one of the 10 entity names in the registry joins to a dossier in
`data/foundations.json`. Typecheck clean, build clean at 221 pages, and `/es/financiacion` plus the
dossiers render with zero contrast failures.

**Deliberately not built.** No network graph and no join to the officeholder register. The register
join is attractive — it would attach an official public post to each trustee from a source the site
already ingests — but a wrong match would attribute someone else's public office to a named private
person, so it needs its own verification pass rather than being folded in here.

---

## 2026-09-08 — The foundation channel, and a title that was overclaiming

`/financiacion` was headed *"¿Quién financia a los partidos?"* and answered a much narrower
question: it showed BDNS state subsidies and nothing else, with a ranked bar chart of 28 parties as
its hero. Emma's read was right — the title overclaimed and the graphic was the least surprising
thing on the page.

**The premise behind the fix turned out to be wrong too, and correcting it is the finding.** The
brief was to document the foundations "who gave money to political parties". Checked against BOE and
the Tribunal de Cuentas: parties may take **no** corporate money at all (LO 8/2007 art. 5 — no
*personas jurídicas*, no anonymous donations, €50,000 a year per individual, and a donor holding a
live public contract must be refused), while their **foundations** fall under *disposición adicional
séptima*, where legal entities **may** donate: over €120,000 by public deed, notified to the
Tribunal within three months, donor identity published.

So the money runs *into* the foundations. And the audited figures say it is mostly not corporate
money either. Across 2021–22, of €7,936,729 in contributions:

- **€7,130,738 (89.8%) came from the parties themselves**
- €368,982 (4.6%) from companies
- €437,009 (5.5%) from individuals
- plus **€4,933,558 of public subsidies** on top

The page leads with party money for that reason. Leading with the corporate line would have been
accurate and misleading at once.

### What the report actually contains

The previous extractor read only ANEXO III and ANEXO IV and produced two numbers per entity. The
body of report nº 1.642 carries **70 per-entity dossiers**, and `scripts/extract-foundations.py` now
reads them: party link, supervising protectorate or *administración competente*, year constituted,
entry in the Registro de Partidos Políticos, contributions split by source with counts, public
subsidies **itemised by granting body**, the balance sheet, the collaboration agreements with their
named counterparties, and the Tribunal's compliance findings verbatim with the article each rests on.

`data/foundations.json` grew from 7.7 KB to 117 KB. New `app/[locale]/fundacion/[slug]/page.tsx`
gives each of the 39 entities its own dossier — 104 pages to 221.

### Three findings the old page could not show

- **The named corporate counterparties.** Fundación BBK paid Fundación Sabino Arana (PNV) €148,750
  in each year, expressly to *"promocionar la imagen corporativa del patrocinador"*, and met all
  three disclosure duties. BBK Fundazioa with **Petronor** (€25,000) and with Grupo Eibar (€30,000)
  paid Fundación Ramón Rubial (PSOE), and Fundación Cajasol paid Fundación Andalucía, Socialismo y
  Democracia (PSOE) €10,000 — **none of those three deeded, notified or published.**
- **The statutory register is nearly empty.** *Disposición adicional cuarta* of LO 6/2002 requires
  these entities to register. At 31/12/2022 only 18 foundations and 3 entities of those audited were
  registered; the extractor's own per-dossier flags independently produce exactly 18.
- **The Tribunal has asked twice.** All seven recommendations repeat those of report nº 1.533 on the
  2020 exercise, approved 28/09/2023. The three addressed to the Government are unmet because the
  LOFPP was never amended; recommendations 4 and 5, addressed to the foundations, are unmet too.

Fundación Disenso (Vox) is the single largest recipient — €2,500,900 in 2021 — and its composition
is the story in miniature: **one transfer of €2,500,000 from Vox itself**, against €900 of corporate
donations. Fundación Concordia y Libertad (PP) is the mirror image: €16,765 private against
**€1,012,408 of public money**, including €655,552 from Exteriores and, itemised in the report,
€23,102 from the Dominican Republic's HIV council and €48,201 from the Global Fund.

### Seven defects the guards caught, and two the guards were extended to catch

The extractor aborts rather than warning, and it earned that four separate times before producing a
figure:

- **A section anchor that matched only one of two wordings.** Foundations head their fifth section
  "RENDICIÓN DE LAS CUENTAS" and associations "RENDICIÓN DE CUENTAS" — 28 and 42 of the seventy.
  Requiring the longer form let the subsidies table run on into the narrative, where dates parsed as
  amounts. Caught on the first entity by the sum guard.
- **The word "Total" matching the table's own header.** The contributions header contains "Total
  aportaciones", which a bare `Total` label matches ahead of the real total row — so every total read
  as zero. Invisible until the first entity that had any money.
- **A page artefact read as a total.** Concordia y Libertad's 2022 row ends `15.235,00 69`, and "the
  last number in the row" is therefore not the total. Amounts are now told from counts by shape: a
  euro figure always carries decimals or a thousands separator, a count carries neither.
- **A copy-paste error in the source.** Asociación Juventudes Navarras's second dossier repeats the
  first one's sentence "las cuentas anuales del ejercicio 2021" while carrying 2022's figures.
  Reading the year from prose left 2022 an entity short and inflated 2021 by exactly the €9,500
  involved. The exercise now comes from the annexes, which state how many entities each year covers,
  and the split is checked against the annex `TOTALES`.
- **The last dossier swallowing the rest of the document** — conclusions, recommendations and
  annexes — so a report-wide finding appeared as one entity's own.
- **A sentence reporting the absence of a breach listed as a breach.** "No se han observado
  incumplimientos" contains the same words as a finding; listing it under *what the Tribunal found*
  inverted the report's meaning. 82 findings fell to 54 once negated statements were excluded.
- **The running page footer quoted inside findings** — "INFORME DE FISCALIZACIÓN APROBADO POR EL
  PLENO… 92" lands mid-sentence in the text layer.

### One error is the report's own, and both figures are published

Report 1.642 states Fundación Pablo Iglesias's 2022 subsidies as **€451,259.86** while its own three
lines sum to **€451,259.66**. That is the source's arithmetic, not a parse failure, so a mismatch of
up to one euro is recorded as a source discrepancy and printed on the dossier with both figures.
Anything larger still aborts, so the tolerance cannot absorb a stolen cell or a dropped row.

### The page

`components/FoundationChannel.tsx` leads with the four sources of money, then the named
counterparties with their disclosure verdict, then all 39 entities, then the register gap and the
repeated recommendations. The order of the page is now foundations → electoral spending → state
subsidies, and **the page owns its own `<h1>`**; `Dashboard` used to, which bound the title to the
least important channel. New `home.subtitle` names which channels are on the page and says that
private donations to the parties themselves are on each party's own page.

`displayName()` title-cases the report's ALL-CAPS entity names for display while the stored name
stays as the report writes it, because that is what joins a figure back to the source. It leaves
mixed-case and elided forms alone, so "Centre d`Estudis" survives.

**Verified.** Extractor: 70 dossiers, both exercises reconciling to the cent against the annex
totals. Typecheck clean, build clean at 221 pages. All three locales render the new order with a
single `h1`, every `<th>` scoped, and **zero contrast failures**; the sparse dossiers show "no
inscrita" and "no consta" as stated absences rather than blanks.

**Still to come:** the curated people-and-ties layer — who sits on these boards and what corporate
and government roles they hold. That is a separate unit and carries its own evidentiary rules.

---

## 2026-09-08 — The stopped research, finished: 18 findings, 10 refutations, and a year-stale figure

The deep-research run stopped on 2026-09-07 with 160 claims extracted and only 10 adversarial votes
cast, so `research/hate-accountability.md` had to lead with "the claims below are UNVERIFIED". It is
now finished: **26 sources, 124 claims, the top 28 each put to a three-vote adversarial panel — 18
confirmed, 10 refuted, none left unadjudicated.** The digest is rewritten around what survived, and
the refutations are printed beside the findings because three of them corrected the digest's own
earlier draft.

**How it was resumed within the rate limit.** `resumeFromRunId` caches each agent on its prompt, not
on the script's claim cap, so the cap could be raised in steps and every vote already cast replayed
free. A jump straight to 40 claims fires 120 verifier agents at once and hits the session limit,
which the harness reports as "unverified" rather than as failure — 138 of 152 agents died that way on
the first attempt. Climbing 14 → 28 in four resumes cost nothing extra and finished clean.

**The harness's own ranking had to be overridden first.** It sorts by importance then source quality,
which put ILGA rubric weightings and portal shapes in the first ten slots and never reached the
statutes that decide whether the feature is buildable. A priority tier was added ahead of that
ranking for claims naming a statute, a court, a prosecutor or a ruling.

### The finding that decides the feature, confirmed 3-0

A per-politician conviction register is not buildable from bulk retrieval, and the mechanism is now
precise rather than asserted. Publication of judgments is a CGPJ statutory duty under **art.
560.1.10ª LOPJ** — but only for resolutions *"que se determinen"*, and **Reglamento 1/2005 art. 7**
conditions treatment and dissemination on data-protection law and **LOPJ arts. 234 and 266**. Three
things follow:

- **CENDOJ pseudonymises by design**, substituting real names with randomly assigned archaic given
  names — Saturnino, Candelaria, Venancio, Eulalia — to avoid collision with real identities in
  judgments carrying up to ~500 names.
- **Coverage is selective exactly where it matters**: the Tribunal Supremo plus *"una selección
  creciente"* of single-judge resolutions, and single-judge courts are where most art. 510 CP
  convictions sit.
- **The one statutory carve-out excludes art. 510.** LOPJ art. 235 bis makes a *fallo*'s personal data
  public only for a closed list of Hacienda Pública offences (CP arts. 305, 305 bis, 306, and 257/258
  where the creditor is the Treasury). Art. 510 is not in it.

Re-identifying a defendant via case number, court and dates is recorded as a legal hazard, not a
workaround. This vindicates the decision already published on `/metodologia` and gives it citable
grounds.

### Three corrections to the digest's own draft

- **Art. 510 scope — refuted 0-3.** The draft said art. 510 protects listed minorities "but not other
  collectives such as political parties" as doctrine. Art. 510.1 CP **expressly lists *ideología***
  among the protected motives, with *aporofobia* added by LO 8/2021, and Circular 7/2019 FGE states
  group vulnerability is **not** an element of the offence and that incitement to hatred against a
  Nazi-ideology collective can fall within it. The Tribunal Supremo auto of 29 July 2021 does hold
  what it holds — it archived Vox's *querella* against Ione Belarra on that ground — but the general
  proposition fails.
- **The *peligro real* bar was backwards — refuted 0-3.** Circular 7/2019 classes art. 510 hate
  offences as ***delitos de peligro abstracto***: *"no es preciso un peligro concreto, siendo
  suficiente el peligro abstracto"*, needing only *"aptitud o idoneidad para generar un clima de
  odio"*. The exception is the result offence in the first part of art. 510.2 a). The phrase comes
  from STS 259/2011, which the Circular reads down.
- **The Herrero charge structure was a misread — refuted 1-2.** The auto pleads **510.1 a) + 510.3 +
  510.5 + 510.6, or alternatively 510.2 a) + 510.3 + 510.5 + 510.6** — mutually exclusive principal
  and subsidiary qualifications, not the joint "510.1 and 510.2" the draft published. The draft also
  dropped the subsections that drive the outcome: 510.3 (diffusion via internet or social media),
  510.5 (*inhabilitación especial*) and 510.6.

Two further refutations killed claims the draft had asserted: that CENDOJ is "the single institutional
retrieval point for named-defendant judgments" (0-3, refuted precisely because it is not a
named-defendant source, and because art. 619 LOPJ *defines* CENDOJ rather than creating it), and that
Reglamento 1/2005 art. 7 makes CENDOJ a comprehensive corpus (0-2 — universal remission is not
universal publication).

### A verifier's aside was wrong, and chasing it found the site a year stale

One agent reported the Interior series at "2,417 incidents, +23.6%", which does not chain from the
2,268 this project published for 2023. Checking it against the ministry produced a real update
instead. The *Informe sobre la evolución de los delitos e incidentes de odio en España (2024)*,
published 28 July 2025, records **1,955 penal infractions and hate incidents, −13.8%**; racism and
xenophobia **804 (−6%)**; sexual orientation and gender identity **528 (+1.15%)**. Antisemitism
+60.9%, aporofobia +33.3%, clearance 71.9%, 905 people arrested or investigated.

Every figure reconciles against the 2023 base — 2,268 × 0.862 = 1,955; 856 × 0.94 = 804; 522 × 1.0115
= 528 — and OBERAXE, a second ministry, publishes the same numbers, which is why the update is here at
all rather than flagged as a lead.

So the 2023 figures were right and the page was a year behind **while pointing the wrong way**: it
showed a 21.35% rise as the state's latest word when the latest word is a 13.8% fall.
`lib/hate-context.ts` now carries 2024 with 2023 kept beside it and the reconciliation written down.

**A latent bug surfaced with it.** `/metodologia` hardcoded a `+` before the year-on-year change, so
the first negative figure would have rendered "+−13,8 %". New `signedPercent()` in `lib/format.ts`
prefixes `+` only for positives and lets the locale supply its own minus sign, which is not always an
ASCII hyphen.

### Figures recovered, and one previously given up on

The three Fiscalía figures the earlier draft dropped as unverifiable are confirmed 3-0, with the panel
checking the arithmetic: for 2024, **477** *diligencias de investigación* (511 in 2023), **293**
*escritos de acusación* (210 in 2023), **173** sentences with **129 convictions and 44 acquittals**,
most prosecuted offence **art. 510.2 a) at 162 vs 85**.

`chargesChangePct: 40` is replaced by a derived `CHARGES_CHANGE_PCT` computed from 293 and 210, so the
published percentage cannot drift from its own counts: **+39.5%**, not the "~40%" of press summaries.
`CONVICTION_RATE_PCT` likewise derives 74.6% where the Memoria prints a truncated 74.5%.

The verifiers flagged a trap now recorded in the code: the motive breakdown differs by stage —
racism/xenophobia is 150 among investigations but 121 among charge sheets, and *nación u origen
nacional* is tracked separately at 127 — so the two sets must never be conflated.

### Corrected on the page: "acquittal"

`MENAS_CASE`'s doc comment described the outcome as an acquittal. Both decisions are autos confirming
*sobreseimiento* at the instruction stage — a finding of no *indicios* — and never merits judgments,
so "acquitted" overstates what any court decided. Fixed, with the distinction written down. Also added
what actually closed the case: the **Tribunal Constitucional declined Podemos's *amparo*** for want of
*especial trascendencia constitucional*, reported 23 January 2023.

### Verified outside the harness

**Art. 10 LOPDGDD** is load-bearing for the published methodology text and the harness never
adjudicated it — its only source was rated unreliable and yielded no claims. Checked directly against
the BOE consolidated text of LO 3/2018 (last modified 27/12/2025), the page's claim holds, and the
chain is three paragraphs: **10.1** permits processing conviction data for non-law-enforcement
purposes only where covered by a norm of statutory rank; **10.2** routes the *registro completo*
through the *Sistema de registros administrativos de apoyo a la Administración de Justicia*; **10.3**
allows it outside those cases **only for *abogados* and *procuradores***, and only for information
supplied by their own clients.

### Left as gaps rather than filled

- **Angle 1 produced no surviving claim.** The harness's own synthesis says to treat party-spending
  granularity as *not researched* rather than answered negatively. It was answered in code instead, by
  the report 1.628 extraction shipped the day before — which is also where the digest's claim about
  the eight LOREG art. 130 categories was corrected.
- **STC 58/2018 was in the claim pool but below the cap**, so it remains a lead. The methodology page
  cites it; the digest says so and says to verify it against the primary ruling.
- **The *menas* auto's roll number is still unpinned** and all its verification is secondary press, so
  the digest records that the primary text must be pulled before the case reference itself is
  published. An earlier AP Madrid resolution on the same matter is reported, so more than one auto may
  exist.
- **JEZ acuerdos are published in no machine-readable register**, so secondary reporting is the
  practical ceiling for the most promising name-bearing channel found.

### Also recorded

`research/README.md` explains how to read a vote, and that a refuted claim was adjudicated against on
its merits — which is different from one never adjudicated. `_research-hate-accountability-claims.json`
now carries the findings, caveats and open questions alongside the claims and all 101 votes, with a
note that its claim list is the union across resume attempts while `stats` describes the final run.

Verified: typecheck clean, production build clean, and `/metodologia` renders the negative change
correctly in all three locales — `1955 · -13,8 %` (es), `1,955 · -13.8 %` (en), `1.955 · -13,8 %` (ca),
the grouping difference being CLDR's `minimumGroupingDigits` and not a defect.

---

## 2026-09-07 — What the electoral money was declared to have bought

The site could show which parties received public money and never what it purchased. This is the
first answer, and part of the answer is that the record does not say.

**New `scripts/extract-electoral-spending.py`** extracts Tribunal de Cuentas report nº 1.628 — the
fiscalización of the 9 June 2024 European Parliament election accounts, approved 26/06/2025 — into
`data/electoral-spending.json`, rendered by `components/ElectoralSpending.tsx` on `/financiacion`.
`npm run build:spending -- path/to/I1628.pdf`.

**Across the eight formations audited: €18,433,012.62 of declared ordinary spending.** €6,808,676.26
of it (36.9%) is the two advertising categories the law caps — outdoor under LOREG art. 55 and press
and radio under art. 58. **€10,052,187.82 (54.5%) is a single residual line, "Otros gastos
ordinarios", which the report does not break down.** Propaganda mailings are accounted separately at
€19,307,864.75 across 30.9 million items. No formation exceeded a spending cap.

Per formation the residual runs from 0% for Coalición por una Europa Solidaria, whose entire declared
spend is the two advertising lines, to 87.0% for Sumar, with PP at 47.5% and PSOE at 58.8%.

**This corrects the research digest.** It recorded the eight lettered categories of LOREG art. 130 as
the itemisation to expect. Those are the legal definition of *gasto electoral*, but the fiscalización
reports against something else: the two advertising caps, mailings, financial costs, and the
residual. `research/hate-accountability.md` §1 should be read with that correction.

**Verification is the report's own arithmetic, and it earned its keep.** The report prints
`F = A + B - C - D + E` for ordinary spending and `D = A + B - C` for mailings; both are recomputed
per formation and the script aborts on a mismatch over one cent. A third check requires the five
itemised sub-lines to sum **exactly** to the declared total, which they do for all eight.

Five defects were caught by those guards rather than by reading the output, and every one of them
would have put wrong figures on the page:

- **A typo in the source document.** Report 1.628 prints Podemos's ordinary total as
  `1.331.207.90` — a period where the decimal comma belongs. The report's own arithmetic gives
  1,331,207.90. `money()` reinterprets that shape deterministically rather than by guessing: in this
  format every thousands group after the first is exactly three digits, so a final group of exactly
  two digits cannot be one.
- **A blank cell stealing its neighbour's value.** Podemos's empty "B) Gastos reclasificados netos"
  let a look-ahead scan run into "C) Gastos no subvencionables" and read its 3.267,00. Fixed by
  splitting the table into rows before reading any figure.
- **Four formations silently skipped.** The heading matcher already excluded the dotted
  table-of-contents entries, but the code then also took the later half of the matches to drop TOC
  duplicates that were never in the list. The four that survived verified cleanly, so nothing looked
  wrong. Each heading is now confirmed by the subsection that must follow it.
- **Tables in a different order.** Podemos prints "2. RECURSOS DECLARADOS" *after* its expenditure
  table, so slicing between two fixed heading texts returned an empty resources table and let the
  expenditure slice run on into the next one, where "Total recursos" was read as the expenditure
  total. Sections are now split on their numbering, which is order-independent.
- **A guard that passed an empty parse.** All-zero figures satisfy `A+B-C-D+E = F` trivially, and for
  one run the script reported eight empty formations as verified. The guard now requires a declared
  total to be present, and requires the sub-lines to equal it exactly rather than merely not exceed
  it — which is what finally caught a label that had stopped matching the report's "- " bullet.

**Left out rather than shipped wrong.** The limits table's rows carry no lettered marker or bullet,
so the row splitter does not divide them and every cap amount read as zero. Publishing zeros that
look like real caps would be worse than omitting them, so only the SÍ/NO exceedance verdicts are
extracted — those are read from the raw text and are correct.

**Also recorded in `AGENTS.md`:** the TdC report URL's year segment is the **approval** year, not the
year covered — report 1.628 audits a June 2024 election and lives under `/2025/`. And a wrong URL
does not 404; it redirects to the site-wide search, whose HTML lists PDF links including the
`resumen/NR_I<number>.pdf` summary. That is how this report was found.

**Verified.** All three locales render the section with per-locale number formatting, eight rows, a
caption, every `<th>` scoped and zero contrast failures. Typecheck clean, production build clean at
104 pages.

**Framing unchanged.** These are declared and audited figures next to the subsidies that funded them.
Nothing is imputed to anyone, and the panel says so.

---

## 2026-09-07 — What the official record says, and what no authority has found

The first thing from the stopped research to reach the site, and the reason it is a small thing: of
roughly 160 extracted claims only 10 had been adversarially verified, so every figure published here
was checked against an official source first, and everything that failed to check stayed out.

**New `lib/hate-context.ts`** holds two separate things, and the page keeps them separate: aggregate
hate-crime statistics from the state's own bodies, and the record of what happened when campaign
material was actually taken to court. Neither is presented as explaining the other, and nothing in it
attributes anything to a named person.

**Verified and published.** Police-recorded hate crimes and incidents: **2,268 in 2023, +21.35%** on
the previous year, of which **856** racism or xenophobia and **522** sexual orientation or gender
identity — Ministerio del Interior / Oficina Nacional contra los Delitos de Odio. Prosecution output:
**129 convictions of 173 sentences (74.6%)** and **121** charge sheets citing racism or xenophobia,
with charges up about **40%** year on year — Fiscalía General del Estado, cross-checked against
OBERAXE's official summary of the same Memoria.

**Two corrections to my own extraction, caught by verifying.** The digest recorded 1,869 recorded
incidents for 2022; the current report supersedes that with 2,268 for 2023, and 2,268 ÷ 1.2135 ≈ 1,869
confirms the old base while retiring it as the headline. And the appellate decision in the *menas*
case is dated **19 July 2021**, which the digest had left as "on appeal".

**Left out for failing verification.** The 477 preprocedural investigations, the 293 total charge
sheets, and the ~40% share of investigations concerning online conduct all appear in the extraction
but could not be confirmed against a primary or official-secondary source in this pass. They stay in
`research/hate-accountability.md` as leads.

**The negative finding, stated as prominently as any figure.** No Spanish authority has ever ruled
that a party's campaign spending constituted a hate crime. The electoral board ordered a Vox banner
in Madrid taken down under **Article 53 LOREG** — propaganda outside the campaign period — and
expressly declined to rule on its content. The one known criminal attempt, over the *menas* poster
for the 2021 Madrid Assembly election, was dismissed by Juzgado de Instrucción nº 53 de Madrid on
29 April 2021 and the archiving was confirmed by Sección Segunda of the Audiencia Provincial de
Madrid on 19 July 2021, framed as *legítima lucha ideológica* within an election. The dismissal had
been appealed by the Fiscalía, PSOE, Podemos, Izquierda Unida, the Unidas Podemos coalition and the
Progresa association.

That outcome is on the page **because** it was negative. A record that lists the accusation and not
the acquittal is not a transparency tool, and this is the answer to the question the site invites.

**And the page now says why it tags nobody.** Article 10 LOPDGDD reserves criminal-conviction data to
public authorities, CENDOJ dissociates personal data before disseminating judgments, and STC 58/2018
treats retrievability of a person by name as the decisive harm for a public figure. Official
aggregates and specific proceedings with their outcome are published; inferences are not.

**Verified.** All three locales render the section with the right figures — `2.268` / `2,268` per
locale formatting, `129 / 173`, four source links, no untranslated string leaking through. Zero
contrast failures on `/es`, `/en` and `/ca` methodology pages, every `<th>` scoped, every table
captioned. Typecheck clean, production build clean at 104 pages.

**Also recorded, from a `caveman learn` run.** `Bash(cd)` was the heaviest tool shape in the scanned
window — 35.8% of 1,082,573 tool-output tokens over 1,388 calls — but broken down by verb the volume
is diffuse rather than one habit. The two notes that came out of it are in `AGENTS.md`, deliberately
not in `CLAUDE.md`, since a rule there is injected every turn and the saving is unproven.

---

## 2026-09-07 — The dashboard renders without JavaScript (D3b)

D3b was recorded as open earlier the same day, on the strength of the `<h1>` starting at opacity 0 in
both motion modes. Counting the prerendered HTML rather than reasoning about it made it worse:
`/financiacion` shipped **32 elements at `opacity: 0`** — four masthead elements and all 28 party
rows — **plus every bar at `width: 0px`**. Without JavaScript the page was not a blank hero. It was a
blank page.

**The entrances moved from JS to CSS.** `globals.css` gains `.enter` (`@keyframes enter-rise`) and
`.enter-bar` (`@keyframes enter-grow`), each taking its delay from a `--enter-delay` custom property
so the stagger stays a presentational detail rather than a prop threaded through components. A CSS
animation runs without JavaScript and starts from a state the HTML already carries.

Two details carry the fix:

- **Bars grow by `transform: scaleX()` rather than by animating `width`.** The real width stays inline
  in the HTML, so a bar is the correct size with no JS, and a `transition: width` covers the other
  case — a filter change moving the bar without replaying the entrance.
- **`motion.li` stays, with `initial={false}`.** The row renders visible on the server while `layout`
  still animates reordering when a filter changes; the entrance sits on the inner `<Link>`.

The reduced-motion block needed one more line, `animation-delay: 0s !important`. Neutralising only
`animation-duration` would have left a reader who asked for less motion waiting out the stagger while
the element held its `from` state — the same defect in a new place.

**Verified in three states.** With **JavaScript disabled**: headline opacity 1 with its text present,
28 of 28 party rows visible, 40 of 53 bars sized (the remainder are sub-pixel segments). Under
`reduce`, 150 ms after `domcontentloaded`: opacity 1 already. Under `no-preference`, sampled every
110 ms: 0.057 → 0.762 → 0.99 → 1, so the entrance still plays for everyone else. The prerendered HTML
now contains zero `opacity: 0` and zero `width: 0px` declarations.

`motion` is left carrying only what needs it: `layout` reordering, the two client-fetched feeds, and
`CountUp`. `lib/motion.ts` keeps `useEntrance()` for those and exports `stagger()`, which the CSS
delays are computed from, so both paths share one cap.

**Noted, not fixed:** the only console error on the page is a 404 for `/favicon.ico`, which predates
this work and is unrelated to it.

Typecheck clean, production build clean at 104 pages, shared First Load JS unchanged at 103 kB.

---

## 2026-09-07 — Reduced motion honoured (D3), a new finding beside it (D3b), and the research saved

**D3 — reduced motion.** `globals.css` declared a `prefers-reduced-motion` block that disabled
`scroll-behavior` and nothing else, so every fade-and-rise entrance still played for a reader who had
asked their operating system for less motion. Four components animated with `motion` and none
consulted `useReducedMotion()`.

New `lib/motion.ts` holds a shared `useEntrance()` hook that builds each entrance's
`initial` / `animate` / `transition` in one place, collapsing to the final state with a zero duration
under reduced motion. All four components use it: `Dashboard` for the masthead, party rows and bars,
plus `NewsFeed`, `BlueskyFeed`, and `CountUp`, which skips its count-up and simply shows the figure.
The skeleton `animate-pulse` classes drop under the same flag, and the CSS block now neutralises
`animation-duration` and `transition-duration` globally rather than only the smooth scroll.

The stagger is capped: `stagger(index)` is `min(index × 0.035, 0.4)`. The party bars had used an
uncapped `i * 0.03`, so with 28 rows the last bar started 0.81 s in and finished past 1.7 s.

**Verified by emulating the media query** rather than by reading the code, sampling `<h1>` opacity
every 120 ms from `domcontentloaded`. Under `no-preference` the samples run 0, 0, 0, 0, 0.415, 0.866
— a ramp. Under `reduce` they run 0, 0, 0, 0, 1, 1 — straight to final. Computed
`transition-duration` on a control drops from `0s` to `1e-05s`, confirming the CSS block applies.
Both modes settle with the headline visible and all 81 bars at non-zero width.

**D3b — a separate defect the audit had folded into D3, now recorded as its own open finding.** The
four leading zeros in *both* rows above are not the entrance. `motion` serialises
`initial={{ opacity: 0 }}` into the server-rendered HTML, and `useReducedMotion()` returns false on
the server because there is no `matchMedia` there — so the masthead ships as `opacity: 0` and becomes
visible only when React hydrates, whatever the reader's motion preference, and permanently if
JavaScript never runs. This is what the original audit caught as the `<h1>` at `opacity: 0.058`, and
the hook cannot fix it, because the decision happens before the client knows anything. Two candidate
fixes are recorded in `PLAN-VISUAL.md`; neither is applied.

Stating this rather than closing D3 outright: the reduced-motion half is fixed and measured, the
pre-hydration half is not.

**Research saved before it was lost.** The deep-research run into party spending and hate-conduct
records was stopped to protect context. Its cached output is now committed under `research/` rather
than left in a session directory: the workflow journal, the 160 extracted claims with their 10
adversarial verification votes, and a written digest in `research/hate-accountability.md`.

**The digest leads with its own status, because only 10 of ~160 claims were verified.** Everything in
it is a lead to check, not a finding to publish. What it establishes well enough to design against:

- LOREG art. 130 does itemise electoral spending into eight closed categories, mailings separate from
  publicity — but digital advertising is not separately identifiable, and the Tribunal de Cuentas has
  itself recommended legislating to make it a distinct capped category.
- Nothing is machine-readable. TdC reports, the `cuentaspartidospoliticos.es` Observatorio,
  Infoelectoral subsidies and the Interior hate-crime series are all PDF or on-page tables.
- **No Spanish authority has ruled that a party's campaign spending constituted hate speech.** The
  Junta Electoral ordered a Vox banner down on Article 53 LOREG timing grounds and *expressly declined
  competence* over its content; the one criminal attempt, over the *menas* poster, was archived on
  appeal by the Audiencia Provincial de Madrid with the Fiscalía among the appellants.
- A per-politician conviction tag is largely foreclosed: art. 10 LOPDGDD reserves criminal-conviction
  data to public authorities with *abogados* and *procuradores* the only private exception, CENDOJ
  requires dissociation of personal data before dissemination, and STC 58/2018 makes
  retrievability-by-name the decisive harm for a public figure.

The digest ends with resume instructions and the gotcha that cost a run: `resumeFromRunId` replays
the script but does not carry `args`, so resuming without re-passing the question exits in 9 ms with
*"No research question provided"*. `NEXT-STEPS.md` gains item 6 with the stop conditions.

**Deliberately not done.** No spending extractor was built, no politician was tagged, and the
reframing stands: the research was pointed at records that already exist and are attributable rather
than at a classifier that infers intent.

Typecheck clean, production build clean at 104 pages.

---

## 2026-09-04 — Last two audit items closed (N2, P4), and caveman mode written into the rules

**N2 — the dangling IDREF I introduced.** The O2 fix put `aria-controls="mobile-nav"` on the menu
button, but the panel was conditionally rendered, so the reference pointed at nothing whenever the
menu was closed — which is most of the time, on every route. The panel is always mounted now and its
display is switched by class instead.

Using the `hidden` *attribute* would have been the obvious move and it would have been wrong:
`[hidden] { display: none }` sits in Tailwind's base layer and loses to the `flex` utility, so the
panel would have stayed visible when closed. That is the same layer-order trap as D1, three fixes
later, which is why the reason is written into the component.

**P4 — avatar initials.** The initials were set in the party's brand colour on `--ink-3`, putting
three parties under 4.5 : 1 (`#8b5cc4` 3.61, `#d64545` 3.92, `#c7527f` 4.04). Lightening those
colours was never an option — they are the parties' own identities — so the colour moved off the
text: initials are `--paper` at **13.33 : 1**, and the party colour now carries the tile through its
ring and a tinted gradient field. Identity preserved, contrast fixed, no party's colour altered.

The gradient's lightest possible stop was checked rather than assumed: the brightest party colour at
15% over `--ink-3` still gives `--paper` **9.46 : 1**.

**Every item in the WCAG audit is now resolved** — P1, P2, P3, P4, O1, O2, O3, R1, R2, R3, N1 and N2.

**Verified.** Zero contrast failures and zero dangling `aria-controls` across `/es`, `/es/politicos`,
`/es/politico/[slug]`, `/es/financiacion`, `/es/votaciones`, `/es/metodologia`, `/en/politicos` and
`/ca/politicos`. The menu panel reports `display: none` with `aria-expanded="false"` when closed and
`display: flex` with six visible links when open. Typecheck clean, production build clean at 104
pages.

**Caveman mode is now a written rule, not a per-session request.** Emma asked for it to be enforced
always. Added `CLAUDE.md` at the repo root and `~/.claude/CLAUDE.md` for every other repo, both
stating level `full` from the first reply, the compression rules, the auto-clarity exceptions
(security warnings, irreversible-action confirmations, order-sensitive sequences), and the boundary
that matters here: **compression is a chat style only**. Everything persisted outside the chat — code,
comments, commit messages, this changelog, `AGENTS.md`, the `PLAN-*.md` documents, PR and issue
bodies — stays in normal prose. The project memory note was rewritten from a per-session preference
into that standing rule.

Worth recording because it cost time twice this session: the `caveman` CLI **is** installed, at
`%APPDATA%\npm\caveman.cmd` with a proxy at `~/.caveman/bin/caveman-proxy.exe`, and the plugin's
hooks in `~/.claude/settings.json` inject the mode on `SessionStart` and every `UserPromptSubmit`.
Two earlier probes reported it missing because `%APPDATA%\npm` is not on the PATH the tool shells
inherit — check the hook config and that directory directly before concluding it is absent.

---

## 2026-09-01 — Skip link, and every control at 44 px (O1, O3)

**O1 — a skip link.** The sidebar repeats six navigation links before the content on every page, so a
keyboard or screen-reader user had to pass all of them each time. Every route now opens with a skip
link that moves focus to the content wrapper, which carries `id="main"` and `tabIndex={-1}` so focus
actually lands there rather than only the scroll position moving. Present and verified on all seven
route/locale combinations checked.

**How it is built, and what was tried first.** The obvious `sr-only` + `focus:not-sr-only` pair was
written first and **left the link 2 px tall when focused** — `sr-only`'s `height: 1px` and `clip`
survived the reset, which the geometry check caught. It is positioned absolutely and translated out
of view instead: the element keeps its real 44 px size at all times, stays focusable and in the
accessibility tree, and slides in on focus. Deterministic, and it does not depend on one utility
undoing another cleanly.

**O3 — target sizes.** Raised to a 44 px minimum: the Dashboard kind and year chips, the reset button,
the party facet chips, both search fields and their submit buttons, the sidebar navigation links, the
locale toggles, the mobile wordmark, and the directory's previous/next pager. Where a control was
`px-3 py-1.5`, the vertical padding was replaced with `inline-flex min-h-11 items-center` so the
height applies to an inline element and the label stays centred.

**Inline text links are deliberately left alone.** Both 2.5.5 and 2.5.8 exempt a target whose size is
constrained by the line of text it sits in, and padding out a link inside a sentence or a table cell
would break the prose around it. The verification therefore separates the two: it reports standalone
controls under 44 px as offenders and counts inline ones as exempt.

**Verified.** Zero standalone controls under 44 px across `/es`, `/es/financiacion`, `/es/politicos`,
`/es/votaciones`, `/es/metodologia`, `/en` and `/ca` at 375 px wide, plus `/es/politicos?page=2` and
`/en/politicos` for the pager specifically. The skip link measures 44 px and sits off-screen at
`top: -44` until focused on every route; activating it sets `#main` and moves `document.activeElement`
to that wrapper. Typecheck clean, production build clean at 104 pages.

**A verification limitation.** `:focus` styles could not be exercised: `document.hasFocus()` is false
because the Browser pane cannot hold focus, which is the same condition that stopped key events
earlier in the session. The slide-in is therefore evidenced by the rule existing in the compiled CSS
(`.focus\:translate-y-0:focus`), by the element's measured 44 px size and `top: -44` resting position,
and by activation moving focus to `#main` — not by observing the transition.

Still open in `PLAN-VISUAL.md` §2b: N2 (the dangling `aria-controls` introduced by the O2 fix) and P4
(avatar initials in party brand colours, a design decision).

---

## 2026-09-01 — Parliamentary groups are named, and link to the right party's money (N1, R3)

A reader pointed out that the group labels on `/votaciones` were unreadable — `GS`, `GCUP-EC-GC`,
`GPlu` with nothing saying which parties those are — and asked for a link to each group's financing.
The re-audit had reached the same place from the accessibility side (N1, 1.3.1): the rows announced
as “GS 116/0/1”, and what the three numbers meant was carried only by the colour of bars sitting in a
different widget higher up the page.

**New `lib/groups.ts`.** A per-legislature registry of the 13 group codes across Leg XIV and XV, each
with the group's name in full, a short label, and either the NIF of the one party it belongs to or the
list of parties observed in it.

**The single-party classification is evidence-based, not assumed.** Joining every deputy in
`data/votes.json` to the officeholder register by folded name gives, per group, the distribution of
party labels among the deputies that match. A group is only marked single-party where every matched
deputy carries the same party: GP 57/57 then 89/89 PP; GS 55 PSOE plus 2 unlabelled, then 73/73;
GVOX 26 Vox plus 2 unlabelled, then 26/26; GR 4/4 then 5/5 ERC; GEH Bildu 4/4 then 5/5; GV (EAJ-PNV)
3/3 twice; GJxCAT 6/6 Junts. The same join settled the composites: GCUP-EC-GC returned Sumar 6 and
Podemos 4, GPlu returned Junts 3, CM 1, BNG 1, and GMx returned PP 2, CC 1, Teruel Existe 1 in XIV
and Podemos 4, UPN 1, BNG 1, CC 1 in XV.

**Two entries are deliberately not decided by that join**, and the file says so. GSUMAR's matched
deputies all carry the register label “Sumar”, but that is a coalition's label and the group's own
name is “Plurinacional SUMAR” — linking it to the Movimiento Sumar NIF would attribute a coalition's
votes to one component, so it is composite. GCs matches no register rows at all, the party having
dissolved; it is marked single-party on the strength of the group's name being the party's name, with
that absence of evidence recorded.

**Why the link is missing on some rows, on purpose.** A parliamentary group is not a party. Pointing a
coalition group at one party's funding page would misattribute the other parties' money, so composite
rows link to nothing and instead name the parties in them. The table states this in prose beneath it,
in all three languages, and links the Congreso's own composition page.

**`components/GroupBreakdown.tsx`** replaces the hand-rolled bar list. It is a real table: a caption,
`scope="col"` headers, the group as a `scope="row"` header, Sí / No / abstención each in their own
labelled column, the party's colour as a rule down the left, the official group name and the raw
Congreso code both kept visible so a row can still be matched against the official record, and the
bar reduced to `aria-hidden` decoration that repeats what the numbers already say. The portal's
`StanceByGroup` cards now read “PSOE · Unidas Podemos · ERC · Plural · Mixto” in place of the codes.

**R3 closed while in the area.** Every table on the site now has a `<caption>` and scoped headers:
`/votaciones` 138 `<th>` across 9 tables, `/financiacion` 42, `/metodologia` 18, none unscoped, no
table without a caption, checked in all three locales. The two older tables took a visually-hidden
caption, because the heading above each already says the same thing on screen while the table still
needs its own accessible name.

**Three things wrong in the first draft, fixed before committing.** A code comment claimed the raw
group code stayed visible when the markup had dropped it — the code is rendered now, as the comment
said. The caption repeated the `<h3>` above it word for word, so it now says something the heading
does not. And both the caption and the note below the table were set in `label-mono`, which
uppercases — a two-sentence paragraph in capitals, the third time that class has caused this, so both
are plain text now.

**Verified.** All 8 funding links resolve 200 (`/es/party/G28477727` and the rest). Zero contrast
failures across `/es`, `/es/votaciones`, `/es/financiacion`, `/es/metodologia`, `/en/votaciones` and
`/ca/votaciones`. Typecheck clean, production build clean at 104 pages.

**Left alone.** No change to the art direction — the audit's judgement was that it is settled and
working, so this executes the existing dossier language rather than introducing another. Still open:
O1 (skip link), O3 (chip target sizes), N2 (the dangling `aria-controls` from the O2 fix), P4 (avatar
initials in party brand colours).

---

## 2026-09-01 — WCAG re-audit after the six fixes (no code shipped)

Re-ran the audit against the running app now that P1, P2, P3, R1, R2 and O2 are in. The fixed items
hold. Two new findings, and five criteria that had been listed as untested now tested and passing.
Recorded in `PLAN-VISUAL.md` §2b; nothing was changed in the app.

**N1 — the per-group rows on `/votaciones` announce as “GS 116/0/1”.** That section has no column
headers and no legend, so what the three numbers mean is carried only by the colour of the bars — and
those bars sit in a different widget higher up the page. The group codes are never expanded either,
so a reader sees `GS`, `GCUP-EC-GC`, `GPlu` with nothing telling them which parties those are. This
is 1.3.1, and it is the same problem a reader raised independently about the group labels being
unreadable. Fix: label the three columns, expand the codes to readable names, keep the numeric
triplet as the non-colour carrier.

**N2 — a dangling IDREF I introduced.** The O2 fix added `aria-controls="mobile-nav"` to the menu
button, but that panel only exists while the menu is open, so the reference points at nothing in the
closed state on all five routes. Either render the panel always and toggle `hidden`, or drop the
attribute — `aria-expanded` alone is sufficient for a disclosure.

**Newly tested, all passing.** 1.4.4 resize text to 200%; 1.4.12 text spacing with line-height 1.5,
letter-spacing 0.12em, word-spacing 0.16em and 2em paragraph spacing forced; 2.4.3 focus order in the
opened mobile menu (trigger is focusable #1, panel #2–#10, focus lands on #2, tabbing past it
continues into page content); and 1.4.1 on the vote bars — the counts are present as text, so the
information is not colour-only, only unlabelled. Also confirmed the mobile menu is a non-modal
disclosure that pushes content rather than overlaying it, and correctly has no focus trap.

**A false positive caught, and why.** The first portal run of the text-spacing test reported
horizontal overflow. It was an artifact: the Browser pane had collapsed, `clientWidth` read 0, and
every element therefore “overflowed”. Re-run with an explicit 1280 px viewport it passes. The audit
notes now say to assert a sane viewport width before trusting any overflow result — a measurement bug
reported as a defect would have sent someone chasing nothing.

**Confirmed still open**, unchanged: O1 (no skip link, checked on all five routes), O3 (chip target
sizes — the menu button is now 44 px), R3 (7 `<th>` across two tables with no `scope`, neither table
with a `<caption>`), P4 (avatar initials in party brand colours).

---

## 2026-09-01 — Stateful controls: pressed state, a status region, and Escape (R1, R2, O2)

Three audit items, all sitting on the site’s only stateful controls.

**R1 — pressed state.** The eight Dashboard filter chips on `/financiacion` (kind and year) now carry
`aria-pressed`, so the selected filter is available programmatically. Together with the P1 contrast
fix that state is now conveyed both ways; before that pair it was conveyed neither way. The party
facets on `/politicos` are links rather than toggles, so they take `aria-current="page"` instead — a
link cannot be “pressed”, and `aria-pressed` there would have been the wrong role.

**R2 — a status region.** `/financiacion` now carries a `role="status"` line reading, for example,
“28 partidos · 232 concesiones · 300,6 M € con los filtros actuales”, in all three languages.

**A correction to the original finding.** It said the result set is replaced with no announcement on
`/es/financiacion` *and* `/es/politicos`. Only the first is true. The searches on `/politicos` and
`/votaciones` are form GETs that navigate, and a change of context is announced by the browser — it
is not a status message, and 4.1.3 does not apply. Only the Dashboard mutates its list in place, so
only the Dashboard needed a region.

**O2 — Escape and focus.** Escape now closes the mobile menu and returns focus to the button that
opened it; opening moves focus into the panel so the next Tab continues inside it; the button gained
`aria-controls="mobile-nav"`. Its height also went from 31 px to 44 px, which is part of O3.

**One error worth recording.** The status string was first written as a function on the `home`
dictionary. `home` is passed as a prop from a server component into `<Dashboard>`, which is a client
component, so the page died with *“Functions cannot be passed directly to Client Components”* — the
same trap this project hit once before with a formatter prop. It is a template string with
`{parties}` / `{grants}` / `{total}` placeholders now, interpolated on the client, matching the
existing `CountUp as="euro"` pattern.

**Verified.** The eight chips report `aria-pressed` and toggle correctly (`Gastos de seguridad=true`
after a click, `Todas=false`). The status line changed from “28 partidos · 232 concesiones ·
300,6 M €” to “25 partidos · 108 concesiones · 14,7 M €” on that click. The menu button measures
44 px, exposes `aria-controls`, moves focus into the panel on open, and closes on Escape with focus
returning to the trigger.

**A limitation, stated rather than glossed.** Real key events stopped reaching the page partway
through this session — the Browser pane reports itself hidden, and a listener recording every
`keydown` saw neither Escape nor a letter key. O2 is therefore verified by code and by dispatching a
`KeyboardEvent` on `document`, which exercises the exact listener registered. The original finding
never depended on that plumbing: `components/Sidebar.tsx` had no key handler at all.

Still open in `PLAN-VISUAL.md` §2b: O1 (no skip link), O3 (remaining chip target sizes), R3 (table
`scope`/`caption`), P4 (avatar initials in party brand colours — a design decision).

Typecheck clean, production build clean at 104 pages.

---

## 2026-09-01 — Interactive control boundaries now meet non-text contrast (P3)

`--line-strong` was carrying two different jobs: the visible boundary of interactive controls, and
decorative rules and card hover states. At `rgba(236, 226, 205, 0.22)` it measured **1.77 : 1** over
`--ink`, below the 3 : 1 that WCAG 1.4.11 requires for the visual information needed to identify a UI
component — and a filter chip has no boundary other than its border.

Raising `--line-strong` wholesale would also have thickened panel edges and card hovers, which are
not UI boundaries and are exempt. So the fix splits the token: **`--line-control`** at
`rgba(236, 226, 205, 0.4)`, **3.22 : 1**, now carries the filter and year chips on `/financiacion`,
the party facet chips and search field on `/politicos`, the search field on `/votaciones`, and the
mobile menu button. `--line` and `--line-strong` keep the decorative work unchanged.

**Verified in the browser across the three filtered routes.** Every interactive control now measures
≥ 3 : 1 — worst case 3.22, active states at 8.30 on their gold border, and all 21 party facet chips
on `/politicos` confirmed individually. Two things were checked rather than assumed and turned out
fine: the `opacity-60` count inside each facet chip composites to **5.86 : 1**, and the ES/EN/CA
locale toggles have no border at all, so they are text-labelled controls with no boundary to fail.

**Deliberately unchanged.** The `.panel` card borders on the portal, party, profile and Bluesky cards
measure 1.30 : 1 and stay that way: each card is identified by its own heading text, so its edge is
decoration rather than the information needed to identify the control. The same reasoning leaves the
vote card border on `/votaciones` alone.

Still open from `PLAN-VISUAL.md` §2b: O1 (no skip link), O2 (Escape does not close the mobile menu),
O3 (target size), R1 (no `aria-pressed` on filter chips), R2 (no live regions), R3 (table semantics),
P4 (avatar initials in party brand colours, a design decision).

Typecheck clean, production build clean at 104 pages.

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
