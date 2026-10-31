"""Build the site, test it, and stage it for publishing. Nothing changes if a test fails.

    python3 -m pipeline.release [--no-tests]

1. builds out/ from src/ and data/ (build/dist.py)
2. runs browser, learning-foundation, pipeline integration and Nigeria checks against the build (unless --no-tests)
3. only if they pass: copies the build to index.html when it differs, and sets the offline cache
   name in sw.js to a hash of the page, so phones fetch the new version
4. assembles _site/ (the files GitHub Pages serves) and writes out/release.json

Exit code 1 means a test failed; index.html, sw.js and _site/ were not touched.
"""
import hashlib, json, os, re, shutil, subprocess, sys
from build.site_version import make_worker

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_FILES = ["index.html", "sw.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "og.png"]


def run(*cmd):
    print("$", " ".join(cmd), flush=True)
    return subprocess.run([sys.executable, *cmd], cwd=R).returncode


def main(argv):
    report = {"tests": "skipped" if "--no-tests" in argv else None, "changed": False}
    if run("build/dist.py"): raise SystemExit("build failed")
    if "--no-tests" not in argv:
        failed = [t for t in ("tests/test_site_version.py", "tests/smoke.py", "tests/test_learning_foundations.py", "tests/test_journeys.py", "tests/test_explorers.py", "tests/test_offline_updates.py", "tests/test_atlas_pipeline.py", "tests/test_nigeria.py") if run(t)]
        report["tests"] = "failed: " + ", ".join(failed) if failed else "passed"
        if failed:
            json.dump(report, open(os.path.join(R, "out", "release.json"), "w"), indent=1)
            print("::error::site tests failed; the live site was not changed: " + ", ".join(failed))
            raise SystemExit(1)
    built = open(os.path.join(R, "out", "standalone", "Mental-Map-Atlas.html"), "rb").read()
    cur_p = os.path.join(R, "index.html")
    if not os.path.exists(cur_p) or open(cur_p, "rb").read() != built:
        open(cur_p + ".tmp", "wb").write(built); os.replace(cur_p + ".tmp", cur_p); report["changed"] = True
    sw_p = os.path.join(R, "sw.js"); sw = open(sw_p).read()
    bundle=make_worker(built,sw,{f:open(os.path.join(R,f),"rb").read() for f in SITE_FILES if f not in ("index.html","sw.js")})
    sw2 = bundle["worker"]
    if sw2 != sw: open(sw_p, "w").write(sw2); report["changed"] = True
    site = os.path.join(R, "_site"); shutil.rmtree(site, ignore_errors=True); os.makedirs(site)
    for f in SITE_FILES: shutil.copy(os.path.join(R, f), site)
    report.update(page_sha=bundle["page_sha"], cache=bundle["cache"], bytes=len(built), site_files=SITE_FILES)
    json.dump(report, open(os.path.join(R, "out", "release.json"), "w"), indent=1)
    print(json.dumps(report))


if __name__ == "__main__":
    main(sys.argv[1:])
