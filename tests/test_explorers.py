"""Atomic profile migration, independent family progress and validated portable backups."""
import json
import os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"harness.py")).read())
results=[]
def check(name,ok,detail=""):
    results.append((name,bool(ok)));print(("PASS " if ok else "FAIL ")+name+("  "+str(detail) if detail else ""),flush=True)
def app(b,seed=None,width=1280,height=800):
    ctx=b.new_context(viewport={"width":width,"height":height},reduced_motion="reduce");p=ctx.new_page();errors=[]
    p.on("pageerror",lambda e:errors.append(str(e)));p.route("**/*",route)
    if seed is not None:p.add_init_script("if(!localStorage.getItem('mma.v1'))localStorage.setItem('mma.v1',"+json.dumps(json.dumps(seed))+");")
    p.goto("http://127.0.0.1:8765/_t.html");p.wait_for_selector("#loading",state="hidden");p.evaluate("closeOverlay()")
    return ctx,p,errors
with sync_playwright() as pw:
 b=pw.chromium.launch()
 legacy={"seen":["566"],"best":{"loc":9},"mastered":{"learn":20000},"srs":{"learn1":{"b":2,"d":25000,"w":1}},"welcomed":1,"custom":"retained"}
 ctx,p,errors=app(b,legacy)
 check("migration leaves the original single-explorer save untouched",p.evaluate("JSON.parse(localStorage.getItem('mma.v1'))")==legacy)
 check("the new atomic profile collection retains old progress and extra fields",p.evaluate("saved.best.loc===9 && saved.checks.learn===20000 && saved.custom==='retained' && explorerBook.profiles.length===1 && !!localStorage.getItem(store.key)"))
 p.evaluate("journeyRecord().notes.lagos='Original explorer note';store.set(saved)")
 original=p.evaluate("explorerBook.active")
 p.click("#explorersbtn");p.locator("summary",has_text="Add an explorer").click();p.fill("#new-explorer-name","Ada");p.locator("#explorer-create button").click()
 check("a new explorer starts without another person's scores or notes",p.evaluate("activeExplorer().name==='Ada' && saved.seen.length===0 && !saved.best.loc && !journeyRecord().notes.lagos"))
 p.evaluate("markSeen('392');journeyRecord().notes.lagos='Ada note';grade('learn1',true);store.set(saved)")
 ada=p.evaluate("explorerBook.active");p.click("#explorersbtn");p.click(f'[data-explorer-switch="{original}"]')
 check("switching restores the original explorer's scores, note and due date",p.evaluate("saved.best.loc===9 && journeyRecord().notes.lagos==='Original explorer note' && saved.srs.learn1.d===25000 && !saved.seen.includes('392')"))
 p.click("#explorersbtn");p.fill("#explorer-name","Home explorer");p.locator("#explorer-rename button").click()
 check("renaming changes the profile rather than resetting it",p.evaluate("activeExplorer().name==='Home explorer' && saved.best.loc===9"))
 with p.expect_download() as download:p.click('[data-backup="all"]')
 backup=json.load(open(download.value.path()))
 check("downloaded backup contains both explorers and their notes",backup['format']=='mental-map-atlas-backup' and len(backup['profiles'])==2 and {x['data']['journeys']['nigeria-again']['notes']['lagos'] for x in backup['profiles']}=={'Original explorer note','Ada note'})
 before=p.evaluate("localStorage.getItem(store.key)")
 for text in ['{bad','null','{}','{"format":"mental-map-atlas-backup","version":99}', '{"seen":[],"__proto__":{"polluted":true}}','{"srs":{"bad":{"b":9,"d":1,"w":0}}}','{"journeys":{"nigeria-again":{"cursor":{"view":"review","stop":0}}}}']:
    p.set_input_files('#explorer-import',{'name':'broken.json','mimeType':'application/json','buffer':text.encode()})
    p.wait_for_timeout(30)
    check("invalid backup does not alter the save",p.evaluate("localStorage.getItem(store.key)")==before)
 p.set_input_files('#explorer-import',{'name':'family.json','mimeType':'application/json','buffer':json.dumps(backup).encode()})
 p.wait_for_selector('#explorer-restore')
 check("restore presents a concrete preview before writing",p.evaluate("explorerBook.profiles.length===2") and "Ready to restore 2 explorers" in p.inner_text('#explorer-result'))
 p.click('#explorer-restore')
 check("restore adds profiles with fresh IDs and retains existing explorers",p.evaluate("explorerBook.profiles.length===4 && new Set(explorerBook.profiles.map(p=>p.id)).size===4 && explorerBook.active") == original)
 restored=p.evaluate("explorerBook.profiles.find(p=>p.name==='Ada (restored)').id")
 p.click(f'[data-explorer-switch="{restored}"]');p.reload();p.wait_for_selector('#loading',state='hidden')
 check("the restored active explorer survives reopening",p.evaluate("activeExplorer().name==='Ada (restored)' && journeyRecord().notes.lagos==='Ada note' && saved.seen.includes('392')"))
 # Simulate an older app writing the old key: it cannot delete the new collection.
 p.evaluate("localStorage.setItem('mma.v1',JSON.stringify({seen:[],best:{loc:1}}))");p.reload();p.wait_for_selector('#loading',state='hidden')
 check("an older tab cannot overwrite the new family profile collection",p.evaluate("explorerBook.profiles.length===4 && activeExplorer().name==='Ada (restored)' && journeyRecord().notes.lagos==='Ada note'"))
 # Modern tabs detect conflicting writes rather than overwriting one another.
 q=ctx.new_page();q.route('**/*',route);q.goto('http://127.0.0.1:8765/_t.html');q.wait_for_selector('#loading',state='hidden')
 q.evaluate("markSeen('250')");p.wait_for_function('store.conflict')
 external=p.evaluate('localStorage.getItem(store.key)');p.evaluate("markSeen('840')")
 check("a stale modern tab blocks writes and offers a backup",p.evaluate('localStorage.getItem(store.key)')==external and p.is_visible('#save-warning'))
 check("a conflicted session can still export its in-memory progress",p.evaluate("explorerBackup(false).profiles[0].data.seen.includes('840')"))
 q.close();check("profile and backup flows have no script errors",not errors,errors);ctx.close()

 ctx,p,errors=app(b,{'welcomed':1})
 p.evaluate("(()=>{window.realSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===store.key)throw new DOMException('full','QuotaExceededError');return realSet.call(this,k,v)};})()")
 current=p.evaluate('explorerBook.active');p.click('#explorersbtn');p.locator('summary',has_text='Add an explorer').click();p.fill('#new-explorer-name','Failed create');p.locator('#explorer-create button').click()
 check("a failed save cannot switch into an unsaved new profile",p.evaluate('explorerBook.active')==current and p.evaluate('explorerBook.profiles.length===1'))
 p.evaluate('(()=>{Storage.prototype.setItem=realSet;})()');ctx.close()
 for width,height in [(360,640),(390,844)]:
    ctx,p,errors=app(b,{'welcomed':1},width,height);p.click('#explorersbtn')
    check(f"{width}: explorers dialog fits without horizontal scrolling",p.evaluate("document.documentElement.scrollWidth<=innerWidth && document.querySelector('#overlay .dialog').scrollWidth<=document.querySelector('#overlay .dialog').clientWidth+1"))
    p.screenshot(path=os.path.join(OUT,f'stage3-explorers-{width}.png'));ctx.close()
 b.close()
failed=[n for n,ok in results if not ok];print(f'\n{len(results)-len(failed)}/{len(results)} explorer checks passed',flush=True);raise SystemExit(1 if failed else 0)
