"""Real service-worker installation, offline navigation, waiting updates and failure recovery."""
import hashlib
import http.server
import os
import re
import threading
import time
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from build.site_version import make_worker
BASE=(ROOT/'out/standalone/Mental-Map-Atlas.html').read_bytes()
WORKER=(ROOT/'sw.js').read_text()
versions={1:BASE,2:BASE.replace(b'"title": "Meet Nigeria again"',b'"title": "Meet Nigeria again - edition two"',1),3:BASE.replace(b'"title": "Meet Nigeria again"',b'"title": "Meet Nigeria again - edition three"',1)}
versions[4]=versions[3]
results=[]
def check(name,ok,detail=''):
    results.append((name,bool(ok)));print(('PASS ' if ok else 'FAIL ')+name+('  '+str(detail) if detail else ''),flush=True)
class Site(http.server.BaseHTTPRequestHandler):
    version=1
    fail_asset=False
    def log_message(self,*args):pass
    def do_GET(self):
        path=self.path.split('?')[0]
        if path in ['/atlas/','/atlas/index.html']:
            body=versions[Site.version];kind='text/html; charset=utf-8'
        elif path=='/atlas/sw.js':
            source=WORKER+('\n// worker-only update\n' if Site.version==4 else '')
            body=make_worker(versions[Site.version],source,{n:(ROOT/n).read_bytes() for n in ['manifest.webmanifest','icon-192.png','icon-512.png','og.png']})['worker'].encode();kind='application/javascript'
        elif path.startswith('/atlas/') and path.rsplit('/',1)[-1] in ['manifest.webmanifest','icon-192.png','icon-512.png']:
            if Site.fail_asset and path.endswith('icon-512.png'):
                self.send_response(503);self.end_headers();return
            name=path.rsplit('/',1)[-1];body=(ROOT/name).read_bytes();kind='image/png' if name.endswith('.png') else 'application/manifest+json'
        else:self.send_response(404);self.send_header('Content-Type','text/plain');self.end_headers();self.wfile.write(b'Not found');return
        self.send_response(200);self.send_header('Content-Type',kind);self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
server=http.server.ThreadingHTTPServer(('127.0.0.1',8774),Site);threading.Thread(target=server.serve_forever,daemon=True).start()
URL='http://127.0.0.1:8774/atlas/'
try:
 with sync_playwright() as pw:
    b=pw.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');p=ctx.new_page();errors=[]
    p.on('pageerror',lambda e:errors.append(str(e)))
    p.route('**/fonts.g*/*',lambda r:r.abort())
    p.goto(URL);p.wait_for_selector('#loading',state='hidden');p.evaluate('closeOverlay()')
    p.wait_for_function('offlineState.ready',timeout=30000)
    check('published bundle reports confirmed offline readiness',p.evaluate('offlineState.ready'))
    keys=p.evaluate("async()=>{const n=(await caches.keys()).find(k=>k.startsWith('atlas:'));return (await (await caches.open(n)).keys()).map(r=>r.url)}")
    check('cache holds one canonical document and three bounded assets',len(keys)==4 and sum(u.endswith('index.html') for u in keys)==1 and not any(u.endswith('/atlas/') for u in keys),keys)
    p.evaluate("markSeen('566');journeyRecord().notes.lagos='Kept through the update';store.set(saved)")
    ctx.set_offline(True);started=time.monotonic();p.reload();p.wait_for_selector('#loading',state='hidden',timeout=10000)
    check('offline reopening uses the cache without waiting for a network timeout',time.monotonic()-started<8)
    p.click('#panel [data-act=jresume]');check('offline journey and saved notes reopen',p.evaluate("journeyRecord().notes.lagos==='Kept through the update'"))
    p.goto(URL+'index.html?offline-route=1');p.wait_for_selector('#loading',state='hidden',timeout=10000)
    check('query-string navigation reuses the same document cache',p.evaluate("async()=>{const n=(await caches.keys()).find(k=>k.startsWith('atlas:'));return (await (await caches.open(n)).keys()).length===4}"))
    ctx.set_offline(False);p.wait_for_function('!!offlineState.registration');
    p.evaluate("async()=>{await (await caches.open('unrelated-app')).put('/other/data',new Response('keep'));await (await caches.open('mma-other')).put('/elsewhere/index.html',new Response('keep'));await (await caches.open('mma-legacy')).put('/atlas/index.html',new Response('old'));}")
    Site.version=2;p.evaluate('offlineState.registration.update()');p.wait_for_function('!!offlineState.registration.waiting',timeout=30000);p.wait_for_function('offlineState.update',timeout=10000)
    check('an available update waits rather than replacing the active app',not p.evaluate("D.journeys.title.includes('edition two')"))
    p.click('#explorersbtn');p.wait_for_selector('#offline-apply',state='visible')
    p.evaluate("(()=>{window.realSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===store.key)throw new DOMException('full','QuotaExceededError');return realSet.call(this,k,v)};})()")
    p.click('#offline-apply');check('failed progress saving prevents an update reload',p.evaluate('!offlineState.applying && !!offlineState.registration.waiting'))
    p.evaluate('(()=>{Storage.prototype.setItem=realSet;})()');p.click('#offline-apply');p.wait_for_function("!!D.journeys && D.journeys.title.includes('edition two')",timeout=30000);p.wait_for_function('offlineState.ready')
    check('applying the waiting update preserves notes and progress',p.evaluate("saved.seen.includes('566') && journeyRecord().notes.lagos==='Kept through the update'"))
    names=p.evaluate('caches.keys()');check('activation removes only obsolete caches owned by this atlas',sum(n.startswith('atlas:') for n in names)==1 and 'unrelated-app' in names and 'mma-other' in names and 'mma-legacy' not in names,names)
    result=p.evaluate("async()=>{const r=await fetch('missing.png');return {status:r.status,type:r.headers.get('content-type'),text:await r.text()}}")
    check('a missing asset is not answered with cached HTML',result['status']==404 and '<html' not in result['text'].lower())
    Site.version=3;Site.fail_asset=True;p.evaluate('offlineState.registration.update()');p.wait_for_function('!!offlineState.error',timeout=30000)
    check('an incomplete new download keeps the previous app active',p.evaluate("D.journeys.title.includes('edition two') && !offlineState.registration.waiting"))
    ctx.set_offline(True);p.reload();p.wait_for_selector('#loading',state='hidden',timeout=10000)
    check('the last good version still opens offline after a failed update',p.evaluate("D.journeys.title.includes('edition two') && journeyRecord().notes.lagos==='Kept through the update'"))
    ctx.set_offline(False);Site.fail_asset=False;p.wait_for_function('!!offlineState.registration');p.evaluate('offlineState.registration.update()');p.wait_for_function('!!offlineState.registration.waiting',timeout=30000)
    check('retry can finish the previously failed update',p.evaluate('!!offlineState.registration.waiting'))
    p.wait_for_function('offlineState.update');p.click('#explorersbtn');p.click('#offline-apply');p.wait_for_function("D.journeys.title.includes('edition three')",timeout=30000);p.wait_for_function('offlineState.ready')
    Site.version=4;Site.fail_asset=True;p.evaluate('offlineState.registration.update()');p.wait_for_function('!!offlineState.error',timeout=30000)
    ctx.set_offline(True);p.reload();p.wait_for_selector('#loading',state='hidden',timeout=10000)
    check('a failed worker-only update cannot delete the active document cache',p.evaluate("D.journeys.title.includes('edition three') && journeyRecord().notes.lagos==='Kept through the update'"))
    check('installed/offline/update flows have no script errors',not errors,errors)
    ctx.close();b.close()
finally:server.shutdown()
failed=[n for n,ok in results if not ok];print(f'\n{len(results)-len(failed)}/{len(results)} offline-update checks passed',flush=True);raise SystemExit(1 if failed else 0)
