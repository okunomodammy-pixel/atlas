import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
def sheet(p,n=2400): return p.inner_text("#overlay .dialog").replace("\n"," | ")[:n]
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(390,844,"m"),(1400,860,"d")]:
        p,errs=page(b,w,h)
        p.evaluate("selectCountry(byC3.get('NGA'), true)"); p.wait_for_timeout(600)
        p.click('#panel [data-act=vs]'); p.wait_for_timeout(500)
        if n=="m": print("NGA vs default:", sheet(p))
        p.screenshot(path=O+f"vs_nga_{n}.png")
        print(n,"partner",p.evaluate("document.querySelector('#overlay select[data-vsb]').value"),"rows",p.evaluate("document.querySelectorAll('#overlay .vst tbody tr:not(.vsg)').length"))
        p.select_option('#overlay select[data-vsb]','GBR'); p.wait_for_timeout(300)
        if n=="m": print("NGA vs GBR:", sheet(p,1400))
        p.click('#overlay [data-vsswap]'); p.wait_for_timeout(300); print(n,"swapped a=",p.evaluate("document.querySelector('#overlay select[data-vsa]').value"))
        p.click('#overlay .vst [data-ind=gdp_pc_25]'); p.wait_for_timeout(300)
        print(n,"back btn",p.evaluate("!!document.querySelector('#overlay [data-sheetback]')")); p.click('#overlay [data-sheetback]'); p.wait_for_timeout(300)
        print(n,"back to vs",p.evaluate("!!document.querySelector('#overlay .dialog.vs')"))
        for c in ["JAM","FJI","ISL","KOR","PSE","XKX","UNK"]:
            p.evaluate(f"compareCountries('{c}')"); print(n,c,"->",p.evaluate("(document.querySelector('#overlay select[data-vsb]')||{}).value"))
        p.click('#overlay [data-vsopen]'); p.wait_for_timeout(400); print(n,"open ->",p.evaluate("S.sel"),p.evaluate("$('#overlay').hidden"))
        sw=p.evaluate("document.documentElement.scrollWidth"); print(n,"scrollWidth",sw)
        print(n,"errors",errs)
    p,errs=page(b,390,844,"vs/KEN/TZA"); p.goto("http://127.0.0.1:8765/_t.html#vs/KEN/TZA"); p.wait_for_selector("#loading", state="hidden"); p.wait_for_timeout(1400)
    print("route:", p.evaluate("(document.querySelector('#overlay h2')||{}).textContent"), errs)
