"""Pipeline tests against recorded live responses. No network; never touches the real data/ folder.

    python3 tests/test_pipeline.py

Each check prints PASS or FAIL; the script exits non-zero if any fail.
"""
import copy, glob, hashlib, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
from pipeline_fixtures import Replay, make_root
from pipeline.run import Run

RES = []
def check(name, ok, detail=""):
    RES.append((name, bool(ok))); print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))

SLEPT = []
def run(root, replay=None, dry=False, only=None, now=None):
    r = Run(root=root, transport=replay or Replay(), sleep=SLEPT.append, dry=dry, now=now)
    return {x["indicator"]: x for x in r.go(only)["results"]}

def J(root, *p): return json.load(open(os.path.join(root, *p)))
def exists(root, *p): return os.path.exists(os.path.join(root, *p))
def snapshot(root):
    out = {}
    for p in sorted(glob.glob(os.path.join(root, "data", "**", "*"), recursive=True)):
        if os.path.isfile(p) and "/extracted/" not in p: out[os.path.relpath(p, root)] = hashlib.sha256(open(p, "rb").read()).hexdigest()
    return out

def approve_all(root, res):
    a = J(root, "pipeline", "config", "approvals.json")
    for i, r in res.items():
        if r.get("approve_with"): a["approve"][i] = r["approve_with"]
    json.dump(a, open(os.path.join(root, "pipeline", "config", "approvals.json"), "w"))

def published():
    """A root where every pilot indicator has been reviewed and published once."""
    root = make_root(); res = run(root); approve_all(root, res); run(root); return root

def edit_values(code, fn):
    """Edit an IMF DataMapper fixture's values."""
    def e(j): fn(j["values"][code]); return j
    return e

# ---------------------------------------------------------------- first run, approval, no change
root = make_root()
res = run(root)
check("first run: every indicator is held for review, none published",
      all(r["outcome"] == "held for review" for r in res.values()) and not glob.glob(os.path.join(root, "data", "normal", "*.json")),
      str({k: v["outcome"] for k, v in res.items()}))
check("first run: the reason given is first publication", all(any("first publication" in x for x in r["review"]) for r in res.values()))
check("first run: atlas file has no indicators yet", J(root, "data", "atlas", "pipeline.json")["indicators"] == {})
check("first run: growth, inflation, current account and unemployment agree with the report tables",
      all(any("580 agree" in n for n in res[i]["notes"]) for i in ("gdp_growth", "cpi_avg"))
      and all(any(" agree" in n for n in res[i]["notes"]) and not any("differ from" in r for r in res[i]["review"]) for i in ("ca", "unemp")))
check("first run: unemployment before 2026 is labelled 'status not stated' (no latest-actual year in the appendix)",
      set(res["unemp"]["status_counts"]) == {"unstated", "projection"})

a = J(root, "pipeline", "config", "approvals.json"); a["approve"]["gdp_usd"] = "0000000000000000"
json.dump(a, open(os.path.join(root, "pipeline", "config", "approvals.json"), "w"))
res2 = run(root, only={"gdp_usd"})
check("approval with the wrong hash publishes nothing", not exists(root, "data", "normal", "gdp_usd.json") and res2["gdp_usd"]["outcome"].startswith("held"))

approve_all(root, res); res3 = run(root)
check("approved updates are published", all(exists(root, "data", "normal", f"{i}.json") for i in res3) and all(r.get("approved") for r in res3.values()),
      str({k: v["outcome"] for k, v in res3.items()}))
check("approval confirms the definition", set(J(root, "pipeline", "config", "definitions.json")["confirmed"]) == set(res3))
check("review files are removed once published", not glob.glob(os.path.join(root, "data", "review", "*.json")))
atl = J(root, "data", "atlas", "pipeline.json")["indicators"]
check("atlas file has every indicator", set(atl) == set(res3))
ATL = J(root, "data", "atlas", "pipeline.json"); CODES = {v: k for k, v in ATL["status_codes"].items()}
def A(ind, c, y):
    r = atl[ind]; s = r["v"].get(c)
    if not s: return None
    i = y - r["y0"]
    return None if i < 0 or i >= len(s[0]) or s[0][i] is None else (s[0][i], CODES[s[1][i]])
ANNUAL = [i for i in atl if "y0" in atl[i]]
check("atlas file keeps 2015-2031 only (annual series)", len(ANNUAL) == 7 and all(atl[i]["y0"] == 2015 and len(s[0]) <= 17 for i in ANNUAL for s in atl[i]["v"].values()))
check("atlas file: values and status strings line up", all(len(s[0]) == len(s[1]) for i in ANNUAL for s in atl[i]["v"].values()))
check("atlas file: Nigeria GDP per person 2025 observed, 2026 projection (IMF appendix)",
      A("gdp_pc", "NGA", 2025)[1] == "observed" and A("gdp_pc", "NGA", 2026)[1] == "projection")
check("atlas file: Libya 2020 is an IMF estimate (national accounts actual only to 2019)", A("gdp_pc", "LBY", 2020)[1] == "estimate")
check("atlas file: Afghanistan has no 2026 value rather than a zero", A("gdp_pc", "AFG", 2026) is None and A("gdp_pc", "AFG", 2025) is not None)
check("atlas file: Cuba, Monaco and North Korea are absent from IMF data, not zero", not ({"CUB", "MCO", "PRK"} & set(atl["gdp_usd"]["v"])))
check("atlas file: Kosovo and Palestine joined by code (UVK, WBG)", "UNK" in atl["gdp_usd"]["v"] and "PSE" in atl["gdp_usd"]["v"])
check("atlas file: World Bank values marked 'reported' and kept to the source's 1 decimal",
      set("".join(s[1] for s in atl["gdp_pc_obs"]["v"].values())) <= {"r", "-"} and all(x is None or round(x, 1) == x for s in atl["gdp_pc_obs"]["v"].values() for x in s[0]))
check("atlas file: world total labelled aggregate before 2026", A("gdp_growth", "WORLD", 2025)[1] == "aggregate")
check("atlas file: income group is one code per country", atl["income_group"]["v"]["NGA"] == "LMC")
check("atlas file: last-confirmed date and no newer version waiting", all(atl[i]["confirmed_current"] and atl[i]["newer_held"] is False for i in atl))
check("atlas file: edition recorded", atl["gdp_usd"]["edition"] == "2026-10" and atl["gdp_pc_obs"]["edition"] == "2026-10-08")

before = snapshot(root); res4 = run(root); after = snapshot(root)
check("unchanged source: every indicator reports no change", all(r["outcome"] == "no change" for r in res4.values()), str({k: v["outcome"] for k, v in res4.items()}))
check("unchanged source: published files are byte-identical",
      all(before[k] == after[k] for k in before if "/normal/" in k or "/raw/" in k) and len([k for k in after if "/raw/" in k]) == len([k for k in before if "/raw/" in k]))

# ---------------------------------------------------------------- routine updates
root = published()
def small(v): v["NGA"]["2025"] = round(v["NGA"]["2025"] * 1.005, 3)
res = run(root, Replay(edit={"imf_dm_ngdpdpc_all": edit_values("NGDPDPC", small)}), only={"gdp_pc"})
check("small revision is published as routine", res["gdp_pc"]["outcome"] == "published" and any("revised within" in n for n in res["gdp_pc"]["notes"]),
      res["gdp_pc"]["outcome"])
check("routine update is logged with its note", "values revised within the threshold" in open(os.path.join(root, "data", "UPDATE_LOG.md")).read())
def addyear(j):
    r = copy.deepcopy([x for x in j[1] if x["countryiso3code"] == "NGA"][0]); r["date"] = "2026"; r["value"] = 1500.0; j[1].append(r); return j
res = run(root, Replay(edit={"wb_all_gdppc_mrv": addyear}), only={"gdp_pc_obs"})
check("a new year from the World Bank is published as routine", res["gdp_pc_obs"]["outcome"] == "published" and any("1 new country-years" in n for n in res["gdp_pc_obs"]["notes"]),
      str(res["gdp_pc_obs"]))

# ---------------------------------------------------------------- held for review; last good stays
def held_case(name, edit=None, only="gdp_usd", expect="", root_fn=None):
    root = published(); root_fn and root_fn(root)
    good = open(os.path.join(root, "data", "normal", f"{only}.json"), "rb").read()
    atlas_before = open(os.path.join(root, "data", "atlas", "pipeline.json"), "rb").read()
    res = run(root, Replay(edit=edit or {}), only={only})
    r = res[only]; txt = " ".join(r.get("review") or [])
    ok = r["outcome"] == "held for review" and expect in txt
    same = open(os.path.join(root, "data", "normal", f"{only}.json"), "rb").read() == good
    a_ind = lambda b: json.loads(b)["indicators"][only]
    after_ind = a_ind(open(os.path.join(root, "data", "atlas", "pipeline.json"), "rb").read())
    atlas_same = after_ind["v"] == a_ind(atlas_before)["v"] and after_ind["edition"] == a_ind(atlas_before)["edition"] and after_ind["newer_held"] is True
    check(f"held: {name}", ok and same and atlas_same and exists(root, "data", "review", f"{only}.json"),
          f"{r['outcome']} | {txt[:200]} | last good kept {same} | atlas values kept, newer version flagged {atlas_same}")
    return root, r

def big(v): v["NGA"]["2024"] = 400.0
held_case("large revision (Nigeria 2024 GDP 252 -> 400 bn)", {"imf_dm_ngdpd_all": edit_values("NGDPD", big)}, expect="revisions beyond")
def relabel(j): j["indicators"]["NGDPD"]["unit"] = "Millions of U.S. dollars"; return j
held_case("unit changed at the source", {"imf_dm_indicators": relabel}, expect="definition changed at the source (unit)")
def redescribe(j): j["indicators"]["NGDPD"]["description"] = "GDP at constant prices."; return j
held_case("definition text changed at the source", {"imf_dm_indicators": redescribe}, expect="description")
def halve(v):
    for k in sorted(v)[::2]: del v[k]
held_case("coverage collapses", {"imf_dm_ngdpd_all": edit_values("NGDPD", halve)}, expect="coverage fell")
def zeros(v):
    for k in ["GHA", "BEN", "TGO"]: v[k]["2025"] = 0
held_case("zeros where zero is implausible", {"imf_dm_ngdpd_all": edit_values("NGDPD", zeros)}, expect="3 zero values")
def newcode(v): v["XQZ"] = {"2025": 1.0}
held_case("unknown source code", {"imf_dm_ngdpd_all": edit_values("NGDPD", newcode)}, expect="XQZ")
def jump(v): v["GHA"]["2025"] = v["GHA"]["2024"] * 3
held_case("suspicious movement", {"imf_dm_ngdpd_all": edit_values("NGDPD", jump)}, expect="year-on-year")
def offreport(v): v["NGA"]["2026"] = 6.5
held_case("disagrees with the report tables", {"imf_dm_growth_nga": edit_values("NGDP_RPCH", offreport)}, only="gdp_growth", expect="differ from IMF WEO October 2026")
def newed(j):
    for k in j["indicators"]: j["indicators"][k]["source"] = "World Economic Outlook (April 2027)"
    return j
root, r = held_case("new WEO edition without its reviewed latest-actual table", {"imf_dm_indicators": newed}, expect="no reviewed latest-actual table for WEO edition 2027-04")
check("new edition: noted in the run", any("new edition" in n for n in r["notes"]))
def regress(root):
    p = os.path.join(root, "pipeline", "config", "editions", "weo-2026-10.json"); d = json.load(open(p))
    d["latest_actual"]["NGA"]["na"] = 2024; json.dump(d, open(p, "w"))
held_case("a value going from observed back to estimate", None, expect="observed back to estimate", root_fn=regress)
def group(j):
    for c in j[1][:40]:
        if c["region"]["value"] != "Aggregates": c["incomeLevel"] = {"id": "HIC", "iso2code": "XD", "value": "High income"}
    return j
held_case("many income-group changes at once", {"wb_countries": group}, only="income_group", expect="changed group")

# new edition with its table: publishes after approval and archives the old edition
root = published()
p = os.path.join(root, "pipeline", "config", "editions"); json.dump(dict(J(root, "pipeline", "config", "editions", "weo-2026-10.json"), edition="2027-04"), open(os.path.join(p, "weo-2027-04.json"), "w"))
res = run(root, Replay(edit={"imf_dm_indicators": newed}), only={"gdp_pc"})
held_now = res["gdp_pc"]["outcome"] == "held for review"
approve_all(root, res); run(root, Replay(edit={"imf_dm_indicators": newed}), only={"gdp_pc"})
check("new edition with its table: approved, published, old edition kept in history",
      held_now and J(root, "data", "normal", "gdp_pc.json")["edition"] == "2027-04" and exists(root, "data", "history", "gdp_pc", "2026-10.json"))

# ---------------------------------------------------------------- failures; last good stays, nothing staged
def failure_case(name, replay, only="gdp_usd", expect=""):
    root = published(); before = snapshot(root)
    res = run(root, replay, only={only}); r = res[only]
    after = snapshot(root)
    kept = all(before[k] == after.get(k) for k in before if "/normal/" in k or "/raw/" in k)
    reason = (r.get("reason") or "") + " ".join(r.get("failures") or [])
    ok = ("kept" in r["outcome"]) and expect in reason and kept and not exists(root, "data", "review", f"{only}.json")
    check(f"failure: {name}", ok, f"{r['outcome']} | {reason[:220]} | last good kept {kept}")
    return root, r

SLEPT.clear()
root, r = failure_case("IMF unavailable (HTTP 503 every attempt)", Replay(fail={"v1/NGDPD": [503, 503, 503]}), expect="gave up after 3 attempts")
m = J(root, "data", "manifest.json")
check("failure: manifest records the failed attempt and the earlier success",
      m["sources"]["imf"]["last_status"] == "failed" and m["indicators"]["gdp_usd"]["state"] == "published" and "fetch failed" in m["indicators"]["gdp_usd"]["last_check_result"])
check("failure: back-off waits between attempts", SLEPT[:2] == [30, 60], str(SLEPT[:3]))
check("failure: the log says the last good data was kept", "fetch failed, last good data kept" in open(os.path.join(root, "data", "UPDATE_LOG.md")).read())
failure_case("World Bank timeouts on every attempt", Replay(fail={"country/all/indicator": ["timeout"] * 3}), only="gdp_pc_obs", expect="timeout after")
failure_case("IMF answers 200 with no values (its unknown-code behaviour)", Replay(edit={"imf_dm_ngdpd_all": lambda j: {"api": j["api"]}}), expect="no values")
failure_case("World Bank error message", Replay(edit={"wb_all_gdppc_mrv": lambda j: [{"message": [{"id": "120", "key": "Invalid value", "value": "The provided parameter value is not valid"}]}]}),
             only="gdp_pc_obs", expect="Invalid value")
failure_case("response is not JSON", Replay(fail={"v1/NGDPD": [(200, {}, b"<html>maintenance</html>")]}), expect="not JSON")
failure_case("indicator removed from the IMF list", Replay(edit={"imf_dm_indicators": lambda j: (j["indicators"].pop("NGDPD"), j)[1]}), expect="not in the indicator list")
def text_value(v): v["NGA"]["2025"] = "n/a"
failure_case("a value that is not a number", Replay(edit={"imf_dm_ngdpd_all": edit_values("NGDPD", text_value)}), expect="not finite numbers")
SLEPT.clear()
root = published(); res = run(root, Replay(fail={"v1/NGDPD": ["timeout"]}), only={"gdp_usd"})
check("recovery: one timeout, then success", res["gdp_usd"]["outcome"] == "no change" and SLEPT == [30], f"{res['gdp_usd']['outcome']} {SLEPT}")
SLEPT.clear(); res = run(root, Replay(fail={"v1/NGDPD": [429]}), only={"gdp_usd"})
check("rate limit: HTTP 429 waits for Retry-After, then succeeds", res["gdp_usd"]["outcome"] == "no change" and SLEPT == [7], str(SLEPT))
res = run(root, Replay(fail={"v1/NGDPD": [404]}), only={"gdp_usd"})
check("HTTP 404 is not retried", "HTTP 404, not retried" in res["gdp_usd"]["reason"])

import pipeline.sources.imf as imfmod
root = published(); orig = imfmod.IMF.fetch
imfmod.IMF.fetch = lambda self, ind: (_ for _ in ()).throw(KeyError("bug")) if ind["code"] == "NGDPD" else orig(self, ind)
before = snapshot(root); res = run(root); imfmod.IMF.fetch = orig
check("a bug in one indicator does not stop the others or touch its data",
      res["gdp_usd"]["outcome"] == "error, last good data kept" and all(res[i]["outcome"] == "no change" for i in res if i != "gdp_usd")
      and all(before[k] == snapshot(root).get(k) for k in before if "/normal/" in k))

root = published(); before = snapshot(root)
res = run(root, Replay(edit={"imf_dm_ngdpd_all": edit_values("NGDPD", big)}), dry=True)
check("dry run changes nothing under data/", snapshot(root) == before and exists(root, "out", "pipeline-report.json"))

# ---------------------------------------------------------------- Nigerian sources (NBS homepage, CBN API)
def next_month(html):
    h = html.replace("CPI (Sept-2026)", "CPI (Oct-2026)").replace("14.63%<!--", "14.20%<!--")
    h = h.replace('<span class="counter">14.63</span>', '<span class="counter">14.20</span>')
    h = h.replace("15.93,15.91,15.43,15.39,14.63</div>", "15.93,15.91,15.43,15.39,14.63,14.20</div>")
    h = h.replace('<span class="counter">12.95</span>', '<span class="counter">12.70</span>').replace("14.97,13.29,12.95</div>", "14.97,13.29,12.95,12.70</div>")
    return h.replace('<span class="counter">19.59</span>', '<span class="counter">19.10</span>')
root = published()
NG = {"ng_cpi", "ng_cpi_core", "ng_cpi_food", "ng_petrol", "ng_fx_usd"}
check("NBS and CBN: published after the first review (approved with the rest)", all(J(root, "data", "normal", f"{i}.json")["source"] in ("nbs", "cbn") for i in NG))
check("NBS: food inflation history is malformed on the page, so only the latest month is kept",
      list(J(root, "data", "normal", "ng_cpi_food.json")["series"]["NGA"]) == ["2026-09"] and len(J(root, "data", "normal", "ng_cpi.json")["series"]["NGA"]) == 13)
res = run(root, Replay(edit={"nbs_home.html": next_month}), only={"ng_cpi", "ng_cpi_core", "ng_cpi_food", "ng_petrol"})
check("NBS: next month's CPI is published on its own (routine), unchanged fuel prices report no change",
      all(res[i]["outcome"] == "published" for i in ("ng_cpi", "ng_cpi_core", "ng_cpi_food")) and res["ng_petrol"]["outcome"] == "no change"
      and J(root, "data", "normal", "ng_cpi.json")["series"]["NGA"]["2026-10"] == [14.2, "observed"], str({k: v["outcome"] for k, v in res.items()}))
atl = J(root, "data", "atlas", "pipeline.json")["indicators"]["ng_cpi"]
check("NBS: the atlas file carries the monthly series with periods", atl.get("period") == "month" and atl["v"]["NGA"]["2026-10"] == [14.2, "o"])
held_case("NBS: index rebased (base period changes): held", {"nbs_home.html": lambda h: next_month(h).replace("Base Period 2024", "Base Period 2025")}, only="ng_cpi", expect="definition changed")
held_case("NBS: inflation jumps 9 points in a month: held", {"nbs_home.html": lambda h: next_month(h).replace('<span class="counter">14.20</span>', '<span class="counter">23.60</span>').replace("15.39,14.63,14.20</div>", "15.39,14.63,23.60</div>")}, only="ng_cpi", expect="year-on-year")
failure_case("NBS: homepage layout changed (CPI widget gone)", Replay(edit={"nbs_home.html": lambda h: h.replace('data-original-title="CPI', 'data-original-title="XPI')}), only="ng_cpi", expect="CPI widget not found")
failure_case("NBS: site down", Replay(fail={"nigerianstat.gov.ng/": [503, 503, 503]}), only="ng_cpi", expect="gave up")
def cbn_next(j):
    d = [dict(x, ratedate="2026-10-26", id=x["id"] + 9999) for x in j if x["ratedate"] == "2026-10-23"]; return d + j
res = run(root, Replay(edit={"cbn_rates": cbn_next}), only={"ng_fx_usd"})
check("CBN: a new day's rate is published on its own", res["ng_fx_usd"]["outcome"] == "published" and "2026-10-26" in J(root, "data", "normal", "ng_fx_usd.json")["series"]["NGA"], res["ng_fx_usd"]["outcome"])
held_case("CBN: the naira halves overnight: held", {"cbn_rates": lambda j: [dict(x, ratedate="2026-10-26", sellingrate=str(float(x["sellingrate"]) * 2)) for x in j if x["ratedate"] == "2026-10-23"] + j}, only="ng_fx_usd", expect="year-on-year")
# release-paced checks
root = published(); now = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
calls = Replay(); r = Run(root=root, transport=calls, sleep=lambda s: None, force=False, now=now + __import__("datetime").timedelta(days=2)).go()
by = {x["indicator"]: x["outcome"] for x in r["results"]}
check("scheduled run two days later: every source is 'not due' and nothing is fetched", set(by.values()) == {"not due"} and not calls.calls, str(set(by.values())))
calls = Replay(); r = Run(root=root, transport=calls, sleep=lambda s: None, force=False, now=now + __import__("datetime").timedelta(days=8)).go()
by = {x["indicator"]: x["outcome"] for x in r["results"]}
check("scheduled run eight days later: weekly sources are checked, the IMF (every 13 days) is not",
      by["ng_cpi"] == "no change" and by["gdp_pc_obs"] == "no change" and by["gdp_usd"] == "not due", str(by))

failed = [n for n, ok in RES if not ok]
print(f"\n{len(RES) - len(failed)}/{len(RES)} pipeline checks passed")
sys.exit(1 if failed else 0)
