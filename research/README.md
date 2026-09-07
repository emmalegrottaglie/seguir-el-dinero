# research/

Research output that later build work depends on, kept in the repo so it survives a session.

| File | What it is |
|---|---|
| `hate-accountability.md` | Party spending granularity, official hate-conduct records, and the legal constraints on naming individuals. **Incomplete — claims are unverified.** Read its status note first. |
| `_research-hate-accountability-raw.jsonl` | Workflow journal from the stopped run: one record per agent, with cached results. |
| `_research-hate-accountability-claims.json` | The 160 extracted claims plus the 10 adversarial verification votes. |

Files prefixed `_` are raw machine output. They are committed on purpose: without the journal the
run cannot be resumed from cache, and the claim set is the evidence behind the digest.
