"""The complete Nigeria journey, resumption, hints, review, notes, map input and offline use."""
import json
import os
import zipfile

exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "harness.py")).read())
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("PASS " if ok else "FAIL ") + name + ("  " + str(detail) if detail else ""), flush=True)


def app(browser, width=1280, height=800, seed=None, offline=False):
    ctx = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce", offline=offline)
    p = ctx.new_page(); errors = []
    p.on("pageerror", lambda e: errors.append(str(e)))
    if seed is not None:
        p.add_init_script("if (!localStorage.getItem('mma.v1')) localStorage.setItem('mma.v1', " + json.dumps(json.dumps(seed)) + ");")
    p.route("**/*", route)
    p.goto("file://" + STANDALONE if offline else "http://127.0.0.1:8765/_t.html")
    p.wait_for_selector("#loading",state="hidden"); p.evaluate("closeOverlay()")
    return ctx, p, errors


def answer(p, wrong=False, map_key=False):
    task = p.evaluate("(()=>{const t=currentJourneyTask();return {type:t.type,id:t.id,place:t.stop.id,answer:t.answer,stopIndex:t.stopIndex}})()")
    if task["type"] == "location":
        place = "ibadan" if wrong and task["place"] != "ibadan" else "lagos" if wrong else task["place"]
        if map_key:
            p.locator(".journey-marker").nth(task["stopIndex"]).focus(); p.keyboard.press("Enter")
        else:
            p.click(f'[data-janswer="{place}"]')
    elif isinstance(task["answer"], list):
        picks = list(reversed(task["answer"])) if wrong else task["answer"]
        for i in picks: p.click(f'[data-jtoggle="{i}"]')
        p.click("[data-act=jcheck]")
    else:
        option = (task["answer"] + 1) % 3 if wrong else task["answer"]
        p.click(f'[data-janswer="{option}"]')
    return task


data = json.load(open(os.path.join(A,"src","data","journeys.json")))
task_ids = [t["id"] for stop in data["stops"] for t in stop["tasks"]]
check("content has five distinct stops, fifteen stable task IDs and source records",
      len(data["stops"]) == 5 and len(set(task_ids)) == 15 and all(stop["sources"] and all(k in data["sources"] for k in stop["sources"]) for stop in data["stops"]))
check("every question has a hint and teaching explanation", all(t["hint"] and t["explanation"] for s in data["stops"] for t in s["tasks"]))

with sync_playwright() as pw:
    b = pw.chromium.launch()
    legacy = {"welcomed":1,"seen":["566"],"best":{"loc":8},"mastered":{"learn":20000},"theme":"dark"}
    ctx,p,errors = app(b,seed=legacy)
    check("a journey can start directly from Explore", p.locator('#panel [data-act=jresume]').count() == 1)
    p.click("#panel [data-act=jresume]")
    check("first story has a map, illustration, deeper reading and sources",
          p.locator(".journey-marker").count() == 5 and p.locator(".field-scene svg").count() == 1 and "A little deeper" in p.inner_text("#panel") and "Sources & map notes" in p.inner_text("#panel"))
    note = 'A memory of home. </textarea><script>window.injected=true</script>'
    p.fill("#journey-note",note)
    p.click("[data-act=jchallenge]")
    answer(p,wrong=True)
    check("a missed location teaches the place and queues next-day review",
          "A place to revisit" in p.inner_text("#journey-feedback") and p.evaluate("saved.srs['journey:nigeria-again:lagos-locate'].d === DAY()+1"))
    before = p.evaluate("journeyRecord().tasks['lagos-locate'].attempts")
    p.reload();p.wait_for_selector("#loading",state="hidden")
    check("reload resumes answer feedback without recording another attempt",
          p.locator("#journey-feedback").count() == 1 and p.evaluate("journeyRecord().tasks['lagos-locate'].attempts") == before)
    p.click("[data-act=jnextquestion]")
    p.click("[data-act=jhint]"); answer(p)
    check("a hinted correct answer records help and does not inflate delayed recall",
          "with a hint" in p.inner_text("#journey-feedback") and p.evaluate("saved.srs['journey:nigeria-again:lagos-water'].b === -1 && saved.srs['journey:nigeria-again:lagos-water'].w === 0 && saved.placeSkills['NGA:lagos'].landscape.assisted === 1"))
    p.click("[data-act=jnextquestion]"); answer(p); p.click("[data-act=jnextquestion]")
    check("the first stop leads to Ibadan", "The coast is only the beginning" in p.inner_text("#panel"))
    for index in range(1,5):
        p.click("[data-act=jchallenge]")
        answer(p,map_key=True)
        p.click("[data-act=jnextquestion]")
        answer(p)
        p.click("[data-act=jnextquestion]")
        answer(p); p.click("[data-act=jnextquestion]")
    check("five stops lead into the map reconstruction", p.evaluate("journeyRecord().cursor.view === 'recap'"))
    for _ in range(5):
        answer(p)
        p.click("[data-act=jnextquestion]")
    check("completed exploration produces an honest journal entry",
          "JOURNEY EXPLORED" in p.inner_text("#panel") and "5 of 5 places explored" in p.inner_text("#panel") and "15 of 15 stop challenges tried" in p.inner_text("#panel"))
    check("all places have separate location and subject-skill records", p.evaluate("Object.keys(saved.placeSkills).length === 5 && Object.values(saved.placeSkills).every(p=>Object.keys(p).length===3)"))
    check("notes render as text and cannot execute markup", p.locator(".journal-entry blockquote").inner_text() == note and not p.evaluate("!!window.injected"))
    check("existing exploration, scores and lesson passes survive the journey", p.evaluate("saved.seen.includes('566') && saved.best.loc===8 && saved.checks.learn===20000 && saved.theme==='dark'"))
    p.evaluate("journeyRecord().notes.lagos = 'I would like to see the lagoon from the water. What changes when you cross a city by boat?'; ACT.jjournal()")
    p.screenshot(path=os.path.join(OUT,"stage2-journal-desktop.png"))
    p.evaluate("setMode('tools')")
    check("leaving a journey restores the ordinary map", p.evaluate("document.querySelectorAll('.journey-marker').length===0 && document.querySelector('#map').getAttribute('role')==='img' && S.quiz===null"))
    p.evaluate("setMode('explore')")
    check("Explore offers a return to the saved journal", "Continue journey" in p.inner_text("#panel"))
    # Advance a real calendar day. The review uses the same spatial tasks and due scheduler.
    p.evaluate("window.journeyTestNow=Date.now();Date.now=()=>journeyTestNow+86400000")
    check("missed and practised skills become due on the next day", p.evaluate("journeyDue().length===15"))
    p.evaluate("setMode('quiz')")
    check("journey review is discoverable alongside existing games", p.locator("[data-act=jreview]").count()==1)
    p.click("[data-act=jreview]")
    for _ in range(15):
        answer(p);p.click("[data-act=jnextquestion]")
    check("later review advances previously correct place skills", p.evaluate("saved.srs['journey:nigeria-again:ibadan-locate'].b===1 && saved.srs['journey:nigeria-again:ibadan-locate'].recalled"))
    check("later review recovers missed places without skipping the first interval", p.evaluate("saved.srs['journey:nigeria-again:lagos-locate'].b===0 && !saved.srs['journey:nigeria-again:lagos-locate'].recalled"))
    check("review finishes with no questions still due today", p.evaluate("journeyDue().length===0 && journeyRecord().cursor.view==='review-result'"))
    p.evaluate("ACT.jjournal()")
    check("the journal distinguishes later recall from today's exploration", "13 of 15 skills recalled in later scheduled reviews" in p.inner_text("#panel"))
    check("lesson review does not claim dates belonging only to journey questions", p.evaluate("nextDue() === null"))
    check("full journey, journal and review have no script errors", not errors,errors)
    ctx.close()

    prior={"welcomed":1,"srs":{"journey:nigeria-again:kano-craft":{"b":3,"d":25000,"w":0}},"journeys":{"nigeria-again":{"cursor":{"view":"review","stop":3,"answer":{"choice":"0","ok":True}},"review":{"queue":["kano-craft"],"index":0,"answers":{"kano-craft":True}},"tasks":{"kano-craft":{"attempts":1,"correct":1}},"visited":{"kano":True}}}}
    ctx,p,errors=app(b,seed=prior)
    p.click("#panel [data-act=jresume]")
    check("a revised question starts fresh while retaining the old answer history",p.evaluate("currentJourneyTask().id==='kano-links-v2' && !journeyRecord().cursor.answer && saved.srs['journey:nigeria-again:kano-craft'].b===3 && saved.srs['journey:nigeria-again:kano-links-v2'].b===-1 && journeyRecord().tasks['kano-craft'].correct===1"))
    answer(p);p.click("[data-act=jnextquestion]")
    check("old answers cannot double-count the revised review result","1 / 1" in p.inner_text("#panel .score"))
    p.evaluate("prepareJourneyQuestion('task',1,2)")
    p.click('[data-jtoggle="0"]');p.click('[data-act=jcheck]')
    check("selecting only one of two required clues is not scored as correct",p.evaluate("!journeyRecord().cursor.answer.ok"))
    p.evaluate("prepareJourneyQuestion('task',2,2)")
    for i in [2,1,0]:p.click(f'[data-jtoggle="{i}"]')
    p.click('[data-act=jcheck]')
    check("downstream ordering checks the sequence rather than just the selected set",p.evaluate("!journeyRecord().cursor.answer.ok") and "Niger Delta" in p.inner_text('#journey-feedback'))
    check("editorial changes have no script errors",not errors,errors);ctx.close()

    prior['journeys']['nigeria-again']['cursor']={'view':'review-result','stop':3}
    prior['journeys']['nigeria-again']['review']['index']=1
    ctx,p,errors=app(b,seed=prior);p.click('#panel [data-act=jresume]')
    check("a content revision preserves the result of an already completed review",'1 / 1' in p.inner_text('#panel .score') and p.evaluate("journeyRecord().review.answers['kano-craft']===true"))
    ctx.close()

    ctx,p,errors = app(b,seed={"welcomed":1})
    p.goto("http://127.0.0.1:8765/_t.html#journey/nigeria-again/lokoja");p.wait_for_selector("#loading",state="hidden")
    check("a shared stop link opens its story", "Two rivers, one meeting" in p.inner_text("#panel"))
    p.click("[data-act=jnextstop]")
    check("reading on queues skipped practice without counting a wrong answer", p.evaluate("saved.srs['journey:nigeria-again:lokoja-rivers'].w===0 && !journeyRecord().tasks['lokoja-rivers']"))
    p.evaluate("setMode('journeys');ACT.jjournal()")
    check("partial exploration does not earn a completion stamp", p.locator(".journal-stamp").count()==0)
    ctx.close()

    for width,height in [(360,640),(390,844)]:
        ctx,p,errors = app(b,width,height,seed={"welcomed":1})
        hero = p.locator('#panel [data-act=jresume]').bounding_box()
        panel_box = p.locator('#panel').bounding_box()
        check(f"{width}: start button is visible in the opening reading panel", hero["y"]+hero["height"] <= panel_box["y"]+panel_box["height"])
        p.click("#panel [data-act=jresume]")
        p.screenshot(path=os.path.join(OUT,f"stage2-story-{width}.png"))
        check(f"{width}: the current story pin stays above the reading panel", p.evaluate("document.querySelector('.journey-marker.active .disc').getBoundingClientRect().bottom <= document.querySelector('#side').getBoundingClientRect().top"))
        p.click("[data-act=jchallenge]")
        p.screenshot(path=os.path.join(OUT,f"stage2-map-task-{width}.png"))
        check(f"{width}: all five answer markers stay clear of the search and zoom controls", p.evaluate("""(() => {
            const rects = [...document.querySelectorAll('.journey-marker .disc')].map(el=>el.getBoundingClientRect());
            const blockers = ['.search','#layersbtn','.zoom'].map(s=>document.querySelector(s).getBoundingClientRect());
            return rects.every(r=>blockers.every(b=>r.right<=b.left || r.left>=b.right || r.bottom<=b.top || r.top>=b.bottom));
        })()"""))
        check(f"{width}: adjacent letter markers are visually separate", p.evaluate("""(() => {
            const r = [...document.querySelectorAll('.journey-marker .disc')].map(el=>el.getBoundingClientRect());
            return r.every((a,i)=>r.slice(i+1).every(b=>Math.hypot((a.left+a.right-b.left-b.right)/2,(a.top+a.bottom-b.top-b.bottom)/2)>=36));
        })()"""))
        p.locator(".journey-marker").nth(0).click()
        check(f"{width}: a map marker can answer the location challenge", p.locator("#journey-feedback").count()==1 and p.evaluate("journeyRecord().cursor.answer.ok"))
        check(f"{width}: challenge and story do not create sideways page scrolling", p.evaluate("document.documentElement.scrollWidth<=innerWidth"))
        p.evaluate("setMode('tools')")
        p.wait_for_timeout(1000)
        check(f"{width}: no delayed journey content overwrites the destination", p.evaluate("S.mode==='tools' && !document.querySelector('.journey-marker')"))
        check(f"{width}: no phone script errors", not errors,errors)
        ctx.close()

    ctx,p,errors = app(b,390,844,seed={"welcomed":1},offline=True)
    p.click("#panel [data-act=jresume]")
    p.fill("#journey-note","Saved offline")
    p.click("[data-act=jchallenge]");answer(p)
    p.reload();p.wait_for_selector("#loading",state="hidden")
    check("standalone journey resumes offline after reopening", p.locator("#journey-feedback").count()==1 and p.evaluate("journeyRecord().notes.lagos==='Saved offline'"))
    p.click("[data-act=jnextquestion]");answer(p);p.click("[data-act=jnextquestion]");answer(p);p.click("[data-act=jnextquestion]")
    for _ in range(4):
        p.click("[data-act=jchallenge]");answer(p);p.click("[data-act=jnextquestion]");answer(p);p.click("[data-act=jnextquestion]");answer(p);p.click("[data-act=jnextquestion]")
    for _ in range(5):
        answer(p);p.click("[data-act=jnextquestion]")
    check("the entire five-stop journey and reconstruction finish with the network off", "JOURNEY EXPLORED" in p.inner_text("#panel") and p.evaluate("Object.keys(journeyRecord().visited).length===5"))
    p.evaluate("ACT.jjournal()")
    check("journal and source notes work with no network", "Saved offline" in p.inner_text("#panel") and not errors,errors)
    ctx.close();b.close()

check("standalone stays within the agreed 4 MB core budget", os.path.getsize(STANDALONE)<=4_000_000,os.path.getsize(STANDALONE))
with zipfile.ZipFile(os.path.join(A,"out","standalone","mental-map-atlas-site.zip")) as z:
    check("offline ZIP contains the complete self-contained journey", 'id="d-journeys"' in z.read("index.html").decode())
failed = [n for n,ok in results if not ok]
print(f"\n{len(results)-len(failed)}/{len(results)} journey checks passed",flush=True)
raise SystemExit(1 if failed else 0)
