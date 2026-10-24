/* ---------- batch 15: Today's world layers (Map menu) ---------- */
const WARS = { major: ["UKR","RUS","ISR","PSE","LBN","MMR","SDN","COD","SOM","MLI","BFA","NER","NGA","MEX"],
  minor: ["IRN","PAK","ETH","COL","AFG","ECU","VEN","YEM","SYR","CMR","CAF","HTI"] };
const MINERALS = [
  ["cobalt", "Cobalt", "var(--c-sa)", [["COD", "73% of world mine output"], ["IDN", "14%"]], "batteries for phones and electric cars"],
  ["lithium", "Lithium", "var(--c-oc)", [["AUS", "32%"], ["CHL", "19%"], ["ZWE", "10%"], ["ARG", "8%"]], "rechargeable batteries"],
  ["ree", "Rare earths", "var(--sel)", [["CHN", "69% of mining, and most refining"], ["USA", "13%"]], "magnets in motors, wind turbines, electronics and weapons"]];
const THEME_INFO = {
  wars: () => ({ t: "Wars and armed conflict, 2025–26", items: [["--miss", "Major war: 10,000+ deaths in a year"], ["--sel", "Smaller war: 1,000–9,999 deaths"]],
    note: "Countries where fighting takes place, from the list of ongoing armed conflicts (UCDP/ACLED-based), checked October 2026. Nigeria appears for the jihadist insurgency in the north-east and Sahel. Death counts are per conflict, not per country.", groups: [[WARS.minor, "var(--sel)"], [WARS.major, "var(--miss)"]] }),
  minerals: () => ({ t: "Critical minerals: who mines them (2025)", items: MINERALS.map(m => [m[2].slice(4, -1), `${m[1]}: ${m[3].map(([c, s]) => nameOf(k3(c)) + " " + s).join(", ")}`]),
    note: "These minerals power the energy transition: cobalt and lithium for batteries, rare earths for magnets. Mining is concentrated in a few countries, which is why they now shape trade deals and rivalries. Source: USGS Mineral Commodity Summaries 2026.", groups: MINERALS.map(m => [m[3].map(x => x[0]), m[2]]) }),
  age: () => { const g = [[], [], [], [], []]; Object.values(D.facts).forEach(f => { if (!f.w || f.w.ma == null) return; const a = f.w.ma; g[a < 20 ? 0 : a < 25 ? 1 : a < 32 ? 2 : a < 40 ? 3 : 4].push(f.c3); });
    return { t: "Median age, 2026", items: [["--sel", "Under 20"], ["--nb", "20–25"], ["--d1", "25–32"], ["--d2", "32–40"], ["--d4", "40 and over"]],
      note: `Half the people are younger than this age. World ${D.wpp.WORLD.ma.toFixed(0)}, Nigeria ${D.wpp.NGA.ma.toFixed(0)}. Young countries need jobs and schools; old ones need workers and pensions. UN WPP 2024.`, groups: [[g[0], "var(--sel)"], [g[1], "var(--nb)"], [g[2], "var(--d1)"], [g[3], "var(--d2)"], [g[4], "var(--d4)"]], dim: false }; },
  growth: () => { const g = [[], [], [], [], []]; Object.values(D.facts).forEach(f => { if (!f.w || !f.w.p2050) return; const c = f.w.p2050 / f.w.p2026 - 1; g[c < -0.05 ? 0 : c < 0.05 ? 1 : c < 0.25 ? 2 : c < 0.5 ? 3 : 4].push(f.c3); });
    return { t: "Population change, 2026 to 2050", items: [["--d4", "Shrinking more than 5%"], ["--d1", "About stable"], ["--c-oc", "Growing 5–25%"], ["--nb", "Growing 25–50%"], ["--sel", "Growing over 50%"]],
      note: `By 2050 about a quarter of humanity will be African. Nigeria: ${shortNum(D.wpp.NGA.p2026)} to ${shortNum(D.wpp.NGA.p2050)}. UN medium projection.`, groups: [[g[0], "var(--d4)"], [g[1], "var(--d1)"], [g[2], "var(--c-oc)"], [g[3], "var(--nb)"], [g[4], "var(--sel)"]], dim: false }; },
  money: () => ({ t: "Shared currencies", items: [["--c-eu", "Euro (21)"], ["--sel", "West African CFA franc (8)"], ["--miss", "Central African CFA franc (6)"], ["--c-oc", "Rand area"], ["--c-sa", "US dollar as official currency"]],
    note: "Countries that share or borrow a currency give up control of their own exchange rate. See the Money lesson.", groups: [[EURO, "var(--c-eu)"], [XOF, "var(--sel)"], [XAF, "var(--miss)"], [CMA, "var(--c-oc)"], [USDO, "var(--c-sa)"]] })
};
function setTheme(v) { S.theme = v || null; $("#themesel").value = v || "";
  if (!v) { S.color = null; G.countries.selectAll("path").classed("dim", false); paint(); legend(null); return; }
  const th = THEME_INFO[v](); S.sel = null; colorGroups(th.groups, {fly: false, dim: th.dim === false ? false : true});
  const l = $("#legend"); l.innerHTML = `<div class="lgt">${esc(th.t)}</div>${th.items.map(([c, t]) => `<div><i style="background:var(${c})"></i>${esc(t)}</div>`).join("")}<div class="lgn">${esc(th.note)}</div><button class="lgx" data-theme-off>Turn off</button>`; l.hidden = false; }
$("#themesel").addEventListener("change", e => { setTheme(e.target.value); toggleLayers(false); });
$("#legend").addEventListener("click", e => { if (e.target.closest("[data-theme-off]")) setTheme(null); });
ACT.themes = () => { toggleLayers(true); $("#themesel").focus(); };
