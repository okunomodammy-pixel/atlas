import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(1400,860,"d"),(390,844,"m")]:
        p,errs=page(b,w,h)
        if n=="d":
            print("gulf g26", p.evaluate("['SAU','ARE','QAT','KWT','BHR','OMN','IRQ'].map(c=>c+':'+(D.now.imf[c]||{}).g26)"))
            print("top migrant share", p.evaluate("Object.values(D.facts).map(f=>{const m=D.now.mig[f.c3];return m&&m.imm&&f.w&&f.w.p2024?[f.c3,Math.round(m.imm/f.w.p2024*100)]:null}).filter(Boolean).sort((a,b)=>b[1]-a[1]).slice(0,8)"))
        for v in ["growth26","infl26","oil","gas","migrants","climate","ngpov"]:
            p.evaluate(f"setTheme('{v}')"); p.wait_for_timeout(500)
            print(n,v,"coloured",p.evaluate("G.countries.selectAll('path').filter(function(){return this.style.fill}).size()"),"states",p.evaluate("G.states.selectAll('path.state').size()"),"|",p.inner_text("#legend").split("\n")[0])
            if v in ("ngpov","climate","growth26"): p.screenshot(path=O+f"now{v}{n}.png")
        p.evaluate("setTheme(null)"); p.wait_for_timeout(200); print(n,"cleared states",p.evaluate("G.states.selectAll('path').size()"))
        p.evaluate("selectCountry('566',false)"); p.wait_for_timeout(300)
        t=p.inner_text("#panel"); i=t.find("Growth"); print(n, t[i:i+900].replace("\n"," | ") if n=="d" else "")
        p.evaluate("panel.scrollTop=1500"); p.wait_for_timeout(100); p.screenshot(path=O+f"nowng{n}.png")
        p.evaluate("setMode('nigeria')"); p.wait_for_timeout(400); p.click('[data-act="ngpov"]'); p.wait_for_timeout(700)
        p.evaluate("document.querySelector('path.state').dispatchEvent(new MouseEvent('click',{bubbles:true}))"); p.wait_for_timeout(200)
        print(n,"state peek:",p.inner_text("#peek").replace("\n"," / ")[:150])
        p.evaluate("setMode('money')"); p.wait_for_timeout(400); print(n,"money toc",p.evaluate("tocH.map(h=>h.textContent).slice(-2)"))
        p.click('[data-act="themeset"][data-v="growth26"]'); p.wait_for_timeout(300)
        bad=[q["id"] for q in p.evaluate("QB.filter(q=>q.l==='money'||q.l==='nigeria')") if p.evaluate("setMode(arguments[0]),0" if False else "0") is None]
        for q in p.evaluate("QB.filter(q=>q.id==='mo7'||q.id==='mo8'||q.id==='ng6')"):
            p.evaluate(f"setMode('{q['l']}')"); p.wait_for_timeout(150)
            print(n,q["id"],"anchor ok",p.evaluate("at=>!![...panel.querySelectorAll('h2,h3,h4,b')].find(e=>e.textContent.trim().startsWith(at))",q["at"]))
        print(n,"errors",[e for e in errs if "ERR_FAILED" not in e and "TUNNEL" not in e],"scrollW",p.evaluate("document.documentElement.scrollWidth"))
    b.close()
