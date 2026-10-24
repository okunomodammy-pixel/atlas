import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
CLICK="k => document.querySelector(`path.country[data-k='${k}']`).dispatchEvent(new MouseEvent('click',{bubbles:true}))"
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(1400,860,"d"),(390,844,"m")]:
        p,errs=page(b,w,h)
        # politics: colour BRICS, scroll, tap Nigeria, open, back
        p.evaluate("setMode('politics')"); p.wait_for_timeout(500)
        p.click('#blocchips [data-b="BRICS"]'); p.wait_for_timeout(800)
        st0=p.evaluate("panel.scrollTop"); info0=p.inner_text("#blocinfo9"); leg0=p.inner_text("#legend")
        p.evaluate(CLICK,"566"); p.wait_for_timeout(300)
        print(n,"peek visible",p.evaluate("!$('#peek').hidden"),"|",p.inner_text("#peek").replace("\n"," / ")[:160])
        p.screenshot(path=O+f"peek{n}.png")
        p.click('#peek [data-peek="open"]'); p.wait_for_timeout(900)
        print(n,"profile:",p.inner_text("#panel h2"),"| back btn:",p.inner_text("#panel .back"),"| crumb:",p.inner_text("#crumb .cl b"))
        p.screenshot(path=O+f"prof{n}.png")
        p.click('#panel .chip[data-go]'); p.wait_for_timeout(700); print(n,"walked to:",p.inner_text("#panel h2"))
        p.click('#panel .back'); p.wait_for_timeout(1000)
        print(n,"restored: info same",p.inner_text("#blocinfo9")==info0,"legend same",p.inner_text("#legend")==leg0,"scroll",st0,p.evaluate("panel.scrollTop"),"color fn",p.evaluate("!!S.color"),"mode",p.evaluate("S.mode"),"stack",p.evaluate("VIEW.length"))
        # story with browser back
        p.evaluate("setMode('story')"); p.wait_for_timeout(500); p.evaluate("storyStop(6)"); p.wait_for_timeout(700)
        r0=p.evaluate("G.routes.selectAll('path').size()"); pins0=p.evaluate("G.pins.selectAll('circle').size()")
        p.evaluate(CLICK,"466"); p.wait_for_timeout(300); p.click('#peek [data-peek="open"]'); p.wait_for_timeout(700)
        print(n,"routes cleared",p.evaluate("G.routes.selectAll('path').size()"))
        p.go_back(); p.wait_for_timeout(1000)
        print(n,"after browser back: mode",p.evaluate("S.mode"),"routes",r0,p.evaluate("G.routes.selectAll('path').size()"),"pins",pins0,p.evaluate("G.pins.selectAll('circle').size()"),"stop title",p.inner_text("#storyinfo h3"))
        # ngstory state tap
        p.evaluate("setMode('ngstory')"); p.wait_for_timeout(500); p.evaluate("ngStop(6)"); p.wait_for_timeout(700)
        p.evaluate("document.querySelector('path.state').dispatchEvent(new MouseEvent('click',{bubbles:true}))"); p.wait_for_timeout(200)
        print(n,"state peek:",p.inner_text("#peek").replace("\n"," / ")[:120])
        # explore unchanged
        p.evaluate("setMode('explore')"); p.wait_for_timeout(400); p.evaluate(CLICK,"288"); p.wait_for_timeout(600)
        print(n,"explore click ->",p.inner_text("#panel h2"),"peek hidden",p.evaluate("$('#peek').hidden"))
        # search in lesson keeps lesson
        p.evaluate("setMode('geo')"); p.wait_for_timeout(400); p.fill("#q","kenya"); p.wait_for_timeout(200); p.keyboard.press("Enter"); p.wait_for_timeout(700)
        print(n,"search in lesson: mode",p.evaluate("S.mode"),"h2",p.inner_text("#panel h2"),"back",p.inner_text("#panel .back"))
        print(n,"errors",[e for e in errs if "ERR_FAILED" not in e and "TUNNEL" not in e],"scrollW",p.evaluate("document.documentElement.scrollWidth"))
    b.close()
