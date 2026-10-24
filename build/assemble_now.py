"""Assemble src/data/now.json from the figures extracted from the source documents.

  python3 build/assemble_now.py [--out DIR]

data/extracted/ holds the figures as they were read from each document (October 2026):
  imf.json, imf_world.json  IMF World Economic Outlook, October 2026, statistical annex tables
  energy.json               Energy Institute, Statistical Review of World Energy 2026
  mig.json                  UN DESA, International Migrant Stock 2024
  ndgain.json               ND-GAIN Country Index, 2026 release (2024 data)
  mpi.json                  Nigeria Multidimensional Poverty Index 2022, state table
The scripts that read those documents were run interactively and were not saved; see BUILD.md.
"""
import json, os, sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[sys.argv.index("--out")+1] if "--out" in sys.argv else os.path.join(R,"src","data")
X=os.path.join(R,"data","extracted"); L=lambda n: json.load(open(os.path.join(X,n+".json")))
imf=L("imf"); imf["WORLD"]=L("imf_world")
now={"imf":imf,"energy":L("energy"),"mig":L("mig"),"gain":L("ndgain"),"mpi":L("mpi")}
os.makedirs(OUT,exist_ok=True)
json.dump(now,open(os.path.join(OUT,"now.json"),"w"),ensure_ascii=False,separators=(",",":"))
print("now.json:", {k:len(v) for k,v in now.items()})
