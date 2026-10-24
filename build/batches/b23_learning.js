/* ---------- batch 23: lesson checks that teach when you miss ----------
   A wrong answer now says which option you chose, why that option is wrong where a note exists, the
   explanation of the right answer, and a link back to the part of the lesson that covers it.
   Questions whose answers come from the data take them from the registry, so they stay true when it updates. */
const QB_NOTES = {
  learn1: [null, "Ice is not drawn bigger: the size comes from the projection, not the surface.", "Mercator does not shrink the tropics; they are its least distorted part.", "They are not: Africa is far larger."],
  learn2: ["Far too small: Mercator makes them look similar, but Africa is much bigger.", "Still far short of the real ratio.", null, "Too big: that would make Africa larger than all of Asia and Europe together."],
  learn3: ["1° is about 4 minutes of time, not an hour.", null, "24 is the number of hours in a day, not degrees per hour.", "30° would be two hours."],
  learn4: [null, "Lagos is east of the Prime Meridian, at about 3.4° E.", "Lagos is north of the Equator, at about 6.5° N.", "Lagos is north of the Equator and east of the Prime Meridian."],
  learn5: [null, "Routes can cross the Sahara; the curve comes from the shape of the Earth.", "Winds change flight times, but the curve on the map is geometry.", "Maps do not add curves on purpose: a straight line on a globe looks curved when the globe is flattened."],
  reg3: [null, "Afro-Eurasia joins Africa too.", "The 'World-Island' is Mackinder's name for Afro-Eurasia, a geopolitical idea.", "Asia Minor is the Anatolian peninsula, today's Turkey."],
  reg4: [null, "Australasia usually means only Australia, New Zealand and nearby islands.", "Polynesia is one part of the Pacific islands.", "South-East Asia is a region of Asia."],
  afr1: [null, "There is no 'Savanna Rift'; the Rift Valley is in East Africa.", "The Maghreb is north-west Africa, north of the Sahara.", "The Kalahari is a desert in southern Africa."],
  afr2: [null, "The Niger Delta has mangrove and swamp forest, far smaller than the Congo Basin.", "The Ethiopian Highlands are mostly high plateau.", "Madagascar has rainforest on its east coast, but far less."],
  ng1: [null, "Onitsha is downstream, on the combined river.", "Makurdi is on the Benue, upstream of the meeting point.", "Jebba is on the Niger, upstream of the meeting point."],
  ng2: ["Niger's border is long, but Cameroon's is longer.", null, "Benin's border is much shorter.", "Chad's is the shortest of all."],
  ng3: ["Niger has a long land border with Nigeria.", "Cameroon has Nigeria's longest land border.", null, "Benin borders Nigeria on land, in the west."],
  ng4: [null, "Sahel savanna is the driest band, in the far north-east.", "Mangrove swamp is on the coast, south of the rainforest.", "Sudan savanna comes after the Guinea savanna, further north."],
  ng5: [null, "South South is the Niger Delta and nearby coastal states.", "North Central is the middle belt, around the FCT.", "South East is Abia, Anambra, Ebonyi, Enugu and Imo."],
  ngh1: [null, "Ahmadu Bello was Premier of the Northern Region in the 1950s and 1960s.", "Mansa Musa ruled Mali in the 14th century.", "Jaja of Opobo was a 19th-century Niger Delta trader-king."],
  ngh2: ["1900 is when Britain took over the protectorates from the Royal Niger Company.", null, "1946 brought the Richards Constitution and the regions.", "1960 is independence."],
  ngh4: ["Before 1967 there were four regions; Gowon replaced them with more states than six.", null, "19 states came in 1976.", "21 states came in 1987."],
  ngh5: ["29 May 1999 is when the Fourth Republic began.", "1 October 1979 began the Second Republic.", null, "15 January 1966 was the date of the first military coup."],
  ngh6: [null, "Soyinka wrote The Open Sore of a Continent (1996).", "Achebe wrote The Trouble with Nigeria (1983).", "Azikiwe led the NCNC; the phrase is Awolowo's."],
  hs2: ["Too small: the land bridges that early people walked across would have stayed under water.", null, "Too large: that is deeper than the edges of the continental shelves.", "Sea level was lower, because so much water was locked in ice sheets."],
  hs3: ["Maize was first farmed in Mexico.", "Potato was first farmed in the Andes.", null, "Wheat was first farmed in the Fertile Crescent."],
  hm3: ["1945 is the end of the Second World War and the founding of the UN.", "1957 is Ghana's independence, the first in sub-Saharan Africa.", null, "1994 is the end of apartheid in South Africa."],
  bd2: [null, "That was rejected as a recipe for endless wars.", "No: borders were not put to referendums.", "Some leaders hoped for federations, but the OAU chose the inherited borders."],
  bd3: [null, "The southern part voted to join Cameroon.", "Chad was not on the ballot.", "Ghana was not on the ballot."],
  bd4: [null, "The Yalu River is Korea's border with China.", "The 49th parallel is much of the US–Canada border.", "The Tropic of Cancer runs far to the south of Korea."],
  cp1: [null, "Bab el-Mandeb links the Red Sea and the Gulf of Aden.", "Malacca links the Indian Ocean and the South China Sea.", "Gibraltar links the Mediterranean and the Atlantic."],
  cp3: [null, "Mombasa serves Kenya, Uganda and countries beyond.", "Port Sudan is Sudan's main port.", "Berbera, in Somaliland, is a growing alternative, but Djibouti handles most."],
  cp4: [null, "Cape Horn is the tip of South America.", "Arctic routes are seasonal and do not connect Asia and Europe this way.", "Gibraltar is part of the Suez route, not an alternative to it."],
  wp2: [null, "Sea power was Mahan's idea.", "Lebensraum was a German expansionist idea.", "The domino theory was a Cold War idea about communism spreading."],
  wp5: [null, "Africa is a wider circle, after the neighbours and West Africa.", "The great powers are in the outer circles.", "The Commonwealth is in the outer circles."],
  wp6: [null, "Realism focuses on power and security among states.", "Constructivism stresses ideas and identities.", "Liberal institutionalism stresses cooperation through institutions."],
  mo2: [null, "The CFA francs have never been pegged to the dollar.", "Not to sterling.", "Not to gold: they are pegged to the euro, with France as guarantor."],
  mo4: [null, "Output did not halve; it grew when measured in naira.", "Oil is still part of GDP.", "The population grew."],
  mo6: [null, "Tulip mania is a different Dutch story, about speculation.", "That describes inflation from printing money.", "No: the name comes from the Netherlands' gas boom of the 1960s."]
};
QB.forEach(q => { if (QB_NOTES[q.id]) q.notes = QB_NOTES[q.id]; });
/* anchors the Nigeria rewrite renamed */
["ng6", "ng7"].forEach(id => { const q = QBY(id); if (q && q.at === "Poverty by state") q.at = "Many Nigerias"; });
/* answers that come from the data */
function bindQB() {
  const w = ival("gdp_growth_26", "WORLD"), q7 = QBY("mo7");
  if (q7 && w != null) { q7.o[q7.a] = (+w).toFixed(1) + "%"; const w7 = ival("gdp_growth_25", "WORLD");
    q7.why = `${(+w).toFixed(1)}% in 2026 (IMF, ${SOURCES[IND.gdp_growth_26.src].edition || "World Economic Outlook"})${w7 != null ? `, after ${(+w7).toFixed(1)}% in 2025` : ""}.`; }
  const q8 = QBY("mo8"), oil = NOW().energy && NOW().energy.oil;
  if (q8 && oil) { const top = Object.entries(oil).sort((a, b) => b[1].sh - a[1].sh)[0], name = nameOf(k3(top[0]));
    const i = q8.o.indexOf(name); if (i >= 0) q8.a = i; else q8.o[q8.a] = name; }
  const q6 = QBY("ng6"), nat = ival("mpi_nat", "NGA");
  if (q6 && nat != null) q6.o[q6.a] = `About ${Math.round(nat)}%`;
  const q7s = QBY("ng7"), mp = NOW().mpi;
  if (q7s && mp) { const s = Object.entries(mp).sort((a, b) => b[1].h - a[1].h), top = s[0][0], low = s[s.length - 1][0];
    const i = q7s.o.indexOf(top); if (i >= 0) q7s.a = i; else q7s.o[q7s.a] = top;
    const most = Object.entries(mp).sort((a, b) => b[1].poor - a[1].poor)[0][0];
    q7s.why = `${top}, about ${Math.round(mp[top].h)}%. ${low} was lowest at ${Math.round(mp[low].h)}%. ${most} had the largest number of poor people.`; } }
const plApplyQB = plApply;
plApply = function () { plApplyQB(); bindQB(); };
/* runQs: what you chose, why it is wrong, and where to re-read */
const runQsBase = runQs;
runQs = function (items, ctx) { runQsBase(items, ctx);
  const teach = b => { const qtext = (panel.querySelector(".q") || {}).textContent, q = QB.find(x => x.q === qtext), why = $("#why");
    if (!q || !why || +b.dataset.j === q.a || why.dataset.taught) return; why.dataset.taught = 1;
    const note = q.notes && q.notes[+b.dataset.j], p = why.querySelector("p");
    if (p) p.innerHTML = `<b>Not quite.</b> You chose “${esc(q.o[+b.dataset.j])}”.${note ? " " + esc(note) : ""} ${esc(q.why)}`;
    if (q.at && typeof whereBtn === "function" && $("#nextq")) $("#nextq").insertAdjacentHTML("beforebegin", whereBtn(q) + " "); };
  const hook = () => panel.querySelectorAll(".opts button").forEach(b => b.addEventListener("click", () => setTimeout(() => { teach(b);
    const nx = $("#nextq"); if (nx && !nx.dataset.hooked) { nx.dataset.hooked = 1; nx.addEventListener("click", () => setTimeout(hook, 0)); } }, 0)));
  hook(); };
