import { getSalaries, type Officeholder } from "./salaries";
import { getVotes, type KeyVote, type Ballot } from "./votes";
import { portraitFor, portraitKeys, type Portrait } from "./photos";
import { POLITICIANS, type Politician } from "./politicians";
import { getAggregation } from "./data";
import { donationsByNif, type PartyDonations } from "./donations";
import { getDeputies, type Deputy } from "./deputies";
import {
  declarationFor,
  interestsFor,
  type AssetDeclaration,
  type InterestRow,
} from "./declarations";
import { formationOf, linkDeputies } from "./deputy-join.mjs";
import { foldText, foldTokens, nameKey } from "./name-key.mjs";
import type { PartyTotals } from "./types";

/**
 * One person on the site. The pay register is the spine: its rows carry the slug, the post and
 * the pay. Sitting deputies the register does not list are added from Congreso's roster with no
 * pay figure, and `inRegister` says which kind a person is, so a missing figure is never shown
 * as a zero.
 */
export interface Person extends Officeholder {
  inRegister: boolean;
  /** The sitting deputy this person is, when lib/deputy-join.mjs establishes it. */
  deputy: Deputy | null;
}

// One profile, assembled from every dataset that happens to know the person. Everything beyond
// the spine is optional and simply absent when the source has no record — nothing here is
// inferred or filled in from a party's position.
export interface PersonProfile {
  person: Person;
  party: PartyTotals | null;
  donations: PartyDonations | null;
  portrait: Portrait | null;
  social: Politician | null;
  record: RecordedVote[];
  /** Bienes y Rentas, transcribed; null for non-deputies and for filings not yet transcribed. */
  declaration: AssetDeclaration | null;
  interests: InterestRow[];
}

export interface RecordedVote {
  vote: KeyVote;
  ballot: Ballot;
  /** Group as recorded on that ballot — deputies change group between terms. */
  group: string;
}

let spine: { people: Person[]; bySlug: Map<string, Person> } | null = null;

async function getSpine() {
  if (spine) return spine;
  const [{ people: register }, { deputies }] = await Promise.all([getSalaries(), getDeputies()]);
  const { links, congresoOnly } = linkDeputies(register, deputies);

  const deputyFor = new Map(links.map((l) => [l.row.slug, l.deputy]));
  const people: Person[] = register.map((row) => ({
    ...row,
    inRegister: true,
    deputy: deputyFor.get(row.slug) ?? null,
  }));
  const bySlug = new Map(people.map((p) => [p.slug, p]));

  for (const d of congresoOnly) {
    // check:deputies fails on a collision; never let one shadow a register row here either.
    if (bySlug.has(d.slug)) continue;
    const formation = formationOf(d.formation);
    const person: Person = {
      slug: d.slug,
      name: d.fullName,
      role: d.role,
      partyLabel: d.formation,
      partyNif: formation?.nif ?? null,
      partyShort: formation?.short ?? d.formation,
      region: null,
      municipality: null,
      gross: 0,
      monthly: null,
      inRegister: false,
      deputy: d,
    };
    people.push(person);
    bySlug.set(person.slug, person);
  }

  spine = { people, bySlug };
  return spine;
}

/** Every person with a profile: the register's rows, then the deputies it lacks. */
export async function getPeople(): Promise<Person[]> {
  return (await getSpine()).people;
}

/** Name keys a person may appear under in the roll calls. */
function voteKeys(person: Person): string[] {
  const keys = [nameKey(person.name)];
  if (person.deputy) keys.push(nameKey(person.deputy.name));
  return keys;
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
async function recordFor(person: Person): Promise<RecordedVote[]> {
  const { votes } = await getVotes();
  const keys = new Set(voteKeys(person));
  const out: RecordedVote[] = [];
  for (const vote of votes) {
    const hit = vote.votes.find((v) => keys.has(nameKey(v.deputy)));
    if (hit) out.push({ vote, ballot: hit.vote, group: hit.group });
  }
  return out;
}

export async function getProfile(slug: string): Promise<PersonProfile | null> {
  const person = (await getSpine()).bySlug.get(slug);
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
    declaration: person.deputy ? await declarationFor(person.deputy) : null,
    interests: person.deputy ? await interestsFor(person.deputy) : [],
  };
}

// ---------------------------------------------------------------------------
// The directory: identity, not pay, so it runs over the whole spine.
// ---------------------------------------------------------------------------

export interface PeopleQuery {
  q?: string;
  party?: string; // partyShort
  page?: number;
  perPage?: number;
}

export interface PeoplePage {
  results: Person[];
  total: number;
  page: number;
  pages: number;
  parties: { short: string; count: number }[];
}

/** Where a person sits: a deputy's constituency, otherwise the register's place. */
export function placeOf(p: Person): string | null {
  return p.deputy?.constituency ?? p.municipality ?? p.region;
}

export async function queryPeople(opts: PeopleQuery): Promise<PeoplePage> {
  const people = await getPeople();
  const perPage = opts.perPage ?? 50;

  // Apply the text filter first: the party facets are counted over this set, so
  // the number on each chip matches what selecting it actually returns.
  let matching = people;
  if (opts.q) {
    const needle = foldText(opts.q.trim());
    if (needle) {
      matching = matching.filter(
        (p) =>
          foldText(p.name).includes(needle) ||
          foldText(p.role).includes(needle) ||
          foldText(p.municipality ?? "").includes(needle) ||
          foldText(p.region ?? "").includes(needle) ||
          foldText(p.deputy?.constituency ?? "").includes(needle),
      );
    }
  }

  let list = matching;
  if (opts.party) list = list.filter((p) => p.partyShort === opts.party);

  // Party facet counts over the text-filtered set, excluding the party filter
  // itself so the user can switch between parties.
  const counts = new Map<string, number>();
  for (const p of matching) counts.set(p.partyShort, (counts.get(p.partyShort) ?? 0) + 1);
  const parties = [...counts.entries()]
    .map(([short, count]) => ({ short, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, opts.page ?? 1), pages);
  const start = (page - 1) * perPage;

  return { results: list.slice(start, start + perPage), total, page, pages, parties };
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

  const people = await getPeople();
  const [voted, photos] = await Promise.all([votedKeys(), portraitKeys()]);

  const map = new Map<string, PersonBadges>();
  for (const p of people) {
    map.set(p.slug, {
      hasRecord: voteKeys(p).some((k) => voted.has(k)),
      hasSocial: socialFor(p) !== null,
      hasPortrait: photos.has(nameKey(p.name)),
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
  const people = await getPeople();
  const [voted, photos] = await Promise.all([votedKeys(), portraitKeys()]);

  const scored: { slug: string; score: number }[] = [];
  for (const p of people) {
    if (!voteKeys(p).some((k) => voted.has(k))) continue; // lead section is record-holders only
    const score = 4 + (socialFor(p) ? 2 : 0) + (photos.has(nameKey(p.name)) ? 1 : 0);
    scored.push({ slug: p.slug, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.slug);
}
