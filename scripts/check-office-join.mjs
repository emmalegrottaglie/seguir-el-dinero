// Guards the officeholder join, so a refreshed register cannot quietly make it
// unsafe.
//
// This is the one join that attaches a named living private individual to a
// record they did not publish. lib/officeholder-ties.ts enforces two
// conditions before publishing a tie — one distinct post per folded name, and
// party agreement — but both rest on an assumption about the *data* that no
// amount of care in the code can establish: that a folded name is nearly
// always unique in this register. That is what this script checks, along with
// the things a refreshed export could silently break.
//
// What it deliberately does not re-check is the party condition. Doing so
// would mean reimplementing `partyNifFor` here in JavaScript, because the
// audit report writes "Partido Socialista Obrero Español" where the register
// writes "PSOE"; a second copy of that rule would drift from the first and a
// drifted check is worse than no check. The party condition lives in one
// place, and the fourteen matches it currently yields were read by eye.
//
// Run: npm run check:office-join

import { promises as fs } from "node:fs";
import path from "node:path";
import { nameKey } from "../lib/name-key.mjs";

const ROOT = process.cwd();

// Above this, a folded name is no longer discriminating enough to identify a
// person and the join needs a second key rather than a looser threshold.
const MAX_COLLISION_RATE = 0.005; // 0.5 %

function die(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

const register = JSON.parse(await fs.readFile(path.join(ROOT, "data/salaries.json"), "utf-8"));
const src = await fs.readFile(path.join(ROOT, "lib/foundation-people.ts"), "utf-8");

// --- the assumption: is a folded name unique here? ----------------------
const byKey = new Map();
for (const p of register.people) {
  const k = nameKey(p.name);
  if (!byKey.has(k)) byKey.set(k, []);
  byKey.get(k).push(p);
}

const sig = (p) => `${p.role}|${p.region ?? ""}|${p.municipality ?? ""}`;
const colliding = [...byKey.values()].filter((v) => new Set(v.map(sig)).size > 1);
const rate = colliding.length / byKey.size;

console.log(
  `register: ${register.people.length} rows, ${byKey.size} folded names, ` +
    `${colliding.length} covering >1 distinct post (${(rate * 100).toFixed(3)} %)`,
);
if (rate > MAX_COLLISION_RATE) {
  die(
    `collision rate ${(rate * 100).toFixed(3)} % exceeds ${(MAX_COLLISION_RATE * 100).toFixed(1)} %; ` +
      `a folded name no longer identifies a person in this register`,
  );
}

// --- the join, replayed against the same rules --------------------------
// The board names and their foundations, read from the curated module's source
// so this script needs no TypeScript toolchain.
const roles = [
  ...src.matchAll(/\{\s*foundation:\s*"([^"]+)",\s*person:\s*"([^"]+)"/g),
].map((m) => ({ foundation: m[1], person: m[2] }));

const allNames = new Set([...src.matchAll(/person:\s*"([^"]+)"/g)].map((m) => m[1]));
const paired = new Set(roles.map((r) => r.person));
const unpaired = [...allNames].filter((n) => !paired.has(n));
if (unpaired.length > 0) {
  die(
    `${unpaired.length} curated people whose foundation this script could not read ` +
      `(${unpaired.slice(0, 3).join(", ")}…). The ROLES literal's shape changed, so the ` +
      `party condition would be checked against nothing.`,
  );
}

const byPerson = new Map();
for (const r of roles) {
  if (!byPerson.has(r.person)) byPerson.set(r.person, new Set());
  byPerson.get(r.person).add(r.foundation);
}

let matched = 0;
const ambiguous = [];
const badSlug = [];

for (const [person] of byPerson) {
  const hits = byKey.get(nameKey(person)) ?? [];
  if (hits.length === 0) continue;
  if (new Set(hits.map(sig)).size > 1) {
    ambiguous.push(person);
    continue;
  }
  const office = hits[0];

  // Every tie links to the person's own page, so a slug the register does not
  // carry would render a 404 behind a named individual's public office.
  if (!register.people.some((p) => p.slug === office.slug)) badSlug.push(person);
  matched++;
}

console.log(`join: ${matched} of ${byPerson.size} board members matched to one public office`);

if (ambiguous.length > 0) {
  console.log(`  dropped as ambiguous: ${ambiguous.join(", ")}`);
}
if (badSlug.length > 0) {
  die(`slug not present in the register for: ${badSlug.join(", ")} — the tie would link to a 404`);
}
if (matched === 0) {
  die("no board member matched any office; the join has silently stopped working");
}

console.log("OK");
