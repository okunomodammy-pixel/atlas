import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
def shot(p,n): p.screenshot(path=O+n+".png")
with sync_playwright() as pw:
    b=pw.chromium.launch(); p,errs=page(b,1400,860)
    # profile
    p.fill("#q","ghana"); p.keyboard.press("Enter"); p.wait_for_timeout(1100); print("profile h3:", p.inner_text("#panel h3")); 
    print("profiles count:", p.evaluate("Object.keys(PROFILES).length"), "missing West Africa:", p.evaluate("Object.values(D.facts).filter(f=>f.sub==='Western Africa'&&f.un&&f.c3!=='NGA'&&!PROFILES[f.c3]).map(f=>f.n)"))
    # borders
    p.click('nav.tabs button[data-mode="borders"]'); p.wait_for_timeout(600)
    for i in range(9):
        p.click(f'[data-act="case"][data-i="{i}"]'); p.wait_for_timeout(950)
        if i in (0,7): shot(p,f"b{i}")
    # geo
    p.click('nav.tabs button[data-mode="geo"]'); p.wait_for_timeout(600)
    p.click('[data-act="choke"][data-i="0"]'); p.wait_for_timeout(900); shot(p,"geo1"); print("choke:", p.inner_text("#chokeinfo")[:60])
    p.click('[data-act="landlocked"]'); p.wait_for_timeout(900); shot(p,"geo2"); print(p.inner_text("#panel h3 + p")[:120])
    p.click('[data-act="bloc2"][data-b="SADC"]'); p.wait_for_timeout(900); print("sadc colored:", p.evaluate("[...document.querySelectorAll('path.country')].filter(e=>e.style.fill.includes('accent')).length"))
    # tools: distance
    p.click('nav.tabs button[data-mode="tools"]'); p.wait_for_timeout(600)
    p.click('[data-act="distStart"]'); p.mouse.click(400,500); p.wait_for_timeout(200); p.mouse.click(700,300); p.wait_for_timeout(600)
    print("dist:", p.inner_text("#toolout")[:140].replace("\n"," | ")); shot(p,"t1")
    p.click('[data-act="toMercator"]'); p.wait_for_timeout(500)
    p.click('[data-act="trueSize"][data-c="GRL"]'); p.wait_for_timeout(600); p.mouse.click(450,470); p.wait_for_timeout(700); shot(p,"t2")
    print("ghost paths:", p.evaluate("document.querySelectorAll('.ghostshape').length"))
    # games
    for g in ["capitals","flags","shapes","bigger","north"]:
        p.click('nav.tabs button[data-mode="quiz"]'); p.wait_for_timeout(400)
        p.click(f'[data-act="game"][data-g="{g}"][data-scope="Africa"]'); p.wait_for_timeout(700)
        for r in range(10):
            p.click('.opts button >> nth=0'); p.wait_for_timeout(150); p.click('#next'); p.wait_for_timeout(200)
        print(g, "->", p.inner_text("#panel .score"))
        if g=="shapes":
            p.click('[data-act="game"][data-g="shapes"]'); p.wait_for_timeout(600); shot(p,"gshape")
    p.click('nav.tabs button[data-mode="quiz"]'); p.wait_for_timeout(400); p.click('[data-act="qstates"]'); p.wait_for_timeout(1300); shot(p,"gstates")
    nm=p.evaluate("document.querySelector('#banner').textContent.replace('Tap: ','')"); print("state q:", nm)
    p.evaluate("""n=>{const ps=[...document.querySelectorAll('path.state')]; const t=ps.find(e=>{const d=d3.select(e).datum(); return stName(d.properties.name)===n}); t.dispatchEvent(new MouseEvent('click',{bubbles:true}))}""", nm)
    p.wait_for_timeout(300); print("state banner:", p.inner_text("#banner"))
    print("errors:", [e for e in errs if "ERR_FAILED" not in e])
    p2,e2=page(b,390,844,"borders"); p2.screenshot(path=O+"mb.png"); print("mobile width:", p2.evaluate("document.documentElement.scrollWidth"), [e for e in e2 if "ERR_FAILED" not in e])
    b.close()
