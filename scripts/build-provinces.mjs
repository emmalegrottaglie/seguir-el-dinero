// Builds the province table that turns "where I live" into a territory on this site.
//
// Every layer here is published per comunidad autónoma — who governs, the
// recorded hate-crime rate, the poverty indicators, the wage percentiles — but
// almost nobody thinks of themselves as living in a comunidad autónoma first.
// They know their town, and they know their postcode. The first two digits of a
// Spanish postcode are the province code, and a province sits inside exactly one
// comunidad autónoma, so those two digits are the whole bridge.
//
// That is why this is a lookup table and not a geocoder: no address is needed,
// no service is called, and the reader's postcode never has to leave their
// browser.
//
// Source: INE Tempus3, the province (variable 115) and comunidad autónoma
// (variable 70) value lists, where each province carries its parent CCAA in
// `FK_JerarquiaPadres`. Derived rather than transcribed — 52 hand-typed rows
// with a two-digit code each is exactly the kind of table that acquires a
// silent typo.
//
// Run: npm run build:provinces

import { promises as fs } from "node:fs";
import path from "node:path";

const BASE = "https://servicios.ine.es/wstempus/js/ES";
const OUT = path.join(process.cwd(), "data", "provinces.json");

const problems = [];
const fail = (m) => problems.push(m);

async function values(variable) {
  const res = await fetch(`${BASE}/VALORES_VARIABLE/${variable}`);
  if (!res.ok) {
    fail(`variable ${variable}: HTTP ${res.status}`);
    return [];
  }
  const body = await res.json();
  if (!Array.isArray(body) || body.length === 0) {
    fail(`variable ${variable}: ${JSON.stringify(body).slice(0, 120)}`);
    return [];
  }
  return body;
}

/**
 * INE inverts a name when its article or preposition would otherwise sort it
 * under the wrong letter: "Rioja, La", "Balears, Illes", "Coruña, A". Reading
 * order is what a person expects to see, so the comma is undone. This is a rule
 * rather than a table of four exceptions, so a future inverted name is handled
 * without an edit.
 */
function readingOrder(name) {
  const m = name.match(/^(.+), (.+)$/);
  return m ? `${m[2]} ${m[1]}` : name;
}

/**
 * The slug is built from the first of a bilingual pair — `araba` rather than
 * `araba-alava`, `valencia` rather than `valencia-valencia` — because the URL is
 * something a reader types or reads aloud, while the full official name is what
 * the page prints. Uniqueness across all 52 is asserted below rather than
 * assumed.
 */
function slugOf(displayName) {
  return displayName
    .split("/")[0]
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const [provinces, ccaa] = await Promise.all([values(115), values(70)]);

if (problems.length === 0) {
  const ccaaById = new Map(ccaa.map((c) => [c.Id, c]));

  const rows = [];
  for (const p of provinces) {
    // "Total Nacional" and any other aggregate carries code 00 or no parent.
    if (!/^\d{2}$/.test(p.Codigo) || p.Codigo === "00" || !p.FK_JerarquiaPadres) continue;

    // A province can list more than one parent: the island provinces also hang
    // off a "Total Islas" grouping. Only the comunidad autónoma — the one whose
    // code is in the 01-19 range this site's territories use — is wanted.
    const parents = p.FK_JerarquiaPadres.map((id) => ccaaById.get(id)).filter(
      (c) => c && /^(0[1-9]|1[0-9])$/.test(c.Codigo),
    );
    if (parents.length !== 1) {
      fail(
        `province ${p.Codigo} ${p.Nombre}: ${parents.length} comunidad autónoma parents, expected 1`,
      );
      continue;
    }

    const name = readingOrder(p.Nombre);
    rows.push({ code: p.Codigo, name, slug: slugOf(name), territoryId: parents[0].Codigo });
  }

  rows.sort((a, b) => a.code.localeCompare(b.code));

  // --- guards, all fatal -------------------------------------------------
  //
  // A wrong row here sends a reader to another region's government and another
  // region's figures under a heading naming their own province, which is worse
  // than having no local page at all.
  if (rows.length !== 52) fail(`${rows.length} provinces parsed, Spain has 52`);

  const expected = Array.from({ length: 52 }, (_, i) => String(i + 1).padStart(2, "0"));
  const missing = expected.filter((c) => !rows.some((r) => r.code === c));
  if (missing.length > 0) fail(`missing province codes: ${missing.join(", ")}`);

  const slugs = new Set(rows.map((r) => r.slug));
  if (slugs.size !== rows.length) {
    const seen = new Set();
    const dupes = rows.map((r) => r.slug).filter((s) => (seen.has(s) ? true : (seen.add(s), false)));
    fail(`duplicate province slugs: ${[...new Set(dupes)].join(", ")}`);
  }

  const territories = new Set(rows.map((r) => r.territoryId));
  if (territories.size !== 19) {
    fail(`${territories.size} distinct comunidades autónomas across the provinces, expected 19`);
  }

  if (problems.length === 0) {
    await fs.writeFile(
      OUT,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          source: {
            body: "INE",
            name: "Tempus3, valores de las variables Provincias (115) y Comunidades y Ciudades Autónomas (70)",
            url: "https://www.ine.es/dyngs/DAB/index.htm?cid=1099",
          },
          provinces: rows,
        },
        null,
        2,
      ) + "\n",
      "utf-8",
    );
    console.log(`${rows.length} provinces across ${territories.size} comunidades autónomas`);
  }
}

if (problems.length > 0) {
  console.error("FAIL:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("OK");
