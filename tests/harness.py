"""Shared test setup: serves out/dist on 127.0.0.1:8765 and opens it in Playwright Chromium.

Libraries are served from node_modules instead of the CDN, and Google Fonts are blocked,
so the tests do not need the internet. The page is wrapped in the same minimal document
skeleton the Claude artifact host adds (out/dist/_t.html).
Loaded by every test with:  exec(open(os.path.join(os.path.dirname(__file__), "..", "harness.py")).read())
"""
import sys, threading, http.server, functools, os
from playwright.sync_api import sync_playwright
A=os.path.dirname(os.path.abspath(__file__))
while not os.path.exists(os.path.join(A,"package.json")): A=os.path.dirname(A)   # repo root
OUT=os.path.join(A,"out","test"); os.makedirs(OUT,exist_ok=True)
STANDALONE=os.path.join(A,"out","standalone","Mental-Map-Atlas.html")
H=functools.partial(http.server.SimpleHTTPRequestHandler, directory=A+"/out/dist")
http.server.SimpleHTTPRequestHandler.log_message=lambda *a: None
http.server.ThreadingHTTPServer.allow_reuse_address=True
srv=http.server.ThreadingHTTPServer(("127.0.0.1",8765),H); threading.Thread(target=srv.serve_forever,daemon=True).start()
LIB={"d3.min.js":A+"/node_modules/d3/dist/d3.min.js","topojson-client.min.js":A+"/node_modules/topojson-client/dist/topojson-client.min.js"}
def route(r):
    u=r.request.url
    for k,v in LIB.items():
        if u.endswith(k): return r.fulfill(path=v, content_type="application/javascript")
    if "fonts.g" in u: return r.abort()
    r.continue_()
SK='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
open(A+"/out/dist/_t.html","w").write(SK+open(A+"/out/dist/index.html").read()+"</body></html>")
def page(b, w, h, hash="", dark=False):
    ctx=b.new_context(viewport={"width":w,"height":h}, color_scheme="dark" if dark else "light")
    p=ctx.new_page(); errs=[]
    p.on("pageerror", lambda e: errs.append(str(e))); p.on("console", lambda m: m.type=="error" and errs.append(m.text))
    p.route("**/*", route)
    p.goto(f"http://127.0.0.1:8765/_t.html#{hash}"); p.wait_for_selector("#loading", state="hidden", timeout=20000); p.wait_for_timeout(1200); p.evaluate("closeOverlay()")
    return p, errs
