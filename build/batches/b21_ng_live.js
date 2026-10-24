/* ---------- batch 21: Nigeria's monthly figures, kept current by the pipeline ----------
   NBS (homepage dashboard): headline, core and food inflation, average fuel prices, quarterly GDP growth.
   CBN (exchange-rate API): the official naira rate per US dollar.
   Each value comes from data/atlas/pipeline.json with its own period. Without that file, the hand-entered
   figures of October 2026 stay in place, labelled as before. */
const PLP = id => { const r = PLI(id); if (!r || !r.v || !r.v.NGA || r.period == null) return null;
  return Object.entries(r.v.NGA).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([k, [v]]) => ({k, v})); };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const periodLabel = k => /^\d{4}-\d{2}-\d{2}$/.test(k) ? dayLabel(k) : /^\d{4}-\d{2}$/.test(k) ? MONTHS[+k.slice(5) - 1] + " " + k.slice(0, 4) : /^\d{4}-Q\d$/.test(k) ? `Q${k.slice(6)} ${k.slice(0, 4)}` : k;
const plLast = (id, n = 1) => { const s = PLP(id); return s ? s[s.length - n] || null : null; };
function sparkSVG(id, label) { const s = PLP(id); if (!s || s.length < 4) return "";
  const vs = s.map(x => x.v), lo = Math.min(...vs), hi = Math.max(...vs), W0 = 120, H0 = 28, X = i => 2 + i / (s.length - 1) * (W0 - 4), Y = v => 3 + (1 - (v - lo) / ((hi - lo) || 1)) * (H0 - 6);
  return ` <svg class="spark" viewBox="0 0 ${W0} ${H0}" role="img" aria-label="${esc(label)}: ${esc(periodLabel(s[0].k))} ${trimV(vs[0])}, ${esc(periodLabel(s[s.length - 1].k))} ${trimV(vs[vs.length - 1])}"><polyline points="${s.map((x, i) => X(i).toFixed(1) + "," + Y(x.v).toFixed(1)).join(" ")}"/><circle cx="${X(s.length - 1)}" cy="${Y(vs[vs.length - 1])}" r="2.4"/></svg>`; }
Object.assign(SOURCES, {
  nbsdash: {name: "National Bureau of Statistics: headline figures", by: "National Bureau of Statistics, Nigeria", pub: "", got: "", next: null, auto: true, url: "https://nigerianstat.gov.ng/",
    note: "Read from the dashboard on the NBS homepage, which carries the latest official figures with their periods. NBS publishes no data API."},
  cbnapi: {name: "Official exchange rates", by: "Central Bank of Nigeria", pub: "", got: "", next: null, auto: true, url: "https://www.cbn.gov.ng/rates/ExchRateByCurrency.html",
    note: "From the Central Bank's daily exchange-rate data. The parallel (street) rate is not published officially."}
});
const NG_LIVE = {
  ng_cpi_core: ["Core inflation (year on year)", "Consumer prices excluding farm produce and energy, compared with the same month a year earlier. Less volatile than the headline figure."],
  ng_cpi_food: ["Food inflation (year on year)", "Food and non-alcoholic drinks in the consumer price index, compared with the same month a year earlier."],
  ng_petrol: ["Petrol (PMS), average price", "Average pump price of a litre of petrol across Nigeria, from NBS's monthly price survey."],
  ng_diesel: ["Diesel (AGO), average price", "Average price of a litre of diesel across Nigeria."],
  ng_kerosene: ["Kerosene, average price", "Average price of a litre of household kerosene across Nigeria."],
  ng_lpg: ["Cooking gas, 5 kg refill", "Average price of refilling a 5 kg cylinder of liquefied petroleum gas."],
  ng_gdp_q: ["Real GDP growth, latest quarter", "Growth of the economy's real output against the same quarter a year earlier."]
};
function ngLive() { if (!PLI("ng_cpi") && !PLI("ng_fx_usd")) return;
  const live = (id, src, extra) => ({period: plLast(id) ? periodLabel(plLast(id).k) : "", src, st: c => c === "NGA" && plLast(id) ? "observed" : null, v: c => c === "NGA" && plLast(id) ? plLast(id).v : null, ...extra});
  if (PLI("ng_cpi")) Object.assign(IND.cpi_yoy, live("ng_cpi", "nbsdash", {extra: c => { const p = plLast("ng_cpi", 2); return c === "NGA" && p ? `${(+p.v).toFixed(2)}% in ${MONTHS[+p.k.slice(5) - 1]}` : ""; }}));
  if (PLI("ng_fx_usd")) Object.assign(IND.fx_ngn, live("ng_fx_usd", "cbnapi", {f: v => "₦" + fmt(Math.round(v * 100) / 100) + " per US dollar (official, selling)",
    extra: c => c === "NGA" ? "Parallel market ₦1,365–1,380 on 21 October 2026 (press report; not updated automatically)" : ""}));
  Object.entries(NG_LIVE).forEach(([id, [name, def]]) => { if (!PLI(id)) return; const lv = live(id, "nbsdash");
    IND[id] = {name, def, unit: PLI(id).unit, kind: "observed", geo: "Nigeria only", ...lv,
      f: id.startsWith("ng_cpi") || id === "ng_gdp_q" ? v => (+v).toFixed(2) + "%" : id === "ng_lpg" ? v => "₦" + fmt(Math.round(v)) + " per 5 kg" : v => "₦" + fmt(Math.round(v)) + " a litre"}; });
  [["nbsdash", "ng_cpi"], ["cbnapi", "ng_fx_usd"]].forEach(([k, i]) => { const r = PLI(i), s = SOURCES[k]; if (!r) return;
    Object.assign(s, {pub: (plLast(i) ? plLast(i).k : "").slice(0, 7), got: (r.retrieved || "").slice(0, 10), checked: (r.confirmed_current || "").slice(0, 10), held: !!r.newer_held, edition: r.edition_label || ""}); }); }
const plApplyNG = plApply;
plApply = function () { plApplyNG(); ngLive(); };
/* Nigeria's page: everyday prices, and a 12-month line beside inflation */
function ngEverydayHTML() { const ids = ["ng_petrol", "ng_diesel", "ng_kerosene", "ng_lpg"].filter(id => IND[id] && ival(id, "NGA") != null); if (!ids.length) return "";
  return `<h4>Everyday prices</h4><dl class="facts data">${ids.map(id => drow(id, "NGA")).join("")}</dl>`; }
const econHTMLBase = econHTML;
econHTML = function (f) { let h = econHTMLBase(f); if (f.c3 !== "NGA") return h;
  const rows = ids => ids.filter(id => IND[id] && ival(id, "NGA") != null).map(id => drow(id, "NGA", id !== "ng_gdp_q" ? {cmp: sparkSVG(id, IND[id].name)} : {})).join("");
  const after = (label, html) => { const i = h.indexOf(`<dt>${label}`); if (i < 0 || !html) return; const j = h.indexOf("</dd>", i) + 5; h = h.slice(0, j) + html + h.slice(j); };
  const sp = sparkSVG("ng_cpi", "Headline inflation, monthly");
  if (sp) h = h.replace(/(<dt>Inflation, latest month \(year on year\)[\s\S]*?<dd>[\s\S]*?)(<br><span class="src">)/, `$1${sp}$2`);
  after("Inflation, latest month", rows(["ng_cpi_core", "ng_cpi_food"])); after("Economic growth, 2026", rows(["ng_gdp_q"]));
  return h + ngEverydayHTML(); };
