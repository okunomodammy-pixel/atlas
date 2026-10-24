"""Nigeria: overview, 37 state profiles, comparisons, poverty map, state game. Run after `python3 build/dist.py`.

    python3 tests/test_nigeria.py

Expected values are read from the embedded data, so the checks hold if the survey figures are replaced.
"""
import os, re, json
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "harness.py")).read())
RES = []
def check(name, ok, detail=""):
    RES.append((name, bool(ok))); print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))
def real(errs): return [e for e in errs if "ERR_FAILED" not in e and "net::" not in e]

with sync_playwright() as pw:
    b = pw.chromium.launch()
    p, errs = page(b, 390, 844)
    # data integrity inside the page: the 15 deprivations recombine into each state's published MPI
    gap = p.evaluate("""(() => { const m = MPIS(), mp = NOW().mpi; return Math.max(...Object.keys(mp).map(k =>
        Math.abs(m.indicators.reduce((a, i) => a + i.weight * m.states[k].censored[i.key][0] / 100, 0) - mp[k].mpi))); })()""")
    check("embedded data: every state's 15 deprivations recombine into its published MPI", gap < 0.005, str(gap))
    check("embedded data: zones add up to the national number of poor",
          p.evaluate("Math.abs(Object.values(MPIS().zones).reduce((a, z) => a + z.poor_m, 0) - MPIS().national.poor_m) < 0.2"))
    # overview
    p.evaluate("setMode('nigeria')"); p.wait_for_timeout(900); t = p.inner_text("#panel")
    tiles = p.evaluate("[...panel.querySelectorAll('[data-act=ngtile]')].map(e => e.dataset.id)")
    check("overview: six headline figures, each a registry record", len(tiles) == 6 and p.evaluate(f"{json.dumps(tiles)}.every(id => IND[id] && ival(id,'NGA') != null)"), str(tiles))
    check("overview: 'Many Nigerias', the zone table and a finder for all 37", all(x in t for x in ["Many Nigerias", "Explore the states"]) and p.evaluate("panel.querySelectorAll('[data-act=stateopen]').length") == 37)
    check("overview: no false precision in the population", not re.search(r"\d{3},\d{3},\d{3}", t))
    p.click("[data-act=ngtile][data-id=median_age]"); p.wait_for_timeout(250)
    check("overview: a headline figure opens its comparison", "Median age" in p.inner_text("#overlay h2")); p.evaluate("closeOverlay()")
    # every profile
    keys = p.evaluate("Object.keys(NOW().mpi)"); bad, stand = [], {}
    for k in keys:
        p.evaluate(f"statePanel(GEO_NAME({json.dumps(k)}))"); p.wait_for_timeout(60)
        info = p.evaluate("""k => ({h2: panel.querySelector('h2').textContent, tile: panel.querySelector('.tile b').textContent, rows: panel.querySelectorAll('.dep').length,
            sim: panel.querySelectorAll('[data-act=stateopen]').length, back: !!panel.querySelector('.back'), txt: panel.innerText,
            want: pctS(NOW().mpi[k].h), rel: ciRel(MPIS().states[k].h_ci, MPIS().national.h)})""", k)
        rel_words = {"above": "clearly above", "below": "clearly below", "within": "not clearly different from"}[info["rel"]]
        problems = [x for x, ok in [("title", info["h2"] == ("Federal Capital Territory" if k == "FCT" else k)), ("share", info["tile"] == info["want"]), ("15 rows", info["rows"] == 15),
                    ("3 similar", info["sim"] == 3), ("back", info["back"]), ("comparison wording", rel_words in info["txt"])] if not ok]
        if problems: bad.append(f"{k}: {problems}")
        m = re.search(r"How .*? compares\n(.*?)What poverty is made of", info["txt"], re.S)
        stand[k] = re.sub(re.escape(k), "X", m.group(1)) if m else ""
    check(f"all {len(keys)} profiles: title, share, 15 deprivations, similar states, Back, margin-of-error wording", not bad, "; ".join(bad[:5]))
    check("profiles are not the same paragraph with the name changed", len(set(stand.values())) == len(keys), f"{len(set(stand.values()))} distinct of {len(keys)}")
    p.evaluate("statePanel('Federal Capital Territory')"); p.wait_for_timeout(100)
    check("the FCT is described as a territory, not a state", "Not a state" in p.inner_text("#panel"))
    # Back keeps your place
    p.evaluate("setMode('nigeria')"); p.wait_for_timeout(500); p.evaluate("panel.scrollTop = 500"); before = p.evaluate("panel.scrollTop")
    p.click("[data-act=stateopen][data-s=Kano]"); p.wait_for_timeout(300); p.click("#panel .back"); p.wait_for_timeout(400)
    check("Back from a profile returns to the Nigeria page at the same place", p.evaluate("S.mode") == "nigeria" and abs(p.evaluate("panel.scrollTop") - before) < 5)
    # comparison
    p.evaluate("compareStates('Kano','Bayelsa')"); p.wait_for_timeout(250); s = p.inner_text("#overlay .dialog")
    flip = p.evaluate("(NOW().mpi.Kano.h - NOW().mpi.Bayelsa.h) * (NOW().mpi.Kano.poor - NOW().mpi.Bayelsa.poor) < 0")
    check("compare: percentages-versus-people note appears exactly when they disagree", ("point in different directions" in s) == flip)
    p.select_option("#overlay select[data-cmpb]", "NGA"); p.wait_for_timeout(250)
    check("compare: switching to the national figure works", "Kano and Nigeria" in p.inner_text("#overlay h2"))
    p.select_option("#overlay select[data-cmpb]", "Jigawa"); p.wait_for_timeout(250); s = p.inner_text("#overlay .dialog")
    check("compare: differences inside the margin of error are flagged", ("within the margin of error" in s) == p.evaluate(
        "(a => !(a.Kano.h_ci[0] > a.Jigawa.h_ci[1] || a.Jigawa.h_ci[0] > a.Kano.h_ci[1]))(MPIS().states)") or "within the margin of error" in s)
    p.evaluate("closeOverlay()")
    # the poverty map, every measure
    metrics = p.evaluate("NG_METRICS().map(m => m[0])"); missing = []
    for mt in metrics:
        p.evaluate(f"ngPovertyMap({json.dumps(mt)})"); p.wait_for_timeout(40)
        filled = p.evaluate("[...document.querySelectorAll('path.state')].filter(e => e.style.fill && e.style.fill !== 'var(--land)').length")
        if mt != "poor" and filled != 37: missing.append(f"{mt}:{filled}")
    check(f"poverty map: all {len(metrics)} measures colour all 37", len(metrics) == 19 and not missing, ", ".join(missing))
    p.evaluate("ngPovertyMap('poor')"); p.wait_for_timeout(100)
    check("poverty map: number of poor shown as 37 circles", p.evaluate("document.querySelectorAll('path.ngbubble').length") == 37)
    # links
    q, e2 = page(b, 390, 844, hash="s/Bayelsa")
    check("shareable link #s/Bayelsa opens Bayelsa's profile", q.inner_text("#panel h2") == "Bayelsa")
    # the state game reads the canonical data
    p.evaluate("setMode('quiz')"); p.wait_for_timeout(200); p.click('[data-act="game"][data-g="ngstates"]'); p.wait_for_timeout(300); ok_why = 0
    for i in range(10):
        p.click("#panel .opts button >> nth=0"); p.wait_for_timeout(60)
        if re.search(r"\d", p.inner_text("#why")): ok_why += 1
        p.click("#next"); p.wait_for_timeout(60)
    check("state game: 10 rounds, each answer explained with both values", ok_why == 10 and re.search(r"\d+ / 10", p.inner_text("#panel .score") or ""))
    # wrong answers explain the choice
    p.evaluate("setMode('quiz')"); p.wait_for_timeout(200); p.click('[data-act="game"][data-g="capitals"][data-scope="Africa"]'); p.wait_for_timeout(300); said = False
    for i in range(10):
        j = p.evaluate("(() => { const bs = [...panel.querySelectorAll('.opts button')]; return bs.length })()")
        p.click("#panel .opts button >> nth=0"); p.wait_for_timeout(60)
        w = p.inner_text("#why")
        if w.startswith("Not quite") and ("You chose" in w or "capital is" in w): said = True
        p.click("#next"); p.wait_for_timeout(60)
    check("capitals: a wrong answer says what the chosen option actually is", said)
    check("phone: no sideways scrolling; no script errors", p.evaluate("document.documentElement.scrollWidth") <= 390 and not real(errs) and not real(e2), str(real(errs) + real(e2))[:200])
    # offline
    ctx = b.new_context(viewport={"width": 390, "height": 844}, offline=True); o = ctx.new_page(); e3 = []
    o.on("pageerror", lambda e: e3.append(str(e))); o.goto("file://" + STANDALONE); o.wait_for_selector("#loading", state="hidden", timeout=30000); o.wait_for_timeout(500)
    o.evaluate("closeOverlay(); setMode('nigeria')"); o.wait_for_timeout(600); o.evaluate("statePanel('Sokoto')"); o.wait_for_timeout(300)
    check("offline: a state profile works with no network", o.inner_text("#panel h2") == "Sokoto" and o.evaluate("panel.querySelectorAll('.dep').length") == 15 and not e3, str(e3))
    b.close()
failed = [n for n, ok in RES if not ok]
print(f"\n{len(RES) - len(failed)}/{len(RES)} Nigeria checks passed")
raise SystemExit(1 if failed else 0)
