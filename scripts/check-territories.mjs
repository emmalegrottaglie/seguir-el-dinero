// Guards the name join between the four sources that describe a comunidad autónoma.
//
// The map, the governments, the hate-crime file and the provinces all key on
// INE's two-digit code. The register of senior appointments and INE's own survey
// tables key on names, in two different spellings — "Islas Baleares" in one and
// "Balears, Illes" in the other.
//
// `lib/territories.ts` writes those aliases out. This checks the table against
// what the data files actually contain, in both directions: a name in a data
// file that the table does not carry would silently drop a territory from a
// reader's local page, and a name in the table that no data file uses is a stale
// alias that will stop being noticed.
//
// Run: npm run check:territories

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const problems = [];
const fail = (m) => problems.push(m);

const read = async (f) => JSON.parse(await fs.readFile(path.join(ROOT, f), "utf-8"));

// Parsed from the TypeScript source rather than imported, like the repo's other
// checks, so this runs without a TypeScript toolchain.
const src = await fs.readFile(path.join(ROOT, "lib", "territories.ts"), "utf-8");
const body = src.slice(src.indexOf("export const TERRITORIES"), src.indexOf("const BY_ID"));

const field = (block, key) => {
  const m = block.match(new RegExp(key + ':\\s*(?:"((?:[^"\\\\]|\\\\.)*)"|null)'));
  if (!m) return undefined;
  return m[1] === undefined ? null : m[1];
};

const blocks = body
  .split(/\{\s*(?=id:)/)
  .slice(1)
  .map((b) => b.slice(0, b.lastIndexOf("}")));

const table = blocks.map((b) => ({
  id: field(b, "id"),
  mapName: field(b, "mapName"),
  registerName: field(b, "registerName"),
  ineName: field(b, "ineName"),
}));

if (table.length !== 19) fail(`${table.length} territories parsed from lib/territories.ts, expected 19`);
for (const t of table) {
  if (!t.id || !t.mapName || !t.registerName) {
    fail(`territory ${t.id ?? "?"}: incomplete row`);
  }
}

const [regions, salaries, indicators, hate, provinces] = await Promise.all([
  read("data/regions.json"),
  read("data/salaries.json"),
  read("data/indicators.json"),
  read("data/hate-territory.json"),
  read("data/provinces.json"),
]);

const ids = new Set(table.map((t) => t.id));

// --- the code-keyed sources ------------------------------------------------
for (const [label, keys] of [
  ["data/regions.json", regions.regions.map((r) => r.id)],
  ["data/hate-territory.json", Object.keys(hate.territories)],
  ["data/provinces.json", [...new Set(provinces.provinces.map((p) => p.territoryId))]],
]) {
  for (const k of keys) if (!ids.has(k)) fail(`${label}: territory id ${k} is not in the table`);
  for (const t of table) {
    if (!keys.includes(t.id)) fail(`${label}: no entry for territory ${t.id} ${t.mapName}`);
  }
}

// The map's own label has to match, since the table claims to carry it.
for (const r of regions.regions) {
  const t = table.find((x) => x.id === r.id);
  if (t && t.mapName !== r.name) {
    fail(`data/regions.json: territory ${r.id} is named "${r.name}", the table says "${t.mapName}"`);
  }
}

// --- the name-keyed sources ------------------------------------------------
const registerNames = new Set(salaries.people.map((p) => p.region).filter(Boolean));
for (const n of registerNames) {
  if (!table.some((t) => t.registerName === n)) {
    fail(`data/salaries.json: region "${n}" has no alias in the table`);
  }
}
for (const t of table) {
  if (!registerNames.has(t.registerName)) {
    fail(`lib/territories.ts: registerName "${t.registerName}" appears in no register row`);
  }
}

// INE names come from several tables. EAES omits Ceuta and Melilla, so a name
// present in one table and absent from another is normal; a name present in the
// data and absent from the table is not.
const ineNames = new Set([
  ...indicators.wages.percentiles.map((r) => r.region),
  ...indicators.poverty.regional.map((r) => r.region),
]);
ineNames.delete("Total Nacional");
for (const n of ineNames) {
  if (!table.some((t) => t.ineName === n)) {
    fail(`data/indicators.json: region "${n}" has no alias in the table`);
  }
}
for (const t of table) {
  if (t.ineName !== null && !ineNames.has(t.ineName)) {
    fail(`lib/territories.ts: ineName "${t.ineName}" appears in no INE series`);
  }
}

console.log(
  `${table.length} territories, ${registerNames.size} register spellings, ` +
    `${ineNames.size} INE spellings, ${provinces.provinces.length} provinces — all resolved`,
);

if (problems.length > 0) {
  console.error("FAIL:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("OK");
