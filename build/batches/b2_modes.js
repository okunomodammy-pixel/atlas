/* ---------- batch 2: shared helpers ---------- */
G.ghost = root.insert("g", ".lines").attr("class", "ghost");
const k3 = c3 => byC3.get(c3);
function highlight(c3s, opts = {}) {
  const set = new Set(c3s.map(k3).filter(Boolean)), col = opts.color || "var(--accent)";
  S.color = k => set.has(k) ? col : null; S.sel = null; paint();
  G.countries.selectAll("path").classed("dim", d => opts.dim !== false && !set.has(d.key));
  if (opts.fly !== false) flyToKeys([...set], {pad: opts.pad || .85, maxk: opts.maxk || 8}); }
function caseCard(c, i) {
  return `<div class="case"><h3>${esc(c.t)}</h3><div class="btnrow"><button class="btn primary" data-act="${c.act || "case"}" data-i="${i}">Show on the map</button></div>${c.body}</div>`; }

/* ---------- Borders course ---------- */
const CASES = [
 { t: "The partition of Africa", keys: ["DZA","LBY","EGY","SDN","MLI","NER","MRT","TCD"], maxk: 4,
   body: `<p>At the Berlin Conference of 1884–1885, European powers agreed rules for claiming African territory. Most of today's borders were then drawn between the 1880s and the 1910s, often by officials who had never seen the land.</p>
   <p>The map highlights the Sahara, where many borders are <b>straight lines</b>: lines of latitude, longitude or survey lines through sparsely populated desert. Elsewhere, borders cut through peoples: Yoruba communities live in Nigeria and Benin, Hausa in Nigeria and Niger, Ewe in Ghana and Togo, Somali in Somalia, Ethiopia, Kenya and Djibouti.</p>
   <p>In 1964 the Organisation of African Unity agreed that member states would respect the borders they inherited at independence. Most borders have stayed put since, even where they divide communities.</p>` },
 { t: "The Gambia: a river becomes a country", keys: ["GMB","SEN"], maxk: 14,
   body: `<p>Britain held trading posts along the Gambia River; France held the land around it. In 1889 the two agreed a border that follows the river valley. The result is a country roughly 10–50 km wide and about 300 km long, almost cutting Senegal in two.</p>
   <p>Lesson: a "natural" border such as a river is still a political choice. Here it was chosen for trade, not for the people living on its banks.</p>` },
 { t: "Togoland and the Cameroons: borders by vote", keys: ["TGO","GHA","CMR","NGA"], maxk: 6,
   body: `<p>Germany lost its colonies after the First World War. <b>Togoland</b> was split between Britain and France; in a 1956 plebiscite British Togoland voted to join the Gold Coast, which became Ghana. <b>Kamerun</b> was split too: in 1961 the northern part of British Cameroons voted to join Nigeria and the southern part to join Cameroon.</p>
   <p>The Nigeria–Cameroon border was later tested again over the oil-rich <b>Bakassi Peninsula</b>. The International Court of Justice ruled in 2002 that it belongs to Cameroon, and Nigeria completed the handover in 2008.</p>` },
 { t: "The Middle East after the Ottoman Empire", keys: ["IRQ","SYR","LBN","JOR","ISR","PSE","SAU"], maxk: 6,
   body: `<p>During the First World War, Britain and France secretly agreed the Sykes–Picot plan (1916) to divide Ottoman lands into zones of influence. After the war the League of Nations gave Britain mandates over Iraq, Palestine and Transjordan, and France mandates over Syria and Lebanon.</p>
   <p>Straight desert lines between Jordan, Iraq, Syria and Saudi Arabia date from this period. But the final borders also came from later treaties, local rulers, independence struggles and wars, including the Arab–Israeli wars, so no single agreement explains the whole map.</p>` },
 { t: "The partition of India (1947)", keys: ["IND","PAK","BGD"], maxk: 4,
   body: `<p>When British rule ended in 1947, British India was split into two states: India and Pakistan, which had two parts more than 1,500 km apart. The new boundary, drawn under Cyril Radcliffe in a few weeks, split Punjab and Bengal. Millions of people were displaced and many were killed in the violence that followed.</p>
   <p>East Pakistan became independent <b>Bangladesh</b> in 1971. Kashmir has been disputed between India and Pakistan since 1947, with China also controlling part of the wider region.</p>` },
 { t: "The Korean Peninsula", keys: ["PRK","KOR"], maxk: 8,
   body: `<p>In 1945 the United States and the Soviet Union divided Korea at the <b>38th parallel</b> (38° N) to accept Japan's surrender. Two states formed in 1948. The Korean War (1950–1953) ended in an armistice, not a peace treaty; the Demilitarised Zone runs close to the old line.</p>
   <p>Turn on "Equator, tropics &amp; grid" in Layers and zoom in: the border wanders around the 38th parallel rather than following it exactly.</p>` },
 { t: "The breakup of Yugoslavia (1991–2008)", keys: ["SVN","HRV","BIH","SRB","MNE","MKD","UNK"], maxk: 10,
   body: `<p>Yugoslavia was a federation of six republics. Slovenia, Croatia and North Macedonia declared independence in 1991 and Bosnia and Herzegovina in 1992, followed by wars, especially in Croatia and Bosnia. Serbia and Montenegro stayed together until Montenegro became independent in 2006. Kosovo declared independence from Serbia in 2008, which Serbia does not recognise.</p>
   <p>Most of the new international borders were the old internal republic boundaries, a pattern also seen in the Soviet Union.</p>` },
 { t: "After the Soviet Union (1991)", keys: ["RUS","UKR","BLR","MDA","EST","LVA","LTU","GEO","ARM","AZE","KAZ","UZB","TKM","KGZ","TJK"], maxk: 3,
   body: `<p>When the Soviet Union dissolved in 1991, its 15 republics became independent states along their internal boundaries. Lines drawn for administration became international borders overnight, leaving Russian-speaking minorities outside Russia and ethnic enclaves across Central Asia and the Caucasus.</p>
   <p>Several remain contested. Russia annexed Crimea from Ukraine in 2014, which most countries do not recognise, and launched a full-scale invasion of Ukraine in 2022. Azerbaijan retook Nagorno-Karabakh, whose ethnic Armenian population then left, in 2023.</p>` },
 { t: "Europe: mountains, rivers and treaties", keys: ["FRA","ESP","DEU","CHE","ITA","AUT","POL"], maxk: 6,
   body: `<p>Some European borders follow physical features: the Pyrenees between Spain and France, the Alps around Switzerland and Italy, stretches of the Rhine between France and Germany. Most, though, were set by centuries of wars and treaties, from the Peace of Westphalia (1648) to the settlements after the two world wars.</p>
   <p>Poland shows how far borders can move: after 1945 the whole country shifted west, losing land in the east to the Soviet Union and gaining German territory in the west.</p>` }
];
function bordersMode() {
  resetView();
  setPanel(`<div class="eyebrow">Stage 6 · Historical geography</div><h2>Why borders look the way they do</h2>
  <p>A border can follow a river, a mountain ridge, a coastline, a line of latitude, an old empire's province, a vote, or the place where an army stopped. Most borders mix several of these. Each case below changes the map.</p>
  <div class="note"><span class="kind">Natural or artificial?</span>People often call rivers and mountains "natural" borders and straight lines "artificial". In practice every border is a human decision; physical features only make some lines easier to agree and defend.</div>
  ${CASES.map(caseCard).join("")}
  <p class="src"><span class="kind">Facts</span>Dates and agreements are standard historical record. <span class="kind">Interpretation</span>Lessons drawn from each case are explanations, not the only possible reading.</p>`); }
ACT.case = el => { const c = CASES[+el.dataset.i]; highlight(c.keys, {maxk: c.maxk}); };

/* ---------- Chokepoints and landlocked states ---------- */
const CHOKE = [
 { n: "Strait of Hormuz", c: [56.4, 26.5], keys: ["IRN","OMN","ARE","SAU","IRQ","KWT","QAT"], t: "Between Iran and Oman, the only sea exit from the Persian Gulf. Oil and gas from Saudi Arabia, Iraq, Kuwait, the UAE, Qatar and Iran pass through it; the US Energy Information Administration estimates about a fifth of the world's oil consumption." },
 { n: "Bab el-Mandeb", c: [43.4, 12.6], keys: ["YEM","DJI","ERI"], t: "The narrow southern gate of the Red Sea, between Yemen and Djibouti/Eritrea. Ships using the Suez Canal must pass it. Attacks on shipping from late 2023 led many lines to sail around the Cape of Good Hope instead, adding days to Asia–Europe voyages." },
 { n: "Suez Canal", c: [32.35, 30.6], keys: ["EGY"], t: "Opened in 1869 across Egypt, it joins the Mediterranean and Red Seas and spares Europe–Asia ships the long trip around Africa. When the container ship Ever Given blocked it for six days in 2021, global supply chains felt it." },
 { n: "Strait of Gibraltar", c: [-5.6, 35.95], keys: ["ESP","MAR"], t: "About 14 km wide at its narrowest, between Spain and Morocco: the Mediterranean's only natural link to the Atlantic, and one of the main crossings between Africa and Europe." },
 { n: "Turkish Straits", c: [29.05, 41.1], keys: ["TUR"], t: "The Bosporus and the Dardanelles connect the Black Sea to the Mediterranean through Türkiye. The 1936 Montreux Convention governs passage, including limits on warships, which matters for Russia, Ukraine and NATO." },
 { n: "Strait of Malacca", c: [100.6, 3.2], keys: ["MYS","IDN","SGP"], t: "Between Malaysia and Indonesia's Sumatra, ending at Singapore. The shortest sea route between the Indian Ocean and the Pacific; much of East Asia's imported oil passes this way." },
 { n: "South China Sea", c: [114, 12], keys: ["CHN","VNM","PHL","MYS","BRN","TWN","IDN"], t: "Major shipping lanes and overlapping claims by China, Vietnam, the Philippines, Malaysia, Brunei and Taiwan. In 2016 an arbitral tribunal ruled that China's broad 'nine-dash line' claims had no basis in the law of the sea; China rejects the ruling." },
 { n: "Panama Canal", c: [-79.7, 9.1], keys: ["PAN"], t: "Opened in 1914, linking the Atlantic and Pacific without the trip around South America. It runs on fresh water from Gatun Lake, so a 2023–2024 drought forced limits on daily crossings." },
 { n: "Cape of Good Hope", c: [18.47, -34.36], keys: ["ZAF"], t: "Not a strait but the alternative route: when Suez or the Red Sea is closed or unsafe, Asia–Europe shipping goes around southern Africa." },
 { n: "Gulf of Guinea", c: [3.5, 2.5], keys: ["NGA","BEN","TGO","GHA","CIV","CMR","GNQ","GAB","STP"], t: "Nigeria's sea. Oil and gas exports, fishing and ports from Abidjan to Douala. Piracy and kidnapping at sea rose sharply in the late 2010s and have fallen since 2020 with more naval patrols, including Nigeria's Deep Blue project." },
 { n: "Northern Sea Route", c: [100, 76.5], keys: ["RUS"], t: "Along Russia's Arctic coast. Melting sea ice makes summer passage between Europe and East Asia easier, cutting distance compared with Suez, but the season is short and ice-class ships are needed." }
];
const CORRIDORS = [
  ["Niger", "Cotonou (Benin) and Lagos (Nigeria)"], ["Burkina Faso", "Abidjan, Tema, Lomé and Cotonou"], ["Mali", "Dakar and Abidjan"],
  ["Ethiopia", "Djibouti, which handles most of its trade, since Eritrea's independence in 1993 left Ethiopia without a coast"],
  ["Uganda, Rwanda, Burundi, South Sudan", "Mombasa (Kenya) via the Northern Corridor, and Dar es Salaam (Tanzania)"],
  ["Zambia", "Dar es Salaam via the TAZARA railway, and Durban and Walvis Bay by road"], ["Chad and the Central African Republic", "Douala (Cameroon)"]];
function geoMode() {
  resetView(); $("#L-seas").checked = true; applyLayers();
  const land = Object.entries(D.facts).filter(([k, f]) => f.land && (f.un || f.obs));
  const afr = land.filter(([k, f]) => f.reg === "Africa");
  setPanel(`<div class="eyebrow">Stage 7 · Geopolitics</div><h2>Chokepoints and corridors</h2>
  <p>Most trade moves by sea, and ships squeeze through a few narrow passages. Where geography forces traffic into a narrow gap, a country, a storm or a blockage there can raise costs worldwide.</p>
  <div class="chips">${CHOKE.map((c, i) => `<button class="chip" data-act="choke" data-i="${i}">${esc(c.n)}</button>`).join("")}</div>
  <div id="chokeinfo" class="note">Tap a chokepoint to fly to it.</div>
  <h3>Landlocked countries</h3>
  <p>There are <b>${land.length}</b> landlocked countries in the world, and <b>${afr.length}</b> of them are in Africa. Without a coast, every import and export must cross at least one neighbour, so transit costs, border delays and good relations with coastal neighbours become central to the economy.</p>
  <div class="btnrow"><button class="btn primary" data-act="landlocked">Show all landlocked countries</button><button class="btn" data-act="landlockedAfrica">Africa only</button></div>
  <table class="t"><thead><tr><th>Landlocked</th><th>Main sea routes</th></tr></thead><tbody>${CORRIDORS.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join("")}</tbody></table>
  <h3>Regional blocs</h3>
  <div class="btnrow"><button class="btn" data-act="bloc2" data-b="SADC">SADC (Southern Africa)</button><button class="btn" data-act="bloc2" data-b="EAC">East African Community</button><button class="btn" data-act="bloc2" data-b="ECOWAS">ECOWAS</button></div>
  <p id="blocinfo" class="src">Membership as of 2025. Blocs admit, suspend and lose members, so check before relying on these lists.</p>
  <p class="src"><span class="kind">Facts</span>Locations, dates and memberships. <span class="kind">Interpretation</span>Statements about strategic importance summarise widely held analysis. The oil share for Hormuz is a US EIA estimate.</p>`); }
ACT.choke = el => { const c = CHOKE[+el.dataset.i];
  highlight(c.keys, {fly: false, dim: false, color: "var(--nb)"}); setPins([{c: c.c}]); flyToPoint(c.c, c.n === "Northern Sea Route" || c.n === "South China Sea" ? 3 : 6);
  $("#chokeinfo").innerHTML = `<b>${esc(c.n)}</b> · <span style="font-family:var(--mono);font-size:12.5px">${latStr(c.c[1])}, ${lonStr(c.c[0])}</span><br>${esc(c.t)}`; };
ACT.landlocked = () => { highlight(Object.values(D.facts).filter(f => f.land && (f.un || f.obs)).map(f => f.c3), {fly: false, dim: false, color: "var(--sel)"}); setPins([]); resetView(); legend([["--sel", "Landlocked"]]); };
ACT.landlockedAfrica = () => { highlight(Object.values(D.facts).filter(f => f.land && f.un && f.reg === "Africa").map(f => f.c3), {color: "var(--sel)", maxk: 4}); setPins([]); legend([["--sel", "Landlocked"]]); };
const BLOCS = {
  SADC: [["AGO","BWA","COM","COD","SWZ","LSO","MDG","MWI","MUS","MOZ","NAM","SYC","ZAF","TZA","ZMB","ZWE"], "The Southern African Development Community: 16 members, including island states such as Madagascar, Mauritius, Comoros and Seychelles."],
  EAC: [["BDI","COD","KEN","RWA","SSD","TZA","UGA","SOM"], "The East African Community: 8 members. South Sudan joined in 2016, the DR Congo in 2022 and Somalia in 2024. DR Congo and Tanzania are also in SADC: overlapping membership is common in Africa."],
  ECOWAS: [ECOWAS, "ECOWAS: 12 members after Burkina Faso, Mali and Niger left in January 2025."] };
ACT.bloc2 = el => { const [list, txt] = BLOCS[el.dataset.b]; highlight(list, {maxk: 4}); legend([["--accent", el.dataset.b]]); $("#blocinfo").textContent = txt + " Membership as of 2025; check before relying on it."; };

/* ---------- Tools: distance and true size ---------- */
function toolsMode() {
  resetView();
  setPanel(`<div class="eyebrow">Tools</div><h2>Measure and compare</h2>
  <h3>Distance between two places</h3>
  <p>Tap two points on the map. The atlas draws the shortest route over the globe and measures it.</p>
  <div class="btnrow"><button class="btn primary" data-act="distStart">Start measuring</button></div>
  <h3>True size</h3>
  <p>Pick a country, then tap anywhere on the map to move a copy of it there. The copy keeps its real size on the globe, so you see how the projection stretches it. Try it on Mercator: drag Greenland to the Equator, or Nigeria to Europe.</p>
  <div class="btnrow">${["NGA","GRL","COD","RUS","GBR","IND","AUS","USA"].map(c => `<button class="chip" data-act="trueSize" data-c="${c}">${esc(nameOf(k3(c)))}</button>`).join("")}</div>
  <div class="btnrow"><button class="btn" data-act="toMercator">Switch to Mercator</button><button class="btn" data-act="toEqual">Switch to Equal Earth</button></div>
  <div id="toolout"></div>`); }
ACT.toMercator = () => { const g = S.ghost; setProjection("mercator"); if (g) placeGhost(g.k, g.t); };
ACT.toEqual = () => { const g = S.ghost; setProjection("equal"); if (g) placeGhost(g.k, g.t); };
ACT.distStart = () => { let pts = []; setRoutes([]); setPins([]); svg.classed("picking", true); banner("Tap the first place");
  S.tool = { onMap(c) { pts.push(c); setPins(pts.map(p => ({c: p})));
    if (pts.length === 1) banner("Now tap the second place");
    else { const [a, b] = pts, d = km(a, b), ab = bearing(a, b), la = km(LAGOS, [7.49, 9.06]);
      setRoutes([{geo: {type: "LineString", coordinates: [a, b]}}]); banner(null); svg.classed("picking", false); S.tool = null;
      $("#toolout").innerHTML = `<dl class="facts"><dt>From</dt><dd style="font-family:var(--mono);font-size:13px">${latStr(a[1])}, ${lonStr(a[0])}</dd><dt>To</dt><dd style="font-family:var(--mono);font-size:13px">${latStr(b[1])}, ${lonStr(b[0])}</dd>
      <dt>Distance</dt><dd><b>${fmt(d)} km</b> along the surface</dd><dt>Set off heading</dt><dd>${COMPASS_W[compass(ab)]} (${Math.round(ab)}°)</dd>
      <dt>Compared</dt><dd>${(d / la).toFixed(1)} × Lagos to Abuja (${fmt(la)} km)</dd><dt>By air</dt><dd>roughly ${(d / 800).toFixed(1)} hours at 800 km/h, before taxiing, detours and stops</dd></dl>
      <p class="src">Great-circle distance on a sphere of radius 6,371 km; real routes are longer.</p><div class="btnrow"><button class="btn" data-act="distStart">Measure again</button></div>`; } } }; };
function rotateFeature(f, from, to) {
  const r1 = d3.geoRotation([-from[0], -from[1]]), r2 = d3.geoRotation([-to[0], -to[1]]);
  const mv = p => r2.invert(r1(p));
  const walk = c => typeof c[0] === "number" ? mv(c) : c.map(walk);
  return {type: "Feature", geometry: {type: f.geometry.type, coordinates: walk(f.geometry.coordinates)}}; }
function placeGhost(key, t) {
  const f = featByKey.get(key); if (!f) return; const c = labelPoint(f);
  S.ghost = {k: key, t};
  G.ghost.selectAll("path").data([rotateFeature(f, c, t)]).join("path").attr("class", "ghostshape");
  render(); }
ACT.trueSize = el => { const key = k3(el.dataset.c); S.sel = key; paint(); svg.classed("picking", true);
  banner(`Tap the map to move ${nameOf(key)}`);
  placeGhost(key, labelPoint(featByKey.get(key)));
  S.tool = { onMap(c) { placeGhost(key, c); banner(`${nameOf(key)} moved to ${latStr(c[1])}. Tap again to move it, or pick another country.`); } };
  $("#toolout").innerHTML = `<p><b>${esc(nameOf(key))}</b>: ${fmt(byKey.get(key).a)} km². The orange copy keeps this true size wherever you put it.</p>`; };

/* ---------- More games ---------- */
const gamePool = (scope, minA = 0) => [...featByKey.keys()].filter(k => { const f = byKey.get(k); return f && (f.un || f.obs) && f.a >= minA && (scope !== "Africa" || f.reg === "Africa"); });
function pickDistractors(k, n, pool, same) { const f = byKey.get(k);
  const close = shuffle(pool.filter(x => x !== k && same(byKey.get(x), f))), rest = shuffle(pool.filter(x => x !== k && !close.includes(x)));
  return [...close, ...rest].slice(0, n); }
function shapeSVG(k) { const f = featByKey.get(k), c = labelPoint(f);
  const p = d3.geoOrthographic().rotate([-c[0], -c[1]]).fitExtent([[10, 10], [210, 150]], f);
  return `<svg class="shape" viewBox="0 0 220 160" role="img" aria-label="Country outline"><path d="${d3.geoPath(p)(f)}"/></svg>`; }
const GAMES = {
  capitals: { name: "Capitals", desc: "Match countries and capitals.", gen(scope) {
    const pool = gamePool(scope).filter(k => byKey.get(k).cap && byKey.get(k).cap.length), k = shuffle(pool)[0], f = byKey.get(k);
    const ds = pickDistractors(k, 3, pool, (a, b) => a.sub === b.sub);
    if (Math.random() < .5) { const opts = shuffle([k, ...ds]);
      return {q: `What is the capital of <b>${esc(f.n)}</b>?`, opts: opts.map(x => byKey.get(x).cap[0]), a: opts.indexOf(k), why: `${f.cap[0]} is the capital of ${f.n}.`, show: k}; }
    const opts = shuffle([k, ...ds]);
    return {q: `<b>${esc(f.cap[0])}</b> is the capital of…`, opts: opts.map(nameOf), a: opts.indexOf(k), why: `${f.cap[0]} is the capital of ${f.n}.`, show: k}; } },
  flags: { name: "Flags", desc: "Name the country from its flag.", gen(scope) {
    const pool = gamePool(scope).filter(k => byKey.get(k).flag), k = shuffle(pool)[0], f = byKey.get(k), opts = shuffle([k, ...pickDistractors(k, 3, pool, (a, b) => a.sub === b.sub)]);
    return {q: `Whose flag is this?<div class="bigflag">${f.flag}</div>`, opts: opts.map(nameOf), a: opts.indexOf(k), why: `That is the flag of ${f.n}.`, show: k}; } },
  shapes: { name: "Shapes", desc: "Recognise a country from its outline alone.", gen(scope) {
    const pool = gamePool(scope, 20000).filter(k => !["RUS","USA","FJI","KIR","CAN","NZL"].includes(byKey.get(k).c3)), k = shuffle(pool)[0], opts = shuffle([k, ...pickDistractors(k, 3, pool, (a, b) => a.sub === b.sub)]);
    return {q: `Which country has this shape?${shapeSVG(k)}`, opts: opts.map(nameOf), a: opts.indexOf(k), why: `That is ${nameOf(k)}, in ${byKey.get(k).sub}.`, show: k}; } },
  bigger: { name: "Bigger or smaller", desc: "Which has more land? Beware of Mercator.", gen(scope) {
    const pool = gamePool(scope, 30000); let a, b, r;
    do { [a, b] = shuffle(pool); r = byKey.get(a).a / byKey.get(b).a; } while (r < 1 / 3 || r > 3 || Math.abs(r - 1) < .08);
    const fa = byKey.get(a), fb = byKey.get(b), big = fa.a > fb.a ? 0 : 1;
    return {q: `Which country is larger by area?`, opts: [fa.n, fb.n], a: big, why: `${fa.n}: ${fmt(fa.a)} km². ${fb.n}: ${fmt(fb.a)} km². The larger is about ${(Math.max(r, 1 / r)).toFixed(1)} times the size of the other.`, show: big ? b : a}; } },
  north: { name: "Further north", desc: "Compare capitals by latitude.", gen(scope) {
    const caps = D.cities.filter(c => c.cap && byC3.has(c.c3) && (scope !== "Africa" || byKey.get(byC3.get(c.c3)).reg === "Africa"));
    let a, b; do { [a, b] = shuffle(caps); } while (Math.abs(a.y - b.y) < 1.5 || Math.abs(a.y - b.y) > 25);
    const n = a.y > b.y ? 0 : 1, lab = c => `${c.n} (${nameOf(byC3.get(c.c3))})`;
    return {q: `Which capital is further <b>north</b>?`, opts: [lab(a), lab(b)], a: n, why: `${a.n} is at ${latStr(a.y)}; ${b.n} is at ${latStr(b.y)}.`, pins: [[a.x, a.y], [b.x, b.y]]}; } }
};
function mcGame(id, scope) {
  const g = GAMES[id], N = 10; let i = 0, score = 0, streak = 0, best = 0;
  if (scope === "Africa") flyToKeys(Object.keys(D.facts).filter(k => D.facts[k].reg === "Africa" && D.facts[k].un), {pad: .95, maxk: 4}); else resetView();
  const ask = () => { const r = g.gen(scope); S.sel = null; paint(); setPins([]);
    setPanel(`<div class="eyebrow">${esc(g.name)} · ${scope}</div><div class="progress"><i style="width:${i / N * 100}%"></i></div>
      <div class="q">${r.q}</div><div class="opts">${r.opts.map((o, j) => `<button data-j="${j}">${esc(o)}</button>`).join("")}</div><div id="why"></div>
      <p class="src">Score ${score} / ${i}${streak > 1 ? ` · streak ${streak}` : ""}</p>`);
    panel.querySelectorAll(".opts button").forEach(b => b.onclick = () => { if (panel.querySelector(".opts .right")) return;
      const ok = +b.dataset.j === r.a; if (ok) { score++; streak++; best = Math.max(best, streak); } else streak = 0;
      b.classList.add(ok ? "right" : "wrong"); panel.querySelector(`.opts [data-j="${r.a}"]`).classList.add("right");
      if (r.show) { S.sel = r.show; paint(); flyTo(featByKey.get(r.show), {pad: .5, maxk: 8}); }
      if (r.pins) { setPins(r.pins.map(c => ({c}))); flyTo({type: "MultiPoint", coordinates: r.pins}, {pad: .6, maxk: 6}); }
      $("#why").innerHTML = `<p>${ok ? "<b>Right.</b>" : "<b>Not quite.</b>"} ${esc(r.why)}</p><button class="btn primary" id="next">${i + 1 < N ? "Next" : "See score"}</button>`;
      $("#next").onclick = () => { i++; if (i < N) ask(); else done(); }; }); };
  const done = () => { const key = id + ":" + scope; saved.best[key] = Math.max(saved.best[key] || 0, score); store.set(saved); S.sel = null; paint(); setPins([]);
    setPanel(`<div class="eyebrow">${esc(g.name)} · result</div><p class="score">${score} / ${N}</p><p>Longest streak: ${best}. Best ever: ${saved.best[key]} / ${N}.</p>
      <div class="btnrow"><button class="btn primary" data-act="game" data-g="${id}" data-scope="${scope}">Play again</button><button class="btn" data-mode-go="quiz">All games</button></div>`); };
  ask(); }
ACT.game = el => mcGame(el.dataset.g, el.dataset.scope);

/* Nigeria states: tap the state on the map */
ACT.qstates = () => {
  const st = topojson.feature(D.ng.states, Object.values(D.ng.states.objects)[0]).features;
  const nbSet = new Set(byKey.get("566").b.map(c => byC3.get(c)));
  G.countries.selectAll("path").classed("dim", d => d.key !== "566" && !nbSet.has(d.key));
  G.states.selectAll("path").data(st).join("path").attr("class", "state").style("fill", "var(--land)")
    .on("click", (ev, d) => { ev.stopPropagation(); if (S.quiz && S.quiz.onState) S.quiz.onState(d.properties.name); });
  render(); flyTo(featByKey.get("566"), {pad: .9, maxk: 14}); svg.classed("picking", true); $("#L-labels").checked = false; applyLayers();
  const qs = shuffle(st.map(f => f.properties.name)).slice(0, 10); let i = 0, score = 0, locked = false;
  const ask = () => { locked = false; G.states.selectAll("path").style("fill", "var(--land)"); banner(`Tap: ${stName(qs[i])}`);
    setPanel(`<div class="eyebrow">Nigeria's states</div><div class="progress"><i style="width:${i * 10}%"></i></div><p class="q">Where is <b>${esc(stName(qs[i]))}</b>?</p><p>Tap the state on the map. Names are hidden.</p><p class="score">${score} / ${i}</p><p><button class="btn" data-act="qstop">Stop</button></p>`); };
  S.quiz = { onClick() {}, onSea() {},
    onState(s) { if (locked) return; locked = true; const ok = s === qs[i]; if (ok) score++;
      G.states.selectAll("path").style("fill", d => d.properties.name === qs[i] ? "var(--hit)" : (!ok && d.properties.name === s) ? "var(--miss)" : "var(--land)");
      banner(ok ? `Correct: ${stName(qs[i])} (${zoneOf(qs[i])})` : `That was ${stName(s)}. ${stName(qs[i])} is in green, in the ${zoneOf(qs[i])}.`);
      i++; setTimeout(() => { if (i < 10) ask(); else { S.quiz.stop(); S.quiz = null; saved.best.states = Math.max(saved.best.states || 0, score); store.set(saved);
        setPanel(`<div class="eyebrow">Result</div><p class="score">${score} / 10</p><div class="btnrow"><button class="btn primary" data-act="qstates">Play again</button><button class="btn" data-mode-go="nigeria">Study the zones</button><button class="btn" data-mode-go="quiz">All games</button></div>`); } }, ok ? 900 : 2200); },
    stop() { svg.classed("picking", false); banner(null); $("#L-labels").checked = true; applyLayers(); G.states.selectAll("*").remove(); } };
  ask(); };
