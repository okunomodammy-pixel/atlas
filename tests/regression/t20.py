import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
def sheet(p,n=260): return p.inner_text("#overlay .dialog").replace("\n"," | ")[:n]
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(1400,860,"d"),(390,844,"m")]:
        p,errs=page(b,w,h)
        if n=="d":
            print("eligible rank:",p.evaluate("Object.keys(CMP).filter(k=>CMP[k].rank).join(',')"))
            print("no-rank compare:",p.evaluate("Object.keys(CMP).filter(k=>!CMP[k].rank).join(',')"))
            print("not compared:",p.evaluate("Object.keys(IND).filter(k=>!CMP[k]).join(',')"))
            print("links:",p.evaluate("LINKS.map(L=>L.a+'~'+L.b+':'+L.type+(L.type==='association'?' rho='+(spearman(L.a,L.b).rho||0).toFixed(2)+' n='+spearman(L.a,L.b).n:'')).join(' ; ')"))
        p.evaluate("selectCountry('566',false)"); p.wait_for_timeout(300)
        print(n,"clickable figures:",p.evaluate("panel.querySelectorAll('.cv2').length"),"| not clickable cpi_yoy:",p.evaluate("!panel.querySelector('[data-cmpind=cpi_yoy]')"))
        for ind in ["median_age","gdp_growth_26","oil_out","ndgain","mpi_nat","war","mig_out"]:
            el=p.query_selector(f'#panel .cv2[data-cmpind="{ind}"]')
            if not el: print(n,ind,"NOT ON PAGE"); continue
            el.click(); p.wait_for_timeout(250)
            if n=="d": print("  ",ind,"->",sheet(p,330))
            if ind in ("gdp_growth_26","oil_share") : p.screenshot(path=O+f"cmp_{ind}_{n}.png")
            p.evaluate("closeOverlay()"); p.wait_for_timeout(100)
        # missing value country and no-rank indicator
        p.evaluate("compareSheet('gdp_growth_26','PRK')"); p.wait_for_timeout(200); print(n,"PRK growth:",sheet(p,200))
        p.evaluate("compareSheet('oil_share','BEN')"); p.wait_for_timeout(200); print(n,"BEN oil:",sheet(p,200))
        p.evaluate("compareSheet('unemp_26','ZAF')"); p.wait_for_timeout(200); print(n,"ZAF unemp:",sheet(p,330))
        p.evaluate("compareSheet('mig_share','ARE')"); p.wait_for_timeout(200); print(n,"ARE mig:",sheet(p,200))
        p.evaluate("closeOverlay()")
        # walk to neighbour from the sheet
        p.evaluate("selectCountry('566',false)"); p.wait_for_timeout(300)
        p.click('#panel .cv2[data-cmpind="median_age"]'); p.wait_for_timeout(250)
        p.click('#overlay tr.click >> nth=0'); p.wait_for_timeout(900)
        print(n,"walked: panel",p.inner_text("#panel h2"),"| sheet for",p.inner_text("#overlay .eyebrow"),p.evaluate("!$('#overlay').hidden"))
        p.evaluate("closeOverlay()")
        # learn link and return
        p.evaluate("selectCountry('566',false)"); p.wait_for_timeout(300); p.evaluate("panel.scrollTop=900"); s0=p.evaluate("panel.scrollTop")
        p.click('#panel .cv2[data-cmpind="gdp_growth_26"]'); p.wait_for_timeout(250)
        p.click('#overlay [data-learn] >> nth=0'); p.wait_for_timeout(900)
        print(n,"lesson:",p.evaluate("S.mode"),"| toc:",p.inner_text("#toccur"),"| back btn:",p.inner_text("#panel .retbtn"))
        p.screenshot(path=O+f"learn{n}.png")
        p.click("#panel .retbtn"); p.wait_for_timeout(900)
        print(n,"returned:",p.evaluate("S.mode"),p.inner_text("#panel h2"),"scroll",s0,p.evaluate("panel.scrollTop"))
        # browser back from lesson
        p.click('#panel .cv2[data-cmpind="cpi_avg_26"]'); p.wait_for_timeout(250); p.click('#overlay [data-learn] >> nth=0'); p.wait_for_timeout(800)
        p.go_back(); p.wait_for_timeout(900); print(n,"browser back:",p.evaluate("S.mode"),p.inner_text("#panel h2"))
        # map from sheet
        p.click('#panel .cv2[data-cmpind="ndgain"]'); p.wait_for_timeout(250); p.click('#overlay [data-cmpmap]'); p.wait_for_timeout(400)
        print(n,"show on map theme:",p.evaluate("S.theme"),"overlay hidden",p.evaluate("$('#overlay').hidden"))
        p.evaluate("setTheme(null)")
        # state compare from peek
        p.evaluate("setMode('nigeria')"); p.wait_for_timeout(300); p.click('[data-act="ngpov"]'); p.wait_for_timeout(500)
        p.evaluate("document.querySelectorAll('path.state')[5].dispatchEvent(new MouseEvent('click',{bubbles:true}))"); p.wait_for_timeout(200)
        p.click('#peek [data-statecmp]'); p.wait_for_timeout(250); print(n,"state sheet:",sheet(p,420)); p.screenshot(path=O+f"statecmp{n}.png")
        p.click('#overlay [data-learn] >> nth=0'); p.wait_for_timeout(900); print(n,"state learn ->",p.evaluate("S.mode"),"| back:",p.inner_text("#panel .retbtn") if p.query_selector("#panel .retbtn") else "none")
        if p.query_selector("#panel .retbtn"): p.click("#panel .retbtn"); p.wait_for_timeout(700); print(n,"state return mode",p.evaluate("S.mode"),"sheet reopened",p.evaluate("!$('#overlay').hidden"),p.inner_text("#overlay .eyebrow") if p.query_selector("#overlay .eyebrow") else ""); p.evaluate("closeOverlay()")
        # stack mode: profile on lesson -> compare -> walk
        p.evaluate("setMode('politics')"); p.wait_for_timeout(300); p.evaluate("openProfile('566')"); p.wait_for_timeout(500)
        p.click('#panel .cv2[data-cmpind="median_age"]'); p.wait_for_timeout(250); p.click('#overlay tr.click >> nth=1'); p.wait_for_timeout(900)
        print(n,"stack walk: mode",p.evaluate("S.mode"),"panel",p.inner_text("#panel h2"),"stack",p.evaluate("VIEW.length"))
        p.evaluate("closeOverlay()")
        print(n,"errors",[e for e in errs if "ERR_FAILED" not in e and "TUNNEL" not in e],"scrollW",p.evaluate("document.documentElement.scrollWidth"))
    b.close()
