import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch()
    p,errs=page(b,1400,860,"nigeria"); p.screenshot(path=O+"n1.png")
    p.click('[data-act="zone"][data-z="South West"]'); p.wait_for_timeout(1200); p.screenshot(path=O+"n2.png")
    # globe
    p.click('nav.tabs button[data-mode="explore"]'); p.wait_for_timeout(600)
    p.select_option("#proj","globe"); p.wait_for_timeout(800)
    p.mouse.move(500,450); p.mouse.down(); p.mouse.move(300,400,steps=8); p.mouse.up(); p.wait_for_timeout(500)
    p.fill("#q","japan"); p.wait_for_timeout(200); p.keyboard.press("Enter"); p.wait_for_timeout(1500); p.screenshot(path=O+"g1.png")
    print("globe panel:", p.inner_text("#panel h2"))
    # learn: mercator & route
    p.select_option("#proj","equal"); p.click('nav.tabs button[data-mode="learn"]'); p.wait_for_timeout(800)
    p.click('[data-act="mercator"]'); p.wait_for_timeout(900); p.screenshot(path=O+"l1.png")
    p.click('tr[data-name="Beijing"]'); p.wait_for_timeout(1200); p.screenshot(path=O+"l2.png")
    # quiz location: answer by evaluating correct key
    p.click('nav.tabs button[data-mode="quiz"]'); p.wait_for_timeout(500)
    p.click('[data-act="qloc"][data-scope="Africa"]'); p.wait_for_timeout(1200)
    q=p.inner_text("#panel .q"); print("quiz q:", q)
    name=q.replace("Where is ","").rstrip("?")
    # click the right country path via title
    k=p.evaluate("n=>{for(const [k,f] of Object.entries(D.facts)) if(f.n===n) return k}", name)
    p.evaluate("k=>document.querySelector(`path.country[data-k=\"${k}\"]`).dispatchEvent(new MouseEvent('click',{bubbles:true}))", k)
    p.wait_for_timeout(300); print("banner:", p.inner_text("#banner")); p.screenshot(path=O+"q1.png")
    p.wait_for_timeout(1200); print("score now:", p.inner_text("#panel .score"))
    # neighbour
    p.click('nav.tabs button[data-mode="quiz"]'); p.wait_for_timeout(400); p.click('[data-act="qnb"]'); p.wait_for_timeout(1200)
    p.click('[data-act="qnbcheck"]'); p.wait_for_timeout(500); print("nb result:", p.inner_text("#panel .score"))
    p.click('[data-mode-go="quiz"]'); p.wait_for_timeout(300); p.click('[data-act="qmc"]'); p.wait_for_timeout(300)
    p.click('.opts button >> nth=0'); p.wait_for_timeout(200); print("mc:", p.inner_text("#why")[:80])
    # regions
    p.click('nav.tabs button[data-mode="regions"]'); p.wait_for_timeout(800); p.click('details[data-cont="Asia"] summary'); p.wait_for_timeout(1200); p.screenshot(path=O+"r1.png")
    print("errors:", [e for e in errs if "ERR_FAILED" not in e])
    # mobile + dark
    p2,e2=page(b,390,844,"africa",dark=True); p2.screenshot(path=O+"mob1.png", full_page=False)
    print("mobile scrollWidth:", p2.evaluate("document.documentElement.scrollWidth"))
    p2.fill("#q","lagos"); p2.wait_for_timeout(200); p2.screenshot(path=O+"mob2.png")
    p2.keyboard.press("Enter"); p2.wait_for_timeout(1300); p2.screenshot(path=O+"mob3.png", full_page=True)
    print("mobile errors:", [e for e in e2 if "ERR_FAILED" not in e])
    b.close()
