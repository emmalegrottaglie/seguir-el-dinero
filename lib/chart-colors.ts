/**
 * The colour a category gets, decided once.
 *
 * The three donation tranches were drawn three different ways: party colour /
 * party colour at 62 % / ink on the donations table, ink-3 / abstention grey /
 * ink on the front page, and ink-3 / gold / red on a party page. Same three
 * tranches, three palettes, on pages a reader moves between in two clicks.
 *
 * These are fills, so the 3:1 that WCAG 1.4.11 asks of a graphic applies rather
 * than the 4.5:1 for text — but their *labels* are text, which is why the
 * legend takes its colour from `BarLegend`'s swatch and never sets the label in
 * the fill colour.
 */

/**
 * Small to large. The ramp runs light-to-dark on purpose: the eye reads the
 * dark end as the heavier one, and the finding in this data is always that the
 * largest tranche holds the least of the money or the fewest of the people.
 */
export const TRANCHE_COLORS = {
  small: "var(--grey-500)",
  mid: "var(--gold)",
  large: "var(--ink)",
} as const;

/**
 * The report's own spending categories. The residual takes the alert colour
 * because it is the finding — the part whose destination the audit does not
 * state — and not because anything improper is alleged about it.
 */
export const SPEND_COLORS = {
  advertising: "var(--gold)",
  financial: "var(--grey-500)",
  residual: "var(--red)",
  /** Accounted outside the general limit, so it is deliberately inert. */
  mailings: "var(--grey-300)",
} as const;

/** A division's outcome, matching the stance colours used in prose. */
export const STANCE_COLORS = {
  si: "var(--verd)",
  no: "var(--red)",
  abstention: "var(--abst)",
} as const;

/**
 * State subsidy kinds. `seguridad` is hatched rather than given a colour of its
 * own: it is a small share on most rows, and a fourth hue in a chart that
 * already carries 28 party colours would not be distinguishable. The hatch is
 * legended wherever it appears — an unexplained hatch reads as a warning, and
 * this is an ordinary category.
 */
export const SUBSIDY_COLORS = {
  seguridad: "var(--ink-2)",
  otra: "var(--grey-500)",
} as const;

/**
 * Where a party foundation's money comes from. Party money leads the table and
 * takes the accent, because it is nine tenths of the total and the least
 * expected; corporate money takes the alert colour because it is the thing a
 * reader arrives looking for, not because anything improper is alleged.
 */
export const CHANNEL_COLORS = {
  party: "var(--gold)",
  companies: "var(--red)",
  individuals: "var(--ink-2)",
  subsidies: "var(--grey-500)",
} as const;
