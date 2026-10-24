"""Build src/data/wpp.json from UN World Population Prospects 2024.

  python3 build/build_wpp.py WPP2024_GEN_F01_DEMOGRAPHIC_INDICATORS_COMPACT.xlsx [--out DIR]

Input: the WPP 2024 "Demographic indicators, compact" workbook (sheets "Estimates" and
"Medium variant"), from https://population.un.org/wpp/downloads (CC BY 3.0 IGO).
The workbook is 26 MB, so it is not stored in the repo.

Per country (ISO3 code), plus WORLD (location 900), AFRICA (903) and SSA (1834, SDG region):
  p1960, p2000          population on 1 July, estimates
  p2024, p2026, p2050, p2075, p2100   population on 1 July, medium-variant projection
                        (p2024 for countries and WORLD only, as in the original file)
  ma, gr, tfr, le, imr, nmr   2026 medium variant: median age, growth %, fertility,
                        life expectancy, infant mortality per 1,000, net migration per 1,000
  ma50                  median age in 2050
"""
import openpyxl, json, os, sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=sys.argv[1]
OUT=sys.argv[sys.argv.index("--out")+1] if "--out" in sys.argv else os.path.join(R,"src","data")
AGG={900:"WORLD",1834:"SSA",903:"AFRICA"}   # 1834 = Sub-Saharan Africa (SDG region)
def num(x):
    try: return float(x)
    except (TypeError, ValueError): return None
def rows(ws):
    it=ws.iter_rows(values_only=True); H=None
    for r in it:
        if r and r[0]=="Index": H=r; break
    ix={h:i for i,h in enumerate(H)}
    for r in it:
        if r[ix["Year"]] is None: continue
        loc=r[ix["Location code"]]; iso=r[ix["ISO3 Alpha-code"]]
        key=AGG.get(loc) or (iso if iso else None)
        if key: yield key, int(r[ix["Year"]]), r, ix
wb=openpyxl.load_workbook(SRC, read_only=True)
out={}
POP="Total Population, as of 1 July (thousands)"
def pop(r,ix): v=num(r[ix[POP]]); return None if v is None else round(v*1000)
for key,y,r,ix in rows(wb["Estimates"]):
    if y in (1960,2000): out.setdefault(key,{})[f"p{y}"]=pop(r,ix)
for key,y,r,ix in rows(wb["Medium variant"]):
    d=out.setdefault(key,{})
    if y==2026:
        d["p2026"]=pop(r,ix)
        for k,col in [("ma","Median Age, as of 1 July (years)"),("gr","Population Growth Rate (percentage)"),
                      ("tfr","Total Fertility Rate (live births per woman)"),("le","Life Expectancy at Birth, both sexes (years)"),
                      ("imr","Infant Mortality Rate (infant deaths per 1,000 live births)"),("nmr","Net Migration Rate (per 1,000 population)")]:
            v=num(r[ix[col]]); d[k]=None if v is None else round(v,2)
    elif y==2050: d["p2050"]=pop(r,ix); v=num(r[ix["Median Age, as of 1 July (years)"]]); d["ma50"]=None if v is None else round(v,2)
    elif y in (2075,2100): d[f"p{y}"]=pop(r,ix)
for key,y,r,ix in rows(wb["Medium variant"]):
    if y==2024 and key not in ("AFRICA","SSA"): out[key]["p2024"]=pop(r,ix)
os.makedirs(OUT,exist_ok=True)
json.dump(out,open(os.path.join(OUT,"wpp.json"),"w"),ensure_ascii=False,separators=(",",":"))
print("wpp.json:", len(out), "places")
