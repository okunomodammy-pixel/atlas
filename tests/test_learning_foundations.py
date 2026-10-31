"""Stage 1 regression checks: quiz exits, delayed recall, old saves, focus and phones.

Run after build/dist.py. Uses the same local, offline-capable harness as smoke.py.
"""
import json
import os

exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "harness.py")).read())
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("PASS " if ok else "FAIL ") + name + ("  " + str(detail) if detail else ""), flush=True)


def open_app(browser, seed=None, init="", width=1280, height=800):
    ctx = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
    p = ctx.new_page()
    if seed is not None:
        p.add_init_script("localStorage.setItem('mma.v1', " + json.dumps(json.dumps(seed)) + ");")
    if init:
        p.add_init_script(init)
    p.route("**/*", route)
    errors = []
    p.on("pageerror", lambda e: errors.append(str(e)))
    p.goto("http://127.0.0.1:8765/_t.html")
    p.wait_for_selector("#loading", state="hidden")
    p.evaluate("closeOverlay()")
    return ctx, p, errors


with sync_playwright() as pw:
    b = pw.chromium.launch()

    # Old passes are retained as passes. Existing scores, due dates and unknown fields survive.
    legacy = {"seen": ["566", "288"], "best": {"loc": 7}, "lessons": {"learn": 1},
              "lastLesson": "learn", "theme": "dark", "welcomed": 1, "mastered": {"learn": 20000},
              "srs": {"learn1": {"b": 3, "d": 99999, "w": 2}}, "custom": "keep me"}
    ctx, p, errors = open_app(b, legacy)
    state = p.evaluate("JSON.parse(localStorage.getItem('mma.v1'))")
    check("old progress migrates without losing scores, passes, review dates or extra fields",
          all(state[k] == v for k, v in legacy.items()) and state["checks"] == legacy["mastered"] and state["schemaVersion"] == 2)
    check("an old three-question pass is not reclassified as delayed recall", not p.evaluate("remembered('learn')"))
    p.evaluate("setMode('course')")
    check("migrated pass is visible in course progress", "1 of 11 checks passed" in p.inner_text("#panel"))
    check("navigation gives keyboard focus to the new heading", p.evaluate("document.activeElement === panel.querySelector('h2')"))
    ctx.close()

    ctx, p, errors = open_app(b, {"welcomed": 1})
    # Use real question IDs, and advance calendar days rather than just manipulating due dates.
    p.evaluate("window.testNow = Date.now(); window.testDay = 0; Date.now = () => testNow + testDay * 86400000")
    p.evaluate("grade('learn1', true)")
    initial = p.evaluate("({...saved.srs.learn1})")
    p.evaluate("grade('learn1', true); grade('learn1', true)")
    check("immediate correct retries do not advance the review interval",
          p.evaluate("saved.srs.learn1.b") == 0 and p.evaluate("saved.srs.learn1.d") == initial["d"])
    p.evaluate("testDay = 1; grade('learn1', true)")
    check("a correct answer on a later due day advances and records recall",
          p.evaluate("saved.srs.learn1.b === 1 && saved.srs.learn1.recalled && saved.srs.learn1.d === DAY() + 3"))
    p.evaluate("testDay = 2; grade('learn1', true)")
    check("early practice on another day also leaves the interval unchanged", p.evaluate("saved.srs.learn1.b === 1 && saved.srs.learn1.d === DAY() + 2"))
    p.evaluate("grade('learn1', false); grade('learn1', true)")
    check("a mistake resets recall and immediate correction cannot skip the next-day review",
          p.evaluate("saved.srs.learn1.b === -1 && !saved.srs.learn1.recalled && saved.srs.learn1.d === DAY() + 1 && saved.srs.learn1.lastCorrect"))
    p.evaluate("testDay = 3; grade('learn1', true)")
    check("recovery after a mistake begins with a one-day interval", p.evaluate("saved.srs.learn1.b === 0 && !saved.srs.learn1.recalled && saved.srs.learn1.d === DAY() + 1"))
    p.evaluate("saved.srs = {}; setMode('learn')")
    p.click("#checkcard [data-act=check]")
    for _ in range(3):
        answer = p.evaluate("QB.find(q => q.q === panel.querySelector('.q').textContent).a")
        p.click(f'.opts [data-j="{answer}"]')
        p.click("#nextq")
    check("passing three questions is clearly a check, not full-bank recall",
          "Check passed" in p.inner_text("#panel") and p.evaluate("saved.checks.learn != null && !remembered('learn') && Object.keys(saved.srs).length === 3"))
    p.evaluate("QB.filter(q => q.l === 'learn').forEach(q => grade(q.id, true))")
    check("covering the whole bank today still does not claim remembered later", not p.evaluate("remembered('learn')"))
    p.evaluate("testDay = 4; QB.filter(q => q.l === 'learn').forEach(q => grade(q.id, true))")
    check("all questions recalled on a later scheduled day earn remembered-later status", p.evaluate("remembered('learn')"))
    p.evaluate("grade('learn1', false)")
    check("new mistakes remove the memory claim while preserving the passed check",
          p.evaluate("!remembered('learn') && saved.checks.learn != null"))
    check("learning flows have no script errors", not errors, errors)
    ctx.close()

    # Exercise the real scheduled callbacks, including exit immediately before the result.
    ctx, p, errors = open_app(b, {"welcomed": 1})
    p.clock.install()
    start = {"location": "ACT.qloc({dataset:{scope:'Africa'}})", "states": "ACT.qstates()"}
    answer = {
        "location": "S.quiz.onClick([...featByKey.keys()].find(k => nameOf(k) === panel.querySelector('.q b').textContent))",
        "states": "S.quiz.onState(G.states.selectAll('path').data().find(d => stName(d.properties.name) === panel.querySelector('.q b').textContent).properties.name)"
    }
    for game in start:
        for final in (False, True):
            p.evaluate("setMode('quiz'); " + start[game])
            if final:
                for _ in range(9):
                    p.evaluate(answer[game])
                    p.clock.fast_forward(950)
            p.evaluate(answer[game])
            p.evaluate("setMode('tools')")
            before = p.inner_text("#panel")
            p.clock.fast_forward(2500)
            check(f"{game}: leaving during {'final' if final else 'first'} feedback cannot overwrite Tools",
                  p.evaluate("S.mode === 'tools' && S.quiz === null") and p.inner_text("#panel") == before)
    p.evaluate("setMode('quiz'); " + start["location"])
    p.evaluate(answer["location"])
    p.evaluate(start["states"])
    before = p.inner_text("#panel")
    p.clock.fast_forward(2500)
    check("replacing a quiz cancels the previous round's callback", p.inner_text("#panel") == before and "Nigeria's states" in before)
    check("quiz cancellation produces no script errors", not errors, errors)
    ctx.close()

    # Every overlay type uses the same focus policy, including comparison -> source -> back.
    ctx, p, errors = open_app(b, {"welcomed": 1})
    p.click("#helpbtn")
    contained = True
    for _ in range(12):
        p.keyboard.press("Tab")
        contained = contained and p.evaluate("!!document.activeElement.closest('#overlay')")
    check("Tab cycles repeatedly inside the welcome dialog", contained)
    p.keyboard.press("Shift+Tab")
    check("Shift+Tab remains inside the dialog", p.evaluate("!!document.activeElement.closest('#overlay')"))
    p.keyboard.press("/")
    p.evaluate("document.querySelector('#q').focus()")
    check("background search cannot steal modal focus", p.evaluate("!!document.activeElement.closest('#overlay')"))
    p.keyboard.press("Escape")
    check("closing help restores the original button and releases the background",
          p.evaluate("document.activeElement.id === 'helpbtn' && !document.querySelector('#main').inert"))
    p.evaluate("setMode('explore'); selectCountry('566', true)")
    p.click('#panel .cv2[data-cmpind="gdp_growth_26"]')
    check("comparison dialog receives focus", p.evaluate("!!document.activeElement.closest('#overlay')"))
    p.click("#overlay [data-ind=gdp_growth_26]")
    check("source sheet keeps focus inside the modal", p.evaluate("!!document.activeElement.closest('#overlay')"))
    p.click("#overlay [data-sheetback]")
    p.keyboard.press("Escape")
    check("closing nested sheets restores the figure that opened the comparison",
          p.evaluate("document.activeElement.matches('#panel .cv2[data-cmpind=gdp_growth_26]')"))
    check("dialogs have no delayed focus errors", not errors, errors)
    ctx.close()

    # Save failures must be visible, retryable, and must not destroy unreadable old data.
    init = """window.failSaves = true;
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) {
      if (k === 'mma.v1' && window.failSaves) throw new DOMException('full', 'QuotaExceededError');
      return originalSet.call(this, k, v);
    };"""
    ctx, p, errors = open_app(b, legacy, init)
    check("quota failures show a persistent save warning", p.is_visible("#save-warning") and "could not be saved" in p.inner_text("#save-warning"))
    p.evaluate("markSeen('392'); window.failSaves = false")
    p.click("#save-retry")
    check("retry writes current progress and clears the warning",
          not p.is_visible("#save-warning") and p.evaluate("JSON.parse(localStorage.getItem('mma.v1')).seen.includes('392')"))
    ctx.close()
    ctx, p, errors = open_app(b, init="localStorage.setItem('mma.v1', '{broken original');")
    p.evaluate("markSeen('566')")
    p.click("#save-retry")
    check("unreadable saves are left untouched rather than overwritten with an empty profile",
          p.is_visible("#save-warning") and p.evaluate("localStorage.getItem('mma.v1') === '{broken original'"))
    check("unreadable saves still allow the atlas to load", p.evaluate("Object.keys(D.facts).length === 250"))
    ctx.close()

    for w, h in [(360, 640), (390, 844)]:
        ctx, p, errors = open_app(b, {"welcomed": 1}, width=w, height=h)
        p.evaluate("setMode('learn')")
        reading = p.locator("#panel").bounding_box()["height"]
        check(f"{w}x{h}: lessons start with usable reading space", reading >= 200, round(reading))
        p.screenshot(path=os.path.join(OUT, f"stage1-lesson-{w}.png"))
        p.click("#layersbtn")
        p.check("#L-depth")
        check(f"{w}x{h}: map settings remain reachable with a compact map", p.is_checked("#L-depth"))
        p.uncheck("#L-depth")
        p.click("#layersbtn")
        map_before = p.locator("#mapwrap").bounding_box()["height"]
        p.click("#mapbtn")
        p.wait_for_timeout(350)
        check(f"{w}x{h}: More map expands the map", p.locator("#mapwrap").bounding_box()["height"] > map_before + 100)
        p.focus("#readingbtn")
        p.keyboard.press("Enter")
        p.wait_for_timeout(350)
        check(f"{w}x{h}: keyboard can restore reading space", p.locator("#panel").bounding_box()["height"] >= 200)
        check(f"{w}x{h}: no sideways page overflow", p.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        check(f"{w}x{h}: map dimensions match its resized container", p.evaluate("Math.abs(H - document.querySelector('#mapwrap').getBoundingClientRect().height) < 2"))
        check(f"{w}x{h}: no layout script errors", not errors, errors)
        ctx.close()
    b.close()

failed = [name for name, ok in results if not ok]
print(f"\n{len(results) - len(failed)}/{len(results)} learning-foundation checks passed", flush=True)
raise SystemExit(1 if failed else 0)
