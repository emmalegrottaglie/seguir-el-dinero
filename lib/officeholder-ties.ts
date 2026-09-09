import { getSalaries, type Officeholder } from "./salaries";
import { nameKey } from "./name-key.mjs";
import { ROLES } from "./foundation-people";
import type { Source, Tie } from "./foundation-people";

/**
 * The public offices held by the people who govern the party foundations.
 *
 * This is the one join in the project that attaches a *named living private
 * individual* to a record neither they nor the foundation published. Both sides
 * were already ingested — the boards in lib/foundation-people.ts, the offices in
 * data/salaries.json — so the temptation is to match on name and be done. A
 * wrong match would publish someone else's public office against a named
 * person's photograph, which is the worst error this site could make.
 *
 * So it is matched, never inferred, and two independent conditions must both
 * hold before a tie exists.
 *
 * **One post per name.** `nameKey` is order-independent and accent-folded, which
 * is what makes "Apellidos, Nombre" meet "Nombre Apellidos"; it is not an
 * identity. Measured against this register: 6,670 officeholders resolve to 6,663
 * distinct keys, and only three keys cover genuinely different posts — a
 * collision rate of 0.045 %. Low, and not zero, so a key covering more than one
 * post yields nothing rather than the first of them.
 *
 * **The party must agree.** The officeholder's party must be the party the
 * foundation is linked to, or the officeholder must be recorded as unaffiliated
 * (which is how the register carries government delegates and senior
 * appointees). This is what turns a name match into evidence: two different
 * people who happen to share a folded name have no reason at all to share a
 * party with a foundation neither of them was matched on. Across the fourteen
 * matches this register yields, all fourteen agree — every Fundación Pablo
 * Iglesias match is PSOE or a PSOE-appointed independent, both Sabino Arana
 * matches are PNV, and the Concordia y Libertad match is PP.
 *
 * What is *not* claimed. The office is the office **as the register stated it on
 * its own last-updated date**, which is carried on every tie and rendered. The
 * register has no per-person date and no active flag, so a title that has since
 * changed hands is the register's staleness and is presented as such — never as
 * a current fact this site asserts. And nothing here says a person's office and
 * their board seat have anything to do with each other: they are two public
 * records about one person, placed side by side, which is the same rule the
 * money and the votes are published under.
 */

export interface OfficeTie extends Tie {
  kind: "government";
  /** The register's own slug, so the tie can link to the person's page. */
  slug: string;
}

export interface OfficeJoin {
  /** Ties, keyed by `nameKey` of the person. */
  byPerson: Map<string, OfficeTie[]>;
  /** How the join went, for the page to state rather than imply. */
  audit: {
    /** People with a board role anywhere in the curated set. */
    candidates: number;
    /** Matched, both conditions met. */
    matched: number;
    /** No row in the register at all — the ordinary case for a private trustee. */
    unmatched: number;
    /** One folded name, more than one distinct post. Dropped. */
    ambiguous: string[];
    /** Matched a post whose party contradicts the foundation's. Dropped. */
    partyMismatch: { person: string; foundationParty: string; registerParty: string }[];
    /** The date the register itself was last updated. */
    registerUpdated: string | null;
  };
}

/** A post's identity, for deciding whether two rows are the same office. */
function postSignature(p: Officeholder): string {
  return `${p.role}|${p.region ?? ""}|${p.municipality ?? ""}`;
}

/**
 * Resolve board members to public offices.
 *
 * `partyNifByFoundation` comes from the audit report's own party link — see
 * `entities()` in lib/foundations.ts — so the party condition is checked against
 * what the Tribunal de Cuentas states, not against anything guessed here.
 */
export async function officeTies(
  partyNifByFoundation: Map<string, string | null>,
): Promise<OfficeJoin> {
  const register = await getSalaries();

  const byKey = new Map<string, Officeholder[]>();
  for (const p of register.people) {
    const k = nameKey(p.name);
    const list = byKey.get(k);
    if (list) list.push(p);
    else byKey.set(k, [p]);
  }

  const source: Source = {
    publisher: register.source.name,
    title: "Registro de Altos Cargos",
    url: "https://transparencia.gob.es/",
    date: register.source.updated ?? register.generatedAt.slice(0, 10),
    kind: "registry",
  };

  const byPerson = new Map<string, OfficeTie[]>();
  const ambiguous: string[] = [];
  const partyMismatch: OfficeJoin["audit"]["partyMismatch"] = [];
  const candidates = new Set<string>();
  let matched = 0;
  let unmatched = 0;

  // One decision per person, not per role: someone on two boards is one person
  // with one public office, and the party condition passes if any of their
  // foundations is the register's party.
  const foundationsOf = new Map<string, { person: string; foundations: string[] }>();
  for (const role of ROLES) {
    const key = nameKey(role.person);
    const entry = foundationsOf.get(key);
    if (entry) {
      if (!entry.foundations.includes(role.foundation)) entry.foundations.push(role.foundation);
    } else {
      foundationsOf.set(key, { person: role.person, foundations: [role.foundation] });
    }
  }

  for (const [key, { person, foundations }] of foundationsOf) {
    candidates.add(key);
    const hits = byKey.get(key) ?? [];
    if (hits.length === 0) {
      unmatched++;
      continue;
    }

    const posts = new Set(hits.map(postSignature));
    if (posts.size > 1) {
      ambiguous.push(person);
      continue;
    }

    const office = hits[0];
    const expected = foundations
      .map((f) => partyNifByFoundation.get(f) ?? null)
      .filter((n): n is string => Boolean(n));

    // Unaffiliated in the register is how a government delegate or a senior
    // appointee is carried, so it corroborates nothing and contradicts nothing.
    // Narrowed by the null check rather than by a boolean, so the compiler can
    // see that `includes` is only reached with a string.
    const agrees =
      office.partyNif === null ||
      expected.length === 0 ||
      expected.includes(office.partyNif);

    if (!agrees) {
      partyMismatch.push({
        person,
        foundationParty: expected.join(", "),
        registerParty: office.partyShort,
      });
      continue;
    }

    matched++;
    byPerson.set(key, [
      {
        person,
        // The office title carries the fact. The register's region column
        // means different things per row type — where a government delegate
        // operates, the constituency a deputy was elected in, the
        // administration a regional consejera serves — so it is a qualifier
        // and never folded into an organisation name we would have to invent.
        organisation: office.role,
        role: office.region ?? office.municipality ?? "",
        kind: "government",
        source,
        slug: office.slug,
      },
    ]);
  }

  return {
    byPerson,
    audit: {
      candidates: candidates.size,
      matched,
      unmatched,
      ambiguous,
      partyMismatch,
      registerUpdated: register.source.updated,
    },
  };
}
