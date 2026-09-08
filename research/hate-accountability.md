# Research: making the money mean something, and naming hate conduct from records

**Status: complete and verified.** The deep-research run finished on 2026-09-08. 26 sources fetched,
124 falsifiable claims extracted, and the **28 highest-priority claims each put to a three-vote
adversarial panel**: 18 survived, 10 were refuted. Nothing below is an unadjudicated lead unless it
says so, and the refutations are recorded beside the findings because three of them corrected this
document's own earlier draft.

Raw material sits beside this file:

- `_research-hate-accountability-raw.jsonl` — the workflow journal, one record per agent, with cached
  results
- `_research-hate-accountability-claims.json` — the extracted claims plus every verification vote

**How the run was steered.** The harness ranks claims by importance then source quality, which put
rubric weightings and portal shapes first and never reached the statutes that decide whether the
feature is buildable at all. A priority tier was added ahead of that ranking for claims naming a
statute, a court, a prosecutor or a ruling, and the cap was raised from 25 to 28 claims. That is why
the verified set below is almost entirely law and official record rather than methodology surveys.

---

## The question

Emma's framing: the €300.6M headline does not yet mean anything. What do parties actually *do* with
the money? Is campaign spending related to hate crime? Has party money funded anti-immigration,
anti-LGBT, anti-trans or homophobic campaigns? And can politicians be tagged as potential hateful
instigators regardless of party?

The last part was deliberately reframed before the research ran. Tagging a named living person as a
"potential hateful instigator" is an inferred label, which is the thing this project declined at the
start when the brief asked for stance attribution and got recorded roll-call votes instead. The
research was pointed instead at **records that already exist and are attributable**. §4 is the part
that decides whether the feature is buildable, and it now rests on verified statutory text rather
than on extraction.

---

## 1. The money trail — answered in code, not by this research

The harness returned **no surviving verified claim** about Tribunal de Cuentas granularity, expense
itemisation, or dataset exposure beyond PDFs. Its own synthesis flags that as a coverage gap: "treat
this angle as not researched rather than as a negative result."

**It was answered directly instead.** `scripts/extract-electoral-spending.py` extracts Tribunal de
Cuentas report nº 1.628 — the fiscalización of the 9 June 2024 European Parliament election accounts
— and the answer is on `/financiacion`: €18,433,012.62 of declared ordinary spending across eight
formations, of which €6,808,676.26 (36.9%) is the two advertising categories the law caps and
**€10,052,187.82 (54.5%) is one residual line the report does not break down.**

That extraction also **corrected this document's earlier draft**, which recorded the eight lettered
categories of LOREG art. 130 as the itemisation to expect. Art. 130 is the legal definition of
*gasto electoral*, but the fiscalización reports against something else: the two advertising caps
(LOREG arts. 55 and 58), mailings, financial costs, and the residual. Reading the report beat
reasoning from the statute.

Still unverified, and still worth checking if this angle is re-run: whether Junta Electoral acuerdos
exist as a systematic citable series (see §5), and the shape of the `cuentaspartidospoliticos.es`
Observatorio.

## 2. Whether official bodies have linked campaign material to hate

Largely **no**, and this is now the best-evidenced section in the document.

### The *menas* case: archived, and definitively closed — 3-0

Juzgado de Instrucción nº 53 de Madrid archived the case over Vox's 2021 Madrid Assembly campaign
poster by auto of **29 April 2021**, and Sección Segunda of the Audiencia Provincial de Madrid upheld
that on **19 July 2021**, holding *"no existe delito de odio ni delito electoral"* and framing the
poster as legitimate ideological-partisan struggle in an electoral contest. The panel was Sanz
Altozano presiding, García Sedano, and De Urbano Castrillo as ponente. The material was a Cercanías
poster reading *"Un mena 4.700 euros al mes, tu abuela 426 euros de pensión/mes"*.

The appellants included the **Fiscalía itself**, alongside PSOE, Podemos, Izquierda Unida, the Unidas
Podemos coalition and the association *Progresa*. Even prosecutorial backing produced no adverse
ruling.

**What finally closed it:** the Tribunal Constitucional declined Podemos's *amparo* for want of
*especial trascendencia constitucional* (reported 23 January 2023).

Three constraints the verifiers insisted on, and they are now in the code comments too:

- The correct label is **"case archived; the court found no *indicios* of an art. 510 CP offence"** —
  never "acquitted". Both decisions are autos confirming *sobreseimiento* at the instruction stage,
  not merits judgments.
- All verification is secondary press. **The auto's roll number was never pinned**, so the primary
  text should be pulled before the case reference itself is published.
- An earlier AP Madrid resolution on the same matter is reported, so **more than one auto may exist**.

### Electoral boards refuse the question — 3-0

The Junta Electoral de **Zona** de Madrid resolved on **Monday 26 June 2023**, after a PSOE complaint
around 22 June and a parallel complaint by the Asociación Española contra las Terapias de Conversión,
ordering Vox to remove a *lona* from a calle Alcalá façade within *"plazo de un día"*. It came down
around midday on 27 June.

The ground was **LOREG art. 53 plus JEC Instrucción 3/2011** — commercially contracted propaganda
outside the campaign period. The board **expressly declared itself not competent** to rule on the
content's possible illegality, because its remit is the regularity of campaign acts, and **opened no
sanctioning file**. The competence limit is not a one-off: in the 2021 *menas* matter the Junta
Electoral **Provincial** de Madrid likewise declared itself incompetent on content and referred the
complaint onward to the courts and the Fiscalía.

Corroborated across COPE, Telecinco, Servimedia, eldiario.es, Ara, Público, El Plural and Demócrata —
politically diverse, so not a press-release artefact. Three cautions: the deciding body was a Junta
Electoral de Zona, **not the JEC**; the primary *acuerdo* text was not retrieved; and **JEZ acuerdos
are published in no machine-readable register**, so secondary reporting is the practical ceiling.

A tracker must label such a record as an **electoral-timing/advertising infringement only**. But the
category must not be generalised into "Juntas never act on content" — an adverse order also exists
over a 2023 Vox poster depicting a hand throwing an LGBTIQ+ flag into a bin. Whether that is the same
*lona* as the calle Alcalá one or a separate item is not settled by the material gathered here.

### One live named prosecution — 3-0

The **Tribunal de Instancia de València, Sección de Instrucción nº 15** ordered the opening of oral
trial against sitting Vox Valencia city councillor **Cecilia Herrero** for hate offences, with the
**Audiencia Provincial de Valencia** designated as trial court. The conduct is roughly 30 posts on X
between April 2020 and April 2024 targeting migrants, LGBTQI+ people, racialised persons and people
with disabilities. The Fiscalía seeks **3 years' imprisonment plus a 12-month fine at €20/day plus
*inhabilitación***. Sección Cuarta of the Audiencia Provincial de Valencia dismissed her appeal
against the *auto de procedimiento abreviado*, finding sufficient *indicios*. Reported 26–27 May 2026
by five outlets across the political spectrum, including right-leaning ones — which cuts against
outlet bias.

**Correction to this document's earlier draft.** It said the charge was "under art. 510.1 and 510.2".
A verifier pulled the Europa Press copy of the auto, which pleads **510.1 a) + 510.3 + 510.5 + 510.6,
or alternatively 510.2 a) + 510.3 + 510.5 + 510.6** — principal and subsidiary qualifications that
are mutually exclusive, not a joint charge. The earlier draft also dropped the subsections that
actually drive the outcome: **510.3** (aggravation for diffusion via internet or social media),
**510.5** (*inhabilitación especial*) and **510.6**. Treat the 510.1/510.2 framing as the press
summary and the alternative pleading as the accurate one.

Three hard constraints: this is an *auto de apertura de juicio oral*, so the only honest label is
**"processed / awaiting trial"**, never "committed a hate crime"; instruction-phase autos are
generally **not in CENDOJ**, so the record is docketable at the court but not retrievable from the
open jurisprudence database; and publishing it processes a living person's criminal-proceedings data,
engaging GDPR Art. 10 and LO 1/1982.

### Supreme Court records run both ways — 3-0

The Sala de lo Penal's auto of **29 July 2021** (referencing autos of 8 November 2018 and 21 June
2021, ponente Julián Sánchez Melgar) **archived Vox's *querella* against Ione Belarra** over
statements at a 25 April 2021 Collado Villalba rally — *"publicidad filofascista"*, *"nazis, pero ya a
cara descubierta"* — holding that art. 510 CP protects social minorities and not other collectives
such as political parties. The *recurso de súplica* was rejected, so the auto stands.

As a per-politician record this documents **an archived complaint against Belarra**, and never hate
conduct by her. And *autos de inadmisión* in *causa especial* are not reliably retrievable from
CENDOJ, so the citable text comes in practice from the CGPJ press office — which defeats systematic
retrieval.

### Two general propositions were refuted — do not rely on them

- **"Art. 510 never covers political parties" — refuted 0-3.** The auto above holds what it holds in
  that case, but as doctrine the proposition fails. Art. 510.1 CP **expressly lists *ideología*** among
  the protected motives — *"motivos racistas, antisemitas, antigitanos u otros referentes a la
  ideología, religión o creencias, situación familiar, … etnia, raza o nación, origen nacional, sexo,
  orientación sexual o identidad sexual, razones de género, aporofobia, enfermedad o discapacidad"* —
  with *aporofobia* added by LO 8/2021. Circular 7/2019 FGE, the binding prosecutorial doctrine, reads
  *ideología* as political conceptions of state organisation (citing ecological, feminist and
  labour-rights collectives), states that **group vulnerability is not an element of the offence**,
  and says expressly that *"una agresión a una persona de ideología nazi, o la incitación al odio
  hacia tal colectivo, puede ser incluida en este tipo de delitos"*.
- **"Art. 71.1 CE inviolability structurally bars prosecution" — refuted 0-3.** Do not carry it as
  doctrine.
- **"Circular 7/2019 requires *peligro real*" — refuted 0-3.** This document's earlier draft had the
  bar backwards. The Circular classes art. 510 hate offences as ***delitos de peligro abstracto***:
  *"no es preciso un peligro concreto, siendo suficiente el peligro abstracto, si bien puede
  entenderse que es suficiente el peligro potencial o hipotético"*, requiring only *"la aptitud o
  idoneidad para generar un clima de odio o discriminación"*. The one exception is the result offence
  in the first part of art. 510.2 a). The phrase *"peligro real"* comes from STS 259/2011 and the
  Circular then reads it down to abstract danger.

## 3. The statistical baseline

### Police-recorded incidents — 3-0 on the undercount, figures verified against the ministry

The Ministerio del Interior series is **self-declared as a floor**: *"aquí no están todos los hechos
acaecidos en este ámbito debido a la infradenuncia existente, como ha advertido la propia Agencia de
Derechos Fundamentales de la Unión Europea (FRA)"*, and the 2021 *Encuesta sobre delitos de odio*
found **only one in ten** victims had reported. The report calls the remainder the *cifra sumergida*
and publishes only the *cifra conocida*. OBERAXE independently puts non-reporting at ~90%.

**A verifier's aside was wrong, and checking it produced a real update.** One agent reported the
series standing at "2,417 incidents, +23.6%". That does not chain from the 2,268 this project had
published for 2023. The actual 2024 report — *Informe sobre la evolución de los delitos e incidentes
de odio en España (2024)*, published 28 July 2025 — records:

| | 2023 | 2024 | change |
|---|---|---|---|
| Total penal infractions and hate incidents | 2,268 | **1,955** | **−13.8%** |
| Racism / xenophobia | 856 | **804** | −6% |
| Sexual orientation and gender identity | 522 | **528** | +1.15% |

Antisemitism +60.9%, aporofobia +33.3%, clearance 71.9% (four points up), 905 people arrested or
investigated. Every figure reconciles against the 2023 base — 2,268 × 0.862 = 1,955; 856 × 0.94 =
804; 522 × 1.0115 = 528 — and OBERAXE, a second ministry, publishes the same numbers. So the 2023
figures were right and the site was a year stale **while pointing the wrong way**: it showed a 21.35%
rise as the latest word when the latest word is a 13.8% fall. `lib/hate-context.ts` now carries 2024
with 2023 kept beside it, and `signedPercent` was added because the page hardcoded a `+`.

Consequence for the tracker, unchanged: this series measures **police recording and reporting
propensity, not incidence**, so it cannot support causal claims about political discourse.

### Prosecution output — 3-0, and the figures this document had given up on

The three figures the earlier draft dropped as unverifiable are now confirmed, with the panel
checking the arithmetic itself. Memoria FGE 2025, cap. III.10.4, for 2024:

- **477** *diligencias de investigación* opened (511 in 2023)
- **293** *escritos de acusación* (210 in 2023 — **+39.5%**, not the "~40%" of press summaries)
- **173** sentences: **129 convictions** and **44 acquittals**. The Memoria prints the conviction rate
  as 74.5%; the exact ratio is 74.57%, so the site derives it and renders 74.6% rather than
  transcribing a truncation
- Most prosecuted offence **art. 510.2 a) CP, 162 accusations vs 85** in 2023
- Investigations by motive: racism/xenophobia 150, sexual orientation and gender identity 93,
  antisemitism 33, ideology 32

**Two traps the verifiers flagged.** "Preprocedural investigations" is a loose rendering of
*diligencias de investigación incoadas*. And the motive breakdown differs by stage — at accusation
level it is racismo/xenofobia 121, orientación/identidad 119, ideología 19 — so **the two sets must
never be conflated**; the memoria also tracks *nación u origen nacional* separately at 127, which
means the 150 is not an exhaustive xenophobia total. `lib/hate-context.ts` records which stage each
number belongs to.

### The institutional channel exists, but is not a dataset — 2-1 on both halves

A national **Fiscal de Sala para los delitos de odio y contra la discriminación** has existed with
its own substantivity since **1 April 2015** (the post was created 10 October 2011 and absorbed into
the Fiscal de Sala de Criminalidad Informática on 12 December 2012), with *Fiscales Delegados* in
every territorial office and *Fiscales de Enlace* in area offices. Since then: unit formally created
by **RD 311/2023**, coordinator appointed by RD 460/2023 (Miguel Ángel Aguilar García), two *adscritos*
by RD 579/2023 and 580/2023, **50 provincial delegados**. **Ley 15/2022 amended art. 18.3 EOMF** to
make a hate-crime case register in each Fiscalía Provincial a legal obligation.

But it is **not a per-politician data source**. Published output is aggregate tables plus anonymised
case descriptions — a victim appears only as *"un jugador de fútbol del Real Madrid C. F."*, and no
defendant is named. As of the 2024 reporting year only **two internal applications were under
development for 2025**: unit case management, and the unified national registry required by art. 18.3
EOMF and art. 36 Ley 15/2022 (the 2024 memoria records only *"los primeros pasos"* as of September
2023). The FGE states its hate-crime statistics are compiled **manually by provincial specialists**
for want of adequate IT tools, and that when affected groups ask for data on their own collective it
is often impossible to answer reliably. Decisively: **these registries are internal case-management
systems, never designed as public datasets**, so even once live they do not become an API.

**Refuted 0-3:** the claim that the FGE's IT-gap statement means art. 510 data exists "only as
aggregate annual counts". The quoted sentence — *"los sistemas informáticos judicial y de la Fiscalía
… siguen presentando lagunas y carencias, situación que impide disponer de una cifra global y
pormenorizada de dicha realidad"* — is a **reliability caveat about the real-world phenomenon**, not
a statement about retrievability, and the same page itemises well past a bare count.

### Correlation research still does not give Spain what it needs

Unchanged from the earlier draft and not re-adjudicated: Müller & Schwarz (AEJ: Applied Economics)
build a causal design linking a named politician's dated statements to next-day hate-crime counts,
reproduced by Institute for Replication paper #246 (2025) — but it is US-focused and cannot support
claims about Spain. A German study across 400 municipalities finds AfD 2017 vote share and reported
anti-refugee hate crimes correlate at r = 0.50 (p < 0.001) on 2,211 incidents, and the authors
explicitly disclaim causal interpretation; unemployment predicts both outcomes and the foreigner-share
effect reverses sign between West and East Germany. Any Spanish version would need an instrument, not
a scatter plot — and the Spanish series measures recording under acknowledged ~90% under-reporting.

## 4. The legal wall, which decides the feature

**Verified, and the mechanism is sharper than the earlier draft had it.**

### CENDOJ cannot be a named-politician conviction register — 3-0

Publication of judgments is a **CGPJ statutory duty under art. 560.1.10ª LOPJ** (as amended by LO
4/2018 and LO 7/2021, still in force) — but only for resolutions *"que se determinen"*. **Reglamento
1/2005 art. 7** is the article constituting the CENDOJ channel, and it conditions treatment and
dissemination on data-protection law and on **LOPJ arts. 234 and 266**: *"En el tratamiento y difusión
de las resoluciones judiciales se cumplirá lo dispuesto en la legislación en materia de protección de
datos personales y en los artículos 234 y 266"*. The consolidated text was last modified by Pleno
acuerdo of **12 February 2025** (BOE 20 February 2025), touching the publication-and-reuse section —
so re-check arts. 4 and 7 before relying on them.

Three things make this decisive:

- **CENDOJ pseudonymises by design.** It substitutes real names with randomly assigned archaic Spanish
  given names — Saturnino, Candelaria, Venancio, Eulalia — chosen to avoid collision with real
  identities, in judgments containing up to ~500 names. CGPJ: *"todas las resoluciones que se publican
  en la web han sido anonimizadas"*.
- **Coverage is selective exactly where it matters.** CGPJ publishes the Tribunal Supremo plus *"una
  selección creciente"* of single-judge resolutions — and single-judge courts are where most art. 510
  CP convictions sit.
- **The one statutory carve-out excludes art. 510.** LOPJ art. 235 requires *interés legítimo y
  directo* plus prior *disociación*; art. 235 bis governs dissociation for access to sentencia texts;
  art. 236 quinquies covers suppression of personal data. Art. 235 bis makes the *fallo*'s personal
  data public only for a **closed list of Hacienda Pública offences** (CP arts. 305, 305 bis, 306, and
  257/258 where the creditor is the Treasury), and not where the amount was paid before *firmeza*.
  **Art. 510 CP sits outside that list.**

Also: **art. 453 LOPJ** — only the issuing judicial body can certify a judgment's legally effective
publication date, not the CENDOJ web copy. And by contrast the **Tribunal Constitucional does publish
party names**; it is a different channel.

**Two propositions refuted, both of which this document had asserted:**

- *"CENDOJ is the single institutional retrieval point for named-defendant judgments"* — **0-3**,
  refuted precisely because CENDOJ is **not** a named-defendant source. Also, art. 619 LOPJ *defines*
  CENDOJ as an *órgano técnico*; it did not create it (the CGPJ created it in 1997, HQ inaugurated in
  San Sebastián on 16 July 1997), and the function list the draft cited belongs to art. 560.1.10ª. The
  draft welded the two together.
- *"Reglamento 1/2005 art. 7 makes CENDOJ a comprehensive corpus"* — **0-2**. The remission duty is
  universal in text (*"copia de todas las sentencias"*), but the **published database is selective**,
  per CGPJ's own description. Universal remission does not mean universal publication.

Note too that the CGPJ institutional page is itself silent on whether names are removed,
pseudonymised or retained, and cites neither Reglamento 1/2005 nor LO 3/2018 — so it cannot alone
settle republication questions.

### Third-party access is conditioned — 2-1

Under **Reglamento 1/2005 art. 4** the requester must state the cause justifying their interest
(*"exponiendo la causa que justifica su interés"*), the Secretario — now *Letrado de la Administración
de Justicia* after LO 7/2015, though the Reglamento's consolidated wording still says *Secretarios* —
assesses that justification and whether to omit personal data, and where there is no personal and
direct interest data must be omitted to safeguard *intimidad personal y familiar, honor y propia
imagen*. Art. 5 applies the same criteria to *certificaciones* and *testimonios*.

Scoping caveats the verifiers added: art. 4 governs the **request-for-copy channel**, so "must justify
interest" is not the operative constraint on bulk retrieval of already-anonymised jurisprudence; the
honour triad is the **purpose clause of a redaction assessment**, not a free-standing veto; it echoes
art. 18.1 CE rather than LO 1/1982's civil regime; and the lawfulness of republishing a named person's
conviction runs through **LOPJ arts. 235 bis/ter, Reglamento 3/2018 CGPJ and GDPR Art. 10** rather
than through art. 4.2.

### Art. 10 LOPDGDD — verified directly against BOE

The harness never adjudicated this, because its only source was rated unreliable and yielded no
claims. It was therefore checked against the BOE consolidated text of LO 3/2018 (last modified
**27 December 2025**), and the live methodology page's claim holds. The chain is three paragraphs:

- **10.1** — processing data on criminal convictions and offences, and on related proceedings and
  precautionary or security measures, *for purposes other than* prevention, investigation, detection
  or prosecution of offences or execution of criminal sanctions, is lawful **only where covered by a
  norm of EU law, this organic law, or another norm of statutory rank**.
- **10.2** — the ***registro completo*** of that data under GDPR Art. 10 runs through the *Sistema de
  registros administrativos de apoyo a la Administración de Justicia*.
- **10.3** — outside those cases, such processing is possible **only when carried out by *abogados* and
  *procuradores***, and only to collect information supplied by their own clients.

### STC 58/2018

Not re-adjudicated in this round; it was in the claim pool but ranked below the cap. The earlier
draft's account stands as a lead, not a verified finding: STC 58/2018 (ECLI:ES:TC:2018:58, 4 June
2018) recognised the *derecho al olvido* as derived from art. 18.4 CE and treated **retrievability of
the person by name via a general search engine** as the decisive harm, balancing arts. 18.1 and 18.4
CE against art. 20.1 d). It concerned a digital press archive rather than an official judicial
database, so it constrains republication of press reports rather than citation of judgments — but the
balancing test is the one that would be applied. **The live methodology page cites it; verify it
against the primary ruling before relying on it further.**

### Read together

A tag reading "convicted of a hate crime" is **not safely buildable from bulk retrieval**, and the
reason is now precise: the published corpus is pseudonymised, selective below the Tribunal Supremo,
and the single statutory carve-out that would publish names covers Treasury offences and not art. 510.
Re-identifying a defendant via case number, court and dates is **a legal hazard, not a workaround**.

What is defensible: **official aggregate figures** (Fiscalía, Interior) and **individually sourced,
currently-newsworthy proceedings** with their status and outcome stated — including the negative
outcomes, like the *menas* archiving and the Belarra *querella*.

## 5. How others classify discourse defensibly

**ODIHR's rule, confirmed 3-0, is the one to copy.** ODIHR publishes cases reported by civil society,
IGOs and the Holy See as **"incidents"** and government submissions as **"crimes"**, precisely because
it cannot verify whether a reported event met a criminal threshold. Generalised: **the label must
match the evidentiary status of the source record.**

Two qualifications that sharpen the transfer rather than weakening it: ODIHR's "crimes" tier attaches
to **police-recorded** data and it has **no conviction tier at all** — so a tracker distinguishing
conviction from accusation from archived complaint is building finer tiers than ODIHR's, which is the
right direction. And ODIHR's own FAQ warns that state-submitted data **do not evidence prevalence**
and cannot be used for cross-country comparison.

**Refuted 0-3:** the claim that ODIHR endorses recording bias motivation without victim or perpetrator
demographics as a data-protection-safe design pattern. Do not cite that.

The other three precedents were not re-adjudicated; they remain leads from the earlier draft. ILGA-
Europe's Rainbow Map (76 criteria, seven weighted categories, hate crime and hate speech at 19%) is a
precedent for scoring **states, not people**, and explicitly does not measure societal acceptance. The
Manifesto Project codes the quasi-sentence on **manifest content only**, has no "hate speech"
category, and its reliability is contested (Mikhaylov, Laver & Benoit, *Political Analysis* 20(1),
78–91). Arcópoli's Observatorio Madrileño counts *incidentes de odio o discriminatorios* — a broader
unit than criminal law — and **drops cases whose motivation is doubtful rather than coding them by
inference**; when it named an organised actor it attached explicit hedging and anchored the claim to a
dated formal filing.

## 6. What this points the build at

Not a classifier. A **record ledger**, per the project's existing pattern:

1. **Spending categories from the fiscalización PDFs** — **done** for one election, and the finding is
   that 54.5% of declared ordinary spending is a residual line the report does not break down. Repeat
   for the general and autonomous elections.
2. **Two hard party-level facts that need no interpretation**: filing compliance against the 30 June
   statutory deadline, and TdC sanction proposals such as non-award of subsidy.
3. **Official aggregates, cited not inferred** — now with 2024 figures and the stage each number
   belongs to, each printed beside its dark-figure caveat.
4. **Individually sourced proceedings**, with status, outcome and presumption of innocence stated, and
   negative outcomes recorded as such. The label vocabulary is settled: *convicted* / *processed,
   awaiting trial* / *case archived, no indicios found* / *administrative infringement*. Never
   "acquitted" for an archiving.
5. **A stated non-goal on the page**: no derived "hateful" score, following ODIHR's rule that the label
   must match the evidentiary status of its source.

The honest headline is not "these parties fund hate". It is that **the money's destination is declared
only in PDFs, more than half of it in a single line nobody itemises, and no Spanish authority has ever
ruled that a party's campaign spending constituted hate speech** — the one criminal attempt was
archived, upheld on appeal with the Fiscalía among the appellants, and closed when the Constitutional
Court declined *amparo*. That is a finding, and it is publishable.

---

## Open questions the run could not close

1. Do Junta Electoral Central and provincial acuerdos on campaign content exist as a **systematic,
   citable, name-bearing series** (BOE, JEC site, or otherwise), retrievable programmatically? This is
   the most promising name-bearing channel identified and its shape is unknown.
2. Given CENDOJ pseudonymisation, what is the **lawful route** to establish and publish that a named
   politician was convicted under art. 510 CP — official cause lists, a certification from the issuing
   court under art. 453 LOPJ, or notoriety plus press — and how do GDPR Art. 10 and LO 1/1982
   constrain republication once established?
3. Does any peer-reviewed work establish a defensible relationship between political discourse and
   reported hate-crime incidence **in Spain**, surviving the fact that the series measures recording
   under ~90% under-reporting?
4. Angle 1 as the harness would have answered it: does anything expose Tribunal de Cuentas party
   accounting **beyond PDFs**?

## Resuming or extending the run

Cap is at 28 of 124 claims. To go further, raise `MAX_VERIFY_CLAIMS` in the script and resume — the
cache is keyed on each agent's prompt, not on the cap, so **every vote already cast replays free** and
only the newly admitted claims cost anything. Climb in steps of ~14; a jump to 40 fires 120 verifier
agents at once and hits the session rate limit, which reports as "unverified" rather than as failure.

```
Workflow({ scriptPath, resumeFromRunId: "wf_bc339ba2-a53", args })
```

**The gotcha:** `resumeFromRunId` replays the script but does **not** carry `args`. Resuming without
re-passing the question makes the script exit in 9 ms with *"No research question provided"* — and
because `QUESTION` is interpolated into every prompt, a paraphrased question invalidates the whole
cache. Pass `scriptPath`, `resumeFromRunId` **and** the byte-exact `args` together. The question text
is stored in `_research-hate-accountability-claims.json` under `question`.

Script: `.claude/projects/C--politician-tracking-app/<session>/workflows/scripts/deep-research-wf_bc339ba2-a53.js`
