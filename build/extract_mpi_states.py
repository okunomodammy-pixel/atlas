"""Read state-level tables from the Nigeria MPI 2022 report into data/extracted/mpi_states.json.

    python3 build/extract_mpi_states.py MPI_REPORT.txt      (text from `pdftotext -layout` of the report)

Tables (Appendix D of the National Bureau of Statistics' Nigeria Multidimensional Poverty Index 2022):
  D12  censored headcount ratios by State: % of people who are poor AND deprived in each of the
       15 indicators, with 95% confidence bounds
  D6   state MPI, H and A with 95% confidence intervals and population shares (cross-checked with mpi.json)
  D1, D3, D4, D5  national figures, the 15 national censored headcounts, rural/urban and the six zones
  D49  out-of-school children among school-aged children (6-15) by State
Indicator definitions and weights: Table 2.

Checks before writing (the script stops if any fails):
  - all 37 states and the FCT parsed, names matching data/extracted/mpi.json (Table D6)
  - for every state, sum(weight x censored headcount) equals the state's MPI from D6 (within rounding):
    this is the definition of the MPI, so it proves columns are aligned
  - no censored headcount exceeds the state's headcount ratio H
"""
import json, os, re, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IND = [  # key, name, dimension, weight, deprived if... (Table 2)
    ("nutrition", "Nutrition", "Health", 1/12, "a child under 5 is stunted or underweight, or an adult is underweight"),
    ("food", "Food insecurity", "Health", 1/12, "the household is severely food insecure (FAO Food Insecurity Experience Scale)"),
    ("health_time", "Time to healthcare", "Health", 1/12, "the nearest health facility is 30 minutes or more away on foot"),
    ("attendance", "School attendance", "Education", 3/32, "a child aged 6-15 is not attending school"),
    ("schooling", "Years of schooling", "Education", 1/8, "no one aged 15 or over has completed primary school"),
    ("school_lag", "School lag", "Education", 1/32, "a child aged 8-17 is two or more grades behind"),
    ("water", "Water", "Living standards", 1/24, "no safe drinking water"),
    ("water_rel", "Water reliability", "Living standards", 1/24, "water is available fewer than 20 days a month or 4 hours a day"),
    ("sanitation", "Sanitation", "Living standards", 1/24, "the toilet is unimproved, or shared with other households"),
    ("housing", "Housing materials", "Living standards", 1/24, "the floor, roof or walls are natural or rudimentary"),
    ("cooking", "Cooking fuel", "Living standards", 1/24, "the household cooks with dung, wood or charcoal"),
    ("assets", "Assets", "Living standards", 1/24, "the household has fewer than two of the listed assets and no car"),
    ("unemployment", "Unemployment", "Work and shocks", 1/10, "a member aged 15 or over is unemployed and looking for work"),
    ("underemployment", "Underemployment", "Work and shocks", 1/20, "a member works under 40 hours a week and wants more"),
    ("shock", "Security shock", "Work and shocks", 1/10, "the household suffered a security shock in the past 12 months"),
]
NUM = re.compile(r"^-?\d+(\.\d+)?%?$")


def section(lines, start, end):
    a = next(i for i, l in enumerate(lines) if l.strip().startswith(start))
    b = next(i for i, l in enumerate(lines) if i > a and l.strip().startswith(end))
    return lines[a + 1:b]


def parse_d12(lines):
    """Rows: [name fragment line] value line (15 numbers, maybe with the name) [name fragment line] Lower Upper.
    Names that do not fit are split across the lines around the values ("Ad-" / "amawa", "Akwa" / "Ibom")."""
    out, pending, last, after_value = {}, "", None, False
    for raw in lines:
        t = raw.split()
        if not t: continue
        if t[0] in ("Lower", "Upper"):
            vals = [float(x) for x in t[1:] if NUM.match(x)]
            if last and len(vals) == 15: out[last][t[0].lower()] = vals
            after_value = False; continue
        nums = [x for x in t if NUM.match(x)]
        words = [x for x in t if not NUM.match(x)]
        if len(nums) == 15:
            name = (pending + " " + " ".join(words)).strip(); pending = ""
            last = name; out[name] = {"value": [float(x) for x in nums]}; after_value = True; continue
        if nums or len(words) > 2 or "Appendix" in raw or "confidence" in raw:   # headers, page footers
            pending = ""; after_value = False; continue
        if after_value and last:   # second half of a name printed under its numbers
            new = (last[:-1] if last.endswith("-") else last + " ") + " ".join(words)
            out[new] = out.pop(last); last = new; after_value = False; continue
        frag = " ".join(words)
        if frag in ("Nutri-", "tion", "Assets"): continue
        pending = frag
    return out


def parse_d49(lines):
    out = {}
    for raw in lines:
        m = re.match(r"^\s*([A-Z][A-Za-z .]+?)\s{2,}(\d+\.\d+)\s+(\d+\.\d+)%", raw)
        if m: out[m.group(1).strip()] = {"children_m": float(m.group(2)), "out_of_school_pct": float(m.group(3))}
    return out


def parse_d3(lines):
    names = {n: k for k, n, *_ in IND}; out = {}
    for raw in lines:
        m = re.match(r"^\s*([A-Z][A-Za-z ]+?)\s{2,}(\d+\.\d)\s+(\d+\.\d)\s+(\d+\.\d)\s*$", raw)
        if m and m.group(1).strip() in names: out[names[m.group(1).strip()]] = [float(m.group(i)) for i in (2, 3, 4)]
    return out


ROW9 = re.compile(r"(\d\.\d{3})\s+(\d\.\d{3})\s+(\d\.\d{3})\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)")


def parse_groups(lines):
    """D4 (area) and D5 (zone): MPI, H, A with confidence intervals, population share, number poor (million).
    Zone names are printed in two halves, above and below the numbers."""
    out, pending, last = {}, "", None
    for raw in lines:
        m = ROW9.search(raw)
        if m:
            v = [float(x) for x in m.groups()]
            name = (pending + " " + raw[:m.start()].strip()).strip(); pending = ""
            out[name] = {"mpi": v[0], "h": v[3], "h_ci": v[4:6], "a": v[6], "pop_share": v[9], "poor_m": v[10]}; last = name; continue
        t = raw.strip()
        if t in ("Central", "East", "West", "South") and last in ("North", "South"):   # second half first
            out[last + " " + t] = out.pop(last); last = None; continue
        if t in ("North", "South"): pending = t
    return out


def parse_d6(lines):
    """State rows of D6 with confidence intervals; names split as in D12 ("Akwa" / numbers / "Ibom")."""
    out, pending, last, after = {}, "", None, False
    for raw in lines:
        m = ROW9.search(raw); t = raw.split()
        if m:
            v = [float(x) for x in m.groups()]
            own = raw[:m.start()].strip()
            name = (pending + " " + own).strip(); pending = ""
            out[name] = {"mpi_ci": v[1:3], "h_ci": v[4:6], "a_ci": v[7:9], "pop_share": v[9], "check": [v[0], v[3], v[6], v[10]]}
            last, after = name, not own   # a fragment below counts as the name's end only if the row had no name of its own
            continue
        if not t: continue
        if len(t) <= 2 and all(x.isalpha() for x in t) and t[0][0].isupper() and t[0] not in ("State", "Value", "MPI", "Population", "Number", "Confidence"):
            if after and last: out[last + " " + " ".join(t)] = out.pop(last); last, after = None, False
            else: pending = " ".join(t)
        else: after = False
    return out


def canon(name, known):
    n = {"Federal Capital Territory": "FCT", "Nassarawa": "Nasarawa", "Abuja": "FCT", "FCT Abuja": "FCT", "Cross river": "Cross River", "Akwa ibom": "Akwa Ibom"}.get(name, name)
    if n in known: return n
    m = [k for k in known if k.replace(" ", "").lower() == n.replace(" ", "").lower()]
    return m[0] if m else None


def main(path):
    lines = open(path, encoding="utf-8").read().splitlines()
    mpi = json.load(open(os.path.join(R, "data", "extracted", "mpi.json")))
    known = set(mpi)
    d12 = parse_d12(section(lines, "D12.", "D13."))
    d49 = parse_d49(section(lines, "D49.", "D50."))
    states, problems = {}, []
    for raw, v in d12.items():
        s = canon(raw, known)
        if not s: problems.append(f"D12 name not matched: {raw!r}"); continue
        if "lower" not in v or "upper" not in v: problems.append(f"D12 {s}: confidence bounds missing")
        states[s] = {"censored": {k: [v["value"][i], v.get("lower", [None] * 15)[i], v.get("upper", [None] * 15)[i]] for i, (k, *_) in enumerate(IND)}}
    missing = known - set(states)
    if missing: problems.append(f"D12 missing states: {sorted(missing)}")
    for s, st in states.items():
        m0 = sum(w * st["censored"][k][0] / 100 for k, _, _, w, _ in IND)
        if abs(m0 - mpi[s]["mpi"]) > 0.004: problems.append(f"{s}: weighted sum {m0:.3f} != MPI {mpi[s]['mpi']}")
        over = [k for k in st["censored"] if st["censored"][k][0] > mpi[s]["h"] + 0.15]
        if over: problems.append(f"{s}: censored headcount above H ({mpi[s]['h']}) for {over}")
    nat49 = None
    for raw, v in d49.items():
        if raw == "Nigeria": nat49 = v; continue
        s = canon(raw, known)
        if s and s in states: states[s]["school"] = v
        elif s is None: problems.append(f"D49 name not matched: {raw!r}")
    for raw, v in parse_d6(section(lines, "D6.", "D7.")).items():
        st = canon(raw, known)
        if not st: problems.append(f"D6 name not matched: {raw!r}"); continue
        mp, ch = mpi[st], v.pop("check")
        if [mp["mpi"], mp["h"], mp["a"], mp["poor"]] != ch: problems.append(f"D6 {st}: {ch} differs from mpi.json")
        states.setdefault(st, {}).update(v)
    no6 = [x for x in states if "h_ci" not in states[x]]
    if no6: problems.append(f"D6 missing: {no6}")
    elif abs(sum(states[x]["pop_share"] for x in states) - 100) > 1: problems.append("D6 population shares do not add to 100")
    nat = parse_d3(section(lines, "D3.", "D4."))
    if len(nat) != 15: problems.append(f"D3: {len(nat)} of 15 national indicators read")
    elif abs(sum(w * nat[k][0] / 100 for k, _, _, w, _ in IND) - 0.257) > 0.004: problems.append("D3: weighted sum does not equal the national MPI 0.257")
    area = parse_groups(section(lines, "D4.", "D5.")); zones = parse_groups(section(lines, "D5.", "D6."))
    if set(area) != {"National", "Rural", "Urban"}: problems.append(f"D4 rows: {sorted(area)}")
    if len(zones) != 6 or any(" " not in z for z in zones): problems.append(f"D5 rows: {sorted(zones)}")
    elif abs(sum(z["poor_m"] for z in zones.values()) - area.get("National", {}).get("poor_m", 0)) > 0.2: problems.append("D5: zone totals do not add up to the national number of poor")
    no49 = [s for s in states if "school" not in states[s]]
    if no49: problems.append(f"D49 missing: {no49}")
    if problems:
        print("\n".join(problems)); raise SystemExit("not written: checks failed")
    doc = {"source": "National Bureau of Statistics, Nigeria Multidimensional Poverty Index 2022, Appendix D (Tables D12 and D49) and Table 2",
           "period": "survey fieldwork November 2021 to February 2022", "checks": "MPI = sum of weight x censored headcount for every state (within 0.004); no censored headcount above H",
           "indicators": [{"key": k, "name": n, "dimension": d, "weight": round(w, 6), "deprived_if": c} for k, n, d, w, c in IND],
           "national": dict(area.pop("National"), censored={k: nat[k] for k, *_ in IND}, school=nat49),
           "area": area, "zones": zones, "states": dict(sorted(states.items()))}
    p = os.path.join(R, "data", "extracted", "mpi_states.json")
    json.dump(doc, open(p, "w"), ensure_ascii=False, indent=1)
    worst = max(abs(sum(w * states[s]["censored"][k][0] / 100 for k, _, _, w, _ in IND) - mpi[s]["mpi"]) for s in states)
    print(f"{p}: {len(states) - 1} states and the FCT; largest gap between weighted sum and published MPI: {worst:.4f}")


if __name__ == "__main__":
    main(sys.argv[1])
