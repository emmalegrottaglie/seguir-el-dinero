/**
 * Turns a row of records into an RFC 4180 CSV.
 *
 * Column headers are fixed, cross-locale identifiers rather than translated UI
 * strings — a script that reads one of these files by column name should not
 * break because a reader picked `/en` instead of `/es`. What is localised is
 * the dataset's title and description on `/datos`, not the columns inside it.
 *
 * A UTF-8 BOM is prepended because Excel — still the tool most people who ask
 * for "the raw data" actually open it in — guesses Windows-1252 without one,
 * and every accented name and "ñ" in this dataset would render wrong.
 */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

function cell(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "string" ? v : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => cell(c.header)).join(",");
  const lines = rows.map((row) => columns.map((c) => cell(c.value(row))).join(","));
  return "﻿" + [header, ...lines].join("\r\n") + "\r\n";
}
