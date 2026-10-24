"""Check that the repo reproduces itself.

  python3 build/verify.py [--wpp PATH_TO_WPP_XLSX]

1. Rebuilds the data files into out/check/ and compares each with src/data/ byte for byte.
   (wpp.json only when --wpp gives the WPP workbook, which is not stored in the repo.)
2. Builds the app and compares out/standalone/Mental-Map-Atlas.html with the committed index.html.
Exits non-zero on any difference. Needs `npm ci` and the Natural Earth clone (see BUILD.md).
"""
import subprocess, sys, os, filecmp
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHK = os.path.join(R, "out", "check")
def run(*a): subprocess.run([sys.executable, *a], check=True, cwd=R, stdout=subprocess.DEVNULL)
run("build/build_data.py", "--out", CHK)
run("build/build_econ.py", "--out", CHK)
run("build/assemble_now.py", "--out", CHK)
if "--wpp" in sys.argv: run("build/build_wpp.py", sys.argv[sys.argv.index("--wpp") + 1], "--out", CHK)
bad = []
for n in sorted(os.listdir(CHK)):
    same = filecmp.cmp(os.path.join(CHK, n), os.path.join(R, "src", "data", n), shallow=False)
    print(("same     " if same else "DIFFERENT"), "src/data/" + n); same or bad.append(n)
skipped = sorted(set(os.listdir(os.path.join(R, "src", "data"))) - set(os.listdir(CHK)))
for n in skipped: print("not checked src/data/" + n, "(source file not given)")
run("build/dist.py")
same = filecmp.cmp(os.path.join(R, "out", "standalone", "Mental-Map-Atlas.html"), os.path.join(R, "index.html"), shallow=False)
print(("same     " if same else "DIFFERENT"), "index.html (built vs committed)"); same or bad.append("index.html")
sys.exit(1 if bad else 0)
