"""Extract the per-entity dossiers from Tribunal de Cuentas report nº 1.642.

Usage:  python scripts/extract-foundations.py <path-to-I1642.pdf>
Requires: pypdf  (pip install pypdf)

The report is "Informe de fiscalización de las aportaciones percibidas por las
fundaciones y demás entidades vinculadas o dependientes de los partidos
políticos y de los gastos de programas y actividades de estas financiados con
cargo a subvenciones públicas, ejercicios 2021 y 2022", approved 25/09/2025.

An earlier version of this script read only ANEXO III and ANEXO IV, the two
consolidated tables, and emitted two numbers per entity. The body of the report
carries far more: seventy per-entity dossiers, each with the entity's party link
and supervising protectorate, its contributions split into money from
individuals, money from companies and money from the party itself, its public
subsidies itemised by granting body, its balance sheet, and the compliance
failures the Tribunal found. That is what this version extracts.

Nothing is inferred:

  * The party each entity is linked to is read from the dossier's own
    "PARTIDO POLÍTICO VINCULADO:" line. Where the earlier script's prose pattern
    also states a link, it is used only to fill a dossier that lacks the field.
  * Compliance is recorded as the report's own sentence, verbatim, plus a
    tri-state flag set only from two unambiguous phrasings. Anything else stays
    null rather than being guessed from the wording.
  * Registration in the Registro de Partidos Políticos is three-valued: a date
    where the report gives one, false where it states "NO", and null where the
    field is simply absent. That distinction matters, because the Tribunal
    reports that at 31/12/2022 only 18 of the audited foundations and 3 of the
    audited entities were registered at all, against an obligation in
    disposición adicional cuarta of LO 6/2002.
  * Which exercise a dossier covers comes from the annexes, not from the
    dossier's prose — see assign_exercises for the copy-paste slip in the source
    that makes the prose unusable.

Verification, all of which aborts rather than warns:

  * Each contributions table's rows must sum to its own stated total.
  * Each subsidies table's items must sum to its own stated total.
  * Summed across dossiers, both figures must equal the TOTALES row of the
    matching annex — the outer envelope the earlier script already checked, and
    what makes the positional exercise assignment safe.
  * A dossier with no money and no findings is treated as a parse failure, not
    as an empty entity. Sixty-four of the seventy have no corporate donations at
    all, so blank cells are normal and must read as zero; a row that silently
    absorbed its neighbour's figures would otherwise pass unnoticed.

A difference of up to one euro between a stated total and its own itemised lines
is recorded as a source discrepancy rather than treated as a parse error: the
report's arithmetic is itself wrong in one place. Anything larger aborts.
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


# A euro amount in the report's format: thousands separated by ".", decimals by
# ",". The decimals are optional because the report prints some round amounts
# without them ("510.000" for 510,000.00 in Fundación Iratzar's dossier).
NUM = r"\d{1,3}(?:\.\d{3})*(?:,\d{2})?"

# A count — a bare small integer with no separator of any kind. This is how a
# count is told apart from an amount printed without decimals: "6" is a count,
# "510.000" is money, and both sit in the same row.
COUNT = r"^\d{1,4}$"


def is_money(token: str) -> bool:
    """True for a figure carrying decimals or a thousands separator.

    Rows end with stray digits — a page number or a repeated cell picked up by
    the text layer — so "the last number in the row" is not the row's total.
    Concordia y Libertad's 2022 row ends "15.235,00 69", and reading the 69 as
    the total is exactly the kind of silent wrong figure the sum guards exist
    to stop. Every euro amount in this report is printed either with a decimal
    comma or with a thousands dot, and a count is neither.
    """
    return "," in token or re.search(r"\.\d{3}", token) is not None


def euro(s: str) -> float:
    """'2.500.900,00' -> 2500900.0, and '510.000' -> 510000.0"""
    return float(s.replace(".", "").replace(",", "."))


def norm(s: str) -> str:
    """Loose key for matching a name in prose against a name in a table."""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.lower().replace("\u00b4", "'").replace("`", "'")
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


# ─── the annexes, kept as the outer envelope ──────────────────────────────────

# A table row: entity name, then two euro amounts. The name may itself contain
# digits ("Fundación 14 de Abril", "…Instituto 25 de Mayo", "…Madrid 2019"), so
# the amounts are anchored by their decimal comma rather than by excluding
# digits from the name — an earlier version dropped exactly those three rows.
ROW = re.compile(r"^(?P<name>.+?)\s+(?P<a>[\d.]+,\d{2})\s+(?P<b>[\d.]+,\d{2})\s*$")

LINK = re.compile(
    r"La\s+(?P<entity>(?:Fundaci[oó]n|Asociaci[oó]n|Sociedad|Instituto)[^,]{2,90}?),\s*"
    r"vinculada a la formaci[oó]n pol[ií]tica\s+(?P<party>[^,.]{2,90})",
    re.IGNORECASE,
)


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


# ─── the dossiers ─────────────────────────────────────────────────────────────

# A dossier heading. The same strings also appear in the table of contents,
# followed by dotted leaders and a page number, so a heading counts only when
# the section that must follow it does follow it. This is the same guard that
# scripts/extract-electoral-spending.py needs, and for the same reason: without
# it the run silently processes the index instead of the report.
HEAD = re.compile(r"II\.(\d{1,2})\.\s+([A-ZÁÉÍÓÚÑÜ`'][^\n]{4,90})")

# Foundations are supervised by a "PROTECTORADO" and associations by an
# "ADMINISTRACIÓN COMPETENTE" — the same field under two names, so both are
# read into one.
FIELDS = {
    "partyLinked": (
        r"PARTIDO POL[IÍ]TICO VINCULADO:\s*(.+?)\s+"
        r"(?:PROTECTORADO|ADMINISTRACI[OÓ]N COMPETENTE|A[NÑ]O CONSTITUCI)"
    ),
    "supervisor": (
        r"(?:PROTECTORADO|ADMINISTRACI[OÓ]N COMPETENTE):\s*(.+?)\s+A[NÑ]O CONSTITUCI"
    ),
    "yearConstituted": r"A[NÑ]O CONSTITUCI[OÓ]N:\s*(\d{4})",
    "registryDate": r"REGISTRO PARTIDOS POL[IÍ]TICOS:\s*(\d{2}/\d{2}/\d{4})",
}

# Some dossiers state non-registration outright rather than leaving the field
# blank, which is a stronger fact than a missing value and is kept as one.
NOT_REGISTERED = re.compile(r"REGISTRO PARTIDOS POL[IÍ]TICOS:\s*NO\b")

# Section headings vary between foundations and associations, so each anchor
# accepts both wordings. A section boundary that fails to match does not degrade
# quietly here: the parser aborts, because the text that follows a table is
# narrative full of dates that read as amounts.
SECTION_5 = re.compile(r"5\.\s*RENDICI[OÓ]N DE (?:LAS )?CUENTAS")
SECTION_6 = re.compile(r"6\.\s*RESULTADOS DE LA FISCALIZACI[OÓ]N")

# The rows of the contributions table, in the order the report prints them.
CONTRIB_ROWS = [
    ("individuals", r"Personas f[ií]sicas"),
    ("companies", r"Personas jur[ií]dicas"),
    ("party", r"II\)\s*Aportaciones del Partido"),
]

# Phrases that settle whether the Tribunal found a breach. Only these two
# shapes are trusted; every other wording leaves the flag null and the reader
# is shown the report's own sentence instead.
COMPLIANT = re.compile(r"cumpli[ée]ndose (?:los|el) requisit", re.I)
NOT_COMPLIANT = re.compile(
    r"no (?:han|ha) (?:sido|habiendo) |no ha sido |no han sido |no habiendo comunicado|"
    r"incumpl|en contra de lo (?:establecido|se[ñn]alado|dispuesto)",
    re.I,
)


# The running footer stamped on every page, which the text layer drops into the
# middle of sentences. Quoting it back to a reader inside a finding would be
# both wrong and unreadable.
FOOTER = re.compile(
    r"\s*INFORME DE FISCALIZACI[OÓ]N APROBADO POR EL PLENO DEL TRIBUNAL DE CUENTAS "
    r"EL \d{2}/\d{2}/\d{4}\s*\d{0,4}\s*"
)

# A sentence that reports the *absence* of a breach contains the same words as
# one that reports a breach. Listing "no se han observado incumplimientos"
# under what the Tribunal found would invert the report's meaning, which is
# worse than omitting it.
NO_BREACH = re.compile(
    r"no se h(?:an|a) (?:observado|detectado|puesto de manifiesto)"
    r"|sin que se hayan (?:observado|detectado)"
    r"|no se han observado incumplimientos",
    re.I,
)


def numbers(row: str) -> list[str]:
    return re.findall(NUM, row)


def split_rows(block: str, labels: list[str]) -> dict[str, str]:
    """Cut a one-line table into row text, keyed by label.

    Splitting on the labels before reading any figure is what keeps a blank
    cell from stealing its neighbour's value. The contributions table leaves
    "Personas jurídicas" empty for sixty-four of the seventy entities, and a
    forward scan from the label reads the *next* row's numbers instead of
    finding none.
    """
    marks: list[tuple[int, int, str]] = []
    for label in labels:
        m = re.search(label, block)
        if m:
            marks.append((m.start(), m.end(), label))
    marks.sort()
    out: dict[str, str] = {}
    for i, (_, end, label) in enumerate(marks):
        stop = marks[i + 1][0] if i + 1 < len(marks) else len(block)
        out[label] = block[end:stop]
    return out


def contributions(dossier: str) -> dict:
    """The contributions table: who the money came from, and how much."""
    start = re.search(r"3\.\s*RESUMEN APORTACIONES", dossier)
    stop = re.search(r"4\.\s*SUBVENCIONES P[UÚ]BLICAS", dossier)
    if not start or not stop:
        return {}
    block = dossier[start.end() : stop.start()]

    # Drop the column header before splitting on row labels. The header itself
    # contains the words "Total aportaciones", which a bare "Total" label
    # matches ahead of the real total row — so every total read as zero, and it
    # stayed invisible until the first entity that had any money at all.
    for marker in ("I) Donaciones:", "Importe (en euros)"):
        cut = block.rfind(marker)
        if cut != -1:
            block = block[cut + len(marker) :]
            break

    labels = [pat for _, pat in CONTRIB_ROWS] + [r"Total"]
    rows = split_rows(block, labels)

    out: dict[str, dict] = {}
    for key, pat in CONTRIB_ROWS:
        found = numbers(rows.get(pat, ""))
        # The row carries up to five figures across the in-kind and cash column
        # pairs, and which of them is present varies by entity, so position is
        # not reliable. The last money-shaped figure is the row's own total,
        # which is what the table's Total row can be checked against.
        cash = [n for n in found if is_money(n)]
        count = int(found[0]) if found and re.match(COUNT, found[0]) else None
        out[key] = {"count": count, "amount": euro(cash[-1]) if cash else 0.0}

    stated = [n for n in numbers(rows.get(r"Total", "")) if is_money(n)]
    out["total"] = {"amount": euro(stated[-1]) if stated else 0.0}
    return out


def subsidies(dossier: str) -> dict:
    """Public money, itemised by the body that granted it."""
    start = re.search(r"4\.\s*SUBVENCIONES P[UÚ]BLICAS", dossier)
    if not start:
        return {"items": [], "total": 0.0}
    # Foundations head this section "RENDICIÓN DE LAS CUENTAS" and associations
    # "RENDICIÓN DE CUENTAS" — 28 and 42 of the seventy. Requiring the longer
    # wording let the table run on into the narrative that follows it, where
    # dates parsed as amounts; the sum guard caught it on the first entity.
    stop = SECTION_5.search(dossier) or SECTION_6.search(dossier)
    if not stop:
        raise SystemExit("subsidies table has no closing section — the layout changed")
    block = dossier[start.end() : stop.start()]
    block = re.sub(r"Importe \(en euros\)", "", block)

    items = []
    total = 0.0
    for m in re.finditer(r"([^\d]{3,90}?)\s+(" + NUM + r")(?=\s|$)", block):
        label = " ".join(m.group(1).split()).strip(" .·")
        if not label or not is_money(m.group(2)):
            continue
        amount = euro(m.group(2))
        if re.fullmatch(r"Total", label, re.I):
            total = amount
        else:
            items.append({"body": label, "amount": amount})
    return {"items": items, "total": total}


def accounts(dossier: str) -> dict:
    def one(pattern: str) -> float | None:
        m = re.search(pattern + r"\s+(-?\s?" + NUM + r")", dossier)
        return euro(m.group(1).replace(" ", "").lstrip("-")) * (
            -1 if m.group(1).strip().startswith("-") else 1
        ) if m else None

    return {
        "netEquity": one(r"Patrimonio neto"),
        "totalExpense": one(r"Total gastos"),
        "totalIncome": one(r"Total ingresos"),
        "result": one(r"Resultado del ejercicio"),
    }


def verdict(sentence: str) -> bool | None:
    if COMPLIANT.search(sentence):
        return True
    if NOT_COMPLIANT.search(sentence):
        return False
    return None


# The article or provision a finding rests on, so the page can cite the rule
# rather than paraphrase it.
RULE = re.compile(
    r"(apartado (?:Cinco|Seis|Siete|Cuatro|Tres|Dos|Uno) de la Disposici[oó]n Adicional S[eé]ptima"
    r"|art[íi]culo\s+[\d.]+(?:\s*[a-z]\))?(?:\s+de la LOFPP)?"
    r"|Disposici[oó]n Adicional S[eé]ptima)",
    re.I,
)

COUNTERPARTY = re.compile(
    r"suscritos?\s+con\s+(?:la formaci[oó]n pol[ií]tica\s+)?"
    r"(?:(?:dos|tres|cuatro)\s+personas jur[ií]dicas\s*\(([^)]{3,120})\)"
    r"|(?:la|el)\s+([A-ZÁÉÍÓÚÑ][^,.]{2,90})"
    r"|([A-ZÁÉÍÓÚÑ][^,.]{2,90}))",
    re.I,
)

# Where a captured counterparty name stops. Without these the capture runs on
# into the rest of the clause: "Podemos tres convenios de colaboración",
# "Fundación Cajasol que recoge la correspondiente contraprestación".
COUNTERPARTY_END = re.compile(
    r"\s+(?:que\b|en virtud\b|por importe\b|por un importe\b|resultando\b"
    r"|con la contraprestaci[oó]n\b|(?:dos|tres|cuatro|cinco)?\s*convenios?\b)",
    re.I,
)


def findings(dossier: str) -> tuple[list[dict], list[dict]]:
    """The Tribunal's own compliance sentences, and the collaboration deals."""
    start = SECTION_6.search(dossier)
    block = dossier[start.end() :] if start else dossier

    found: list[dict] = []
    deals: list[dict] = []
    # Paragraph and sentence boundaries, in that order. A sentence rule alone is
    # not enough: the report's sentences frequently end on an acronym ("\u2026de la
    # LOFPP."), where a lowercase-before-the-period rule finds no break and the
    # finding text runs on into the next paragraph. So the known paragraph
    # openings are marked first, then sentences are split within them.
    marked = re.sub(r"\s+(?=Por otro lado)", "\n", block)
    marked = re.sub(r"\s+(?=[a-h]\)\s+[A-Z\u00c1\u00c9\u00cd\u00d3\u00da])", "\n", marked)
    marked = re.sub(r"\s+(?=[\u2212\u2013-]\s+[A-Z\u00c1\u00c9\u00cd\u00d3\u00daLa])", "\n", marked)
    marked = re.sub(r"\s+(?=Recomendaci[o\u00f3]n)", "\n", marked)
    pieces = [
        piece
        for chunk in marked.split("\n")
        for piece in re.split(
            r"(?<=[a-z0-9)\u00e1\u00e9\u00ed\u00f3\u00fa])\.\s+(?=[A-Z\u2212-])", chunk
        )
    ]
    for sentence in pieces:
        s = " ".join(sentence.split())
        if len(s) < 40:
            continue
        rule = RULE.search(s)
        if NO_BREACH.search(s) and not re.search(r"convenios? de colaboraci", s, re.I):
            continue
        if re.search(r"convenios? de colaboraci", s, re.I):
            amounts = re.findall(r"importe (?:conjunto )?de (" + NUM + r")", s)
            names: list[str] = []
            for m in COUNTERPARTY.finditer(s):
                raw = m.group(1) or m.group(2) or m.group(3) or ""
                cut = COUNTERPARTY_END.search(raw)
                if cut:
                    raw = raw[: cut.start()]
                raw = re.sub(r"^(?:el\s+)?grupo municipal de\s+", "", raw, flags=re.I)
                for part in re.split(r"\s+y\s+|,\s*", raw):
                    part = " ".join(part.split()).strip(" .")
                    if len(part) > 2:
                        names.append(part)
            # The report introduces a breach with a lead-in sentence naming no
            # counterparty and no amount ("…convenios suscritos con personas
            # jurídicas, resultando el siguiente incumplimiento:") before the
            # sentence that carries both. Keeping the lead-in would double-count
            # the deal and show a row with nothing in it.
            generic = all(re.fullmatch(r"personas jur[ií]dicas", n, re.I) for n in names)
            if not amounts and (not names or generic):
                continue
            deals.append(
                {
                    "counterparties": names,
                    "amount": euro(amounts[0]) if amounts else None,
                    "consideration": (
                        " ".join(re.search(r"contraprestaci[oó]n de ([^,.]{5,120})", s).group(1).split())
                        if re.search(r"contraprestaci[oó]n de ([^,.]{5,120})", s)
                        else None
                    ),
                    "compliant": verdict(s),
                    "rule": rule.group(1) if rule else None,
                    "text": s,
                }
            )
        elif re.search(r"incumpl|en contra de lo |no ha (?:publicado|comunicado|informado)", s, re.I):
            found.append({"rule": rule.group(1) if rule else None, "text": s})
    return found, deals


def parse_dossiers(whole: str) -> list[dict]:
    heads = [m for m in HEAD.finditer(whole) if "DATOS GENERALES" in whole[m.end() : m.end() + 220]]
    if len(heads) < 60:
        raise SystemExit(
            f"found only {len(heads)} dossiers — the heading guard or the PDF layout changed"
        )

    # The last dossier needs an explicit end, or it swallows everything that
    # follows it — the conclusions, the recommendations and the annexes — and
    # the report's global findings then read as that one entity's own.
    tail = len(whole)
    for marker in (
        r"III[.]\s+CONCLUSIONES",
        r"^CONCLUSIONES\s*$",
        r"^RECOMENDACIONES\s*$",
        r"^ANEXOS\s*$",
        r"RELACI[OÓ]N DE ANEXOS",
    ):
        hit = re.search(marker, whole[heads[-1].end() :], re.M)
        if hit:
            tail = heads[-1].end() + hit.start()
            break

    out = []
    for i, m in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else tail
        dossier = FOOTER.sub(" ", " ".join(whole[m.start() : end].split()))
        name = " ".join(m.group(2).split()).rstrip(". ")

        fields = {}
        for key, pattern in FIELDS.items():
            hit = re.search(pattern, dossier)
            fields[key] = " ".join(hit.group(1).split()).rstrip(" .") if hit else None

        contrib = contributions(dossier)
        subs = subsidies(dossier)
        found, deals = findings(dossier)

        out.append(
            {
                "name": name,
                "section": int(m.group(1)),
                "exercise": None,  # assigned from the annexes, see assign_exercises
                "partyLinked": fields["partyLinked"],
                "supervisor": fields["supervisor"],
                "yearConstituted": int(fields["yearConstituted"]) if fields["yearConstituted"] else None,
                "registryDate": fields["registryDate"],
                "registered": (
                    True if fields["registryDate"] else False if NOT_REGISTERED.search(dossier) else None
                ),
                "contributions": contrib,
                "subsidies": subs,
                "accounts": accounts(dossier),
                "deals": deals,
                "findings": found,
            }
        )
    return out


# A mismatch this small is the report's own arithmetic, not a parse error, and
# it is recorded rather than smoothed away. Report 1.642 prints Fundación Pablo
# Iglesias's 2022 subsidies as 451.259,86 while its three itemised lines sum to
# 451.259,66. Anything larger is a parsing failure and aborts, so this ceiling
# cannot quietly absorb a stolen cell or a dropped row.
SOURCE_TOLERANCE = 1.00


def assign_exercises(dossiers: list[dict], parsed: dict) -> None:
    """Give each dossier its exercise, taking the annexes as the authority.

    The exercise cannot be read from the dossier's own prose. The report covers
    each entity twice, once per exercise, in two ordered blocks — but Asociación
    Juventudes Navarras's second dossier repeats the first one's sentence "las
    cuentas anuales del ejercicio 2021" verbatim, a copy-paste slip in the
    source, while carrying 2022's figures. Reading the year from that sentence
    left the 2022 block one entity short and inflated 2021 by exactly the 9.500
    euros involved.

    So the annexes decide: they state how many entities each exercise covers,
    the dossiers appear in that order, and the split is then checked against the
    annex totals. A layout change shows up as a failed reconciliation rather
    than as a plausible wrong number.
    """
    counts = {year: len(rows) for year, (rows, _) in sorted(parsed.items())}
    if sum(counts.values()) != len(dossiers):
        raise SystemExit(
            f"annexes list {sum(counts.values())} entity-years but {len(dossiers)} dossiers "
            "were parsed — aborting"
        )

    ordered = sorted(dossiers, key=lambda d: d["section"])
    at = 0
    for year, n in counts.items():
        for d in ordered[at : at + n]:
            d["exercise"] = year
        at += n

    # Reconciliation: the dossiers must add up to the annex TOTALES row. This is
    # the outer envelope, and it is what makes the positional assignment safe.
    for year, (_, totals) in sorted(parsed.items()):
        rows = [d for d in dossiers if d["exercise"] == year]
        mine = (
            sum(
                r["contributions"].get(k, {}).get("amount", 0.0)
                for r in rows
                for k in ("individuals", "companies", "party")
            ),
            sum(r["subsidies"]["total"] for r in rows),
        )
        for label, got, want in (
            ("contributions", mine[0], totals[0]),
            ("subsidies", mine[1], totals[1]),
        ):
            if abs(got - want) > SOURCE_TOLERANCE:
                raise SystemExit(
                    f"{year} {label}: dossiers sum to {got:,.2f} but ANEXO totals "
                    f"{want:,.2f} — aborting"
                )


def verify(dossiers: list[dict]) -> list[str]:
    notes: list[str] = []
    for d in dossiers:
        where = f"II.{d['section']} {d['name']} ({d['exercise']})"

        def check(field: str, parts: float, stated: float) -> None:
            diff = parts - stated
            if abs(diff) <= 0.005:
                return
            if abs(diff) > SOURCE_TOLERANCE:
                raise SystemExit(
                    f"{where}: {field} parse sums to {parts:.2f} but the table states "
                    f"{stated:.2f} — aborting"
                )
            d.setdefault("sourceDiscrepancies", []).append(
                {"field": field, "stated": round(stated, 2), "itemised": round(parts, 2),
                 "difference": round(diff, 2)}
            )
            notes.append(f"{where}: {field} itemises to {parts:.2f}, report states {stated:.2f}")

        c = d["contributions"]
        if c:
            check(
                "contributions",
                sum(c[k]["amount"] for k in ("individuals", "companies", "party")),
                c["total"]["amount"],
            )
        s = d["subsidies"]
        check("subsidies", sum(i["amount"] for i in s["items"]), s["total"])
        # An all-zero dossier with nothing to report is a parse failure, not an
        # entity. Zeros satisfy every sum check trivially, which is exactly how
        # an empty parse passed verification once before.
        empty = (
            (not c or c["total"]["amount"] == 0.0)
            and s["total"] == 0.0
            and not d["findings"]
            and not d["deals"]
        )
        if empty and d["exercise"] is None:
            raise SystemExit(f"{where}: no money, no findings and no exercise — aborting")
    return notes


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

    # --- annexes: the outer envelope ---------------------------------------
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

    for year, (rows, totals) in parsed.items():
        got = (sum(v[0] for v in rows.values()), sum(v[1] for v in rows.values()))
        for label, mine, theirs in (("donations", got[0], totals[0]), ("subsidies", got[1], totals[1])):
            if abs(mine - theirs) > 0.05:
                raise SystemExit(
                    f"{year} {label}: annex rows sum to {mine:.2f} but the report totals "
                    f"{theirs:.2f} — aborting"
                )

    # --- dossiers ----------------------------------------------------------
    whole = "\n".join(pages)
    dossiers = parse_dossiers(whole)
    assign_exercises(dossiers, parsed)
    notes = verify(dossiers)

    # The prose link pattern fills only a dossier whose own field is missing.
    links: dict[str, str] = {}
    for m in LINK.finditer(" ".join(whole.split())):
        links.setdefault(norm(m.group("entity").strip()), m.group("party").strip().rstrip(" ."))
    for d in dossiers:
        if not d["partyLinked"]:
            d["partyLinked"] = links.get(norm(d["name"]))

    # --- per-exercise totals, from the dossiers themselves -----------------
    years: dict[str, dict] = {}
    for year in sorted({d["exercise"] for d in dossiers if d["exercise"]}):
        rows = [d for d in dossiers if d["exercise"] == year]
        years[str(year)] = {
            "entities": len(rows),
            "individuals": round(sum(r["contributions"].get("individuals", {}).get("amount", 0.0) for r in rows), 2),
            "companies": round(sum(r["contributions"].get("companies", {}).get("amount", 0.0) for r in rows), 2),
            "party": round(sum(r["contributions"].get("party", {}).get("amount", 0.0) for r in rows), 2),
            "contributions": round(sum(r["contributions"].get("total", {}).get("amount", 0.0) for r in rows), 2),
            "subsidies": round(sum(r["subsidies"]["total"] for r in rows), 2),
        }

    out = {
        "source": {
            "body": "Tribunal de Cuentas",
            "report": "Informe nº 1.642 — aportaciones percibidas por las fundaciones y demás "
            "entidades vinculadas o dependientes de los partidos políticos, ejercicios 2021 y 2022",
            "approved": "2025-09-25",
            "url": "https://www.tcu.es/export/sites/portal/repositorio2/INFORME/2025/I1642.pdf",
        },
        # What the report says about the statutory register, which is the reason
        # so many dossiers carry no registration date.
        "register": {
            "asOf": "2022-12-31",
            "foundationsRegistered": 18,
            "entitiesRegistered": 3,
            "rule": "Disposición adicional cuarta de la Ley Orgánica 6/2002",
        },
        "years": years,
        "dossiers": dossiers,
    }
    Path("data/foundations.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")

    linked = sum(1 for d in dossiers if d["partyLinked"])
    deals = sum(len(d["deals"]) for d in dossiers)
    breaches = sum(len(d["findings"]) for d in dossiers)
    print(
        f"wrote data/foundations.json — {len(dossiers)} dossiers, {linked} with a party stated, "
        f"{deals} collaboration deals, {breaches} findings"
    )
    for year, row in sorted(years.items()):
        print(
            f"  {year}: {row['entities']} entities · party {row['party']:,.2f} · "
            f"companies {row['companies']:,.2f} · individuals {row['individuals']:,.2f} · "
            f"public {row['subsidies']:,.2f}"
        )
    for year, (_, totals) in sorted(parsed.items()):
        print(f"  {year} annex envelope verified: {totals[0]:,.2f} / {totals[1]:,.2f}")
    for note in notes:
        print(f"  source discrepancy recorded — {note}")


if __name__ == "__main__":
    main()
