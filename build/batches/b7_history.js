/* ---------- batch 7: territories ---------- */
Object.assign(PROFILES, {
GRL: { phys: "The world's largest island, about 80% covered by an ice sheet up to 3 km thick. People live along the ice-free south-west and west coasts.",
  people: "Most people are Inuit; Greenlandic (Kalaallisut) is the official language and Danish is widely used. Nuuk is the capital.",
  hist: "Norse settlers arrived around 985; Denmark colonised it from 1721. Home rule came in 1979 and wider self-government in 2009, which recognises a right to independence. It is part of the Kingdom of Denmark.",
  econ: "Fishing (especially shrimp and halibut) and a yearly grant from Denmark; minerals and rare earths are being explored.",
  why: "It sits between North America and Europe on the Arctic route; the US runs the Pituffik Space Base in the north-west. US leaders have floated acquiring it, most recently in 2025, which Greenland and Denmark rejected.",
  memo: "The giant white island north-east of Canada; on Mercator it looks as big as Africa, but Africa is 14 times larger." },
PRI: { phys: "A mountainous Caribbean island east of Hispaniola, plus smaller islands.", people: "Spanish and English are official; Puerto Ricans are US citizens.",
  hist: "Spanish for four centuries, ceded to the US in 1898 after the Spanish–American War. Residents became US citizens in 1917 but cannot vote for president while living on the island. Hurricane Maria in 2017 caused enormous damage.",
  econ: "Pharmaceuticals, medical devices and tourism.", why: "Its status (territory, statehood or independence) has been put to several votes without a final decision.", memo: "The island east of the Dominican Republic." },
HKG: { phys: "Hong Kong Island, the Kowloon peninsula and the New Territories, with over 200 islands at the mouth of the Pearl River.", people: "Cantonese is the main spoken language; Chinese and English are official.",
  hist: "Hong Kong Island became British in 1842 after the First Opium War, Kowloon in 1860, and the New Territories were leased for 99 years in 1898. China resumed sovereignty in 1997 under 'one country, two systems'; a national security law was imposed in 2020.",
  econ: "One of the world's main financial centres and container ports.", why: "It has long been China's gateway to global finance.", memo: "The cluster at the mouth of the Pearl River, next to Shenzhen." },
MAC: { phys: "A small peninsula and two islands joined by reclaimed land, across the Pearl River estuary from Hong Kong.", people: "Cantonese is the main language; Chinese and Portuguese are official.",
  hist: "Portuguese from the mid-1500s, the first and last European colony in China. Returned to China in 1999 as a special administrative region.",
  econ: "The world's largest gambling centre by revenue.", why: "Its Portuguese past makes it China's link to Portuguese-speaking countries, including Angola and Mozambique.", memo: "The tiny piece west of Hong Kong across the estuary." },
ESH: { phys: "Flat, rocky desert on the Atlantic coast between Morocco and Mauritania; very thinly populated.", people: "Sahrawi people speak Hassaniya Arabic; tens of thousands live in refugee camps near Tindouf in Algeria.",
  hist: "Spanish Sahara until 1975. Morocco took most of it after the 'Green March' and fought the Polisario Front until a 1991 ceasefire, which broke down in 2020. A UN-promised referendum on independence has never been held. Morocco built a long sand wall (berm) that splits the territory. The US recognised Moroccan sovereignty in 2020; most countries have not.",
  econ: "Phosphates from Bou Craa and rich Atlantic fisheries.", why: "Its status divides African and international diplomacy.", memo: "The flat strip on the Atlantic between Morocco and Mauritania, drawn with a dashed border on many maps." },
NCL: { phys: "A long main island (Grande Terre) and smaller islands in the south-west Pacific, east of Australia, surrounded by one of the world's largest lagoons.", people: "French is official; the Indigenous Kanak people make up about four in ten residents.",
  hist: "French since 1853. Independence referendums in 2018, 2020 and 2021 all chose to stay French; the last was boycotted by most pro-independence voters. Riots broke out in 2024 over changes to voting rules.",
  econ: "Nickel, of which it holds a large share of the world's reserves.", why: "A French foothold in the Pacific.", memo: "The long thin island east of Australia." },
FLK: { phys: "Two main islands and hundreds of small ones in the South Atlantic, about 500 km east of Argentina's coast.", people: "English-speaking; a small population.",
  hist: "British since 1833. Argentina, which calls them the Malvinas, invaded in 1982 and was defeated by Britain. In a 2013 referendum almost all residents voted to remain British.",
  econ: "Fishing licences, sheep farming and tourism.", why: "The dispute shapes Britain–Argentina relations and claims towards Antarctica.", memo: "The islands off the tip of Argentina." },
PYF: { phys: "118 islands and atolls spread over an area of the South Pacific as big as Europe, including Tahiti and Bora Bora.", people: "French and Tahitian are spoken.",
  hist: "A French overseas collectivity. France tested nuclear weapons at Moruroa and Fangataufa atolls from 1966 to 1996.", econ: "Tourism, black pearls and French public spending.", why: "It gives France a huge Pacific maritime zone.", memo: "The scatter of islands in the middle of the South Pacific, east of Samoa." },
BMU: { phys: "A small group of islands in the North Atlantic, about 1,000 km east of North Carolina.", people: "English-speaking.",
  hist: "British since 1612, now a British overseas territory.", econ: "One of the world's biggest insurance and reinsurance centres.", why: "A finance hub far out in the Atlantic.", memo: "The lone dot in the Atlantic off the US east coast." },
GUM: { phys: "The largest and southernmost of the Mariana Islands in the western Pacific.", people: "English and Chamorro are official; the Chamorro are the Indigenous people.",
  hist: "Spanish until 1898, then American; occupied by Japan from 1941 to 1944. Residents are US citizens.", econ: "US military bases and tourism.", why: "A key US military base within reach of East Asia.", memo: "The island south of Japan, east of the Philippines." },
ATA: { phys: "The coldest, driest and windiest continent, larger than Europe. About 98% is covered by ice that holds roughly 90% of the world's ice and about 70% of its fresh water. The Transantarctic Mountains divide East and West Antarctica.",
  people: "No permanent population; a few thousand scientists live at research stations in summer.",
  hist: "First sighted in 1820. Seven countries claim territory (Argentina, Australia, Chile, France, New Zealand, Norway and the UK). The 1959 Antarctic Treaty sets those claims aside, bans military activity and mining, and reserves the continent for science.",
  econ: "Science and tourism; mining is banned.", why: "Its ice sheet controls global sea levels: if it melted, the oceans would rise by tens of metres.", memo: "The whole bottom of the map, around the South Pole." }
});

/* ---------- batch 7: history through maps ---------- */
const ERAS = {
  "200": "Around AD 200 the <b>Roman Empire</b> ringed the Mediterranean, from Britain to Egypt. Parthian Persia ruled Iran and Mesopotamia, and Han China was near its end. In Africa, Aksum (in today's Ethiopia and Eritrea) and Meroë (in Sudan) were trading states.",
  "1500": "In 1500 the <b>Songhai Empire</b> controlled the Niger bend in West Africa; the kingdoms of Benin and Oyo were powers in today's Nigeria. The Ottomans were expanding, Ming China was strong, and the Inca and Aztec empires had not yet met the Spanish. Portugal had just reached India by sea (1498).",
  "1815": "After Napoleon's defeat, the Congress of Vienna redrew Europe. Spain's American colonies were fighting for independence. In West Africa the <b>Sokoto Caliphate</b>, founded in 1804, ruled much of today's northern Nigeria. Europeans in Africa held mostly coastal forts, plus the Cape Colony.",
  "1880": "On the eve of the 'Scramble for Africa', European powers held mainly coasts: France in Algeria and Senegal, Britain at the Cape, Lagos and the Gold Coast, Portugal in Angola and Mozambique. Most of the interior was ruled by African states.",
  "1914": "By 1914 the partition was almost complete: only <b>Ethiopia and Liberia</b> remained independent in Africa. European empires were at their largest just as the First World War began.",
  "1938": "After the First World War, Germany's colonies were handed to Britain, France, Belgium and South Africa as League of Nations mandates. Italy had invaded Ethiopia in 1935–1936. The Soviet Union and Japan's expanding empire dominated Asia.",
  "1960": "1960 is called the <b>Year of Africa</b>: 17 African countries became independent that year, Nigeria among them. India (1947) and Indonesia (1949) had already left colonial rule.",
  "1994": "Three years after the Soviet Union dissolved, 15 new states filled northern Asia and Eastern Europe. Eritrea had just become independent (1993), South Africa held its first democratic election, and Yugoslavia was breaking apart."
};
const HPAL = ["#E2B657","#8DB0D6","#E39A8B","#96C394","#C4A0D2","#74BDB9","#D9824B","#B8B07A","#E7A3C4","#9FA8DA"];
const hcol = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return HPAL[h % HPAL.length]; };
G.hist = root.insert("g", ".lakes").attr("class", "hist");
G.histlabels = root.append("g").attr("class", "labels histl");
function showEra(y) {
  G.hist.selectAll("*").remove(); G.histlabels.selectAll("*").remove();
  G.countries.selectAll("path").classed("dim", false);
  document.querySelectorAll("[data-act='era']").forEach(b => b.classList.toggle("on", b.dataset.y === y));
  if (y === "now") { $("#erainfo").innerHTML = "Today's borders, from Natural Earth. Compare them with any year above."; return; }
  const t = D.hist[y], fs = topojson.feature(t, Object.values(t.objects)[0]).features.filter(f => f.geometry);
  G.hist.selectAll("path").data(fs).join("path").attr("class", "hpoly").style("fill", d => hcol(d.properties.SUBJECTO || d.properties.NAME))
    .on("click", (ev, d) => { ev.stopPropagation(); const p = d.properties, prec = ["", "approximate", "moderately precise", "precise"][p.BORDERPRECISION] || "unknown";
      $("#erainfo").innerHTML = `<b>${esc(p.NAME || "Unnamed area")}</b>${p.SUBJECTO && p.SUBJECTO !== p.NAME ? ` · part of ${esc(p.SUBJECTO)}` : ""}<br><span class="src">Border precision in the source: ${prec}.</span><p>${ERAS[y]}</p>`; })
    .append("title").text(d => d.properties.NAME || "");
  const lab = fs.filter(f => f.properties.NAME).map(f => ({c: labelPoint(f), t: f.properties.NAME, a: d3.geoArea(f)})).filter(d => d.a < 2 * Math.PI).sort((a, b) => b.a - a.a).slice(0, 70)
    .map(d => ({...d, minz: d.a > .02 ? 0 : d.a > .004 ? 2 : 4}));
  G.histlabels.selectAll("text").data(lab).join("text").text(d => d.t);
  render(); $("#erainfo").innerHTML = `<p>${ERAS[y]}</p><p class="src">Tap any area to see its name. Coloured by ruling power.</p>`; }
function historyMode() {
  resetView();
  setPanel(`<div class="eyebrow">Stage 6 · History on the map</div><h2>The world map through time</h2>
  <p>Today's map is the latest frame in a long film. Pick a year to replace the modern borders with a reconstruction of that time.</p>
  <div class="chips">${Object.keys(ERAS).map(y => `<button class="chip" data-act="era" data-y="${y}">${y === "200" ? "AD 200" : y}</button>`).join("")}<button class="chip" data-act="era" data-y="now">Today</button></div>
  <div id="erainfo" class="note">Pick a year.</div>
  <div class="btnrow"><button class="btn" data-act="eraAfrica">Zoom to Africa</button><button class="btn" data-act="eraWorld">Whole world</button></div>
  <h3>How to read these maps</h3>
  <p>Historical borders were often vague: many states ruled people and trade routes rather than lines. These maps are <b>reconstructions</b>, and the source marks each border as approximate, moderately precise or precise. Use them to see the big picture, not exact lines.</p>
  <p><button class="btn primary" data-act="game" data-g="ruled" data-scope="Africa">Play: Who ruled it in 1914?</button></p>
  <p class="src">Historical boundaries: historical-basemaps by André Ourednik (GPL-3.0), simplified. The dataset has known errors at this scale; era summaries are written for this atlas.</p>`);
  showEra("1914"); flyToKeys(Object.keys(D.facts).filter(k => D.facts[k].reg === "Africa" && D.facts[k].un), {pad: .95, maxk: 4}); }
ACT.era = el => showEra(el.dataset.y);
ACT.eraAfrica = () => flyToKeys(Object.keys(D.facts).filter(k => D.facts[k].reg === "Africa" && D.facts[k].un), {pad: .95, maxk: 4});
ACT.eraWorld = () => resetView();

/* Who ruled it in 1914? Answer key from the historical record (not from the map dataset) */
const RULED1914 = {
  Britain: ["NGA","GHA","SLE","GMB","KEN","UGA","SDN","SSD","EGY","ZAF","ZWE","ZMB","MWI","BWA","LSO","SWZ","MUS","SYC"],
  France: ["SEN","MLI","BFA","NER","GIN","CIV","BEN","MRT","DZA","TUN","MAR","TCD","CAF","COG","GAB","MDG","COM","DJI"],
  Germany: ["TGO","CMR","NAM","TZA","RWA","BDI"], Belgium: ["COD"], Portugal: ["AGO","MOZ","GNB","CPV","STP"],
  Italy: ["LBY","ERI","SOM"], Spain: ["GNQ"], "Independent": ["ETH","LBR"] };
const RULED_NOTE = {EGY: "Egypt was under British occupation and became a formal British protectorate in December 1914.", SDN: "Sudan was the Anglo-Egyptian Sudan, run by Britain in name jointly with Egypt.", SSD: "Today's South Sudan was the southern part of the Anglo-Egyptian Sudan.",
  MAR: "Most of Morocco became a French protectorate in 1912; Spain held a zone in the north.", TUN: "Tunisia was a French protectorate from 1881.", ZAF: "The Union of South Africa (1910) was a self-governing British dominion.",
  SOM: "Most of Somalia was Italian Somaliland; the north was British Somaliland.", RWA: "Rwanda was part of German East Africa, passing to Belgium after the war.", BDI: "Burundi was part of German East Africa, passing to Belgium after the war.",
  CMR: "Kamerun was German; after the war it was split between France and Britain.", TGO: "Togoland was German; after the war it was split between Britain and France.", NAM: "German South West Africa passed to South African rule after the war.",
  TZA: "Mainland Tanzania was German East Africa; Zanzibar was a British protectorate.", ETH: "Ethiopia (Abyssinia) defeated Italy at Adwa in 1896 and stayed independent.", LBR: "Liberia, founded by freed Black Americans, stayed independent.",
  NGA: "Northern and Southern Nigeria were joined into one British colony in January 1914.", GHA: "Ghana was the British Gold Coast colony.", COD: "The Belgian Congo, run by Belgium since 1908 after King Leopold's Congo Free State."};
GAMES.ruled = { name: "Who ruled it in 1914?", desc: "Colonial Africa on the eve of the First World War.", only: "Africa", gen() {
  const all = Object.entries(RULED1914).flatMap(([r, cs]) => cs.map(c => [c, r])).filter(([c]) => byC3.has(c) && featByKey.has(k3(c)));
  const [c3, ruler] = shuffle(all)[0], k = k3(c3);
  const opts = shuffle([ruler, ...shuffle(Object.keys(RULED1914).filter(r => r !== ruler)).slice(0, 3)]);
  if (S.mode !== "history" && D.hist) { showEraSilent("1914"); }
  return {q: `In 1914, who ruled the land that is now <b>${esc(nameOf(k))}</b>?`, opts, a: opts.indexOf(ruler), why: RULED_NOTE[c3] || `In 1914 it was ruled by ${ruler === "Independent" ? "no colonial power" : ruler}.`, show: k}; } };
function showEraSilent(y) { if (!$("#erainfo")) { const d = document.createElement("div"); d.id = "erainfo"; d.hidden = true; document.body.appendChild(d); } showEra(y); }
