import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for w,h,n in [(1400,860,"d"),(390,844,"m")]:
        p,errs=page(b,w,h)
        for k in ["566","204","100","716","862"]:
            p.evaluate(f"selectCountry('{k}',false)"); p.wait_for_timeout(200)
            t=p.evaluate("(()=>{const h=[...panel.querySelectorAll('h4')].find(x=>x.textContent.includes('Money'));return h?h.nextElementSibling.innerText:'NONE'})()")
            if n=="d": print(k, t.replace("\n"," | ")[:330])
        p.evaluate("setMode('money')"); p.wait_for_timeout(500)
        for v in ["unions","cfa"]: p.click(f'[data-act="money"][data-v="{v}"]'); p.wait_for_timeout(500)
        p.screenshot(path=O+f"money{n}.png")
        print(n,"toc",p.evaluate("tocH.length"),"checkcard",p.evaluate("!!document.querySelector('#checkcard')"))
        bad=[q["id"] for q in p.evaluate("QB.filter(q=>q.l==='money')") if not p.evaluate("at=>!![...panel.querySelectorAll('h2,h3,h4,b')].find(e=>e.textContent.trim().startsWith(at))", q["at"])]
        print(n,"bad anchors",bad)
        p.click('#checkcard [data-act="check"]'); p.wait_for_timeout(300)
        for i in range(3):
            q=p.evaluate("(()=>{const t=document.querySelector('#panel .q').textContent;return QB.find(x=>x.q===t)})()")
            p.click(f'.opts [data-j="{q["a"]}"]'); p.wait_for_timeout(60); p.click("#nextq"); p.wait_for_timeout(100)
        print(n,"money check",p.inner_text("#panel .score"))
        p.evaluate("setMode('course')"); p.wait_for_timeout(300); print(n,"lessons",p.evaluate("document.querySelectorAll('.lessons li').length"))
        print(n,"errors",[e for e in errs if "ERR_FAILED" not in e and "TUNNEL" not in e],"scrollW",p.evaluate("document.documentElement.scrollWidth"))
    b.close()
