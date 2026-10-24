"""Central Bank of Nigeria: official exchange rates.

Verified 24 Oct 2026: GET https://www.cbn.gov.ng/api/GetAllExchangeRates returns JSON, about 8 MB, newest first:
  [{"id": 65245, "currency": "US DOLLAR", "ratedate": "2026-10-23", "buyingrate": "1360.8394", "centralrate": "1361.3394",
    "sellingrate": "1361.8394"}, ...]   back to 2019, 13 currencies a day.
Rates are strings; dates are ISO. The atlas keeps the last 400 days of the indicator's currency and rate.
"""
import datetime as dt
from ..http import fetch_json, FetchError


class CBN:
    key = "cbn"
    URL = "https://www.cbn.gov.ng/api/GetAllExchangeRates"

    def __init__(self, http_cfg, transport=None, sleep=None):
        self.http, self.transport, self.sleep, self._rows = http_cfg, transport, sleep, None

    def rows(self):
        if self._rows is None:
            kw = {"transport": self.transport}
            if self.sleep: kw["sleep"] = self.sleep
            j, raw, info = fetch_json(self.URL, self.http, **kw)
            if not isinstance(j, list) or not j or not all(isinstance(x, dict) and {"currency", "ratedate"} <= set(x) for x in j[:50]):
                raise FetchError("CBN rates: unexpected response shape")
            self._rows = (j, raw, info)
        return self._rows

    def fetch(self, ind):
        cur, field = ind["code"].split(":")
        rows, raw, info = self.rows()
        mine = [r for r in rows if r.get("currency") == cur]
        if not mine: raise FetchError(f"CBN rates: no {cur} rows")
        last = max(r["ratedate"] for r in mine)
        cutoff = (dt.date.fromisoformat(last) - dt.timedelta(days=400)).isoformat()
        vals = {}
        for r in mine:
            if r["ratedate"] < cutoff: continue
            try: vals[r["ratedate"]] = float(r[field])
            except (TypeError, ValueError, KeyError): raise FetchError(f"CBN rates: {cur} {r.get('ratedate')} {field} is {r.get(field)!r}")
        return {"definition": {"label": f"Official naira rate, {cur.lower()} ({field.replace('rate', ' rate')})", "unit": f"naira per {cur.lower()}",
                               "description": "Official exchange rate published daily by the Central Bank of Nigeria", "dataset": "CBN exchange rates API"},
                "edition": last, "edition_label": f"CBN rates to {last}", "edition_date": last,
                # the full response is ~8 MB a day; the raw store keeps this currency's rows exactly as received (~200 KB)
                "values": {"NGA": vals}, "raw": [(f"rates-{cur}", __import__("json").dumps(mine, separators=(",", ":")).encode())], "attempts": info["attempts"],
                "status": "observed", "status_basis": "official rates as published by the Central Bank of Nigeria"}
