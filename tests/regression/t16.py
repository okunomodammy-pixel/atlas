import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(1400,860,"d"),(390,844,"m")]:
        p,errs=page(b,w,h)
        p.click('[data-act="themes"]'); p.wait_for_timeout(300); print(n,"layers open",not p.evaluate("$('#layers').hidden"))
        for v in ["wars","minerals","age","growth","money"]:
            p.evaluate("toggleLayers(true)"); p.select_option("#themesel", v); p.wait_for_timeout(400)
            print(n,v,"coloured",p.evaluate("G.countries.selectAll('path').filter(function(){return this.style.fill}).size()"),"| legend:",p.inner_text("#legend").split("\n")[0])
            if v in ("wars","minerals"): p.screenshot(path=O+f"th{v}{n}.png")
        p.evaluate("document.querySelector('#legend [data-theme-off]').click()"); p.wait_for_timeout(200)
        print(n,"off:",p.evaluate("S.theme"),p.evaluate("$('#legend').hidden"))
        p.evaluate("setTheme('wars')"); p.wait_for_timeout(200)
        p.evaluate("setMode('about')"); p.wait_for_timeout(300); print(n,"theme cleared on mode change",p.evaluate("S.theme"),"| about toc",p.evaluate("tocH.map(h=>h.textContent)"))
        p.screenshot(path=O+f"about{n}.png")
        print(n,"errors",[e for e in errs if "ERR_FAILED" not in e and "TUNNEL" not in e],"scrollW",p.evaluate("document.documentElement.scrollWidth"))
    b.close()
