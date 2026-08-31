import { getSalaries, type Officeholder } from "./salaries";
import { getVotes, type KeyVote, type Ballot } from "./votes";
import { portraitFor, portraitKeys, type Portrait } from "./photos";
import { POLITICIANS, type Politician } from "./politicians";
import { getAggregation } from "./data";
import { donationsByNif, type PartyDonations } from "./donations";
import { foldTokens, nameKey } from "./name-key.mjs";
import type { PartyTotals } from "./types";

// One politician, assembled from every dataset that happens to know them. The
// register of officeholders is the spine: it has the slug, the post and the pay.
// Everything else is optional and simply absent when the source has no record —
// nothing here is inferred or filled in from a party's position.
export interface PersonProfile {
  person: Officeholder;
  party: PartyTotals | null;
  donations: PartyDonations | null;
  portrait: Portrait | null;
  social: Politician | null;
  record: RecordedVote[];
}

export interface RecordedVote {
  vote: KeyVote;
  ballot: Ballot;
  /** Group as recorded on that ballot — deputies change group between terms. */
  group: string;
}

// Curated handles are indexed once: token sets are reused across thousands of
// register rows, so building them per row was the directory's bottleneck.
const CURATED = POLITICIANS.map((p) => ({ politician: p, tokens: foldTokens(p.name) }));

/**
 * Curated social handles carry a short public name ("Óscar Puente") while the
 * register carries the full legal name ("Óscar Puente Santiago"). Matching every
 * token of the short name into the register's tokens links them, and the match
 * is only accepted when exactly one entry qualifies — an ambiguous match is
 * dropped rather than guessed, since a wrong link would attribute someone
 * else's accounts to this person.
 */
function socialFor(person: Officeholder): Politician | null {
  const tokens = new Set(foldTokens(person.name));
  const hits = CURATED.filter((c) => c.tokens.every((t) => tokens.has(t)));
  return hits.length === 1 ? hits[0].politician : null;
}

/** Name keys that appear in at least one roll call. */
async function votedKeys(): Promise<Set<string>> {
  const { votes } = await getVotes();
  const keys = new Set<string>();
  for (const v of votes) for (const d of v.votes) keys.add(nameKey(d.deputy));
  return keys;
}

/** Every roll call this person is named in. Empty when they have no record. */
async function recordFor(person: Officeholder): Promise<RecordedVote[]> {
  const { votes } = await getVotes();
  const key = nameKey(person.name);
  const out: RecordedVote[] = [];
  for (const vote of votes) {
    const hit = vote.votes.find((v) => nameKey(v.deputy) === key);
    if (hit) out.push({ vote, ballot: hit.vote, group: hit.group });
  }
  return out;
}

export async function getProfile(slug: string): Promise<PersonProfile | null> {
  const { people } = await getSalaries();
  const person = people.find((p) => p.slug === slug);
  if (!person) return null;

  const agg = await getAggregation();
  const party = person.partyNif ? (agg.parties.find((p) => p.nif === person.partyNif) ?? null) : null;

  return {
    person,
    party,
    donations: person.partyNif ? (donationsByNif(person.partyNif) ?? null) : null,
    portrait: await portraitFor(person.name),
    social: socialFor(person),
    record: await recordFor(person),
  };
}

// ---------------------------------------------------------------------------
// Index-level helpers: which people have extra material, so the directory can
// surface the richest profiles first without claiming coverage it lacks.
// ---------------------------------------------------------------------------

export interface PersonBadges {
  hasRecord: boolean;
  hasSocial: boolean;
  hasPortrait: boolean;
}

let badgeCache: Map<string, PersonBadges> | null = null;

export async function getBadges(): Promise<Map<string, PersonBadges>> {
  if (badgeCache) return badgeCache;

  const { people } = await getSalaries();
  const [voted, photos] = await Promise.all([votedKeys(), portraitKeys()]);

  const map = new Map<string, PersonBadges>();
  for (const p of people) {
    const key = nameKey(p.name);
    map.set(p.slug, {
      hasRecord: voted.has(key),
      hasSocial: socialFor(p) !== null,
      hasPortrait: photos.has(key),
    });
  }
  badgeCache = map;
  return map;
}

/**
 * Profiles with a voting record, richest first — the directory's lead section.
 * Driven from the (small) set of names that actually voted rather than by
 * scanning the whole register.
 */
export async function featuredSlugs(limit = 12): Promise<string[]> {
  const { people } = await getSalaries();
  const [voted, photos] = await Promise.all([votedKeys(), portraitKeys()]);

  const scored: { slug: string; score: number }[] = [];
  for (const p of people) {
    const key = nameKey(p.name);
    if (!voted.has(key)) continue; // lead section is record-holders only
    const score = 4 + (socialFor(p) ? 2 : 0) + (photos.has(key) ? 1 : 0);
    scored.push({ slug: p.slug, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.slug);
}
