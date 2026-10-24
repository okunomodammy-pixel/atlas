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
    # figures and statuses come from the source's metadata
    st = p.evaluate("Object.fromEntries([['NGA',2025],['LBY',2025],['AFG',2025],['NGA',2026]].map(([c,y])=>[c+y, plS('gdp_pc',c,y)]))")
    check("statuses: Nigeria 2025 actual, Libya and Afghanistan 2025 IMF estimates, 2026 projection",
          st == {"NGA2025": "observed", "LBY2025": "estimate", "AFG2025": "estimate", "NGA2026": "projection"}, str(st))
    check("growth figures unchanged from the report tables (pipeline vs now.json)",
          p.evaluate("Object.keys(D.now.imf).every(c=>['g25','g26'].every((k,i)=>{const r=D.now.imf[c][k], v=plV('gdp_growth',c,2025+i); return r==null||v==null||Math.abs(r-v)<0.051}))"))
    check("2025 growth no longer labelled 'estimate' for every country",
          p.evaluate("IND.gdp_growth_25.st('NGA')") == "observed" and p.evaluate("IND.gdp_growth_25.st('LBY')") == "estimate")
    check("missing stays missing: Cuba has no IMF GDP, North Korea no growth", p.evaluate("ival('gdp_usd_25','CUB')===null && ival('gdp_growth_25','PRK')===null"))
    p.evaluate("selectCountry('566',false)"); p.wait_for_timeout(400); t = p.inner_text("#panel")
    check("Nigeria profile: GDP, income per person (two sources) and income group",
          all(x in t for x in ["US$290 billion", "US$1,223", "US$1,224", "IMF figure for the same year", "Lower middle income"]))
    tags = p.evaluate("[...panel.querySelectorAll('.kt')].map(e=>e.textContent)")
    check("Nigeria profile: tags show 'Observed · 2025', 'Projection · 2026' and 'Reported · 2025'",
          all(x in tags for x in ["Observed · 2025", "Projection · 2026", "Reported · 2025"]), str(tags[:12]))
    p.evaluate("compareSheet('gdp_growth_25','LBY')"); p.wait_for_timeout(250); s = sheet(p)
    check("Libya's comparison is tagged Estimate and says how many in the set are estimates", "Estimate · 2025" in s and "IMF staff estimates" in s)
    check("trend line: dotted for estimates", p.evaluate("document.querySelectorAll('#overlay svg.trend line.tm.es').length") > 0)
    p.evaluate("closeOverlay(); compareSheet('gdp_pc_wb_25','NGA')"); p.wait_for_timeout(250); s = sheet(p)
    check("World Bank figure: ranked on its own series, no mixing with IMF values", "of 181 countries" in s and "Reported · 2025" in s, s[:200])
    p.evaluate("closeOverlay(); indSheet('gdp_usd_25')"); p.wait_for_timeout(200); s = sheet(p)
    check("About this figure: edition and last-confirmed date", "World Economic Outlook (October 2026)" in s and "Last confirmed current: 24 October 2026" in s)
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
    check("without the pipeline file: Nigeria profile still shows growth, inflation and the old income group", "4.0%" in t and "Lower middle income" in t and "US$290 billion" not in t)
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
          q.evaluate("PL_ON") and "US$1,223" in q.inner_text("#overlay .dialog") and q.evaluate("!!document.querySelector('#overlay svg.trend')") and not e5, str(e5))
    b.close()
failed = [n for n, ok in RES if not ok]
print(f"\n{len(RES) - len(failed)}/{len(RES)} atlas pipeline checks passed")
raise SystemExit(1 if failed else 0)
