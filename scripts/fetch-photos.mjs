// Build data/photos.json: freely-licensed portraits from Wikipedia/Wikimedia
// Commons for people the app names.
//
// Usage: node scripts/fetch-photos.mjs
//
// Two rules keep this honest:
//  1. A photo is only attached when the Wikipedia article title matches the
//     person's name exactly (accent- and order-insensitive). Fuzzy matches are
//     dropped, because showing the wrong face next to a named politician is a
//     misidentification, not a cosmetic bug.
//  2. Licence and author are stored with every image and rendered in the UI,
//     because that is what these licences require.

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const UA = "SeguirElDinero/1.0 (public-funding transparency site)";
const API = "https://es.wikipedia.org/w/api.php";
const COMMONS = "https://commons.wikimedia.org/w/api.php";

// Licences we are willing to publish. Anything else (fair use, unknown) is skipped.
const OK_LICENCE = /^(cc[- ]by(-sa)?|cc0|public domain|pd|attribution)/i;

const fold = (s) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const nameKey = (s) => [...fold(s)].sort().join(" ");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The Wikipedia API rate-limits anonymous clients, so back off and retry on 429.
async function api(params, attempt = 0, host = API) {
  const url = `${host}?${new URLSearchParams({ format: "json", formatversion: "2", maxlag: "5", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (res.status === 429 || res.status === 503) {
    if (attempt >= 5) throw new Error(`${res.status} after ${attempt} retries`);
    const wait = 2000 * 2 ** attempt;
    console.log(`    rate limited, waiting ${wait / 1000}s`);
    await sleep(wait);
    return api(params, attempt + 1, host);
  }
  if (!res.ok) throw new Error(`${res.status}`);
  const json = await res.json();
  if (json.error?.code === "maxlag") {
    await sleep(3000);
    return api(params, attempt + 1, host);
  }
  return json;
}

// Collect the names worth looking up: the curated politicians, plus national
// officeholders from the salary register (ministers, deputies, senators, MEPs).
function targetNames() {
  const names = new Map(); // nameKey -> display name

  const pol = readFileSync("lib/politicians.ts", "utf-8");
  for (const m of pol.matchAll(/name:\s*"([^"]+)"/g)) names.set(nameKey(m[1]), m[1]);

  if (existsSync("data/salaries.json")) {
    const sal = JSON.parse(readFileSync("data/salaries.json", "utf-8"));
    const national = /^(Diputad[oa]|Senador[a]?|Eurodiputad[oa]|Ministr[oa]|Vicepresident[ae]|President[ae] del Gobierno)/i;
    for (const p of sal.people) {
      if (national.test(p.role)) names.set(nameKey(p.name), p.name);
    }
  }
  return [...names.values()];
}

const names = targetNames();
console.log(`looking up ${names.length} names`);

// --- pass 1: article -> thumbnail + file name --------------------------------
// Cached to disk so a throttled re-run does not repeat the whole crawl.
const CACHE = "data/_photos-pass1.json";
const found = new Map(
  existsSync(CACHE) ? Object.entries(JSON.parse(readFileSync(CACHE, "utf-8"))) : [],
);
const cached = found.size > 0;
if (cached) console.log(`resuming with ${found.size} cached portraits`);

for (let i = 0; !cached && i < names.length; i += 30) {
  const batch = names.slice(i, i + 30);
  let data;
  try {
    data = await api({
      action: "query",
      titles: batch.join("|"),
      prop: "pageimages",
      piprop: "original|thumbnail|name",
      pithumbsize: "400",
    });
  } catch (e) {
    console.warn(`  batch ${i}: ${e.message}`);
    continue;
  }
  for (const page of data.query?.pages ?? []) {
    if (page.missing || !page.original) continue;
    // Rule 1: the article title must be the person's name.
    const queried = batch.find((n) => nameKey(n) === nameKey(page.title));
    if (!queried) continue;
    found.set(nameKey(queried), {
      name: queried,
      article: page.title,
      articleUrl: `https://es.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
      file: page.pageimage ? `File:${page.pageimage}` : null,
      url: page.original.source.split("?")[0],
      thumb: page.thumbnail?.source.split("?")[0] ?? null,
      width: page.original.width,
      height: page.original.height,
    });
  }
  await sleep(1200);
  console.log(`  …${Math.min(i + 30, names.length)}/${names.length}, ${found.size} with a portrait`);
}
writeFileSync(CACHE, JSON.stringify(Object.fromEntries(found)), "utf-8");

// --- pass 2: licence + author for each file ---------------------------------
// Also cached: Commons throttles hard, so successive runs top up the cache
// instead of starting over.
const LIC_CACHE = "data/_photos-licences.json";
const meta = new Map(
  existsSync(LIC_CACHE) ? Object.entries(JSON.parse(readFileSync(LIC_CACHE, "utf-8"))) : [],
);
const fileKey = (t) => t.replace(/_/g, " ");
const files = [...found.values()].filter((f) => f.file && !meta.has(fileKey(f.file)));
console.log(`licences: ${meta.size} cached, ${files.length} to fetch`);

for (let i = 0; i < files.length; i += 10) {
  const batch = files.slice(i, i + 10);
  let data;
  try {
    data = await api(
      {
        action: "query",
        titles: batch.map((f) => f.file).join("|"),
        prop: "imageinfo",
        iiprop: "extmetadata",
      },
      0,
      COMMONS,
    );
  } catch (e) {
    console.warn(`  licence batch ${i}: ${e.message}`);
    continue;
  }
  for (const page of data.query?.pages ?? []) {
    const em = page.imageinfo?.[0]?.extmetadata;
    if (!em) continue;
    const clean = (v) => (v ? String(v).replace(/<[^>]+>/g, "").trim() : null);
    meta.set(fileKey(page.title), {
      licence: clean(em.LicenseShortName?.value) ?? clean(em.License?.value),
      author: clean(em.Artist?.value),
      credit: clean(em.Credit?.value),
    });
  }
  await sleep(1500);
  writeFileSync(LIC_CACHE, JSON.stringify(Object.fromEntries(meta)), "utf-8");
  if ((i + 10) % 50 === 0) console.log(`  licences …${i + 10}/${files.length}`);
}

// --- assemble, dropping anything without a publishable licence --------------
const photos = {};
let unknown = 0;
let refused = 0;
for (const [key, rec] of found) {
  const m = rec.file ? meta.get(fileKey(rec.file)) : null;
  if (!m?.licence) {
    unknown++; // licence could not be read (throttled) — re-run to top up
    continue;
  }
  if (!OK_LICENCE.test(m.licence)) {
    refused++; // licence is not one we are willing to republish
    continue;
  }
  photos[key] = {
    name: rec.name,
    url: rec.thumb ?? rec.url,
    width: rec.width,
    height: rec.height,
    licence: m.licence,
    author: m.author,
    articleUrl: rec.articleUrl,
    fileUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(rec.file.replace(/ /g, "_"))}`,
  };
}

writeFileSync(
  "data/photos.json",
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: { name: "Wikipedia / Wikimedia Commons", url: "https://commons.wikimedia.org" },
    count: Object.keys(photos).length,
    photos,
  }),
  "utf-8",
);

console.log(
  `
wrote data/photos.json — ${Object.keys(photos).length} portraits ` +
    `(${refused} non-reusable licence, ${unknown} licence unknown — re-run to top up)`,
);
