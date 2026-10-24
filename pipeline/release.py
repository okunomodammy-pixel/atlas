"""Build the site, test it, and stage it for publishing. Nothing changes if a test fails.

    python3 -m pipeline.release [--no-tests]

1. builds out/ from src/ and data/ (build/dist.py)
2. runs tests/smoke.py, tests/test_atlas_pipeline.py and tests/test_nigeria.py against the build (unless --no-tests)
3. only if they pass: copies the build to index.html when it differs, and sets the offline cache
   name in sw.js to a hash of the page, so phones fetch the new version
4. assembles _site/ (the files GitHub Pages serves) and writes out/release.json

Exit code 1 means a test failed; index.html, sw.js and _site/ were not touched.
"""
import hashlib, json, os, re, shutil, subprocess, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_FILES = ["index.html", "sw.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "og.png"]


def run(*cmd):
    print("$", " ".join(cmd), flush=True)
    return subprocess.run([sys.executable, *cmd], cwd=R).returncode


def main(argv):
    report = {"tests": "skipped" if "--no-tests" in argv else None, "changed": False}
    if run("build/dist.py"): raise SystemExit("build failed")
    if "--no-tests" not in argv:
        failed = [t for t in ("tests/smoke.py", "tests/test_atlas_pipeline.py", "tests/test_nigeria.py") if run(t)]
        report["tests"] = "failed: " + ", ".join(failed) if failed else "passed"
        if failed:
            json.dump(report, open(os.path.join(R, "out", "release.json"), "w"), indent=1)
            print("::error::site tests failed; the live site was not changed: " + ", ".join(failed))
            raise SystemExit(1)
    built = open(os.path.join(R, "out", "standalone", "Mental-Map-Atlas.html"), "rb").read()
    cur_p = os.path.join(R, "index.html")
    if not os.path.exists(cur_p) or open(cur_p, "rb").read() != built:
        open(cur_p + ".tmp", "wb").write(built); os.replace(cur_p + ".tmp", cur_p); report["changed"] = True
    h = hashlib.sha256(built).hexdigest()[:10]
    sw_p = os.path.join(R, "sw.js"); sw = open(sw_p).read()
    sw2 = re.sub(r'const C = "mma-[^"]*";', f'const C = "mma-{h}";', sw, count=1)
    if sw2 == sw and f'"mma-{h}"' not in sw: raise SystemExit("sw.js: cache name line not found")
    if sw2 != sw: open(sw_p, "w").write(sw2); report["changed"] = True
    site = os.path.join(R, "_site"); shutil.rmtree(site, ignore_errors=True); os.makedirs(site)
    for f in SITE_FILES: shutil.copy(os.path.join(R, f), site)
    report.update(page_sha=h, cache=f"mma-{h}", bytes=len(built), site_files=SITE_FILES)
    json.dump(report, open(os.path.join(R, "out", "release.json"), "w"), indent=1)
    print(json.dumps(report))


if __name__ == "__main__":
    main(sys.argv[1:])
