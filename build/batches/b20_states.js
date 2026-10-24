/* ---------- batch 20: Nigeria's 36 states and the FCT ----------
   Everything here comes from one survey: the National Bureau of Statistics' Nigeria Multidimensional Poverty
   Index 2022 (fieldwork Nov 2021 to Feb 2022), tables D1-D6, D12 and D49, read by build/extract_mpi_states.py
   and checked there (each state's 15 deprivation figures recombine into its published MPI).
   No state-level economic, population or price figures are invented or apportioned from national ones. */
const MPIS = () => (NOW().mpis || null);
const GEO_NAME = k => k === "Nasarawa" ? "Nassarawa" : k === "FCT" ? "Federal Capital Territory" : k;
const ST_CAP = {Abia: "Umuahia", Adamawa: "Yola", "Akwa Ibom": "Uyo", Anambra: "Awka", Bauchi: "Bauchi", Bayelsa: "Yenagoa", Benue: "Makurdi", Borno: "Maiduguri",
  "Cross River": "Calabar", Delta: "Asaba", Ebonyi: "Abakaliki", Edo: "Benin City", Ekiti: "Ado-Ekiti", Enugu: "Enugu", Gombe: "Gombe", Imo: "Owerri", Jigawa: "Dutse",
  Kaduna: "Kaduna", Kano: "Kano", Katsina: "Katsina", Kebbi: "Birnin Kebbi", Kogi: "Lokoja", Kwara: "Ilorin", Lagos: "Ikeja", Nasarawa: "Lafia", Niger: "Minna",
  Ogun: "Abeokuta", Ondo: "Akure", Osun: "Osogbo", Oyo: "Ibadan", Plateau: "Jos", Rivers: "Port Harcourt", Sokoto: "Sokoto", Taraba: "Jalingo", Yobe: "Damaturu",
  Zamfara: "Gusau", FCT: "Abuja"};
/* "x% of people are both poor and ..." */
const DEP_PHRASE = {nutrition: "live with someone undernourished", food: "are severely food insecure", health_time: "live 30 minutes or more on foot from a health facility",
  attendance: "have a school-age child out of school", schooling: "live where no adult has finished primary school", school_lag: "have a child two or more grades behind",
  water: "lack safe drinking water", water_rel: "have unreliable water", sanitation: "lack an improved, unshared toilet", housing: "live in a home of natural or rudimentary materials",
  cooking: "cook with wood, charcoal or dung", assets: "own fewer than two basic assets", unemployment: "live with someone unemployed and looking for work",
  underemployment: "live with someone working under 40 hours who wants more", shock: "were hit by a security shock in the past year"};
const stDisp = k => k === "FCT" ? "the FCT" : k;
const stTitle = k => k === "FCT" ? "Federal Capital Territory" : k;
const pctS = (v, d = 1) => (+v).toFixed(d).replace(/\.0$/, "") + "%";
const ciRel = (ci, v) => ci[0] > v ? "above" : ci[1] < v ? "below" : "within";
let ST_AREA = null;
function stAreas() { if (ST_AREA) return ST_AREA; ST_AREA = {};
  ngStates().forEach(f => { ST_AREA[MPI_NAME(f.properties.name)] = d3.geoArea(f) * 6371.0088 ** 2; }); return ST_AREA; }
const round2 = v => { const p = 10 ** (Math.floor(Math.log10(v)) - 1); return Math.round(v / p) * p; };

/* registry: the extra state figures, so "About this figure", comparisons and quizzes share one record */
Object.assign(IND, {
  mpi_a: {name: "Intensity of poverty", def: "Among people who are multidimensionally poor, the average share of the weighted indicators in which they are deprived. A state can have fewer poor people who are each deprived in more things.", unit: "%", kind: "survey", period: "2021/22", geo: "Nigerian states", src: "mpi", v: s => { const r = NOW().mpi && NOW().mpi[s]; return r ? r.a : null; }, f: v => v + "%"},
  oos: {name: "Children out of school", def: "Share of school-age children (6 to 15) not attending school, from the same survey.", unit: "%", kind: "survey", period: "2021/22", geo: "Nigerian states", src: "mpi", v: s => { const d = MPIS() && MPIS().states[s]; return d && d.school ? d.school.out_of_school_pct : null; }, f: v => pctS(v)}
});
(() => { const m = MPIS(); if (!m) return; m.indicators.forEach(d => { IND["dep_" + d.key] = {name: `${d.name}: poor and deprived`,
  def: `Share of people who are multidimensionally poor and deprived in ${d.name.toLowerCase()}: ${d.deprived_if}. Weight in the index: ${(d.weight * 100).toFixed(1)}%. It counts only people who are poor overall, so it is never above the share poor.`,
  unit: "%", kind: "survey", period: "2021/22", geo: "Nigerian states", src: "mpi", v: s => { const r = MPIS() && MPIS().states[s]; return r ? r.censored[d.key][0] : null; }, f: v => pctS(v)}; }); })();
const NG_POV_NOTE = "Nigeria Multidimensional Poverty Index 2022 (National Bureau of Statistics with OPHI and UNICEF). Survey fieldwork November 2021 to February 2022: it describes conditions then, not today. Borno's figures are less certain because insecurity kept the survey out of parts of the state.";

/* ---- a state's profile ---- */
function standouts(k) { const m = MPIS(), d = m.states[k], N = m.national.censored, up = [], down = [];
  m.indicators.forEach(i => { const [v, lo, hi] = d.censored[i.key], n = N[i.key][0];
    if (lo > n) up.push({i, v, n, gap: v - n}); else if (hi < n) down.push({i, v, n, gap: n - v}); });
  return {up: up.sort((a, b) => b.gap - a.gap), down: down.sort((a, b) => b.gap - a.gap)}; }
function similarStates(k, n = 3) { const S0 = MPIS().states, keys = MPIS().indicators.map(i => i.key), me = S0[k].censored;
  return Object.keys(S0).filter(x => x !== k).map(x => ({x, d: Math.sqrt(keys.reduce((a, j) => a + (S0[x].censored[j][0] - me[j][0]) ** 2, 0))})).sort((a, b) => a.d - b.d).slice(0, n); }
function depBarsHTML(k, other) { const m = MPIS(), d = m.states[k], N = other ? m.states[other] : m.national, max = 100;
  let dim = "";
  return `<div class="deps" role="table" aria-label="Deprivations in ${esc(stDisp(k))} compared with ${other ? esc(stDisp(other)) : "Nigeria"}">${m.indicators.map(i => {
    const [v, lo, hi] = d.censored[i.key], n = (other ? N.censored[i.key] : N.censored[i.key])[0];
    const head = i.dimension !== dim ? (dim = i.dimension, `<div class="dimh" role="row">${esc(i.dimension)}</div>`) : "";
    return head + `<div class="dep" role="row"><span role="cell"><button class="lnk" data-ind="dep_${i.key}">${esc(i.name)}</button></span><span class="tr" role="cell" aria-label="${esc(stDisp(k))} ${v}%, ${other ? esc(stDisp(other)) : "Nigeria"} ${n}%"><i class="fl" style="width:${v / max * 100}%"></i>${lo != null ? `<i class="ci" style="left:${lo}%;width:${Math.max(.5, hi - lo)}%"></i>` : ""}<i class="nt" style="left:${n / max * 100}%"></i></span><span class="n" role="cell">${v}%</span></div>`; }).join("")}</div>
    <p class="src" style="margin-top:4px"><i class="key fl"></i> ${esc(stDisp(k))} &nbsp;<i class="key nt"></i> ${other ? esc(stDisp(other)) : "Nigeria"} &nbsp;<i class="key ci"></i> margin of error (95%). Each bar counts people who are both poor and deprived in that item, so no bar is longer than the share poor. Tap a name for its definition.</p>`; }
function stateProfileHTML(k) {
  const mp = NOW().mpi, r = mp[k], m = MPIS(), d = m && m.states[k], N = m && m.national, z = zoneOf(GEO_NAME(k)), zr = m && m.zones[z];
  const area = stAreas()[k], byArea = Object.entries(stAreas()).sort((a, b) => b[1] - a[1]).map(x => x[0]), aRank = byArea.indexOf(k) + 1;
  const sizeTxt = aRank <= 5 ? `one of the five largest of the 37` : aRank > 32 ? `one of the five smallest of the 37` : `the ${ord(aRank)} largest of the 37`;
  const rel = d ? ciRel(d.h_ci, N.h) : null;
  const relTxt = rel === "above" ? "clearly above" : rel === "below" ? "clearly below" : "not clearly different from";
  const so = d ? standouts(k) : {up: [], down: []}, sim = d ? similarStates(k) : [];
  const zStates = ZONES[z].map(MPI_NAME).filter(x => mp[x]).sort((a, b) => mp[b].h - mp[a].h);
  const cs = D.cities.filter(c => c.c3 === "NGA" && c.a1 && norm(c.a1).startsWith(norm(GEO_NAME(k)).slice(0, 5)) && c.n !== ST_CAP[k]);
  const sharePoor = d ? r.poor / N.poor_m * 100 : null, popShare = d ? d.pop_share : null;
  const outCount = d && d.school ? d.school.children_m * d.school.out_of_school_pct / 100 : null;
  const line = s => `<li><b>${esc(s.i.name)}.</b> ${pctS(s.v)} of people are poor and ${esc(DEP_PHRASE[s.i.key])}, against ${pctS(s.n)} nationally.</li>`;
  return `${backLink()}<div class="eyebrow">Nigeria · ${esc(z)} zone</div><h2>${esc(stTitle(k))}</h2>
  <p class="lede">${k === "FCT" ? `Not a state: the Federal Capital Territory is run by the federal government through a minister, and is divided into six area councils rather than local government areas. Abuja has been Nigeria's capital since 1991.` : `Capital: <b>${esc(ST_CAP[k] || "")}</b>.`} Covering about ${fmt(round2(area))} km², it is ${sizeTxt}${k === "FCT" ? " states and territories" : ""}.${cs.length ? ` Other places on this map: ${cs.slice(0, 4).map(c => esc(c.n)).join(", ")}.` : ""}</p>
  ${d ? `<div class="tiles">
    <div class="tile"><small>Multidimensionally poor</small><b>${pctS(r.h)}</b><em>${pctS(d.h_ci[0])}–${pctS(d.h_ci[1])} with sampling error · Nigeria ${pctS(N.h)}</em></div>
    <div class="tile"><small>People in poverty</small><b>${r.poor} million</b><em>${sharePoor.toFixed(1)}% of Nigeria's poor; ${popShare}% of its people</em></div>
    <div class="tile"><small>Intensity</small><b>${pctS(r.a)}</b><em>of weighted deprivations, among the poor · Nigeria ${pctS(N.a)}</em></div>
    <div class="tile"><small>Children out of school</small><b>${pctS(d.school.out_of_school_pct)}</b><em>aged 6–15, about ${outCount >= 1 ? outCount.toFixed(1) + " million" : Math.round(outCount * 1000) + " thousand"} · Nigeria ${pctS(N.school.out_of_school_pct)}</em></div></div>
  <p class="src" style="margin-top:6px">All four from one survey, fieldwork Nov 2021 to Feb 2022. Shares of Nigeria's poor and of its people are calculated by the atlas from the survey's own totals.</p>
  <h3>How ${esc(stDisp(k))} compares</h3>
  <p>${esc(k === "FCT" ? "The FCT's" : k + "'s")} share of people in poverty is <b>${relTxt}</b> the national ${pctS(N.h)}${rel === "within" ? ": the survey's margin of error overlaps the national figure" : ""}. In the ${esc(z)} zone as a whole it is ${pctS(zr.h)} (published), but the zone is not uniform: from ${pctS(mp[zStates[zStates.length - 1]].h)} in ${esc(stDisp(zStates[zStates.length - 1]))} to ${pctS(mp[zStates[0]].h)} in ${esc(stDisp(zStates[0]))}.</p>
  ${so.up.length ? `<h4>Where it is clearly worse than the national pattern</h4><ul>${so.up.slice(0, 3).map(line).join("")}</ul>` : `<p>No single deprivation is clearly worse here than across Nigeria as a whole, allowing for the survey's margin of error.</p>`}
  ${so.down.length ? `<h4>Where it is clearly better</h4><ul>${so.down.slice(0, 2).map(line).join("")}</ul>` : ""}
  <h3>What poverty is made of here</h3>
  <p class="src" style="margin-top:0">The 2022 index counts 15 deprivations in four groups. Someone is poor if they are deprived in at least 26% of the weighted list.</p>
  ${depBarsHTML(k)}
  <h4>Most similar profiles</h4>
  <p class="src" style="margin-top:0">States whose 15 deprivation figures are closest to ${esc(stDisp(k))}'s (calculated by the atlas). Similar figures, not necessarily similar places.</p>
  <div class="chips">${sim.map(s => `<button class="chip" data-act="stateopen" data-s="${esc(s.x)}">${esc(stTitle(s.x))} <b>${pctS(mp[s.x].h)}</b></button>`).join("")}</div>` : `<p class="note">Poverty data for ${esc(stDisp(k))} did not load.</p>`}
  <div class="btnrow"><button class="btn primary" data-act="stcompare" data-s="${esc(k)}">Compare with another state</button><button class="btn" data-act="ngpov" data-focus="${esc(k)}">See it on the poverty map</button><button class="btn" data-statecmp="${esc(k)}">Rank among all 37</button></div>
  <h4>What the atlas does not have yet</h4>
  <p class="src">No state-level figures for economic output, population, prices or migration: the atlas will not divide national figures between states to fake them. Promising sources: the National Bureau of Statistics' next Nigeria Living Standards Survey (state consumption poverty), the Nigeria Demographic and Health Survey (state health and schooling), and state GDP estimates where states publish them.</p>
  <p class="src"><span class="kind">Source</span>${esc(NG_POV_NOTE)} <button class="lnk" data-ind="mpi_h">About the measure</button> · <button class="lnk" data-act="goles" data-m="ngstory" data-stop="4">Why north and south differ: a history</button></p>`; }
function statePanel(s) { const k = MPI_NAME(s);
  G.states.selectAll("path.state").classed("on", d => MPI_NAME(d.properties.name) === k);
  if (!VIEW.length) pushPanel("");   // remember the page we came from, so Back returns to it
  setPanel(stateProfileHTML(k)); S.state = k;
  try { history.replaceState(history.state, "", "#s/" + encodeURIComponent(k)); } catch (e) {}
  const f = ngStates().find(x => MPI_NAME(x.properties.name) === k); if (f && S.mode === "nigeria") flyTo(f, {pad: .55, maxk: 40}); }
ACT.stateopen = el => statePanel(GEO_NAME(el.dataset.s));
ACT.goles = el => { closeOverlay(); goLesson({m: el.dataset.m, stop: el.dataset.stop != null ? +el.dataset.stop : null, at: el.dataset.at}); };
const popViewBase = popView;
popView = function () { popViewBase(); if (/^#s\//.test(location.hash)) { try { history.replaceState(history.state, "", "#" + S.mode); } catch (e) {} } };
const routeHashBase = routeHash;
routeHash = function (initial) { let h = ""; try { h = decodeURIComponent((location.hash || "").slice(1)); } catch (e) {}
  if (h.startsWith("s/") && NOW().mpi && NOW().mpi[h.slice(2)]) { const k = h.slice(2); routing = true; try { setMode("nigeria", true); } finally { routing = false; } setTimeout(() => statePanel(GEO_NAME(k)), 50); return; }
  return routeHashBase(initial); };

/* ---- compare two states ---- */
function compareStatesHTML(a, b) { const mp = NOW().mpi, m = MPIS(), A = m.states[a], isNat = b === "NGA", B = isNat ? m.national : m.states[b];
  const nA = stTitle(a), nB = isNat ? "Nigeria" : stTitle(b);
  const opt = sel => `<option value="NGA"${sel === "NGA" ? " selected" : ""}>Nigeria (national)</option>` + Object.keys(mp).sort().map(x => `<option value="${esc(x)}"${x === sel ? " selected" : ""}>${esc(stTitle(x))}</option>`).join("");
  const hB = isNat ? m.national.h : mp[b].h, poorB = isNat ? m.national.poor_m : mp[b].poor, aB = isNat ? m.national.a : mp[b].a;
  const row = (lab, va, vb, ciA, ciB, unit = "%", ind) => { const diff = va - vb, overlap = ciA && ciB && !(ciA[0] > ciB[1] || ciB[0] > ciA[1]);
    return `<tr><td>${ind ? `<button class="lnk" data-ind="${ind}">${esc(lab)}</button>` : esc(lab)}</td><td class="n">${unit === "%" ? pctS(va) : va}</td><td class="n">${unit === "%" ? pctS(vb) : vb}</td><td class="n">${unit === "%" ? (Math.abs(diff) < .05 ? "same" : (diff > 0 ? "+" : "−") + Math.abs(diff).toFixed(1) + " pts") : (diff > 0 ? "+" : "−") + Math.abs(diff).toFixed(2) + "m"}${overlap ? `<br><span class="src">within the margin of error</span>` : ""}</td></tr>`; };
  const flip = (mp[a].h - hB) * (mp[a].poor - poorB) < 0;
  const big = m.indicators.map(i => ({i, d: A.censored[i.key][0] - B.censored[i.key][0], ov: !(A.censored[i.key][1] > B.censored[i.key][2] || B.censored[i.key][1] > A.censored[i.key][2])})).filter(x => !x.ov).sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
  return `<div class="dialog cmp" role="dialog" aria-modal="true" aria-labelledby="cmpT"><div class="eyebrow">Nigeria · compare</div><h2 id="cmpT">${esc(nA)} and ${esc(nB)}</h2>
    <div class="pick"><label>State <select data-cmpa>${opt(a).replace('<option value="NGA">Nigeria (national)</option>', "")}</select></label><label>with <select data-cmpb>${opt(b)}</select></label></div>
    <div class="tablewrap"><table class="t"><thead><tr><th></th><th class="n">${esc(nA)}</th><th class="n">${esc(nB)}</th><th class="n">Difference</th></tr></thead><tbody>
    ${row("Share multidimensionally poor", mp[a].h, hB, A.h_ci, isNat ? m.national.h_ci : B.h_ci, "%", "mpi_h")}
    ${row("People in poverty (million)", mp[a].poor, poorB, null, null, "m", "mpi_poor")}
    ${row("Intensity among the poor", mp[a].a, aB, A.a_ci, isNat ? null : B.a_ci, "%", "mpi_a")}
    ${row("Children out of school", A.school.out_of_school_pct, B.school.out_of_school_pct, null, null, "%", "oos")}
    </tbody></table></div>
    ${flip ? `<p class="note"><b>Percentages and people point in different directions.</b> ${esc(mp[a].h > hB ? nA : nB)} has the higher share in poverty, but ${esc(mp[a].poor > poorB ? nA : nB)} has more poor people, because it has more people. Which matters depends on the question: the share says how likely a resident is to be poor; the number says where most poor people live.</p>` : ""}
    <h4>The 15 deprivations</h4>
    ${big.length ? `<p>Clearest differences, beyond the margin of error: ${big.slice(0, 3).map(x => `<b>${esc(x.i.name.toLowerCase())}</b> (${esc(x.d > 0 ? nA : nB)} higher by ${Math.abs(x.d).toFixed(1)} points)`).join("; ")}.</p>` : `<p>None of the 15 differ by more than the survey's margin of error.</p>`}
    ${depBarsHTML(a, isNat ? null : b)}
    <p class="src">Both columns come from the same survey and definitions, so they are comparable. One indicator says nothing about a state "doing better" overall, and the survey cannot say why the states differ: that would need evidence on history, conflict, public spending, farming and more.</p>
    <div class="btnrow" style="margin:14px 0 0"><button class="btn" data-act="stateopen" data-s="${esc(a)}">Open ${esc(nA)}</button>${isNat ? "" : `<button class="btn" data-act="stateopen" data-s="${esc(b)}">Open ${esc(nB)}</button>`}<button class="btn primary" data-dlg="close">Close</button></div></div>`; }
function compareStates(a, b) { const mp = NOW().mpi;
  if (!b) { const sim = similarStates(a, 1)[0]; b = sim ? sim.x : "NGA"; }
  $("#overlay").innerHTML = compareStatesHTML(a, b); $("#overlay").hidden = false; $("#overlay .dialog").scrollTop = 0;
  $("#overlay").querySelectorAll("select[data-cmpa],select[data-cmpb]").forEach(s => s.addEventListener("change", () => compareStates($("#overlay select[data-cmpa]").value, $("#overlay select[data-cmpb]").value))); }
ACT.stcompare = el => compareStates(el.dataset.s, el.dataset.b);
document.addEventListener("click", e => { const b = e.target.closest("#overlay [data-act=stateopen]"); if (!b) return; e.preventDefault(); e.stopPropagation(); closeOverlay(); if (S.mode !== "nigeria") setMode("nigeria"); statePanel(GEO_NAME(b.dataset.s)); }, true);

/* ---- the poverty map, by any of the survey's measures ---- */
const NG_METRICS = () => { const m = MPIS(); const base = [["h", "Share multidimensionally poor"], ["poor", "Number of poor people"], ["a", "Intensity among the poor"], ["oos", "Children out of school"]];
  return m ? base.concat(m.indicators.map(i => ["dep:" + i.key, i.name + " (poor and deprived)"])) : base.slice(0, 2); };
function ngMetric(k, metric) { const mp = NOW().mpi, r = mp[k], d = MPIS() && MPIS().states[k];
  if (metric === "h") return r.h; if (metric === "poor") return r.poor; if (metric === "a") return r.a;
  if (metric === "oos") return d ? d.school.out_of_school_pct : null; if (metric.startsWith("dep:")) return d ? d.censored[metric.slice(4)][0] : null; return null; }
function ngPovertyMap(metric = S.ngMetric || "h", focus) { const mp = NOW().mpi; if (!mp) return; S.ngMetric = metric;
  const st = ngStates(), ng = "566", nbSet = new Set(byKey.get(ng).b.map(c => byC3.get(c))), m = MPIS(), meta = NG_METRICS().find(x => x[0] === metric) || ["h", ""];
  S.sel = null; S.color = k => k === ng ? "transparent" : null; G.countries.selectAll("path").classed("dim", d => d.key !== ng && !nbSet.has(d.key)); paint();
  const bins = metric === "h" ? [[40, "--d1", "Under 40%"], [60, "--d2", "40–60%"], [75, "--nb", "60–75%"], [85, "--sel", "75–85%"], [Infinity, "--miss", "85% and over"]]
    : metric === "a" ? [[36, "--d1", "Under 36%"], [39, "--d2", "36–39%"], [42, "--nb", "39–42%"], [45, "--sel", "42–45%"], [Infinity, "--miss", "45% and over"]]
    : [[10, "--d1", "Under 10%"], [20, "--d2", "10–20%"], [35, "--nb", "20–35%"], [50, "--sel", "35–50%"], [Infinity, "--miss", "50% and over"]];
  const col = v => v == null ? "var(--land)" : `var(${bins.find(b => v < b[0])[1]})`;
  const isPeople = metric === "poor";
  G.states.selectAll("path.ngbubble").remove();
  G.states.selectAll("path.state").data(st).join("path").attr("class", "state").classed("on", d => focus && MPI_NAME(d.properties.name) === focus)
    .style("fill", d => isPeople ? "var(--tag)" : col(ngMetric(MPI_NAME(d.properties.name), metric))).style("opacity", null).style("stroke-opacity", null)
    .on("click", (ev, d) => { ev.stopPropagation(); const k = MPI_NAME(d.properties.name), v = ngMetric(k, metric);
      showPeekHTML(`<b class="pn">${esc(stTitle(k))}</b><span class="ps">${esc(zoneOf(d.properties.name))} zone · 2021/22 survey</span><p style="margin:8px 0 0">${esc(meta[1])}: <b>${v == null ? "no data" : isPeople ? v + " million" : pctS(v)}</b>${metric !== "h" ? ` <span class="src">(share poor ${pctS(mp[k].h)})</span>` : `, about <b>${mp[k].poor} million</b> people`}.${k === "Borno" ? " Borno's figures are less certain: the survey could not reach parts of the state." : ""}</p><div class="pb" style="margin-top:8px"><button class="btn primary" data-act="stateopen" data-s="${esc(k)}">Open profile</button><button class="btn" data-act="stcompare" data-s="${esc(k)}">Compare</button><button class="btn" data-statecmp="${esc(k)}">Rank</button></div>`); });
  if (isPeople) { const mx = Math.max(...Object.values(mp).map(x => x.poor)), R = d3.scaleSqrt().domain([0, mx]).range([0, 26]);
    const circles = st.map(f => Object.assign(d3.geoCircle().center(d3.geoCentroid(f)).radius(R(mp[MPI_NAME(f.properties.name)].poor) / 26 * .9)(), {properties: {name: f.properties.name}}));
    G.states.selectAll("path.ngbubble").data(circles).join("path").attr("class", "ngbubble").attr("d", path); }
  G.cities.selectAll("g").select("text").attr("display", d => d.c3 === "NGA" ? "none" : null);
  G.stateslabels.selectAll("text").data(st.map(f => { const v = ngMetric(MPI_NAME(f.properties.name), metric); return {c: d3.geoCentroid(f), n: v == null ? "" : isPeople ? v.toFixed(1) + "m" : Math.round(v) + "%"}; })).join("text").text(d => d.n);
  $("#L-labels").checked = false; applyLayers(); render();
  const nat = metric === "h" ? pctS(m ? m.national.h : 62.9) : metric === "poor" ? (m ? m.national.poor_m.toFixed(0) : "133") + " million" : metric === "a" ? pctS(m.national.a) : metric === "oos" ? pctS(m.national.school.out_of_school_pct) : pctS(m.national.censored[metric.slice(4)][0]);
  const l = $("#legend");
  l.innerHTML = `<div class="lgt"><label class="vh" for="ngmetric">Map</label><select id="ngmetric">${NG_METRICS().map(([v, t]) => `<option value="${v}"${v === metric ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></div>
    ${isPeople ? `<div><i style="background:var(--sel);border-radius:50%"></i>Circle area = number of poor people</div>` : bins.map(([, c, t]) => `<div><i style="background:var(${c})"></i>${t}</div>`).join("")}
    <div class="lgn">${isPeople ? "Big circles where many people live: Kano has the most poor people without the highest share." : metric.startsWith("dep:") ? "People who are poor and deprived in this item." : ""} Nigeria: ${nat}. Survey Nov 2021 to Feb 2022; Borno less certain. <button class="lnk" data-ind="${metric === "h" ? "mpi_h" : metric === "poor" ? "mpi_poor" : metric === "a" ? "mpi_a" : metric === "oos" ? "oos" : "dep_" + metric.slice(4)}">About this figure</button></div>`; l.hidden = false;
  $("#ngmetric").addEventListener("change", e => ngPovertyMap(e.target.value));
  flyTo(featByKey.get(ng), {pad: .92, maxk: 14}); }
ACT.ngpov = el => ngPovertyMap(el && el.dataset.metric || S.ngMetric || "h", el && el.dataset.focus);


/* ---- the national overview: headline figures from the registry, read together ---- */
function NG_LEDE() { const w = D.wpp, sh = w && w.NGA && w.AFRICA ? w.NGA.p2026 / w.AFRICA.p2026 : null;
  const nw = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][Math.round(1 / sh)] || Math.round(1 / sh);
  return sh ? `Roughly one African in ${nw} is Nigerian: about ${shortNum(w.NGA.p2026)} people in 2026, by the UN's projection (there has been no census since 2006).` : "Nigeria is Africa's most populous country."; }
const NG_TILES = [["pop", "People", v => shortNum(v)], ["median_age", "Median age", v => Math.round(v) + " years"], ["gdp_usd_25", "Economy (GDP)"], ["gdp_pc_25", "Income per person"],
  ["mpi_nat", "Multidimensionally poor", v => v + "%"], ["oil_share", "Share of world oil output"]];
function NG_TILES_HTML() {
  return `<div class="tiles tiles3">${NG_TILES.filter(([id]) => IND[id] && ival(id, "NGA") != null).map(([id, lab, f]) => { const r = IND[id], k = (r.st && r.st("NGA")) || r.kind;
    return `<button class="tile tb" data-act="ngtile" data-id="${id}" aria-label="${esc(lab)}: compare"><small>${esc(lab)}</small><b>${esc(f ? f(ival(id, "NGA")) : itxt(id, "NGA"))}</b><em>${esc(KIND[k] || k)} · ${esc(r.period || "")}</em></button>`; }).join("")}</div>
  <p class="src" style="margin-top:4px">Tap a figure to compare Nigeria with its neighbours, the region and the world.</p>`; }
function NG_TOGETHER_HTML() { const ma = ival("median_age", "NGA"), g = ival("gdp_growth_26", "NGA"), pc = ival("gdp_pc_25", "NGA"), pcw = ival("gdp_pc_25", "WORLD");
  if (ma == null) return "";
  return `<p>Read together: a very young country (half of Nigerians are under ${Math.round(ma)}), with an economy projected to grow ${g != null ? (+g).toFixed(1) + "%" : "steadily"} in 2026${pc != null && pcw != null ? `, but income per person about ${Math.round(pcw / pc)} times lower than the world average in dollar terms` : ""}, and, in 2021/22, nearly two in three people deprived in several basics at once. None of these figures explains the others on its own, and each hides big differences inside the country. <button class="lnk" data-act="ngjump">See how the states differ</button></p>`; }
ACT.ngtile = el => { const id = el.dataset.id; if (CMP[id]) compareSheet(id, "NGA"); else indSheet(id); };
ACT.ngstateshome = () => { setMode("nigeria"); setTimeout(() => { const t = [...panel.querySelectorAll("h3")].find(h => h.textContent === "Explore the states"); if (t) panel.scrollTo({top: t.offsetTop - 12}); }, 120); };
ACT.ngjump = () => { const t = [...panel.querySelectorAll("h3")].find(h => h.textContent === "Many Nigerias"); if (t) panel.scrollTo({top: t.offsetTop - 12}); };


/* ---- test your intuition: Nigeria's states (from the canonical survey records, so it changes if they do) ---- */
GAMES.ngstates = { name: "Nigeria's states: trust your gut?", desc: "Two states, one question: which is higher? Built from the 2021/22 poverty survey, with only clear-cut pairs.", single: true, gen() {
  const mp = NOW().mpi, m = MPIS(), keys = Object.keys(mp), cen = k => { const f = ngStates().find(x => MPI_NAME(x.properties.name) === k); return f ? d3.geoCentroid(f) : null; };
  const kinds = [["h", "a larger <b>share</b> of people multidimensionally poor"], ["poor", "<b>more</b> multidimensionally poor <b>people</b>"], ["oos", "a larger share of <b>children out of school</b>"], ["dep:cooking", "more people who are poor <b>and cook with wood, charcoal or dung</b>"], ["dep:shock", "more people who are poor <b>and were hit by a security shock</b>"], ["dep:food", "more people who are poor <b>and severely food insecure</b>"]];
  for (let t = 0; t < 400; t++) { const [kind, phrase] = kinds[Math.floor(Math.random() * kinds.length)], [a, b] = shuffle(keys);
    const va = ngMetric(a, kind), vb = ngMetric(b, kind); if (va == null || vb == null) continue;
    const clear = kind === "h" ? (m.states[a].h_ci[0] > m.states[b].h_ci[1] || m.states[b].h_ci[0] > m.states[a].h_ci[1])
      : kind === "poor" ? Math.max(va, vb) / Math.min(va, vb) > 1.4
      : kind === "oos" ? Math.abs(va - vb) > 10
      : (c => c[a][0] > c[b][2] || c[b][0] > c[a][2])(Object.fromEntries([a, b].map(x => [x, m.states[x].censored[kind.slice(4)]])));
    if (!clear) continue;
    const hi = va > vb ? 0 : 1, f = v => kind === "poor" ? v + " million" : pctS(v);
    let twist = "";
    if (kind === "poor" && (mp[a].h - mp[b].h) * (va - vb) < 0) twist = ` Note the twist: ${stTitle(va > vb ? b : a)} has the higher share, but fewer people.`;
    if (kind === "h" && (mp[a].poor - mp[b].poor) * (va - vb) < 0) twist = ` But ${stTitle(va > vb ? b : a)} has more poor people (${(va > vb ? mp[b] : mp[a]).poor} million), because more people live there.`;
    return {q: `Which had ${phrase}?<br><span class="src">Nigeria poverty survey, 2021/22</span>`, opts: [stTitle(a), stTitle(b)], a: hi,
      why: `${stTitle(a)}: ${f(va)}. ${stTitle(b)}: ${f(vb)}.${twist}`, pins: [cen(a), cen(b)].filter(Boolean)}; }
  return {q: "Which is Nigeria's largest state by area?", opts: ["Niger", "Lagos"], a: 0, why: "Niger State is the largest; Lagos is the smallest."}; } };
