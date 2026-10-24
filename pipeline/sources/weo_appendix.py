"""Read the "Latest Actual Annual Data" years from a WEO Database Appendix PDF.

The IMF publishes, for each edition and each economy, the last year for which the WEO holds
actual data (not IMF staff estimates) in four areas: national accounts, consumer prices,
government finance and balance of payments. Values after that year are staff estimates, and
values from the edition's first projection year onward are projections.

    python3 -m pipeline.sources.weo_appendix APPENDIX.pdf --edition 2026-10 --projection-start 2026

writes pipeline/config/editions/weo-2026-10.json. A new edition's file is reviewed by a person
before the pipeline uses it (the pipeline holds new-edition WEO data until the file exists).

Needs `pdftotext` (poppler-utils). Fiscal-year entries such as 2024/25 are recorded as the
earlier calendar year, so the pipeline never labels a value "observed" on a guess.
"""
import json, os, re, subprocess, sys

YEAR = re.compile(r"^(\d{4})(?:/(\d{2}))?$")
ROW = re.compile(r"^\s{0,3}([A-Z]{3})\s{2,}\S")
CODE_ONLY = re.compile(r"^\s{0,3}([A-Z]{3})\s*$")      # a row whose code wrapped onto the next line (Sudan, Tunisia)


def _cols(header, label="Latest Actual"):
    return [m.start() for m in re.finditer(label, header)]


def _token_at(line, col):
    """The whitespace-delimited token that overlaps character column `col` (within 6 chars)."""
    best = None
    for m in re.finditer(r"\S+", line):
        if m.start() - 6 <= col <= m.end() + 1:
            if best is None or abs(m.start() - col) < abs(best.start() - col): best = m
    return best.group(0) if best else None


def _year(tok):
    if not tok: return None
    m = YEAR.match(tok)
    return int(m.group(1)) if m else None


def parse(text):
    """Return ({iso3: {na, cpi, gfs, bop}}, problems)."""
    out, problems = {}, []
    table, cols, prev = None, None, None
    for line in text.splitlines():
        w = CODE_ONLY.match(line)
        if w and cols and prev:   # attach the wrapped code to the previous line's data
            line = "  " + w.group(1) + prev[5:] if prev[:5].strip() == "" else None
            if line is None: continue
        else:
            prev = line
        if "Latest Actual" in line:
            c = _cols(line)
            # national accounts + prices table, or government finance + balance of payments table
            table = "na_cpi" if ("National" in line or "Weighted" in line) else "gfs_bop"
            cols = c if len(c) == 2 else None
            if cols is None: problems.append(f"header with {len(c)} 'Latest Actual' columns: {line.strip()[:80]}")
            continue
        if not cols: continue
        m = ROW.match(line)
        if not m: continue
        iso = m.group(1)
        a, b = (_year(_token_at(line, cols[0])), _year(_token_at(line, cols[1])))
        keys = ("na", "cpi") if table == "na_cpi" else ("gfs", "bop")
        rec = out.setdefault(iso, {})
        for k, v, col in zip(keys, (a, b), cols):
            tok = _token_at(line, col)
            if v is None and tok not in (None, "…", "..."):
                problems.append(f"{iso} {k}: unreadable '{tok}'")
            rec[k] = v
    return out, problems


def main(argv):
    pdf = argv[0]
    ed = argv[argv.index("--edition") + 1]; ps = int(argv[argv.index("--projection-start") + 1])
    text = subprocess.run(["pdftotext", "-layout", pdf, "-"], check=True, capture_output=True, text=True).stdout
    laad, problems = parse(text)
    full = {k: v for k, v in laad.items() if len(v) == 4}
    doc = {"source": "IMF, World Economic Outlook Database Appendix, " + ed,
           "edition": ed, "projection_start": ps,
           "rule": "year <= latest actual: observed; after it and before projection_start: IMF staff estimate; from projection_start: projection",
           "fiscal_years": "a fiscal year such as 2024/25 is recorded as 2024 (conservative)",
           "economies": len(full), "problems": problems + [f"{k}: only {sorted(v)} found" for k, v in laad.items() if len(v) != 4],
           "latest_actual": dict(sorted(full.items()))}
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    p = os.path.join(root, "pipeline", "config", "editions", f"weo-{ed}.json")
    json.dump(doc, open(p, "w"), indent=1)
    print(f"{p}: {len(full)} economies, {len(doc['problems'])} problems")
    return doc


if __name__ == "__main__":
    main(sys.argv[1:])
