/* ---------- batch 12: lesson checks and spaced review ----------
   Each lesson has a small bank of questions. A check draws 3; passing means 3 out of 3.
   Every answer is scheduled (a Leitner system): a correct answer moves the question up a box and it returns after
   1, 3, 7, 21, then 60 days; a wrong answer sends it back to the start and it returns tomorrow.
   Due questions from all lessons are mixed into one short daily review. */
const QB = [
 // Reading the map
 ["learn1", "learn", "On a Mercator map, why does Greenland look about as big as Africa?", ["Mercator stretches areas more the further a place is from the Equator", "Greenland is mostly ice, which maps draw larger", "Mercator shrinks Africa to fit the tropics", "The two really are about the same size"], 0, "Mercator keeps local shapes and directions but stretches area with distance from the Equator. Africa is about 14 times larger than Greenland.", "2. Projections"],
 ["learn2", "learn", "Roughly how many times larger than Greenland is Africa?", ["About 2 times", "About 5 times", "About 14 times", "About 40 times"], 2, "Africa covers about 30.3 million km², Greenland about 2.17 million km².", "2. Projections"],
 ["learn3", "learn", "Each hour of time difference corresponds to about how many degrees of longitude?", ["1°", "15°", "24°", "30°"], 1, "The Earth turns 360° in about 24 hours, so 360 ÷ 24 = 15° per hour.", "6. Scale"],
 ["learn4", "learn", "Lagos lies in which hemispheres?", ["Northern and Eastern", "Northern and Western", "Southern and Eastern", "Southern and Western"], 0, "Lagos is at about 6.5° N, 3.4° E: just north of the Equator and just east of the Prime Meridian.", "4. Lagos"],
 ["learn5", "learn", "Why does the shortest flight path from Lagos to New York look curved on a flat map?", ["It follows a great circle, the shortest path over a sphere", "Planes avoid flying over the Sahara", "Winds push planes north", "Flat maps add curves to show distance"], 0, "The shortest route on a sphere is a great circle; flattening the globe makes it look bent.", "4. Lagos"],
 // Continents & regions
 ["reg1", "regions", "Which continent has the most UN member states?", ["Asia", "Europe", "Africa", "North America"], 2, "Africa has 54 UN member states, more than any other continent.", "Continents and regions"],
 ["reg2", "regions", "Which continent model does this atlas use?", ["Five continents", "Six continents, with the Americas joined", "Seven continents", "Four continents, with Eurasia joined to Africa"], 2, "It uses the seven-continent model taught in Nigeria and much of the world, and notes that other models exist.", "Continents and regions"],
 ["reg3", "regions", "Some continent models join Europe and Asia into one continent called…", ["Eurasia", "Afro-Eurasia", "the World-Island", "Asia Minor"], 0, "Europe and Asia share one landmass, so some models treat them as Eurasia.", "Continents and regions"],
 ["reg4", "regions", "Australia, New Zealand and the Pacific islands are grouped as…", ["Oceania", "Australasia only", "Polynesia", "South-East Asia"], 0, "The atlas groups them as Oceania.", "Continents and regions"],
 // Africa
 ["afr1", "africa", "The semi-arid belt along the southern edge of the Sahara is called the…", ["Sahel", "Savanna Rift", "Maghreb", "Kalahari"], 0, "The Sahel crosses northern Nigeria, Niger, Chad and Sudan.", "The big physical picture"],
 ["afr2", "africa", "Where is the second-largest tropical rainforest on Earth?", ["The Congo Basin", "The Niger Delta", "The Ethiopian Highlands", "Madagascar"], 0, "The Congo Basin in Middle Africa, after the Amazon.", "The big physical picture"],
 ["afr3", "africa", "Which of the UN's five African regions has the most countries?", ["Western Africa", "Eastern Africa", "Northern Africa", "Southern Africa"], 1, "Eastern Africa has 20, Western Africa 17, Middle Africa 10, Northern Africa 7 and Southern Africa 5.", "Africa, region by region"],
 ["afr4", "africa", "The African Union's members are Africa's 54 UN member states plus…", ["the Sahrawi Arab Democratic Republic (Western Sahara)", "Somaliland", "the Canary Islands", "Saint Helena"], 0, "The AU admits the Sahrawi Republic, which Morocco disputes.", "Regional organisations"],
 ["afr5", "africa", "Which three states left ECOWAS in January 2025?", ["Burkina Faso, Mali and Niger", "Guinea, Mali and Chad", "Niger, Togo and Benin", "Senegal, Mali and Guinea"], 0, "They formed the Alliance of Sahel States.", "Regional organisations"],
 // Nigeria (geography)
 ["ng1", "nigeria", "Where do the Niger and Benue rivers meet?", ["Lokoja", "Onitsha", "Makurdi", "Jebba"], 0, "They meet at Lokoja in Kogi State, forming a 'Y' that splits Nigeria into three big parts.", "The Niger and the Benue"],
 ["ng2", "nigeria", "Nigeria's longest land border is with…", ["Niger", "Cameroon", "Benin", "Chad"], 1, "Cameroon, about 1,975 km. Niger is next at about 1,608 km.", "Neighbours"],
 ["ng3", "nigeria", "Which neighbour does Nigeria border only across Lake Chad?", ["Niger", "Cameroon", "Chad", "Benin"], 2, "The Nigeria–Chad border, about 85 km, lies inside Lake Chad.", "Neighbours"],
 ["ng4", "nigeria", "Travelling north from the coast, which vegetation band comes next after the rainforest?", ["Guinea savanna", "Sahel savanna", "Mangrove swamp", "Sudan savanna"], 0, "Mangrove and swamp, then rainforest, then Guinea savanna, Sudan savanna and Sahel savanna.", "From coast to Sahel"],
 ["ng5", "nigeria", "Ekiti, Lagos, Ogun, Ondo, Osun and Oyo make up which geopolitical zone?", ["South West", "South South", "North Central", "South East"], 0, "The South West zone.", "The six geopolitical zones"],
 // How Nigeria was made
 ["ngh1", "ngstory", "Who led the 1804 jihad that created the Sokoto Caliphate?", ["Usman dan Fodio", "Ahmadu Bello", "Mansa Musa", "Jaja of Opobo"], 0, "Usman dan Fodio's jihad overthrew the Hausa kings and created one of the largest states in 19th-century Africa.", {stop: 2}],
 ["ngh2", "ngstory", "In which year were the Northern and Southern Protectorates joined to form Nigeria?", ["1900", "1914", "1946", "1960"], 1, "Lugard amalgamated them on 1 January 1914.", {stop: 4}],
 ["ngh3", "ngstory", "The 1929 uprising against warrant chiefs in south-eastern Nigeria is known as…", ["the Aba Women's War", "the Ekumeku movement", "the Egba uprising", "the Iseyin revolt"], 0, "Thousands of women rose against warrant chiefs and feared taxes.", {stop: 4}],
 ["ngh4", "ngstory", "How many states did Gowon create in May 1967, replacing the four regions?", ["6", "12", "19", "21"], 1, "Twelve states, on 27 May 1967, three days before Biafra declared independence.", {stop: 6}],
 ["ngh5", "ngstory", "On what date was the presidential election held that Babangida later annulled?", ["29 May 1999", "1 October 1979", "12 June 1993", "15 January 1966"], 2, "M. K. O. Abiola's victory on 12 June 1993 was annulled.", {stop: 7}],
 ["ngh6", "ngstory", "Who wrote in 1947 that Nigeria was 'a mere geographical expression'?", ["Obafemi Awolowo", "Wole Soyinka", "Chinua Achebe", "Nnamdi Azikiwe"], 0, "Awolowo, in Path to Nigerian Freedom (1947), arguing for a federation of self-governing ethnic units.", {debate: 1}],
 // The human story on the map
 ["hs1", "story", "Where were the oldest known fossils of Homo sapiens found?", ["Jebel Irhoud, Morocco", "Olduvai Gorge, Tanzania", "Lascaux, France", "Flores, Indonesia"], 0, "About 300,000 years old.", {stop: 0}],
 ["hs2", "story", "At the height of the last Ice Age, sea level was roughly how much lower than today?", ["About 12 m", "About 120 m", "About 1,200 m", "It was higher than today"], 1, "About 120 m lower, exposing land bridges such as Beringia and Sundaland.", {stop: 1}],
 ["hs3", "story", "Which of these crops was first farmed in West Africa?", ["Maize", "Potato", "Yam", "Wheat"], 2, "Yams, pearl millet, sorghum, African rice, cowpeas and the oil palm came from West Africa; maize and potatoes from the Americas, wheat from the Fertile Crescent.", {stop: 2}],
 ["hs4", "story", "Which ruler passed through Cairo in 1324 with so much gold that he was remembered for it for generations?", ["Mansa Musa of Mali", "Sunni Ali of Songhai", "Usman dan Fodio", "Ezana of Aksum"], 0, "Mansa Musa, on pilgrimage to Mecca.", {stop: 6}],
 ["hs5", "story", "About how many Africans were forced onto Atlantic slave ships between 1501 and 1866?", ["About 1.2 million", "About 4 million", "About 12.5 million", "About 50 million"], 2, "The SlaveVoyages database estimates about 12.5 million embarked and about 10.7 million survived the crossing.", {stop: 10}],
 ["hs6", "story", "Which was the last large habitable land on Earth to be settled by people?", ["Madagascar", "Aotearoa New Zealand", "Hawaii", "Iceland"], 1, "Polynesian voyagers settled it around 1250–1300.", {stop: 7}],
 // History through maps
 ["hm1", "history", "By 1914, which two African states were still independent?", ["Ethiopia and Liberia", "Egypt and Morocco", "Ethiopia and Sudan", "Liberia and Ghana"], 0, "By 1914 the partition was almost complete; only Ethiopia and Liberia remained independent.", "The world map through time"],
 ["hm2", "history", "Why should the historical borders in this lesson be read as approximate?", ["They are reconstructions, and many states ruled people and trade routes rather than fixed lines", "They were drawn from satellite images", "They show only modern borders", "They were copied from one colonial map"], 0, "The source marks each border as approximate, moderately precise or precise.", "How to read these maps"],
 ["hm3", "history", "Which year is often called the 'Year of Africa' because 17 African countries became independent?", ["1945", "1957", "1960", "1994"], 2, "In 1960, 17 African countries gained independence, including Nigeria.", "The world map through time"],
 // How borders are made
 ["bd1", "borders", "Where did European powers agree rules for claiming African territory in 1884–85?", ["Berlin", "Paris", "London", "Brussels"], 0, "The Berlin Conference.", "The partition of Africa"],
 ["bd2", "borders", "In 1964 the Organisation of African Unity agreed that member states would…", ["respect the borders they inherited at independence", "redraw borders along ethnic lines", "hold referendums on every border", "merge into regional federations"], 0, "Most African borders have stayed put since, even where they divide communities.", "The partition of Africa"],
 ["bd3", "borders", "In 1961 the northern part of British Cameroons voted to join…", ["Nigeria", "Cameroon", "Chad", "Ghana"], 0, "The north joined Nigeria; the south joined Cameroon.", "Togoland and the Cameroons"],
 ["bd4", "borders", "In 1945 Korea was divided along…", ["the 38th parallel", "the Yalu River", "the 49th parallel", "the Tropic of Cancer"], 0, "The US and the Soviet Union divided it at 38° N; the Demilitarised Zone runs close to that line.", "The Korean Peninsula"],
 ["bd5", "borders", "The Gambia's borders mostly follow…", ["the valley of the Gambia River", "a line of latitude", "old kingdom boundaries", "a mountain range"], 0, "Britain and France agreed in 1889 on a border following the river valley.", "The Gambia"],
 // Chokepoints & landlocked states
 ["cp1", "geo", "Which strait is the only sea exit from the Persian Gulf?", ["Strait of Hormuz", "Bab el-Mandeb", "Strait of Malacca", "Strait of Gibraltar"], 0, "Hormuz, between Iran and Oman.", "Chokepoints and corridors"],
 ["cp2", "geo", "How many of the world's landlocked countries are in Africa?", ["6", "10", "16", "24"], 2, "16 of the world's 44.", "Landlocked countries"],
 ["cp3", "geo", "Through which port does landlocked Ethiopia handle most of its trade?", ["Djibouti", "Mombasa", "Port Sudan", "Berbera"], 0, "Djibouti, since Eritrea's independence in 1993 left Ethiopia without a coast.", "Landlocked countries"],
 ["cp4", "geo", "When the Red Sea route is unsafe, ships between Asia and Europe sail around…", ["the Cape of Good Hope", "Cape Horn", "the Arctic", "Gibraltar"], 0, "Round southern Africa, adding days to the voyage.", "Chokepoints and corridors"],
 ["cp5", "geo", "Niger's main routes to the sea run through…", ["Cotonou and Lagos", "Dakar and Abidjan", "Douala and Lagos", "Tema and Lomé only"], 0, "Cotonou (Benin) and Lagos (Nigeria).", "Landlocked countries"],
 // World politics
 ["wp1", "politics", "How many member states did the United Nations have when it was founded in 1945?", ["35", "51", "99", "193"], 1, "51, including only four African states: Egypt, Ethiopia, Liberia and South Africa.", "1. A world"],
 ["wp2", "politics", "Spykman's answer to Mackinder's 'Heartland' was the…", ["Rimland", "Sea power thesis", "Lebensraum", "Domino theory"], 0, "Spykman argued that the coastal crescent around the Heartland mattered more.", "3. Geopolitics"],
 ["wp3", "politics", "Afghanistan's Wakhan Corridor was drawn in the 1890s to keep apart…", ["the Russian Empire and British India", "China and the Soviet Union", "Iran and Pakistan", "the Ottoman and Persian empires"], 0, "A classic buffer: the two empires would not share a border.", "4. Balance"],
 ["wp4", "politics", "Which country left OPEC on 1 May 2026?", ["Nigeria", "Angola", "United Arab Emirates", "Venezuela"], 2, "The UAE left after a dispute over its production quota, during the Hormuz crisis.", "6. Today"],
 ["wp5", "politics", "In Nigeria's 'concentric circles' foreign policy, which circle comes first?", ["Nigeria's own security and its immediate neighbours", "The rest of Africa", "The great powers", "The Commonwealth"], 0, "Neighbours first, then West Africa, then Africa, then the world.", "8. Nigeria"],
 ["wp6", "politics", "Which theory describes a wealthy 'core' drawing profit from a poorer 'periphery'?", ["World-systems theory", "Realism", "Constructivism", "Liberal institutionalism"], 0, "Immanuel Wallerstein's world-systems theory.", "7. Four lenses"]
].map(([id, l, q, o, a, why, at]) => ({id, l, q, o, a, why, at}));
const QBY = id => QB.find(x => x.id === id);
const DAY = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
const BOX_DAYS = [1, 3, 7, 21, 60];
saved.srs = saved.srs || {}; saved.mastered = saved.mastered || {};
function grade(id, ok) { const r = saved.srs[id] || {b: -1, d: 0, w: 0};
  if (ok) { r.b = Math.min(r.b + 1, BOX_DAYS.length - 1); r.d = DAY() + BOX_DAYS[r.b]; } else { r.b = -1; r.d = DAY() + 1; r.w++; }
  saved.srs[id] = r; store.set(saved); return r; }
const dueItems = () => QB.filter(q => saved.srs[q.id] && saved.srs[q.id].d <= DAY());
const dueCount = () => dueItems().length;
function nextDue() { const ds = Object.values(saved.srs).map(r => r.d).filter(d => d > DAY()); return ds.length ? Math.min(...ds) : null; }
const whenTxt = d => { const n = d - DAY(); return n <= 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`; };
function lessonStatus(l) { const qs = QB.filter(q => q.l === l); if (!qs.length) return null;
  const due = qs.filter(q => saved.srs[q.id] && saved.srs[q.id].d <= DAY()).length;
  if (saved.mastered[l]) return due ? {k: "due", t: `Passed · ${due} to review`} : {k: "ok", t: "Passed"};
  if (qs.some(q => saved.srs[q.id])) return {k: "try", t: "Check not passed yet"};
  return {k: "new", t: "Check not taken"}; }
function pickCheck(l) { // missed and unseen questions first, then the rest
  const qs = QB.filter(q => q.l === l), rank = q => { const r = saved.srs[q.id]; return !r ? 1 : r.b < 0 ? 0 : 2 + r.b; };
  return shuffle(qs).sort((a, b) => rank(a) - rank(b)).slice(0, 3); }
/* runner */
function runQs(items, ctx) { let i = 0, score = 0; const res = [];
  const ask = () => { const q = items[i], ord = shuffle(q.o.map((_, j) => j));
    setPanel(`<button class="back" data-act="popview">← ${esc(ctx.backLabel)}</button><div class="eyebrow">${esc(ctx.title)}</div>
      <div class="progress"><i style="width:${i / items.length * 100}%"></i></div><p class="src" style="margin-top:-6px">Question ${i + 1} of ${items.length}${ctx.mixed ? " · from " + esc(NAV_LABEL[q.l]) : ""}</p>
      <div class="q">${esc(q.q)}</div><div class="opts">${ord.map(j => `<button data-j="${j}">${esc(q.o[j])}</button>`).join("")}</div><div id="why"></div>`);
    panel.querySelectorAll(".opts button").forEach(b => b.onclick = () => { if (panel.querySelector(".opts .right")) return;
      const ok = +b.dataset.j === q.a; if (ok) score++; const r = grade(q.id, ok); res.push({q, ok, r});
      b.classList.add(ok ? "right" : "wrong"); panel.querySelector(`.opts [data-j="${q.a}"]`).classList.add("right");
      $("#why").innerHTML = `<p>${ok ? "<b>Right.</b>" : "<b>Not quite.</b>"} ${esc(q.why)}</p><p class="src">${ok ? `Scheduled: you'll see this again ${whenTxt(r.d)}.` : "Scheduled: this comes back tomorrow."}</p>
        <button class="btn primary" id="nextq">${i + 1 < items.length ? "Next" : "See result"}</button>`;
      $("#nextq").onclick = () => { i++; i < items.length ? ask() : ctx.done(score, res); }; }); };
  ask(); }
function whereBtn(q) { return `<button class="btn" data-act="goto" data-id="${q.id}">Re-read: ${esc(typeof q.at === "string" ? q.at.replace(/^\d+\.\s*/, "") : q.at.debate ? "the debate" : "part " + (q.at.stop + 1))} →</button>`; }
function pushPanel(html) { if (!VIEW.length) { const s = snapshot(); try { history.pushState({mmaView: 1}, "", location.href); s.pushed = true; } catch (e) {} VIEW.push(s); } setPanel(html); }
ACT.check = el => { const l = el.dataset.l, items = pickCheck(l), title = `Check: ${NAV_LABEL[l]}`;
  pushPanel(""); runQs(items, {title, backLabel: "Back to the lesson", done(score, res) {
    const pass = score === items.length; if (pass) { saved.mastered[l] = DAY(); store.set(saved); }
    const missed = res.filter(r => !r.ok), left = QB.filter(q => q.l === l && !items.includes(q)).length;
    setPanel(`<button class="back" data-act="popview">← Back to the lesson</button><div class="eyebrow">${esc(title)}</div><p class="score">${score} / ${items.length}</p>
    ${pass ? `<p><b>Passed.</b> These questions will come back in your daily review, spaced further apart each time you get them right (1, 3, 7, 21 and 60 days). Spacing is what moves knowledge into long-term memory.</p>
      <div class="btnrow"><button class="btn primary" data-act="popview">Back to the lesson</button>${COURSE_IDS.indexOf(l) + 1 < COURSE.length ? `<button class="btn" data-mode-go="${COURSE_IDS[COURSE_IDS.indexOf(l) + 1]}">Next lesson →</button>` : ""}</div>`
    : `<p><b>Not yet.</b> Passing needs ${items.length} out of ${items.length}. Here is the plan:</p>
      <ol><li><b>Re-read</b> the part that covers what you missed (below).</li>
      <li><b>Try again now.</b> You'll get the questions you have not answered correctly yet first, then fresh ones${left ? "" : " (this lesson's bank is small, so some repeat with the options shuffled)"}.</li>
      <li><b>Tomorrow</b>, what you missed comes back in your daily review, mixed with other lessons. Getting it right then moves it to 3 days, then 7, 21 and 60.</li></ol>
      <h4>What you missed</h4>${missed.map(m => `<div class="note"><b>${esc(m.q.q)}</b><br>Answer: ${esc(m.q.o[m.q.a])}. ${esc(m.q.why)}<div class="btnrow" style="margin:8px 0 0">${whereBtn(m.q)}</div></div>`).join("")}
      <div class="btnrow"><button class="btn primary" data-act="check" data-l="${l}">Try again now</button><button class="btn" data-act="popview">Back to the lesson</button></div>`}`); }}); };
ACT.review = () => { const items = shuffle(dueItems()).slice(0, 10);
  if (!items.length) { toast(nextDue() ? `Nothing due. Next review ${whenTxt(nextDue())}.` : "Nothing to review yet: take a lesson check first."); return; }
  pushPanel(""); runQs(items, {title: "Daily review", mixed: true, backLabel: "Back", done(score, res) {
    const wrong = res.filter(r => !r.ok), nd = nextDue();
    setPanel(`<button class="back" data-act="popview">← Back</button><div class="eyebrow">Daily review</div><p class="score">${score} / ${items.length}</p>
    <p>${score === items.length ? "All correct: each question moved up a box and will return later than last time." : `${items.length - score} to see again tomorrow. The rest moved up a box.`}${dueCount() ? ` ${dueCount()} more are due today.` : ""}${nd ? ` Next review: ${whenTxt(nd)}.` : ""}</p>
    ${wrong.map(m => `<div class="note"><b>${esc(m.q.q)}</b><br>Answer: ${esc(m.q.o[m.q.a])}. ${esc(m.q.why)}<div class="btnrow" style="margin:8px 0 0">${whereBtn(m.q)}</div></div>`).join("")}
    <div class="btnrow">${dueCount() ? `<button class="btn primary" data-act="review">Continue reviewing</button>` : ""}<button class="btn" data-act="popview">Done</button></div>`); }}); };
ACT.goto = el => { const q = QBY(el.dataset.id); VIEW.length = 0; setMode(q.l);
  setTimeout(() => {
    if (q.at.stop != null) { (q.l === "story" ? storyStop : ngStop)(q.at.stop); return; }
    if (q.at.debate) { ACT.ngdebate(); return; }
    const t = [...panel.querySelectorAll("h2, h3, h4, .case b, b")].find(e => e.textContent.trim().startsWith(q.at)) || [...panel.querySelectorAll("h2, h3, h4")].find(e => e.textContent.includes(q.at));
    if (t) { panel.scrollTo({top: Math.max(0, t.offsetTop - 12), behavior: "smooth"}); t.classList.add("flash"); setTimeout(() => t.classList.remove("flash"), 2200); } }, 60); };
function checkCard(l) { const s = lessonStatus(l); if (!s) return "";
  return `<div class="card checkcard" id="checkcard"><h4>Check your understanding</h4><p style="margin:0 0 8px">Three questions on this lesson. Pass with 3 out of 3; anything you miss is scheduled to come back.</p>
    <p class="src" style="margin:0 0 10px"><span class="stat ${s.k}">${esc(s.t)}</span></p><button class="btn primary" data-act="check" data-l="${l}">${s.k === "ok" || s.k === "due" ? "Take the check again" : "Start the check"}</button></div>`; }
function reviewCard() { const n = dueCount(), nd = nextDue();
  if (n) return `<div class="card accent"><h4>Daily review</h4><p style="margin:0 0 8px"><b>${n}</b> question${n === 1 ? "" : "s"} due, mixed from your lessons. A few minutes now keeps them from fading.</p><button class="btn primary" data-act="review">Review now</button></div>`;
  if (nd) return `<p class="src">Daily review: nothing due. Next questions come back ${whenTxt(nd)}.</p>`;
  return ""; }
