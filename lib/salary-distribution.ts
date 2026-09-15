import { getSalaries } from "./salaries";

/**
 * The shape of public pay in the register, so one person's figure can be read
 * against it.
 *
 * A profile page prints a salary and leaves the reader to judge it, which is
 * not a judgement most readers can make: the register runs from €40 a year to
 * €424,237, and both ends are real. The bottom is thousands of mayors of
 * villages of a few hundred people, paid a few euros a month for a post that is
 * genuinely part time; the top is a handful of European and state posts. Four
 * orders of magnitude, so the axis is logarithmic — a linear one would put
 * 4,600 of the 4,964 figures in the leftmost eighth of the strip and show the
 * reader nothing.
 *
 * The denominator is the 4,964 rows that publish a figure, not the register's
 * 6,670. A percentile over rows that have no figure would be a percentile over
 * a number we do not have.
 *
 * What this is not: a ranking of who is overpaid. The register mixes a village
 * mayoralty, the Crown and a European commissionership into one list, and a
 * position in that list is a position in a list. The page says so.
 */

export interface DistributionBin {
  /** Bin bounds in euros. Bins are equal width in log space, not in euros. */
  from: number;
  to: number;
  count: number;
}

export interface SalaryDistribution {
  bins: DistributionBin[];
  /** Domain of the log axis, taken from the data rather than rounded to decades. */
  min: number;
  max: number;
  /** Rows with a published figure. This is the denominator for every ratio here. */
  published: number;
  /** Rows in the register with no published figure. Stated, never dropped. */
  missing: number;
  median: number;
  p25: number;
  p75: number;
  /** Tallest bin, so a renderer can scale without a second pass over the bins. */
  peak: number;
  /** Decade ticks that fall inside the domain. */
  ticks: number[];
}

const BIN_COUNT = 40;

let cache: SalaryDistribution | null = null;

export async function getSalaryDistribution(): Promise<SalaryDistribution> {
  if (cache) return cache;

  const { people } = await getSalaries();
  const values = people
    .map((p) => p.gross)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);

  const min = values[0];
  const max = values[values.length - 1];
  const lo = Math.log10(min);
  const hi = Math.log10(max);
  const step = (hi - lo) / BIN_COUNT;

  const counts = new Array<number>(BIN_COUNT).fill(0);
  for (const v of values) {
    // The maximum lands exactly on the upper edge and would index past the end.
    const i = Math.min(BIN_COUNT - 1, Math.floor((Math.log10(v) - lo) / step));
    counts[i]++;
  }

  const bins = counts.map((count, i) => ({
    from: 10 ** (lo + i * step),
    to: 10 ** (lo + (i + 1) * step),
    count,
  }));

  const q = (f: number) => values[Math.floor((values.length - 1) * f)];

  const ticks: number[] = [];
  for (let d = Math.ceil(lo); d <= Math.floor(hi); d++) ticks.push(10 ** d);

  cache = {
    bins,
    min,
    max,
    published: values.length,
    missing: people.length - values.length,
    median: q(0.5),
    p25: q(0.25),
    p75: q(0.75),
    peak: Math.max(...counts),
    ticks,
  };
  return cache;
}

/**
 * Where a figure sits among the published ones.
 *
 * A percentile alone is not safe at the ends. The fourth-highest salary in the
 * register is above 99.94 % of the others, which prints as "higher than 100 %"
 * — a sentence that includes the person in the group they are being compared
 * against and is simply false. So the ends report a count instead: "only three
 * published figures are higher" is both true and more informative than any
 * rounding of 99.94 %.
 *
 * Counts are strict. The register has 336 figures under €1,000 and many exact
 * ties, and a tied pair must not each be described as above the other.
 */
export interface SalaryPosition {
  /** Fraction of published figures strictly below this one. */
  fraction: number;
  /** How many published figures are strictly higher. */
  above: number;
  /** How many are strictly lower. */
  below: number;
  published: number;
}

export async function positionOf(gross: number): Promise<SalaryPosition | null> {
  if (!(gross > 0)) return null;
  const { people } = await getSalaries();
  const values = people.map((p) => p.gross).filter((v) => v > 0);
  let above = 0;
  let below = 0;
  for (const v of values) {
    if (v > gross) above++;
    else if (v < gross) below++;
  }
  return { fraction: below / values.length, above, below, published: values.length };
}

/** Position of a euro figure on the distribution's log axis, as 0–1. */
export function axisPosition(gross: number, d: SalaryDistribution): number {
  const lo = Math.log10(d.min);
  const hi = Math.log10(d.max);
  return Math.min(1, Math.max(0, (Math.log10(gross) - lo) / (hi - lo)));
}
