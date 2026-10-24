"""Rebuild the map and country data in src/data/ from public sources.

Writes world, facts, physical, cities, nigeria and hist .json.
The other three data files (wpp, econ, now) are not made here; see BUILD.md.

  python3 build/build_data.py [--out DIR]       default DIR is src/data

Inputs:
  node_modules/world-atlas, node_modules/world-countries   (npm ci)
  Natural Earth vector GeoJSON: a clone of github.com/nvkelso/natural-earth-vector,
      path in env NE_GEOJSON (default ../natural-earth-vector/geojson next to the repo)
  data/intermediate/*.json  simplified layers made earlier with mapshaper (commands not recorded)
"""
import json, shutil, os, sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NE=os.environ.get("NE_GEOJSON", os.path.join(os.path.dirname(R),"natural-earth-vector","geojson"))
OUT=sys.argv[sys.argv.index("--out")+1] if "--out" in sys.argv else os.path.join(R,"src","data")
I=os.path.join(R,"data","intermediate"); NM=os.path.join(R,"node_modules")
os.makedirs(OUT, exist_ok=True)
def load(p): return json.load(open(p))
# 1. country shapes (Natural Earth 1:50m via world-atlas)
shutil.copy(f"{NM}/world-atlas/countries-50m.json", f"{OUT}/world.json")
# 2. country facts
wc = load(f"{NM}/world-countries/countries.json")
ne = {f["properties"]["ADM0_A3"]: f["properties"] for f in load(f"{NE}/ne_50m_admin_0_countries.geojson")["features"]}
ne_iso = {p["ISO_A3"]: p for p in ne.values() if p["ISO_A3"] not in ("-99", None)}
facts = {}
for c in wc:
    n = ne_iso.get(c["cca3"]) or ne.get(c["cca3"]) or ({"KOS": ne.get("KOS")}.get(c["cca3"]) if c["cca3"]=="UNK" else None)
    if c["cca3"] == "UNK": n = ne.get("KOS")
    key = c["ccn3"] or c["cca3"]
    facts[key] = {
        "n": c["name"]["common"], "o": c["name"]["official"], "c3": c["cca3"], "n3": c["ccn3"],
        "cap": c.get("capital", []), "reg": c["region"], "sub": c.get("subregion", ""),
        "ll": c["latlng"], "land": c["landlocked"], "b": c["borders"], "a": c["area"],
        "lang": list((c.get("languages") or {}).values()), "ind": c.get("independent"), "un": c.get("unMember"),
        "flag": c.get("flag", ""), "alt": c.get("altSpellings", []),
        "pop": n and n.get("POP_EST"), "popY": n and n.get("POP_YEAR"),
        "gdp": n and n.get("GDP_MD"), "gdpY": n and n.get("GDP_YEAR"),
        "inc": n and (n.get("INCOME_GRP") or "")[3:], "sov": n and n.get("SOVEREIGNT"), "type": n and n.get("TYPE"),
    }
# correction: Vatican City is a UN observer state, not a member (world-countries marks it as a member)
for f in facts.values():
    if f["c3"] == "VAT": f["un"] = False
    f["obs"] = f["c3"] in ("VAT", "PSE")
json.dump(facts, open(f"{OUT}/facts.json", "w"), ensure_ascii=False, separators=(",", ":"))
un = sum(1 for f in facts.values() if f["un"]); print("facts", len(facts), "UN members", un,
      "observers present:", [f["n"] for f in facts.values() if f["c3"] in ("VAT", "PSE")])
# 3. physical layers
def topo(p): return load(p)
phys = {"rivers": topo(f"{I}/rivers.json"), "lakes": topo(f"{I}/lakes.json"), "tz": topo(f"{I}/tz.json")}
keep = {"Range/mtn","Desert","Plateau","Basin","Plain","Pen/cape","Peninsula","Delta","Valley","Isthmus","Island","Island group","Wetlands","Lowland","Tundra","Geoarea"}
phys["labels"] = [{"n": f["properties"]["NAME"], "c": f["properties"]["FEATURECLA"], "r": f["properties"]["REGION"],
                   "s": f["properties"]["SCALERANK"], "x": round(f["geometry"]["coordinates"][0], 2), "y": round(f["geometry"]["coordinates"][1], 2)}
                  for f in load(f"{I}/region_pts.json")["features"] if f["properties"]["FEATURECLA"] in keep and f["geometry"]]
phys["marine"] = [{"n": f["properties"]["name"], "c": f["properties"]["featurecla"], "s": f["properties"]["scalerank"],
                   "x": round(f["geometry"]["coordinates"][0], 2), "y": round(f["geometry"]["coordinates"][1], 2)}
                  for f in load(f"{I}/marine_pts.json")["features"] if f["geometry"] and f["properties"]["name"]]
phys["peaks"] = [{"n": f["properties"]["name"], "c": f["properties"]["featurecla"], "e": f["properties"].get("elevation"),
                  "x": round(f["geometry"]["coordinates"][0], 2), "y": round(f["geometry"]["coordinates"][1], 2)}
                 for f in load(f"{NE}/ne_50m_geography_regions_elevation_points.geojson")["features"] if f["properties"]["name"]]
# ocean depth bands (Natural Earth bathymetry, simplified)
phys["bathy"] = {k: topo(f"{I}/b_{k}.json") for k in ["K_200", "H_3000", "F_5000", "D_7000"]}
phys = {k: phys[k] for k in ["rivers", "lakes", "labels", "marine", "peaks", "tz", "bathy"]}  # original key order
json.dump(phys, open(f"{OUT}/physical.json", "w"), ensure_ascii=False, separators=(",", ":"))
print("labels", len(phys["labels"]), "marine", len(phys["marine"]), "peaks", len(phys["peaks"]))
# 4. cities
pp = load(f"{NE}/ne_10m_populated_places_simple.geojson")["features"]
cities = []
for f in pp:
    p = f["properties"]
    cap = p["featurecla"] == "Admin-0 capital"; alt = p["featurecla"] == "Admin-0 capital alt"
    if cap or alt or p["scalerank"] <= 1 or (p["adm0_a3"] == "NGA" and p["scalerank"] <= 6):
        cities.append({"n": p["name"], "y": round(p["latitude"], 3), "x": round(p["longitude"], 3), "p": p["pop_max"],
                       "c3": p["adm0_a3"], "cap": cap, "s": p["scalerank"], "a1": p.get("adm1name")})
json.dump(cities, open(f"{OUT}/cities.json", "w"), ensure_ascii=False, separators=(",", ":"))
print("cities", len(cities), "NGA:", sorted(c["n"] for c in cities if c["c3"] == "NGA"))
# 5. Nigeria
json.dump({"states": load(f"{I}/ng_states.json"), "rivers": load(f"{I}/ng_rivers.json")},
          open(f"{OUT}/nigeria.json", "w"), ensure_ascii=False, separators=(",", ":"))
# 6. historical borders (André Ourednik, historical-basemaps, GPL-3.0), simplified; key order matters for a byte-identical file
YEARS = ["200", "1500", "1815", "1880", "1914", "1938", "1960", "1994", "1783", "1945"]
json.dump({y: load(f"{I}/hist/h{y}.json") for y in YEARS}, open(f"{OUT}/hist.json", "w"), ensure_ascii=False, separators=(",", ":"))
print("hist", len(YEARS), "years")
