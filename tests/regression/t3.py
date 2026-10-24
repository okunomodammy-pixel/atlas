import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
with sync_playwright() as pw:
    b=pw.chromium.launch(); p,errs=page(b,390,844,"africa",dark=True)
    print(p.evaluate("IDX.length"), p.evaluate("IDX.filter(e=>norm(e.t)==='lagos').map(e=>e.t+'|'+e.sub)"))
    p.fill("#q","lagos"); p.wait_for_timeout(300); print(p.inner_text("#results")[:200])
    p.fill("#q",""); p.type("#q","lagos"); p.wait_for_timeout(300); print(p.inner_text("#results")[:200]); print(errs)
