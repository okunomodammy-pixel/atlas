"""Screenshots of every main screen at phone and desktop width, light and dark, for design review.
    python3 tests/review_shots.py [outdir-suffix]   -> out/review/<suffix>/"""
import os, sys; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "harness.py")).read())
D_ = os.path.join(A, "out", "review", sys.argv[1] if len(sys.argv) > 1 else "now"); os.makedirs(D_, exist_ok=True)
SCREENS = [
 ("welcome", "showWelcome(false)"),
 ("home", "setMode('explore'); $('#panel').scrollTop=0"),
 ("country", "setMode('explore'); selectCountry(byC3.get('NGA'), true)"),
 ("country2", "setMode('explore'); selectCountry(byC3.get('NGA'), true); setTimeout(()=>panel.scrollTop=900,50)"),
 ("ind", "setMode('explore'); selectCountry(byC3.get('KEN'), true); compareSheet('gdp_pc_25','KEN')"),
 ("vs", "compareCountries('NGA','GHA')"),
 ("course", "setMode('course')"),
 ("lesson", "setMode('learn')"),
 ("quiz", "setMode('quiz')"),
 ("tools", "setMode('tools')"),
 ("about", "setMode('about')"),
 ("nigeria", "setMode('nigeria')"),
 ("nigeria2", "setMode('nigeria'); setTimeout(()=>panel.scrollTop=1200,50)"),
 ("state", "setMode('nigeria'); statePanel('Kano')"),
 ("layers", "setMode('explore'); $('#layersbtn').click()"),
]
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for w, h, n in [(390, 844, "m"), (1400, 860, "d")]:
        for dark in (False, True):
            p, errs = page(b, w, h, dark=dark)
            for name, js in SCREENS:
                p.evaluate("closeOverlay(); if ($('#layers') && !$('#layers').hidden && $('#layersbtn').getAttribute('aria-expanded')==='true') $('#layersbtn').click()")
                try: p.evaluate(js)
                except Exception as e: print(name, "ERR", str(e)[:120]); continue
                p.wait_for_timeout(700)
                p.screenshot(path=f"{D_}/{name}_{n}{'_dk' if dark else ''}.png")
            if errs: print(n, dark, errs[:3])
print("saved to", D_)
