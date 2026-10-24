import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(1400,860,"d"),(390,844,"m")]:
        p,errs=page(b,w,h)
        print(n,"NGA pop",p.evaluate("byKey.get('566').pop"), p.evaluate("byKey.get('566').popY"))
        p.evaluate("selectCountry('566',true)"); p.wait_for_timeout(900); p.screenshot(path=O+f"c{n}.png", full_page=False)
        p.evaluate("panel.scrollTop=700"); p.wait_for_timeout(200); p.screenshot(path=O+f"c{n}2.png")
        p.evaluate("setMode('ngstory')"); p.wait_for_timeout(800)
        for i in range(9):
            p.evaluate(f"ngStop({i})"); p.wait_for_timeout(500)
            if i in (4,6,8): p.screenshot(path=O+f"ng{n}{i}.png")
        p.click('[data-act="ngdebate"]'); p.wait_for_timeout(500)
        for y in ["1914","1954","1963","1967","1976","1996"]:
            p.click(f'#ngyears [data-y="{y}"]'); p.wait_for_timeout(350)
        p.screenshot(path=O+f"ngy{n}.png")
        p.evaluate("setMode('politics')"); p.wait_for_timeout(500)
        for v in ["pop","age","growth"]: p.click(f'[data-act="pol"][data-v="{v}"]'); p.wait_for_timeout(450)
        p.screenshot(path=O+f"growth{n}.png"); print(n, p.inner_text("#demonote"))
        for v in ["circles","liberation","ecomog","bakassi"]: p.click(f'[data-act="ngfp"][data-v="{v}"]'); p.wait_for_timeout(450)
        p.screenshot(path=O+f"bak{n}.png")
        p.evaluate("setMode('quiz')"); p.wait_for_timeout(300); p.click('[data-act="game"][data-g="concepts"]'); p.wait_for_timeout(300)
        for r in range(10): p.click('.opts button >> nth=0'); p.wait_for_timeout(60); p.click('#next'); p.wait_for_timeout(80)
        print(n,"concepts",p.inner_text("#panel .score"))
        p.evaluate("setMode('course')"); p.wait_for_timeout(300); print(n,"lessons",p.evaluate("document.querySelectorAll('.lessons li').length"))
        print(n,"errors",[e for e in errs if "ERR_FAILED" not in e and "TUNNEL" not in e], "scrollW", p.evaluate("document.documentElement.scrollWidth"))
    b.close()
