"""The atlas with pipeline data: figures, statuses, dates, fallbacks. Run after `python3 build/dist.py`.

    python3 tests/test_atlas_pipeline.py
"""
import os, re, json, datetime as dt
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "harness.py")).read())
RES = []
def check(name, ok, detail=""):
    RES.append((name, bool(ok))); print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))

BASE = open(A + "/out/dist/index.html").read()
PLJ = json.load(open(A + "/data/atlas/pipeline.json"))
def variant(name, pl):
    """A copy of the built page with the pipeline block replaced (pl=None removes it)."""
    blk = re.compile(r'<script type="application/json" id="d-pipeline">.*?</script>\n', re.S)
    body = blk.sub("", BASE) if pl is None else blk.sub(lambda m: '<script type="application/json" id="d-pipeline">' + json.dumps(pl).replace("</", "<\\/") + '</script>\n', BASE)
    open(A + f"/out/dist/_{name}.html", "w").write(SK + body + "</body></html>")
def open_variant(b, name, w=1400, h=860):
    ctx = b.new_context(viewport={"width": w, "height": h}); p = ctx.new_page(); errs = []
    p.on("pageerror", lambda e: errs.append(str(e))); p.route("**/*", route)
    p.goto(f"http://127.0.0.1:8765/_{name}.html"); p.wait_for_selector("#loading", state="hidden", timeout=20000); p.wait_for_timeout(800); p.evaluate("closeOverlay()")
    return p, errs
def sheet(p): return p.inner_text("#overlay .dialog")

with sync_playwright() as pw:
    b = pw.chromium.launch()
    p, errs = page(b, 1400, 860)
    check("pipeline data loaded", p.evaluate("PL_ON && !!D.pl.indicators.gdp_usd"))
    # Every check below reads its expected values from data/atlas/pipeline.json, so the tests keep
    # working when the sources publish new figures (they gate every release).
    I = PLJ["indicators"]; CODES = {v: k for k, v in PLJ["status_codes"].items()}
    def py(ind, c, y):
        r = I[ind]; s = r["v"].get(c)
        if not s: return None
        i = y - r["y0"]; return None if i < 0 or i >= len(s[0]) or s[0][i] is None else [s[0][i], CODES[s[1][i]]]
    js = p.evaluate("""Object.fromEntries(['gdp_usd','gdp_pc','gdp_growth','cpi_avg','gdp_pc_obs'].map(id=>[id,
        Object.fromEntries(Object.keys(D.pl.indicators[id].v).map(c=>[c, [2015,2020,2024,2025,2026,2027,2031].map(y=>{const q=PL(id,c,y); return q?[q.v,q.s]:null})]))]))""")
    bad = [f"{i} {c} {y}" for i in js for c in js[i] for y, v in zip([2015, 2020, 2024, 2025, 2026, 2027, 2031], js[i][c]) if v != py(i, c, y)]
    check("every value and status the atlas reads equals the pipeline file (5 series, all countries, 7 years)", not bad, ", ".join(bad[:8]))
    ed = I["gdp_growth"]["edition"]
    if ed == "2026-10":
        check("growth figures equal the October 2026 report tables (this edition only)",
              p.evaluate("Object.keys(D.now.imf).every(c=>['g25','g26'].every((k,i)=>{const r=D.now.imf[c][k], v=plV('gdp_growth',c,2025+i); return r==null||v==null||Math.abs(r-v)<0.051}))"))
    est = [c for c in I["gdp_pc"]["v"] if c != "WORLD" and (py("gdp_pc", c, 2025) or [0, ""])[1] == "estimate"]
    obs = [c for c in I["gdp_pc"]["v"] if c != "WORLD" and (py("gdp_pc", c, 2025) or [0, ""])[1] == "observed"]
    check("per-country tags: an actual figure and an IMF estimate get different tags",
          bool(est and obs) and p.evaluate(f"IND.gdp_pc_25.st('{obs[0]}')==='observed' && IND.gdp_pc_25.st('{est[0]}')==='estimate'"), f"{obs[:1]} {est[:1]}")
    missing = [f["c3"] for f in json.load(open(A + "/src/data/facts.json")).values() if f.get("un") and f["c3"] not in I["gdp_usd"]["v"]]
    check("missing stays missing: UN members without IMF data have no value, not zero",
          missing and p.evaluate(f"{json.dumps(missing)}.every(c=>ival('gdp_usd_25',c)===null)"), str(missing))
    p.evaluate("selectCountry('566',false)"); p.wait_for_timeout(400)
    want = p.evaluate("['gdp_usd_25','gdp_pc_25','gdp_pc_wb_25','income'].filter(id=>ival(id,'NGA')!=null).map(id=>IND[id].f(ival(id,'NGA')))")
    t = p.inner_text("#panel")
    check("Nigeria profile shows each new figure the data has for it", want and all(x in t for x in want), str(want))
    tags = p.evaluate("[...panel.querySelectorAll('.kt')].map(e=>e.textContent)")
    exp_tags = p.evaluate("['gdp_usd_25','gdp_growth_26','gdp_pc_wb_25'].filter(id=>ival(id,'NGA')!=null).map(id=>KIND[IND[id].st('NGA')]+' · '+IND[id].period)")
    check("Nigeria profile: each figure's tag shows its own status and period", all(x in tags for x in exp_tags), f"{exp_tags} vs {tags[:12]}")
    if est:
        p.evaluate(f"compareSheet('gdp_pc_25','{est[0]}')"); p.wait_for_timeout(250); s = sheet(p)
        check("an estimated country's comparison is tagged Estimate and says how many in the set are estimates",
              "Estimate · " in s and "IMF staff estimates" in s, s[:200])
        check("trend line: dotted for estimates", p.evaluate("document.querySelectorAll('#overlay svg.trend line.tm.es').length") > 0)
    p.evaluate("closeOverlay(); compareSheet('gdp_pc_wb_25','NGA')"); p.wait_for_timeout(250); s = sheet(p)
    n_wb = p.evaluate("setOf('gdp_pc_wb_25').length")
    check("World Bank figure: ranked on its own series, no mixing with IMF values",
          f"of {n_wb} countries" in s and "Reported · " in s and n_wb == sum(1 for c in I["gdp_pc_obs"]["v"] if py("gdp_pc_obs", c, 2025) and p.evaluate(f"ival('gdp_pc_wb_25','{c}')!=null && setOf('gdp_pc_wb_25').some(x=>x.c==='{c}')")), s[:200])
    p.evaluate("closeOverlay(); indSheet('gdp_usd_25')"); p.wait_for_timeout(200); s = sheet(p)
    conf = p.evaluate(f"dayLabel('{I['gdp_usd']['confirmed_current']}')")
    check("About this figure: edition and last-confirmed date from the data", I["gdp_usd"]["edition_label"] in s and f"Last confirmed current: {conf}" in s)
    p.evaluate("closeOverlay(); compareSheet('ndgain','NGA')"); p.wait_for_timeout(250); s = sheet(p)
    check("new connection: climate readiness and income per person, as an association", "Climate readiness tracks income" in s)
    p.evaluate("closeOverlay(); setMode('politics')"); p.wait_for_timeout(300); p.click('[data-act="pol"][data-v="income"]'); p.wait_for_timeout(400)
    check("income map uses the World Bank's four groups", p.inner_text("#legend").count("income") == 4 and "OECD" not in p.inner_text("#legend"))
    real = [e for e in errs if "ERR_FAILED" not in e and "net::" not in e]
    check("no script errors", not real, str(real))

    # no pipeline file: everything falls back, nothing breaks
    variant("nopl", None); q, e2 = open_variant(b, "nopl")
    check("without the pipeline file: atlas loads, falls back to report tables", q.evaluate("!PL_ON && IND.gdp_growth_25.src==='weo' && ival('gdp_growth_25','NGA')===4") and not e2, str(e2))
    check("without the pipeline file: new figures, layer and sources are removed", q.evaluate("!IND.gdp_usd_25 && !SOURCES.imfdm && !document.querySelector('#themesel option[value=gdppc]')"))
    q.evaluate("selectCountry('566',false)"); q.wait_for_timeout(300); t = q.inner_text("#panel")
    check("without the pipeline file: Nigeria profile still shows report-table growth and no pipeline-only rows", "Economic growth, 2025" in t and "Size of the economy" not in t)
    q.evaluate("setTheme('growth26')"); q.wait_for_timeout(300)
    check("without the pipeline file: growth layer still works", "Economic growth, 2026" in q.inner_text("#legend") and not e2)
    # stale and held: honest dates
    old = json.loads(json.dumps(PLJ)); d60 = (dt.datetime.utcnow() - dt.timedelta(days=60)).strftime("%Y-%m-%dT%H:%M:%SZ")
    for r in old["indicators"].values(): r["confirmed_current"] = d60
    variant("stale", old); q, e3 = open_variant(b, "stale")
    check("stale data: says when it was last confirmed and that checks may have stopped", "automatic checks may have stopped" in q.evaluate("freshness('imfdm').t") and not e3)
    held = json.loads(json.dumps(PLJ)); held["indicators"]["gdp_usd"]["newer_held"] = True
    variant("held", held); q, e4 = open_variant(b, "held")
    check("held update: the atlas says a newer version is waiting for review", "waiting for review" in q.evaluate("freshness('imfdm').t") and not e4)

    # offline standalone
    ctx = b.new_context(viewport={"width": 390, "height": 844}, offline=True); q = ctx.new_page(); e5 = []
    q.on("pageerror", lambda e: e5.append(str(e))); q.goto("file://" + STANDALONE); q.wait_for_selector("#loading", state="hidden", timeout=30000); q.wait_for_timeout(600)
    q.evaluate("closeOverlay(); selectCountry('566',false)"); q.wait_for_timeout(300)
    q.evaluate("compareSheet('gdp_pc_25','NGA')"); q.wait_for_timeout(300)
    check("offline: pipeline figures, comparison and trend work with no network",
          q.evaluate("PL_ON") and q.evaluate("IND.gdp_pc_25.f(ival('gdp_pc_25','NGA'))") in q.inner_text("#overlay .dialog") and q.evaluate("!!document.querySelector('#overlay svg.trend')") and not e5, str(e5))
    b.close()
failed = [n for n, ok in RES if not ok]
print(f"\n{len(RES) - len(failed)}/{len(RES)} atlas pipeline checks passed")
raise SystemExit(1 if failed else 0)
