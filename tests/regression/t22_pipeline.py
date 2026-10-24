import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
def sheet(p,n=600): return p.inner_text("#overlay .dialog").replace("\n"," | ")[:n]
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(1400,860,"d"),(390,844,"m")]:
        p,errs=page(b,w,h)
        print(n,"PL_ON",p.evaluate("PL_ON"),"sources",p.evaluate("JSON.stringify({imf:[SOURCES.imfdm.pub,SOURCES.imfdm.checked,SOURCES.imfdm.edition],wb:[SOURCES.wdi.pub,SOURCES.wdi.checked]})"))
        p.evaluate("selectCountry('566',false)"); p.wait_for_timeout(400)
        t=p.inner_text("#panel"); i=t.lower().find("money and economy"); print(n,"PROFILE:",t[i:i+1300].replace("\n"," | ") if n=="d" else "")
        p.evaluate("panel.scrollTop=panel.querySelector('h4:nth-of-type(1)') ? 0 : 0")
        el=p.query_selector('#panel .cv2[data-cmpind="gdp_pc_25"]'); el.scroll_into_view_if_needed(); p.screenshot(path=O+f"pl_profile_{n}.png")
        el.click(); p.wait_for_timeout(400); print(n,"CMP gdp_pc_25:",sheet(p,900)); p.screenshot(path=O+f"pl_cmp_{n}.png")
        p.evaluate("$('#overlay .dialog').scrollTop=400"); p.wait_for_timeout(100); p.screenshot(path=O+f"pl_cmp2_{n}.png")
        print(n,"trend lines",p.evaluate("document.querySelectorAll('#overlay svg.trend line.tm').length"),"proj",p.evaluate("document.querySelectorAll('#overlay svg.trend line.tm.pj').length"))
        p.evaluate("closeOverlay()")
        if n=="d":
            p.evaluate("compareSheet('gdp_growth_25','LBY')"); p.wait_for_timeout(300); print("LBY growth25:",sheet(p,500))
            p.evaluate("closeOverlay(); indSheet('gdp_usd_25')"); p.wait_for_timeout(200); print("ABOUT gdp_usd_25:",sheet(p,1200))
            p.evaluate("closeOverlay(); indSheet('income')"); p.wait_for_timeout(200); print("ABOUT income:",sheet(p,700))
            p.evaluate("closeOverlay(); compareSheet('gdp_pc_wb_25','NGA')"); p.wait_for_timeout(300); print("WB NGA:",sheet(p,500))
            p.evaluate("closeOverlay(); compareSheet('ndgain','NGA')"); p.wait_for_timeout(300); s=sheet(p,3000); i=s.find("Connections"); print("NDGAIN links:",s[i:i+900])
            p.evaluate("closeOverlay(); setTheme('gdppc')"); p.wait_for_timeout(500); print("THEME:",p.inner_text("#legend").replace("\n"," | ")[:400]); p.screenshot(path=O+"pl_theme_d.png")
            p.evaluate("setTheme(null); setMode('politics')"); p.wait_for_timeout(400); p.click('[data-act="pol"][data-v="income"]'); p.wait_for_timeout(500); print("INCOME MAP legend:",p.inner_text("#legend").replace("\n"," | ")[:200]); p.screenshot(path=O+"pl_income_d.png")
            p.evaluate("setMode('about')"); p.wait_for_timeout(300); t=p.inner_text("#panel"); i=t.find("World Economic Outlook database"); print("CATALOGUE:",t[i-20:i+400].replace("\n"," | "))
            print("kind tags NGA:",p.evaluate("['gdp_growth_25','gdp_growth_26','cpi_avg_25','gdp_usd_25','gdp_pc_wb_25','income'].map(id=>id+'='+((IND[id].st&&IND[id].st('NGA'))||IND[id].kind))"))
        print(n,"errors",errs,"scrollW",p.evaluate("document.documentElement.scrollWidth"))
    b.close()
