import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(1400,860,"d"),(390,844,"m")]:
        p,errs=page(b,w,h)
        p.evaluate("setMode('story')"); p.wait_for_timeout(800)
        for i in range(12):
            p.evaluate(f"storyStop({i})"); p.wait_for_timeout(350)
            if i in (0,1,6,10,11): p.screenshot(path=O+f"s{n}{i}.png")
        print(n,"suez:",p.inner_text("#suezcut"))
        p.click('[data-act="africaDebate"]'); p.wait_for_timeout(400); p.click('[data-act="axes"]'); p.wait_for_timeout(400); p.click('[data-act="barriers"]'); p.wait_for_timeout(900); p.screenshot(path=O+f"s{n}deb.png")
        p.evaluate("setMode('politics')"); p.wait_for_timeout(600)
        for v in ["founders","pop","heart","buffers","cold","nam","income"]:
            p.click(f'[data-act="pol"][data-v="{v}"]'); p.wait_for_timeout(500)
            if v in ("cold","heart"): p.screenshot(path=O+f"p{n}{v}.png")
        for bl in ["UNSC","NATO","EU","AU","ECOWAS","ASEAN","BRICS","SCO","OPEC","NUKE"]:
            p.click(f'#blocchips [data-b="{bl}"]'); p.wait_for_timeout(450)
            if bl in ("AU","BRICS"): p.screenshot(path=O+f"b{n}{bl}.png")
        for g in ["places","blocs"]:
            for sc in ["Africa","World"]:
                p.evaluate("setMode('quiz')"); p.wait_for_timeout(300); p.click(f'[data-act="game"][data-g="{g}"][data-scope="{sc}"]'); p.wait_for_timeout(300)
                for r in range(10): p.click('.opts button >> nth=0'); p.wait_for_timeout(60); p.click('#next'); p.wait_for_timeout(80)
                print(n,g,sc,p.inner_text("#panel .score"))
        p.evaluate("setMode('course')"); p.wait_for_timeout(300); print(n,"lessons",p.evaluate("document.querySelectorAll('.lessons li').length"))
        print(n,"errors",[e for e in errs if "ERR_FAILED" not in e and "TUNNEL" not in e], "scrollW", p.evaluate("document.documentElement.scrollWidth"))
    b.close()
