"""Checks that decide what happens to an incoming update.

  failures  the data is unusable (bad numbers, duplicates); nothing is staged, last good stays
  review    usable but needs a person: held in data/review/, last good stays published
  notes     routine changes, published and written to the update log

Review triggers: first publication; a new edition of a source set to review_new_edition (the IMF WEO); an unconfirmed definition (label, unit, description,
dataset); a new IMF edition without its reviewed latest-actual table; coverage falling;
unknown source codes; implausible zeros; values out of bounds; revisions beyond the
indicator's threshold; a value going from observed back to estimate or projection; a large
year-on-year movement in a new or changed value; disagreement with an independent copy
(the figures read from the published report); many classification changes.
"""
LIMIT = 25


def _big(rule, old, new):
    if old is None or new is None or not rule: return False
    d = abs(new - old); rel = d / abs(old) if old else float("inf")
    if "abs" in rule and "rel" in rule: return d > rule["abs"] and rel > rule["rel"]
    if "rel" in rule: return rel > rule["rel"] and d > 1e-9
    return d > rule["abs"]


def _cap(items):
    return items[:LIMIT] + ([f"... and {len(items) - LIMIT} more"] if len(items) > LIMIT else [])


def validate(ind, new, old, confirmed_fp, edition_table_ok, crosscheck=None, review_new_edition=False):
    fail, review, notes = [], [], []
    S, G = new["series"], (old or {}).get("series", {})
    if new.get("invalid"): fail.append(f"{len(new['invalid'])} values are not finite numbers: " + "; ".join(new["invalid"][:5]))
    if not S: fail.append("no values for any atlas country")
    if fail: return {"failures": fail, "review": review, "notes": notes}

    if old is None: review.append("first publication of this indicator: confirm the definition and the values")
    if confirmed_fp != new["fingerprint"]:
        if old is not None and old.get("fingerprint") != new["fingerprint"]:
            changed = [k for k in ("label", "unit", "description", "dataset") if (old.get("definition") or {}).get(k) != new["definition"].get(k)]
            review.append(f"definition changed at the source ({', '.join(changed)}): check it still measures the same thing")
        elif old is not None:
            review.append("definition not yet confirmed")
    if ind["kind"] != "classification" and new["definition"].get("unit") != ind["unit"]:
        review.append(f"unit is '{new['definition'].get('unit')}', expected '{ind['unit']}'")
    if old and new.get("edition") != old.get("edition"):
        notes.append(f"new edition: {old.get('edition_label')} -> {new.get('edition_label')}")
        if review_new_edition: review.append(f"new edition ({new.get('edition_label')}): editions of this source are always reviewed once")
    if ind["source"] == "imf" and not edition_table_ok:
        review.append(f"no reviewed latest-actual table for WEO edition {new.get('edition')}: run pipeline.sources.weo_appendix on its Database Appendix")
    if new.get("unmatched"):
        review.append("source codes that are neither atlas countries nor known aggregates: " + ", ".join(new["unmatched"]))

    # coverage
    if G:
        gone = sorted(set(G) - set(S)); added = sorted(set(S) - set(G))
        if len(S) < 0.9 * len(G): review.append(f"coverage fell from {len(G)} to {len(S)} places")
        if len(gone) > 3: review.append("no longer covered: " + ", ".join(_cap(gone)))
        elif gone: notes.append("no longer covered: " + ", ".join(gone))
        if added: notes.append("newly covered: " + ", ".join(added))

    if ind["kind"] == "classification":
        bad = sorted({v[0] for r in S.values() for v in r.values()} - set(ind.get("allowed", [])))
        if bad: review.append("unexpected categories: " + ", ".join(bad))
        ch = [f"{c}: {G[c]['current'][0]} -> {S[c]['current'][0]}" for c in S if c in G and G[c]["current"][0] != S[c]["current"][0]]
        if len(ch) > 15: review.append(f"{len(ch)} countries changed group: " + "; ".join(_cap(ch)))
        elif ch: notes.append("changed group: " + "; ".join(ch))
        return {"failures": fail, "review": review, "notes": notes}

    zeros, oob, revs, small_revs, regress, moves, newyears, progressed = [], [], [], 0, [], [], 0, 0
    lo, hi = ind.get("bounds", [float("-inf"), float("inf")])
    for c, ys in S.items():
        g = G.get(c, {})
        prev = None
        for y in sorted(ys):
            v, st = ys[y]
            if v == 0 and not ind.get("zero_ok"): zeros.append(f"{c} {y}")
            if not (lo <= v <= hi): oob.append(f"{c} {y}: {v}")
            changed = True
            if y in g:
                ov, ost = g[y]
                changed = ov != v
                if changed:
                    if _big(ind.get("revision"), ov, v): revs.append(f"{c} {y}: {ov} -> {v}")
                    else: small_revs += 1
                if ost == "observed" and st in ("estimate", "projection", "unstated"): regress.append(f"{c} {y}: observed -> {st}")
                if ost in ("projection", "estimate") and st == "observed": progressed += 1
            else:
                newyears += 1 if G else 0
            if changed and prev is not None and int(y) >= ind.get("movement_from", 0) and _big(ind.get("movement"), prev, v):
                moves.append(f"{c} {int(y) - 1}->{y}: {prev} -> {v}")
            prev = v
    if zeros: review.append(f"{len(zeros)} zero values where zero is implausible (a source sometimes writes 0 for missing): " + ", ".join(_cap(zeros)))
    if oob: review.append(f"{len(oob)} values outside {lo} to {hi}: " + "; ".join(_cap(oob)))
    if revs: review.append(f"{len(revs)} revisions beyond the threshold {ind.get('revision')}: " + "; ".join(_cap(revs)))
    if regress: review.append(f"{len(regress)} values went from observed back to estimate or projection: " + "; ".join(_cap(regress)))
    if moves: review.append(f"{len(moves)} large year-on-year movements in new or changed values (threshold {ind.get('movement')}): " + "; ".join(_cap(moves)))
    if small_revs: notes.append(f"{small_revs} values revised within the threshold")
    if newyears: notes.append(f"{newyears} new country-years")
    if progressed: notes.append(f"{progressed} values moved from estimate or projection to observed")

    if crosscheck:
        mism, missing = [], []
        for c, ref in crosscheck["values"].items():
            for y, k in crosscheck["years"].items():
                r = ref.get(k)
                if r is None: continue
                v = (S.get(c) or {}).get(y)
                if v is None: missing.append(f"{c} {y}"); continue
                if abs(v[0] - r) > crosscheck["tolerance"]: mism.append(f"{c} {y}: API {v[0]} vs report {r}")
        if mism: review.append(f"{len(mism)} values differ from {crosscheck['about']}: " + "; ".join(_cap(mism)))
        if missing: notes.append(f"{len(missing)} report values have no API value: " + ", ".join(_cap(missing)))
        checked = sum(1 for c, ref in crosscheck["values"].items() for y, k in crosscheck["years"].items() if ref.get(k) is not None)
        notes.append(f"cross-checked {checked} values against {crosscheck['about']}: {checked - len(mism) - len(missing)} agree")
    return {"failures": fail, "review": review, "notes": notes}
