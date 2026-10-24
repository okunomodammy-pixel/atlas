/* ---------- batch 10: UN population data, "How Nigeria was made", Nigeria in the world, IR concepts quiz ---------- */
/* Guides: Falola & Heaton, A History of Nigeria (2008); Soyinka, The Open Sore of a Continent (1996); UN World Population Prospects 2024. Text is original. */

/* ===== UN World Population Prospects 2024 ===== */
function applyWPP() { if (!D.wpp) return;
  Object.values(D.facts).forEach(f => { const w = D.wpp[f.c3 === "UNK" ? "XKX" : f.c3]; if (w && w.p2026) { f.pop = w.p2026; f.popY = 2026; f.w = w; } }); }
const WW = () => D.wpp && D.wpp.WORLD;
function demographyHTML(f) { const w = f.w, wd = WW(); if (!w) return "";
  const pts = [[1960, w.p1960], [2000, w.p2000], [2026, w.p2026], [2050, w.p2050], [2100, w.p2100]].filter(p => p[1]), mx = Math.max(...pts.map(p => p[1]));
  const vs = (v, wv, unit, d = 1) => v == null ? "—" : `${v.toFixed(d)}${unit} <span class="src">(world ${wv.toFixed(d)}${unit})</span>`;
  const ch = w.p2050 && w.p2026 ? (w.p2050 / w.p2026 - 1) * 100 : null;
  return `<h4>People, today and tomorrow</h4>
  <div>${pts.map(([y, p]) => `<div class="bar"><span>${y}${y > 2026 ? " (proj.)" : ""}</span><span class="track"><i style="width:${(p / mx * 100).toFixed(1)}%;${y > 2026 ? "opacity:.5" : ""}"></i></span><span class="n">${shortNum(p).replace(" million", "m").replace(" billion", "bn")}</span></div>`).join("")}</div>
  <dl class="facts">
    <dt>Median age</dt><dd>${vs(w.ma, wd.ma, " years")}</dd>
    <dt>Children per woman</dt><dd>${vs(w.tfr, wd.tfr, "", 2)}</dd>
    <dt>Life expectancy</dt><dd>${vs(w.le, wd.le, " years")}</dd>
    <dt>Growth per year</dt><dd>${vs(w.gr, wd.gr, "%", 2)}</dd>
    <dt>Infant deaths</dt><dd>${w.imr != null ? w.imr.toFixed(1) + " per 1,000 births" : "—"}</dd>
    <dt>Net migration</dt><dd>${w.nmr != null ? (w.nmr > 0 ? "+" : "") + w.nmr.toFixed(1) + " per 1,000 people a year" : "—"}</dd>
  </dl>
  ${ch != null ? `<p>${esc(f.n)}'s population is projected to ${ch >= 0 ? "grow by " + Math.round(ch) + "%" : "shrink by " + Math.round(-ch) + "%"} between 2026 and 2050${w.ma50 ? `, and its median age to reach ${w.ma50.toFixed(0)}` : ""}.</p>` : ""}
  <p class="src">UN World Population Prospects 2024, medium variant: estimates to 2023, projections after. Projections assume trends continue; wars, migration and policy can change them.</p>`; }

/* ===== Lesson: how Nigeria was made ===== */
const R_NORTH = ["Sokoto","Kebbi","Zamfara","Katsina","Kano","Jigawa","Kaduna","Bauchi","Gombe","Borno","Yobe","Adamawa","Taraba","Plateau","Nassarawa","Benue","Kogi","Kwara","Niger","Federal Capital Territory"];
const R_WEST = ["Oyo","Osun","Ogun","Ondo","Ekiti"], R_MIDW = ["Edo","Delta"], R_EAST = ["Anambra","Enugu","Ebonyi","Imo","Abia","Rivers","Bayelsa","Cross River","Akwa Ibom"];
const NG_MAPS = {
  1914: { t: "1914: two protectorates joined", units: {"Northern Protectorate": R_NORTH, "Southern Protectorate (with Lagos Colony)": [...R_WEST, ...R_MIDW, ...R_EAST, "Lagos"]} },
  1954: { t: "1954: three regions in a federation", units: {"Northern Region": R_NORTH, "Western Region": [...R_WEST, ...R_MIDW], "Eastern Region": R_EAST, "Lagos (federal territory)": ["Lagos"]} },
  1963: { t: "1963: four regions", units: {"Northern Region": R_NORTH, "Western Region": R_WEST, "Mid-Western Region": R_MIDW, "Eastern Region": R_EAST, "Lagos (federal territory)": ["Lagos"]} },
  1967: { t: "1967: twelve states (and the Biafra secession)", units: {"North-Western": ["Sokoto","Kebbi","Zamfara","Niger","Federal Capital Territory"], "North-Central": ["Kaduna","Katsina"], "Kano": ["Kano","Jigawa"], "North-Eastern": ["Borno","Yobe","Bauchi","Gombe","Adamawa","Taraba"],
    "Benue-Plateau": ["Benue","Plateau","Nassarawa"], "Kwara": ["Kwara","Kogi"], "Western": R_WEST, "Lagos": ["Lagos"], "Mid-Western": R_MIDW, "East-Central": ["Anambra","Enugu","Ebonyi","Imo","Abia"], "South-Eastern": ["Cross River","Akwa Ibom"], "Rivers": ["Rivers","Bayelsa"]} },
  1976: { t: "1976: nineteen states and a new capital territory", units: {"Sokoto": ["Sokoto","Kebbi","Zamfara"], "Niger": ["Niger"], "Kaduna": ["Kaduna","Katsina"], "Kano": ["Kano","Jigawa"], "Bauchi": ["Bauchi","Gombe"], "Borno": ["Borno","Yobe"], "Gongola": ["Adamawa","Taraba"],
    "Plateau": ["Plateau","Nassarawa"], "Benue": ["Benue"], "Kwara": ["Kwara","Kogi"], "Oyo": ["Oyo","Osun"], "Ogun": ["Ogun"], "Ondo": ["Ondo","Ekiti"], "Lagos": ["Lagos"], "Bendel": R_MIDW, "Anambra": ["Anambra","Enugu","Ebonyi"], "Imo": ["Imo","Abia"], "Cross River": ["Cross River","Akwa Ibom"], "Rivers": ["Rivers","Bayelsa"], "Federal Capital Territory": ["Federal Capital Territory"]} },
  1996: { t: "Since 1996: 36 states and the FCT, by geopolitical zone", zones: true }
};
const NG_COUNT = [[1946, 3, "regions"], [1963, 4, "regions"], [1967, 12, "states"], [1976, 19, "states"], [1987, 21, "states"], [1991, 30, "states"], [1996, 36, "states"]];
function ngStates() { return topojson.feature(D.ng.states, Object.values(D.ng.states.objects)[0]).features; }
function ngMap(year) {
  const spec = NG_MAPS[year], st = ngStates(), ng = "566", nbSet = new Set(byKey.get(ng).b.map(c => byC3.get(c)));
  S.sel = null; S.color = k => k === ng ? "transparent" : null; G.countries.selectAll("path").classed("dim", d => d.key !== ng && !nbSet.has(d.key)); paint();
  let unitOf, cols, names;
  if (spec.zones) { unitOf = s => zoneOf(s); names = Object.keys(ZONES); cols = Object.fromEntries(names.map(z => [z, `var(${ZCOL[z]})`])); }
  else { names = Object.keys(spec.units); const pal = names.length <= 5 ? ["var(--r-n)", "var(--r-w)", "var(--r-e)", "var(--c-oc)", "var(--sel)"] : [...d3.schemeTableau10, ...d3.schemeSet3];
    cols = Object.fromEntries(names.map((n, i) => [n, pal[i % pal.length]])); unitOf = s => names.find(n => spec.units[n].includes(s)); }
  G.states.selectAll("path").data(st).join("path").attr("class", "state").style("fill", d => cols[unitOf(d.properties.name)] || "var(--land)")
    .style("stroke-opacity", spec.zones ? null : .25).on("click", (ev, d) => { ev.stopPropagation(); toast(`${stName(d.properties.name)} · in ${year === 1996 ? "the " + zoneOf(d.properties.name) + " zone" : unitOf(d.properties.name) + " (" + year + ")"}`); });
  const geoms = Object.values(D.ng.states.objects)[0].geometries;
  const labs = spec.zones ? st.map(f => ({c: d3.geoCentroid(f), n: stName(f.properties.name).replace("FCT (Abuja)", "FCT")}))
    : names.map(n => ({c: d3.geoCentroid(topojson.merge(D.ng.states, geoms.filter(g => spec.units[n].includes(g.properties.name)))), n: n.replace(" (with Lagos Colony)", "").replace(" (federal territory)", "")}));
  G.stateslabels.selectAll("text").data(labs).join("text").text(d => d.n);
  $("#L-labels").checked = false; applyLayers(); render();
  legend(names.map(n => [cols[n].startsWith("var(") ? cols[n].slice(4, -1) : null, n]).filter(x => x[0]).slice(0, 8));
  if (!spec.zones && names.length > 5) legend(null);
  flyTo(featByKey.get(ng), {pad: .92, maxk: 14});
  document.querySelectorAll("#ngyears .chip").forEach(c => c.classList.toggle("on", +c.dataset.y === year));
  const cap = $("#ngmapcap"); if (cap) cap.textContent = spec.t + (year === 1914 || year === 1954 ? ". Boundaries are drawn with today's state lines, so they are approximate." : year === 1967 || year === 1976 ? ". Shown with today's state lines; a few later states (Kogi, Ebonyi, the FCT) took land from more than one older unit, so their colour is approximate." : ".");
}
ACT.ngmap = el => ngMap(+el.dataset.y);
const NGSTORY = [
 { t: "Before Nigeria", when: "about 9000 BCE to 1500 CE", map: null,
   body: `<p>People have lived here for a very long time: a human skeleton from the Iwo Eleru rock shelter in Ondo State is about 13,000 years old. The <b>Nok</b> culture of central Nigeria worked iron and made its famous terracotta heads; Falola and Heaton give roughly 900 BCE to 200 CE, and some newer studies push the start earlier. At <b>Igbo-Ukwu</b>, bronzes cast around the 9th–10th century CE show skill and long-distance trade (glass beads from far away).</p>
   <p>From about 1000 to 1500 CE, centralised states rose: <b>Kanem-Borno</b> near Lake Chad, the <b>Hausa city-states</b> such as Kano, Katsina and Zazzau (Zaria), <b>Ife</b>, the sacred Yoruba city famous for its bronze and terracotta heads, and the <b>Kingdom of Benin</b>. Islam reached the northern courts between about 1100 and 1400 through Saharan traders.</p>
   <p><b>Not every society had a king.</b> Many Igbo, Tiv and other communities governed themselves through councils of elders, age grades, title societies and oracles. Historians call these "decentralised" or "stateless" societies: different, not less developed.</p>`,
   pins: [pin("Iwo Eleru", [5.12, 7.43]), pin("Nok", [8.0, 9.5]), pin("Igbo-Ukwu", [7.02, 6.02]), pin("Ife", [4.56, 7.47]), pin("Benin City", [5.62, 6.34]), pin("Kano", [8.52, 12.0]), pin("Katsina", [7.6, 13.0]), pin("Zaria", [7.71, 11.06]), pin("Kanem-Borno", [13.3, 12.9])] },
 { t: "Oyo, Benin and the Atlantic trade", when: "about 1500 to 1800",
   body: `<p>Portuguese ships reached the Bight of Benin in the late 1400s. Over the next three centuries the Atlantic trade in enslaved people grew to dominate the coast's dealings with Europe. Ports such as <b>Badagry</b>, <b>Lagos</b>, <b>Bonny</b> and <b>Old Calabar</b> became busy slaving and trading towns; inland, the <b>Aro</b> network, using the Arochukwu oracle, moved captives and goods across the Igbo hinterland.</p>
   <p>The <b>Oyo empire</b>, built on cavalry in the savanna north of the forest, became the strongest Yoruba state and grew rich partly from the trade through the coast. <b>Benin</b> traded with the Portuguese from the 1480s and controlled much of the trade to its west for a time.</p>
   <p><span class="kind">Link</span>The Bight of Benin and the Bight of Biafra were among the largest sources of the Atlantic slave trade (see The human story on the map, stop 11).</p>`,
   pins: [pin("Oyo-Ile", [4.2, 8.95]), pin("Benin City", [5.62, 6.34]), pin("Badagry", [2.89, 6.42]), pin("Lagos", [3.39, 6.45]), pin("Bonny", [7.15, 4.45]), pin("Old Calabar", [8.32, 4.95]), pin("Arochukwu", [7.91, 5.39])] },
 { t: "Jihad, wars and palm oil", when: "1804 to 1880s",
   body: `<p>In <b>1804</b> the scholar Usman dan Fodio led a jihad against the Hausa kings. It created the <b>Sokoto Caliphate</b>, one of the largest states in 19th-century Africa, ruled through emirates such as Kano, Zaria and Ilorin, and it spread Islam beyond the courts to ordinary people.</p>
   <p>In the south-west, the <b>Oyo empire collapsed by about 1833</b>, partly under pressure from Ilorin and the caliphate. Sixty years of Yoruba wars followed; new cities such as <b>Ibadan</b> and <b>Abeokuta</b> rose from the turmoil.</p>
   <p>Britain abolished its slave trade in <b>1807</b>. The trade from Nigerian ports went on for decades, but "legitimate commerce" grew, above all <b>palm oil</b> for soap and machine grease in industrial Europe. Delta traders such as <b>Jaja of Opobo</b> became rich and powerful. Christian missions arrived (Abeokuta, 1846), creating a Western-educated elite in the south.</p>`,
   pins: [pin("Sokoto", [5.24, 13.06]), pin("Ilorin", [4.55, 8.5]), pin("Ibadan", [3.9, 7.38]), pin("Abeokuta", [3.35, 7.15]), pin("Opobo", [7.53, 4.51])] },
 { t: "British conquest", when: "1851 to 1903",
   body: `<p>Britain bombarded Lagos in 1851 and annexed it as a colony in <b>1861</b>. Further east it declared the <b>Oil Rivers Protectorate</b> (1885), and Jaja of Opobo, who resisted British control of trade, was exiled in 1887. The <b>Royal Niger Company</b> (chartered 1886) ran the Niger trade as a monopoly until 1900.</p>
   <p>Resistance was real and repeated. In 1897 a British force sacked <b>Benin City</b>, exiled the Oba and carried off thousands of the Benin Bronzes; some have been returned to Nigeria since 2022. The <b>Aro Expedition</b> (1901–02) broke the Aro network. In <b>1903</b> Frederick Lugard's forces took <b>Kano</b> and <b>Sokoto</b>, and the caliphate fell under British rule.</p>`,
   pins: [pin("Lagos", [3.39, 6.45]), pin("Opobo", [7.53, 4.51]), pin("Benin City", [5.62, 6.34]), pin("Lokoja", [6.74, 7.8]), pin("Arochukwu", [7.91, 5.39]), pin("Kano", [8.52, 12.0]), pin("Sokoto", [5.24, 13.06])] },
 { t: "1914: one colony from many peoples", when: "1914 to 1929", map: 1914,
   body: `<p>The name "Nigeria" was suggested in 1897 by the journalist Flora Shaw, later Lugard's wife. On <b>1 January 1914</b> Lugard joined the Northern and Southern Protectorates into one colony, mainly for administrative and financial convenience: the coastal south's customs revenue could pay for the poorer north.</p>
   <p>Britain governed through <b>indirect rule</b>: local rulers kept their posts if they obeyed British officers. It worked most smoothly in the emirates of the north. Where there were no kings, as in much of the south-east, Britain appointed "warrant chiefs", who had little legitimacy. Falola and Heaton stress that indirect rule changed what it claimed to preserve: some rulers gained powers they never had before, and all lost their sovereignty.</p>
   <p>In <b>1929</b> thousands of women in the south-east rose against warrant chiefs and feared taxes: the <b>Aba Women's War</b>. North and south were also run as almost separate administrations, with Christian mission schools spreading in the south far more than in the north, a gap in Western education whose effects lasted for generations.</p>` },
 { t: "Nationalism and the road to 1960", when: "1923 to 1960", map: 1954,
   body: `<p>Journalists such as Herbert Macaulay, unions, students and women's organisations (Funmilayo Ransome-Kuti's Abeokuta Women's Union) pushed back against colonial rule. Nnamdi Azikiwe's NCNC (1944), Obafemi Awolowo's Action Group (1951) and the Northern People's Congress led by Ahmadu Bello and Tafawa Balewa (1949) became the main parties, each strongest in one region.</p>
   <p>Constitutions in 1946 (Richards), 1951 (Macpherson) and 1954 (Lyttelton) built a <b>federation of three regions</b>. The Northern Region was larger than the other two combined, so it held more than half the seats in the federal parliament. Oil was found at <b>Oloibiri</b> in the Niger Delta in 1956. Nigeria became independent on <b>1 October 1960</b>.</p>
   <p><span class="kind">Interpretation</span>Many historians see the three-region design, each dominated by one large ethnic group and one party, as the structural flaw that turned politics into a contest between regions.</p>`,
   pins: [pin("Oloibiri", [6.33, 4.67])] },
 { t: "Republic, coups and civil war", when: "1960 to 1970", map: 1967,
   body: `<p>Nigeria became a republic in 1963, and the <b>Mid-Western Region</b> was carved from the West. Disputed elections and a contested census poisoned trust. On <b>15 January 1966</b> young officers, mostly Igbo, killed the Prime Minister, Balewa, and the Northern and Western premiers; General Aguiyi-Ironsi took power. A northern counter-coup on <b>29 July 1966</b> brought Yakubu Gowon to power, and thousands of Igbo were killed in massacres in the north.</p>
   <p>On 27 May 1967 Gowon replaced the four regions with <b>twelve states</b>. Three days later, on <b>30 May 1967</b>, Odumegwu Ojukwu declared the Eastern Region the <b>Republic of Biafra</b>. The war lasted until January 1970. Estimates of the dead range from about half a million to more than two million, most of them from starvation under blockade.</p>
   <p>Gowon's slogan at the end was "no victor, no vanquished". Whether that promise was kept is still argued about, and it is part of today's debates on marginalisation in the South East.</p>` },
 { t: "Oil, soldiers and a new capital", when: "1970 to 1999", map: 1976,
   body: `<p>Nigeria joined OPEC in 1971, and the 1973 oil price rise brought a boom. Oil soon supplied most government revenue and almost all exports, and agriculture, once the backbone of the economy (cocoa, groundnuts, palm oil), declined. Soldiers ruled for most of these years: Gowon, Murtala Mohammed (1975, killed in 1976), Obasanjo, who handed over to the civilian Second Republic of Shehu Shagari (1979–83), then Buhari (1983), Babangida (1985) and Abacha (1993–98).</p>
   <p>In 1976 the country was redivided into <b>19 states</b>, and <b>Abuja</b> was chosen as a new, central capital; the government moved there from Lagos in 1991. Babangida's Structural Adjustment Programme (1986) devalued the naira and cut spending, and most Nigerians grew poorer.</p>
   <p>On <b>12 June 1993</b> M. K. O. Abiola won what is widely seen as Nigeria's freest election; Babangida annulled it. Sani Abacha seized power in November 1993. In <b>1995</b> his regime hanged the writer and Ogoni activist <b>Ken Saro-Wiwa</b> and eight others, and the Commonwealth suspended Nigeria. Soyinka wrote <i>The Open Sore of a Continent</i> in exile in these years.</p>`,
   pins: [pin("Abuja", [7.49, 9.06]), pin("Ogoniland", [7.3, 4.7])] },
 { t: "The Fourth Republic", when: "1999 to today", map: 1996,
   body: `<p>Abacha died in 1998, and civilian rule returned on <b>29 May 1999</b> with President Obasanjo. Since 1996 there have been <b>36 states</b> plus the FCT. In 2007 power passed from one civilian president to another for the first time, and in 2015 an opposition candidate, Muhammadu Buhari, beat a sitting president, Goodluck Jonathan, for the first time.</p>
   <p>Insecurity has grown. The <b>Boko Haram</b> uprising began in Maiduguri in 2009, and the group abducted 276 schoolgirls from <b>Chibok</b> in 2014; banditry and kidnapping spread across the north-west and north-central, and farmer–herder violence across the Middle Belt. In late 2025 the United States named Nigeria a "Country of Particular Concern" over religious freedom and struck ISIS-linked targets with Nigerian cooperation on Christmas Day; US troops supported Nigerian operations in 2026 before most withdrew in July.</p>
   <p>The <b>#EndSARS</b> protests against police brutality (2020) ended in the shooting at the Lekki toll gate on 20 October. President Tinubu (elected 2023) removed the petrol subsidy and let the naira float in 2023; prices rose sharply, with inflation above 30% in 2024, and protests followed. General elections are due in 2027.</p>
   <p>The UN projects about <b id="ngpop26"></b> Nigerians in mid-2026, with a median age of about 18, and about <b id="ngpop50"></b> by 2050.</p>`,
   pins: [pin("Maiduguri", [13.15, 11.85]), pin("Chibok", [12.85, 10.87]), pin("Lekki", [3.47, 6.44])] }
];
function ngStop(i, quiet) {
  const s = NGSTORY[i]; clearMap(); G.states.selectAll("*").remove(); G.stateslabels.selectAll("*").remove(); $("#L-labels").checked = true; applyLayers();
  if (s.map) ngMap(s.map); else flyTo(featByKey.get("566"), {pad: .92, maxk: 14});
  setPins(s.pins || []);
  $("#ngstoryinfo").innerHTML = `<div class="eyebrow">Part ${i + 1} of ${NGSTORY.length} · ${esc(s.when)}</div><h3 style="margin-top:2px">${esc(s.t)}</h3>${s.body}
    ${s.map ? `<p class="src" id="ngmapcap"></p>` : ""}
    <div class="btnrow"><button class="btn" data-act="ngstop" data-i="${i - 1}" ${i ? "" : "disabled"}>← Back</button>${i + 1 < NGSTORY.length ? `<button class="btn primary" data-act="ngstop" data-i="${i + 1}">Next: ${esc(NGSTORY[i + 1].t)} →</button>` : `<button class="btn primary" data-act="ngdebate">The national question: four views →</button>`}</div>`;
  if (s.map) ngMap(s.map);
  const w = D.wpp && D.wpp.NGA; if (w && $("#ngpop26")) { $("#ngpop26").textContent = shortNum(w.p2026); $("#ngpop50").textContent = shortNum(w.p2050); }
  document.querySelectorAll("#ngchips .chip").forEach((c, j) => c.classList.toggle("on", j === i));
  saved.ngAt = i; store.set(saved);
  if (!quiet) $("#ngstoryinfo").scrollIntoView({block: "start", behavior: "smooth"}); }
ACT.ngstop = el => { const i = +el.dataset.i; if (i >= 0 && i < NGSTORY.length) ngStop(i); };
ACT.ngdebate = () => { ngMap(1996); setPins([]);
  $("#ngstoryinfo").innerHTML = `<div class="eyebrow">Debate</div><h3 style="margin-top:2px">The national question: is Nigeria a nation, and on what terms?</h3>
  <h4>Facts first</h4>
  <p>Nigeria's borders were drawn by Britain and joined in 1914. It contains more than 250 ethnic groups and over 500 languages; the three largest groups are the Hausa-Fulani, Yoruba and Igbo, and none is a majority. The federation has gone from 3 regions to 36 states. Most federal revenue has come from oil produced in the Niger Delta and shared out by formula. Nigeria has held together through a civil war, six successful coups (1966 twice, 1975, 1983, 1985, 1993) and long military rule.</p>
  <h4>Four views</h4>
  <p><b>1. "A mere geographical expression."</b> Obafemi Awolowo wrote in 1947 that Nigeria was not a nation but a geographical expression, and argued for a federation in which each major ethnic group governed itself. Today's calls for "restructuring" and "true federalism" (regional autonomy, state police, resource control) descend from this view.</p>
  <p><b>2. Soyinka: a nation must be earned.</b> In <i>The Open Sore of a Continent</i> (1996) Soyinka points out that no nation is natural: the Kurds, Catalonia and the Soviet Union show that nationhood is always made and remade by conflict, interest and accident. So a colonial origin is not the real problem. What decides whether Nigeria is a nation is whether it serves the people inside it. A state that annuls their vote (June 12) and kills its critics (the Ogoni Nine) has no claim to loyalty based on "territorial integrity" alone; until it becomes, in his words, a "humanized space", Nigeria is a duty, not yet a nation.</p>
  <p><b>3. Falola and Heaton: a colonial creation that became real.</b> The historians accept that Britain made the frame, but show a century of shared institutions, markets, migration, schools, music and intermarriage inside it. Nigeria's crises, in their account, come less from the existence of the country than from colonial structures, military rule, oil dependence and corruption.</p>
  <p><b>4. Achebe: leadership.</b> Chinua Achebe argued in <i>The Trouble with Nigeria</i> (1983) that the trouble is simply a failure of leadership, not the land, the climate or the people. On this view, restructuring without better leaders would change little.</p>
  <h4>Testing the views</h4>
  <p>The "artificial borders" argument proves less than it seems: Italy, Germany and Indonesia were also assembled recently, and Tanzania joined Tanganyika and Zanzibar by agreement in 1964. Yet the civil war and the Biafra and Ambazonia movements show that a state can hold territory by force without holding consent. Soyinka's test (does the state serve its people?) and Achebe's (who leads?) both move the question from maps to institutions. The 2014 National Conference under President Jonathan produced hundreds of recommendations; few have been put into practice. Which view you find strongest depends on whether you think the problem is the design of the federation, the conduct of those who run it, or both.</p>
  <div class="btnrow"><button class="btn" data-act="ngstop" data-i="0">Back to the start</button><button class="btn primary" data-mode-go="story">Next lesson: The human story on the map →</button></div>`;
  $("#ngstoryinfo").scrollIntoView({block: "start", behavior: "smooth"}); };
MODES.ngstory = () => { clearMap();
  setPanel(`<div class="eyebrow">Nigerian history</div><h2>How Nigeria was made</h2>
  <p>Nine parts, from the first people here to the Fourth Republic, then a debate on the national question. The map redraws Nigeria's internal divisions as they changed, from two protectorates in 1914 to 36 states today.</p>
  <div class="chips" id="ngchips">${NGSTORY.map((s, i) => `<button class="chip" data-act="ngstop" data-i="${i}">${i + 1}. ${esc(s.t)}</button>`).join("")}</div>
  <div id="ngstoryinfo" class="card"></div>
  <h4>From 3 regions to 36 states</h4>
  <div>${NG_COUNT.map(([y, n, u]) => `<div class="bar"><span>${y}</span><span class="track"><i style="width:${n / 36 * 100}%"></i></span><span class="n">${n} ${u === "regions" ? "reg." : ""}</span></div>`).join("")}</div>
  <div class="chips" id="ngyears">${Object.keys(NG_MAPS).map(y => `<button class="chip" data-act="ngmap" data-y="${y}">${y}</button>`).join("")}</div>
  <p class="src">Further reading behind this lesson: Toyin Falola and Matthew M. Heaton, <i>A History of Nigeria</i> (Cambridge, 2008); Wole Soyinka, <i>The Open Sore of a Continent</i> (1996). The text is written for this atlas; events after 2007 come from news reports up to September 2026.</p>`);
  ngStop(Math.min(saved.ngAt || 0, NGSTORY.length - 1), true); };

/* ===== Nigeria in the world (added to the World politics lesson) ===== */
const NGFP = {
  circles() { clearMap(); colorGroups([[["NGA"], "var(--sel)"], [["BEN","NER","TCD","CMR"], "var(--d3)"], [ECOWAS.filter(c => c !== "NGA" && c !== "BEN"), "var(--d2)"], [Object.values(D.facts).filter(f => f.reg === "Africa" && f.un && !ECOWAS.includes(f.c3) && !["NER","TCD","CMR"].includes(f.c3)).map(f => f.c3), "var(--d1)"]], {maxk: 3});
    legend([["--sel", "Nigeria"], ["--d3", "1. Immediate neighbours"], ["--d2", "2. West Africa (ECOWAS)"], ["--d1", "3. The rest of Africa"]]); },
  ecomog() { clearMap(); colorGroups([[["LBR", "SLE"], "var(--sel)"], [["NGA"], "var(--accent)"]], {maxk: 6}); legend([["--sel", "Major ECOMOG interventions led by Nigeria"], ["--accent", "Nigeria"]]);
    setPins([pin("Monrovia", [-10.8, 6.3]), pin("Freetown", [-13.23, 8.48])]); },
  liberation() { clearMap(); colorGroups([[["AGO","MOZ","ZWE","NAM","ZAF"], "var(--sel)"], [["NGA"], "var(--accent)"]], {maxk: 3}); legend([["--sel", "Liberation struggles Nigeria backed"], ["--accent", "Nigeria"]]); },
  bakassi() { clearMap(); colorGroups([[["NGA"], "var(--accent)"], [["CMR"], "var(--c-eu)"]], {fly: false}); setPins([pin("Bakassi Peninsula", [8.6, 4.65])]); flyToPoint([8.6, 4.75], 18); }
};
ACT.ngfp = el => NGFP[el.dataset.v]();
const NGFP_HTML = () => `<h3>8. Nigeria in the world</h3>
  <p>Nigerian IR courses spend a lot of time here, so this section sets out the main ideas and events in order.</p>
  <p><b>Africa as the centrepiece.</b> From independence, and explicitly from the 1970s, Nigerian governments have described Africa as the "centrepiece" of their foreign policy. In the 1980s the scholar-diplomat Ibrahim Gambari described this as <b>concentric circles</b>: Nigeria's own security and its immediate neighbours first, then West Africa, then Africa, then the wider world.</p>
  <div class="btnrow"><button class="btn" data-act="ngfp" data-v="circles">Show the concentric circles</button></div>
  <p><b>Against colonialism and apartheid.</b> Nigeria was far from southern Africa but acted almost as a "frontline state": Murtala Mohammed's government recognised the MPLA government of Angola in 1975, and in 1979 Nigeria nationalised BP's local assets over Britain's dealings with apartheid South Africa and the Rhodesia question.</p>
  <div class="btnrow"><button class="btn" data-act="ngfp" data-v="liberation">Show the liberation struggles</button></div>
  <p><b>Regional leadership.</b> Nigeria led the founding of ECOWAS in Lagos in 1975. Through ECOWAS's monitoring force, <b>ECOMOG</b>, it led interventions in Liberia (from 1990) and Sierra Leone (1997–98), paying most of the cost in money and soldiers. Nigerian troops have served in UN peacekeeping since the Congo in 1960. The Technical Aid Corps (1987) sends Nigerian professionals to other African, Caribbean and Pacific countries.</p>
  <div class="btnrow"><button class="btn" data-act="ngfp" data-v="ecomog">Show ECOMOG's main missions</button></div>
  <p><b>Law over force: Bakassi.</b> When the International Court of Justice awarded the Bakassi Peninsula to Cameroon in 2002, Nigeria, after the Greentree Agreement (2006), handed it over in 2008 rather than fight. Critics at home called it a surrender; supporters call it Nigeria's clearest act of respect for international law.</p>
  <div class="btnrow"><button class="btn" data-act="ngfp" data-v="bakassi">Fly to Bakassi</button></div>
  <p><b>Doctrines since 1999.</b> "Citizen diplomacy" (from 2007) said foreign policy should serve Nigerians abroad. Since 2023 the "4-D" approach stresses <b>democracy, development, demography and diaspora</b>. Recent tests: the 2023 coup in Niger and the exit of the Sahel juntas from ECOWAS, Nigeria becoming a BRICS partner (2025), US pressure and military cooperation over insecurity (2025–26), and recurring xenophobic attacks on Nigerians in South Africa.</p>
  <p><span class="kind">Interpretation</span>A realist reads Nigeria's Africa-first policy as a regional power securing its neighbourhood; a liberal reads ECOWAS and Bakassi as institution-building; a critic notes that Nigeria often spent heavily abroad (ECOMOG) while its own citizens lacked basic services. Exam answers that weigh these readings score better than lists of events.</p>`;

/* ===== IR concepts quiz ===== */
const IRQ = [
 ["The Peace of Westphalia (1648) is usually taken as the symbol of…", ["the modern system of sovereign states", "the end of the Cold War", "the founding of the United Nations", "the scramble for Africa"], 0, "Westphalia ended the Thirty Years' War and is the conventional starting point of a system of sovereign, territorial states."],
 ["Who wrote that whoever rules the 'Heartland' commands the 'World-Island'?", ["Halford Mackinder", "Alfred Thayer Mahan", "Nicholas Spykman", "Hans Morgenthau"], 0, "Mackinder (1904, 1919). Spykman answered with the Rimland; Mahan stressed sea power."],
 ["Which theory says states seek power and security because there is no world government above them?", ["Realism", "Liberalism", "Constructivism", "Functionalism"], 0, "Realism (Carr, Morgenthau, Waltz) starts from anarchy: no authority above states."],
 ["'Anarchy is what states make of it' is a famous line from…", ["Alexander Wendt (constructivism)", "Kenneth Waltz (neo-realism)", "Immanuel Wallerstein (world-systems)", "Woodrow Wilson (liberalism)"], 0, "Wendt (1992) argued that the meaning of anarchy depends on shared ideas and identities."],
 ["In world-systems theory, rich industrial states form the…", ["core", "periphery", "semi-periphery", "buffer zone"], 0, "Wallerstein divides the world economy into core, semi-periphery and periphery."],
 ["The Asian–African Conference of 1955 that inspired the Non-Aligned Movement was held in…", ["Bandung", "Belgrade", "Cairo", "Accra"], 0, "Bandung, Indonesia; the first NAM summit followed in Belgrade in 1961."],
 ["Which of these was NOT among the five leaders associated with founding the Non-Aligned Movement?", ["Kwame Nkrumah", "Jawaharlal Nehru", "Josip Broz Tito", "Fidel Castro"], 3, "The five are usually given as Nehru, Nasser, Tito, Sukarno and Nkrumah. Cuba joined later."],
 ["A state kept weak and neutral between two rivals is called a…", ["buffer state", "client state", "rogue state", "rentier state"], 0, "Afghanistan between the Russian Empire and British India is the classic case."],
 ["Collective security means…", ["an attack on one member is treated as an attack on all", "each state relies only on its own army", "states balance against the strongest power", "great powers divide spheres of influence"], 0, "The idea behind the League of Nations, the UN and NATO's Article 5."],
 ["How many permanent members does the UN Security Council have?", ["Five", "Ten", "Fifteen", "Seven"], 0, "China, France, Russia, the UK and the US, each with a veto. Ten more members are elected for two years."],
 ["Nigeria's foreign-policy idea of 'concentric circles' is associated with…", ["Ibrahim Gambari", "Bolaji Akinyemi", "Nnamdi Azikiwe", "Yakubu Gowon"], 0, "Gambari set out the concentric circles in the 1980s. Akinyemi is linked to the Technical Aid Corps and the 'Concert of Medium Powers'."],
 ["ECOMOG's first major intervention, beginning in 1990, was in…", ["Liberia", "Sierra Leone", "Côte d'Ivoire", "Mali"], 0, "Liberia, followed by Sierra Leone in 1997–98."],
 ["In 2002 the International Court of Justice awarded the Bakassi Peninsula to…", ["Cameroon", "Nigeria", "Equatorial Guinea", "Gabon"], 0, "Nigeria completed the handover in 2008 under the Greentree Agreement (2006)."],
 ["The treaty that recognises five nuclear-weapon states and aims to stop the spread of nuclear weapons is the…", ["NPT (1968)", "CTBT (1996)", "START (1991)", "Ottawa Treaty (1997)"], 0, "The Non-Proliferation Treaty recognises the US, Russia, the UK, France and China."],
 ["Which country became the 11th member of ASEAN in 2025?", ["Timor-Leste", "Papua New Guinea", "Sri Lanka", "Bangladesh"], 0, "Timor-Leste was admitted in October 2025."],
 ["Which three states formally left ECOWAS in January 2025?", ["Mali, Burkina Faso and Niger", "Guinea, Mali and Chad", "Niger, Chad and Sudan", "Burkina Faso, Togo and Benin"], 0, "They formed the Alliance of Sahel States (AES)."],
 ["'Soft power', the ability to attract rather than coerce, is a term coined by…", ["Joseph Nye", "Robert Keohane", "Samuel Huntington", "Henry Kissinger"], 0, "Nye introduced the term around 1990."],
 ["A country whose government lives mainly on income from oil or other natural resources rather than taxes is often called a…", ["rentier state", "developmental state", "failed state", "garrison state"], 0, "Rentier state theory is often applied to Nigeria and the Gulf states."],
 ["Neo-colonialism, in Kwame Nkrumah's sense, means…", ["formal independence with continued outside economic control", "a return to direct colonial rule", "colonisation of new territory in the Arctic", "rule by former colonial settlers"], 0, "Nkrumah's 1965 book <i>Neo-Colonialism: The Last Stage of Imperialism</i>."],
 ["Which organisation did Nigeria help found in Lagos in 1975?", ["ECOWAS", "OAU", "OPEC", "the African Development Bank"], 0, "The Treaty of Lagos created ECOWAS on 28 May 1975. The OAU dates from 1963 (Addis Ababa)."]
];
Object.assign(GAMES, { concepts: { name: "IR concepts", desc: "Twenty key ideas, thinkers and events from International Relations, including Nigerian foreign policy.", single: true, deck: [], gen() {
  if (!this.deck.length) this.deck = shuffle(IRQ);
  const [q, o, a, why] = this.deck.pop(), idx = shuffle(o.map((_, i) => i));
  return {q: esc(q), opts: idx.map(i => o[i]), a: idx.indexOf(a), why: why.replace(/<\/?i>/g, "")}; } } });
