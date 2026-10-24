function demographyHTML(f) { const w = f.w; if (!w) return ""; const c = f.c3;
  const pts = [[1960, w.p1960], [2000, w.p2000], [2026, w.p2026], [2050, w.p2050], [2100, w.p2100]].filter(p => p[1]), mx = Math.max(...pts.map(p => p[1]));
  const ch = ival("pop_change_2050", c);
  return `<h4>People, today and tomorrow</h4>
  <div>${pts.map(([y, p]) => `<div class="bar"><span>${y}${y > 2026 ? " (proj.)" : ""}</span><span class="track"><i style="width:${(p / mx * 100).toFixed(1)}%;${y > 2026 ? "opacity:.5" : ""}"></i></span><span class="n">${shortNum(p).replace(" million", "m").replace(" billion", "bn")}</span></div>`).join("")}</div>
  <dl class="facts">${drow("median_age", c, {cmp: worldCmp("median_age", "WORLD")})}${drow("tfr", c, {cmp: worldCmp("tfr", "WORLD")})}${drow("life_exp", c, {cmp: worldCmp("life_exp", "WORLD")})}${drow("pop_growth", c, {cmp: worldCmp("pop_growth", "WORLD")})}${drow("imr", c)}${drow("net_mig", c)}</dl>
  ${ch != null ? `<p>${esc(f.n)}'s population is projected to ${ch >= 0 ? "grow by " + Math.round(ch) + "%" : "shrink by " + Math.round(-ch) + "%"} between 2026 and 2050${w.ma50 ? `, and its median age to reach ${w.ma50.toFixed(0)}` : ""}.</p>` : ""}`; }
function econHTML(f) { const c = f.c3, e = D.econ && D.econ[c];
  const cur = e ? e.cur.map(([cc, n, s]) => `${esc(n)} <span class="src">(${esc(cc)}${s ? ", " + esc(s) : ""})</span>`).join("<br>") : null;
  const u = UNIONS.find(([l]) => l.includes(c));
  const rows = [cur ? `<dt>Currency<button class="ib" data-ind="currency" aria-label="About this figure: Currency">i</button></dt><dd>${cur}${u ? `<br><span class="src">Part of ${esc(u[1])}.</span>` : ""}</dd>` : "",
    drow("fx_ngn", c), drow("gdp_ngn", c),
    drow("gdp_growth_25", c, {cmp: worldCmp("gdp_growth_25", "WORLD")}), drow("gdp_growth_26", c, {cmp: worldCmp("gdp_growth_26", "WORLD")}),
    drow("cpi_yoy", c), drow("cpi_avg_25", c, {cmp: worldCmp("cpi_avg_25", "WORLD")}), drow("cpi_avg_26", c, {cmp: worldCmp("cpi_avg_26", "WORLD")}),
    drow("ca_26", c), drow("unemp_26", c), drow("mpi_nat", c), drow("pov_money", c), drow("income", c)].join("");
  if (!rows) return "";
  return `<h4>Money and economy</h4><dl class="facts">${rows}</dl>${c === "NGA" ? `<p class="src">Two inflation figures measure different things: the NBS figure compares one month with the same month a year earlier; the IMF figures are averages over a whole year. Likewise, multidimensional poverty and money-based poverty are different measures.</p>` : ""}`; }
function imfRows() { return ""; }
function nowHTML(f) { const c = f.c3; let h = "";
  const en = drow("oil_out", c, {cmp: ival("oil_share", c) != null ? ` <span class="src">(${itxt("oil_share", c)} of the world)</span>` : ""}) + drow("gas_out", c, {cmp: ival("gas_share", c) != null ? ` <span class="src">(${itxt("gas_share", c)} of the world)</span>` : ""}) + drow("cobalt", c, {label: "Share of world cobalt mining"}) + drow("lithium", c, {label: "Share of world lithium mining"}) + drow("ree", c, {label: "Share of world rare-earth mining"});
  if (en) h += `<h4>Energy and resources</h4><dl class="facts">${en}</dl>`;
  const mg = drow("mig_in", c, {cmp: ival("mig_share", c) != null ? ` <span class="src">(${itxt("mig_share", c)} of the population)</span>` : ""}) + drow("mig_out", c);
  if (mg) h += `<h4>People on the move</h4><dl class="facts">${mg}</dl>`;
  const rk = drow("ndgain", c) + drow("war", c);
  if (rk) h += `<h4>Risks</h4><dl class="facts">${rk}</dl>`;
  if (h) h += `<p class="src">Tap <span class="ib" aria-hidden="true" style="display:inline-grid">i</span> next to any figure for what it measures, when, where it comes from and how current it is.</p>`;
  return h; }
const NG_NOW = { get fx() { return `${IND.fx_ngn.f(ival("fx_ngn", "NGA")).replace(" (official, selling)", "")} at the official rate on ${IND.fx_ngn.period} (${IND.fx_ngn.extra("NGA")})`; },
  get cpi() { return `${itxt("cpi_yoy", "NGA")} in ${IND.cpi_yoy.period} (${IND.cpi_yoy.extra("NGA")}), on the rebased consumer price index`; },
  get gdp() { return `${itxt("gdp_ngn", "NGA")}; ${IND.gdp_ngn.extra("NGA")}`; } };
