import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(1400,860,"d"),(390,844,"m")]:
        p,errs=page(b,w,h)
        if n=="d":
            # registry integrity
            print("indicators",p.evaluate("Object.keys(IND).length"),"bad src",p.evaluate("Object.entries(IND).filter(([k,r])=>!SOURCES[r.src]||!KIND[r.kind]||!r.def).map(x=>x[0])"))
            print("freshness",p.evaluate("Object.keys(SOURCES).map(k=>k+':'+freshness(k).k).join(' ')"))
            # values consistent with raw data
            print("NGA", p.evaluate("['pop','median_age','gdp_growth_26','cpi_avg_26','cpi_yoy','oil_share','mig_out','ndgain','mpi_nat','pov_money','income'].map(id=>id+'='+itxt(id,'NGA')).join(' | ')"))
            print("missing stays missing:", p.evaluate("[ival('oil_share','BEN'), ival('cpi_yoy','GHA'), ival('gdp_growth_26','PRK'), itxt('gdp_growth_26','PRK')]"))
            print("state", p.evaluate("[itxt('mpi_h','Sokoto'), itxt('mpi_poor','Kano'), ival('mpi_h','Nassarawa')]"))
        for c,k in [("NGA","566"),("BEN","204"),("PRK","408"),("ARE","784")]:
            p.evaluate(f"selectCountry('{k}',false)"); p.wait_for_timeout(250)
            print(n,c,"rows",p.evaluate("panel.querySelectorAll('.ib').length"),"kind tags",p.evaluate("panel.querySelectorAll('.kt').length"))
        p.evaluate("selectCountry('566',false)"); p.wait_for_timeout(300)
        p.click('#panel [data-ind="cpi_yoy"]'); p.wait_for_timeout(200)
        print(n,"sheet:",p.inner_text("#overlay .dialog").replace("\n"," | ")[:420]); p.screenshot(path=O+f"sheet{n}.png")
        p.click('#overlay [data-dlg="close"]'); p.wait_for_timeout(150); print(n,"closed",p.evaluate("$('#overlay').hidden"))
        p.evaluate("panel.scrollTop=1300"); p.wait_for_timeout(100); p.screenshot(path=O+f"rows{n}.png")
        for v in ["growth26","infl26","oil","gas","migrants","climate","age","growth","wars","minerals","money","ngpov"]:
            p.evaluate(f"setTheme('{v}')"); p.wait_for_timeout(300)
            print(n,v,"| legend:",p.inner_text("#legend").replace("\n"," / ")[:110],"| nodata fills",p.evaluate("G.countries.selectAll('path').filter(function(){return this.style.fill.includes('nodata')}).size()"))
            if v in ("growth26","infl26"): p.screenshot(path=O+f"leg{v}{n}.png")
        p.evaluate("setTheme(null)")
        p.evaluate("setMode('about')"); p.wait_for_timeout(300); print(n,"catalogue cards",p.evaluate("panel.querySelectorAll('.card .chip[data-ind]').length"))
        p.evaluate("setMode('money')"); p.wait_for_timeout(300); t=p.inner_text("#panel"); i=t.find("8. The world economy"); print(n, t[i:i+700].replace("\n"," ") if n=="d" else "")
        p.evaluate("setMode('nigeria')"); p.wait_for_timeout(300); t=p.inner_text("#panel"); i=t.find("Poverty by state"); print(n, t[i:i+600].replace("\n"," ") if n=="d" else "")
        print(n,"errors",[e for e in errs if "ERR_FAILED" not in e and "TUNNEL" not in e],"scrollW",p.evaluate("document.documentElement.scrollWidth"))
    b.close()
