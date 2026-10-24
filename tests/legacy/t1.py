import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "harness.py")).read())
O=OUT+"/"
with sync_playwright() as pw:
    b=pw.chromium.launch()
    p,errs=page(b,1400,860)
    p.screenshot(path=O+"d1.png")
    # search Nigeria
    p.fill("#q","nigeria"); p.wait_for_timeout(200); p.keyboard.press("Enter"); p.wait_for_timeout(1300)
    p.screenshot(path=O+"d2.png")
    print("panel h2:", p.inner_text("#panel h2"))
    # click a neighbour chip
    p.click("#panel .chip >> nth=0"); p.wait_for_timeout(1200); print("after chip:", p.inner_text("#panel h2"))
    for m in ["learn","regions","africa","nigeria","quiz","about"]:
        p.click(f'nav.tabs button[data-mode="{m}"]'); p.wait_for_timeout(1400); p.screenshot(path=O+f"m_{m}.png")
    print("errors:", errs)
    b.close()
