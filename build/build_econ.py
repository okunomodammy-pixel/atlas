"""Build src/data/econ.json: currencies (world-countries 5.1.0) and Natural Earth's economy class,
with the hand corrections in data/extracted/econ_corrections.json applied on top.

  python3 build/build_econ.py [--out DIR]
Needs npm ci and the Natural Earth clone (env NE_GEOJSON), as build_data.py does.
Note: the atlas does not display Natural Earth's "G20" labels, which are wrong for several countries.
"""
import json, os, sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NE=os.environ.get("NE_GEOJSON", os.path.join(os.path.dirname(R),"natural-earth-vector","geojson"))
OUT=sys.argv[sys.argv.index("--out")+1] if "--out" in sys.argv else os.path.join(R,"src","data")
wc=json.load(open(os.path.join(R,"node_modules","world-countries","countries.json")))
ne={f["properties"]["ADM0_A3"]: f["properties"] for f in json.load(open(f"{NE}/ne_50m_admin_0_countries.geojson"))["features"]}
ne_iso={p["ISO_A3"]: p for p in ne.values() if p["ISO_A3"] not in ("-99", None)}
fix=json.load(open(os.path.join(R,"data","extracted","econ_corrections.json")))["records"]
out={}
for c in wc:
    n=ne_iso.get(c["cca3"]) or ne.get(c["cca3"])
    if c["cca3"]=="UNK": n=ne.get("KOS")
    out[c["cca3"]]={"cur":[[k,v.get("name"),v.get("symbol")] for k,v in (c.get("currencies") or {}).items()],"eco":n and n.get("ECONOMY")}
    if c["cca3"] in fix: out[c["cca3"]]=fix[c["cca3"]]
os.makedirs(OUT,exist_ok=True)
json.dump(out,open(os.path.join(OUT,"econ.json"),"w"),ensure_ascii=False,separators=(",",":"))
print("econ.json:", len(out), "countries,", len(fix), "corrected")
