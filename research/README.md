# research/

Research output that later build work depends on, kept in the repo so it survives a session.

| File | What it is |
|---|---|
| `hate-accountability.md` | Party spending granularity, official hate-conduct records, and the legal constraints on naming individuals. **Complete: 28 claims adjudicated, 18 confirmed, 10 refuted.** The refutations are in the document beside the findings, because three of them corrected its own earlier draft. |
| `_research-hate-accountability-raw.jsonl` | Workflow journal, one record per agent, with cached results. Needed to resume the run without re-paying for the web phase. |
| `_research-hate-accountability-claims.json` | Every extracted claim, every adversarial vote, plus the synthesised findings, caveats and open questions. |

Files prefixed `_` are raw machine output. They are committed on purpose: without the journal the run
cannot be resumed from cache, and the claim set is the evidence behind the digest.

## Reading the digest

Findings carry their vote (`3-0`, `2-1`) and refutations carry theirs. A claim marked refuted was
adjudicated against **on its merits by two of three adversarial verifiers**, which is different from
a claim that was never adjudicated — the digest says which is which, and several refuted claims are
recorded precisely because an earlier draft of the digest had asserted them.

Two figures in the digest were verified outside the harness, against BOE and the ministry directly,
and are labelled as such: art. 10 LOPDGDD, and the 2024 Interior hate-crime series.
