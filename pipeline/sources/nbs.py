"""National Bureau of Statistics, Nigeria: headline figures from the dashboard on its homepage.

NBS publishes no data API, and its e-library stopped listing new reports in December 2024. The homepage
(https://nigerianstat.gov.ng/) shows the latest official figures with their periods, verified 24 Oct 2026:
  - CPI widget, titled "CPI (Sept-2026)": headline (All-Items), Core and Food inflation, year on year, with the
    base period ("Base Period 2024 = 100") and recent monthly history as comma-separated numbers
  - fuel price widgets titled "avg price/litre. PMS (May-2026)" and similar: average retail price in naira
  - a sentence: "Gross Domestic Product (GDP) grew by 3.89% (year-on-year) in real terms in the first quarter of 2026"
The page layout can change without notice, so anything not found exactly is a failure (last good data kept),
and a malformed history is dropped rather than repaired: the page showed "20.31.19.57" for two food months.
"""
import re, html as H
from ..http import fetch_text, FetchError

MON = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}
QWORD = {"first": 1, "second": 2, "third": 3, "fourth": 4}
FUEL = {"PMS": ("Premium Motor Spirit (petrol)", "naira per litre"), "AGO": ("Automotive Gas Oil (diesel)", "naira per litre"),
        "NHK": ("National Household Kerosene", "naira per litre"), "LPG": ("Liquefied Petroleum Gas, 5 kg refill", "naira per 5 kg")}


def month_key(label):
    m = re.match(r"([A-Za-z]+)[-\s]+(\d{4})$", label.strip())
    if not m or m.group(1)[:3].lower() not in MON: return None
    return f"{m.group(2)}-{MON[m.group(1)[:3].lower()]:02d}"


def back_months(key, n):
    y, m = map(int, key.split("-")); out = []
    for _ in range(n):
        out.append(f"{y}-{m:02d}"); m -= 1
        if m == 0: y, m = y - 1, 12
    return out[::-1]


def series(text):
    """Comma-separated numbers, or None if any entry is not a single number."""
    parts = [p.strip() for p in text.split(",")]
    if not all(re.fullmatch(r"-?\d+(\.\d+)?", p) for p in parts): return None
    return [float(p) for p in parts]


def parse(page):
    out, notes = {}, []
    # CPI widget
    m = re.search(r'data-original-title="CPI \(([^)]+)\)"(.*?)<!-- End CPI', page, re.S)
    if not m: raise FetchError("NBS homepage: CPI widget not found (layout changed?)")
    period = month_key(m.group(1)); body = m.group(2)
    if not period: raise FetchError(f"NBS homepage: CPI period {m.group(1)!r} not understood")
    base = re.search(r"Base Period (\d{4})\s*=\s*100", body)
    subs = re.findall(r'<span class="counter">\s*([-\d.]+)\s*</span>.*?<p>\s*([A-Za-z-]+)\s*</p>\s*</div>\s*<div class="past-statistic-graph">\s*<div class="stats-[a-z0-9-]+">([^<]*)</div>', body, re.S)
    if {s[1] for s in subs} != {"Core", "All-Items", "Food"}: raise FetchError(f"NBS homepage: CPI parts found {[s[1] for s in subs]}, expected Core, All-Items and Food")
    for val, name, hist in subs:
        v = float(val); vals = {period: v}; hs = series(hist)
        own = []
        if hs is None: own.append(f"{name} inflation: the monthly history on the NBS page is malformed ({hist.strip()[:70]}); only the latest month was used")
        elif abs(hs[-1] - v) > 0.005: own.append(f"{name} inflation: the history on the page ends at {hs[-1]}, not the headline {v}; only the latest month was used")
        else: vals = dict(zip(back_months(period, len(hs)), hs))
        notes += own
        out[f"cpi:{name}"] = {"values": vals, "edition": f"CPI {m.group(1)}", "base": base.group(1) if base else None, "notes": own}
    # fuel prices
    for fm in re.finditer(r'data-original-title="avg price(?:/litre)?\.\s*([A-Z]+)\s*\(([^)]+)\)"(.*?)</p>', page, re.S):
        code, lab, body = fm.group(1), fm.group(2), fm.group(3)
        key = month_key(lab); val = re.search(r'<span class="counter">\s*([\d.]+)\s*</span>', body)
        if code in FUEL and key and val: out[f"fuel:{code}"] = {"values": {key: float(val.group(1))}, "edition": f"{code} {lab}"}
    # GDP sentence
    g = re.search(r"Gross Domestic Product \(GDP\) grew by (-?[\d.]+)% \(year-on-year\) in real terms in the (first|second|third|fourth) quarter of (\d{4})", H.unescape(page))
    if g: out["gdp:real_yoy"] = {"values": {f"{g.group(3)}-Q{QWORD[g.group(2)]}": float(g.group(1))}, "edition": f"GDP Q{QWORD[g.group(2)]} {g.group(3)}"}
    return out, notes


DEFS = {
    "cpi:All-Items": ("Headline inflation (all items, year on year)", "% year on year", "Change in the consumer price index over 12 months, all items"),
    "cpi:Core": ("Core inflation (year on year)", "% year on year", "Consumer prices excluding farm produce and energy, change over 12 months"),
    "cpi:Food": ("Food inflation (year on year)", "% year on year", "Food and non-alcoholic beverages in the consumer price index, change over 12 months"),
    "gdp:real_yoy": ("Real GDP growth (quarter, year on year)", "% year on year", "Growth of real gross domestic product against the same quarter a year earlier"),
}


class NBS:
    key = "nbs"
    URL = "https://nigerianstat.gov.ng/"

    def __init__(self, http_cfg, transport=None, sleep=None):
        self.http, self.transport, self.sleep, self._page = http_cfg, transport, sleep, None

    def page(self):
        if self._page is None:
            kw = {"transport": self.transport}
            if self.sleep: kw["sleep"] = self.sleep
            text, raw, info = fetch_text(self.URL, self.http, **kw)
            parsed, notes = parse(text)
            self._page = (parsed, notes, raw, info)
        return self._page

    def fetch(self, ind):
        parsed, notes, raw, info = self.page()
        if ind["code"] not in parsed: raise FetchError(f"NBS homepage: {ind['code']} not found (layout changed, or the figure was removed)")
        p = parsed[ind["code"]]
        if ind["code"].startswith("fuel:"):
            name, unit = FUEL[ind["code"][5:]]; desc = f"Average retail price across Nigeria, as published monthly by NBS (Fuel Price Watch). {name}."
        else:
            name, unit, desc = DEFS[ind["code"]]
            if p.get("base"): desc += f". Index base period {p['base']} = 100"
        return {"definition": {"label": name, "unit": unit, "description": desc, "dataset": "NBS homepage dashboard"},
                "edition": p["edition"], "edition_label": f"NBS, {p['edition']}", "edition_date": None,
                "values": {"NGA": p["values"]}, "raw": [("homepage", raw)], "attempts": info["attempts"],
                "status": "observed", "status_basis": "official statistics as published by NBS on its homepage dashboard",
                "source_notes": p.get("notes", [])}
