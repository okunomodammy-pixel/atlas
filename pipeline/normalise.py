"""Turn a source response into the atlas's record format, joined by code (never by name).

Normalised document for one indicator:
  {indicator, source, source_code, name, unit, kind, definition, fingerprint,
   edition, edition_label, edition_date, retrieved, raw: [files],
   status_basis, series: {ATLAS_ISO3 or "WORLD": {"YYYY": [value, status]}},
   unmatched: [source codes that are neither atlas countries nor known aggregates]}

Status values:
  observed    year <= the IMF's "latest actual annual data" year for that economy and area
  estimate    after that year and before the edition's first projection year (IMF staff estimate)
  projection  from the edition's first projection year onward, as stated by the IMF
  unstated    the edition table gives no latest-actual year for that economy and area
  aggregate   the IMF world total before the projection years: a sum of actual and estimated country data
  reported    World Bank value; the API does not flag estimates per value
  classification
"""
import hashlib, json, math, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def fingerprint(definition):
    keep = {k: definition.get(k) for k in ("label", "unit", "description", "dataset")}
    return hashlib.sha256(json.dumps(keep, sort_keys=True).encode()).hexdigest()[:16]


def crosswalk(countries_cfg, facts):
    """source -> {source_code: atlas_code} for the atlas's countries, plus the world aggregate."""
    atlas = sorted({f["c3"] for f in facts.values()})
    out = {}
    for src in ("imf", "worldbank"):
        m = {}
        for c in atlas:
            m[(countries_cfg["exceptions"].get(c) or {}).get(src, c)] = c
        m[countries_cfg["world"][src]] = "WORLD"
        out[src] = m
    out["worldbank_country"] = out["worldbank"]
    return out


def load_edition(edition, root=ROOT):
    p = os.path.join(root, "pipeline", "config", "editions", f"weo-{edition}.json")
    return json.load(open(p)) if os.path.exists(p) else None


def imf_status(ed_table, src_code, area, year):
    y = int(year)
    if y >= ed_table["projection_start"]: return "projection"
    la = (ed_table["latest_actual"].get(src_code) or {}).get(area)
    if la is None: return "unstated"
    return "observed" if y <= la else "estimate"


def normalise(ind, fetched, xwalk, aggregates, retrieved, edition_table=None):
    src = ind["source"]; m = xwalk[src]
    lo, hi = ind.get("years", [0, 9999])
    series, unmatched, bad = {}, [], []
    for code, ys in fetched["values"].items():
        atlas = m.get(code)
        if atlas is None:
            if code not in aggregates and code not in NOT_IN_ATLAS.get(src, ()): unmatched.append(code)
            continue
        rec = {}
        for y, v in ys.items():
            if ind["kind"] == "classification":
                if v is not None: rec[y] = [v, "classification"]
                continue
            if not (str(y).isdigit() and lo <= int(y) <= hi): continue
            if v is None: continue                     # missing stays missing; never zero
            if not isinstance(v, (int, float)) or isinstance(v, bool) or not math.isfinite(v):
                bad.append(f"{code} {y}: {v!r}"); continue
            if src == "imf":
                st = imf_status(edition_table, code, ind["status_area"], y) if edition_table else "unstated"
                if atlas == "WORLD" and st == "unstated": st = "aggregate"
            else:
                st = "reported"
            rec[str(y)] = [v, st]
        if rec: series[atlas] = dict(sorted(rec.items()))
    basis = {"imf": (f"IMF WEO Database Appendix {fetched['edition']}: latest actual year per economy ({ind.get('status_area')}); "
                     f"projections from {edition_table['projection_start']}" if edition_table else "no edition table: status not stated"),
             "worldbank": "World Bank Indicators API: values are not flagged as estimates (obs_status blank)",
             "worldbank_country": "classification as listed; the API does not date it"}[src]
    return {"indicator": ind["id"], "source": src, "source_code": ind["code"], "name": ind["name"], "unit": ind["unit"],
            "kind": ind["kind"], "definition": fetched["definition"], "fingerprint": fingerprint(fetched["definition"]),
            "edition": fetched["edition"], "edition_label": fetched["edition_label"], "edition_date": fetched["edition_date"],
            "retrieved": retrieved, "status_basis": basis, "series": dict(sorted(series.items())),
            "unmatched": sorted(unmatched), "invalid": bad}


NOT_IN_ATLAS = {}


def set_not_in_atlas(cfg):
    NOT_IN_ATLAS.clear(); NOT_IN_ATLAS.update(cfg.get("not_in_atlas", {}))
    NOT_IN_ATLAS.pop("note", None)
    NOT_IN_ATLAS["worldbank_country"] = NOT_IN_ATLAS.get("worldbank", [])
