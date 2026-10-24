import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch(); p,errs=page(b,1400,860)
    for m in ["explore","learn","regions","africa","nigeria","history","borders","geo","tools","quiz","about"]:
        p.evaluate(f"setMode('{m}')"); p.wait_for_timeout(700)
    p.evaluate("setMode('learn')"); p.wait_for_timeout(500); p.click('[data-act="depths"]'); p.wait_for_timeout(900); p.screenshot(path=O+"depth.png")
    p.evaluate("setMode('history')"); p.wait_for_timeout(800)
    for y in ["1783","1945"]: p.click(f'[data-act="era"][data-y="{y}"]'); p.wait_for_timeout(600)
    print("1945 polys:", p.evaluate("document.querySelectorAll('path.hpoly').length"))
    for g in ["capitals","flags","shapes","bigger","north","clues","ruled"]:
        p.evaluate("setMode('quiz')"); p.wait_for_timeout(300); p.click(f'[data-act="game"][data-g="{g}"][data-scope="Africa"]'); p.wait_for_timeout(500)
        for r in range(10): p.click('.opts button >> nth=0'); p.wait_for_timeout(100); p.click('#next'); p.wait_for_timeout(120)
        print(g, p.inner_text("#panel .score"))
    print("errors:", [e for e in errs if "ERR_FAILED" not in e])
    ctx=b.new_context(viewport={"width":390,"height":844}, offline=True); q=ctx.new_page(); e2=[]; q.on("pageerror", lambda e: e2.append(str(e)))
    q.goto("file://"+STANDALONE); q.wait_for_selector("#loading", state="hidden", timeout=30000); q.wait_for_timeout(600)
    q.evaluate("closeOverlay(); setMode('history')"); q.wait_for_timeout(1000)
    print("offline: countries", q.evaluate("document.querySelectorAll('path.country').length"), "hist", q.evaluate("document.querySelectorAll('path.hpoly').length"), "profiles", q.evaluate("Object.keys(PROFILES).length"), "width", q.evaluate("document.documentElement.scrollWidth"), "errors", e2)
    b.close()
