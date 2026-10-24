"""IMF World Economic Outlook through the DataMapper API (v1).

Verified against live responses (24 Oct 2026):
  GET {base}indicators       -> {"indicators": {CODE: {label, description, source, unit, dataset, last-modified}}}
  GET {base}{CODE}           -> {"values": {CODE: {AREA: {"YYYY": number}}}, "api": {...}}
  - every economy and aggregate, 1980 to five years ahead; URL country/period filters are ignored
  - an unknown CODE returns HTTP 200 with no "values" key (treated as a failure here)
  - "source" names the edition, e.g. "World Economic Outlook (October 2026)"
"""
import re
from ..http import fetch_json, FetchError

MONTHS = {m: i for i, m in enumerate(["January", "February", "March", "April", "May", "June", "July",
                                       "August", "September", "October", "November", "December"], 1)}


def edition_of(source_text):
    m = re.search(r"World Economic Outlook \((\w+) (\d{4})\)", source_text or "")
    if not m or m.group(1) not in MONTHS: return None
    return f"{m.group(2)}-{MONTHS[m.group(1)]:02d}"


class IMF:
    key = "imf"

    def __init__(self, cfg, http_cfg, transport=None, sleep=None):
        self.base, self.http, self.transport, self.sleep = cfg["base"], http_cfg, transport, sleep
        self._meta = None

    def _get(self, url):
        kw = {"transport": self.transport}
        if self.sleep: kw["sleep"] = self.sleep
        return fetch_json(url, self.http, **kw)

    def meta(self):
        if self._meta is None:
            j, raw, info = self._get(self.base + "indicators")
            if "indicators" not in j: raise FetchError("IMF indicator list has no 'indicators' key")
            self._meta = (j["indicators"], raw, info)
        return self._meta

    def fetch(self, ind):
        code = ind["code"]
        meta, meta_raw, _ = self.meta()
        m = meta.get(code)
        if not m: raise FetchError(f"IMF indicator {code} is not in the indicator list (discontinued or renamed?)")
        j, raw, info = self._get(self.base + code)
        vals = (j.get("values") or {}).get(code)
        if not vals: raise FetchError(f"IMF {code}: response has no values (the API answers 200 with an empty body for unknown codes)")
        definition = {"label": (m.get("label") or "").strip(), "unit": (m.get("unit") or "").strip(),
                      "description": " ".join((m.get("description") or "").split()), "dataset": m.get("dataset")}
        ed = edition_of(m.get("source"))
        return {"definition": definition, "edition": ed, "edition_label": m.get("source"),
                "edition_date": (m.get("last-modified") or "")[:10] or None,
                "values": {area: {y: v for y, v in ys.items()} for area, ys in vals.items()},
                "raw": [("indicators", meta_raw), (code, raw)], "attempts": info["attempts"]}
