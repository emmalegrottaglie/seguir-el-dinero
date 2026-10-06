// Guards data/declarations.json, the published transcriptions of the deputies' Bienes y Rentas
// filings.
//
// Usage: npm run check:declarations
//
// Always: every entry belongs to a sitting deputy and to the filing that deputy made on taking the
// seat, carries a verification method, and has totals that lib/declaration-totals.mjs can compute.
//
// Where the local caches exist (data/_rtve-totals.json and data/_transcriptions/, both gitignored),
// it also re-runs the check each entry claims: equal totals with RTVE, or with the second reading.
// Fails rather than warns.

import { existsSync, readFileSync } from "node:fs";
import { declarationTotals } from "../lib/declaration-totals.mjs";
import { foldTokens, nameKey } from "../lib/name-key.mjs";

const data = JSON.parse(readFileSync("data/declarations.json", "utf8"));
const { deputies } = JSON.parse(readFileSync("data/deputies.json", "utf8"));
const byCod = new Map(deputies.map((d) => [d.cod, d]));
const same = (a, b) => Math.abs((a ?? 0) - (b ?? 0)) < 0.005;

const failures = [];
const rtveRows = existsSync("data/_rtve-totals.json")
  ? JSON.parse(readFileSync("data/_rtve-totals.json", "utf8")).rows
  : null;
const rtveFor = (d) =>
  rtveRows.find((r) => nameKey(r.name) === nameKey(d.name) || nameKey(r.name) === nameKey(d.fullName)) ??
  (() => {
    const own = foldTokens(d.name);
    const hits = rtveRows.filter((r) => own.every((x) => new Set(foldTokens(r.name)).has(x)));
    return hits.length === 1 ? hits[0] : null;
  })();

let rechecked = 0;
for (const e of data.declarations) {
  const d = byCod.get(e.cod);
  if (!d) {
    failures.push(`${e.deputy}: cod ${e.cod} is not a sitting deputy`);
    continue;
  }
  const first = d.filings.find((f) => f.kind === "bienes");
  if (!first || first.url !== e.url) failures.push(`${e.deputy}: not the filing made on taking the seat`);
  if (!["rtve", "second-reading"].includes(e.verified?.method)) failures.push(`${e.deputy}: no verification`);
  const s = declarationTotals(e);

  if (e.verified?.method === "rtve" && rtveRows) {
    const r = rtveFor(d);
    if (!r || !(same(s.income, r.income) && same(s.financial, r.financial) && same(s.debts, r.debts))) {
      failures.push(`${e.deputy}: totals no longer equal RTVE's`);
    }
    rechecked++;
  }
  const bFile = `data/_transcriptions/${e.cod}.b.json`;
  if (e.verified?.method === "second-reading" && existsSync(bFile)) {
    const others = [`data/_transcriptions/${e.cod}.a.json`, bFile]
      .filter(existsSync)
      .map((f) => declarationTotals(JSON.parse(readFileSync(f, "utf8"))));
    if (!others.every((o) => ["income", "financial", "debts", "irpf"].every((k) => same(o[k], s[k])))) {
      failures.push(`${e.deputy}: readings no longer agree`);
    }
    rechecked++;
  }
}

console.log(`declarations: ${data.declarations.length}; unresolved: ${data.unresolved.length}`);
console.log(rtveRows ? `re-checked against local caches: ${rechecked}` : "local caches absent: structural check only");
if (failures.length) {
  console.error(`\nFAIL:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("\nOK");
