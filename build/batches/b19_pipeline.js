/* ---------- batch 19: figures from the automatic data pipeline ----------
   data/atlas/pipeline.json is written by pipeline/run.py: World Bank and IMF figures fetched from their APIs and
   checked before publishing. Every value carries its own status from the source's metadata (an actual figure,
   an IMF staff estimate, a projection, or "reported" where the World Bank does not say).
   If the file is missing, the IMF figures fall back to the October 2026 report tables (now.json), the new
   figures are removed, and the income group falls back to Natural Earth. Nothing else depends on it. */
const PL_ST = {o: "observed", e: "estimate", p: "projection", u: "unstated", a: "aggregate", r: "reported"};
const PLI = id => (typeof D !== "undefined" && D && D.pl && D.pl.indicators) ? D.pl.indicators[id] || null : null;
function PL(id, c, y) { const r = PLI(id); if (!r) return null; const s = r.v[c]; if (s == null) return null;
  if (typeof s === "string") return {v: s, s: "classification"};
  const i = y - r.y0; if (i < 0 || i >= s[0].length || s[0][i] == null) return null;
  return {v: s[0][i], s: PL_ST[s[1][i]] || "unstated"}; }
const plV = (id, c, y) => { const p = PL(id, c, y); return p ? p.v : null; };
const plS = (id, c, y) => { const p = PL(id, c, y); return p ? p.s : null; };
const dayLabel = s => { if (!s) return "never"; const d = new Date(String(s).slice(0, 10) + "T12:00:00Z"); return isNaN(d) ? s : d.toLocaleString("en-GB", {day: "numeric", month: "long", year: "numeric"}); };
Object.assign(KIND, {reported: "Reported", aggregate: "Aggregate", unstated: "Status not stated", mixed: "Varies by country"});
const fmtUSDbn = v => v >= 1000 ? "US$" + (v / 1000).toFixed(v >= 10000 ? 1 : 2) + " trillion" : v >= 1 ? "US$" + v.toFixed(v >= 100 ? 0 : 1) + " billion" : "US$" + Math.round(v * 1000) + " million";
const fmtUSD = v => "US$" + fmt(Math.round(v));

Object.assign(SOURCES, {
  imfdm: {name: "World Economic Outlook database (IMF DataMapper API)", by: "International Monetary Fund", pub: "2026-10", got: "", next: "2027-04", auto: true,
    url: "https://www.imf.org/external/datamapper/",
    note: "Whether each value is an actual figure, an IMF staff estimate or a projection comes from the IMF's own table of the latest year of actual data for each economy in this edition."},
  wdi: {name: "World Development Indicators (World Bank API)", by: "World Bank", pub: "2026-10", got: "", next: null, auto: true,
    url: "https://data.worldbank.org/",
    note: "The World Bank does not mark which of these values are its own estimates, so the atlas labels them 'reported'."}
});
const PL_NEW = {
  gdp_usd_25: {name: "Size of the economy (GDP), 2025", def: "Gross domestic product at current prices, converted to US dollars at market exchange rates: the value of everything produced in a year. It measures economic weight, not living standards, and it moves with the exchange rate.", unit: "US$", kind: "mixed", period: "2025", src: "imfdm", pl: ["gdp_usd", 2025], f: fmtUSDbn},
  gdp_pc_25: {name: "Income per person (GDP per person), 2025", def: "GDP divided by population, in US dollars at market exchange rates. A rough guide to average living standards: it does not show how income is shared, or what money buys locally.", unit: "US$ per person", kind: "mixed", period: "2025", src: "imfdm", pl: ["gdp_pc", 2025], f: fmtUSD},
  gdp_pc_wb_25: {name: "Income per person, World Bank figure, 2025", def: "The World Bank's GDP per person in current US dollars: a second, independent series. The World Bank and the IMF use different population and exchange-rate data, so the two can differ.", unit: "US$ per person", kind: "reported", period: "2025", src: "wdi", pl: ["gdp_pc_obs", 2025], f: fmtUSD,
    extra: c => { const i = plV("gdp_pc", c, 2025); return i != null ? "IMF figure for the same year: " + fmtUSD(i) : ""; }}
};
Object.assign(IND, PL_NEW);
const PL_MAP = {gdp_growth_25: ["gdp_growth", 2025], gdp_growth_26: ["gdp_growth", 2026], cpi_avg_25: ["cpi_avg", 2025], cpi_avg_26: ["cpi_avg", 2026]};
const INCOME_LABEL = {LIC: "Low income", LMC: "Lower middle income", UMC: "Upper middle income", HIC: "High income"};
let PL_ON = false;
function plApply() {
  PL_ON = !!(PLI("gdp_usd") || PLI("gdp_growth"));
  if (!PL_ON) { const o = document.querySelector('#themesel option[value="gdppc"]'); if (o) o.remove(); Object.keys(PL_NEW).forEach(k => { delete IND[k]; delete CMP[k]; delete LEARN[k]; });
    for (let i = LINKS.length - 1; i >= 0; i--) if (PL_NEW[LINKS[i].a] || PL_NEW[LINKS[i].b]) LINKS.splice(i, 1);
    delete SOURCES.imfdm; delete SOURCES.wdi; return; }
  Object.entries(PL_MAP).forEach(([id, p]) => { if (PLI(p[0])) Object.assign(IND[id], {pl: p, src: "imfdm", kind: "mixed"}); });
  Object.values(IND).forEach(r => { if (r.pl) { const [p, y] = r.pl; r.v = c => plV(p, c, y); r.st = c => plS(p, c, y); } });
  if (PLI("income_group")) Object.assign(IND.income, {def: "The World Bank's income classification, based on gross national income per person in US dollars. The World Bank revises it every 1 July.",
    period: "current (the API does not date it)", src: "wdi", v: c => { const p = PL("income_group", c); return p && INCOME_LABEL[p.v] ? INCOME_LABEL[p.v] : null; }});
  [["imfdm", "gdp_usd"], ["wdi", "gdp_pc_obs"]].forEach(([k, i]) => { const r = PLI(i), s = SOURCES[k]; if (!r) return;
    if (r.edition_date) s.pub = r.edition_date.slice(0, 7);
    Object.assign(s, {got: (r.retrieved || "").slice(0, 10), checked: (r.confirmed_current || "").slice(0, 10), held: !!r.newer_held, edition: r.edition_label || ""}); });
}
/* two dates for automatic sources: the edition (when the source published) and when the atlas last confirmed it is current */
const freshnessReport = freshness;
freshness = function (key) { const s = SOURCES[key]; if (!s || !s.auto) return freshnessReport(key);
  if (!s.checked) return {k: "due", t: "Automatic update has not confirmed this yet"};
  if (s.held) return {k: "due", t: `A newer version from the source is waiting for review; this is the version confirmed on ${dayLabel(s.checked)}`};
  const age = (Date.now() - new Date(s.checked + "T00:00:00Z")) / 864e5;
  if (age > 21) return {k: "due", t: `Last confirmed current on ${dayLabel(s.checked)}; automatic checks may have stopped`};
  return {k: "ok", t: `Checked automatically; confirmed current on ${dayLabel(s.checked)}`}; };
const ST_WORDS = {observed: "actual figures", estimate: "IMF staff estimates", projection: "projections", reported: "as reported by the World Bank", unstated: "status not stated", aggregate: "aggregates"};
function statusMix(id, codes) { const r = IND[id], n = {}; if (!r || !r.st) return "";
  (codes || Object.values(D.facts).map(f => f.c3)).forEach(c => { if (ival(id, c) == null) return; const s = r.st(c); n[s] = (n[s] || 0) + 1; });
  const e = Object.entries(n).sort((a, b) => b[1] - a[1]); return {text: e.map(([k, v]) => `${v} ${ST_WORDS[k] || k}`).join(", "), kinds: e.length}; }
const indSheetBase = indSheet;
indSheet = function (id) { indSheetBase(id); const r = IND[id], s = SOURCES[r.src], dl = $("#overlay dl.tips"); if (!dl || !s) return;
  let add = "";
  if (r.st) add += `<dt>Each value</dt><dd>${esc(statusMix(id).text)}. The tag beside a country's figure says which it is.</dd>`;
  if (s.auto) add += `<dt>Edition</dt><dd>${esc(s.edition || "—")}${s.pub ? ", published " + esc(ymLabel(s.pub)) : ""}</dd>
    <dt>How it updates</dt><dd>Fetched from the source's API and checked before it reaches the atlas: definition and units, coverage, revisions and unusual jumps. Changes that need a person's judgement wait for review. Last confirmed current: ${esc(dayLabel(s.checked))}.</dd>`;
  dl.insertAdjacentHTML("beforeend", add); };
/* a small time line for figures that have one: solid where actual, dotted where an IMF estimate, dashed where projected */
function trendHTML(id, c) { const r = IND[id]; if (!r || !r.pl) return ""; const [p, yr] = r.pl, R = PLI(p); if (!R || !R.v[c] || typeof R.v[c] === "string") return "";
  const pts = (k) => { const s = R.v[k]; return s ? s[0].map((v, i) => v == null ? null : {y: R.y0 + i, v, s: PL_ST[s[1][i]]}).filter(Boolean) : []; };
  const me = pts(c), w = CMP[id] && CMP[id].m !== "level" ? pts("WORLD") : []; if (me.length < 3) return "";
  const all = me.concat(w), y0 = Math.min(...all.map(d => d.y)), y1 = Math.max(...all.map(d => d.y));
  let lo = Math.min(...all.map(d => d.v)), hi = Math.max(...all.map(d => d.v)); if (lo > 0 && CMP[id] && CMP[id].m === "level") lo = 0; if (hi === lo) hi = lo + 1;
  const W0 = 300, H0 = 96, X = y => 30 + (y - y0) / Math.max(1, y1 - y0) * (W0 - 40), Y = v => 8 + (1 - (v - lo) / (hi - lo)) * (H0 - 28);
  const seg = (arr, cls) => arr.slice(1).map((d, i) => { const a = arr[i]; const st = d.s === "projection" ? "pj" : d.s === "estimate" || a.s === "estimate" ? "es" : "ob";
    return `<line x1="${X(a.y).toFixed(1)}" y1="${Y(a.v).toFixed(1)}" x2="${X(d.y).toFixed(1)}" y2="${Y(d.v).toFixed(1)}" class="${cls} ${st}"/>`; }).join("");
  const at = me.find(d => d.y === yr), zero = lo < 0 && hi > 0 ? `<line x1="30" x2="${W0 - 10}" y1="${Y(0)}" y2="${Y(0)}" class="tz"/>` : "";
  const kinds = [...new Set(me.map(d => d.s))], f = byKey.get(k3(c));
  const legendTxt = [kinds.includes("observed") || kinds.includes("reported") ? "solid: actual" : "", kinds.includes("estimate") ? "dotted: IMF estimate" : "", kinds.includes("projection") ? "dashed: projection" : "", w.length ? "grey: world" : ""].filter(Boolean).join(" · ");
  return `<h4>Over time</h4><svg class="trend" viewBox="0 0 ${W0} ${H0}" role="img" aria-label="${esc((f ? f.n : c) + ", " + r.name.replace(/, \d{4}$/, "") + ", " + me[0].y + " to " + me[me.length - 1].y + ": from " + r.f(me[0].v) + " to " + r.f(me[me.length - 1].v))}">
    ${zero}${seg(w, "tw")}${seg(me, "tm")}
    ${at ? `<circle cx="${X(at.y)}" cy="${Y(at.v)}" r="4" class="sme"/>` : ""}
    <text x="26" y="${Y(hi) + 3}" class="st" text-anchor="end">${esc(trimV(hi))}</text><text x="26" y="${Y(lo) + 3}" class="st" text-anchor="end">${esc(trimV(lo))}</text>
    <text x="30" y="${H0 - 4}" class="st">${y0}</text><text x="${W0 - 10}" y="${H0 - 4}" class="st" text-anchor="end">${y1}</text></svg>
    <p class="src" style="margin-top:2px">${esc(legendTxt)}. Source: ${esc(SOURCES[r.src].name)}${SOURCES[r.src].edition ? ", " + esc(SOURCES[r.src].edition) : ""}.</p>`; }
const compareSheetBase = compareSheet;
compareSheet = function (id, c) { compareSheetBase(id, c); const r = IND[id]; if (!r || !r.pl) return; const dlg = $("#overlay .dialog.cmp"); if (!dlg) return;
  const rankP = [...dlg.querySelectorAll("p")].find(p => /highest<\/b> of/.test(p.innerHTML));
  const mix = r.st && statusMix(id, setOf(id).map(x => x.c));
  if (rankP && mix && mix.kinds > 1) rankP.insertAdjacentHTML("beforeend", ` <span class="src">Of these, ${esc(mix.text)}.</span>`);
  const t = trendHTML(id, c), before = dlg.querySelector("h4, .btnrow:last-child");
  if (t && before) before.insertAdjacentHTML("beforebegin", t); };
/* comparability, lesson links and connections for the new figures */
Object.assign(CMP, {
  gdp_usd_25: {m: "level", rank: true, dir: "Higher means a bigger economy in US dollars at market exchange rates. Not adjusted for prices, so it understates economies with cheap local prices."},
  gdp_pc_25: {m: "level", rank: true, dir: "Higher means more output per person in US dollars. Not adjusted for living costs, and silent on how income is shared."},
  gdp_pc_wb_25: {m: "level", rank: true, dir: "Higher means more output per person in US dollars (World Bank series)."}
});
Object.assign(LEARN, {
  gdp_usd_25: [{m: "money", at: "6. Size", why: "explains what GDP measures, and the exchange-rate trap that shrank Nigeria's dollar GDP"}],
  gdp_pc_25: [{m: "money", at: "6. Size", why: "explains why GDP per person says more about living standards than total GDP, and what purchasing power parity adds"}],
  gdp_pc_wb_25: [{m: "money", at: "6. Size", why: "explains why GDP per person says more about living standards than total GDP"}]
});
(L => { if (L) { L.explain = "Young, fast-growing populations are concentrated in lower-income countries, which ND-GAIN scores as less ready to adapt. Income is a likely common factor: compare both with income per person below."; L.need = "A model that holds income per person constant would be needed to see whether age adds anything once income is accounted for."; } })(LINKS.find(L => L.a === "ndgain" && L.b === "median_age"));
LINKS.push(
  {a: "ndgain", b: "gdp_pc_25", type: "association", title: "Climate readiness tracks income", explain: "Richer countries tend to score higher on ND-GAIN, partly because its readiness half includes economic and governance measures linked to income, so some of the link is built into the index. It does not show that income alone protects against climate change.", need: "Exposure data that does not depend on income (heat, rainfall, flood and drought records) would separate geography from wealth."},
  {a: "life_exp", b: "gdp_pc_25", type: "association", title: "Longer lives in richer countries", explain: "Life expectancy rises steeply with income at low incomes and flattens at high ones, a pattern known as the Preston curve. Economists debate how much runs from income to health (food, clean water, care) and how much from health to income, and medical advances shift the whole curve over time.", need: "Data over time for the same countries, and measures of health spending and public-health programmes, would be needed to separate the directions."}
);
THEME_OF.gdp_pc_25 = "gdppc";
THEME_INFO.gdppc = () => indTheme("gdp_pc_25", [[1200, "--miss", "Under US$1,200"], [4500, "--sel", "US$1,200–4,500"], [14000, "--nb", "US$4,500–14,000"], [40000, "--d2", "US$14,000–40,000"], [Infinity, "--d4", "Over US$40,000"]],
  {note: `World ${itxt("gdp_pc_25", "WORLD")}, Nigeria ${itxt("gdp_pc_25", "NGA")}. US dollars at market exchange rates: cheap local prices mean money goes further in poorer countries than these numbers suggest. IMF figures; some 2025 values are IMF estimates.`});
