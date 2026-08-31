// Discovery pass over a legislature's plenary days: find votes whose subject
// matches a tracked topic, and print them for human review.
//
// Usage: node scripts/discover-votes.mjs <LEG-ROMAN>
//
// This does NOT publish anything. Its output is a shortlist; the votes that end
// up in the app are chosen by hand and pinned in scripts/fetch-votes.mjs, so no
// position is ever published from an automatic keyword guess.

import { writeFileSync } from "node:fs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const BASE = "https://www.congreso.es";

const TOPICS = [
  { id: "lgtbi", re: /\btrans\b|transexual|LGTBI|identidad de g[eé]nero/i },
  { id: "aborto", re: /aborto|interrupci[oó]n voluntaria del embarazo|salud sexual y reproductiva/i },
  { id: "vivienda", re: /vivienda|alquiler|desahucio/i },
];

const leg = process.argv[2];
if (!leg) {
  console.error("usage: node scripts/discover-votes.mjs <LEG-ROMAN>");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (h) =>
  h
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&ntilde;/g, "ñ")
    .replace(/\s+/g, " ")
    .trim();

async function page(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function baseUrl(date) {
  let u =
    `${BASE}/es/opendata/votaciones?p_p_id=votaciones&p_p_lifecycle=0&p_p_state=normal` +
    `&p_p_mode=view&targetLegislatura=${leg}&currentLegislatura=${leg}`;
  if (date) u += `&targetDate=${encodeURIComponent(date)}`;
  return u;
}

// Landing page carries diasVotaciones: every plenary day of the legislature.
const landing = await page(baseUrl());
const days = (landing.match(/diasVotaciones\s*=\s*\[([^\]]*)\]/)?.[1] ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter((s) => /^\d{8}$/.test(s));

console.log(`${leg}: ${days.length} plenary days`);

const hits = [];

for (const [i, ymd] of days.entries()) {
  const date = `${ymd.slice(6, 8)}/${ymd.slice(4, 6)}/${ymd.slice(0, 4)}`;
  let html;
  try {
    html = await page(baseUrl(date));
  } catch (e) {
    console.warn(`  ${date}: ${e.message}`);
    continue;
  }
  await sleep(200);

  // Each vote ends with its JSON link; the text before it holds the subject.
  const links = [...html.matchAll(/\/webpublica\/opendata\/votaciones\/[^"']+?\.json/g)];
  for (const m of links) {
    const ctx = strip(html.slice(Math.max(0, m.index - 2500), m.index));
    const subject = ctx.slice(-700);
    const topic = TOPICS.find((t) => t.re.test(subject));
    if (!topic) continue;
    const tally = subject.match(/Si:\s*(\d+)\s*No:\s*(\d+)\s*Abstenciones:\s*(\d+)/i);
    const sess = m[0].match(/Sesion(\d+)/)?.[1];
    const num = m[0].match(/Votacion(\d+)/)?.[1];
    hits.push({
      topic: topic.id,
      date,
      session: Number(sess),
      number: Number(num),
      si: tally ? Number(tally[1]) : null,
      no: tally ? Number(tally[2]) : null,
      abst: tally ? Number(tally[3]) : null,
      subject: subject.replace(/Si:.*$/i, "").trim().slice(-260),
      json: BASE + m[0],
    });
  }
  if ((i + 1) % 20 === 0) console.log(`  …${i + 1}/${days.length} days, ${hits.length} hits`);
}

writeFileSync(`data/_discovered-${leg}.json`, JSON.stringify(hits, null, 1), "utf-8");
console.log(`\n${hits.length} candidate votes -> data/_discovered-${leg}.json`);
