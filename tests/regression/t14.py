import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
def answer(p, right):
    q=p.evaluate("(()=>{const t=document.querySelector('#panel .q').textContent;return QB.find(x=>x.q===t)})()")
    a=q["a"]
    sel=f'.opts [data-j="{a}"]' if right else f'.opts button:not([data-j="{a}"])'
    p.click(sel+" >> nth=0"); p.wait_for_timeout(80); p.click("#nextq"); p.wait_for_timeout(120)
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(1400,860,"d"),(390,844,"m")]:
        p,errs=page(b,w,h)
        # every anchor resolves
        bad=[]
        for q in p.evaluate("QB.map(q=>({id:q.id,l:q.l,at:q.at}))"):
            if isinstance(q["at"],str):
                p.evaluate(f"setMode('{q['l']}')"); p.wait_for_timeout(120)
                ok=p.evaluate("at=>!![...panel.querySelectorAll('h2, h3, h4, .case b, b')].find(e=>e.textContent.trim().startsWith(at))||!![...panel.querySelectorAll('h2,h3,h4')].find(e=>e.textContent.includes(at))", q["at"])
                if not ok: bad.append(q["id"])
        print(n,"unresolved anchors:",bad, "bank", p.evaluate("QB.length"), "answers valid", p.evaluate("QB.every(q=>q.a>=0&&q.a<q.o.length)"))
        p.evaluate("setMode('politics')"); p.wait_for_timeout(400)
        print(n,"check card present",p.evaluate("!!document.querySelector('#checkcard')"))
        p.evaluate("panel.scrollTop=panel.scrollHeight"); p.wait_for_timeout(100)
        st0=p.evaluate("panel.scrollTop")
        p.click('#checkcard [data-act="check"]'); p.wait_for_timeout(300)
        answer(p,True); answer(p,False); answer(p,True)
        print(n,"fail:",p.inner_text("#panel .score"),"| re-read buttons",p.evaluate("document.querySelectorAll('[data-act=goto]').length"))
        p.screenshot(path=O+f"fail{n}.png")
        p.click('[data-act="check"]'); p.wait_for_timeout(300)
        first=p.inner_text("#panel .q"); print(n,"retry first q is the missed one:", p.evaluate("t=>{const q=QB.find(x=>x.q===t);return saved.srs[q.id].w>0}", first))
        for i in range(3): answer(p,True)
        print(n,"pass:",p.inner_text("#panel .score"),"mastered",p.evaluate("!!saved.mastered.politics"))
        p.click('#panel .btnrow [data-act="popview"]'); p.wait_for_timeout(900)
        print(n,"back to lesson: mode",p.evaluate("S.mode"),"scroll",st0,p.evaluate("panel.scrollTop"),"card status",p.inner_text("#checkcard .stat"))
        # goto from a fail
        p.click('#checkcard [data-act="check"]'); p.wait_for_timeout(300)
        for i in range(3): answer(p,False)
        p.click('[data-act="goto"] >> nth=0'); p.wait_for_timeout(1200); print(n,"goto -> mode",p.evaluate("S.mode"),"scrolled",p.evaluate("panel.scrollTop")>0, "toc",p.inner_text("#toccur"))
        # simulate tomorrow: shift due days
        p.evaluate("Object.values(saved.srs).forEach(r=>r.d-=1)"); 
        p.evaluate("setMode('course')"); p.wait_for_timeout(300); print(n,"course due card:", p.evaluate("!!panel.querySelector('[data-act=review]')"), p.inner_text("#panel .lessons li:last-child .stat"))
        p.screenshot(path=O+f"course{n}.png")
        p.click('[data-act="review"]'); p.wait_for_timeout(300)
        k=p.evaluate("dueCount()")
        for i in range(k if k<10 else 10): answer(p,True)
        print(n,"review result:",p.inner_text("#panel .score"),"due now",p.evaluate("dueCount()"),"next",p.evaluate("whenTxt(nextDue())"))
        p.click('#panel .back'); p.wait_for_timeout(500); print(n,"after review back mode",p.evaluate("S.mode"),"h2",p.inner_text("#panel h2"))
        p.evaluate("setMode('story')"); p.wait_for_timeout(500); print(n,"story check card", p.evaluate("!!document.querySelector('#checkcard')"))
        p.evaluate("setMode('explore')"); p.wait_for_timeout(300); p.evaluate("setMode('quiz')"); p.wait_for_timeout(300)
        print(n,"errors",[e for e in errs if "ERR_FAILED" not in e and "TUNNEL" not in e],"scrollW",p.evaluate("document.documentElement.scrollWidth"))
    b.close()
