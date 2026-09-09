# -*- coding: utf-8 -*-
"""Per-community hate-crime figures from the Ministerio del Interior's annual report.

Source: Ministerio del Interior / Oficina Nacional contra los Delitos de Odio,
"Informe sobre la evolucion de los delitos e incidentes de odio en Espana 2024".
Two tables are read:

  * section 2.2 (p. 11) - the rate of recorded offences, administrative
    infractions and other incidents per 100 000 inhabitants, by community;
  * annex 7.1 (p. 42) - hechos conocidos disaggregated by community and by
    motivation, which is where the orientation-and-gender-identity column lives.

What the figures are, precisely, because the map must not overstate them:
these are *hechos conocidos* - facts reported to and recorded by the security
forces - not convictions, and not incidence. A community's rate is shaped by how
readily people there report and by how its police record what is reported, and
the two communities with their own autonomous forces (Policia Foral de Navarra,
Ertzaintza) sit at the top of the table. That is a statement about the record,
not about the place, and the page says so.

The script aborts rather than warning. Every row must reconcile against its own
total and the whole table against the national figure already published in
lib/hate-context.ts, because a silently wrong figure on a public page is worse
than no figure.

Usage: python scripts/extract-hate-territory.py <informe.pdf>
"""

import io
import json
import os
import re
import sys

import pypdf

OUT = os.path.join("data", "hate-territory.json")

# The national total the repo already publishes, verified against a second
# ministry (OBERAXE). The annex must add up to it.
NATIONAL_TOTAL = 1955
NATIONAL_RATE = 4.02
YEAR = 2024
REPORT_URL = (
    "https://www.interior.gob.es/opencms/export/sites/default/.galleries/"
    "galeria-de-prensa/documentos-y-multimedia/balances-e-informes/2024/"
    "INFORME_Evolucion_delitos_de_odio_2024.pdf"
)

# The annex's column order after the leading total, ending with the separate
# administrative-infractions column.
MOTIVATIONS = [
    "antigitanismo",
    "antisemitism",
    "aporophobia",
    "religion",
    "disability",
    "age",
    "illness",
    "sexGender",
    "ideology",
    "islamophobia",
    "sexualOrientationGenderIdentity",
    "racism",
]

# The report's territory names, mapped to INE autonomous-community codes - the
# join key the map's geometry uses. Two of these carry typographical errors in
# the source ("COMUNITAT VALECIANA", "CEIUDAD AUTONOMA DE MELILLA"); they are
# matched as printed rather than corrected, so a future edition that fixes the
# spelling fails loudly here instead of silently dropping a community.
INE = {
    "ANDALUCÍA": "01",
    "ARAGÓN": "02",
    "ASTURIAS (PRINCIPADO DE)": "03",
    "BALEARES (ILLES)": "04",
    "CANARIAS": "05",
    "CANTABRIA": "06",
    "CASTILLA Y LEÓN": "07",
    "CASTILLA - LA MANCHA": "08",
    "CATALUÑA": "09",
    "COMUNITAT VALECIANA": "10",
    "EXTREMADURA": "11",
    "GALICIA": "12",
    "MADRID (COMUNIDAD DE)": "13",
    "MURCIA (REGIÓN DE)": "14",
    "NAVARRA (COMUNIDAD FORAL DE)": "15",
    "PAÍS VASCO": "16",
    "RIOJA (LA)": "17",
    "CIUDAD AUTÓNOMA DE CEUTA": "18",
    "CEIUDAD AUTÓNOMA DE MELILLA": "19",
}

# Rows that are not territories. Their counts belong to the national total but
# have nowhere to go on a map, so they are carried as a named remainder rather
# than dropped.
NON_TERRITORY = ("EN EL EXTRAJNERO", "DESCONOCIDO")

# The rate table names the same places differently again.
RATE_NAMES = {
    "NAVARRA (COMUNIDAD FO- RAL DE)": "15",
    "PAÍS VASCO": "16",
    "CIUDAD AUTÓNOMA DE CEUTA": "18",
    "CIUDAD AUTÓNOMA DE MELILLA": "19",
    "COMUNITAT VALENCIANA": "10",
    "ASTURIAS (PRINCIPADO DE)": "03",
    "BALEARS (ILLES)": "04",
    "RIOJA (LA)": "17",
    "CASTILLA Y LEÓN": "07",
    "MADRID (COMUNIDAD DE)": "13",
    "ARAGÓN": "02",
    "CANTABRIA": "06",
    "CATALUÑA": "09",
    "CANARIAS": "05",
    "MURCIA (REGIÓN DE)": "14",
    "CASTILLA - LA MANCHA": "08",
    "GALICIA": "12",
    "ANDALUCÍA": "01",
    "EXTREMADURA": "11",
}


def die(msg):
    sys.stderr.write("ABORT: %s\n" % msg)
    sys.exit(1)


def pages(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    return [(p.extract_text() or "") for p in reader.pages]


def parse_rates(text):
    """Section 2.2: a territory name then a rate with a comma decimal."""
    # Collapse the hyphenated line breaks the two-column layout introduces, so
    # "NAVARRA (COMUNIDAD FO-\nRAL DE)\n14,00" becomes one matchable run.
    flat = re.sub(r"[ \t]*\n[ \t]*", " ", text)
    found = {}
    for name, code in RATE_NAMES.items():
        m = re.search(re.escape(name) + r"\s+(\d{1,2},\d{2})\b", flat)
        if not m:
            continue
        found[code] = float(m.group(1).replace(",", "."))
    return found


def section(text, start, end):
    """The slice of the report between two annex headings.

    Four annex tables share the same fourteen-column shape - hechos conocidos
    and victimizaciones, each by community and by province, and again for
    detenidos and esclarecidos. Scanning the whole document therefore matched
    every one of them and kept the last, which is a different statistic
    entirely. Slicing to the named section is what makes the row regex
    unambiguous.
    """
    heads = [
        (start, re.compile(r"^" + re.escape(start) + r"\s+Datos de ", re.M)),
        (end, re.compile(r"^" + re.escape(end) + r"\s+Datos de ", re.M)),
    ]
    found = {}
    for label, pat in heads:
        m = pat.search(text)
        if not m:
            die("annex heading %s not found; the report's structure changed" % label)
        found[label] = m.start()
    if found[end] <= found[start]:
        die("annex %s does not precede %s" % (start, end))
    return text[found[start]:found[end]]


def parse_counts(text):
    """Annex 7.1: a territory name then fourteen integers."""
    nums = r"(\d{1,5})" + r"\s+(\d{1,5})" * 13
    rows = {}
    extra = {}
    for line in text.split("\n"):
        line = line.strip()
        for name in list(INE) + list(NON_TERRITORY):
            m = re.match(re.escape(name) + r"\s+" + nums + r"\s*$", line)
            if not m:
                continue
            v = [int(x) for x in m.groups()]
            total, motives, admin = v[0], v[1:13], v[13]
            if name in INE:
                rows[INE[name]] = (name, total, motives, admin)
            else:
                extra[name] = (total, motives, admin)
            break
    return rows, extra


def main():
    if len(sys.argv) != 2:
        die("usage: extract-hate-territory.py <informe.pdf>")
    pdf_path = sys.argv[1]
    if not os.path.exists(pdf_path):
        die("no such file: %s" % pdf_path)

    text = pages(pdf_path)
    whole = "\n".join(text)

    rates = parse_rates(whole)
    rows, extra = parse_counts(section(whole, "7.1", "7.2"))

    # --- guards ---------------------------------------------------------
    if len(rows) != 19:
        die("expected 19 territories in annex 7.1, parsed %d: missing %s"
            % (len(rows), sorted(set(INE.values()) - set(rows))))
    if len(rates) != 19:
        die("expected 19 rates in section 2.2, parsed %d: missing %s"
            % (len(rates), sorted(set(INE.values()) - set(rates))))

    national_rate = re.search(r"ESPAÑA\s+(\d,\d{2})", whole)
    if not national_rate or float(national_rate.group(1).replace(",", ".")) != NATIONAL_RATE:
        die("national rate is not %s; the report's own headline moved" % NATIONAL_RATE)

    # Each row must reconcile against its own printed total.
    for code, (name, total, motives, admin) in sorted(rows.items()):
        if sum(motives) + admin != total:
            die("%s (%s): motivations %d + admin %d != printed total %d"
                % (name, code, sum(motives), admin, total))

    # The whole table must reconcile against the national figure.
    summed = sum(r[1] for r in rows.values()) + sum(v[0] for v in extra.values())
    if summed != NATIONAL_TOTAL:
        die("territories sum to %d, national total is %d" % (summed, NATIONAL_TOTAL))

    # The two motivation columns the site publishes must each reconcile against
    # the national figure for that motivation, counting the non-territory rows.
    #
    # This is the guard that proves the columns are aligned. Fourteen integers on
    # one line are positional, and a single-column shift would leave every row
    # summing to its own total exactly as before while attributing racism figures
    # to orientation. Checking two named columns against two independently
    # published national figures catches that; checking row totals cannot.
    col = {name: i for i, name in enumerate(MOTIVATIONS)}
    for key, national in (("sexualOrientationGenderIdentity", 528), ("racism", 804)):
        got = sum(r[2][col[key]] for r in rows.values()) + sum(
            v[1][col[key]] for v in extra.values()
        )
        if got != national:
            die("%s sums to %d across every row, national figure is %d" % (key, got, national))

    # --- output ---------------------------------------------------------
    out = {
        "source": {
            "body": "Ministerio del Interior · Oficina Nacional contra los Delitos de Odio",
            "report": "Informe sobre la evolución de los delitos e incidentes de odio en España %d" % YEAR,
            "url": REPORT_URL,
            "tables": ["2.2", "7.1"],
        },
        "year": YEAR,
        "national": {"total": NATIONAL_TOTAL, "ratePer100k": NATIONAL_RATE},
        "unlocated": {
            name: {"total": v[0]} for name, v in sorted(extra.items()) if v[0] > 0
        },
        "territories": {},
    }
    for code, (name, total, motives, admin) in sorted(rows.items()):
        by = dict(zip(MOTIVATIONS, motives))
        out["territories"][code] = {
            "reportName": name,
            "total": total,
            "ratePer100k": rates[code],
            "administrative": admin,
            "sexualOrientationGenderIdentity": by["sexualOrientationGenderIdentity"],
            "racism": by["racism"],
            "ideology": by["ideology"],
        }

    io.open(OUT, "w", encoding="utf-8", newline="\n").write(
        json.dumps(out, ensure_ascii=False, indent=2) + "\n"
    )
    print("%d territories -> %s" % (len(rows), OUT))
    print("reconciles: %d = national total %d (of which %s unlocated)"
          % (summed, NATIONAL_TOTAL,
             ", ".join("%s %d" % (k, v["total"]) for k, v in out["unlocated"].items()) or "none"))
    hi = max(rows, key=lambda c: rates[c])
    print("highest rate: %s %s per 100 000" % (rows[hi][0], rates[hi]))


if __name__ == "__main__":
    main()
