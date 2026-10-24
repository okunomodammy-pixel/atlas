import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch(); p,errs=page(b,1400,860)
    p.click('nav.tabs button[data-mode="history"]'); p.wait_for_timeout(1500); p.screenshot(path=O+"h1914.png")
    print("hist polys:", p.evaluate("document.querySelectorAll('path.hpoly').length"))
    for y in ["200","1500","1815","1880","1938","1960","1994","now"]:
        p.click(f'[data-act="era"][data-y="{y}"]'); p.wait_for_timeout(500)
        if y in ("200","1880"): p.click('[data-act="eraWorld"]') if y=="200" else None; p.wait_for_timeout(800); p.screenshot(path=O+f"h{y}.png")
    p.click('[data-act="era"][data-y="1960"]'); p.wait_for_timeout(500)
    p.evaluate("document.querySelector('path.hpoly').dispatchEvent(new MouseEvent('click',{bubbles:true}))"); p.wait_for_timeout(200); print("info:", p.inner_text("#erainfo")[:100])
    p.click('[data-act="game"][data-g="ruled"]'); p.wait_for_timeout(600)
    for r in range(10):
        p.click('.opts button >> nth=0'); p.wait_for_timeout(150); p.click('#next'); p.wait_for_timeout(150)
    print("ruled:", p.inner_text("#panel .score"))
    for q in ["greenland","antarctica","western sahara","hong kong"]:
        p.fill("#q",q); p.keyboard.press("Enter"); p.wait_for_timeout(900); t=p.inner_text("#panel"); print(q, "->", p.inner_text("#panel h2"), "| profile:", "MEMORY AID" in t.upper())
    print("errors:", [e for e in errs if "ERR_FAILED" not in e])
    p2,e2=page(b,390,844,"history"); p2.screenshot(path=O+"hmob.png"); print("mobile:", p2.evaluate("document.documentElement.scrollWidth"), [e for e in e2 if "ERR_FAILED" not in e])
