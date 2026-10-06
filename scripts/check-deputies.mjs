// Guards the join between Congreso's roster of sitting deputies (data/deputies.json) and the pay
// register (data/salaries.json), using the same rule the app runs (lib/deputy-join.mjs).
//
// Usage: npm run check:deputies
//
// Fails rather than warns when:
//   - an alias in DEPUTY_ALIASES points to a slug the register no longer has;
//   - a name match is refused because the two records' party families disagree;
//   - a deputy outside the register would take a slug a register row already uses;
//   - the join has silently stopped matching (fewer links than LINK_FLOOR).
//
// Deputies left unresolved because the register holds a similar but not identical name are
// listed with their candidates, for a person to read and, if they are the same person, to add to
// DEPUTY_ALIASES. Nothing joins on a candidate by itself.

import { readFileSync } from "node:fs";
import { linkDeputies, DEPUTY_ALIASES } from "../lib/deputy-join.mjs";
import { nameKey } from "../lib/name-key.mjs";

// 226 at the time of writing (217 by name, 9 by alias). A floor, not a target: substitutions
// move the count, a broken join collapses it.
const LINK_FLOOR = 200;

const register = JSON.parse(readFileSync("data/salaries.json", "utf8")).people;
const { deputies } = JSON.parse(readFileSync("data/deputies.json", "utf8"));
const interests = JSON.parse(readFileSync("data/interests.json", "utf8")).rows;

const { links, congresoOnly, unresolved } = linkDeputies(register, deputies);
const failures = [];

const registerSlugs = new Set(register.map((r) => r.slug));
for (const d of congresoOnly) {
  if (registerSlugs.has(d.slug)) failures.push(`slug ${d.slug} (${d.name}) is already a register slug`);
}
for (const u of unresolved) {
  if (u.reason === "alias-missing") failures.push(`alias for ${u.deputy.name} points to a missing slug`);
  if (u.reason === "party-family") {
    const r = u.candidates[0];
    failures.push(`${u.deputy.name} [${u.deputy.formation}] vs ${r.name} [${r.partyLabel}]: party families disagree`);
  }
}
if (links.length < LINK_FLOOR) failures.push(`only ${links.length} links, below the floor of ${LINK_FLOOR}`);
const stale = Object.keys(DEPUTY_ALIASES).filter((n) => !deputies.some((d) => d.name === n));
for (const n of stale) failures.push(`alias for ${n}, who is not in the roster`);

const byName = links.filter((l) => l.via === "name").length;
const byAlias = links.length - byName;
console.log(`deputies: ${deputies.length}`);
console.log(`  linked to a register row: ${links.length} (${byName} by name, ${byAlias} by alias)`);
console.log(`  profiles from Congreso alone: ${congresoOnly.length}`);
console.log(`  unresolved: ${unresolved.length}`);
for (const u of unresolved.filter((x) => x.reason === "candidate" || x.reason === "name-collision")) {
  console.log(`    ${u.deputy.name} [${u.deputy.formation}, ${u.deputy.constituency}] — ${u.reason}:`);
  for (const c of u.candidates) {
    console.log(`      ${c.slug} — ${c.name} · ${c.role} · ${c.partyLabel} · ${c.municipality ?? c.region ?? "—"}`);
  }
}

const interestKeys = new Set(interests.map((r) => nameKey(r.name)));
const withInterests = deputies.filter(
  (d) => interestKeys.has(nameKey(d.name)) || interestKeys.has(nameKey(d.fullName)),
).length;
console.log(`  with interest rows by exact name: ${withInterests}`);
const withBienes = deputies.filter((d) => d.filings.some((f) => f.kind === "bienes")).length;
console.log(`  with a Bienes y Rentas filing linked: ${withBienes}`);

if (failures.length) {
  console.error(`\nFAIL:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("\nOK");
