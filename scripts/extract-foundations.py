"""Extract per-foundation figures from Tribunal de Cuentas report nº 1.642.

Usage:  python scripts/extract-foundations.py <path-to-I1642.pdf>
Requires: pypdf  (pip install pypdf)

The report is "Informe de fiscalización de las aportaciones percibidas por las
fundaciones y demás entidades vinculadas o dependientes de los partidos
políticos y de los gastos de programas y actividades de estas financiados con
cargo a subvenciones públicas, ejercicios 2021 y 2022", approved 25/09/2025.

Two things are taken from the report and nothing is inferred:

  * Amounts come from ANEXO III (2021) and ANEXO IV (2022), the consolidated
    tables listing every audited entity with its donations/aportaciones and its
    public subsidies.
  * The party each entity is linked to comes from the report's own sentence
    "La <entity>, vinculada a la formación política <party>, ...". An entity
    whose link the report does not state that way is emitted with party=null
    rather than guessed from its name.

The extracted totals are checked against the TOTALES row of each annex; a
mismatch aborts, because a silently wrong figure is worse than no figure.
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

try:
    import pypdf
except ImportError:
    sys.exit("pypdf is required:  pip install pypdf")


def euro(s: str) -> float:
    """'2.500.900,00' -> 2500900.0"""
    return float(s.replace(".", "").replace(",", "."))


# A table row: entity name, then two euro amounts. The name may itself contain
# digits ("Fundación 14 de Abril", "…Instituto 25 de Mayo", "…Madrid 2019"), so
# the amounts are anchored by their decimal comma rather than by excluding digits
# from the name — an earlier version dropped exactly those three rows.
ROW = re.compile(r"^(?P<name>.+?)\s+(?P<a>[\d.]+,\d{2})\s+(?P<b>[\d.]+,\d{2})\s*$")

LINK = re.compile(
    r"La\s+(?P<entity>(?:Fundaci[oó]n|Asociaci[oó]n|Sociedad|Instituto)[^,]{2,90}?),\s*"
    r"vinculada a la formaci[oó]n pol[ií]tica\s+(?P<party>[^,.]{2,90})",
    re.IGNORECASE,
)


def norm(s: str) -> str:
    """Loose key for matching a name in prose against a name in the table."""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.lower().replace("´", "'").replace("`", "'")
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def parse_annex(text: str) -> tuple[dict[str, tuple[float, float]], tuple[float, float]]:
    rows: dict[str, tuple[float, float]] = {}
    totals: tuple[float, float] | None = None
    for raw in text.split("\n"):
        line = " ".join(raw.split())
        m = ROW.match(line)
        if not m:
            continue
        name = m.group("name").strip()
        pair = (euro(m.group("a")), euro(m.group("b")))
        if name.upper().startswith("TOTALES"):
            totals = pair
        elif re.match(r"^(Fundaci|Asociaci|Sociedad|Instituto)", name, re.I):
            rows[name] = pair
    if totals is None:
        raise SystemExit("could not find the TOTALES row in an annex")
    return rows, totals


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("usage: python scripts/extract-foundations.py <path-to-I1642.pdf>")
    reader = pypdf.PdfReader(sys.argv[1])
    pages = []
    for page in reader.pages:
        try:
            pages.append(page.extract_text() or "")
        except Exception:
            pages.append("")

    # --- annexes -----------------------------------------------------------
    annexes: dict[int, str] = {}
    for text in pages:
        if "ANEXO III. DONACIONES" in text:
            annexes[2021] = text
        elif "ANEXO IV. DONACIONES" in text:
            annexes[2022] = text
    missing = {2021, 2022} - annexes.keys()
    if missing:
        raise SystemExit(f"annex not found for {sorted(missing)}")

    parsed = {year: parse_annex(text) for year, text in annexes.items()}

    # --- party links, as stated by the report ------------------------------
    links: dict[str, str] = {}
    whole = "\n".join(pages)
    for m in LINK.finditer(" ".join(whole.split())):
        entity = m.group("entity").strip()
        party = m.group("party").strip().rstrip(" .")
        links.setdefault(norm(entity), party)

    # --- assemble ----------------------------------------------------------
    names = sorted({n for year in parsed for n in parsed[year][0]})
    entities = []
    for name in names:
        years = {}
        for year, (rows, _) in parsed.items():
            if name in rows:
                donations, subsidies = rows[name]
                years[year] = {"donations": donations, "subsidies": subsidies}
        entities.append({"name": name, "party": links.get(norm(name)), "years": years})

    # --- verification: our sums must equal the report's own TOTALES --------
    for year, (rows, totals) in parsed.items():
        got = (sum(v[0] for v in rows.values()), sum(v[1] for v in rows.values()))
        for label, mine, theirs in (("donations", got[0], totals[0]), ("subsidies", got[1], totals[1])):
            if abs(mine - theirs) > 0.05:
                raise SystemExit(
                    f"{year} {label}: extracted {mine:.2f} but the report totals {theirs:.2f} — aborting"
                )

    out = {
        "source": {
            "body": "Tribunal de Cuentas",
            "report": "Informe nº 1.642 — aportaciones percibidas por las fundaciones y demás "
            "entidades vinculadas o dependientes de los partidos políticos, ejercicios 2021 y 2022",
            "approved": "2025-09-25",
            "url": "https://www.tcu.es/export/sites/portal/repositorio2/INFORME/2025/I1642.pdf",
        },
        "years": {
            str(year): {"donations": totals[0], "subsidies": totals[1], "entities": len(rows)}
            for year, (rows, totals) in parsed.items()
        },
        "entities": entities,
    }
    Path("data/foundations.json").write_text(
        json.dumps(out, ensure_ascii=False), encoding="utf-8"
    )

    linked = sum(1 for e in entities if e["party"])
    print(f"wrote data/foundations.json — {len(entities)} entities, {linked} with a party stated")
    for year, (rows, totals) in sorted(parsed.items()):
        print(f"  {year}: donations {totals[0]:,.2f} / subsidies {totals[1]:,.2f} — totals verified")


if __name__ == "__main__":
    main()
