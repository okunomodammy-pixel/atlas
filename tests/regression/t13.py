import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(1400,860,"d"),(390,844,"m")]:
        p,errs=page(b,w,h)
        for m in ["explore","course","learn","regions","africa","nigeria","ngstory","story","history","borders","geo","politics","tools","quiz","about"]:
            p.evaluate(f"setMode('{m}')"); p.wait_for_timeout(250)
            print(n,m,"toc" if not p.evaluate("$('#toc').hidden") else "-", p.evaluate("tocH.length"))
        p.evaluate("setMode('politics')"); p.wait_for_timeout(400)
        p.click("#tocbtn"); p.wait_for_timeout(200); p.screenshot(path=O+f"toc{n}.png")
        p.click("#toclist button >> nth=5"); p.wait_for_timeout(900)
        print(n,"current:",p.inner_text("#toccur"),"| list hidden",p.evaluate("$('#toclist').hidden"))
        p.evaluate("panel.scrollTop=0"); p.wait_for_timeout(200); print(n,"top:",p.inner_text("#toccur"))
        # profile on stack hides toc; back restores
        p.evaluate("openProfile('566')"); p.wait_for_timeout(500); print(n,"toc on profile hidden",p.evaluate("$('#toc').hidden"))
        p.click("#panel .back"); p.wait_for_timeout(700); print(n,"toc after back",not p.evaluate("$('#toc').hidden"))
        # history peek
        p.evaluate("setMode('history')"); p.wait_for_timeout(500); p.click('[data-act="era"][data-y="1914"]'); p.wait_for_timeout(800)
        box=p.evaluate("(()=>{const r=document.querySelector('#map').getBoundingClientRect();const c=projection([8,10]);const t=S.t.apply(c);return [r.left+t[0], r.top+t[1]]})()")
        p.mouse.click(box[0],box[1]); p.wait_for_timeout(400); print(n,"hist peek:",p.inner_text("#peek").replace("\n"," / ")[:150])
        p.screenshot(path=O+f"hist{n}.png")
        p.click('#peek [data-peek="open"]'); p.wait_for_timeout(700); print(n,"opened",p.inner_text("#panel h2"),"mode",p.evaluate("S.mode"))
        p.click("#panel .back"); p.wait_for_timeout(700); print(n,"hist polys after back",p.evaluate("document.querySelectorAll('path.hpoly').length"))
        print(n,"errors",[e for e in errs if "ERR_FAILED" not in e and "TUNNEL" not in e],"scrollW",p.evaluate("document.documentElement.scrollWidth"))
    b.close()
