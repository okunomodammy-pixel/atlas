"""Regression check with pass/fail assertions. Run after `python3 build/dist.py`:

    python3 tests/smoke.py

Exits non-zero if any check fails. Covers: loading without script errors, every mode and
lesson, a country profile and its compare sheets, links by URL, phone navigation and layout,
all map themes, the history map, every quiz game, a lesson check with spaced review, and the
standalone file working offline with no network at all.
"""
import os, json, re
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "harness.py")).read())
RESULTS = []
def check(name, ok, detail=""):
    RESULTS.append((name, bool(ok), detail)); print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail else ""))
def real(errs): return [e for e in errs if "ERR_FAILED" not in e and "net::" not in e]

MODES = ["explore","course","learn","regions","africa","nigeria","ngstory","story","history","borders","geo","politics","money","tools","quiz","about"]

def play_game(p, g, scope, rounds=10):   # a game is 10 questions, then the score
    p.evaluate("setMode('quiz')"); p.wait_for_timeout(250)
    p.click(f'[data-act="game"][data-g="{g}"][data-scope="{scope}"]'); p.wait_for_timeout(350)
    for _ in range(rounds):
        if not p.query_selector("#panel .opts button"): break
        p.click("#panel .opts button >> nth=0"); p.wait_for_timeout(80)
        nx = p.query_selector("#next")
        if nx: nx.click(); p.wait_for_timeout(100)
    return p.evaluate("(document.querySelector('#panel .score')||{}).textContent||''")

with sync_playwright() as pw:
    b = pw.chromium.launch()
    for w, h, tag in [(1400, 860, "desktop"), (390, 844, "phone")]:
        p, errs = page(b, w, h)
        check(f"{tag}: map draws countries", p.evaluate("document.querySelectorAll('path.country').length") > 200,
              str(p.evaluate("document.querySelectorAll('path.country').length")))
        check(f"{tag}: data loaded", p.evaluate("Object.keys(D.facts).length===250 && !!D.now && !!D.now.imf.NGA && Object.keys(PROFILES).length>150"))
        empty = []
        for m in MODES:
            p.evaluate(f"setMode('{m}')"); p.wait_for_timeout(300)
            if len(p.inner_text("#panel").strip()) < 40: empty.append(m)
        check(f"{tag}: all {len(MODES)} modes open with content", not empty, ",".join(empty))
        # country profile
        p.evaluate("setMode('explore'); selectCountry('566', false)"); p.wait_for_timeout(500)
        h2 = p.inner_text("#panel h2")
        check(f"{tag}: Nigeria profile", "Nigeria" in h2, h2)
        n_fig = p.evaluate("panel.querySelectorAll('.cv2').length")
        check(f"{tag}: profile figures open comparisons", n_fig >= 5, f"{n_fig} figures")
        p.click('#panel .cv2[data-cmpind="gdp_growth_26"]'); p.wait_for_timeout(300)
        sheet = p.inner_text("#overlay .dialog") if p.query_selector("#overlay .dialog") else ""
        check(f"{tag}: growth comparison sheet", "Nigeria" in sheet and "%" in sheet, sheet[:80].replace("\n", " "))
        p.evaluate("closeOverlay()")
        # phone layout
        if tag == "phone":
            sw = p.evaluate("document.documentElement.scrollWidth")
            check("phone: no sideways scrolling", sw <= 390, f"scrollWidth {sw}")
            moved = []
            for nav, m in [("learn", "course"), ("quiz", "quiz"), ("tools", "tools"), ("about", "about"), ("explore", "explore")]:
                btn = p.query_selector(f'nav.primary [data-nav="{nav}"]')
                if not btn or not btn.is_visible(): moved.append(nav + "(no visible button)"); continue
                btn.click(); p.wait_for_timeout(350); p.evaluate("closeOverlay()")
                if p.evaluate("S.mode") != m: moved.append(f"{nav}->{p.evaluate('S.mode')}")
            check("phone: bottom navigation reaches each section", not moved, ",".join(moved))
        # themes
        opts = p.evaluate("[...document.querySelectorAll('#themesel option')].map(o=>o.value).filter(Boolean)")
        bad = []
        for v in opts:
            p.evaluate(f"setTheme('{v}')"); p.wait_for_timeout(250)
            if not p.inner_text("#legend").strip(): bad.append(v)
        p.evaluate("setTheme(null)")
        check(f"{tag}: all {len(opts)} map themes show a legend", opts and not bad, ",".join(bad))
        # history
        p.evaluate("setMode('history')"); p.wait_for_timeout(500)
        p.click('[data-act="era"][data-y="1945"]'); p.wait_for_timeout(600)
        hp = p.evaluate("document.querySelectorAll('path.hpoly').length")
        check(f"{tag}: history map 1945", hp > 50, f"{hp} shapes")
        # games
        if tag == "desktop":
            games = p.evaluate("Object.entries(GAMES).map(([id,g])=>[id, g.single?'World':'Africa'])")
            bad = []
            for g, sc in games:
                s = play_game(p, g, sc)
                if not re.search(r"\d", s): bad.append(g)
            check(f"desktop: all {len(games)} quiz games play and score", not bad, ",".join(bad))
            # lesson check + spaced review
            p.evaluate("localStorage.clear(); store.lastRaw=null; store.conflict=false")
            p.evaluate("setMode('politics')"); p.wait_for_timeout(400)
            p.click('#checkcard [data-act="check"]'); p.wait_for_timeout(300)
            for _ in range(6):
                if not p.query_selector("#panel .q"): break
                a = p.evaluate("(()=>{const t=document.querySelector('#panel .q').textContent;return QB.find(x=>x.q===t).a})()")
                p.click(f'.opts [data-j="{a}"]'); p.wait_for_timeout(80); p.click("#nextq"); p.wait_for_timeout(120)
            check("desktop: passing a lesson check records a pass without claiming delayed recall", p.evaluate("saved.checks.politics != null && !remembered('politics')"))
            bad_at = []
            for q in p.evaluate("QB.filter(q => typeof q.at === 'string').map(q => ({id: q.id, l: q.l, at: q.at}))"):
                p.evaluate(f"setMode('{q['l']}')"); p.wait_for_timeout(60)
                if not p.evaluate("at => [...panel.querySelectorAll('h2, h3, h4, .case b, b')].some(e => e.textContent.trim().startsWith(at) || e.textContent.includes(at))", q["at"]): bad_at.append(q["id"])
            check("desktop: every lesson-check 'Re-read' link finds its section", not bad_at, ",".join(bad_at))
            p.evaluate("localStorage.clear(); store.lastRaw=null; store.conflict=false; setMode('nigeria')"); p.wait_for_timeout(300)
            p.click('#checkcard [data-act="check"]'); p.wait_for_timeout(300)
            a = p.evaluate("(() => { const t = document.querySelector('#panel .q').textContent; const q = QB.find(x => x.q === t); return q.a; })()")
            p.click(f'.opts button:not([data-j="{a}"]) >> nth=0'); p.wait_for_timeout(150); wtxt = p.inner_text("#why")
            check("desktop: a wrong lesson-check answer names the choice and offers to re-read", "You chose" in wtxt and "Re-read" in wtxt, wtxt[:160])
            p.evaluate("Object.values(saved.srs).forEach(r=>r.d-=30)")
            p.evaluate("setMode('course')"); p.wait_for_timeout(300)
            check("desktop: answered questions come back for review", p.evaluate("dueItems().length>0 && !!panel.querySelector('[data-act=review]')"),
                  str(p.evaluate("dueItems().length")) + " due")
        # from "About this figure" back to the comparison it was opened from; tied values share a rank
        p.evaluate("closeOverlay(); compareSheet('median_age','NGA')"); p.wait_for_timeout(150)
        p.evaluate("document.querySelector('#overlay [data-ind=median_age]').click()"); p.wait_for_timeout(150)
        okb = bool(p.query_selector("#overlay [data-sheetback]"))
        if okb: p.evaluate("document.querySelector('#overlay [data-sheetback]').click()"); p.wait_for_timeout(150)
        check(f"{tag}: About this figure leads back to its comparison", okb and p.evaluate("!!document.querySelector('#overlay .dialog.cmp svg.strip')"))
        tie = p.evaluate("(() => { for (const id of Object.keys(CMP).filter(k => CMP[k].rank)) { const s = setOf(id), m = new Map(); s.forEach(x => m.set(x.v, (m.get(x.v) || []).concat(x.c))); const t = [...m.values()].find(a => a.length > 1); if (t) return [id, t[0]]; } return null; })()")
        if tie:
            p.evaluate(f"closeOverlay(); compareSheet('{tie[0]}', '{tie[1]}')"); p.wait_for_timeout(150)
            check(f"{tag}: tied values share a rank ('Joint ...')", "Joint " in p.inner_text("#overlay .dialog"), str(tie))
        p.evaluate("closeOverlay()")
        # compare two countries: opened from the profile, values match the registry, fits the screen
        p.evaluate("setMode('explore'); selectCountry(byC3.get('NGA'), true)"); p.wait_for_timeout(300)
        p.click("#panel [data-act=vs]"); p.wait_for_timeout(300)
        rows = p.evaluate("document.querySelectorAll('#overlay .vsr').length")
        pop_ok = p.evaluate("(() => { const r = [...document.querySelectorAll('#overlay .vsr')].find(x => x.querySelector('[data-ind=pop]')); return !!r && r.innerText.includes(IND.pop.f(ival('pop','NGA'))); })()")
        fits = p.evaluate("$('#overlay .dialog').scrollWidth <= $('#overlay .dialog').clientWidth + 1")
        check(f"{tag}: compare two countries opens from the profile, with registry values", rows >= 12 and pop_ok and fits, f"rows={rows} pop={pop_ok} fits={fits}")
        p.evaluate("closeOverlay()")
        # links by URL
        q, e2 = page(b, w, h, hash="c/NGA")
        check(f"{tag}: link #c/NGA opens Nigeria", "Nigeria" in q.inner_text("#panel h2"))
        q2, e4 = page(b, w, h); q2.goto("http://127.0.0.1:8765/_t.html#vs/KEN/TZA"); q2.wait_for_selector("#loading", state="hidden", timeout=20000); q2.wait_for_timeout(1200)
        check(f"{tag}: link #vs/KEN/TZA opens the comparison", "Kenya" in q2.evaluate("(document.querySelector('#overlay h2') || {}).textContent || ''") and "Tanzania" in q2.evaluate("(document.querySelector('#overlay h2') || {}).textContent || ''"))
        errs += e4
        check(f"{tag}: no script errors", not real(errs) and not real(e2), "; ".join(real(errs) + real(e2))[:200])
    # offline: standalone file with the network switched off
    ctx = b.new_context(viewport={"width": 390, "height": 844}, offline=True)
    q = ctx.new_page(); e3 = []; net = []
    q.on("pageerror", lambda e: e3.append(str(e)))
    q.on("request", lambda r: (not r.url.startswith(("file:", "data:", "blob:"))) and net.append(r.url))
    q.goto("file://" + STANDALONE); q.wait_for_selector("#loading", state="hidden", timeout=30000); q.wait_for_timeout(800)
    q.evaluate("closeOverlay()")
    empty = []
    for m in MODES:
        q.evaluate(f"setMode('{m}')"); q.wait_for_timeout(200)
        if len(q.inner_text("#panel").strip()) < 40: empty.append(m)
    q.evaluate("setMode('explore'); selectCountry('566', false)"); q.wait_for_timeout(300)
    check("offline: standalone opens with no network", q.evaluate("document.querySelectorAll('path.country').length") > 200 and not empty, ",".join(empty))
    check("offline: Nigeria profile works", "Nigeria" in q.inner_text("#panel h2"))
    check("offline: game plays", bool(re.search(r"\d", play_game(q, "capitals", "Africa"))))
    check("offline: no script errors", not e3, "; ".join(e3)[:200])
    check("offline: only fonts are requested from the web", all("fonts.g" in u for u in net), ", ".join(sorted(set(u.split('/')[2] for u in net))))
    b.close()
failed = [r for r in RESULTS if not r[1]]
print(f"\n{len(RESULTS)-len(failed)}/{len(RESULTS)} checks passed")
json.dump([{"check": n, "pass": ok, "detail": d} for n, ok, d in RESULTS], open(os.path.join(OUT, "smoke.json"), "w"), indent=1)
raise SystemExit(1 if failed else 0)
