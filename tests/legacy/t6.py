import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch(); p,errs=page(b,1400,860)
    print("profiles:", p.evaluate("Object.keys(PROFILES).length"), "African UN without profile:", p.evaluate("Object.values(D.facts).filter(f=>f.reg==='Africa'&&f.un&&f.c3!=='NGA'&&!PROFILES[f.c3]).map(f=>f.n)"))
    p.fill("#q","dr congo"); p.keyboard.press("Enter"); p.wait_for_timeout(1000); print(p.inner_text("#panel h2"), "|", p.inner_text("#panel .mm p")[:80])
    p.click('nav.tabs button[data-mode="learn"]'); p.wait_for_timeout(600); p.click('[data-act="tzshow"]'); p.wait_for_timeout(900); p.screenshot(path=O+"tz.png")
    print("tz paths:", p.evaluate("document.querySelectorAll('path.tzz').length"))
    p.click('nav.tabs button[data-mode="quiz"]'); p.wait_for_timeout(400); p.click('[data-act="game"][data-g="clues"]'); p.wait_for_timeout(700); p.screenshot(path=O+"clue.png")
    leaks=0
    for r in range(10):
        q=p.inner_text("#panel .q"); ans=p.evaluate("()=>{const b=[...document.querySelectorAll('.opts button')]; return b.map(x=>x.textContent)}")
        p.click('.opts button >> nth=0'); p.wait_for_timeout(120); right=p.inner_text(".opts .right")
        if right in q: leaks+=1; print("LEAK:", right)
        p.click('#next'); p.wait_for_timeout(150)
    print("clue leaks:", leaks, p.inner_text("#panel .score"))
    print("errors:", [e for e in errs if "ERR_FAILED" not in e])
    # standalone offline: block all network
    ctx=b.new_context(viewport={"width":390,"height":844}, offline=True); q=ctx.new_page(); e2=[]; q.on("pageerror", lambda e: e2.append(str(e)))
    q.goto("file://"+STANDALONE); q.wait_for_selector("#loading", state="hidden", timeout=20000); q.wait_for_timeout(800)
    print("offline countries:", q.evaluate("document.querySelectorAll('path.country').length"), "errors:", e2); q.screenshot(path=O+"offline.png")
    b.close()
