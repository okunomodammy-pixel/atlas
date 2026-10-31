import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(1400,860,"d"),(390,844,"m")]:
        p,errs=page(b,w,h)
        p.evaluate("showWelcome(true)"); p.wait_for_timeout(200); p.screenshot(path=O+f"ic_welcome{n}.png"); p.evaluate("closeOverlay()")
        p.evaluate("panel.scrollTop=300"); p.wait_for_timeout(100); p.screenshot(path=O+f"ic_home{n}.png")
        p.evaluate("saved.checks.learn=DAY()"); p.evaluate("setMode('course')"); p.wait_for_timeout(300); p.screenshot(path=O+f"ic_course{n}.png")
        p.evaluate("setMode('politics')"); p.wait_for_timeout(300); p.evaluate("showPeek('566')"); p.wait_for_timeout(200); p.click('#peek [data-peek="open"]'); p.wait_for_timeout(600); p.screenshot(path=O+f"ic_prof{n}.png")
        print(n,"errors",[e for e in errs if "ERR_FAILED" not in e and "TUNNEL" not in e],"scrollW",p.evaluate("document.documentElement.scrollWidth"))
    b.close()
