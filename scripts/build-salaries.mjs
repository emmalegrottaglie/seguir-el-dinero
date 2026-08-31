// Build data/salaries.json from the sueldode.com / Registro de Altos Cargos CSV export.
//
// Usage:  node scripts/build-salaries.mjs <path-to-csv>
//
// Keeps only currently-active officeholders (activo=1), trims the columns the app
// actually renders, and attaches a canonical party key so salaries can be joined
// against the BDNS subsidy data (which is keyed by party NIF).

import { readFileSync, writeFileSync } from "node:fs";

// Party labels in the CSV mapped to the canonical NIF used by the BDNS subsidy
// registry (lib/parties.ts). Only labels we can match with confidence are listed;
// anything else keeps its raw label and gets no NIF, so it simply does not join.
const PARTY_BY_LABEL = {
  "Partido Popular": { nif: "G28570927", short: "PP" },
  PSOE: { nif: "G28477727", short: "PSOE" },
  "Partit dels Socialistes de Catalunya": { nif: "G08564379", short: "PSC" },
  Vox: { nif: "G86867108", short: "Vox" },
  PNV: { nif: "G48103956", short: "PNV" },
  ERC: { nif: "G08678120", short: "ERC" },
  "EH Bildu": { nif: "G71206700", short: "EH Bildu" },
  "Junts per Catalunya": { nif: "V13942677", short: "Junts" },
  Ciudadanos: { nif: "G64283310", short: "Cs" },
  "Más Madrid": { nif: "G88309315", short: "Más Madrid" },
  Sumar: { nif: "G13855663", short: "Sumar" },
  "Izquierda Unida": { nif: "G78269206", short: "IU" },
  Podemos: { nif: "G86976941", short: "Podemos" },
  "Coalición Canaria": { nif: "V38319562", short: "CC" },
  CCa: { nif: "V38319562", short: "CC" },
  Compromís: { nif: "G98282213", short: "Compromís" },
  "Unión del Pueblo Navarro": { nif: "G31096274", short: "UPN" },
  BNG: { nif: "G32014003", short: "BNG" },
  "Partido Regionalista de Cantabria": { nif: "G39036579", short: "PRC" },
  "Foro Asturias": { nif: "G74297664", short: "Foro" },
};

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("usage: node scripts/build-salaries.mjs <path-to-csv>");
  process.exit(1);
}

// Minimal RFC-4180 parser: handles quoted fields containing commas/newlines.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const raw = readFileSync(csvPath, "utf-8").replace(/^﻿/, "");
const [header, ...lines] = parseCsv(raw);
const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

const num = (v) => {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

const people = [];
// slug -> index in `people`, so duplicate slugs resolve deterministically
// instead of depending on the row order of the export.
const seen = new Map();

for (const r of lines) {
  if (r.length < header.length) continue;
  if (r[col.activo] !== "1") continue; // active officeholders only

  const slug = r[col.slug]?.trim();
  const name = r[col.nombre]?.trim();
  const gross = num(r[col.sueldo_bruto_anual]);
  if (!slug || !name || gross === null) continue;

  const partyLabel = r[col.partido]?.trim() || "";
  const canon = PARTY_BY_LABEL[partyLabel] ?? null;
  const updated = r[col.fecha_actualizacion]?.trim() || "";

  const row = {
    slug,
    name,
    role: r[col.cargo]?.trim() || "",
    partyLabel,
    partyNif: canon?.nif ?? null,
    partyShort: canon?.short ?? partyLabel,
    region: r[col.comunidad]?.trim() || null,
    municipality: r[col.municipio]?.trim() || null,
    gross,
    monthly: num(r[col.sueldo_bruto_mensual]),
    updated,
  };

  // The export contains a few duplicate slugs. Keep the most recently updated
  // row, falling back to the higher gross, so the result does not depend on
  // which line happened to come first.
  const prevIndex = seen.get(slug);
  if (prevIndex === undefined) {
    seen.set(slug, people.length);
    people.push(row);
    continue;
  }
  const prev = people[prevIndex];
  const newer = row.updated > prev.updated;
  const sameDate = row.updated === prev.updated;
  if (newer || (sameDate && row.gross > prev.gross)) people[prevIndex] = row;
}

// `updated` was only needed to resolve duplicates.
for (const p of people) delete p.updated;

people.sort((a, b) => b.gross - a.gross);

const out = {
  generatedAt: new Date().toISOString(),
  source: {
    name: "Registro de Altos Cargos / transparencia.gob.es",
    via: "sueldode.com CSV export",
    updated: lines[0]?.[col.fecha_actualizacion] ?? null,
  },
  count: people.length,
  people,
};

writeFileSync("data/salaries.json", JSON.stringify(out), "utf-8");

const matched = people.filter((p) => p.partyNif).length;
console.log(`wrote data/salaries.json — ${people.length} active officeholders`);
console.log(`party matched to BDNS registry: ${matched} (${((matched / people.length) * 100).toFixed(1)}%)`);
