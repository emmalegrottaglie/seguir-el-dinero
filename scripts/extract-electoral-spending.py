"""Extract per-formation electoral spending from a Tribunal de Cuentas report.

    python scripts/extract-electoral-spending.py path/to/I1628.pdf

Writes data/electoral-spending.json.

Why this exists: the site could show who received public money but never what it
bought. The fiscalización report is the only place the destination is itemised,
and it is published as a PDF.

What the report actually itemises, which is not what the law's eight categories
suggest: expenditure is broken out against the two advertising caps — outdoor
advertising under LOREG art. 55 and press/radio under art. 58 — plus mailings of
electoral propaganda, financial costs, and a single residual line, "Otros gastos
ordinarios", which is usually the largest of them. That residual is the finding,
not a gap in this script.

Verification. The report prints its own arithmetic for each formation:
ordinary total F = A + B - C - D + E, and mailing total D = A + B - C. Both are
recomputed here from the parsed figures and the script aborts on any mismatch
over one cent, so a misread label cannot reach the site quietly. That is the same
guard extract-foundations.py uses against its annex totals.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover
    raise SystemExit("pypdf is required: pip install pypdf")

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "data" / "electoral-spending.json"

# Spanish decimals: thousands separated by ".", decimal comma. The trailing
# "(?:\.\d{2})?" catches a malformed token — see money().
NUM = r"-?\d{1,3}(?:\.\d{3})*(?:,\d{2}|\.\d{2})?"


def money(raw: str | None) -> float:
    """Parse a Spanish-formatted amount, tolerating one malformed separator.

    Report nº 1.628 prints Podemos's ordinary total as "1.331.207.90" — a period
    where the decimal comma belongs. The verification guard caught it, and the
    report's own arithmetic confirms the intended value is 1,331,207.90
    (693,309.01 - 3,267.00 - 90.75 + 641,256.64).

    Reinterpreting that final group is deterministic rather than a guess: in this
    format every thousands group after the first is exactly three digits, so a
    final group of exactly two digits cannot be a thousands group. Only that
    shape is reinterpreted; anything else parses normally or fails the guard.
    """
    if not raw:
        return 0.0
    text = raw
    if "," not in text and re.search(r"\.\d{3}", text) and re.search(r"\.\d{2}$", text):
        text = text[: text.rfind(".")] + "," + text[text.rfind(".") + 1 :]
    return float(text.replace(".", "").replace(",", "."))


def norm(text: str) -> str:
    """Collapse the PDF's hard-wrapped labels onto one line each."""
    return re.sub(r"\s+", " ", text)


def rows(section: str) -> list[str]:
    """Split a normalised table section into its rows.

    Rows begin either with a lettered marker — "A)" through "F)" — or with the
    "- " bullet of a sub-line. Splitting first matters because a blank cell puts
    the next label immediately after the current one, and a scan that simply
    looked ahead for the next number would cross the row boundary and read its
    neighbour's value. That is exactly what happened to Podemos: an empty
    "B) Gastos reclasificados netos" picked up C's 3.267,00.
    """
    return [
        r.strip()
        for r in re.split(r"(?=(?:[A-F][)]|[-] |[0-9]{1,2}[.] [A-Z]))", section)
        if r.strip()
    ]


def field(section: str, label: str) -> float:
    """Amount on the row that starts with `label`. A blank cell reads as 0.

    Takes the *last* number on the row, not the first: several labels carry a
    statutory article inside them — "Gastos de publicidad exterior (art. 55 de
    la LOREG)" — and in this layout the amount is always at the end of the row.
    """
    for row in rows(section):
        # Sub-lines are bulleted in the report — "- Otros gastos ordinarios
        # 874.014,92" — while the lettered rows are not. Stripping the bullet
        # lets one label match either shape.
        if row.lstrip("- ").startswith(label):
            found = re.findall(NUM, row)
            return money(found[-1]) if found else 0.0
    return 0.0


def flag(block: str, label: str) -> bool | None:
    m = re.search(re.escape(label) + r"\s*(SÍ|SI|NO)\b", block)
    if not m:
        return None
    return m.group(1) != "NO"


def tables(block: str) -> list[str]:
    """Split a formation's block into its numbered tables, in any order.

    The report does not keep the five tables in a fixed order: Podemos prints
    "2. RECURSOS DECLARADOS" *after* its ordinary expenditure table. Slicing
    between two fixed heading texts therefore returned an empty resources table
    for that formation and let the expenditure slice run on into the next one,
    where "Total recursos" was read as the expenditure total. Splitting on the
    numbering instead is order-independent.
    """
    return [t.strip() for t in re.split(r"(?=[0-9]{1,2}[.] [A-Z])", block) if t.strip()]


def table(block: str, heading: str) -> str:
    """The numbered table whose heading contains `heading`, or an empty string."""
    for t in tables(block):
        head = t[:80]
        if heading in head:
            return t
    return ""


def parse(pdf: Path) -> dict:
    reader = PdfReader(str(pdf))
    pages = [p.extract_text() or "" for p in reader.pages]
    text = "\n".join(pages)

    approved = re.search(r"APROBADO POR EL PLENO DEL TRIBUNAL DE CUENTAS EL (\d{2}/\d{2}/\d{4})", text)
    number = re.search(r"N\.º\s*([\d.]+)", text)
    election = norm(re.search(r"INFORME\s+DE\s+FISCALIZACI.{0,3}N.{0,400}", text, re.S).group(0))[:200]

    # The table of contents lists the same headings, but its entries are padded
    # with dots, which `[^\n.]` already excludes — so the matches here are only
    # the real ones. An earlier version additionally took the later half of the
    # matches to drop TOC duplicates that were never in the list, and so silently
    # skipped the first four formations while still verifying cleanly. Each
    # heading is confirmed instead by the subsection that must follow it.
    heads = [
        m
        for m in re.finditer(r"^III\.(\d+)\.\s+([^\n.]+?)\s*$", text, re.M)
        if "COMPROBACIONES FORMALES" in text[m.end() : m.end() + 120]
    ]
    if not heads:
        raise SystemExit("no formation sections found — is this a contabilidades electorales report?")

    formations = []
    for idx, head in enumerate(heads):
        start = head.end()
        end = heads[idx + 1].start() if idx + 1 < len(heads) else len(text)
        block = norm(text[start:end])
        name = norm(head.group(2)).strip()

        res = table(block, "RECURSOS DECLARADOS")
        ord_ = table(block, "GASTOS POR OPERACIONES ORDINARIAS")
        env = table(block, "GASTOS POR ENV")
        lim = table(block, "LIMITES DE GASTOS")

        resources = {
            "private": field(res, "Aportaciones privadas"),
            "borrowing": field(res, "Operaciones de endeudamiento"),
            "subsidyAdvances": field(res, "Adelantos de subvenciones"),
            "fromParty": field(res, "Aportaciones del Partido"),
            "other": field(res, "Otros ingresos"),
            "total": field(res, "Total recursos"),
        }

        ordinary = {
            "declared": field(ord_, "A) Gastos declarados"),
            # The two categories the law actually caps, each with its article.
            "outdoorAdvertising": field(ord_, "Gastos de publicidad exterior"),
            "pressRadioAdvertising": field(ord_, "Gastos de publicidad en prensa y radio"),
            "financialSettled": field(ord_, "Gastos financieros liquidados"),
            "financialEstimated": field(ord_, "Estimación de gastos financieros"),
            # Usually the largest line, and the reason the destination stays opaque.
            "otherOrdinary": field(ord_, "Otros gastos ordinarios"),
            "reclassifiedNet": field(ord_, "B) Gastos reclasificados netos"),
            "notSubsidisable": field(ord_, "C) Gastos no subvencionables"),
            "nonElectoral": field(ord_, "D) Gastos no electorales"),
            "mailingsInLimit": field(ord_, "E) Cantidad justificada por env"),
            "totalJustified": field(ord_, "F) Total gastos electorales"),
        }

        mailings = {
            "declared": field(env, "A) Gastos declarados"),
            "otherMailing": field(env, "Otros gastos de env"),
            "reclassifiedNet": field(env, "B) Gastos reclasificados netos"),
            "notSubsidisable": field(env, "C) Gastos no subvencionables"),
            "totalJustified": field(env, "D) Total gastos electorales por env"),
            "countWithSubsidyRight": int(field(env, "E) N") or 0),
        }

        # Only the exceedance verdicts, not the cap amounts. The limits table's
        # rows are plain labels with no lettered marker or bullet, so `rows()`
        # does not split them and every amount read as zero. Rather than publish
        # zeros that would look like real caps, the amounts are left out; the
        # SÍ/NO verdicts are read from the raw text by `flag()` and are correct.
        limits = {
            "exceededMaximum": flag(lim, "Exceso en el límite máximo de gastos"),
            "exceededOutdoorAdvertising": flag(lim, "Exceso en el límite de gastos de publicidad exterior"),
        }

        formations.append(
            {
                "name": name,
                "resources": resources,
                "ordinary": ordinary,
                "mailings": mailings,
                "limits": limits,
            }
        )

    return {
        "source": {
            "body": "Tribunal de Cuentas",
            "report": f"nº {number.group(1)}" if number else "?",
            "approved": approved.group(1) if approved else "?",
            "election": election,
            "url": "https://www.tcu.es/export/sites/portal/repositorio2/INFORME/2025/I1628.pdf",
        },
        "formations": formations,
    }


def verify(data: dict) -> None:
    """Recompute the report's own arithmetic. Abort rather than publish a misread."""
    for f in data["formations"]:
        # An all-zero formation satisfies A+B-C-D+E = F trivially. Without this
        # check the arithmetic guard reported eight empty formations as verified,
        # which is how a broken row splitter went unnoticed.
        if not f["ordinary"]["declared"] or not f["ordinary"]["totalJustified"]:
            raise SystemExit(
                f"{f['name']}: no declared ordinary expenditure parsed \u2014 the labels "
                f"did not match the report's layout, aborting"
            )

        o, m = f["ordinary"], f["mailings"]

        expected = (
            o["declared"]
            + o["reclassifiedNet"]
            - o["notSubsidisable"]
            - o["nonElectoral"]
            + o["mailingsInLimit"]
        )
        if abs(expected - o["totalJustified"]) > 0.01:
            raise SystemExit(
                f"{f['name']}: ordinary A+B-C-D+E = {expected:.2f} but the report "
                f"states F = {o['totalJustified']:.2f} — aborting"
            )

        expected_m = m["declared"] + m["reclassifiedNet"] - m["notSubsidisable"]
        if abs(expected_m - m["totalJustified"]) > 0.01:
            raise SystemExit(
                f"{f['name']}: mailings A+B-C = {expected_m:.2f} but the report "
                f"states D = {m['totalJustified']:.2f} — aborting"
            )

        # A declared total that is less than its own itemised parts means a label
        # was matched to the wrong number.
        parts = (
            o["outdoorAdvertising"]
            + o["pressRadioAdvertising"]
            + o["financialSettled"]
            + o["financialEstimated"]
            + o["otherOrdinary"]
        )
        # The five sub-lines are a complete decomposition of A, not a sample:
        # every formation in report 1.628 sums to its declared total exactly,
        # including Coalición por una Europa Solidaria, whose entire declared
        # spend is the two advertising lines and whose "Otros" cell is blank.
        # Requiring equality rather than merely "not more" is what catches a
        # label that stopped matching: an earlier version missed the report's
        # "- " bullet on every sub-line and read all five as zero, which a
        # not-more-than check would have accepted.
        if o["declared"] and abs(parts - o["declared"]) > 0.01:
            raise SystemExit(
                f"{f['name']}: itemised ordinary lines sum to {parts:.2f} but the "
                f"declared total is {o['declared']:.2f} — aborting"
            )


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    data = parse(Path(sys.argv[1]))
    verify(data)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"{len(data['formations'])} formations, arithmetic verified against the report")
    for f in data["formations"]:
        o = f["ordinary"]
        share = (o["otherOrdinary"] / o["declared"] * 100) if o["declared"] else 0
        print(
            f"  {f['name'][:44]:<44} declared {o['declared']:>12,.2f}  "
            f"otros {o['otherOrdinary']:>12,.2f} ({share:4.1f}%)"
        )
    print(f"wrote {OUT.relative_to(REPO)}")


if __name__ == "__main__":
    main()
