import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
with sync_playwright() as pw:
    b=pw.chromium.launch(); p,errs=page(b,390,844)
    p.evaluate("selectCountry('566',false)"); p.wait_for_timeout(300); p.evaluate("panel.scrollTop=900"); p.wait_for_timeout(100)
    print("s0",p.evaluate("panel.scrollTop"), "max", p.evaluate("panel.scrollHeight-panel.clientHeight"))
    p.click('#panel .cv2[data-cmpind="gdp_growth_26"]'); p.wait_for_timeout(250)
    print("at click origin", p.evaluate("sheetOrigin().scroll"))
    p.click('#overlay [data-learn] >> nth=0'); p.wait_for_timeout(900)
    print("ret", p.evaluate("JSON.stringify(S.ret)"))
    p.click("#panel .retbtn")
    for t in [50,200,400,800,1500]:
        p.wait_for_timeout(t if t==50 else 150); print(t,p.evaluate("panel.scrollTop"), p.evaluate("panel.scrollHeight-panel.clientHeight"))
    b.close()
