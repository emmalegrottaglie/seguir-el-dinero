// Fetch roll-call votes from the Congreso de los Diputados open-data portal.
//
// Usage: node scripts/fetch-votes.mjs <LEG-ROMAN> <DD/MM/YYYY> [more dates...]
//
// For each plenary date it collects every vote's JSON (title, totals and the
// per-deputy Sí/No/Abstención record), keeps those whose subject matches one of
// the tracked topics, and writes data/votes.json.
//
// Every stance shown in the app comes from these records. Nothing is inferred:
// a deputy has a position on a law only if they were recorded voting on it.

import { writeFileSync, mkdirSync } from "node:fs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const BASE = "https://www.congreso.es";

// The specific final-passage votes we surface, verified against the officially
// reported outcome for each law. Amendment and procedural votes on the same bill
// are deliberately excluded: only the decisive vote is shown as a position.
const KEY_VOTES = [
  {
    id: "ley-trans-2023",
    topic: "lgtbi",
    topicLabel: "Derechos trans y LGTBI",
    law: "Ley 4/2023 (Ley Trans)",
    lawUrl: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-5366",
    legislature: "XIV",
    session: 236,
    number: 17,
    expect: { afavor: 191, enContra: 60, abstenciones: 91 },
  },
  {
    id: "lo-1-2023-aborto",
    topic: "aborto",
    topicLabel: "Aborto y salud sexual",
    law: "LO 1/2023 (reforma del aborto)",
    lawUrl: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-5364",
    legislature: "XIV",
    session: 236,
    number: 13,
    expect: { afavor: 185, enContra: 154, abstenciones: 3 },
  },
  {
    id: "ley-12-2023-vivienda",
    topic: "vivienda",
    topicLabel: "Vivienda",
    law: "Ley 12/2023 por el derecho a la vivienda",
    lawUrl: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-12203",
    legislature: "XIV",
    session: 256,
    number: 173,
    expect: { afavor: 176, enContra: 167, abstenciones: 1 },
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

async function voteLinksForDate(leg, date) {
  const url =
    `${BASE}/es/opendata/votaciones?p_p_id=votaciones&p_p_lifecycle=0&p_p_state=normal` +
    `&p_p_mode=view&targetLegislatura=${leg}&currentLegislatura=${leg}` +
    `&targetDate=${encodeURIComponent(date)}`;
  const html = await (await get(url)).text();
  return [...new Set([...html.matchAll(/\/webpublica\/opendata\/votaciones\/[^"']+?\.json/g)].map((m) => m[0]))];
}

const leg = process.argv[2];
const dates = process.argv.slice(3);
if (!leg || !dates.length) {
  console.error("usage: node scripts/fetch-votes.mjs <LEG-ROMAN> <DD/MM/YYYY> [...]");
  process.exit(1);
}

const kept = [];

for (const date of dates) {
  const links = await voteLinksForDate(leg, date);
  console.log(`${date}: ${links.length} votes`);
  for (const link of links) {
    await sleep(250); // be a polite client
    let data;
    try {
      data = await (await get(BASE + link)).json();
    } catch (e) {
      console.warn(`  skip ${link}: ${e.message}`);
      continue;
    }
    const info = data.informacion ?? {};
    const key = KEY_VOTES.find(
      (k) => k.legislature === leg && k.session === info.sesion && k.number === info.numeroVotacion,
    );
    if (!key) continue;

    // Refuse to publish a vote whose tally does not match the officially reported
    // outcome — that would mean we grabbed the wrong ballot.
    const t = data.totales ?? {};
    const { afavor, enContra, abstenciones } = key.expect;
    if (t.afavor !== afavor || t.enContra !== enContra || t.abstenciones !== abstenciones) {
      console.warn(
        `  MISMATCH ${key.id}: expected ${afavor}/${enContra}/${abstenciones}, got ${t.afavor}/${t.enContra}/${t.abstenciones} — skipped`,
      );
      continue;
    }

    kept.push({
      id: key.id,
      topic: key.topic,
      topicLabel: key.topicLabel,
      law: key.law,
      lawUrl: key.lawUrl,
      legislature: leg,
      session: info.sesion ?? null,
      number: info.numeroVotacion ?? null,
      date: info.fecha ?? date,
      title: info.titulo ?? "",
      expediente: info.textoExpediente ?? "",
      totals: t,
      sourceUrl: BASE + link,
      votes: (data.votaciones ?? []).map((v) => ({
        deputy: v.diputado,
        group: v.grupo,
        vote: v.voto,
      })),
    });
    console.log(`  [${key.topic}] ${key.law} — ${t.afavor}/${t.enContra}/${t.abstenciones}`);
  }
}

mkdirSync("data", { recursive: true });
writeFileSync(
  "data/votes.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: {
        name: "Congreso de los Diputados — Datos Abiertos (votaciones)",
        url: "https://www.congreso.es/es/opendata/votaciones",
      },
      topics: [...new Map(KEY_VOTES.map((k) => [k.topic, { id: k.topic, label: k.topicLabel }])).values()],
      count: kept.length,
      votes: kept,
    },
    null,
    0,
  ),
  "utf-8",
);
console.log(`\nwrote data/votes.json — ${kept.length} matched votes`);
