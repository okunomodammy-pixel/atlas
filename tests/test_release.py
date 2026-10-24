"""Review notices, approval by comment, and the release gate. No network: GitHub's API is faked locally.

    python3 tests/test_release.py
"""
import glob, http.server, json, os, shutil, sys, threading
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
from pipeline_fixtures import Replay, make_root
from pipeline.run import Run
from pipeline import notify, approve_from_issue

RES = []
def check(name, ok, detail=""):
    RES.append((name, bool(ok))); print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))

# ---- a fake GitHub issues API
class GH(http.server.BaseHTTPRequestHandler):
    issues, calls = [], []
    def log_message(self, *a): pass
    def _send(self, code, obj=None):
        b = json.dumps(obj).encode() if obj is not None else b""
        self.send_response(code); self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)
    def _body(self): n = int(self.headers.get("Content-Length") or 0); return json.loads(self.rfile.read(n)) if n else None
    def do_GET(self):
        GH.calls.append(("GET", self.path)); self._send(200, [i for i in GH.issues if i["state"] == "open"])
    def do_POST(self):
        b = self._body(); GH.calls.append(("POST", self.path, b))
        if self.path.endswith("/issues"):
            i = {"number": len(GH.issues) + 1, "state": "open", "body": b["body"], "title": b["title"], "labels": b["labels"], "comments": []}; GH.issues.append(i); return self._send(201, i)
        if "/comments" in self.path:
            n = int(self.path.split("/issues/")[1].split("/")[0]); GH.issues[n - 1]["comments"].append(b["body"]); return self._send(201, {})
        self._send(201, {})
    def do_PATCH(self):
        b = self._body(); GH.calls.append(("PATCH", self.path, b)); n = int(self.path.rsplit("/", 1)[1]); GH.issues[n - 1].update(b); self._send(200, GH.issues[n - 1])
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 8799), GH); threading.Thread(target=srv.serve_forever, daemon=True).start()
API = "http://127.0.0.1:8799"
N = lambda root: notify.main(token="t", repo="o/atlas", owner="owner", root=root, api=API)

def run(root, replay=None): return {r["indicator"]: r for r in Run(root=root, transport=replay or Replay(), sleep=lambda s: None).go()["results"]}

# ---- nothing waiting: no issue
root = make_root(); res = run(root)
a = json.load(open(os.path.join(root, "pipeline", "config", "approvals.json")))
for i, r in res.items(): a["approve"][i] = r["approve_with"]
json.dump(a, open(os.path.join(root, "pipeline", "config", "approvals.json"), "w")); run(root)
check("nothing waiting: no issue is opened", N(root) == "nothing" and not GH.issues)

# ---- a held update opens one issue that names it, its reasons and its hash
def big(j): j["values"]["NGDPD"]["NGA"]["2024"] = 400.0; return j
res = run(root, Replay(edit={"imf_dm_ngdpd_all": big}))
h = res["gdp_usd"]["approve_with"]
out = N(root); iss = GH.issues[0] if GH.issues else {}
check("held update: one issue opened, labelled data-review", out == "opened" and len(GH.issues) == 1 and iss["labels"] == ["data-review"])
check("held update: the issue names the figure, the reason, the version and how to approve",
      all(x in iss["body"] for x in ["GDP, current prices", "revisions beyond", h, "`approve`", f"gdp_usd={h}"]), iss.get("body", "")[:300])
check("held update: the owner is mentioned so GitHub notifies them", iss["body"].startswith("@owner"))
check("same state next week: the issue is not rewritten", N(root) == "unchanged" and len(GH.issues) == 1)

# ---- approval by comment: only exactly what the issue listed
check("a comment that is not 'approve' approves nothing", approve_from_issue.approve(iss["body"], "looks odd, will check", root) == {})
check("'approve' with a stale hash approves nothing",
      approve_from_issue.approve(iss["body"].replace(h, "0" * 16), "approve", root) == {})
check("'Approve.' approves exactly the listed version", approve_from_issue.approve(iss["body"], "Approve.", root) == {"gdp_usd": h})
res = run(root, Replay(edit={"imf_dm_ngdpd_all": big}))
check("after approval the next run publishes it", res["gdp_usd"].get("approved") == h and json.load(open(os.path.join(root, "data", "normal", "gdp_usd.json")))["hash"] == h)
check("nothing waiting any more: the issue is closed with a note", N(root) == "closed" and GH.issues[0]["state"] == "closed" and GH.issues[0]["comments"])

# ---- a source down for weeks is reported
m = json.load(open(os.path.join(root, "data", "manifest.json")))
m["sources"]["worldbank"].update(last_status="failed", last_success="2026-01-01T00:00:00Z", last_error="HTTP 502")
json.dump(m, open(os.path.join(root, "data", "manifest.json"), "w"))
out = N(root)
check("a source unreachable for 3 weeks opens an issue saying so", out == "opened" and "Sources not reachable" in GH.issues[-1]["body"] and "HTTP 502" in GH.issues[-1]["body"])
m["sources"]["worldbank"].update(last_status="failed", last_success=__import__("datetime").datetime.now(__import__("datetime").timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))
json.dump(m, open(os.path.join(root, "data", "manifest.json"), "w"))
check("a source down for a day is not reported yet (no issue noise)", N(root) == "closed")

# ---- the release gate: a failing test leaves the site untouched
import subprocess
R = os.path.dirname(HERE)
snap = {f: open(os.path.join(R, f), "rb").read() for f in ("index.html", "sw.js")}
broken = os.path.join(R, "tests", "smoke.py"); keep = open(broken).read()
try:
    open(broken, "w").write("raise SystemExit(1)\n")
    rc = subprocess.run([sys.executable, "-m", "pipeline.release"], cwd=R, capture_output=True, text=True).returncode
finally:
    open(broken, "w").write(keep)
check("release: a failing site test stops the release and leaves index.html and sw.js untouched",
      rc == 1 and all(open(os.path.join(R, f), "rb").read() == b for f, b in snap.items()))
rc = subprocess.run([sys.executable, "-m", "pipeline.release", "--no-tests"], cwd=R, capture_output=True, text=True).returncode
rel = json.load(open(os.path.join(R, "out", "release.json")))
sw = open(os.path.join(R, "sw.js")).read()
check("release: the offline cache name is the page's hash, and _site has exactly the six site files",
      rc == 0 and f'"{rel["cache"]}"' in sw and sorted(os.listdir(os.path.join(R, "_site"))) == sorted(rel["site_files"]))
for f, b in snap.items(): open(os.path.join(R, f), "wb").write(b)   # leave the working copy as it was
srv.shutdown()
failed = [n for n, ok in RES if not ok]
print(f"\n{len(RES) - len(failed)}/{len(RES)} release checks passed")
sys.exit(1 if failed else 0)
