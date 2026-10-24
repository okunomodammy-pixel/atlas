/* ---------- batch 16: the world now — IMF WEO (Oct 2026), Energy Institute (2026), UN migrant stock (2024), ND-GAIN (2026), Nigeria MPI (2022) ---------- */
const NOW = () => D.now || {};
const pct = (v, d = 1) => v == null ? "—" : `${v > 0 ? "" : ""}${v.toFixed(d)}%`;
function imfRows(f) { const m = NOW().imf && NOW().imf[f.c3]; if (!m) return "";
  return `<dt>Growth</dt><dd>${pct(m.g25)} in 2025; ${pct(m.g26)} projected for 2026 <span class="src">(IMF, real GDP; world 3.1%)</span></dd>
    <dt>Inflation (IMF)</dt><dd>${pct(m.cpi25)} average in 2025; ${pct(m.cpi26)} projected for 2026 <span class="src">(world 4.7%)</span></dd>
    ${m.ca26 != null ? `<dt>Current account</dt><dd>${m.ca26 > 0 ? "Surplus" : "Deficit"} of ${Math.abs(m.ca26).toFixed(1)}% of GDP projected for 2026 <span class="src">(${m.ca26 > 0 ? "it earns more from the world than it spends" : "it spends more abroad than it earns, and borrows or draws on savings to cover it"})</span></dd>` : ""}
    ${m.un26 != null ? `<dt>Unemployment</dt><dd>${pct(m.un26)} projected for 2026</dd>` : ""}`; }
function nowHTML(f) { const n = NOW(); let h = "";
  const oil = n.energy && n.energy.oil[f.c3], gas = n.energy && n.energy.gas[f.c3];
  if (oil || gas) h += `<h4>Energy</h4><dl class="facts">${oil && oil.v ? `<dt>Oil output</dt><dd>${fmt(oil.v)} thousand barrels a day in 2025 <span class="src">(${oil.sh}% of the world)</span></dd>` : ""}${gas && gas.v ? `<dt>Gas output</dt><dd>${gas.v} billion cubic metres in 2025 <span class="src">(${gas.sh}% of the world)</span></dd>` : ""}</dl>`;
  const mg = n.mig && n.mig[f.c3 === "UNK" ? "XKX" : f.c3], p24 = f.w && f.w.p2024;
  if (mg) { const nm = c => esc(nameOf(k3(c)) || c), sh = v => p24 && v ? ` <span class="src">(${(v / p24 * 100).toFixed(v / p24 < .01 ? 2 : 1)}% of its population)</span>` : "";
    h += `<h4>People on the move</h4><dl class="facts">
      ${mg.imm != null ? `<dt>Born abroad, living here</dt><dd>${shortNum(mg.imm)}${sh(mg.imm)}${mg.from.length ? `<br><span class="src">Mostly from ${mg.from.map(([c]) => nm(c)).join(", ")}</span>` : ""}</dd>` : ""}
      ${mg.emi != null ? `<dt>Born here, living abroad</dt><dd>${shortNum(mg.emi)}${sh(mg.emi)}${mg.to.length ? `<br><span class="src">Mostly in ${mg.to.map(([c]) => nm(c)).join(", ")}</span>` : ""}</dd>` : ""}</dl>`; }
  const g = n.gain && n.gain[f.c3];
  if (g) { const all = Object.values(n.gain).map(x => x.gain).sort((a, b) => b - a), rank = all.indexOf(g.gain) + 1;
    h += `<h4>Climate risk</h4><p style="margin:0 0 6px">ND-GAIN score <b>${g.gain}</b>, ranked <b>${rank}</b> of ${all.length} countries <span class="src">(higher means less vulnerable and better prepared to adapt)</span>.</p>`; }
  if (h) h += `<p class="src">Sources: IMF World Economic Outlook (October 2026); Energy Institute Statistical Review of World Energy 2026; UN DESA International Migrant Stock 2024; ND-GAIN Country Index 2026 release (2024 data).</p>`;
  return h; }
/* Nigeria: poverty by state */
const MPI_NAME = s => s === "Nassarawa" ? "Nasarawa" : s === "Federal Capital Territory" ? "FCT" : s;
function ngPovertyMap() { const mp = NOW().mpi; if (!mp) return;
  const st = ngStates(), ng = "566", nbSet = new Set(byKey.get(ng).b.map(c => byC3.get(c)));
  S.sel = null; S.color = k => k === ng ? "transparent" : null; G.countries.selectAll("path").classed("dim", d => d.key !== ng && !nbSet.has(d.key)); paint();
  const col = h => h < 40 ? "var(--d1)" : h < 60 ? "var(--d2)" : h < 75 ? "var(--nb)" : h < 85 ? "var(--sel)" : "var(--miss)";
  G.states.selectAll("path").data(st).join("path").attr("class", "state").style("fill", d => { const r = mp[MPI_NAME(d.properties.name)]; return r ? col(r.h) : "var(--land)"; }).style("stroke-opacity", null)
    .on("click", (ev, d) => { ev.stopPropagation(); const s = d.properties.name, r = mp[MPI_NAME(s)];
      showPeekHTML(`<b class="pn">${esc(stName(s))}</b><span class="ps">${esc(zoneOf(s))} zone · 2022</span><p style="margin:8px 0 0"><b>${r.h}%</b> multidimensionally poor, about <b>${r.poor} million</b> people.${s === "Borno" ? " Borno's figure is less certain: the survey could not cover the whole state." : ""}</p>`); });
  G.stateslabels.selectAll("text").data(st.map(f => ({c: d3.geoCentroid(f), n: (mp[MPI_NAME(f.properties.name)] || {}).h + "%"}))).join("text").text(d => d.n);
  $("#L-labels").checked = false; applyLayers(); render();
  const l = $("#legend"); l.innerHTML = `<div class="lgt">Nigeria: share of people multidimensionally poor, 2022</div>${[["--d1", "Under 40%"], ["--d2", "40–60%"], ["--nb", "60–75%"], ["--sel", "75–85%"], ["--miss", "85% and over"]].map(([c, t]) => `<div><i style="background:var(${c})"></i>${t}</div>`).join("")}<div class="lgn">Poor in health, education and living standards, not only income. National: 63% (133 million). NBS Nigeria MPI Survey 2022.</div>`; l.hidden = false;
  flyTo(featByKey.get(ng), {pad: .92, maxk: 14}); }
ACT.ngpov = () => ngPovertyMap();
const NGPOV_HTML = () => { const mp = NOW().mpi; if (!mp) return "";
  return `<h3>Poverty by state (2022)</h3>
  <p>Nigeria's 2022 Multidimensional Poverty Index counts people as poor when they lack several basics at once: schooling, health care, clean water, sanitation, cooking fuel, housing, food security and work. By that measure <b>63% of Nigerians, about 133 million people, were poor</b>, compared with 40% under the 2018/19 money-based poverty line.</p>
  <div class="btnrow"><button class="btn primary" data-act="ngpov">Map poverty by state</button></div>
  <ul><li>The share ranges from <b>27% in Ondo</b> and 29% in Lagos to <b>91% in Sokoto</b>.</li>
  <li><b>Kano has the most poor people</b> (about 10.5 million) even though its share (66%) is lower than Sokoto's, because its population is so large.</li>
  <li>The commonest deprivations are cooking fuel, sanitation, time to health care, food insecurity and housing. About 29% of school-age children were out of school.</li></ul>
  <p><span class="kind">Interpretation</span>The north–south gap echoes the colonial era, when mission schools spread across the south far more than the north (lesson 5, part 5), and is worsened today by insecurity in the north-east and north-west. But geography is not the whole story: <b>Bayelsa</b>, an oil-producing Niger Delta state, is among the poorest at 88.5%, a reminder of the "resource curse" and Dutch disease (lesson 11) and of the Ogoni struggle (lesson 5, part 8).</p>
  <p class="src">Source: National Bureau of Statistics, Nigeria Multidimensional Poverty Index Survey Results 2022 (with OPHI and UNICEF). Results are representative for every state except Borno.</p>`; };
/* Today's world: more layers */
function binTheme(t, src, val, bins, note, dim) { const g = bins.map(() => []);
  Object.values(D.facts).forEach(f => { const v = val(f); if (v == null || isNaN(v)) return; const i = bins.findIndex(b => v < b[0]); g[i < 0 ? bins.length - 1 : i].push(f.c3); });
  return { t, items: bins.map(b => [b[1], b[2]]), note: note + " " + src, groups: bins.map((b, i) => [g[i], `var(${b[1]})`]), dim: dim === true ? true : false }; }
Object.assign(THEME_INFO, {
  growth26: () => binTheme("Economic growth, 2026 (IMF projection)", "IMF World Economic Outlook, October 2026.", f => NOW().imf && NOW().imf[f.c3] ? NOW().imf[f.c3].g26 : null,
    [[0, "--miss", "Shrinking"], [2, "--nb", "0–2%"], [4, "--d1", "2–4%"], [6, "--d2", "4–6%"], [Infinity, "--d4", "Over 6%"]], "Real GDP growth. World: 3.1%. Gulf producers dip in 2026 because of the Middle East war and Hormuz."),
  infl26: () => binTheme("Inflation, 2026 (IMF projection)", "IMF World Economic Outlook, October 2026.", f => NOW().imf && NOW().imf[f.c3] ? NOW().imf[f.c3].cpi26 : null,
    [[2, "--d1", "Under 2%"], [5, "--d2", "2–5%"], [10, "--nb", "5–10%"], [25, "--sel", "10–25%"], [Infinity, "--miss", "25% and over"]], "Average yearly rise in consumer prices. World: 4.7%, pushed up by energy and food prices after the war."),
  oil: () => binTheme("Oil producers, 2025", "Energy Institute Statistical Review of World Energy 2026.", f => NOW().energy && NOW().energy.oil[f.c3] ? NOW().energy.oil[f.c3].sh : null,
    [[1, "--d1", "Under 1% of world output"], [3, "--d2", "1–3%"], [10, "--d3", "3–10%"], [Infinity, "--miss", "10% and over"]], "Share of world oil production. The US (20.9%), Saudi Arabia (11.3%) and Russia (10.7%) lead; Nigeria produced 1.7%.", true),
  gas: () => binTheme("Gas producers, 2025", "Energy Institute Statistical Review of World Energy 2026.", f => NOW().energy && NOW().energy.gas[f.c3] ? NOW().energy.gas[f.c3].sh : null,
    [[1, "--d1", "Under 1% of world output"], [3, "--d2", "1–3%"], [10, "--d3", "3–10%"], [Infinity, "--miss", "10% and over"]], "Share of world natural gas production. The US (25.6%) and Russia (14.5%) lead; Nigeria produced 1.2%.", true),
  migrants: () => binTheme("Migrants as a share of the population, 2024", "UN DESA International Migrant Stock 2024.", f => { const m = NOW().mig && NOW().mig[f.c3 === "UNK" ? "XKX" : f.c3]; return m && m.imm != null && f.w && f.w.p2024 ? m.imm / f.w.p2024 * 100 : null; },
    [[1, "--tag", "Under 1%"], [5, "--d1", "1–5%"], [15, "--d2", "5–15%"], [35, "--d3", "15–35%"], [Infinity, "--d4", "35% and over"]], "People living in a country they were not born in. Gulf states top the list because most workers are foreign."),
  climate: () => binTheme("Climate risk and readiness (ND-GAIN)", "ND-GAIN Country Index, 2026 release (2024 data).", f => NOW().gain && NOW().gain[f.c3] ? NOW().gain[f.c3].gain : null,
    [[40, "--miss", "Most at risk (under 40)"], [50, "--sel", "40–50"], [60, "--nb", "50–60"], [70, "--d2", "60–70"], [Infinity, "--d4", "Best prepared (70+)"]], "Combines exposure to drought, floods and heat with the ability to adapt. Nigeria scores 37.6, 157th of 190."),
  ngpov: () => ({ special: true })
});
