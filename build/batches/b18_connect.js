/* ---------- batch 18: connections — compare any figure, see related figures, follow the explanation ----------
   Rules
   - Comparability lives in the registry (CMP below): what the measure is (level, rate, share, index, category),
     whether ranking is meaningful, which direction is "higher", and the coverage of the comparison set.
   - All values in one comparison come from one indicator record, so they share source, period and definition.
   - Differences: percentage-point gaps for rates and shares; relative differences for levels; plain gaps for indexes.
   - Associations are calculated by the atlas (Spearman rank correlation, countries with both values, n >= 30) and
     labelled as such, with period mismatches stated. Explanations are labelled as proposed or debated; nothing here
     is labelled causal, because no indicator pair in the atlas has a causal research design behind it. */
const CMP = {
  pop: {m: "level", rank: true, dir: "Higher means more people."},
  median_age: {m: "level", rank: true, dir: "Higher means an older population; neither is better in itself."},
  tfr: {m: "rate", rank: true, dir: "Higher means more children per woman.", pts: false},
  life_exp: {m: "level", rank: true, dir: "Higher means longer lives (generally desirable)."},
  pop_growth: {m: "rate", rank: true, dir: "Higher means faster population growth.", pts: true},
  imr: {m: "rate", rank: true, dir: "Higher means more infants die (undesirable)."},
  net_mig: {m: "rate", rank: true, dir: "Positive means more arrivals than departures."},
  pop_change_2050: {m: "rate", rank: true, dir: "Higher means faster growth to 2050.", pts: true},
  gdp_growth_25: {m: "rate", rank: true, dir: "Higher means faster growth in output.", pts: true},
  gdp_growth_26: {m: "rate", rank: true, dir: "Higher means faster growth in output.", pts: true},
  cpi_avg_25: {m: "rate", rank: true, dir: "Higher means prices rose faster. Low, stable inflation (about 2–3%) is usually the aim.", pts: true},
  cpi_avg_26: {m: "rate", rank: true, dir: "Higher means prices rise faster. Low, stable inflation (about 2–3%) is usually the aim.", pts: true},
  ca_26: {m: "share", rank: true, dir: "Positive is a surplus, negative a deficit. Neither is good or bad in itself.", pts: true},
  unemp_26: {m: "rate", rank: false, why: "National definitions of unemployment differ and the IMF reports it for only about half of countries, so the atlas compares it with neighbours but does not rank it.", pts: true},
  mig_in: {m: "level", rank: true, dir: "Higher means more people born abroad."},
  mig_out: {m: "level", rank: true, dir: "Higher means more people living abroad."},
  mig_share: {m: "share", rank: true, dir: "Higher means a larger share of residents were born abroad.", pts: true},
  ndgain: {m: "index", rank: true, dir: "Higher means less vulnerable and better prepared."},
  oil_share: {m: "share", rank: true, cover: "Only the ~50 producers the Energy Institute lists separately; smaller producers are grouped and cannot be ranked.", dir: "Higher means a larger share of world output.", pts: true},
  oil_out: {m: "level", rank: true, cover: "Only the ~50 producers the Energy Institute lists separately.", dir: "Higher means more oil."},
  gas_share: {m: "share", rank: true, cover: "Only the producers the Energy Institute lists separately.", dir: "Higher means a larger share of world output.", pts: true},
  gas_out: {m: "level", rank: true, cover: "Only the producers the Energy Institute lists separately.", dir: "Higher means more gas."}
};
const LEARN = {
  median_age: [{m: "politics", at: "2. What makes", why: "explains why a young population is a dividend only if there are jobs and schools"}],
  pop_change_2050: [{m: "politics", at: "2. What makes", why: "shows where the world's population growth will be and what it means for power"}],
  gdp_growth_26: [{m: "money", at: "8. The world economy", why: "explains the IMF's 'split' world economy and why Gulf exporters shrink in 2026"}, {m: "geo", at: "Chokepoints and corridors", why: "shows the Strait of Hormuz, the reason for the Gulf contraction"}],
  cpi_avg_26: [{m: "money", at: "8. The world economy", why: "explains the 2026 energy and food price shock behind higher inflation"}, {m: "money", at: "5. The naira", why: "explains how a falling currency feeds into prices"}],
  cpi_avg_25: [{m: "money", at: "5. The naira", why: "explains how a falling currency feeds into prices"}],
  ca_26: [{m: "money", at: "7. What an economy sells", why: "explains why oil exporters' trade balances swing with oil prices"}],
  oil_share: [{m: "money", at: "7. What an economy sells", why: "sets out the resource curse and Dutch disease, and Nigeria's dependence on oil"}],
  oil_out: [{m: "money", at: "7. What an economy sells", why: "sets out the resource curse and Dutch disease, and Nigeria's dependence on oil"}],
  mig_share: [{m: "story", stop: 10, why: "the forced migration of the Atlantic slave trade, the largest in history before the modern era"}],
  ndgain: [{m: "africa", at: "The big physical picture", why: "shows the Sahel and the dry belt where drought exposure is highest"}],
  mpi_h: [{m: "ngstory", stop: 4, why: "explains the colonial gap in Western schooling between north and south, one proposed root of today's regional inequality"}, {m: "money", at: "7. What an economy sells", why: "explains the resource curse, relevant to poverty in oil-producing Delta states"}],
  war: [{m: "geo", at: "Chokepoints and corridors", why: "shows how wars near sea lanes spread costs worldwide"}]
};
const LINKS = [
  {a: "median_age", b: "tfr", type: "association", title: "Older populations have fewer children per woman", explain: "Demographers describe a 'demographic transition': as child deaths fall and girls' schooling rises, families have fewer children and the population ages. The pattern is well documented across countries; how much each cause contributes is still studied.", need: ""},
  {a: "median_age", b: "life_exp", type: "association", title: "Older populations live longer", explain: "Partly arithmetic: when people live longer, the median age rises. Lower fertility pushes the same way.", need: ""},
  {a: "imr", b: "life_exp", type: "association", title: "Where infant deaths are high, life expectancy is low", explain: "Partly by construction: deaths in infancy pull the average length of life down.", need: ""},
  {a: "ndgain", b: "life_exp", type: "association", title: "Climate readiness tracks health", explain: "ND-GAIN includes health, economic and governance measures among its components, so part of any link with other development measures is built into the index. It does not show that climate risk causes poor health or the reverse.", need: "Separate exposure data (rainfall, heat, flood records) and income per person would be needed to separate geography from development."},
  {a: "ndgain", b: "median_age", type: "association", title: "Younger countries tend to be more climate-vulnerable", explain: "Young, fast-growing populations are concentrated in lower-income countries, which ND-GAIN scores as less ready to adapt. Income is the likely common factor, but the atlas does not yet hold GDP per person to test this.", need: "GDP per person from the IMF database would let the atlas check whether income explains the link."},
  {a: "gdp_growth_26", b: "cpi_avg_26", type: "association", title: "Growth and inflation in 2026", explain: "The IMF expects the 2026 energy shock to raise inflation and slow growth at the same time in energy importers, while some energy exporters grow. Across all countries the relationship is mixed, which is why the IMF calls the world economy 'split'.", need: ""},
  {a: "oil_share", b: "gdp_growth_26", type: "association", title: "Oil producers' growth in 2026", explain: "Among listed producers, the size of oil output says little about 2026 growth on its own: geography matters more. Gulf producers that ship through Hormuz shrink sharply; producers elsewhere, including Nigeria, gain from higher prices.", need: ""},
  {a: "oil_share", b: "mpi_nat", type: "explanation", title: "Oil and poverty: the resource-curse hypothesis", explain: "Nigeria is a significant oil producer, yet most of its people are multidimensionally poor, and an oil-producing state like Bayelsa is among the poorest. The 'resource curse' proposes that oil wealth weakens other sectors (Dutch disease) and lets governments rely on oil rents rather than taxing and serving citizens. Research is divided: Norway, Botswana and Malaysia show resource wealth can be managed well, and cross-country studies disagree on how strong the effect is.", need: "To test it, the atlas would need oil revenue as a share of GDP and of government income, comparable poverty data for other producers (such as the UNDP/OPHI global MPI), governance indicators, and long time series rather than one year."},
  {a: "mig_share", b: "gdp_growth_26", type: "description", title: "Where migrants go", explain: "The countries with the largest foreign-born shares are rich Gulf states and small, rich European states, where jobs and wages draw workers. That is a description of where migrants live, not a measured relationship with growth.", need: "Income per person and wage data would be needed to measure how strongly economic conditions predict migration."}
];
const cmpOK = id => !!CMP[id];
function setOf(id) { const out = [];
  Object.values(D.facts).forEach(f => { if (!(f.un || f.obs)) return; const v = ival(id, f.c3); if (v != null && typeof v === "number") out.push({c: f.c3, k: k3(f.c3), n: f.n, v, sub: f.sub, cont: continentOf(f)}); });
  return out; }
const median = a => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
function diffTxt(id, a, b) { const r = IND[id], m = (CMP[id] || {}).m; if (a == null || b == null) return "";
  if (m === "rate" || m === "share") { const d = a - b; if (Math.abs(d) < .05) return "about the same"; return `${Math.abs(d).toFixed(1)} ${(CMP[id] || {}).pts !== false ? "points" : r.unit} ${d > 0 ? "higher" : "lower"}`; }
  if (m === "index") { const d = a - b; return Math.abs(d) < .05 ? "about the same" : `${Math.abs(d).toFixed(1)} ${d > 0 ? "higher" : "lower"}`; }
  if (!b) return ""; const rel = (a / b - 1) * 100; return Math.abs(rel) < 1 ? "about the same" : rel > 0 ? (a / b >= 2 ? `${(a / b).toFixed(1)}× as much` : `${Math.round(rel)}% higher`) : `${Math.round(-rel)}% lower`; }
function spearman(idA, idB) { const pairs = [];
  Object.values(D.facts).forEach(f => { if (!(f.un || f.obs)) return; const a = ival(idA, f.c3), b = ival(idB, f.c3); if (typeof a === "number" && typeof b === "number") pairs.push([a, b]); });
  const n = pairs.length; if (n < 30) return {n, rho: null};
  const rk = arr => { const idx = arr.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), r = new Array(arr.length); let i = 0;
    while (i < idx.length) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; const avg = (i + j) / 2 + 1; for (let t = i; t <= j; t++) r[idx[t][1]] = avg; i = j + 1; } return r; };
  const ra = rk(pairs.map(p => p[0])), rb = rk(pairs.map(p => p[1])), ma = (n + 1) / 2;
  let num = 0, da = 0, db = 0; for (let i = 0; i < n; i++) { num += (ra[i] - ma) * (rb[i] - ma); da += (ra[i] - ma) ** 2; db += (rb[i] - ma) ** 2; }
  return {n, rho: num / Math.sqrt(da * db)}; }
const strength = r => { const a = Math.abs(r); return a < .2 ? "little or no" : a < .4 ? "a weak" : a < .6 ? "a moderate" : a < .8 ? "a strong" : "a very strong"; };
const TAG = {description: "Descriptive comparison", association: "Statistical association (calculated by the atlas)", explanation: "Proposed explanation", causal: "Causal finding"};
function linkHTML(L, c) { const other = L.a === S.cmpId ? L.b : L.a, va = ival(L.a, c), vb = ival(L.b, c);
  let body = "";
  if (L.type === "association") { const s = spearman(L.a, L.b), pa = IND[L.a].period, pb = IND[L.b].period;
    body = s.rho == null ? `<p>Not enough countries have both figures (${s.n}) to measure a relationship; the atlas needs at least 30.</p>` :
      `<p>Across <b>${s.n}</b> countries with both figures there is ${strength(s.rho)} ${s.rho > 0 ? "positive" : "negative"} association (Spearman rank correlation ρ = ${s.rho.toFixed(2)}): ${s.rho > 0 ? "where one is higher, the other tends to be higher" : "where one is higher, the other tends to be lower"}. This describes a pattern; it does not show that either causes the other.${pa !== pb ? ` The two figures refer to different periods (${esc(pa)} and ${esc(pb)}).` : ""}</p>`; }
  return `<div class="lk"><span class="lt lt-${L.type}">${TAG[L.type]}</span><b>${esc(L.title)}</b>
    ${va != null && vb != null ? `<p class="src" style="margin:2px 0 4px">${esc(nameOf(k3(c)) || c)}: ${esc(IND[L.a].name.toLowerCase())} ${esc(IND[L.a].f(va))}; ${esc(IND[L.b].name.toLowerCase())} ${esc(IND[L.b].f(vb))}.</p>` : ""}
    ${body}<p>${esc(L.explain)}</p>${L.need ? `<p class="src"><b>What would test this:</b> ${esc(L.need)}</p>` : ""}
    <button class="chip" data-cmpind="${other}">Compare ${esc(IND[other].name.toLowerCase())}</button></div>`; }
function learnHTML(id) { const ls = LEARN[id]; if (!ls) return "";
  return `<h4>Learn why</h4>${ls.map((l, i) => `<button class="lrn" data-learn="${id}:${i}"><b>${esc(NAV_LABEL[l.m])}</b><span>This lesson ${esc(l.why)}.</span></button>`).join("")}`; }
const THEME_OF = {median_age: "age", pop_change_2050: "growth", gdp_growth_26: "growth26", cpi_avg_26: "infl26", oil_share: "oil", oil_out: "oil", gas_share: "gas", gas_out: "gas", mig_share: "migrants", mig_in: "migrants", ndgain: "climate", war: "wars"};
function stripSVG(set, c, nbs, worldV) { const vs = set.map(x => x.v), lo = Math.min(...vs), hi = Math.max(...vs), W0 = 300, X = v => 10 + (hi === lo ? .5 : (v - lo) / (hi - lo)) * (W0 - 20);
  const me = set.find(x => x.c === c);
  return `<svg class="strip" viewBox="0 0 ${W0} 46" role="img" aria-label="Distribution of ${set.length} countries">
    <line x1="10" x2="${W0 - 10}" y1="22" y2="22" class="sx"/>
    ${set.map(x => `<circle cx="${X(x.v).toFixed(1)}" cy="22" r="${nbs.has(x.c) ? 3.6 : 2.4}" class="${x.c === c ? "sme" : nbs.has(x.c) ? "snb" : "sd"}"/>`).join("")}
    ${worldV != null && worldV >= lo && worldV <= hi ? `<line x1="${X(worldV)}" x2="${X(worldV)}" y1="10" y2="34" class="sw"/><text x="${X(worldV)}" y="8" class="st" text-anchor="middle">world</text>` : ""}
    ${me ? `<circle cx="${X(me.v)}" cy="22" r="5.5" class="sme"/>` : ""}
    <text x="10" y="44" class="st">${esc(trimV(lo))}</text><text x="${W0 - 10}" y="44" class="st" text-anchor="end">${esc(trimV(hi))}</text></svg>`; }
const trimV = v => Math.abs(v) >= 1e6 ? shortNum(v) : Math.abs(v) >= 100 ? fmt(v) : (+v.toFixed(1)).toString();
function compareSheet(id, c) { const r = IND[id], cm = CMP[id], f = byKey.get(k3(c)); S.cmpId = id; S.cmpC = c;
  const v = ival(id, c), links = LINKS.filter(L => L.a === id || L.b === id);
  let main = "";
  if (!cm) main = `<p class="note">${r.kind === "classification" ? "This is a category, not a number, so the atlas does not rank or average it." : r.geo ? `This figure is available for ${esc(r.geo)}, so there is nothing comparable to set it against.` : "The atlas does not compare this figure across countries."}</p>`;
  else { const set = setOf(id), nbKeys = f ? f.b.map(x => k3(x)).filter(Boolean) : [], nbs = new Set(set.filter(x => nbKeys.includes(x.k)).map(x => x.c));
    let peers = set.filter(x => f && x.sub === f.sub), regLabel = f ? f.sub : ""; if (peers.length < 4 && f) { peers = set.filter(x => x.cont === continentOf(f)); regLabel = continentOf(f); }
    const regMed = median(peers.map(x => x.v)), wSrc = ival(id, "WORLD"), wMed = median(set.map(x => x.v));
    const sorted = set.slice().sort((a, b) => b.v - a.v), pos = sorted.findIndex(x => x.c === c) + 1;
    const near = v == null ? [] : set.filter(x => x.c !== c && !nbs.has(x.c)).sort((a, b) => Math.abs(a.v - v) - Math.abs(b.v - v)).slice(0, 3);
    const row = (lab, val, how, go) => `<tr${go ? ` class="click" data-cmpgo="${go}"` : ""}><td>${lab}${how ? `<br><span class="src">${how}</span>` : ""}</td><td class="n">${val == null ? "no data" : esc(r.f(val))}</td><td class="n">${val == null || v == null ? "" : esc(diffTxt(id, v, val))}</td></tr>`;
    const nbRows = (f ? f.b : []).map(x => k3(x)).filter(Boolean).map(k => ({k, c: byKey.get(k).c3, n: nameOf(k), v: ival(id, byKey.get(k).c3)}));
    main = `${set.length ? stripSVG(set, c, nbs, wSrc) : ""}
      <p class="src" style="margin-top:2px">${v == null ? `No value for ${esc(f ? f.n : c)}. ` : ""}Each dot is one of the ${set.length} countries with data${nbs.size ? "; larger dots are neighbours" : ""}.</p>
      ${cm.rank && v != null ? `<p><b>${ord(pos)} highest</b> of ${set.length} countries with data, ${esc(r.period)}. ${esc(cm.dir)}${cm.cover ? " " + esc(cm.cover) : ""} <span class="src">A position can change when countries are added or the source revises its figures.</span></p>` : cm.why ? `<p class="note">${esc(cm.why)}</p>` : ""}
      <div class="tablewrap"><table class="t"><thead><tr><th>Compared with</th><th class="n">Value</th><th class="n">${esc(f ? f.n : "")} is</th></tr></thead><tbody>
      ${nbRows.map(x => row(esc(x.n), x.v, "neighbour", x.k)).join("")}
      ${regMed != null ? row(esc(regLabel), regMed, `median of ${peers.length} countries (calculated by the atlas)`) : ""}
      ${wSrc != null ? row("World", wSrc, "as published by the source") : row("All countries", wMed, `median of ${set.length} (calculated by the atlas; not a world total)`)}
      </tbody></table></div>
      ${near.length ? `<h4>Useful comparisons</h4><p class="src" style="margin-top:0">Countries with the closest values, outside its neighbours. A similar number does not mean similar circumstances.</p><div class="chips">${near.map(x => `<button class="chip" data-cmpgo="${x.k}">${esc(x.n)} <b>${esc(r.f(x.v))}</b></button>`).join("")}</div>` : ""}`; }
  $("#overlay").innerHTML = `<div class="dialog cmp" role="dialog" aria-modal="true" aria-labelledby="cmpT">
    <div class="eyebrow">${esc(f ? f.n : c)}</div><h2 id="cmpT">${esc(r.name)}</h2>${kindTag(id)}
    <p class="big">${v == null ? "No data" : esc(r.f(v))}</p>
    ${main}
    ${links.length ? `<h4>Connections</h4>${links.map(L => linkHTML(L, c)).join("")}` : ""}
    ${learnHTML(id)}
    <div class="btnrow" style="margin:14px 0 0">${THEME_OF[id] ? `<button class="btn" data-cmpmap="${THEME_OF[id]}">Show on the map</button>` : ""}<button class="btn" data-ind="${id}">About this figure</button><button class="btn primary" data-dlg="close">Close</button></div></div>`;
  $("#overlay").hidden = false; $("#overlay .dialog").scrollTop = 0; }
const ord = n => n + (n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th");
/* subnational: Nigerian states */
const MPI_DISPLAY = s => s === "FCT" ? "FCT (Abuja)" : s;
function stateSheet(s) { const mp = NOW().mpi, r0 = mp[s], zone = zoneOf(s === "Nasarawa" ? "Nassarawa" : s === "FCT" ? "Federal Capital Territory" : s);
  const all = Object.entries(mp).map(([n, r]) => ({n, h: r.h, poor: r.poor, z: zoneOf(n === "Nasarawa" ? "Nassarawa" : n === "FCT" ? "Federal Capital Territory" : n)}));
  const zs = all.filter(x => x.z === zone), zPoor = zs.reduce((a, x) => a + x.poor, 0), zPop = zs.reduce((a, x) => a + x.poor / (x.h / 100), 0), zH = zPoor / zPop * 100;
  const sorted = all.slice().sort((a, b) => b.h - a.h), pos = sorted.findIndex(x => x.n === s) + 1, nat = ival("mpi_nat", "NGA");
  const pp = (a, b) => { const d = a - b; return Math.abs(d) < .05 ? "about the same" : `${Math.abs(d).toFixed(1)} points ${d > 0 ? "higher" : "lower"}`; };
  const set = all.map(x => ({c: x.n, v: x.h}));
  $("#overlay").innerHTML = `<div class="dialog cmp" role="dialog" aria-modal="true" aria-labelledby="cmpT"><div class="eyebrow">${esc(MPI_DISPLAY(s))} · ${esc(zone)} zone</div><h2 id="cmpT">${esc(IND.mpi_h.name)}</h2>${kindTag("mpi_h")}
    <p class="big">${esc(IND.mpi_h.f(r0.h))}</p><p class="src" style="margin-top:-6px">${esc(IND.mpi_poor.f(r0.poor))} people</p>
    ${stripSVG(set, s, new Set(zs.map(x => x.n)), nat)}
    <p><b>${ord(pos)} highest</b> of 37 (36 states and the FCT), 2021/22. Higher means a larger share of people deprived in several basics at once.${s === "Borno" ? " Borno's figure is less certain: the survey could not cover the whole state." : " Borno's figure is less certain than the others."}</p>
    <div class="tablewrap"><table class="t"><thead><tr><th>Compared with</th><th class="n">Share poor</th><th class="n">${esc(MPI_DISPLAY(s))} is</th></tr></thead><tbody>
      <tr><td>${esc(zone)} zone<br><span class="src">poor people ÷ people in the zone's states (calculated by the atlas from the survey's state figures)</span></td><td class="n">${zH.toFixed(1)}%</td><td class="n">${pp(r0.h, zH)}</td></tr>
      <tr><td>Nigeria<br><span class="src">as published by the NBS</span></td><td class="n">${nat}%</td><td class="n">${pp(r0.h, nat)}</td></tr>
      ${zs.filter(x => x.n !== s).sort((a, b) => b.h - a.h).map(x => `<tr><td>${esc(MPI_DISPLAY(x.n))}<br><span class="src">same zone</span></td><td class="n">${x.h}%</td><td class="n">${pp(r0.h, x.h)}</td></tr>`).join("")}
    </tbody></table></div>
    <h4>Connections</h4>
    <div class="lk"><span class="lt lt-description">Descriptive comparison</span><b>North and south</b><p>The six highest shares are all in the north (${sorted.slice(0, 6).map(x => esc(MPI_DISPLAY(x.n))).join(", ")}); the six lowest are all in the south (${sorted.slice(-6).reverse().map(x => esc(MPI_DISPLAY(x.n))).join(", ")}).</p></div>
    <div class="lk"><span class="lt lt-explanation">Proposed explanation</span><b>Colonial schooling and present-day inequality</b><p>Mission schools spread across the south far more than the north under colonial rule, and historians link that head start to later gaps in education and income. Insecurity in the north-east and north-west adds to it today. This is a plausible explanation, not a measured one.</p><p class="src"><b>What would test this:</b> historical school enrolment by province, linked to today's state boundaries, plus state-level data on conflict and public spending.</p></div>
    <div class="lk"><span class="lt lt-description">Descriptive comparison</span><b>Oil-producing states differ widely</b><p>Among the main oil-producing states, Bayelsa is ${mp.Bayelsa.h}%, Akwa Ibom ${mp["Akwa Ibom"].h}%, Rivers ${mp.Rivers.h}% and Delta ${mp.Delta.h}%. Oil output alone does not predict poverty within Nigeria; how revenue is shared and spent matters, which is the core of the resource-curse debate.</p><p class="src"><b>What would test this:</b> oil output and federal allocations by state over time.</p></div>
    ${learnHTML("mpi_h")}
    <div class="btnrow" style="margin:14px 0 0"><button class="btn" data-ind="mpi_h">About this figure</button><button class="btn primary" data-dlg="close">Close</button></div></div>`;
  $("#overlay").hidden = false; }
/* navigation from the sheet, keeping your place */
function sheetOrigin() { return {k: S.sel || (S.cmpC && k3(S.cmpC)), mode: S.mode, scroll: panel.scrollTop, id: S.cmpId}; }
function goLesson(spec) { const back = sheetOrigin(); closeOverlay(); setMode(spec.m);
  setTimeout(() => { if (spec.stop != null) { (spec.m === "story" ? storyStop : ngStop)(spec.stop); }
    else { const t = [...panel.querySelectorAll("h2, h3, h4, b")].find(e => e.textContent.trim().startsWith(spec.at)); if (t) { panel.scrollTo({top: Math.max(0, t.offsetTop - 12)}); t.classList.add("flash"); setTimeout(() => t.classList.remove("flash"), 2200); } }
    if (back.k || back.mode === "nigeria") { S.ret = back; panel.insertAdjacentHTML("afterbegin", `<button class="back retbtn" data-act="retback"><svg class="bk" aria-hidden="true"><use href="#i-back"/></svg>Back to ${esc(back.k ? nameOf(back.k) : NAV_LABEL[back.mode])}: ${esc(IND[back.id] ? IND[back.id].name.toLowerCase() : "figures")}</button>`); }
  }, 80); }
ACT.retback = () => { const r = S.ret; S.ret = null; if (!r) return;
  if (r.mode === "nigeria" && !r.k) { setMode("nigeria"); return; }
  if (r.mode === "explore" || !inStackMode()) { setMode("explore", true); selectCountry(r.k, true); } else { setMode(r.mode); openProfile(r.k); }
  setTimeout(() => { panel.scrollTop = r.scroll; const b = panel.querySelector(`[data-cmpind="${r.id}"]`); if (b) { b.classList.add("flash"); setTimeout(() => b.classList.remove("flash"), 2200); } }, 120); };
document.addEventListener("click", e => {
  const t = e.target.closest("[data-cmpind],[data-cmpgo],[data-learn],[data-cmpmap],[data-statecmp]"); if (!t) return; e.preventDefault(); e.stopPropagation();
  if (t.dataset.cmpind) { const c = t.closest(".dialog.cmp") ? S.cmpC : (S.sel && byKey.get(S.sel) ? byKey.get(S.sel).c3 : S.cmpC); compareSheet(t.dataset.cmpind, c); return; }
  if (t.dataset.cmpgo) { const k = t.dataset.cmpgo, id = S.cmpId; closeOverlay(); if (inStackMode()) openProfile(k); else selectCountry(k, true); setTimeout(() => compareSheet(id, byKey.get(k).c3), 350); return; }
  if (t.dataset.learn) { const [id, i] = t.dataset.learn.split(":"); goLesson(LEARN[id][+i]); return; }
  if (t.dataset.cmpmap) { closeOverlay(); setTheme(t.dataset.cmpmap); resetView(); return; }
  if (t.dataset.statecmp) { stateSheet(t.dataset.statecmp); return; } }, true);
