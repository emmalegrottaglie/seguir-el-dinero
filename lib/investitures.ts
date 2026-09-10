/**
 * Whether a regional president could have been invested without Vox.
 *
 * This layer was deliberately not shipped with the map, and the reason is worth
 * keeping: the obvious version of it — a hatch meaning "Vox is in this
 * government" — was already false for part of the period it would have
 * described. Five PP presidencies were invested with Vox votes in July 2023 and
 * Vox left three of those governments in July 2024, so one static overlay is
 * wrong whichever way it is drawn.
 *
 * What is drawn instead is a **fact about a dated vote**, which cannot go stale.
 * An investiture happened on a day, with a tally, in a chamber of a known size.
 * Whether Vox sits in a cabinet today is a different question and is not on
 * this map.
 *
 * Two things are recorded per community and they are not the same claim:
 *
 * 1. **The arithmetic.** The chamber's size and the seats the PP and Vox each
 *    won. From those, whether the PP could reach an absolute majority alone.
 *    This is two published numbers and a division; anyone can redo it, and it
 *    is true regardless of how anyone voted.
 *
 * 2. **The recorded vote**, where it has been verified: the date, the round,
 *    the tally, and how many of the votes in favour each party supplied.
 *
 * The distinction matters because they can disagree. A Spanish regional
 * investiture that fails on an absolute majority is retried on a simple
 * majority, where abstentions are enough — so "the PP was short of a majority
 * alone" does **not** establish that Vox's votes invested anyone. Only the
 * tally does. Communities where the tally is not verified here say so, and the
 * map draws them differently.
 *
 * Murcia is why the tally is worth having. The arithmetic alone says the PP was
 * six seats short. The record says López Miras was rejected twice in July 2023
 * with Vox voting *against* him, and invested only on 7 September after a
 * coalition agreement. That is a considerably stronger and more specific fact
 * than the arithmetic, and it is not derivable from it.
 */

export interface InvestitureRound {
  /** ISO date of the vote. */
  date: string;
  round: number;
  /** Spanish regional investitures drop to a simple majority after the first. */
  majorityRequired: "absolute" | "simple";
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  /**
   * How many of the votes *in favour* each party supplied. Must sum to
   * `votesFor` — that is the guard, and it is what establishes Vox's
   * contribution. The against-column breakdown is not recorded, because it is
   * not load-bearing for anything published here and the sources disagree on
   * its detail.
   */
  forBreakdown: Record<string, number>;
  succeeded: boolean;
}

export interface Investiture {
  /** INE autonomous-community code, joining lib/regions.ts. */
  id: string;
  chamberSeats: number;
  seatsPP: number;
  seatsVox: number;
  /** The election these seats come from, since the cycles differ. */
  electionDate: string;
  /** Rounds in order. Empty where only the arithmetic is on record here. */
  rounds: InvestitureRound[];
  source: { publisher: string; title: string; url: string };
}

const WIKI = (title: string, url: string) => ({
  publisher: "Wikipedia (es)",
  title,
  url,
});

/**
 * Only communities the PP governs are listed, because the question this layer
 * answers is about the PP's own majorities. A community absent from here is
 * drawn as not applicable rather than as a negative finding.
 */
export const INVESTITURES: Investiture[] = [
  {
    id: "02",
    chamberSeats: 67,
    seatsPP: 28,
    seatsVox: 7,
    electionDate: "2023-05-28",
    // The tally reconciles against the chamber (36 + 31 = 67) but the votes in
    // favour exceed PP + Vox by one, and the source does not identify the
    // party that supplied it consistently. The extra vote is not load-bearing
    // — PP and Vox together already clear the 34 needed — so the round is
    // recorded without a breakdown that would not sum.
    rounds: [],
    source: WIKI(
      "Elecciones a las Cortes de Aragón de 2023",
      "https://es.wikipedia.org/wiki/Elecciones_a_las_Cortes_de_Arag%C3%B3n_de_2023",
    ),
  },
  {
    id: "04",
    chamberSeats: 59,
    seatsPP: 25,
    seatsVox: 8,
    electionDate: "2023-05-28",
    // The available tally puts Vox at 4 votes and Més at 8, which is the
    // reverse of the seats they hold (8 and 4). A breakdown that contradicts
    // the seat counts is not usable, so this ships on the arithmetic alone.
    rounds: [],
    source: WIKI(
      "Elecciones al Parlamento de las Islas Baleares de 2023",
      "https://es.wikipedia.org/wiki/Elecciones_al_Parlamento_de_las_Islas_Baleares_de_2023",
    ),
  },
  {
    id: "06",
    chamberSeats: 35,
    seatsPP: 15,
    seatsVox: 4,
    electionDate: "2023-05-28",
    rounds: [],
    source: WIKI(
      "Elecciones al Parlamento de Cantabria de 2023",
      "https://es.wikipedia.org/wiki/Elecciones_al_Parlamento_de_Cantabria_de_2023",
    ),
  },
  {
    id: "07",
    chamberSeats: 81,
    seatsPP: 31,
    seatsVox: 13,
    electionDate: "2022-02-13",
    rounds: [
      {
        date: "2022-04-11",
        round: 1,
        majorityRequired: "absolute",
        votesFor: 44,
        votesAgainst: 37,
        abstentions: 0,
        forBreakdown: { PP: 31, Vox: 13 },
        succeeded: true,
      },
    ],
    source: WIKI(
      "Elecciones a las Cortes de Castilla y León de 2022",
      "https://es.wikipedia.org/wiki/Elecciones_a_las_Cortes_de_Castilla_y_Le%C3%B3n_de_2022",
    ),
  },
  {
    id: "10",
    chamberSeats: 99,
    seatsPP: 40,
    seatsVox: 13,
    electionDate: "2023-05-28",
    rounds: [
      {
        date: "2023-07-13",
        round: 1,
        majorityRequired: "absolute",
        votesFor: 53,
        votesAgainst: 46,
        abstentions: 0,
        forBreakdown: { PP: 40, Vox: 13 },
        succeeded: true,
      },
      // The presidency changed hands within the same legislature and the same
      // party in December 2025, and the second investiture depended on the same
      // votes. A single dated overlay would have described only one of these.
      {
        date: "2025-11-27",
        round: 1,
        majorityRequired: "absolute",
        votesFor: 53,
        votesAgainst: 45,
        abstentions: 0,
        forBreakdown: { PP: 40, Vox: 13 },
        succeeded: true,
      },
    ],
    source: WIKI(
      "Elecciones a las Cortes Valencianas de 2023",
      "https://es.wikipedia.org/wiki/Elecciones_a_las_Cortes_Valencianas_de_2023",
    ),
  },
  {
    id: "11",
    chamberSeats: 65,
    seatsPP: 28,
    seatsVox: 5,
    electionDate: "2023-05-28",
    rounds: [
      {
        date: "2023-07-14",
        round: 1,
        majorityRequired: "absolute",
        votesFor: 33,
        votesAgainst: 32,
        abstentions: 0,
        forBreakdown: { PP: 28, Vox: 5 },
        succeeded: true,
      },
    ],
    source: WIKI(
      "Elecciones a la Asamblea de Extremadura de 2023",
      "https://es.wikipedia.org/wiki/Elecciones_a_la_Asamblea_de_Extremadura_de_2023",
    ),
  },
  {
    id: "14",
    chamberSeats: 45,
    seatsPP: 21,
    seatsVox: 9,
    electionDate: "2023-05-28",
    // The clearest record of the three. Twice rejected with Vox voting against,
    // then invested with its votes after a coalition agreement.
    rounds: [
      {
        date: "2023-07-07",
        round: 1,
        majorityRequired: "absolute",
        votesFor: 21,
        votesAgainst: 24,
        abstentions: 0,
        forBreakdown: { PP: 21 },
        succeeded: false,
      },
      {
        date: "2023-07-10",
        round: 2,
        majorityRequired: "simple",
        votesFor: 21,
        votesAgainst: 24,
        abstentions: 0,
        forBreakdown: { PP: 21 },
        succeeded: false,
      },
      {
        date: "2023-09-07",
        round: 1,
        majorityRequired: "absolute",
        votesFor: 30,
        votesAgainst: 15,
        abstentions: 0,
        forBreakdown: { PP: 21, Vox: 9 },
        succeeded: true,
      },
    ],
    source: WIKI(
      "Elecciones a la Asamblea Regional de Murcia de 2023",
      "https://es.wikipedia.org/wiki/Elecciones_a_la_Asamblea_Regional_de_Murcia_de_2023",
    ),
  },
  {
    id: "19",
    chamberSeats: 25,
    seatsPP: 11,
    seatsVox: 2,
    electionDate: "2023-05-28",
    rounds: [],
    source: WIKI(
      "Elecciones a la Asamblea de Melilla de 2023",
      "https://es.wikipedia.org/wiki/Elecciones_a_la_Asamblea_de_Melilla_de_2023",
    ),
  },
];

/** Seats needed for an absolute majority in a chamber of `seats`. */
export function absoluteMajority(seats: number): number {
  return Math.floor(seats / 2) + 1;
}

export type InvestitureStatus =
  /** The recorded tally shows Vox supplied votes the winning total needed. */
  | "vox-decisive"
  /**
   * The PP was short of an absolute majority alone and Vox's seats would have
   * closed the gap, but the tally is not verified here — and a second-round
   * simple majority means abstentions could have sufficed instead.
   */
  | "pp-short-alone"
  /** The PP held an absolute majority without anyone. */
  | "pp-majority"
  /** Not a PP presidency, or not recorded here. */
  | "not-applicable";

export interface InvestitureFinding {
  status: InvestitureStatus;
  majority: number;
  /** The round that invested the president, when one is recorded. */
  decidingRound: InvestitureRound | null;
  /** Votes in favour that Vox supplied in that round. */
  voxVotesFor: number;
  /** True where the PP's own seats fell short of an absolute majority. */
  ppShortAlone: boolean;
  investiture: Investiture | null;
}

/**
 * What the record supports for one community.
 *
 * `vox-decisive` requires both that the PP was short alone *and* that a
 * verified tally shows Vox in the winning column — never one or the other.
 */
export function investitureFor(id: string): InvestitureFinding {
  const inv = INVESTITURES.find((i) => i.id === id);
  if (!inv) {
    return {
      status: "not-applicable",
      majority: 0,
      decidingRound: null,
      voxVotesFor: 0,
      ppShortAlone: false,
      investiture: null,
    };
  }

  const majority = absoluteMajority(inv.chamberSeats);
  const ppShortAlone = inv.seatsPP < majority;
  // The last successful round is the one that invested the sitting president.
  const won = [...inv.rounds].reverse().find((r) => r.succeeded) ?? null;
  const voxVotesFor = won?.forBreakdown.Vox ?? 0;

  const status: InvestitureStatus = !ppShortAlone
    ? "pp-majority"
    : won && voxVotesFor > 0 && won.votesFor - voxVotesFor < majority
      ? "vox-decisive"
      : "pp-short-alone";

  return { status, majority, decidingRound: won, voxVotesFor, ppShortAlone, investiture: inv };
}

/** How much of this layer rests on a verified tally rather than on arithmetic. */
export function investitureCoverage() {
  const findings = INVESTITURES.map((i) => investitureFor(i.id));
  return {
    communities: INVESTITURES.length,
    voteVerified: findings.filter((f) => f.status === "vox-decisive").length,
    arithmeticOnly: findings.filter((f) => f.status === "pp-short-alone").length,
  };
}
