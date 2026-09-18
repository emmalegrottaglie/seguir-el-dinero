import { getSalaries } from "./salaries";
import { getIndicators, AROPE_BASE, BOTH_SEXES, NATIONAL } from "./indicators";
import { getHateTerritory } from "./regions";
import { GOVERNMENTS, GOVERNMENTS_SOURCE } from "./governments";
import { investitureFor, type InvestitureStatus } from "./investitures";
import { territoryById, type Territory } from "./territories";
import type { Government } from "./governments";
import type { Investiture } from "./investitures";

/**
 * Everything this site knows about one comunidad autónoma, in one object.
 *
 * The site publishes nine national views and a reader has to assemble their own
 * from them. This assembles it instead — who governs where they live, how many
 * of the officeholders in the register sit there, what the recorded hate-crime
 * rate is, what the poverty rate is, what the wages are — with the national
 * figure beside each one so a local number is never read as though it were
 * unusual or ordinary without a reference.
 *
 * Two boundaries this module holds, and they are the reason it exists rather
 * than each page doing its own lookup:
 *
 * **A province is not a comunidad autónoma.** The reader arrives by province,
 * because that is what a postcode gives. Every figure here is measured at the
 * comunidad level, and a page built on this has to say so — otherwise it implies
 * province-level data that nobody publishes. Nothing in this module is divided,
 * scaled or apportioned down to a province; that arithmetic would be invention.
 *
 * **An absence stays an absence.** The register carries no territory for 889 of
 * its 6,670 rows, EAES publishes no wage percentiles for Ceuta or Melilla, and a
 * territory can be missing from any one series while present in another. Every
 * field below is nullable for that reason, and nothing falls back to the
 * national figure when the local one is missing — a national figure printed
 * under a local heading is the one error this feature must not make.
 */

export interface LocalOfficeholders {
  /** Rows whose `region` names this territory. */
  count: number;
  /** Of those, how many publish an annual figure. */
  withSalary: number;
  /** Median of the published figures, or null when none are published. */
  medianGross: number | null;
}

export interface LocalHate {
  total: number;
  ratePer100k: number;
  sexualOrientationGenderIdentity: number;
  /** The national rate, so the local one is never read alone. */
  nationalRatePer100k: number;
  year: string;
  source: { body: string; report: string; url: string };
}

export interface LocalPoverty {
  /** AROPE for this territory, on the stated base. */
  percent: number;
  nationalPercent: number;
  base: string;
  period: string;
  sourceUrl: string;
}

export interface LocalWages {
  median: number;
  p10: number;
  p90: number;
  nationalMedian: number;
  period: string;
  sourceUrl: string;
}

export interface LocalView {
  territory: Territory;
  government: Government | null;
  governmentSource: typeof GOVERNMENTS_SOURCE;
  investiture: { status: InvestitureStatus; investiture: Investiture | null };
  officeholders: LocalOfficeholders;
  /** Null where the report locates no recorded offence in this territory. */
  hate: LocalHate | null;
  /** Null where the ECV table carries no row for it. */
  poverty: LocalPoverty | null;
  /** Null where EAES publishes no percentiles for it — Ceuta and Melilla. */
  wages: LocalWages | null;
  /** Register rows that state no territory at all, so the count can be qualified. */
  registerWithoutTerritory: number;
  registerTotal: number;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

export async function getLocalView(territoryId: string): Promise<LocalView | null> {
  const territory = territoryById(territoryId);
  if (!territory) return null;

  const [salaries, indicators, hateFile] = await Promise.all([
    getSalaries(),
    getIndicators(),
    getHateTerritory(),
  ]);

  // --- officeholders ------------------------------------------------------
  const here = salaries.people.filter((p) => p.region === territory.registerName);
  const paid = here.filter((p) => p.gross > 0).map((p) => p.gross);

  // --- recorded hate crime -----------------------------------------------
  const h = hateFile.territories[territoryId] ?? null;

  // --- poverty ------------------------------------------------------------
  //
  // Matched on the territory's INE spelling and on the base, never on a
  // similarity: two rows matching would mean the filter no longer identifies a
  // series, so an ambiguous match yields nothing rather than the first hit.
  const aropePrefix = "Tasa de riesgo de pobreza o exclusión social";
  const povertyRows = indicators.poverty.regional.filter(
    (r) =>
      r.base === AROPE_BASE &&
      r.group === "Total" &&
      r.indicator.startsWith(aropePrefix) &&
      r.region === territory.ineName &&
      r.percent !== null,
  );
  const povertyNational = indicators.poverty.regional.find(
    (r) =>
      r.base === AROPE_BASE &&
      r.group === "Total" &&
      r.indicator.startsWith(aropePrefix) &&
      r.region === NATIONAL,
  );
  const povertySource = indicators.sources.find((s) => s.id === "povertyRegional");

  // --- wages --------------------------------------------------------------
  const wageRow = (region: string | null, measure: string) => {
    if (region === null) return null;
    const hits = indicators.wages.percentiles.filter(
      (r) => r.region === region && r.sex === BOTH_SEXES && r.measure === measure,
    );
    return hits.length === 1 && hits[0].value !== null ? hits[0].value : null;
  };
  const localMedian = wageRow(territory.ineName, "Mediana");
  const localP10 = wageRow(territory.ineName, "Percentil 10");
  const localP90 = wageRow(territory.ineName, "Percentil 90");
  const nationalMedian = wageRow(NATIONAL, "Mediana");
  const wageSource = indicators.sources.find((s) => s.id === "percentiles");

  return {
    territory,
    government: GOVERNMENTS.find((g) => g.id === territoryId) ?? null,
    governmentSource: GOVERNMENTS_SOURCE,
    investiture: investitureFor(territoryId),
    officeholders: {
      count: here.length,
      withSalary: paid.length,
      medianGross: median(paid),
    },
    hate:
      h === null
        ? null
        : {
            total: h.total,
            ratePer100k: h.ratePer100k,
            sexualOrientationGenderIdentity: h.sexualOrientationGenderIdentity,
            nationalRatePer100k: hateFile.national.ratePer100k,
            year: String(hateFile.year),
            source: {
              body: hateFile.source.body,
              report: hateFile.source.report,
              url: hateFile.source.url,
            },
          },
    poverty:
      povertyRows.length === 1 && povertyNational?.percent != null && povertySource
        ? {
            percent: povertyRows[0].percent as number,
            nationalPercent: povertyNational.percent,
            base: AROPE_BASE,
            period: povertySource.period,
            sourceUrl: povertySource.url,
          }
        : null,
    wages:
      localMedian !== null && localP10 !== null && localP90 !== null && nationalMedian !== null && wageSource
        ? {
            median: localMedian,
            p10: localP10,
            p90: localP90,
            nationalMedian,
            period: wageSource.period,
            sourceUrl: wageSource.url,
          }
        : null,
    registerWithoutTerritory: salaries.people.filter((p) => !p.region).length,
    registerTotal: salaries.people.length,
  };
}
