import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
with sync_playwright() as pw:
    b=pw.chromium.launch(); p,errs=page(b,1400,860)
    print("profiles:", p.evaluate("Object.keys(PROFILES).length"))
    print("Asia missing:", p.evaluate("Object.values(D.facts).filter(f=>(f.reg==='Asia'||f.reg==='Europe')&&(f.un||f.obs||f.c3==='TWN'||f.c3==='UNK')&&!PROFILES[f.c3]).map(f=>f.n)"))
    print("bad keys:", p.evaluate("Object.keys(PROFILES).filter(c=>!byC3.has(c))"))
    for q in ["germany","kosovo","vatican","russia"]:
        p.fill("#q",q); p.keyboard.press("Enter"); p.wait_for_timeout(900); print(q, "->", p.inner_text("#panel h2"), "|", "Profile" in p.inner_text("#panel"))
    p.click('nav.tabs button[data-mode="quiz"]'); p.wait_for_timeout(300); p.click('[data-act="game"][data-g="clues"][data-scope="World"]'); p.wait_for_timeout(500)
    leaks=0
    for r in range(10):
        q=p.inner_text("#panel .q"); p.click('.opts button >> nth=0'); p.wait_for_timeout(100); right=p.inner_text(".opts .right")
        if right in q: leaks+=1; print("LEAK:", right, "|", q[:200])
        p.click('#next'); p.wait_for_timeout(120)
    print("leaks", leaks, "errors:", [e for e in errs if "ERR_FAILED" not in e])
