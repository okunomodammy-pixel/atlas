/* ---------- batch 13: money and economies ---------- */
const EURO = ["AUT","BEL","BGR","HRV","CYP","EST","FIN","FRA","DEU","GRC","IRL","ITA","LVA","LTU","LUX","MLT","NLD","PRT","SVK","SVN","ESP"];
const XOF = ["BEN","BFA","CIV","GNB","MLI","NER","SEN","TGO"], XAF = ["CMR","CAF","TCD","COG","GNQ","GAB"];
const CMA = ["ZAF","LSO","SWZ","NAM"], USDO = ["ECU","SLV","PAN","TLS","FSM","MHL","PLW"];
const UNIONS = [[EURO, "the euro area (21 countries since Bulgaria joined in 2026)"], [XOF, "the West African CFA franc (WAEMU, 8 countries)"], [XAF, "the Central African CFA franc (CEMAC, 6 countries)"],
  [CMA, "the Common Monetary Area, where the South African rand circulates alongside local currencies"], [USDO, "countries that use the US dollar as official currency"]];
const ECO_LABEL = s => s ? s.replace(/^\d\.\s*/, "").replace("Developed region: G7", "Developed economy (G7)").replace("Developed region: nonG7", "Developed economy").replace("Emerging region: BRIC", "Emerging economy (BRIC)").replace("Emerging region: MIKT", "Emerging economy (MIKT)").replace("Emerging region: G20", "Emerging economy (G20)").replace("Developing region", "Developing economy").replace("Least developed region", "Least developed economy") : null;
const NG_NOW = { fx: "about ₦1,333 per US dollar at the official rate on 21 October 2026 (₦1,365–1,380 on the parallel market)", cpi: "14.63% in September 2026 (15.39% in August), on the rebased consumer price index",
  gdp: "₦372.8 trillion in 2024 after the 2025 rebasing (base year 2019), about US$243 billion; services 55.5%, agriculture 27.8%, industry 16.7% of GDP" };
function econHTML(f) { const e = D.econ && D.econ[f.c3]; if (!e && !f.gdp) return "";
  const cur = e ? e.cur.map(([c, n, s]) => `${esc(n)} <span class="src">(${esc(c)}${s ? ", " + esc(s) : ""})</span>`).join("<br>") : "—";
  const u = UNIONS.find(([l]) => l.includes(f.c3)), per = f.gdp && f.pop0 ? f.gdp * 1e6 / f.pop0 : null;
  return `<h4>Money and economy</h4><dl class="facts">
    <dt>Currency</dt><dd>${cur}${u ? `<br><span class="src">Part of ${esc(u[1])}.</span>` : ""}</dd>
    ${e && e.eco ? `<dt>Economy type</dt><dd>${esc(ECO_LABEL(e.eco))}</dd>` : ""}
    ${f.inc ? `<dt>Income group</dt><dd>${esc(f.inc)}</dd>` : ""}
    ${f.c3 === "NGA" ? `<dt>Exchange rate</dt><dd>${esc(NG_NOW.fx)}</dd><dt>Inflation</dt><dd>${esc(NG_NOW.cpi)}</dd><dt>GDP</dt><dd>${esc(NG_NOW.gdp)}</dd>` : ""}
    ${f.gdp ? `<dt>GDP in 2019</dt><dd>US$${shortNum(f.gdp * 1e6).replace(" million", "m").replace(" billion", "bn")}${per ? `, about US$${fmt(per)} per person` : ""}</dd>` : ""}
  </dl><p class="src">Currencies: world-countries dataset, corrected for changes up to 2026. Economy type, income group and 2019 GDP: Natural Earth (from World Bank data). Dollar GDP moves with exchange rates, so 2019 figures can be far from today's${f.c3 === "NGA" ? "; the Nigerian figures above are from the NBS and market reports, October 2026" : ""}.</p>`; }
function moneyMap(v) { clearMap();
  if (v === "unions") { colorGroups([[EURO, "var(--c-eu)"], [XOF, "var(--sel)"], [XAF, "var(--miss)"], [CMA, "var(--c-oc)"], [USDO, "var(--c-sa)"]], {fly: "world"});
    legend([["--c-eu", "Euro (21)"], ["--sel", "West African CFA franc (8)"], ["--miss", "Central African CFA franc (6)"], ["--c-oc", "Rand area"], ["--c-sa", "US dollar as official currency"]]); }
  if (v === "cfa") { colorGroups([[XOF, "var(--sel)"], [XAF, "var(--miss)"], [ECOWAS.filter(c => !XOF.includes(c)), "var(--nb)"]], {maxk: 4});
    legend([["--sel", "West African CFA (WAEMU)"], ["--miss", "Central African CFA (CEMAC)"], ["--nb", "ECOWAS states with their own currency"]]); }
  if (v === "pc") { const g = [[], [], [], [], []];
    Object.values(D.facts).forEach(f => { if (!f.gdp || !f.pop0) return; const p = f.gdp * 1e6 / f.pop0; g[p < 1100 ? 0 : p < 4000 ? 1 : p < 13000 ? 2 : p < 40000 ? 3 : 4].push(f.c3); });
    colorGroups([[g[0], "var(--sel)"], [g[1], "var(--nb)"], [g[2], "var(--d1)"], [g[3], "var(--d2)"], [g[4], "var(--d4)"]], {fly: "world", dim: false});
    legend([["--sel", "Under $1,100 per person"], ["--nb", "$1,100–4,000"], ["--d1", "$4,000–13,000"], ["--d2", "$13,000–40,000"], ["--d4", "Over $40,000"]]); }
  if (v === "size") { const all = Object.values(D.facts).filter(f => f.gdp).sort((a, b) => b.gdp - a.gdp), top = all.slice(0, 10).map(f => f.c3), afr = all.filter(f => f.reg === "Africa").slice(0, 5).map(f => f.c3);
    colorGroups([[afr, "var(--sel)"], [top, "var(--d3)"]], {fly: "world"}); legend([["--d3", "Ten largest economies (2019, US$)"], ["--sel", "Five largest in Africa"]]); } }
ACT.money = el => moneyMap(el.dataset.v);
MODES.money = () => { clearMap(); resetView();
  const ng = byKey.get("566"), afr = Object.values(D.facts).filter(f => f.gdp && f.reg === "Africa").sort((a, b) => b.gdp - a.gdp).slice(0, 5);
  setPanel(`<div class="eyebrow">Economics</div><h2>Money and economies on the map</h2>
  <p>Every country page now has a "Money and economy" section. This lesson explains what those numbers mean, why currencies cross borders, and why the same economy can look rich or poor depending on how you measure it.</p>

  <h3>1. What a currency is</h3>
  <p>A currency is a promise that people will accept it in payment, backed by a state and managed by a central bank (the Central Bank of Nigeria for the naira). Its value against other currencies, the <b>exchange rate</b>, can <b>float</b> with supply and demand, be <b>pegged</b> at a fixed rate to another currency, or be <b>managed</b> in between. A country can also give up its own currency and use someone else's.</p>
  <p><b>The trade-off:</b> a floating currency absorbs shocks (when oil prices fall, the naira falls, and exports become cheaper) but makes import prices and inflation jump. A peg brings stability and low inflation but removes a tool: the country cannot devalue or set its own interest rates.</p>

  <h3>2. Currencies shared across borders</h3>
  <div class="btnrow"><button class="btn primary" data-act="money" data-v="unions">Map the currency unions</button></div>
  <ul><li><b>The euro</b>: 21 EU countries share one currency and one central bank (the ECB, in Frankfurt). Bulgaria joined on 1 January 2026.</li>
  <li><b>The CFA francs</b>: two currencies used by 14 African countries, mostly former French colonies: the West African CFA franc (8 WAEMU states, including Nigeria's neighbours Benin and Niger) and the Central African CFA franc (6 CEMAC states, including Cameroon and Chad). Both are pegged at 655.957 francs to the euro, and France guarantees convertibility.</li>
  <li><b>The rand area</b>: Lesotho, Eswatini and Namibia peg their currencies to the South African rand, which also circulates there.</li>
  <li><b>Dollarised countries</b> such as Ecuador, El Salvador, Panama and Timor-Leste use the US dollar outright. Zimbabwe launched a new gold-backed currency, the ZiG, in 2024, but the dollar still dominates daily trade, and in 2026 the central bank dropped its target date for making the ZiG the only currency: a lesson in how hard it is to rebuild trust in money.</li></ul>

  <h3>3. The CFA franc debate</h3>
  <div class="btnrow"><button class="btn" data-act="money" data-v="cfa">Show the CFA zones next to Nigeria</button></div>
  <p><b>Facts.</b> The CFA franc was created in 1945. In 2019 France and the WAEMU states agreed reforms: the West African central bank no longer has to keep half its reserves in the French Treasury, and French officials left its boards. The peg to the euro and the French guarantee remain. The planned renaming of the West African CFA franc to "Eco" has not yet happened. Central Africa has not reformed its CFA in the same way.</p>
  <p><b>The case for it:</b> the CFA zones have had much lower inflation than most of their neighbours, including Nigeria and Ghana, and a stable currency helps saving and trade.</p>
  <p><b>The case against:</b> critics such as the economists Kako Nubukpo and Ndongo Samba Sylla argue it ties African monetary policy to Europe's needs, keeps exports expensive, encourages capital to leave, and is a symbol of continuing French influence. Mali, Burkina Faso and Niger have talked about leaving it.</p>
  <p><span class="kind">Interpretation</span>The debate is really about the trade-off in section 1: stability imported from outside, against control at home.</p>

  <h3>4. The Eco: West Africa's single currency plan</h3>
  <p>ECOWAS has planned a single currency, the Eco, since the early 2000s, and missed every target date. In 2025 and again in 2026 its leaders set <b>1 July 2027</b> as the launch date, for the member states that meet the agreed "convergence criteria" (limits on inflation, deficits and debt); others would join later.</p>
  <p><b>Why it is hard:</b> Nigeria's economy is far larger than the others, so a shared central bank would be pulled towards Nigeria's needs; Nigeria exports oil while most neighbours export cocoa, cotton or gold, so they are hit by different shocks at different times; the eight CFA states would have to give up the euro peg; and the exit of Mali, Burkina Faso and Niger from ECOWAS in 2025 has shrunk the project. Watch whether 2027 holds.</p>

  <h3>5. The naira</h3>
  <p>The naira replaced the Nigerian pound on 1 January 1973, at two naira to the pound. For years the government held it at an official rate far above its market value, rationing dollars and creating a gap with the "black market". The Structural Adjustment Programme of 1986 began a long series of devaluations.</p>
  <p>In June 2023 the Central Bank unified the official rates and let the naira float. It fell from about ₦460 to the dollar to beyond ₦1,500 during 2024, before recovering to <b>${esc(NG_NOW.fx)}</b>. Prices of imported goods and fuel soared, and inflation passed 30% in 2024; on the rebased index it was <b>${esc(NG_NOW.cpi.split(" (")[0])}</b>.</p>
  <p><b>The mechanism:</b> a weaker naira makes every import, from wheat to petrol to machine parts, cost more naira, and those costs pass into prices. In the other direction it makes Nigerian exports and labour cheaper for foreigners, which only helps if Nigeria has things to sell.</p>

  <h3>6. Size versus living standards</h3>
  <div class="btnrow"><button class="btn" data-act="money" data-v="size">Map the largest economies</button><button class="btn" data-act="money" data-v="pc">Map GDP per person</button></div>
  <p><b>GDP</b> (gross domestic product) is the value of everything an economy produces in a year. Total GDP measures size and weight in the world; GDP <b>per person</b> says more about living standards. In the 2019 data, Africa's five largest economies were ${afr.map(f => esc(f.n)).join(", ")}${ng && ng.gdp ? `, and Nigeria's GDP per person was only about US$${fmt(ng.gdp * 1e6 / ng.pop0)}` : ""}.</p>
  <p><b>The exchange-rate trap.</b> Nigeria's 2025 rebasing raised its 2024 GDP by about 34% in naira, to ₦372.8 trillion, mainly by counting sectors such as services and real estate better. Yet in dollars it is about US$243 billion, far below the US$448 billion of 2019, because the naira lost most of its dollar value. The country did not produce less; the measuring stick shrank. That is why economists also use <b>purchasing power parity (PPP)</b>, which compares what money actually buys at home.</p>
  <p class="src">The maps in this section use 2019 World Bank figures via Natural Earth, before the naira devaluation and before Nigeria's rebasing; treat them as a picture of relative positions, not today's values.</p>

  <h3>7. What an economy sells</h3>
  <p>After the rebasing, services make up 55.5% of Nigeria's GDP, agriculture 27.8% and industry 16.7%, and real estate now contributes more than oil and gas. But oil still earns most of Nigeria's export income and much of government revenue. That combination, a big domestic economy but foreign currency from one commodity, is why oil prices move the naira, the budget and inflation all at once.</p>
  <p><b>"Dutch disease"</b> describes the trap: a commodity boom brings in dollars, the currency strengthens, imports become cheap, and farming and factories that compete with imports decline. When the boom ends, the country has fewer other things to sell. Many economists read Nigeria after the 1970s oil boom this way (lesson 5, part 8).</p>
  <p><span class="kind">Interpretation</span>A liberal economist stresses removing distortions (multiple exchange rates, fuel subsidies) so prices tell the truth; a dependency theorist stresses the commodity trap built in colonial times; a "developmental state" view, drawn from South Korea and China, says governments must actively build industries. Nigeria's 2023 reforms followed the first view; whether they produce the jobs the second and third views demand is the open question.</p>
  <p class="src">Sources: Central Bank of Nigeria and National Bureau of Statistics figures as reported in October 2026; Africa Check on the 2025 GDP rebasing; ECOWAS Convergence Council (September 2026); euro area and CFA facts from the ECB, BCEAO and BEAC; Natural Earth for 2019 GDP.</p>`); };
QB.push(...[
 ["mo1", "money", "Which country became the 21st member of the euro area in January 2026?", ["Bulgaria", "Romania", "Croatia", "Poland"], 0, "Bulgaria adopted the euro on 1 January 2026.", "2. Currencies"],
 ["mo2", "money", "The two CFA francs are pegged to which currency?", ["The euro", "The US dollar", "The pound sterling", "Gold"], 0, "Both are fixed at 655.957 francs per euro, with a French guarantee.", "2. Currencies"],
 ["mo3", "money", "When did the Central Bank of Nigeria unify the official rates and let the naira float?", ["June 2023", "January 1973", "1986", "October 2026"], 0, "June 2023; the naira fell from about ₦460 to beyond ₦1,500 per dollar during 2024.", "5. The naira"],
 ["mo4", "money", "Why did Nigeria's GDP in dollars fall below its 2019 level even after the 2025 rebasing raised it in naira?", ["The naira lost most of its value against the dollar", "Nigeria's output fell by half", "Oil was removed from GDP", "The population shrank"], 0, "Dollar GDP depends on the exchange rate; the measuring stick shrank, not the economy.", "6. Size"],
 ["mo5", "money", "What is the target launch date for the ECOWAS single currency, the Eco?", ["1 July 2027", "1 January 2026", "2030", "It has been abandoned"], 0, "ECOWAS leaders set 1 July 2027 for members that meet the convergence criteria.", "4. The Eco"],
 ["mo6", "money", "'Dutch disease' describes…", ["a commodity boom that strengthens the currency and hurts other exports and industry", "a banking crisis caused by tulip speculation", "inflation caused by printing money", "a trade war between Europe and Africa"], 0, "Booming commodity exports raise the currency and crowd out farming and manufacturing.", "7. What an economy sells"]
].map(([id, l, q, o, a, why, at]) => ({id, l, q, o, a, why, at})));
