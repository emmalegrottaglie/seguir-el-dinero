// Build the roster of sitting deputies from the Congreso de los Diputados open-data portal and
// each deputy's ficha, and cache their asset declarations for transcription.
//
// Usage: npm run build:deputies
//
// Writes:
//   data/deputies.json  — the sitting deputies: Congreso's own name for them, constituency,
//                         electoral formation, parliamentary group, start date, the ficha URL, and
//                         every declaration the ficha links, dated from its filename.
//   data/interests.json — the Declaraciones de Intereses Económicos, row for row as the open-data
//                         file publishes them (keys renamed, values untouched).
//   data/_declaraciones/<cod>.pdf — each deputy's first Bienes y Rentas filing of the
//                         legislature, the one made on taking the seat. Gitignored (*.pdf).
//
// The Bienes y Rentas filings are scanned images with no usable text layer, so this script only
// fetches them; transcription is a separate, verified step (scripts/build-declarations.mjs).
//
// Aborts rather than writing a partial roster: every open-data roster name must reconcile with
// exactly one ficha of the legislature, and every slug must be unique.

import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { nameKey, foldTokens } from "../lib/name-key.mjs";
import { deputySlug } from "../lib/deputy-join.mjs";

// Congreso refuses requests without a browser User-Agent (AGENTS.md).
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const BASE = "https://www.congreso.es";
const LEGISLATURE = "XV";
const OPEN_DATA = `${BASE}/es/opendata/diputados`;
const PDF_DIR = path.join(process.cwd(), "data", "_declaraciones");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return res;
    if (attempt < 3 && (res.status === 429 || res.status >= 500)) {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    throw new Error(`${res.status} ${url}`);
  }
}

/** "01/08/2023" or "20230801" to "2023-08-01". */
function isoDate(s) {
  const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const ymd = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;
  throw new Error(`unrecognised date: ${s}`);
}

const clean = (s) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim() || null : null);

// ---- open data ----------------------------------------------------------------------------

const portal = await (await get(OPEN_DATA)).text();
function openDataUrl(prefix) {
  const m = portal.match(new RegExp(`/webpublica/opendata/diputados/${prefix}__\\d+\\.json`));
  if (!m) throw new Error(`no ${prefix} file linked from ${OPEN_DATA}`);
  return BASE + m[0];
}

const rosterUrl = openDataUrl("DiputadosActivos");
const womenUrl = openDataUrl("Diputadas");
const interestsUrl = openDataUrl("docacteco");
const roster = await (await get(rosterUrl)).json();
const women = await (await get(womenUrl)).json();
const interestRows = await (await get(interestsUrl)).json();
console.log(`roster: ${roster.length} sitting deputies; interests: ${interestRows.length} rows`);

const womenKeys = new Set(
  women
    .filter((w) => w.LEGISLATURA === `Leg. ${LEGISLATURE}`)
    .map((w) => nameKey(`${w.NOMBRE} ${w.APELLIDOS}`)),
);

// ---- fichas -------------------------------------------------------------------------------

function fichaUrl(cod) {
  return (
    `${BASE}/es/busqueda-de-diputados?p_p_id=diputadomodule&p_p_lifecycle=0&p_p_state=normal` +
    `&p_p_mode=view&_diputadomodule_mostrarFicha=true&codParlamentario=${cod}` +
    `&idLegislatura=${LEGISLATURE}`
  );
}

const KIND = { docbienes: "bienes", docacteco: "intereses" };

const fichas = [];
for (let cod = 1, misses = 0; misses < 30; cod++) {
  await sleep(250); // be a polite client
  const url = fichaUrl(cod);
  const html = await (await get(url)).text();
  const title = html.match(/<title>\s*([^<]*?)\s+-\s+XV Legislatura\s+-\s+Congreso de los Diputados/);
  if (!title) {
    misses++;
    continue;
  }
  misses = 0;
  const filings = [];
  for (const m of html.matchAll(/href="(\/(docbienes|docacteco)\/leg15\/[^"]+?_(\d{8})\.pdf)"/g)) {
    filings.push({ kind: KIND[m[2]], date: isoDate(m[3]), url: BASE + m[1] });
  }
  const activities = html.match(/href="(\/docinte\/registro_intereses_diputado_\d+\.pdf)"/);
  if (activities) filings.push({ kind: "actividades", date: null, url: BASE + activities[1] });
  filings.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  fichas.push({ cod, fullName: clean(title[1]), ficha: url, filings });
  if (fichas.length % 50 === 0) console.log(`  … ${fichas.length} fichas (cod ${cod})`);
}
console.log(`fichas: ${fichas.length} for the ${LEGISLATURE} legislature`);

// ---- reconcile roster with fichas -----------------------------------------------------------

const fichaByKey = new Map();
for (const f of fichas) {
  const k = nameKey(f.fullName);
  fichaByKey.set(k, [...(fichaByKey.get(k) ?? []), f]);
}

const problems = [];
const deputies = [];
for (const r of roster) {
  const name = clean(r.NOMBRE);
  let hits = fichaByKey.get(nameKey(name)) ?? [];
  let via = "name";
  if (hits.length === 0) {
    // Both records are Congreso's own for one legislature, so a unique token-subset match
    // (the roster sometimes drops a second given name) is the same person. Still printed.
    const tokens = foldTokens(name);
    hits = fichas.filter((f) => {
      const ft = new Set(foldTokens(f.fullName));
      return tokens.every((t) => ft.has(t));
    });
    via = "tokens";
  }
  if (hits.length !== 1) {
    problems.push(`${name}: ${hits.length} fichas match`);
    continue;
  }
  const f = hits[0];
  if (via === "tokens") console.log(`  reconciled by tokens: ${name} = ${f.fullName}`);
  deputies.push({
    slug: deputySlug(f.fullName),
    name,
    fullName: f.fullName,
    cod: f.cod,
    ficha: f.ficha,
    role: womenKeys.has(nameKey(name)) || womenKeys.has(nameKey(f.fullName)) ? "Diputada" : "Diputado",
    constituency: clean(r.CIRCUNSCRIPCION),
    formation: clean(r.FORMACIONELECTORAL),
    group: clean(r.GRUPOPARLAMENTARIO),
    since: isoDate(clean(r.FECHAALTA)),
    filings: f.filings,
  });
}

const slugs = new Map();
for (const d of deputies) slugs.set(d.slug, [...(slugs.get(d.slug) ?? []), d.name]);
for (const [slug, names] of slugs) if (names.length > 1) problems.push(`slug ${slug} shared by ${names.join(" / ")}`);
for (const d of deputies) {
  if (!d.filings.some((f) => f.kind === "bienes")) console.warn(`  no Bienes y Rentas filing linked: ${d.name}`);
}

if (problems.length) {
  console.error(`\nFAIL — roster does not reconcile:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}

deputies.sort((a, b) => a.name.localeCompare(b.name, "es"));

// ---- interests ----------------------------------------------------------------------------

const interests = interestRows.map((r) => ({
  name: clean(r.NOMBRE),
  registered: r.FECHAREGISTRO ? isoDate(clean(r.FECHAREGISTRO)) : null,
  declaration: clean(r.DECLARACION),
  type: clean(r.TIPO),
  period: clean(r.PERIODO),
  employer: clean(r.EMPLEADOR),
  sector: clean(r.SECTOR),
  description: clean(r.DESCRIPCION),
  recipient: clean(r.DESTINATARIO),
  benefactor: clean(r.BENEFACTOR),
  observations: clean(r.OBSERVACIONES),
}));

// ---- PDFs ---------------------------------------------------------------------------------

mkdirSync(PDF_DIR, { recursive: true });
let fetched = 0;
for (const d of deputies) {
  const first = d.filings.find((f) => f.kind === "bienes");
  if (!first) continue;
  const file = path.join(PDF_DIR, `${d.cod}.pdf`);
  if (existsSync(file) && readFileSync(file).subarray(0, 4).toString() === "%PDF") continue;
  await sleep(250);
  const bytes = Buffer.from(await (await get(first.url)).arrayBuffer());
  if (bytes.subarray(0, 4).toString() !== "%PDF") throw new Error(`not a PDF: ${first.url}`);
  writeFileSync(file, bytes);
  fetched++;
}
console.log(`PDFs: ${fetched} downloaded to data/_declaraciones (others already cached)`);

// ---- write --------------------------------------------------------------------------------

const generatedAt = new Date().toISOString();
writeFileSync(
  "data/deputies.json",
  JSON.stringify(
    {
      generatedAt,
      source: {
        name: "Congreso de los Diputados — Datos Abiertos (diputados) y fichas de diputado",
        url: OPEN_DATA,
      },
      legislature: LEGISLATURE,
      count: deputies.length,
      deputies,
    },
    null,
    2,
  ) + "\n",
  "utf-8",
);
writeFileSync(
  "data/interests.json",
  JSON.stringify(
    {
      generatedAt,
      source: {
        name: "Congreso de los Diputados — Datos Abiertos, declaraciones de intereses económicos",
        url: OPEN_DATA,
        file: interestsUrl,
      },
      count: interests.length,
      rows: interests,
    },
    null,
    2,
  ) + "\n",
  "utf-8",
);
console.log(`\nwrote data/deputies.json — ${deputies.length} deputies`);
console.log(`wrote data/interests.json — ${interests.length} rows`);
