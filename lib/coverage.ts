import { getSalaries } from "./salaries";
import { getVotes } from "./votes";
import { getFoundations, entities } from "./foundations";
import { portraitKeys } from "./photos";
import { ROLES } from "./foundation-people";
import { DONATIONS_SOURCE } from "./donations";
import { nameKey } from "./name-key.mjs";

/**
 * How much of each dataset is actually populated.
 *
 * The strongest thing about this site is that it states its gaps, and until now
 * it stated them in prose — which means a reader has to take the sentence's
 * word for it. These are the same gaps as numbers, computed from the data on
 * every build, so the page cannot claim a coverage it does not have.
 *
 * Computed, never transcribed. The plan that specified this chart quoted 133
 * portraits from a count taken months earlier; measured against the register it
 * is 130, because three of the portraits in `data/photos.json` belong to people
 * the register does not carry. A hardcoded figure would have published the
 * wrong one and gone on being wrong.
 *
 * Only a ratio with a real denominator becomes a bar. "Nine tracked divisions"
 * is a true and useful number with no denominator at all — the Congreso holds
 * thousands — and drawing it as a proportion of anything would invent a whole
 * it is not a part of. Those are reported as counts instead.
 */

export interface CoverageRatio {
  id: string;
  covered: number;
  total: number;
}

export interface CoverageCount {
  id: string;
  value: number;
}

export interface Coverage {
  ratios: CoverageRatio[];
  counts: CoverageCount[];
  /** Portraits held that match nobody in the register. */
  orphanPortraits: number;
}

export async function getCoverage(): Promise<Coverage> {
  const [salaries, votes, foundations, photoKeys] = await Promise.all([
    getSalaries(),
    getVotes(),
    getFoundations(),
    portraitKeys(),
  ]);

  const register = salaries.people;
  const total = register.length;

  const photos = new Set(photoKeys);
  const withPortrait = register.filter((p) => photos.has(nameKey(p.name))).length;

  // A register row counts as having a roll-call record when its folded name
  // appears in any tracked division. Most deputies are not senior appointees
  // and most senior appointees are not deputies, so this is deliberately the
  // intersection and not either total.
  const voters = new Set<string>();
  for (const v of votes.votes) for (const d of v.votes) voters.add(nameKey(d.deputy));
  const withVote = register.filter((p) => voters.has(nameKey(p.name))).length;

  const withSalary = register.filter((p) => p.gross > 0).length;

  const audited = entities(foundations);
  const boarded = new Set(ROLES.map((r) => r.foundation));
  const withBoard = audited.filter((e) => boarded.has(e.name)).length;

  return {
    ratios: [
      { id: "salary", covered: withSalary, total },
      { id: "vote", covered: withVote, total },
      { id: "portrait", covered: withPortrait, total },
      { id: "board", covered: withBoard, total: audited.length },
    ],
    counts: [
      { id: "divisions", value: votes.votes.length },
      { id: "deputies", value: voters.size },
      { id: "donationYears", value: 1 },
      { id: "donationYear", value: DONATIONS_SOURCE.year },
    ],
    orphanPortraits: photos.size - withPortrait,
  };
}
