"""Fetch, check and publish the pilot indicators.

    python3 -m pipeline.run [--only ID,ID] [--dry-run] [--scheduled]
  --scheduled  skip sources checked more recently than their check_every_days (pipeline/config/sources.json)

For each indicator in pipeline/config/indicators.json:
  1. if a held update has been approved in pipeline/config/approvals.json, publish it
  2. fetch from the source (retries, back-off); on failure keep the last good data
  3. normalise: join countries by code, give each value its status, record edition and definition
  4. if nothing changed since the last good data, stop here
  5. validate: failures discard the update; review items hold it in data/review/; otherwise publish
Then rebuild data/atlas/pipeline.json from the published files and write data/manifest.json and
data/UPDATE_LOG.md. With --dry-run nothing under data/ changes; the report goes to out/pipeline-report.json.

Files (all JSON, written atomically so a crash never leaves a half-written file):
  data/raw/<source>/<sha>.json.gz   source responses exactly as received, stored once per content
  data/normal/<id>.json             last good normalised data for each indicator
  data/history/<id>/<edition>.json  the previous edition, kept when a new one is published
  data/review/<id>.json             a held update with the reasons and its approval hash
  data/atlas/pipeline.json          what the atlas build will embed (from Phase 2)
"""
import datetime as dt, gzip, hashlib, json, os, sys
from .http import FetchError
from .normalise import normalise, crosswalk, load_edition, set_not_in_atlas
from .validate import validate
from .sources.imf import IMF
from .sources.worldbank import WorldBank, WorldBankCountry
from .sources.nbs import NBS
from .sources.cbn import CBN

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATUS_CODES = {"observed": "o", "estimate": "e", "projection": "p", "unstated": "u", "aggregate": "a", "reported": "r"}


def jload(p, default=None):
    try:
        with open(p) as f: return json.load(f)
    except FileNotFoundError:
        return default


def jsave(p, obj, compact=False):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    tmp = p + ".tmp"
    with open(tmp, "w") as f:
        json.dump(obj, f, ensure_ascii=False, **({"separators": (",", ":")} if compact else {"indent": 1}))
    os.replace(tmp, p)


def content_hash(doc):
    keep = {k: doc.get(k) for k in ("indicator", "source_code", "fingerprint", "edition", "series", "unmatched", "invalid")}
    return hashlib.sha256(json.dumps(keep, sort_keys=True).encode()).hexdigest()[:16]


class Run:
    def __init__(self, root=ROOT, transport=None, sleep=None, now=None, dry=False, force=True):
        self.root, self.dry = root, dry
        P = lambda *a: os.path.join(root, *a)
        self.P = P
        self.cfg = jload(P("pipeline", "config", "indicators.json"))["indicators"]
        self.src_cfg = jload(P("pipeline", "config", "sources.json"))
        self.countries = jload(P("pipeline", "config", "countries.json"))
        self.defs = jload(P("pipeline", "config", "definitions.json"))
        self.approvals = jload(P("pipeline", "config", "approvals.json"))
        self.facts = jload(P("src", "data", "facts.json"))
        set_not_in_atlas(self.countries)
        self.xwalk = crosswalk(self.countries, self.facts)
        self.now = now or dt.datetime.now(dt.timezone.utc).replace(microsecond=0)
        self.stamp = self.now.strftime("%Y-%m-%dT%H:%M:%SZ")
        http = self.src_cfg["http"]
        wb = WorldBank(self.src_cfg["worldbank"], http, transport, sleep)
        self.sources = {"imf": IMF(self.src_cfg["imf"], http, transport, sleep), "worldbank": wb, "worldbank_country": WorldBankCountry(wb),
                        "nbs": NBS(http, transport, sleep), "cbn": CBN(http, transport, sleep)}
        self.force = force
        self.manifest = jload(P("data", "manifest.json"), {"sources": {}, "indicators": {}})
        self.results = []

    # ---- storage
    def normal_path(self, i): return self.P("data", "normal", f"{i}.json")
    def review_path(self, i): return self.P("data", "review", f"{i}.json")

    def save_raw(self, source, raws):
        names = []
        for label, body in raws:
            h = hashlib.sha256(body).hexdigest()[:16]
            p = self.P("data", "raw", source, f"{h}.json.gz")
            if not self.dry and not os.path.exists(p):
                os.makedirs(os.path.dirname(p), exist_ok=True)
                with gzip.GzipFile(p + ".tmp", "wb", compresslevel=9, mtime=0) as f: f.write(body)
                os.replace(p + ".tmp", p)
            names.append({"label": label, "file": os.path.relpath(p, self.root), "bytes": len(body)})
        return names

    def publish(self, ind, doc, how):
        old = jload(self.normal_path(ind["id"]))
        if self.dry: return
        if old and old.get("edition") != doc.get("edition"):
            jsave(self.P("data", "history", ind["id"], f"{old.get('edition') or old['retrieved'][:10]}.json"), old)
        jsave(self.normal_path(ind["id"]), doc)
        if os.path.exists(self.review_path(ind["id"])): os.remove(self.review_path(ind["id"]))
        self.defs["confirmed"][ind["id"]] = {"fingerprint": doc["fingerprint"], "label": doc["definition"].get("label"),
                                             "unit": doc["definition"].get("unit"), "confirmed": self.stamp, "how": how}

    # ---- one indicator
    def one(self, ind):
        iid, src = ind["id"], ind["source"]
        res = {"indicator": iid, "source": src, "code": ind["code"], "time": self.stamp}
        man = self.manifest["indicators"].setdefault(iid, {})
        smap = self.manifest["sources"].setdefault(src, {})
        smap["last_attempt"] = self.stamp
        # 1. approvals
        held = jload(self.review_path(iid))
        appr = (self.approvals.get("approve") or {}).get(iid)
        if held and appr and appr == held["hash"]:
            self.publish(ind, held["staged"], f"approved {held['hash']}")
            man.update(state="published", published_hash=held["hash"], published_at=self.stamp, published_edition=held["staged"].get("edition"))
            res["approved"] = held["hash"]
        # 2. fetch, if this source is due (each source is checked about as often as it publishes)
        every = (self.src_cfg.get(src) or self.src_cfg.get(src.split("_")[0]) or {}).get("check_every_days", 0)
        last = smap.get("last_success")
        if not self.force and every and last and (self.now - dt.datetime.fromisoformat(last.replace("Z", "+00:00"))).days < every:
            man.update(last_check_result=f"not due (checked {last[:10]}; this source is checked every {every} days)")
            res.update(outcome="not due", reason=f"last checked {last[:10]}; checked every {every} days")
            return res
        try:
            fetched = self.sources[src].fetch(ind)
        except FetchError as e:
            smap.update(last_status="failed", last_error=str(e))
            man.update(state=man.get("state", "never published"), last_check=self.stamp, last_check_result="fetch failed: " + str(e))
            kept = "last good data kept" if os.path.exists(self.normal_path(iid)) else "nothing published yet"
            res.update(outcome=f"fetch failed, {kept}", reason=str(e))
            return res
        smap.update(last_status="ok", last_success=self.stamp, last_error=None)
        # 3. normalise
        ed_table = load_edition(fetched["edition"], self.root) if src == "imf" else None
        aggregates = set(self.countries["aggregates"]["imf"]) if src == "imf" else self.sources["worldbank"].aggregates() if src.startswith("worldbank") else set()
        doc = normalise(ind, fetched, self.xwalk, aggregates, self.stamp, ed_table)
        doc["attempts"] = fetched["attempts"]
        h = content_hash(doc); doc["hash"] = h
        old = jload(self.normal_path(iid))
        res.update(edition=doc["edition"], places=len(doc["series"]), hash=h)
        # 4. unchanged?
        if old and old.get("hash") == h:
            man.update(last_check=self.stamp, last_check_result="no change")
            man["confirmed_current"] = self.stamp
            res.update(outcome="published after approval; source unchanged" if res.get("approved") else "no change")
            return res
        if held and held["hash"] == h and not res.get("approved"):
            man.update(last_check=self.stamp, last_check_result="still held for review")
            res.update(outcome="held for review (unchanged since last run)", review=held["issues"]["review"], approve_with=h)
            return res
        doc["raw"] = self.save_raw(src, fetched["raw"])
        # 5. validate
        cc = None
        if ind.get("crosscheck") and doc["edition"] == "2026-10":
            c = ind["crosscheck"]; vals = dict(jload(self.P(c["file"])))
            if c.get("world_file"): vals["WORLD"] = jload(self.P(c["world_file"]))
            back = {v: k for k, v in self.xwalk["imf"].items()}
            cc = {"values": {k: v for k, v in vals.items() if k in back or k == "WORLD"}, "years": c["years"], "tolerance": c["tolerance"], "about": c["about"]}
        confirmed = (self.defs["confirmed"].get(iid) or {}).get("fingerprint")
        review_edition = (self.src_cfg.get(src) or self.src_cfg.get("worldbank") or {}).get("review_new_edition", False)
        v = validate(ind, doc, old, confirmed, ed_table is not None or src != "imf", cc, review_edition)
        v["notes"] += fetched.get("source_notes", [])
        counts = {}
        for ys in doc["series"].values():
            for _, st in ys.values(): counts[st] = counts.get(st, 0) + 1
        res.update(status_counts=counts, notes=v["notes"])
        if v["failures"]:
            man.update(last_check=self.stamp, last_check_result="rejected: " + "; ".join(v["failures"]))
            res.update(outcome="rejected, last good data kept", failures=v["failures"])
        elif v["review"]:
            if not self.dry:
                jsave(self.review_path(iid), {"indicator": iid, "hash": h, "created": self.stamp,
                                              "how_to_approve": f'add "{iid}": "{h}" under "approve" in pipeline/config/approvals.json',
                                              "issues": v, "staged": doc})
            man.update(last_check=self.stamp, last_check_result="held for review", held_hash=h)
            res.update(outcome="held for review", review=v["review"], approve_with=h)
        else:
            self.publish(ind, doc, "routine")
            man.update(state="published", published_hash=h, published_at=self.stamp, published_edition=doc["edition"],
                       last_check=self.stamp, last_check_result="published", held_hash=None)
            man["confirmed_current"] = self.stamp
            res.update(outcome="published")
        man.update(source_code=ind["code"], edition_label=doc["edition_label"], places=len(doc["series"]), status_counts=counts)
        return res

    # ---- atlas output
    def atlas(self):
        """Compact file for the atlas build. Per indicator: metadata, y0 (first year) and
        v: {ISO3: [[values from y0, null where missing], "status letters"]}; classifications: v: {ISO3: "code"}.
        Status letters: o observed, e estimate, p projection, u unstated, a aggregate, r reported."""
        out = {"_about": "Generated by pipeline/run.py from data/normal. See pipeline/README.md.",
               "generated": self.stamp, "status_codes": STATUS_CODES, "indicators": {}}
        for ind in self.cfg:
            d = jload(self.normal_path(ind["id"]))
            if not d: continue
            man = self.manifest["indicators"].get(ind["id"], {})
            meta = {k: d.get(k) for k in ("name", "unit", "kind", "source", "source_code", "edition", "edition_label",
                                          "edition_date", "retrieved", "status_basis", "hash")}
            meta["definition"] = {k: d["definition"].get(k) for k in ("label", "unit", "description", "dataset", "categories") if d["definition"].get(k)}
            meta["confirmed_current"] = man.get("confirmed_current") or d.get("retrieved")
            meta["newer_held"] = bool(os.path.exists(self.review_path(ind["id"])))
            if ind["kind"] == "classification":
                meta["v"] = {c: ys["current"][0] for c, ys in d["series"].items()}
            elif ind.get("period", "year") != "year":   # monthly, daily or quarterly national series: {ISO3: {period: [value, status letter]}}
                keep = {"day": 400, "month": 36, "quarter": 16}[ind["period"]]
                meta.update(period=ind["period"], v={c: {k: [x[0], STATUS_CODES[x[1]]] for k, x in sorted(ys.items())[-keep:]} for c, ys in d["series"].items()})
            else:
                lo, hi = ind.get("atlas_years", [0, 9999]); dp = ind.get("atlas_decimals")
                years = list(range(lo, hi + 1)); v = {}
                for c, ys in d["series"].items():
                    vals = [ys.get(str(y)) for y in years]
                    if not any(vals): continue
                    while vals and vals[-1] is None: vals.pop()
                    v[c] = [[None if x is None else (round(x[0], dp) if dp is not None else x[0]) for x in vals],
                            "".join("-" if x is None else STATUS_CODES[x[1]] for x in vals)]
                meta.update(y0=lo, v=v)
            out["indicators"][ind["id"]] = meta
        return out

    def log(self):
        lines = []
        for r in self.results:
            extra = ""
            if r.get("review"): extra = ": " + "; ".join(x[:140] for x in r["review"][:4])
            elif r.get("failures"): extra = ": " + "; ".join(r["failures"])[:300]
            elif r.get("reason"): extra = ": " + r["reason"][:300]
            elif r.get("notes"): extra = ": " + "; ".join(r["notes"])[:300]
            lines.append(f"- {self.stamp[:16].replace('T', ' ')} UTC · **{r['indicator']}** ({r['source']} {r['code']}"
                         f"{', ' + str(r['edition']) if r.get('edition') else ''}) · {r['outcome']}{' (approved ' + r['approved'] + ')' if r.get('approved') else ''}{extra}")
        p = self.P("data", "UPDATE_LOG.md")
        head = "# Data update log\n\nNewest first. Written by pipeline/run.py; one line per indicator per run.\n\n"
        prev = open(p).read()[len(head):] if os.path.exists(p) else ""
        tmp = p + ".tmp"
        with open(tmp, "w") as f: f.write(head + "\n".join(lines) + "\n" + prev)
        os.replace(tmp, p)

    def go(self, only=None):
        for ind in self.cfg:
            if only and ind["id"] not in only: continue
            try:
                self.results.append(self.one(ind))
            except Exception as e:  # a bug in one adapter must not stop the others or corrupt files
                self.results.append({"indicator": ind["id"], "source": ind["source"], "code": ind["code"],
                                     "outcome": "error, last good data kept", "reason": f"{type(e).__name__}: {e}"})
        report = {"time": self.stamp, "dry_run": self.dry, "results": self.results}
        if self.dry:
            jsave(self.P("out", "pipeline-report.json"), report)
            return report
        self.manifest["updated"] = self.stamp
        jsave(self.P("data", "manifest.json"), self.manifest)
        jsave(self.P("pipeline", "config", "definitions.json"), self.defs)
        jsave(self.P("data", "atlas", "pipeline.json"), self.atlas(), compact=True)
        jsave(self.P("data", "last-run.json"), report)
        self.log()
        return report


def annotate(report):
    if not os.environ.get("GITHUB_ACTIONS"): return
    for r in report["results"]:
        lvl = "notice" if r["outcome"] in ("published", "no change") else "warning"
        msg = r["outcome"] + (": " + " | ".join(r.get("review") or r.get("failures") or [r.get("reason") or ""]) if lvl == "warning" else "")
        print(f"::{lvl} title={r['indicator']}::{msg[:900]}")


def main(argv):
    only = set(argv[argv.index("--only") + 1].split(",")) if "--only" in argv else None
    rep = Run(dry="--dry-run" in argv, force="--scheduled" not in argv).go(only)
    for r in rep["results"]:
        print(f"{r['indicator']:<13} {r['outcome']}" + (f"  [approve with {r['approve_with']}]" if r.get("approve_with") else ""))
        for x in (r.get("review") or []) + (r.get("failures") or []) + ([r["reason"]] if r.get("reason") else []):
            print("    - " + x[:300])
    annotate(rep)


if __name__ == "__main__":
    main(sys.argv[1:])
