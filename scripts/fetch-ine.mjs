// Ingests the INE series that give the rest of this site a scale to be read against.
//
// The site publishes what parties are paid and what officeholders earn. Neither
// number means anything on its own: a reader cannot tell whether €48,650 is a
// lot without knowing what the country earns. These tables are that denominator,
// taken from the statistical office that produces them rather than from a press
// article quoting it.
//
// Source: INE Tempus3 JSON API, https://servicios.ine.es/wstempus/js/ES/…
// No key, no auth. Probed 2026-09-01, re-verified 2026-09-15.
//
// Run: npm run build:ine
//
// ---------------------------------------------------------------------------
// The trap that makes this script necessary
//
// A leading minus sign in INE's `Valor` is NOT a negative number. It is a
// reliability flag: the sample behind that cell has between 100 and 500
// observations and the figure is subject to high variability. In table 28185,
// "Mujeres. Industrias extractivas" comes back as -51101.45, meaning €51,101.45
// with a low-sample warning.
//
// Stripping the sign silently would publish the right number with no warning.
// Taking it at face value would publish a negative salary. Either way the chart
// is wrong, so the flag is carried through to the UI as a visible marker.
//
// Every series here is a wage in euros or a percentage of a population. Neither
// can legitimately be negative, which is what makes the rule safe to apply
// unconditionally in these tables — it would not be safe in a table of balances
// or of year-on-year changes.
// ---------------------------------------------------------------------------

import { promises as fs } from "node:fs";
import path from "node:path";

const BASE = "https://servicios.ine.es/wstempus/js/ES";
const OUT = path.join(process.cwd(), "data", "indicators.json");

const problems = [];
const fail = (m) => problems.push(m);

/** Tables ingested, with the operation each belongs to and its field count. */
const TABLES = {
  sector: {
    id: "28185",
    operation: "140 EAES",
    name: "Salario medio bruto por sexo y secciones de actividad",
    fields: 5,
  },
  jornada: {
    id: "28187",
    operation: "140 EAES",
    name: "Salario medio bruto por sexo y tipo de jornada",
    fields: 5,
  },
  percentiles: {
    id: "28191",
    operation: "140 EAES",
    name: "Medias y percentiles por sexo y comunidad autónoma",
    fields: 4,
  },
  smiTranches: {
    id: "28182",
    operation: "140 EAES",
    name: "Porcentaje de trabajadores en función de su ganancia con respecto al SMI",
    fields: 5,
  },
  povertyNational: {
    id: "67240",
    operation: "155 ECV",
    name: "Riesgo de pobreza o exclusión social por edad y sexo",
    fields: 5,
  },
  povertyRegional: {
    id: "67989",
    operation: "155 ECV",
    name: "Riesgo de pobreza o exclusión social por comunidad autónoma",
    fields: 4,
  },
};

async function fetchTable(id) {
  const res = await fetch(BASE + "/DATOS_TABLA/" + id + "?nult=1");
  if (!res.ok) {
    fail("table " + id + ": HTTP " + res.status);
    return [];
  }
  const body = await res.json();
  // A table that exists in the table list but holds no series answers with an
  // object, not an array: {"status": "No existen series para la tabla"}. Table
  // 80181 does exactly this, so the shape is checked rather than assumed.
  if (!Array.isArray(body)) {
    fail("table " + id + ": " + JSON.stringify(body).slice(0, 120));
    return [];
  }
  if (body.length === 0) {
    fail("table " + id + ": zero series");
    return [];
  }
  return body;
}

/**
 * A series name is a full-stop separated list of its dimensions, in the order
 * the table declares them. Splitting on ". " is safe here because no dimension
 * label in these six tables contains a full stop — which is asserted rather
 * than assumed: every row of a table must yield the table's declared field
 * count, and a row that does not is a failure rather than a skipped row.
 */
function dimensions(name) {
  return name
    .trim()
    .replace(/\.$/, "")
    .split(". ")
    .map((s) => s.trim());
}

function parse(series, meta) {
  const out = [];
  for (const s of series) {
    const f = dimensions(s.Nombre);
    if (f.length !== meta.fields) {
      fail(
        "table " + meta.id + ': "' + s.Nombre.trim() + '" split into ' + f.length +
          " fields, expected " + meta.fields,
      );
      continue;
    }
    const point = s.Data && s.Data[0];
    if (!point) {
      fail("table " + meta.id + ': "' + s.Nombre.trim() + '" carries no data point at all');
      continue;
    }
    // A null value is a cell the indicator does not define, not a missing
    // number. ECV table 67240 has three: "viviendo en hogares con baja
    // intensidad en el trabajo (de 0 a 64 años)" cannot have a value for the
    // 65-and-over age group, and INE returns null rather than a zero. It is
    // carried through as null so the page can state the absence; writing zero
    // would put a real-looking 0 % on a chart.
    if (point.Valor !== null && typeof point.Valor !== "number") {
      fail("table " + meta.id + ': "' + s.Nombre.trim() + '" carries a non-numeric value');
      continue;
    }
    out.push({
      f,
      value: point.Valor === null ? null : Math.abs(point.Valor),
      lowSample: point.Valor !== null && point.Valor < 0,
      year: point.Anyo,
    });
  }

  // Every series in one of these tables is a single latest period, so a mixed
  // set of years means the request or the parse has gone wrong.
  const years = [...new Set(out.map((r) => r.year))];
  if (years.length > 1) fail("table " + meta.id + ": mixed periods " + years.join(", "));

  return { rows: out, period: years[0] };
}

const raw = {};
for (const [key, meta] of Object.entries(TABLES)) raw[key] = await fetchTable(meta.id);

if (problems.length === 0) {
  const parsed = Object.fromEntries(
    Object.entries(TABLES).map(([key, meta]) => [key, parse(raw[key], meta)]),
  );

  // --- wages -------------------------------------------------------------
  const sector = parsed.sector.rows.map((r) => ({
    sector: r.f[1],
    sex: r.f[0],
    value: r.value,
    lowSample: r.lowSample,
  }));

  const jornada = parsed.jornada.rows.map((r) => ({
    jornada: r.f[1],
    sex: r.f[0],
    value: r.value,
    lowSample: r.lowSample,
  }));

  const percentiles = parsed.percentiles.rows.map((r) => ({
    region: r.f[1],
    sex: r.f[0],
    measure: r.f[3],
    value: r.value,
    lowSample: r.lowSample,
  }));

  const smiTranches = parsed.smiTranches.rows
    .filter((r) => r.f[3] !== "Total de trabajadores")
    .map((r) => ({
      tranche: r.f[3],
      sex: r.f[0],
      jornada: r.f[1],
      percent: r.value,
      lowSample: r.lowSample,
    }));

  // --- poverty -----------------------------------------------------------
  //
  // The base is stored verbatim and never dropped. The same ECV table carries
  // both the Base 2013 AROPE series and the objetivo Europa 2030 series; they
  // are different definitions of an indicator with the same name, and plotting
  // them as one line would be a fabrication. Keeping the base on every row is
  // what lets a chart key off it instead of assuming there is only one.
  const povertyNational = parsed.povertyNational.rows.map((r) => ({
    sex: r.f[0],
    ageGroup: r.f[1],
    indicator: r.f[3],
    base: r.f[4],
    percent: r.value,
  }));

  const povertyRegional = parsed.povertyRegional.rows.map((r) => ({
    region: r.f[0],
    group: r.f[1],
    indicator: r.f[2],
    base: r.f[3],
    percent: r.value,
  }));

  // --- guards ------------------------------------------------------------
  //
  // These check the parse against figures published in INE's own press note for
  // the same release. A parser that drifts by one column still produces
  // plausible-looking euros, so the only useful test is against numbers known
  // from outside the parser.
  function only(list, pred, what) {
    const hit = list.filter(pred);
    if (hit.length !== 1) {
      fail(what + ": matched " + hit.length + " rows, expected exactly 1");
      return null;
    }
    return hit[0];
  }

  function expect(row, field, want, what) {
    if (!row) return;
    if (row[field] !== want) fail(what + ": parsed " + row[field] + ", INE publishes " + want);
  }

  const isArope = (r) => r.indicator.startsWith("Tasa de riesgo de pobreza o exclusión social");

  expect(
    only(sector, (r) => r.sector === "Todas las secciones" && r.sex === "Ambos sexos", "EAES mean"),
    "value",
    29540.26,
    "EAES 2024 mean gross annual earnings",
  );
  expect(
    only(sector, (r) => r.sector === "Hostelería" && r.sex === "Ambos sexos", "EAES hostelería"),
    "value",
    17653.42,
    "EAES 2024 hostelería",
  );
  expect(
    only(
      percentiles,
      (r) => r.region === "Total Nacional" && r.sex === "Ambos sexos" && r.measure === "Mediana",
      "EAES median",
    ),
    "value",
    24497.17,
    "EAES 2024 median gross annual earnings",
  );
  expect(
    only(
      povertyNational,
      (r) => r.sex === "Ambos sexos" && r.ageGroup === "Total" && isArope(r),
      "AROPE total",
    ),
    "percent",
    25.7,
    "ECV 2025 AROPE, total",
  );
  expect(
    only(
      povertyNational,
      (r) => r.sex === "Ambos sexos" && r.ageGroup === "Menores de 16 años" && isArope(r),
      "AROPE under-16",
    ),
    "percent",
    33.9,
    "ECV 2025 AROPE, under 16",
  );

  // Undefined cells are expected in exactly one place. Anywhere else a null
  // means a table changed shape or a series was withdrawn, which is a reason to
  // stop rather than to publish a chart with holes in it.
  for (const [key, meta] of Object.entries(TABLES)) {
    const nulls = parsed[key].rows.filter((r) => r.value === null).length;
    if (key === "povertyNational") {
      if (nulls !== 3) {
        fail(
          "table " + meta.id + ": " + nulls + " undefined cells, expected the 3 where low work " +
            "intensity (0-64) meets the 65-and-over age group",
        );
      }
    } else if (nulls > 0) {
      fail("table " + meta.id + ": " + nulls + " undefined cells, expected none");
    }
  }

  // The low-sample flag must survive the ingest. At least one series in table
  // 28185 carries it, and if a future refactor strips the sign before this
  // point the count goes to zero and the warning silently stops being published.
  const flagged = sector.filter((r) => r.lowSample).length;
  if (flagged === 0) {
    fail("no low-sample flag survived the ingest of table 28185; INE flags at least one series there");
  }

  // The SMI tranches partition the workforce, so they must account for all of it.
  const headline = smiTranches.filter((r) => r.sex === "Ambos sexos" && r.jornada === "Total");
  const sum = headline.reduce((n, r) => n + r.percent, 0);
  if (headline.length < 8) fail("SMI tranches: only " + headline.length + " headline tranches parsed");
  if (Math.abs(sum - 100) > 0.5) fail("SMI tranches sum to " + sum.toFixed(2) + " %, not 100 %");

  if (problems.length === 0) {
    const out = {
      generatedAt: new Date().toISOString(),
      sources: Object.entries(TABLES).map(([key, meta]) => ({
        id: key,
        operation: meta.operation,
        table: meta.id,
        name: meta.name,
        period: String(parsed[key].period),
        url: "https://www.ine.es/jaxiT3/Tabla.htm?t=" + meta.id,
      })),
      wages: { sector, jornada, percentiles, smiTranches },
      poverty: { national: povertyNational, regional: povertyRegional },
    };
    await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf-8");
    console.log(
      sector.length + " sector rows, " + jornada.length + " jornada, " + percentiles.length +
        " percentile, " + smiTranches.length + " SMI tranche, " + povertyNational.length +
        " national poverty, " + povertyRegional.length + " regional poverty — " + flagged +
        " low-sample flagged",
    );
  }
}

if (problems.length > 0) {
  console.error("FAIL:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("OK");
