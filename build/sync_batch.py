"""Copy a batch file into src/index.html, replacing the block that starts with its header line.
    python3 build/sync_batch.py build/batches/b24_vs.js"""
import sys, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MK = "/* ---------- v9: navigation, course path, home, sharing, theme, phone layout ---------- */"
b = open(sys.argv[1]).read(); head = b.split("\n", 1)[0][:40]
p = os.path.join(R, "src", "index.html"); s = open(p).read()
i = s.find(head)
if i < 0: s = s.replace(MK, b + MK, 1)
else:
    nxt = [k for k in (s.find("/* ---------- batch ", i + 10), s.find(MK, i)) if k > 0]; j = min(nxt)
    s = s[:i] + b + s[j:]
open(p, "w").write(s); print("synced", sys.argv[1])
