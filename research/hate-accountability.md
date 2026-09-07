# Research: making the money mean something, and naming hate conduct from records

**Status: incomplete, and the claims below are UNVERIFIED.** A deep-research run was started on
2026-09-06 and stopped on 2026-09-07 before its verification and synthesis phases finished. What
survived is the raw extraction: 30 unique sources searched, 25 fetched, **160 falsifiable claims
pulled, of which only 10 received an adversarial verification vote.** Nothing here has passed the
two-of-three refutation test the harness applies, so every statement in this document is a *lead to
check*, not a finding to publish. The raw material sits beside this file:

- `research/_research-hate-accountability-raw.jsonl` — the workflow journal, one record per agent
- `research/_research-hate-accountability-claims.json` — the 160 claims plus the 10 votes

**How to resume** is at the bottom. There is a gotcha that cost one run.

---

## The question

Emma's framing: the €300.6M headline does not yet mean anything. What do parties actually *do* with
the money? Is campaign spending related to hate crime? Has party money funded anti-immigration,
anti-LGBT, anti-trans or homophobic campaigns? And can politicians be tagged as potential hateful
instigators regardless of party?

The last part was deliberately reframed before the research ran. Tagging a named living person as a
"potential hateful instigator" is an inferred label, which is the thing this project declined at the
start when the brief asked for stance attribution and got recorded roll-call votes instead. The
research was pointed instead at **records that already exist and are attributable**. The material
below strongly vindicates that choice — see §4, which is the part that decides whether the feature
is buildable at all.

---

## 1. The money trail: what is actually itemised

**The law does itemise electoral spending.** LOREG art. 130 defines *gasto electoral* by a fixed
window — outlays from the day the election is called until the poll — and enumerates **eight closed
categories (a–h)**, which are the statutory line items parties must classify spending into: ballot
papers and envelopes, propaganda and publicity, rallies, transport, correspondence and postage,
interest on electoral credit, and so on. Mailings are their own declarable category under letter f),
separate from publicity.

**Two things blunt it.** Category b) is drafted medium-neutral — propaganda "sea cual fuere la forma
y el medio" — so digital and social-media advertising falls inside it but is **not separately
identifiable**. And the Tribunal de Cuentas has itself recommended that the Government legislate to
treat digital advertising as a distinct capped category, which is a strong signal that it currently
is not one.

**Nothing is machine-readable.** Every retrieval path ends in PDF:

| Source | What it gives | Format |
|---|---|---|
| Tribunal de Cuentas hub | Two report streams per party: annual accounts, electoral accounts | PDF, no API |
| `cuentaspartidospoliticos.es` Observatorio | Only *compliance* — did the entity file, on time or late — from FY2016 | On-page tables, no CSV/API |
| Infoelectoral (Interior) annual subsidies | Two top-line categories only: ordinary operating financing, security expenses | No CSV/XLSX/JSON/API |
| Ministerio del Interior hate-crime reports | Annual series, province-level annexes | PDF only, 2018–2023 |

Line items exist inside the fiscalización PDFs and are governed by a sector chart of accounts, the
*Plan de Contabilidad Adaptado a las Formaciones Políticas* — so the granularity is real but locked
in documents, exactly like the Tribunal de Cuentas reports this project already extracts.

**Two by-products are usable as hard facts on their own.** Late or non-filing against the 30 June
statutory deadline is a published, verifiable fact about a named party independent of the account
contents. And the fiscalización produces per-party financial sanctions — for the 9 June 2024
European elections the TdC proposed **non-award of the electoral subsidy** to specific formations,
and recorded that 26 companies invoicing over €10,000 plus one credit institution failed to report
as required, which is a named gap in vendor traceability.

## 2. Whether official bodies have linked campaign material to hate

This is the angle that most changes the design, and the answer is largely **no**.

**Electoral boards explicitly refuse the question.** The Junta Electoral de Zona de Madrid ordered
Vox to remove a large banner in central Madrid within one day — imagery of a hand with a Spanish-flag
bracelet throwing LGBTQI+ and feminist symbols into a bin, slogan *"Decide lo que importa"*. The
ground was **Article 53 LOREG, timing** — propaganda before the official campaign start — and the
board *expressly declined competence* over whether the content was unlawful. Appearing twice in the
extraction, from two sources. **JEC and JEZ rulings therefore cannot be cited as official findings of
hate speech or discrimination.** They are a party-vs-party complaint record, useful as evidence that
a given piece of material existed and was ordered down, and for nothing more.

**The best-known criminal attempt failed, finally.** The case over Vox's 2021 *"menas"* campaign
poster was provisionally dismissed by Juzgado de Instrucción nº 53 de Madrid on 29 April 2021, and
Sección Segunda of the Audiencia Provincial de Madrid **confirmed the archiving on appeal** — a
decision not subject to further appeal. The court placed the poster inside legitimate electoral
ideological struggle and narrowed the art. 510 target-group element. The appellants included the
**Fiscalía itself**, alongside PSOE, Podemos, Izquierda Unida, Unidas Podemos and a citizens'
association. Any tracker citing this must record it as a **closed case with a negative outcome**, not
as a pending allegation.

**One live named prosecution exists.** A sitting Vox city councillor in Valencia, Cecilia Herrero,
has had oral trial ordered under Código Penal **art. 510.1 and 510.2**, on the basis of dozens of
dated public social-media posts from 2020–2024; the Fiscalía sought three years' imprisonment, a
twelve-month fine and three years' disqualification. Reported as the first serving Vox councillor
*procesada* for a hate crime, which implies the population of Spanish elected officials with such a
record is very small. **She is charged, not convicted.** Presumption of innocence applies and any
published reference must say so in the same sentence.

**Two limits on art. 510 itself.** A Tribunal Supremo (Sala de lo Penal) auto of 29 July 2021 held
that art. 510 protects the social minorities the provision lists — race, national origin, sex, sexual
orientation, gender identity, disability, ideology, religion or beliefs — **but not other collectives
such as political parties**. And parliamentary inviolability under Art. 71.1 CE travels with the
parliamentarian wherever representative functions are exercised, not just inside the chamber, which
blocks prosecution for a large class of political speech.

## 3. The statistical baseline, and what correlation evidence exists

**Spain's official figures.** Police forces recorded **1,869 hate crimes and incidents in 2022**,
+3.72% on 2021: racism/xenophobia largest at 755 *hechos* (43.50%), sexual orientation and gender
identity next. These are *hechos conocidos* from the Sistema Estadístico de Criminalidad — **recorded
incidents, not convictions.** The report quantifies its own dark figure: a 2021 national victim
survey found **only one in ten** hate-crime victims had reported the offence. Art. 510 hate speech is
counted inside the criminal figures and stood at 105 *hechos* in 2022.

**Prosecutorial figures are separate and more precise.** The Fiscalía General del Estado's specialised
service publishes national counts: **477 preprocedural investigations in 2024** (511 in 2023), **293
escritos de acusación** (up ~40% on 210), and of 173 *sentencias* received, **129 convictions
(74.5%)**. Art. 510.2 a) charges nearly doubled, 85 → 162. Roughly **40% of 2024 investigations (192
of 477) concerned conduct committed via internet or social media** — the same channel campaign content
travels through. The Fiscalía itself names the polarisation of political discourse as fertile ground
for intolerance, **in general terms, naming no party or politician.**

**The correlation literature does not give Spain what it needs.** Müller & Schwarz (AEJ: Applied
Economics) build a causal-identification design linking an individual named politician's dated
statements to next-day hate-crime counts, and an Institute for Replication paper (#246, 2025)
reproduced the core result. But it is **US-focused** — Trump, 2016 primaries, US county reporting —
and cannot support claims about Spain. A German study across 400 municipalities finds AfD 2017 vote
share and reported anti-refugee hate crimes correlate at **r = 0.50 (p < 0.001)** on 2,211 official
incidents — and the authors **explicitly disclaim causal interpretation**. Unemployment predicts both
outcomes (β = 0.26 for vote, β = 0.34 for hate crime), and the foreigner-share effect *reverses sign*
between West and East Germany. Any Spanish version would need an instrument, not a scatter plot.

## 4. The legal wall, which decides the feature

**Spanish law essentially forecloses a per-politician conviction database in private hands.** Under
**art. 10 LOPDGDD (LO 3/2018)**, processing personal data on criminal convictions and offences is
restricted; the **only private actors authorised** are *abogados* and *procuradores*, and only for
information supplied by their own clients. Spanish law permits **a single complete register of
criminal convictions, held under public-authority control**. GDPR **Art. 10** conditions any such
processing on official-authority supervision or Member State law with appropriate safeguards.

**CENDOJ is not a workaround.** Judgments are published under CGPJ competence (art. 560.1.10º LOPJ),
but Reglamento 1/2005 art. 7 requires **dissociation of personal data** before dissemination, art. 4
permits restricting access where privacy is affected, and access by a non-party requires the
Secretario Judicial to assess a **justified direct personal interest** — so systematic bulk retrieval
of named individuals' judgments is not an available route.

**And the Constitutional Court has already drawn the line for public figures.** STC 58/2018
(ECLI:ES:TC:2018:58, 4 June 2018) recognised the *derecho al olvido* as a fundamental right derived
from art. 18.4 CE, and made lawfulness depend jointly on subject matter *and* the person's status.
The harm it treated as decisive was **retrievability of the person by name via a general search
engine** — which is precisely what a per-politician tag on a public website creates. The case
concerned a digital press archive rather than an official judicial database, so it constrains
republication of press reports rather than citation of judgments, but the balancing test is the one
that would be applied.

**Read together:** a tag reading "convicted of a hate crime" is not safely buildable from bulk
retrieval. What *is* defensible is citing **official aggregate figures** (Fiscalía, Interior) and
**individually sourced, currently-newsworthy proceedings** with their status and outcome stated —
including the negative outcomes, like the *menas* archiving.

## 5. How others classify discourse defensibly

Four precedents, and each contributes one rule.

- **ILGA-Europe Rainbow Map** — 76 criteria, seven weighted categories, "Hate crime and hate speech"
  at **19%** of the score. Every data point validated against original sources through in-country
  experts. Crucially it is **restricted to legislation and policy and explicitly does not measure
  societal acceptance** — so it is a precedent for scoring *states*, not for scoring people.
- **OSCE ODIHR** — labels civil-society material "**incidents**" and only officially recorded cases
  "**crimes**", because it cannot verify the legal classification of NGO reports. Defines **bias
  indicators as objective, observable facts rather than inferred motive.** Warns that a higher count
  does not evidence more hate crime, and that early rises reflect better reporting. Recommends
  keeping **hate speech statistics separate from hate crime statistics**. Builds a right-of-reply step
  in via National Points of Contact.
- **Manifesto Project** — codes the quasi-sentence, one of 56 categories, **manifest content only**,
  explicitly barring the coder's judgement about whether a claim is right. It has **no category for
  "hate speech" or "hateful"**; the nearest are positional — 601.2 Immigration: Negative, 608
  Multiculturalism: Negative. And its reliability is contested: Mikhaylov, Laver & Benoit (*Political
  Analysis* 20(1), 78–91) found near-every manifesto coded once by a single coder, with
  misclassification propagating into the headline RILE scale.
- **Arcópoli / Observatorio Madrileño** — 326 LGBT incidents in Madrid in 2017, framed as an
  *incidence* count. **Drops cases whose LGBTphobic motivation is doubtful rather than coding them by
  inference.** Uses a broader unit than criminal law (*incidente de odio o discriminatorio*). When it
  named an organised actor as a source of anti-LGBTI discourse, it attached explicit hedging **and**
  anchored the claim to a dated formal filing.

## 6. What this points the build at

Not a classifier. A **record ledger**, per the project's existing pattern:

1. **Spending categories from the fiscalización PDFs**, extracted the way `extract-foundations.py`
   already does it, with the eight LOREG art. 130 categories as the schema and a verification guard
   against the report's own totals. This is the piece that would make €300.6M mean something.
2. **Two hard party-level facts that need no interpretation**: filing compliance against the 30 June
   deadline, and TdC sanction proposals such as non-award of subsidy.
3. **Official aggregates, cited not inferred**: Fiscalía prosecution and conviction counts, Interior
   recorded-incident counts, each with its dark-figure caveat printed beside it.
4. **Individually sourced proceedings**, with status, outcome and presumption of innocence stated —
   and negative outcomes recorded as such.
5. **A stated non-goal on the page**: no derived "hateful" score, following ODIHR's own rule that
   bias must rest on observable facts rather than inferred motive.

The honest headline is not "these parties fund hate". It is that **the money's destination is
declared only in PDFs, in eight legal categories that do not separate digital advertising, and no
Spanish authority has ever ruled that a party's campaign spending constituted hate speech** — the one
criminal attempt was archived on appeal with the Fiscalía among the appellants. That is a finding, and
it is publishable.

---

## Resuming the run

```bash
# The 41 completed agents replay from cache; only the 18 failed verification votes re-run.
```

Use `Workflow({ scriptPath, resumeFromRunId: "wf_bc339ba2-a53", args })`.

**The gotcha:** `resumeFromRunId` replays the script but does **not** carry `args`. Resuming without
re-passing the question makes the script exit in 9 ms with *"No research question provided"*. Pass
`scriptPath`, `resumeFromRunId` **and** `args` together. The question text is stored in
`research/_research-hate-accountability-claims.json` under `question`, and the full five-angle prompt
is in the CHANGELOG entry for 2026-09-06.

Script: `.claude/projects/C--politician-tracking-app/<session>/workflows/scripts/deep-research-wf_bc339ba2-a53.js`

**Before resuming, consider whether it is worth it.** Verification is the expensive phase — 18 agents
plus synthesis — and the material above is already enough to design against. The strongest reason to
finish is that §4 (the legal wall) is the load-bearing part, and it currently rests on unverified
extraction of statutes and one Constitutional Court ruling. Those specific claims deserve
verification before anything is built on them; the rest can stay as leads.
