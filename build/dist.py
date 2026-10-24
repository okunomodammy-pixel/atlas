"""Build the atlas from src/ into out/.

  out/dist/index.html                  data embedded, libraries from CDN (used for the Claude artifact copy and tests)
  out/standalone/Mental-Map-Atlas.html libraries inlined too; this is what is deployed as index.html
  out/standalone/mental-map-atlas-site.zip

Run from anywhere:  python3 build/dist.py
Needs:              npm ci  (d3 and topojson-client, pinned by package-lock.json)
"""
import os, zipfile
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # repo root
NM=os.path.join(R,"node_modules")
O=os.path.join(R,"out")
s=open(f"{R}/src/index.html").read()
blocks="".join(f'<script type="application/json" id="d-{n}">'+open(f"{R}/src/data/{n}.json").read().replace("</","<\\/")+'</script>\n' for n in ["world","facts","physical","cities","nigeria","hist","wpp","econ","now"])
# figures from the automatic pipeline (pipeline/run.py); optional: the app falls back without it
PL=os.path.join(R,"data","atlas","pipeline.json")
if os.path.exists(PL) and "--no-pipeline" not in __import__("sys").argv:
    blocks+='<script type="application/json" id="d-pipeline">'+open(PL).read().replace("</","<\\/")+'</script>\n'

i=s.index('<script src="https://cdnjs')
art=s[:i]+blocks+s[i:]
os.makedirs(f"{O}/dist",exist_ok=True); open(f"{O}/dist/index.html","w").write(art)
# standalone: full document, libraries inlined, works offline in any browser
d3=open(f"{NM}/d3/dist/d3.min.js").read(); tj=open(f"{NM}/topojson-client/dist/topojson-client.min.js").read()
st=art.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>','<script>'+d3.replace("</script","<\\/script")+'</script>')
st=st.replace('<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js"></script>','<script>'+tj+'</script>')
assert "cdnjs" not in st and "jsdelivr" not in st
head='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="description" content="An interactive world atlas and geography course: explore every country, learn how the map was made, and test yourself with games."><meta name="theme-color" content="#0D6070"><meta property="og:title" content="Mental Map Atlas"><meta property="og:description" content="Explore every country, take a seven-lesson geography course, and test yourself with map games."><meta property="og:type" content="website"><meta property="og:image" content="https://okunomodammy-pixel.github.io/atlas/og.png"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2215%22 fill=%22%230D6070%22/%3E%3Cpath d=%22M3 16h26M16 3c4 4 5.5 8.5 5.5 13S20 25 16 29M16 3c-4 4-5.5 8.5-5.5 13S12 25 16 29%22 fill=%22none%22 stroke=%22white%22 stroke-width=%221.8%22/%3E%3Ccircle cx=%2221%22 cy=%2212%22 r=%223%22 fill=%22%23F0A43A%22/%3E%3C/svg%3E"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
st=head+st.replace("<title>","<title>",1)
# move everything up to first <div class="app"> into head
j=st.index('<div class="app"'); st=st[:j]+"</head><body>\n"+st[j:]+"\n</body></html>\n"
os.makedirs(f"{O}/standalone",exist_ok=True)
open(f"{O}/standalone/Mental-Map-Atlas.html","w").write(st)
with zipfile.ZipFile(f"{O}/standalone/mental-map-atlas-site.zip","w",zipfile.ZIP_DEFLATED) as z: z.writestr("index.html", st)
print(len(art), len(st), os.path.getsize(f"{O}/standalone/mental-map-atlas-site.zip"))
