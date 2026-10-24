import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
def sheet(p,n=900): return p.inner_text("#overlay .dialog").replace("\n"," | ")[:n]
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(390,844,"m"),(1400,860,"d")]:
        p,errs=page(b,w,h)
        p.evaluate("setMode('nigeria')"); p.wait_for_timeout(900); top=p.evaluate("panel.scrollTop=600, panel.scrollTop")
        p.evaluate("statePanel('Kano')"); p.wait_for_timeout(700)
        if n=="m": print("KANO:", p.inner_text("#panel")[:2600].replace("\n"," | "))
        p.screenshot(path=O+f"st_kano_{n}.png"); p.evaluate("panel.scrollTop=700"); p.wait_for_timeout(150); p.screenshot(path=O+f"st_kano2_{n}.png")
        print(n,"hash",p.evaluate("location.hash"),"VIEW",p.evaluate("VIEW.length"))
        p.click('#panel .back'); p.wait_for_timeout(500); print(n,"after back: mode",p.evaluate("S.mode"),"scroll",p.evaluate("panel.scrollTop"),"(was",top,") hash",p.evaluate("location.hash"))
        if n=="m":
            for s in ["Federal Capital Territory","Bayelsa","Lagos","Borno","Nassarawa"]:
                p.evaluate(f"statePanel('{s}')"); p.wait_for_timeout(250); t=p.inner_text("#panel"); i=t.find("How"); print("---",s,":",t[:260].replace("\n"," | "),"||",t[i:i+700].replace("\n"," | "))
            p.evaluate("compareStates('Kano','Bayelsa')"); p.wait_for_timeout(300); print("CMP:",sheet(p,1300)); p.screenshot(path=O+"st_cmp_m.png")
            p.select_option("#overlay select[data-cmpb]","NGA"); p.wait_for_timeout(300); print("CMP NGA:",sheet(p,500))
            p.evaluate("closeOverlay()"); 
        p.evaluate("ngPovertyMap('poor')"); p.wait_for_timeout(700); p.screenshot(path=O+f"st_poor_{n}.png"); print(n,"bubbles",p.evaluate("document.querySelectorAll('path.ngbubble').length"),"legend",p.inner_text("#legend")[:200].replace("\n"," | "))
        p.select_option("#ngmetric","dep:cooking"); p.wait_for_timeout(500); p.screenshot(path=O+f"st_cook_{n}.png"); print(n,"metric",p.evaluate("S.ngMetric"),p.inner_text("#legend")[-160:].replace("\n"," | "))
        print(n,"errors",[e for e in errs if "ERR_FAILED" not in e],"scrollW",p.evaluate("document.documentElement.scrollWidth"))
    q,e2=page(b,390,844,hash="s/Bayelsa"); q.wait_for_timeout(800); print("ROUTE s/Bayelsa:",q.inner_text("#panel h2"),q.evaluate("S.mode"),e2)
    b.close()
