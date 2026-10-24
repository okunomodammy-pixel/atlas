/* ---------- batch 9: two new lessons built with Blainey (world history) and Ghosh (International Relations) as guides ---------- */
/* All text is original. Dates follow mainstream current scholarship; where it has moved on since the books were written, the newer figure is used. */
G.pinlab = root.append("g").attr("class", "labels pinlab");
function clearMap() { S.color = null; S.sel = null; G.countries.selectAll("path").classed("dim", false); setRoutes([]); setPins([]); legend(null); paint(); }
function colorGroups(groups, opts = {}) { // groups: [[c3 list, css colour], ...] — later groups win
  const m = new Map(); groups.forEach(([list, col]) => list.forEach(c => { const k = k3(c) || (featByKey.has(c) ? c : null); if (k) m.set(k, col); }));
  S.color = k => m.get(k) || null; S.sel = null; paint();
  G.countries.selectAll("path").classed("dim", d => opts.dim !== false && !m.has(d.key));
  if (opts.fly === "world") resetView(); else if (opts.fly !== false) flyToKeys([...m.keys()], {pad: opts.pad || .85, maxk: opts.maxk || 6});
  return m; }
const line = (...pts) => ({geo: {type: "LineString", coordinates: pts}});
const dashed = (...pts) => ({geo: {type: "LineString", coordinates: pts}, thin: true});
const pin = (t, c) => ({t, c});
const SRC_BOOKS = `<p class="src">Further reading behind this lesson: Geoffrey Blainey, <i>A Very Short History of the World</i> (2004) and Peu Ghosh, <i>International Relations</i> (5th edition, 2020). The text here is written for this atlas; where research or events have moved on since those books, the newer evidence is used and flagged.</p>`;

/* ===== Lesson: the human story on the map ===== */
const STORY = [
 { t: "Out of Africa", when: "300,000 to about 15,000 years ago",
   body: `<p>Every human story starts in Africa. Earlier human species spread into Asia well over a million years ago, but our own species, <i>Homo sapiens</i>, appears in Africa first: the oldest fossils, from Jebel Irhoud in Morocco, are about 300,000 years old, and Omo Kibish in Ethiopia about 230,000.</p>
   <p>The great spread out of Africa came later, mostly after about 70,000–50,000 years ago, probably across the narrow mouth of the Red Sea and along the coasts of Arabia and South Asia. People reached Australia by at least 50,000 years ago (some sites suggest earlier), Europe by about 45,000, and the Americas last.</p>
   <div class="note"><span class="kind">Debated</span>When people first entered the Americas is still argued over. Monte Verde in Chile is securely about 14,500 years old; footprints at White Sands, New Mexico, have been dated to over 20,000 years, a claim some researchers still question. Blainey's 2004 account already hinted at early dates; the evidence has grown since.</div>`,
   pins: [pin("Jebel Irhoud", [-8.87, 31.86]), pin("Omo Kibish", [35.95, 5.4]), pin("Madjedbebe", [132.9, -12.5]), pin("Monte Verde", [-73.2, -41.5]), pin("White Sands", [-106.3, 32.8])],
   routes: [line([36, 5], [43.4, 12.6], [57, 21], [72, 20], [90, 22], [100, 10], [110, -5], [125, -10], [132.9, -12.5]),
     line([36, 5], [33, 30], [35.5, 33], [33, 39], [23, 42], [15, 48]), line([90, 22], [105, 30], [120, 40], [140, 58], [-170, 65], [-150, 63], [-125, 50], [-110, 33], [-90, 15], [-78, -5], [-73.2, -41.5])],
   fly: "world" },
 { t: "When the seas were rising", when: "about 20,000 to 7,000 years ago",
   body: `<p>At the height of the last Ice Age, about 20,000 years ago, so much water was locked in ice sheets that the sea stood roughly 120 metres lower than today. Land bridges joined places now separated by sea: Siberia to Alaska (<b>Beringia</b>), Australia to New Guinea and Tasmania (<b>Sahul</b>), Java, Sumatra and Borneo to mainland Asia (<b>Sundaland</b>), and Britain to Europe (<b>Doggerland</b>).</p>
   <p>As the ice melted, the sea rose and drowned these plains; most of the rise was over by about 7,000 years ago. The map is now showing ocean depths: the palest sea next to the coasts is the continental shelf, under 200 metres deep. Much of the shallowest part of it was dry land then.</p>
   <p><b>Why it matters:</b> it explains how people walked to the Americas and nearly walked to Australia, and why Britain, Japan and Sri Lanka became islands only recently in human terms.</p>`,
   pins: [pin("Beringia", [-170, 65]), pin("Sundaland", [108, 2]), pin("Sahul", [137, -10]), pin("Doggerland", [3, 54.5])], depth: true, fly: "world" },
 { t: "The first farmers", when: "from about 11,500 years ago",
   body: `<p>Farming was not invented once and spread; it was invented several times, independently, wherever useful wild plants and animals lived. The main centres:</p>
   <ul><li><b>Fertile Crescent</b> (Iraq, Syria, Türkiye, Iran): wheat, barley, lentils, sheep and goats, from about 11,500 years ago.</li>
   <li><b>China</b>: rice along the Yangtze and millet along the Yellow River, by about 9,000 years ago.</li>
   <li><b>New Guinea highlands</b>: taro and bananas, several thousand years ago.</li>
   <li><b>Mesoamerica</b> (Mexico): maize, beans and squash; maize was bred from a wild grass, teosinte.</li>
   <li><b>The Andes</b>: potatoes, quinoa, llamas and alpacas.</li>
   <li><b>West Africa</b>: pearl millet, sorghum, African rice, yams, cowpeas and the oil palm: much of what Nigerians still eat began here.</li>
   <li><b>Ethiopian highlands</b>: teff, coffee and enset.</li></ul>
   <p>Farming fed more people per square kilometre than hunting and gathering, so farming populations grew and spread, often absorbing or displacing their neighbours.</p>`,
   pins: [pin("Fertile Crescent", [40, 35]), pin("Yangtze & Yellow River", [113, 32]), pin("New Guinea", [144, -6]), pin("Mesoamerica", [-97, 18]), pin("Andes", [-72, -14]), pin("West Africa", [2, 12]), pin("Ethiopian highlands", [38.5, 9])], fly: "world" },
 { t: "Cities of the river valleys", when: "about 3500 to 1500 BC",
   body: `<p>The first cities and states grew in four river valleys: the <b>Tigris and Euphrates</b> (Mesopotamia, now Iraq), the <b>Nile</b> (Egypt), the <b>Indus</b> (Pakistan and north-west India) and the <b>Yellow River</b> (China). Writing appeared in Mesopotamia by about 3200 BC and in Egypt at about the same time; Egypt was united around 3100 BC; the Indus cities of Harappa and Mohenjo-daro flourished about 2600–1900 BC; the Shang state rose on the Yellow River around 1600 BC.</p>
   <p><span class="kind">Interpretation</span>Rivers gave water in dry lands, rich silt from floods, and a highway for trade. Controlling floods and sharing water needed organisation, records and rulers. Blainey stresses the river as highway; others stress the surplus of grain that could feed priests, soldiers and scribes.</p>
   <p><b>Counterpoint:</b> rivers were not the only route to civilisation. Caral in Peru built pyramids around 2600 BC in a narrow coastal valley, and the Maya built cities in tropical forest.</p>`,
   pins: [pin("Uruk", [45.64, 31.32]), pin("Memphis", [31.25, 29.85]), pin("Mohenjo-daro", [68.14, 27.33]), pin("Harappa", [72.86, 30.63]), pin("Anyang", [114.3, 36.1]), pin("Caral", [-77.52, -10.89])],
   keys: ["IRQ", "EGY", "PAK", "CHN"], fly: "pins" },
 { t: "The Mediterranean world", when: "about 1000 BC to AD 400",
   body: `<p>The Mediterranean is an almost closed sea with calm summers, so it became a highway long before the open oceans were. Phoenician traders from Tyre and Sidon (now Lebanon) founded Carthage in today's Tunisia; Greek city-states such as Athens planted colonies from Spain to the Black Sea; Alexander's city of Alexandria, founded in 331 BC, became the greatest centre of learning of its age.</p>
   <p>Rome destroyed Carthage in 146 BC and by 30 BC ruled every shore of the sea, which Romans called <i>mare nostrum</i>, "our sea". The highlighted countries were wholly or partly inside the empire at its greatest extent, around AD 117.</p>`,
   pins: [pin("Tyre", [35.2, 33.27]), pin("Athens", [23.73, 37.98]), pin("Carthage", [10.32, 36.85]), pin("Rome", [12.5, 41.9]), pin("Alexandria", [29.92, 31.2])],
   keys: ["PRT","ESP","FRA","BEL","LUX","CHE","ITA","SVN","HRV","BIH","SRB","MNE","ALB","MKD","GRC","BGR","ROU","TUR","CYP","SYR","LBN","ISR","PSE","JOR","EGY","LBY","TUN","DZA","MAR","GBR","AUT","HUN"], fly: "keys" },
 { t: "Faiths that travelled", when: "about 500 BC to AD 750",
   body: `<p>Three faiths that began in small places now count billions of followers.</p>
   <ul><li><b>Buddhism</b> began in the Ganges plain with the Buddha (around the 5th century BC) and spread by monks and merchants to Sri Lanka, South-East Asia, China, Korea and Japan.</li>
   <li><b>Christianity</b> began in Roman Judea in the 1st century AD, spread along Roman roads and sea lanes, and became the empire's favoured faith in the 300s. Aksum in Ethiopia adopted it in the 4th century, one of the earliest states to do so.</li>
   <li><b>Islam</b> began in Mecca and Medina with the Prophet Muhammad in the early 600s. Within about a century of his death in 632, Muslim rule stretched from Spain to the Indus. The countries shaded were wholly or partly inside that area by about 750.</li></ul>
   <p><span class="kind">Note</span>Trade routes and faith routes are often the same routes. Islam reached West Africa mainly through Saharan traders and scholars, not conquest.</p>`,
   pins: [pin("Bodh Gaya", [84.99, 24.7]), pin("Jerusalem", [35.23, 31.78]), pin("Mecca", [39.83, 21.42]), pin("Aksum", [38.72, 14.13])],
   routes: [dashed([84.99, 24.7], [80.7, 7.9]), dashed([84.99, 24.7], [75, 35], [80, 40], [104, 36], [116.4, 39.9], [127, 37.5], [135.8, 34.7]), dashed([84.99, 24.7], [96, 17], [104.9, 11.6]),
     dashed([35.23, 31.78], [28.98, 41.01], [12.5, 41.9]), dashed([35.23, 31.78], [32.5, 15.6], [38.72, 14.13])],
   keys: ["PRT","ESP","MAR","DZA","TUN","LBY","EGY","ISR","PSE","JOR","LBN","SYR","IRQ","SAU","YEM","OMN","ARE","QAT","BHR","KWT","IRN","AFG","PAK","TKM","UZB","TJK","ARM","AZE"], fly: "world" },
 { t: "Across the Sahara and the Indian Ocean", when: "about AD 800 to 1600",
   body: `<p>Blainey describes the Sahara as a dry sea: dangerous, but crossed for centuries by camel caravans running between "desert ports". Gold, ivory and enslaved people went north; salt, cloth, horses, books and Islam came south. Ghana (Wagadu), then Mali and Songhai grew rich on this trade. In 1324 Mansa Musa of Mali passed through Cairo on pilgrimage with so much gold that he was remembered for it for generations. Timbuktu became a city of scholars.</p>
   <p>Nigeria sat on these routes too: Kanem-Bornu near Lake Chad and the Hausa cities such as Kano traded north across the desert, while the Kingdom of Benin and the Yoruba city of Ife in the south produced bronze and brass sculpture famous across the world.</p>
   <p>On the east coast, Swahili towns such as Kilwa, Zanzibar and Mogadishu traded with Arabia, India and even China, carried by the monsoon winds; Great Zimbabwe, inland, shipped gold through them.</p>`,
   pins: [pin("Timbuktu", [-3.0, 16.77]), pin("Gao", [-0.04, 16.27]), pin("Sijilmasa", [-4.27, 31.28]), pin("Cairo", [31.24, 30.04]), pin("Kano", [8.52, 12.0]), pin("Bornu", [13.3, 12.9]), pin("Benin City", [5.62, 6.34]), pin("Ife", [4.56, 7.47]), pin("Kilwa", [39.52, -8.96]), pin("Mogadishu", [45.34, 2.04]), pin("Great Zimbabwe", [30.93, -20.27])],
   routes: [line([-3.0, 16.77], [-4.27, 31.28], [-7.99, 31.63]), line([8.52, 12.0], [12.92, 18.69], [13.9, 25.9], [13.18, 32.89]), dashed([-3.0, 16.77], [3, 21], [15, 24], [31.24, 30.04]),
     dashed([39.52, -8.96], [45.34, 2.04], [55, 15], [58, 23]), dashed([45.34, 2.04], [65, 12], [75.8, 11.25]), dashed([30.93, -20.27], [35.5, -20], [39.52, -8.96])],
   fly: "pins" },
 { t: "Polynesia and Madagascar", when: "about 1000 BC to AD 1300",
   body: `<p>The greatest feat of navigation before modern instruments. People of the Lapita culture reached Fiji, Tonga and Samoa about 3,000 years ago. After a long pause, Polynesian voyagers in double-hulled canoes, steering by stars, swells and birds, settled the far corners of the Pacific in a few centuries: Hawaii and Rapa Nui (Easter Island) by about AD 1000–1200, and Aotearoa New Zealand around 1250–1300, the last large habitable land on Earth to be settled.</p>
   <p>The same Austronesian seafaring family sailed west too: Madagascar was settled by people from Borneo, across the Indian Ocean, perhaps 1,500 years ago, joined later by Africans from the mainland. Malagasy is still an Austronesian language.</p>`,
   pins: [pin("Samoa", [-172, -13.8]), pin("Tahiti", [-149.4, -17.6]), pin("Hawaii", [-155.5, 19.6]), pin("Rapa Nui", [-109.35, -27.12]), pin("Aotearoa", [174.8, -41.3]), pin("Madagascar", [47, -19])],
   routes: [line([-172, -13.8], [-149.4, -17.6]), line([-149.4, -17.6], [-155.5, 19.6]), line([-149.4, -17.6], [-109.35, -27.12]), line([-149.4, -17.6], [-159.8, -21.2], [174.8, -41.3]), dashed([114, 0], [80, -8], [47, -19])],
   fly: "world" },
 { t: "The Mongols and the Black Death", when: "1206 to 1350s",
   body: `<p>From the Mongolian steppe, Genghis Khan and his successors built the largest connected land empire in history, from Korea to the edge of central Europe. It was brutal in conquest, but under Mongol rule the Silk Roads became safer for merchants, and goods, ideas and diseases moved faster across Eurasia than ever before.</p>
   <p>Plague is thought to have spread west along those routes. It reached Caffa in Crimea in 1346, then sailed with merchant ships to Constantinople, Sicily, Marseille and beyond. Between 1347 and 1351 the Black Death killed perhaps a third to a half of Europe's people, and struck the Middle East and North Africa hard too.</p>
   <p class="src">The shaded countries were wholly or partly under Mongol rule at the empire's height, around 1260–1280.</p>`,
   pins: [pin("Karakorum", [102.83, 47.2]), pin("Caffa", [35.38, 45.03]), pin("Constantinople", [28.98, 41.01]), pin("Messina", [15.55, 38.19]), pin("Marseille", [5.37, 43.3])],
   routes: [dashed([102.83, 47.2], [76, 43], [52, 47], [35.38, 45.03]), line([35.38, 45.03], [28.98, 41.01], [15.55, 38.19], [5.37, 43.3], [-0.13, 51.5])],
   keys: ["MNG","CHN","KOR","RUS","KAZ","KGZ","TJK","UZB","TKM","AFG","IRN","IRQ","AZE","ARM","GEO","UKR","PAK","TUR"], fly: "keys" },
 { t: "The oceans joined", when: "1492 to 1522",
   body: `<p>In thirty years, European sailors linked every ocean. <b>Columbus</b> sailed west from Spain in 1492 and reached the Caribbean. <b>Vasco da Gama</b> sailed from Lisbon around the Cape of Good Hope to Calicut in India in 1497–98, opening a sea route to Asia that avoided the Middle East. The expedition of <b>Magellan</b>, completed by Elcano after Magellan was killed in the Philippines, sailed around the world in 1519–22.</p>
   <p><span class="kind">Interpretation</span>Blainey's view is that the world "shrank" from this point: what happened in one continent began to shape the others. Historians of Asia add that Europeans entered trading networks in the Indian Ocean that were already old, rich and busy, and for a long time were minor players in them.</p>`,
   pins: [pin("Palos", [-6.89, 37.23]), pin("San Salvador", [-74.5, 24.05]), pin("Lisbon", [-9.14, 38.72]), pin("Calicut", [75.78, 11.25]), pin("Cebu", [123.9, 10.3])],
   routes: [line([-6.89, 37.23], [-15.5, 28.1], [-74.5, 24.05]),
     line([-9.14, 38.72], [-23.6, 15.1], [-20, -10], [18.47, -34.36], [32.5, -26], [40.12, -3.22], [75.78, 11.25]),
     dashed([-6.35, 36.78], [-43, -23], [-67, -49], [-71, -53.5], [-80, -40], [-120, -10], [144.8, 13.4], [123.9, 10.3], [127.4, 0.8], [100, -10], [18.47, -34.36], [-15, 15], [-6.35, 36.78])],
   fly: "world" },
 { t: "The great exchange, and the Atlantic slave trade", when: "1500 to 1866",
   body: `<p>After 1492, plants, animals and diseases crossed the Atlantic in both directions: historians call it the Columbian exchange. From the Americas came <b>maize, cassava, groundnuts, sweet potatoes, tomatoes, chilli peppers and cocoa</b>, which became staples across Africa and Asia; cassava (garri, fufu) and maize are now central to Nigerian food. To the Americas went wheat, sugar cane, rice, horses and cattle, and diseases such as smallpox and measles that killed a large share of the Indigenous population.</p>
   <p>Plantations of sugar, tobacco and later cotton were worked by enslaved Africans. The SlaveVoyages database estimates that about <b>12.5 million</b> Africans were forced onto ships between 1501 and 1866, and about 10.7 million survived the crossing. The largest source region was West-Central Africa (Congo and Angola); the <b>Bight of Benin</b> and the <b>Bight of Biafra</b>, the coasts of today's Benin and Nigeria, were next. Brazil received the most, nearly five million.</p>
   <div class="note"><span class="kind">Read critically</span>Blainey stresses that slavery existed in many societies and that African rulers and traders sold captives. Both are true, but scale and system matter: the Atlantic trade was an industrial, racialised, centuries-long business whose effects on population, trust and politics are still measured today (see the debate below).</div>`,
   pins: [pin("Bight of Biafra", [6.5, 4.0]), pin("Ouidah", [2.08, 6.36]), pin("Luanda", [13.23, -8.84]), pin("Salvador da Bahia", [-38.5, -12.97]), pin("Jamaica", [-76.8, 18.0]), pin("Rio de Janeiro", [-43.2, -22.9])],
   routes: [line([6.5, 4.0], [-38.5, -12.97]), line([2.08, 6.36], [-30, 12], [-76.8, 18.0]), line([13.23, -8.84], [-43.2, -22.9])], fly: "pins" },
 { t: "Steam shrinks the world", when: "1760s to 1914",
   body: `<p>Coal-fired steam engines, improved by James Watt from the 1760s, powered factories first in Britain, then railways (the first public steam railway opened in 1825) and steamships. The telegraph sent messages across the Atlantic by cable from 1866. The Suez Canal, opened in 1869, cut the sea route from Britain to India dramatically: <b id="suezcut"></b></p>
   <p>Steam, rifles and quinine also made it possible for European powers to conquer the interior of Africa, which earlier disease and distance had protected. That story continues in <b>History through maps</b> (1880 and 1914) and in <b>How borders are made</b>.</p>`,
   pins: [pin("Manchester", [-2.24, 53.48]), pin("Suez", [32.35, 30.6]), pin("Mumbai", [72.88, 19.08])],
   routes: [dashed([-0.13, 51.5], [-9, 43], [-18, 20], [-10, -5], [18.47, -34.36], [45, -15], [72.88, 19.08]), line([-0.13, 51.5], [-9.5, 38.5], [-5.6, 35.95], [12, 37.5], [32.35, 31.2], [32.55, 29.9], [43.4, 12.6], [52, 13], [72.88, 19.08])],
   fly: "world" }
];
const routeKm = pts => pts.slice(1).reduce((s, p, i) => s + km(pts[i], p), 0);
function storyStop(i, quiet) {
  const s = STORY[i]; clearMap();
  $("#L-depth").checked = !!s.depth; applyLayers(); render();
  if (s.depth) legend([["--sea", "Shelf, under 200 m: partly dry in the Ice Age"], ["--d1", "200–3,000 m"]]);
  if (s.keys) colorGroups([[s.keys, "var(--c-af)"]], {fly: false});
  setRoutes(s.routes || []); setPins(s.pins || []);
  const pts = (s.pins || []).map(p => p.c);
  if (s.fly === "world") resetView();
  else if (s.fly === "keys") flyToKeys(s.keys.map(k3).filter(Boolean), {pad: .9, maxk: 4});
  else if (pts.length) flyTo({type: "MultiPoint", coordinates: pts}, {pad: .75, maxk: 6});
  $("#storyinfo").innerHTML = `<div class="eyebrow">Stop ${i + 1} of ${STORY.length} · ${esc(s.when)}</div><h3 style="margin-top:2px">${esc(s.t)}</h3>${s.body}
    <div class="btnrow"><button class="btn" data-act="story" data-i="${i - 1}" ${i ? "" : "disabled"}>← Back</button>${i + 1 < STORY.length ? `<button class="btn primary" data-act="story" data-i="${i + 1}">Next: ${esc(STORY[i + 1].t)} →</button>` : `<button class="btn primary" data-act="africaDebate">Debate: why did Africa's story unfold this way? →</button>`}</div>`;
  if ($("#suezcut")) { const cape = STORY[STORY.length - 1].routes[0].geo.coordinates, suez = STORY[STORY.length - 1].routes[1].geo.coordinates;
    $("#suezcut").textContent = `on the routes drawn here, from about ${fmt(Math.round(routeKm(cape) / 100) * 100)} km around Africa to about ${fmt(Math.round(routeKm(suez) / 100) * 100)} km through Suez.`; }
  document.querySelectorAll("#storychips .chip").forEach((c, j) => c.classList.toggle("on", j === i));
  saved.storyAt = i; store.set(saved);
  if (!quiet) $("#storyinfo").scrollIntoView({block: "start", behavior: "smooth"}); }
ACT.story = el => { const i = +el.dataset.i; if (i >= 0 && i < STORY.length) storyStop(i); };
ACT.axes = () => { clearMap();
  setRoutes([line([-9, 40], [40, 40], [90, 40], [140, 38]), line([10, 35], [18, 5], [20, -34]), line([-100, 50], [-90, 15], [-70, -50])]); resetView();
  banner("Eurasia runs east–west; Africa and the Americas run north–south"); setTimeout(() => banner(null), 5000); };
ACT.barriers = () => { clearMap(); $("#L-phys").checked = true; $("#L-rivers").checked = true; applyLayers(); render();
  setPins([pin("Sahara", [10, 23]), pin("Livingstone Falls (Congo)", [14.5, -5.0]), pin("Victoria Falls (Zambezi)", [25.86, -17.92]), pin("Cahora Bassa (Zambezi)", [32.7, -15.6]), pin("Nile cataracts", [32.9, 21.5])]);
  flyToKeys(Object.keys(D.facts).filter(k => D.facts[k].reg === "Africa" && D.facts[k].un), {pad: .95, maxk: 4}); };
ACT.africaDebate = () => {
  $("#storyinfo").innerHTML = `<div class="eyebrow">Debate</div><h3 style="margin-top:2px">Why did Africa's history unfold the way it did?</h3>
  <h4>Facts first</h4>
  <p>Africa is where humans began, and it had cities, states and long-distance trade for thousands of years: Egypt, Kush, Aksum, Ghana, Mali, Songhai, Kanem-Bornu, Great Zimbabwe, Kilwa, Benin, Oyo and Sokoto among them. Its great rivers, apart from the Nile, are broken by falls and rapids close to the sea, and its coastline has few deep bays. After 1500 it lost millions of people to the Atlantic, Saharan and Indian Ocean slave trades, and after 1880 almost all of it was conquered by European powers.</p>
  <div class="btnrow"><button class="btn" data-act="barriers">Show the barriers</button><button class="btn" data-act="axes">Show the continental axes</button></div>
  <h4>Three ways of explaining it</h4>
  <p><b>1. Geography.</b> Blainey argues the Sahara, waterfalls on the rivers, a smooth coastline (he estimates only about 2% of Africa is peninsula or island, against about a third of Europe) and the tsetse fly, which kills cattle and horses across much of the tropics, kept Africa's interior apart from the trade and ideas of Eurasia. Jared Diamond (<i>Guns, Germs, and Steel</i>, 1997) adds that Eurasia runs east–west, so crops and animals spread along one band of climate, while Africa and the Americas run north–south across many climates.</p>
  <p><b>2. Extraction and institutions.</b> Walter Rodney (<i>How Europe Underdeveloped Africa</i>, 1972) puts the weight on what was done to Africa: the slave trades and colonial rule drained people and wealth. Economists have since measured this. Nathan Nunn (2008) found that the parts of Africa that lost the most people to the slave trades are poorer today; Nunn and Wantchekon (2011) found lower trust in communities whose ancestors were most heavily raided. Acemoglu and Robinson argue that colonies built to extract left extractive institutions behind.</p>
  <p><b>3. Connection, not isolation.</b> Many historians of Africa reject the picture of a cut-off continent. Saharan caravans, Nile boats and Indian Ocean monsoons tied Africa to the wider world; Malian gold mattered to Mediterranean money, and Swahili ports traded as far as China.</p>
  <h4>Testing the explanations</h4>
  <p>Geography explains constraints, not outcomes: the same desert and rivers that "isolated" Africa also carried the trade that built Mali and Kanem-Bornu. The extraction view explains a lot after 1500 but less about differences between African societies before it. A fair conclusion is that geography set the board, and trade, power and violence decided much of the game. Which weighting you choose depends on how much you think places shape people, or people shape places.</p>
  <div class="btnrow"><button class="btn" data-act="story" data-i="0">Start the journey again</button><button class="btn primary" data-mode-go="history">Next lesson: History through maps →</button></div>`;
  $("#storyinfo").scrollIntoView({block: "start", behavior: "smooth"}); };
MODES.story = () => { clearMap();
  setPanel(`<div class="eyebrow">World history</div><h2>The human story on the map</h2>
  <p>Twelve stops, from the first humans in Africa to steam and the Suez Canal. Each stop changes the map: dots for places, lines for journeys and trade routes, shading for empires and faiths. Read the stop, then look at the map.</p>
  <div class="chips" id="storychips">${STORY.map((s, i) => `<button class="chip" data-act="story" data-i="${i}">${i + 1}. ${esc(s.t)}</button>`).join("")}</div>
  <div id="storyinfo" class="card"></div>
  ${SRC_BOOKS}`);
  storyStop(Math.min(saved.storyAt || 0, STORY.length - 1), true); };

/* ===== Lesson: world politics on the map ===== */
const UN_FOUNDERS = ["ARG","AUS","BEL","BOL","BRA","BLR","CAN","CHL","CHN","COL","CRI","CUB","CZE","SVK","DNK","DOM","ECU","EGY","SLV","ETH","FRA","GRC","GTM","HTI","HND","IND","IRN","IRQ","LBN","LBR","LUX","MEX","NLD","NZL","NIC","NOR","PAN","PRY","PER","PHL","POL","SAU","ZAF","SYR","TUR","UKR","RUS","GBR","USA","URY","VEN","SRB"];
const UN_GROWTH = [[1945, 51], [1960, 99], [1970, 127], [1980, 154], [1990, 159], [2000, 189], [2011, 193]];
const NATO_32 = ["ALB","BEL","BGR","CAN","HRV","CZE","DNK","EST","FIN","FRA","DEU","GRC","HUN","ISL","ITA","LVA","LTU","LUX","MNE","NLD","MKD","NOR","POL","PRT","ROU","SVK","SVN","ESP","SWE","TUR","GBR","USA"];
const SOVIET = ["RUS","UKR","BLR","MDA","EST","LVA","LTU","GEO","ARM","AZE","KAZ","UZB","TKM","KGZ","TJK"];
const BLOC9 = {
  UNSC: { n: "UN Security Council", groups: [[["CHN","FRA","RUS","GBR","USA"], "var(--sel)", "Permanent five, with veto"], [["BHR","COL","COD","LVA","LBR"], "var(--accent)", "Elected for 2026–27"], [["DNK","GRC","PAK","PAN","SOM"], "var(--c-eu)", "Elected for 2025–26"]],
    t: "Fifteen seats. The five permanent members (the victors of 1945) can veto any substantive decision; ten members are elected for two years. Africa has no permanent seat, which the African Union's Ezulwini Consensus (2005) asks to change. Zimbabwe, Kyrgyzstan, Trinidad and Tobago, Austria and Portugal were elected in June 2026 to join on 1 January 2027." },
  NATO: { n: "NATO", groups: [[NATO_32, "var(--accent)", "Members (32)"]], t: "A military alliance founded in 1949 by 12 countries. Article 5 says an attack on one is an attack on all. It grew to 32 members after Finland joined in 2023 and Sweden in 2024, after Russia's full-scale invasion of Ukraine." },
  EU: { n: "European Union", groups: [[["AUT","BEL","BGR","HRV","CYP","CZE","DNK","EST","FIN","FRA","DEU","GRC","HUN","IRL","ITA","LVA","LTU","LUX","MLT","NLD","POL","PRT","ROU","SVK","SVN","ESP","SWE"], "var(--c-eu)", "Members (27)"]], t: "27 member states pooling sovereignty over trade, a single market and, for 21 of them, the euro. The UK left in 2020. It is the clearest case of states choosing to share powers that are normally national." },
  AU: { n: "African Union", groups: [[[], "var(--c-af)", "Members (55)"], [["SDN","MLI","BFA","NER","MDG","GNB"], "var(--miss)", "Suspended after coups (as of 2026)"]], t: "All 55 African states, including the Sahrawi Republic (Western Sahara), which Morocco disputes. The AU suspends members after unconstitutional changes of government; Guinea's suspension was lifted in January 2026. Its headquarters are in Addis Ababa." },
  ECOWAS: { n: "ECOWAS and the AES", groups: [[ECOWAS, "var(--accent)", "ECOWAS (12)"], [AES, "var(--sel)", "Alliance of Sahel States (3)"]], t: "ECOWAS, founded in Lagos in 1975, has 12 members since Burkina Faso, Mali and Niger formally left on 29 January 2025. The three military-led states formed the Alliance of Sahel States (AES), a confederation, in 2024. Headquarters: Abuja." },
  ASEAN: { n: "ASEAN", groups: [[["BRN","KHM","IDN","LAO","MYS","MMR","PHL","SGP","THA","VNM","TLS"], "var(--accent)", "Members (11)"]], t: "The Association of Southeast Asian Nations, founded in 1967. Timor-Leste became the 11th member in October 2025. ASEAN works by consensus and non-interference, which makes it stable but slow." },
  BRICS: { n: "BRICS", groups: [[["BLR","BOL","CUB","KAZ","MYS","NGA","THA","UGA","UZB","VNM"], "var(--nb)", "Partner countries (Nigeria since 2025)"], [["BRA","RUS","IND","CHN","ZAF","EGY","ETH","IRN","ARE","IDN"], "var(--sel)", "Members"], [["SAU"], "var(--c-sa)", "Saudi Arabia: invited, status unclear"]], t: "Brazil, Russia, India and China met from 2006–09; South Africa joined in 2010–11; Egypt, Ethiopia, Iran and the UAE in 2024; Indonesia in January 2025. Saudi Arabia was invited in 2023 but has not clearly confirmed membership, so sources differ. Nigeria became a partner country in 2025. BRICS has no treaty or secretariat: it is a club for coordinating, not an alliance." },
  SCO: { n: "Shanghai Cooperation Organisation", groups: [[["CHN","KAZ","KGZ","RUS","TJK","UZB","IND","PAK","IRN","BLR"], "var(--sel)", "Members (10)"]], t: "Founded in 2001 from the 'Shanghai Five' of 1996. It covers security and economic ties across Eurasia; India and Pakistan joined in 2017, Iran in 2023 and Belarus in 2024. Mackinder's 'Heartland' (see above) is almost entirely inside it." },
  OPEC: { n: "OPEC", groups: [[["DZA","COG","GNQ","GAB","IRN","IRQ","KWT","LBY","NGA","SAU","VEN"], "var(--sel)", "Members (11)"], [["ARE","AGO","QAT","ECU"], "var(--c-sa)", "Left: UAE 2026, Angola 2024, Ecuador 2020, Qatar 2019"]], t: "Oil exporters coordinating production since 1960; Nigeria joined in 1971. The United Arab Emirates left on 1 May 2026 after a dispute over its production quota, during the Hormuz crisis. A wider OPEC+ group adds Russia and others." },
  NUKE: { n: "Nuclear-armed states", groups: [[["USA","RUS","GBR","FRA","CHN"], "var(--sel)", "Recognised by the NPT (1968)"], [["IND","PAK","PRK"], "var(--miss)", "Tested outside the NPT"], [["ISR"], "var(--c-sa)", "Israel: neither confirms nor denies"]], t: "Nine states have nuclear weapons. The 1968 Non-Proliferation Treaty recognises the five that tested before 1967, which are also the Security Council's permanent members. South Africa built six bombs in the 1980s and dismantled them in the early 1990s, the only state to give up weapons it had made itself." }
};
function auMembers() { return Object.values(D.facts).filter(f => f.reg === "Africa" && f.un).map(f => f.c3).concat(["ESH"]); }
ACT.bloc9 = el => { const b = BLOC9[el.dataset.b]; const groups = el.dataset.b === "AU" ? [[auMembers(), "var(--c-af)", "Members (55)"], b.groups[1]] : b.groups;
  clearMap(); colorGroups(groups.map(g => [g[0], g[1]]), {fly: ["AU", "ECOWAS", "ASEAN", "EU"].includes(el.dataset.b) ? true : "world", maxk: 4});
  legend(groups.map(g => [g[1].replace(/var\((.*)\)/, "$1"), g[2]]));
  document.querySelectorAll("#blocchips .chip").forEach(c => c.classList.toggle("on", c === el));
  $("#blocinfo9").innerHTML = `<b>${esc(b.n)}</b>. ${esc(b.t)}`; };
const POL = {
  founders() { clearMap(); colorGroups([[UN_FOUNDERS, "var(--accent)"]], {fly: "world"}); legend([["--accent", "UN founding members, 1945 (shown with today's borders)"]]); },
  pop() { clearMap(); const g = [[], [], [], [], []];
    Object.values(D.facts).forEach(f => { if (!f.pop) return; const p = f.pop; g[p > 2e8 ? 4 : p > 1e8 ? 3 : p > 5e7 ? 2 : p > 1e7 ? 1 : 0].push(f.c3); });
    colorGroups([[g[0], "var(--tag)"], [g[1], "var(--d1)"], [g[2], "var(--d2)"], [g[3], "var(--d3)"], [g[4], "var(--d4)"]], {fly: "world", dim: false});
    legend([["--d4", "Over 200 million"], ["--d3", "100–200 million"], ["--d2", "50–100 million"], ["--d1", "10–50 million"], ["--tag", "Under 10 million"]]); },
  heart() { clearMap(); colorGroups([[["RUS","KAZ","UZB","TKM","KGZ","TJK","MNG"], "var(--sel)"],
    [["PRT","ESP","FRA","BEL","NLD","DEU","DNK","ITA","CHE","AUT","POL","CZE","GRC","TUR","SYR","IRQ","IRN","SAU","JOR","ISR","LBN","PAK","AFG","IND","BGD","MMR","THA","VNM","KHM","LAO","MYS","CHN","KOR","PRK"], "var(--c-eu)"],
    [["GBR","JPN","IRL","LKA","PHL","IDN"], "var(--nb)"]], {fly: "world"});
    legend([["--sel", "Mackinder's Heartland (approx.)"], ["--c-eu", "Spykman's Rimland (approx.)"], ["--nb", "Offshore islands"]]); },
  buffers() { clearMap(); colorGroups([[["AFG","MNG","NPL","BTN","BEL","URY"], "var(--sel)"]], {fly: "world"}); legend([["--sel", "Classic buffer states"]]);
    setPins([pin("Wakhan Corridor", [72.5, 37])]); },
  cold() { clearMap(); colorGroups([[["USA","CAN","GBR","FRA","ITA","BEL","NLD","LUX","DNK","NOR","ISL","PRT","GRC","TUR","ESP"], "var(--c-eu)"], [[...SOVIET, "POL","CZE","SVK","HUN","ROU","BGR","ALB"], "var(--miss)"], [["DEU"], "var(--sel)"],
    [["IND","IDN","EGY","GHA","SRB","HRV","SVN","BIH","MNE","MKD","NGA"], "var(--nb)"]], {fly: "world"});
    legend([["--c-eu", "NATO by 1982"], ["--miss", "Soviet Union and Warsaw Pact"], ["--sel", "Germany: West in NATO, East in the Pact"], ["--nb", "Some leading non-aligned states"]]); },
  nam() { clearMap(); colorGroups([[["IND","EGY","IDN","GHA","SRB"], "var(--sel)"]], {fly: "world"}); legend([["--sel", "Countries of NAM's five founding leaders"]]);
    setPins([pin("Bandung 1955", [107.6, -6.92]), pin("Belgrade 1961", [20.46, 44.82])]); },
  income() { clearMap(); const m = {"High income: OECD": "--d4", "High income: nonOECD": "--d3", "Upper middle income": "--d2", "Lower middle income": "--d1", "Low income": "--nb"}, g = {};
    Object.values(D.facts).forEach(f => { if (f.inc && m[f.inc]) (g[f.inc] = g[f.inc] || []).push(f.c3); });
    colorGroups(Object.entries(m).map(([k, v]) => [g[k] || [], `var(${v})`]), {fly: "world", dim: false});
    legend([["--d4", "High income (OECD)"], ["--d3", "High income (other)"], ["--d2", "Upper middle"], ["--d1", "Lower middle"], ["--nb", "Low income"]]); }
};
ACT.pol = el => POL[el.dataset.v]();
MODES.politics = () => { clearMap(); resetView();
  const max = UN_GROWTH[UN_GROWTH.length - 1][1];
  setPanel(`<div class="eyebrow">International relations</div><h2>World politics on the map</h2>
  <p>The previous lessons asked <i>where</i> things are. This one asks how states deal with each other: who has power, who joins whom, and why. Each button colours the map.</p>

  <h3>1. A world of sovereign states</h3>
  <p>The map of neat coloured countries is a modern idea. The Peace of Westphalia (1648) is the usual symbol of a system in which each state rules its own territory and no higher authority rules over states. That system spread from Europe across the world, largely through empire and then decolonisation.</p>
  <p>When the United Nations was founded in 1945 it had 51 members. Africa had only four: Egypt, Ethiopia, Liberia and South Africa. Decolonisation nearly doubled the number by 1960:</p>
  <div>${UN_GROWTH.map(([y, n]) => `<div class="bar"><span>${y}</span><span class="track"><i style="width:${n / max * 100}%"></i></span><span class="n">${n}</span></div>`).join("")}</div>
  <div class="btnrow"><button class="btn primary" data-act="pol" data-v="founders">Show the 1945 founders</button></div>
  <p class="src">China's seat was held by the Republic of China (Taiwan) until 1971. The USSR, Czechoslovakia and Yugoslavia are shown with their main successor states.</p>

  <h3>2. What makes a state powerful</h3>
  <p>Textbooks list the elements of national power: geography (size, location, terrain, access to the sea), population, natural resources, economic strength, military force, and harder-to-measure things such as leadership, diplomacy and national morale. None works alone: a large population is a strength only if it is healthy, educated and employed; oil is power only if it can be shipped.</p>
  <div class="btnrow"><button class="btn" data-act="pol" data-v="pop">Map population</button></div>
  <p class="src">Population figures: Natural Earth, 2019 estimates. In that data, ${Object.values(D.facts).filter(f => f.pop > 2e8).length} countries are above 200 million: ${Object.values(D.facts).filter(f => f.pop > 2e8).sort((a, b) => b.pop - a.pop).map(f => esc(f.n)).join(", ")}.</p>

  <h3>3. Geopolitics: theories drawn on maps</h3>
  <p><b>Mahan</b> (1890) argued that sea power, navies and bases at chokepoints made Britain great. <b>Mackinder</b> (1904, 1919) answered that railways would let a land power in the Eurasian "Heartland" dominate: "Who rules the Heartland commands the World-Island." <b>Spykman</b> (1942–44) replied that the real prize was the "Rimland", the populous coastal crescent around it, which became the logic of US alliances in the Cold War.</p>
  <div class="btnrow"><button class="btn" data-act="pol" data-v="heart">Show Heartland and Rimland</button><button class="btn" data-mode-go="geo">Mahan's chokepoints →</button></div>
  <p><span class="kind">Read critically</span>These are theories, not laws. In Germany, Karl Haushofer bent such ideas into the Nazi claim to <i>Lebensraum</i> ("living space"). Geography constrains states; it does not decide what they do.</p>

  <h3>4. Balance of power, alliances and buffers</h3>
  <p>Realists see states as balancing against whoever becomes too strong: forming alliances and counter-alliances, arming, or keeping weak <b>buffer states</b> between rivals. Afghanistan's thin Wakhan Corridor was drawn in the 1890s so that the Russian Empire and British India would not touch. Mongolia sits between Russia and China; Nepal and Bhutan between China and India.</p>
  <div class="btnrow"><button class="btn" data-act="pol" data-v="buffers">Show buffer states</button><button class="btn" data-act="pol" data-v="cold">Show the Cold War blocs</button></div>
  <p>The Cold War (about 1947–1991) was a balance between two blocs led by the United States and the Soviet Union, held in check by nuclear deterrence. It ended with the fall of the Berlin Wall (1989) and the break-up of the Soviet Union into 15 states (1991).</p>

  <h3>5. Non-alignment and the Global South</h3>
  <p>Newly independent states refused to be pawns of either bloc. The Asian–African Conference at Bandung, Indonesia (1955) brought 29 countries together; the first Non-Aligned Movement summit met in Belgrade in 1961 with 25 members, led by Nehru (India), Nasser (Egypt), Tito (Yugoslavia), Sukarno (Indonesia) and Nkrumah (Ghana). NAM now has about 120 members, Nigeria among them.</p>
  <div class="btnrow"><button class="btn" data-act="pol" data-v="nam">Show NAM's founders</button></div>

  <h3>6. Today's clubs and alliances</h3>
  <p>Tap a group to colour its members. Overlaps are the point: Nigeria is in the AU, ECOWAS, OPEC, the Commonwealth and NAM, and is a BRICS partner.</p>
  <div class="chips" id="blocchips">${Object.entries(BLOC9).map(([k, b]) => `<button class="chip" data-act="bloc9" data-b="${k}">${esc(b.n)}</button>`).join("")}</div>
  <div id="blocinfo9" class="note">Choose a group.</div>
  <p class="src">Memberships checked in October 2026. Groups admit, suspend and lose members, so check the latest before relying on a list.</p>

  <h3>7. Four lenses on the same map</h3>
  <p>International Relations has competing theories. Each makes some maps look important and others irrelevant.</p>
  <ul><li><b>Realism</b> (Carr, Morgenthau, Waltz): states seek power and security in a world with no government above them. Look at nuclear weapons and the veto. <button class="chip" data-act="bloc9" data-b="NUKE">Nuclear map</button></li>
  <li><b>Liberalism</b>: trade, institutions and democracy make cooperation pay. Look at the EU and the AU. <button class="chip" data-act="bloc9" data-b="EU">EU map</button></li>
  <li><b>Marxist and world-systems theory</b> (Wallerstein): a wealthy "core" draws profit from a poorer "periphery". Look at income. <button class="chip" data-act="pol" data-v="income">Income map</button></li>
  <li><b>Constructivism</b> (Wendt): interests come from ideas and identities, so "anarchy is what states make of it". Look at self-chosen groups like NAM and BRICS, which share identity more than rules.</li></ul>
  <p><span class="kind">Interpretation</span>None of the lenses is complete. Realism predicts the Security Council's deadlock well and the EU's existence badly; world-systems theory explains Nigeria's dependence on crude exports, but not South Korea's rise from the periphery. Using more than one is the habit to build.</p>
  <p class="src">Income groups: World Bank classes as recorded by Natural Earth, several years old.</p>
  ${SRC_BOOKS}
  <div class="btnrow"><button class="btn primary" data-mode-go="quiz">Test yourself: Blocs and powers →</button></div>`); };

/* ===== new games ===== */
const HIST_PLACES = [["Uruk", "IRQ", "an early Mesopotamian city where writing developed"], ["Mohenjo-daro", "PAK", "a planned city of the Indus civilisation"], ["Harappa", "PAK", "the Indus city that gave the civilisation its name"], ["Anyang", "CHN", "the last capital of the Shang"],
  ["Memphis", "EGY", "the capital of early united Egypt"], ["Carthage", "TUN", "the Phoenician city that fought Rome"], ["Tyre", "LBN", "a Phoenician port"], ["Athens", "GRC", "a Greek city-state"], ["Alexandria", "EGY", "Alexander's city of learning, founded 331 BC"],
  ["Timbuktu", "MLI", "a centre of trade and scholarship in the Mali and Songhai empires"], ["Gao", "MLI", "the capital of the Songhai empire"], ["Kano", "NGA", "a Hausa trading city on the Saharan routes"], ["Ife", "NGA", "a Yoruba city famous for its bronze and terracotta heads"], ["Benin City", "NGA", "the capital of the Kingdom of Benin"],
  ["Great Zimbabwe", "ZWE", "a stone city that traded gold to the coast"], ["Kilwa", "TZA", "a Swahili trading port"], ["Aksum", "ETH", "an early Christian kingdom"], ["Karakorum", "MNG", "the Mongol capital"], ["Calicut", "IND", "where Vasco da Gama landed in 1498"],
  ["Cusco", "PER", "the Inca capital"], ["Tenochtitlan", "MEX", "the Aztec capital, now under Mexico City"], ["Bandung", "IDN", "the 1955 Asian–African Conference"], ["Mecca", "SAU", "where Islam began"], ["Bodh Gaya", "IND", "where the Buddha is said to have reached enlightenment"],
  ["Jebel Irhoud", "MAR", "the site of the oldest known Homo sapiens fossils"], ["Monte Verde", "CHL", "an early site of people in the Americas"], ["Madjedbebe", "AUS", "one of the oldest sites of people in Australia"], ["Sijilmasa", "MAR", "a caravan town on the northern edge of the Sahara"], ["Mogadishu", "SOM", "a Swahili and Somali trading port"], ["Lalibela", "ETH", "a town of churches carved from rock"]];
const BLOC_Q = () => [["NATO", NATO_32], ["the European Union", BLOC9.EU.groups[0][0]], ["ASEAN", BLOC9.ASEAN.groups[0][0]], ["OPEC", BLOC9.OPEC.groups[0][0]], ["the Shanghai Cooperation Organisation", BLOC9.SCO.groups[0][0]], ["ECOWAS", ECOWAS], ["the Alliance of Sahel States", AES], ["BRICS (as a full member)", BLOC9.BRICS.groups[1][0]], ["the UN Security Council's permanent five", BLOC9.UNSC.groups[0][0]], ["the nine nuclear-armed states", ["USA","RUS","GBR","FRA","CHN","IND","PAK","PRK","ISR"]]];
Object.assign(GAMES, {
  places: { name: "Where history happened", desc: "Place famous historical sites in today's countries.", gen(scope) {
    const pool = HIST_PLACES.filter(([, c]) => k3(c) && (scope !== "Africa" || byKey.get(k3(c)).reg === "Africa")), [p, c, d] = shuffle(pool)[0], k = k3(c);
    const all = gamePool(scope), opts = shuffle([k, ...pickDistractors(k, 3, all, (a, b) => a.sub === b.sub)]);
    return {q: `In which country today is <b>${esc(p)}</b>?`, opts: opts.map(nameOf), a: opts.indexOf(k), why: `${p}, ${d}, is in today's ${nameOf(k)}.`, show: k}; } },
  blocs: { name: "Blocs and powers", desc: "Who belongs to which club? From the World politics lesson.", gen(scope) {
    let qs = BLOC_Q(); if (scope === "Africa") qs = qs.filter(([n, l]) => l.some(c => k3(c) && byKey.get(k3(c)).reg === "Africa"));
    const [name, list] = shuffle(qs)[0], inAfr = c => k3(c) && (scope !== "Africa" || byKey.get(k3(c)).reg === "Africa");
    const mem = shuffle(list.filter(inAfr))[0], k = k3(mem), set = new Set(list);
    const pool = gamePool(scope).filter(x => !set.has(byKey.get(x).c3)), f = byKey.get(k);
    const near = shuffle(pool.filter(x => byKey.get(x).reg === f.reg)), opts = shuffle([k, ...near.slice(0, 3)]);
    return {q: `Which of these is in <b>${esc(name)}</b>?`, opts: opts.map(nameOf), a: opts.indexOf(k), why: `${f.n} is in ${name}. The other three are not.`, show: k}; } }
});
