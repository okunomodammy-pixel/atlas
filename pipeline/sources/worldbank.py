"""World Bank Indicators API (v2).

Verified against live responses (24 Oct 2026):
  GET {base}indicator/{CODE}?format=json
      -> [page header, [{id, name, unit, source:{id,value}, sourceNote, sourceOrganization, topics}]]
  GET {base}country/all/indicator/{CODE}?format=json&mrv=N&per_page=20000
      -> [{page, pages, per_page, total, sourceid, lastupdated}, [{countryiso3code, date, value, obs_status, ...}]]
      rows include aggregates (AFE, WLD, income groups with an empty ISO3)
  GET {base}country?format=json&per_page=400
      -> [header, [{id, name, region:{value}, incomeLevel:{id, value}, ...}]]; aggregates have region "Aggregates"
  - an invalid parameter returns HTTP 200 with [{"message": [...]}] (treated as a failure here)
  - obs_status is blank on every row, so values are not flagged as estimates
"""
from ..http import fetch_json, FetchError


def _check(j, what):
    if isinstance(j, list) and j and isinstance(j[0], dict) and "message" in j[0]:
        msg = "; ".join(f"{m.get('key')}: {m.get('value')}" for m in j[0]["message"])
        raise FetchError(f"World Bank {what}: {msg}")
    if not (isinstance(j, list) and len(j) == 2 and isinstance(j[0], dict)):
        raise FetchError(f"World Bank {what}: unexpected response shape")
    if j[1] is None: raise FetchError(f"World Bank {what}: no rows")
    return j[0], j[1]


class WorldBank:
    key = "worldbank"

    def __init__(self, cfg, http_cfg, transport=None, sleep=None):
        self.base, self.http, self.transport, self.sleep = cfg["base"], http_cfg, transport, sleep
        self._countries = None

    def _get(self, url):
        kw = {"transport": self.transport}
        if self.sleep: kw["sleep"] = self.sleep
        return fetch_json(url, self.http, **kw)

    def countries(self):
        if self._countries is None:
            j, raw, info = self._get(self.base + "country?format=json&per_page=400")
            head, rows = _check(j, "country list")
            if int(head.get("pages", 1)) > 1: raise FetchError("World Bank country list has more than one page")
            self._countries = (rows, raw, info)
        return self._countries

    def aggregates(self):
        return {c["id"] for c in self.countries()[0] if (c.get("region") or {}).get("value") == "Aggregates"}

    def fetch(self, ind):
        code = ind["code"]
        mj, mraw, _ = self._get(f"{self.base}indicator/{code}?format=json")
        _, meta = _check(mj, f"indicator {code}")
        m = meta[0]
        rows, raws, attempts, page, pages, head = [], [], [], 1, 1, {}
        while page <= pages:
            j, raw, info = self._get(f"{self.base}country/all/indicator/{code}?format=json&{ind.get('query', 'mrv=5')}&per_page=20000&page={page}")
            head, rs = _check(j, f"data for {code}")
            pages = int(head.get("pages", 1)); rows += rs; raws.append((f"{code}-p{page}", raw)); attempts += info["attempts"]; page += 1
        vals = {}
        for r in rows:
            iso = r.get("countryiso3code")
            if not iso: continue                      # income-group aggregates have no ISO3
            vals.setdefault(iso, {})[str(r["date"])] = r.get("value")
        definition = {"label": (m.get("name") or "").strip(), "unit": (m.get("unit") or "").strip() or "current US$",
                      "description": " ".join((m.get("sourceNote") or "").split()), "dataset": (m.get("source") or {}).get("value"),
                      "organisation": " ".join((m.get("sourceOrganization") or "").split())}
        return {"definition": definition, "edition": head.get("lastupdated"), "edition_label": f"WDI, updated {head.get('lastupdated')}",
                "edition_date": head.get("lastupdated"), "values": vals,
                "raw": [(f"indicator-{code}", mraw)] + raws, "attempts": attempts,
                "obs_status_seen": sorted({r.get("obs_status") or "" for r in rows})}


class WorldBankCountry:
    """Classifications from the country list (income group). The API does not state the classification's date."""
    key = "worldbank_country"

    def __init__(self, wb):
        self.wb = wb

    def fetch(self, ind):
        rows, raw, info = self.wb.countries()
        vals = {c["id"]: {"current": (c.get(ind["code"]) or {}).get("id")} for c in rows
                if (c.get("region") or {}).get("value") != "Aggregates"}
        labels = {c[ind["code"]]["id"]: c[ind["code"]]["value"] for c in rows if c.get(ind["code"])}
        return {"definition": {"label": ind["name"], "unit": "classification", "description": "World Bank analytical income classification, as listed in the Indicators API country list.",
                               "categories": dict(sorted(labels.items()))},
                "edition": None, "edition_label": "date not stated by the API", "edition_date": None,
                "values": vals, "raw": [("country-list", raw)], "attempts": info["attempts"]}
