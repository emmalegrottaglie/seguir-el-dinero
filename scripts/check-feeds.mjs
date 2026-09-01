// Feed health check for the news registry.
//
// Run this before relying on the portal's news panel, and after editing
// lib/news-sources.mjs. It fetches every registered feed, reports the age of its
// newest item, and fails if any source is unreachable, unparseable or stale.
//
// The reason it exists: dosmanzanas — the most obvious LGBTI news source in
// Spain — serves HTTP 200 with ten items whose newest post is February 2024. A
// status-code check calls that healthy. Only the item dates reveal it.
//
//   node scripts/check-feeds.mjs
//
// Exit code 1 means at least one registered source contributed nothing.

import { NEWS_SOURCES, EXCLUDED_FEEDS, FEED_HEADERS } from "../lib/news-sources.mjs";

const SOURCE_STALE_DAYS = 365;
const ITEM_MAX_AGE_DAYS = 120;
const TIMEOUT_MS = 15000;

const now = Date.now();
const ageDays = (iso) => {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Infinity : (now - t) / 86_400_000;
};

function dates(xml, format) {
  const tag = format === "atom" ? "updated|published" : "pubDate";
  const block = format === "atom" ? "entry" : "item";
  const blocks = xml.match(new RegExp(`<${block}[\\s>][\\s\\S]*?</${block}>`, "g")) ?? [];
  return blocks
    .map((b) => {
      const m = b.match(new RegExp(`<(?:${tag})[^>]*>([^<]+)<`));
      return m ? new Date(m[1]) : null;
    })
    .filter((d) => d && !Number.isNaN(d.getTime()))
    .map((d) => d.toISOString());
}

/**
 * One retry per source. Fetching fifteen feeds at once produces the occasional
 * timeout, and a health check that reports a transient failure as a dead feed
 * is a health check people learn to ignore.
 */
async function fetchOnce(url) {
  const res = await fetch(url, {
    headers: FEED_HEADERS,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.text();
}

async function check(source) {
  let xml;
  try {
    try {
      xml = await fetchOnce(source.url);
    } catch {
      xml = await fetchOnce(source.url);
    }
  } catch (err) {
    return { ...source, status: "unreachable (" + (err.message || err) + ")", ok: false };
  }

  const found = dates(xml, source.format);
  if (found.length === 0) {
    return { ...source, status: "no dated items — wrong format?", ok: false };
  }

  const newest = found.reduce((a, b) => (a > b ? a : b));
  const age = ageDays(newest);
  const recent = found.filter((d) => ageDays(d) <= ITEM_MAX_AGE_DAYS).length;

  if (age > SOURCE_STALE_DAYS) {
    return {
      ...source,
      status: `STALE — newest item ${newest.slice(0, 10)}, ${Math.round(age)} days old`,
      ok: false,
      newest,
    };
  }

  return {
    ...source,
    status: `${found.length} items, newest ${newest.slice(0, 10)} (${Math.round(age)}d), ${recent} within ${ITEM_MAX_AGE_DAYS}d`,
    ok: true,
    newest,
    recent,
  };
}

const results = await Promise.all(NEWS_SOURCES.map(check));

const pad = Math.max(...results.map((r) => r.name.length));
for (const r of results.sort((a, b) => Number(a.ok) - Number(b.ok))) {
  const mark = r.ok ? (r.recent === 0 ? "~" : "ok") : "FAIL";
  console.log(`${mark.padEnd(4)} ${r.name.padEnd(pad)}  ${r.status}`);
  if (r.ok && r.newest && r.newest.slice(0, 10) < r.probedNewest) {
    console.log(
      `     note: newest item is older than the recorded probe date ${r.probedNewest}`,
    );
  }
}

const failed = results.filter((r) => !r.ok);
const silent = results.filter((r) => r.ok && r.recent === 0);

console.log(
  `\n${results.length} registered sources: ${results.length - failed.length} live, ${failed.length} failing, ${silent.length} live but nothing in the last ${ITEM_MAX_AGE_DAYS} days.`,
);
console.log(`${EXCLUDED_FEEDS.length} feeds are deliberately excluded; see lib/news-sources.mjs.`);

if (failed.length > 0) {
  console.error(
    "\nFailing sources contribute nothing to the panel. Fix the URL, correct the format, or move the entry to EXCLUDED_FEEDS with a reason.",
  );
  process.exit(1);
}
