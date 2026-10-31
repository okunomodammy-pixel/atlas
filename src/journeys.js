/* Guided journeys share the atlas's map, local save and spaced-review scheduler.
   Content is data, prompts use stable IDs, and every advance is learner-controlled. */
const journeyData = () => D.journeys;
const journeyTasks = () => journeyData() ? journeyData().stops.flatMap((stop, index) => stop.tasks.map(task => ({...task, stop, stopIndex: index}))) : [];
const journeyTaskKey = task => `journey:${journeyData().id}:${task.id}`;
function journeyRecord() {
  const id = journeyData().id;
  saved.journeys = saved.journeys || {}; saved.placeSkills = saved.placeSkills || {};
  const r = saved.journeys[id] = saved.journeys[id] || {};
  r.visited = r.visited || {}; r.tasks = r.tasks || {}; r.notes = r.notes || {};
  r.cursor = r.cursor || {view: "story", stop: 0};
  if (!journeyData().stops[r.cursor.stop || 0]) r.cursor = {view: "story", stop: 0};
  r.appliedRevisions=r.appliedRevisions || [];
  for(const revision of journeyData().revisions || []) {
    if(r.appliedRevisions.includes(revision.to))continue;
    const old=`journey:${id}:${revision.from}`,fresh=`journey:${id}:${revision.to}`;
    if(saved.srs[old] && !saved.srs[fresh])saved.srs[fresh]={b:-1,d:DAY()+1,w:0,recalled:false,lastCorrect:null};
    const reviewing=r.cursor.view==="review" && r.review?.queue?.[r.review.index]===revision.from;
    if(r.cursor.view==="review" && r.review?.queue) {
      r.review.queue=r.review.queue.map(q=>q===revision.from?revision.to:q);
      if(r.review.answers && Object.hasOwn(r.review.answers,revision.from)) {
        r.review.archivedAnswers={...(r.review.archivedAnswers || {}),[revision.from]:r.review.answers[revision.from]};delete r.review.answers[revision.from];
      }
    }
    if(reviewing || (r.cursor.view==="task" && journeyData().stops[r.cursor.stop].id===revision.stop && r.cursor.task===revision.task)) {
      delete r.cursor.answer;delete r.cursor.order;delete r.cursor.selected;r.cursor.hint=false;
    }
    r.appliedRevisions.push(revision.to);
  }
  return r;
}
const journeyDue = () => journeyTasks().filter(task => { const r = saved.srs[journeyTaskKey(task)]; return r && r.d <= DAY(); });
function journeyNextDue() { const days = journeyTasks().map(t => saved.srs[journeyTaskKey(t)]).filter(r => r && r.d > DAY()).map(r => r.d); return days.length ? Math.min(...days) : null; }
function journeyHomeCard() {
  if (!journeyData()) return "";
  const j = journeyData(), r = journeyRecord(), visited = Object.keys(r.visited).length;
  return `<section class="journey-hero" aria-label="Featured journey"><div class="eyebrow">Journey · ${esc(activeExplorer()?.name || "My explorer")}</div><h2>${esc(j.title)}</h2>
    <p>${visited ? `${visited} of ${j.stops.length} places explored. Pick up your field notes.` : esc(j.subtitle)}</p>
    <div class="btnrow"><button class="btn primary" data-act="jresume">${visited ? "Continue journey" : "Begin the journey"}</button><button class="btn" data-mode-go="journeys">All stops</button></div><div class="offline-label" id="offline-inline">${location.protocol==="file:"?"Standalone · available offline":"Progress stays with this explorer"}</div></section>`;
}
function journeyReviewCard() {
  if (!journeyData()) return "";
  const n = journeyDue().length, next = journeyNextDue();
  return n ? `<div class="card accent"><h4>Journey review</h4><p>${n} place-and-skill question${n === 1 ? "" : "s"} ready to revisit. Bring the places back without hints.</p><button class="btn primary" data-act="jreview">Review the journey</button></div>` : next ? `<p class="src">Journey review returns ${whenTxt(next)}. Your field journal is always open under Journeys.</p>` : "";
}
function journeySources(stop) {
  const j = journeyData();
  return `<details class="journey-detail journey-sources"><summary>Sources & map notes</summary><p>Illustrations are original sketches, not photographs. Pins are approximate; the Obudu pin marks the plateau area.</p>
    ${stop.sources.map(id => { const s = j.sources[id]; return `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} ↗</a>${s.note ? `<p>${esc(s.note)}</p>` : ""}`; }).join("")}<p>Content edition ${j.version} · editorial pass ${esc(stop.editorialDate || "2026-10-31")}. Geographic facts, illustrative examples and personal reflections serve different purposes.</p></details>`;
}
function journeyScene(stop) {
  const shapes = {
    lagoon: '<path fill="#83b9c4" d="M0 45h400v75H0z"/><path fill="#f3d8a0" d="M0 0h400v44L0 62z"/><path d="M-10 91L410 54" stroke="#29576b" stroke-width="6"/><path d="M45 86V49m160 22V34m150 24V20" stroke="#29576b" stroke-width="3"/><path d="M54 102h28l-7 7H60zM280 83h30l-6 7h-18z" fill="#fcf5e6"/>',
    roofs: '<path d="M0 57Q65 14 140 52T285 42T400 48V120H0z" fill="#a0b29b"/><path d="M0 83Q110 36 220 79T400 68V120H0z" fill="#677f6d"/>' + [20,80,140,200,260,320].map((x,i) => `<path d="M${x} ${78+i%2*13}h40v35h-40z" fill="#ead7b6"/><path d="M${x-5} ${78+i%2*13}l25-16 25 16z" fill="#a7593d"/>`).join(""),
    rivers: '<path fill="#b2c29c" d="M0 0h400v120H0z"/><path d="M36-10Q115 38 190 55M365-10Q285 37 190 55Q168 85 210 135" stroke="#5b9fb2" stroke-width="29" fill="none"/><circle cx="163" cy="63" r="7" fill="#e7aa48"/><path d="M156 72l-12 17" stroke="#f7f1d9" stroke-width="3"/>',
    cloth: '<path fill="#e8c895" d="M0 0h400v120H0z"/><path d="M0 36h400" stroke="#8a633d" stroke-width="3"/>' + [36,108,180,252,324].map((x,i) => `<path d="M${x} 34h47v69h-47z" fill="${i%2?'#2d536e':'#476c91'}"/><path d="M${x+8} 43l30 50m-30-12 30-26" stroke="#c3d9de" stroke-width="3" opacity=".75"/>`).join(""),
    highlands: '<path fill="#c6dce0" d="M0 0h400v120H0z"/><path d="M0 84L86 25l72 46 83-54 159 55v48H0z" fill="#9caf8a"/><path d="M0 100l115-40 64 41 105-57 116 42v34H0z" fill="#577b63"/><path d="M0 120l128-37 97 37 116-39 59 20v19z" fill="#345e51"/><path d="M171 120q-34-25-10-41" stroke="#e7d5a4" stroke-width="4" fill="none"/>'
  };
  return `<figure class="field-scene"><svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrated field note: ${esc(stop.theme)}"><rect width="400" height="120" fill="#edf0e4"/>${shapes[stop.scene] || ""}</svg><figcaption>Illustrated field note · ${esc(stop.theme)}</figcaption></figure>`;
}
function journeyNavigation(index) {
  const j = journeyData();
  return `<div class="journey-top"><button class="back" data-mode-go="journeys">← Journey overview</button><span>${index + 1} / ${j.stops.length}</span></div>
    `;
}
function journeyLayout(mapTask) {
  readingLayout("journeys");
  if (mapTask && matchMedia("(max-width: 860px)").matches) {
    const main = $("#main"), old = main.style.transition; main.style.transition = "none";
    setMapHeight(innerHeight * .42); refit(true); main.style.transition = old;
  }
}
let journeyMarkerData = [];
function drawJourneyMarkers() {
  if (!G.journey || S.mode !== "journeys") return;
  const k = S.proj === "globe" ? 1 : S.k;
  const groups = G.journey.selectAll("g.journey-marker");
  groups.attr("transform", d => `translate(${projection(d.stop.coordinate) || [-9999, -9999]})`).attr("display", d => visibleOnGlobe(d.stop.coordinate) ? null : "none");
  groups.each(function(d) {
    const g = d3.select(this), [dx,dy] = d.stop.offset.map(v => v / k);
    g.select("line").attr("x2", dx).attr("y2",dy);
    g.select(".anchor").attr("r", 3 / k);
    const quiet = g.classed("quiet");
    g.select(".hit-area").attr("cx",dx).attr("cy",dy).attr("r",(quiet ? 12 : 24)/k);
    g.select(".disc").attr("cx",dx).attr("cy",dy).attr("r",(quiet ? 4 : 16)/k);
    g.select("text").attr("x",dx).attr("y",dy).attr("font-size",14/k).attr("display",quiet ? "none" : null);
  });
  G.countrylabels.attr("display", "none"); G.cities.attr("display", "none");
  G.countries.selectAll("path").filter(d=>d.key === "566").style("fill","var(--land)");
}
function fitJourneyMap() {
  if (S.proj === "globe") { flyTo(featByKey.get("566"),{pad:.76,maxk:15,duration:0}); return; }
  // Reserve space for search and zoom controls instead of fitting underneath them.
  const [[x0,y0],[x1,y1]] = path.bounds(featByKey.get("566"));
  const top = 60, available = Math.max(65,H-top-44);
  const k = Math.min(25,.9/Math.max((x1-x0)/(W-48),(y1-y0)/available));
  svg.call(zoom.transform,d3.zoomIdentity.translate(W/2-k*(x0+x1)/2,top+available/2-k*(y0+y1)/2).scale(k));
}
function journeyMap(task, cursor) {
  stopQuiz();
  if (!G.journey) G.journey = root.append("g").attr("class", "journey-markers");
  const j = journeyData(), r = journeyRecord();
  S.sel = "566"; paint();
  G.countries.selectAll("path").classed("dim", d => d.key !== "566");
  const states = topojson.feature(D.ng.states, Object.values(D.ng.states.objects)[0]).features;
  G.states.selectAll("path").data(states).join("path").attr("class", "state").style("fill", "none").on("click", e => e.stopPropagation());
  setPins([]);
  const visited = j.stops.filter(s => r.visited[s.id]);
  setRoutes(!task && visited.length > 1 ? [{geo:{type:"LineString",coordinates:visited.map(s=>s.coordinate)},thin:true}] : []);
  if (task && task.type === "location") cursor.choices = cursor.choices || shuffle(j.stops.map(s => s.id));
  journeyMarkerData = j.stops.map((stop, i) => {
    const letter = task && task.type === "location" ? String.fromCharCode(65 + cursor.choices.indexOf(stop.id)) : String(i + 1);
    return {stop, index:i, letter};
  });
  const click = d => {
    if (task && task.type === "location") journeyAnswer(d.stop.id);
    else if (!task) visitJourneyStop(d.index);
  };
  const markers = G.journey.selectAll("g").data(journeyMarkerData, d=>d.stop.id).join("g").attr("class", d => `journey-marker${!task && d.index === (cursor.stop || 0) ? " active" : ""}${!task && !cursor.overview && d.index !== (cursor.stop || 0) ? " quiet" : ""}${task && cursor.answer && d.stop.id === task.stop.id ? " correct" : ""}${task && cursor.answer && !cursor.answer.ok && d.stop.id === cursor.answer.choice ? " incorrect" : ""}`)
    .attr("tabindex", task && (cursor.answer || task.type!=="location") ? -1 : 0).attr("role", task && task.type!=="location" ? "img" : "button").attr("aria-label", d => task ? task.type==="location" ? `Choose marker ${d.letter}` : d.stop.name : `Visit ${d.stop.name}`)
    .on("click", (e,d) => {e.stopPropagation();click(d);}).on("keydown", (e,d)=>{if(e.key === "Enter" || e.key === " "){e.preventDefault();e.stopPropagation();click(d);}});
  markers.selectAll("*").remove();
  markers.append("line"); markers.append("circle").attr("class","anchor"); markers.append("circle").attr("class","hit-area").attr("fill","transparent");
  markers.append("circle").attr("class","disc"); markers.append("text").text(d=>d.letter);
  svg.attr("role","group").attr("aria-label", task ? "Nigeria journey map. Choose a lettered marker or use the answer buttons." : "Nigeria journey map. Numbered markers visit each stop.");
  S.quiz = {onClick(){},onSea(){},stop(){
    G.journey.selectAll("*").remove(); journeyMarkerData = [];
    G.countrylabels.attr("display",null); G.cities.attr("display",null); G.states.selectAll("*").remove();
    svg.attr("role","img").attr("aria-label","Interactive world map");
  }};
  render(); fitJourneyMap(); drawJourneyMarkers();
}
function journeyHub() {
  if (!journeyData()) { setPanel('<h2>Journeys</h2><p>This copy does not contain the journey data. Reopen a complete atlas download to continue.</p>'); return; }
  const j = journeyData(), r = journeyRecord();
  journeyLayout(false); journeyMap(null, {...r.cursor,overview:true});
  setPanel(`<div class="eyebrow">Journeys</div><h2>${esc(j.title)}</h2><p class="lede">${esc(j.subtitle)}</p><p>${esc(j.intro)}</p>
    <div class="btnrow"><button class="btn primary" data-act="jresume">${Object.keys(r.visited).length ? "Continue journey" : "Start in Lagos"}</button><button class="btn" data-act="jjournal">Your field journal</button></div>
    ${journeyReviewCard()}<ol class="lessons">${j.stops.map((s,i)=>`<li class="${r.visited[s.id] ? "done" : ""}"><button data-jvisit="${i}"><span class="num">${i+1}</span><span><b>${esc(s.name)}</b><span>${esc(s.theme)}</span><span class="src">${r.visited[s.id] ? "Explored" : "Open whenever you like"}</span></span><span class="arr">›</span></button></li>`).join("")}</ol>
    <p class="src">${esc(j.routeNote)} Your progress and notes stay in this browser. No sign-in needed.</p>`);
}
function visitJourneyStop(index) {
  if (!journeyData().stops[index]) return;
  const r = journeyRecord(), stop = journeyData().stops[index];
  r.visited[stop.id] = true; r.cursor = {view:"story",stop:index}; store.set(saved);
  showJourneyCursor();
}
function showJourneyCursor() {
  if (S.mode !== "journeys") setMode("journeys",true);
  setHash(`journey/${journeyData().id}`);
  const r = journeyRecord(), c = r.cursor;
  if (c.view === "journal") return journeyJournal();
  if (c.view === "review-result") return journeyReviewResult();
  if (["task","recap","review"].includes(c.view)) return journeyQuestion();
  const stop = journeyData().stops[c.stop]; r.visited[stop.id] = true; store.set(saved);
  journeyLayout(false); journeyMap(null,c);
  setPanel(`${journeyNavigation(c.stop)}<div class="eyebrow">${esc(stop.name)} · ${esc(stop.region)}</div><h2>${esc(stop.title)}</h2>
    <p class="lede">${esc(stop.story)}</p>
    <div class="btnrow"><button class="btn primary" data-act="jchallenge">Try ${stop.tasks.length} challenges</button><button class="btn" data-act="jnextstop">${c.stop < 4 ? "Read on to the next stop" : "Rebuild the journey"}</button></div>
    ${journeyScene(stop)}<div class="field-note"><b>Look at the map</b><p>${esc(stop.notice)}</p><button class="btn" data-act="jmap">Show the five stops</button></div>
    ${stop.connection ? `<section class="story-connection"><h4>${esc(stop.connection.title)}</h4><p>${esc(stop.connection.text)}</p></section>` : ""}
    <details class="journey-detail"><summary>A little deeper</summary>${stop.deeper.map(p=>`<p>${esc(p)}</p>`).join("")}</details>
    <div class="mm"><h4>Carry this with you</h4><p>${esc(stop.memory)}</p></div>
    <label for="journey-note"><b>Your field note</b><br>${esc(stop.reflection)}</label><textarea class="journey-note" id="journey-note" data-jnote="${stop.id}" maxlength="600" placeholder="A thought, a memory, or somewhere you would like to go…">${esc(r.notes[stop.id] || "")}</textarea>
    <p class="src">Notes save on this device. ${esc(journeyData().routeNote)}</p>${journeySources(stop)}
    <div class="btnrow"><button class="btn" data-act="jjournal">Open your journal</button><button class="btn" data-mode-go="nigeria">Open the full Nigeria atlas</button></div>`);
}
function prepareJourneyQuestion(view, stop, taskIndex, extra={}) {
  const r = journeyRecord(); r.cursor = {view,stop,task:taskIndex,...extra}; store.set(saved); showJourneyCursor();
}
function currentJourneyTask() {
  const r = journeyRecord(), c = r.cursor;
  if (c.view === "review") return journeyTasks().find(t=>t.id === r.review.queue[r.review.index]);
  if (c.view === "recap") {
    const stopId = r.recap.order[r.recap.index];
    return journeyTasks().find(t=>t.stop.id === stopId && t.type === "location");
  }
  const local=journeyData().stops[c.stop]?.tasks[c.task || 0];
  return local ? journeyTasks().find(t=>t.stopIndex===c.stop && t.id===local.id) : null;
}
function journeyQuestion() {
  const r = journeyRecord(), c = r.cursor, task = currentJourneyTask();
  if (!task) { r.cursor = {view:"story",stop:0}; return showJourneyCursor(); }
  c.stop = task.stopIndex;
  journeyLayout(task.type === "location"); journeyMap(task,c);
  c.order = c.order || shuffle(task.options ? task.options.map((_,i)=>i) : []); store.set(saved);
  const recap = c.view === "recap", review = c.view === "review";
  const title = recap ? "Put the places back" : review ? "Journey review" : `Try it · ${task.stop.name}`;
  const progress = recap ? `${r.recap.index+1} of 5 places` : review ? `${r.review.index+1} of ${r.review.queue.length}` : `Challenge ${(c.task || 0)+1} of ${task.stop.tasks.length}`;
  const pickClass=i=>!c.answer?"":task.type==="order"?((c.selected || []).indexOf(i)===task.answer.indexOf(i)?"right":"wrong"):task.answer.includes(i)?"right":(c.selected || []).includes(i)?"wrong":"";
  const choices = task.type === "location" ? `<p>Choose a marker on the map, or its letter below. Leader lines point to each place.</p><div class="journey-choices">${c.choices.map((id,i)=>`<button data-janswer="${id}" ${c.answer ? "disabled" : ""} class="${c.answer && id === task.stop.id ? "right" : c.answer && id === c.answer.choice && !c.answer.ok ? "wrong" : ""}" aria-label="Choose marker ${String.fromCharCode(65+i)}">${String.fromCharCode(65+i)}</button>`).join("")}</div>` :
    Array.isArray(task.answer) ? `<p>${task.type==="order"?"Tap the items in order. Tap a selected item to remove it.":"Choose all the matching answers, then check."}</p><div class="opts journey-picks">${c.order.map(i=>`<button data-jtoggle="${i}" aria-pressed="${(c.selected || []).includes(i)}" ${c.answer?"disabled":""} class="${pickClass(i)}">${esc(task.options[i])}${task.type==="order" && (c.selected || []).includes(i)?`<span class="pick-order">${c.selected.indexOf(i)+1}</span>`:""}</button>`).join("")}</div>${!c.answer?`<button class="btn primary" data-act="jcheck" ${!c.selected?.length?"disabled":""}>Check answer</button>`:""}` :
    `<div class="opts">${c.order.map(i=>`<button data-janswer="${i}" ${c.answer ? "disabled" : ""} class="${c.answer && i === task.answer ? "right" : c.answer && String(i) === c.answer.choice && !c.answer.ok ? "wrong" : ""}">${esc(task.options[i])}</button>`).join("")}</div>`;
  setPanel(`<div class="journey-task"><div class="journey-top"><button class="back" data-mode-go="journeys">← Journey overview</button><span>${progress}</span></div>
    <div class="eyebrow">${esc(title)}</div><h2 class="q">${esc(task.question)}</h2>${choices}
    ${!c.answer ? `<button class="btn" data-act="jhint" ${c.hint ? "disabled" : ""}>${c.hint ? "Hint opened" : "A hint, please"}</button>${c.hint ? `<p class="journey-hint">${esc(task.hint)}</p>` : ""}` : ""}
    ${c.answer ? `<div class="journey-feedback" id="journey-feedback" role="status" tabindex="-1"><p><b>${c.answer.ok ? c.hint ? "Found it, with a hint." : "That's it." : "A place to revisit."}</b> ${esc(task.explanation)}</p><p>${c.answer.ok && !c.hint ? "A correct answer adds to your practice. Later scheduled recall is what grows the review interval." : "This comes back tomorrow, so you can try it again without help."}</p></div>
      <button class="btn primary" data-act="jnextquestion">${recap && r.recap.index === 4 ? "Open your field journal" : "Continue"}</button>` : `<div class="btnrow"><button class="btn" data-act="jskip">Save this for later</button></div>`}
    <p><button class="lnk" data-jvisit="${task.stopIndex}">Revisit the ${esc(task.stop.name)} story</button></p></div>`);
}
function journeyAnswer(choice) {
  const r = journeyRecord(), c = r.cursor;
  if (!["task","recap","review"].includes(c.view) || c.answer) return;
  const task = currentJourneyTask(); if (!task) return;
  const picked=Array.isArray(task.answer) && String(choice).length ? String(choice).split(",").map(Number) : [];
  const valid = task.type === "location" ? journeyData().stops.some(s=>s.id === choice) : Array.isArray(task.answer) ? picked.length>0 && new Set(picked).size===picked.length && picked.every(i=>Number.isInteger(i) && task.options[i]!=null) : task.options.some((_,i)=>String(i) === String(choice));
  if (!valid) return;
  const ok = task.type === "location" ? choice === task.stop.id : Array.isArray(task.answer) ? JSON.stringify(task.type==="order"?picked:[...picked].sort((a,b)=>a-b))===JSON.stringify(task.type==="order"?task.answer:[...task.answer].sort((a,b)=>a-b)) : Number(choice) === task.answer;
  c.answer = {choice:String(choice),ok};
  const record = r.tasks[task.id] = r.tasks[task.id] || {attempts:0,correct:0,assisted:0};
  record.attempts++; record.correct += ok ? 1 : 0; record.assisted += c.hint ? 1 : 0;
  if (c.view === "task") record.visited = true;
  const place = saved.placeSkills[`NGA:${task.stop.id}`] = saved.placeSkills[`NGA:${task.stop.id}`] || {};
  const skill = place[task.skill] = place[task.skill] || {attempts:0,correct:0,assisted:0};
  skill.attempts++; skill.correct += ok ? 1 : 0; skill.assisted += c.hint ? 1 : 0; skill.lastDay = DAY();
  grade(journeyTaskKey(task), ok, {assisted:!!c.hint});
  if (c.view === "recap") r.recap.answers[task.stop.id] = ok && !c.hint;
  if (c.view === "review") r.review.answers[task.id] = ok && !c.hint;
  store.set(saved); journeyQuestion();
  const feedback = $("#journey-feedback"); if (feedback) feedback.focus({preventScroll:false});
}
function queueJourneyTask(task) {
  const id = journeyTaskKey(task);
  if (!saved.srs[id]) saved.srs[id] = {b:-1,d:DAY()+1,w:0,lastDay:DAY(),lastCorrect:null,recalled:false};
}
function nextJourneyStop() {
  const r = journeyRecord(), index = r.cursor.stop || 0;
  journeyTasks().filter(t=>t.stopIndex === index && !r.tasks[t.id]?.visited).forEach(queueJourneyTask);
  store.set(saved);
  if (index < journeyData().stops.length-1) visitJourneyStop(index+1); else beginJourneyRecap();
}
function beginJourneyRecap() {
  const r = journeyRecord(); r.recap = {order:shuffle(journeyData().stops.map(s=>s.id)),index:0,answers:{}};
  prepareJourneyQuestion("recap",0,0);
}
function nextJourneyQuestion() {
  const r = journeyRecord(), c = r.cursor;
  if (!c.answer && !c.skipped) return;
  if (c.view === "recap") {
    r.recap.index++;
    if (r.recap.index >= 5) {
      if (journeyData().stops.every(s=>r.visited[s.id]) && Object.keys(r.recap.answers).length === 5 && r.completedDay == null) r.completedDay = DAY();
      r.cursor = {view:"journal",stop:0}; store.set(saved); return showJourneyCursor();
    }
    return prepareJourneyQuestion("recap",0,0);
  }
  if (c.view === "review") {
    r.review.index++;
    if (r.review.index >= r.review.queue.length) { r.cursor = {view:"review-result",stop:0}; store.set(saved); return showJourneyCursor(); }
    return prepareJourneyQuestion("review",0,0);
  }
  if ((c.task || 0)+1 < journeyData().stops[c.stop].tasks.length) prepareJourneyQuestion("task",c.stop,(c.task || 0)+1); else nextJourneyStop();
}
function startJourneyReview(practice=false) {
  const tasks = practice ? journeyTasks() : journeyDue();
  if (!tasks.length) { toast("Nothing due yet. Your next review date is in your journal."); return; }
  const r = journeyRecord(); r.review = {queue:shuffle(tasks.map(t=>t.id)),index:0,answers:{},practice};
  prepareJourneyQuestion("review",0,0);
}
function journeyReviewResult() {
  const r = journeyRecord(), review = r.review, count = Object.values(review.answers).filter(Boolean).length;
  stopQuiz(); journeyLayout(false); journeyMap(null,{stop:0});
  setPanel(`<div class="eyebrow">Journey review</div><h2>Places brought back</h2><p class="score">${count} / ${review.queue.length}</p><p>Answered correctly without hints. Anything missed or assisted returns tomorrow. Early practice keeps its existing review date.</p>
    ${journeyReviewCard()}<div class="btnrow"><button class="btn primary" data-act="jjournal">Open your field journal</button><button class="btn" data-mode-go="journeys">Journey overview</button></div>`);
}
function journeyJournal() {
  const j = journeyData(), r = journeyRecord(), visited = j.stops.filter(s=>r.visited[s.id]);
  r.cursor = {view:"journal",stop:0}; store.set(saved); journeyLayout(false); journeyMap(null,{stop:0,overview:true});
  const practised = journeyTasks().filter(t=>(r.tasks[t.id]?.attempts || 0) > 0).length;
  const recalled = journeyTasks().filter(t=>{const q=saved.srs[journeyTaskKey(t)];return q && q.recalled && q.b>=1;}).length;
  setPanel(`<div class="eyebrow">Your field journal</div><h2>${esc(j.title)}</h2>${r.completedDay != null ? '<div class="journal-stamp">NIGERIA · JOURNEY EXPLORED</div>' : ""}
    <p>${visited.length} of 5 places explored · ${practised} of ${journeyTasks().length} stop challenges tried.</p><p class="src">${recalled} of ${journeyTasks().length} skills recalled in later scheduled reviews.</p><p class="editor-note">Edition ${j.version}: ${esc(j.editorial?.summary || "Original field notes")}</p>
    ${r.recap ? `<p>Last map reconstruction: ${Object.values(r.recap.answers).filter(Boolean).length} places found without hints, from ${Object.keys(r.recap.answers).length} attempted. This records practice, not lasting mastery.</p>` : ""}
    ${journeyReviewCard()}${visited.length ? visited.map(s=>`<article class="journal-entry"><div class="eyebrow">${esc(s.theme)}</div><h3>${esc(s.name)}</h3><p>${esc(s.memory)}</p>${r.notes[s.id] ? `<blockquote>${esc(r.notes[s.id])}</blockquote>` : '<p class="src">Your own field note can start with a question.</p>'}<button class="btn" data-jvisit="${j.stops.indexOf(s)}">Revisit & add a note</button></article>`).join("") : '<p>Your first entry starts in Lagos. Choose a stop and notice something new.</p>'}
    <div class="btnrow"><button class="btn primary" data-jvisit="0">${visited.length ? "Explore the stops again" : "Start in Lagos"}</button>${visited.length === 5 ? '<button class="btn" data-act="jrecap">Rebuild the map again</button>' : ""}<button class="btn" data-act="jpractice">Practise all skills</button></div>
    <p class="src">Your notes and practice stay in this browser. ${esc(j.routeNote)}</p>`);
}
MODES.journeys = journeyHub;
ACT.jresume = () => { if (!journeyData()) return; if (S.mode !== "journeys") setMode("journeys",true); showJourneyCursor(); };
ACT.jjournal = () => { if (S.mode !== "journeys") setMode("journeys",true); journeyRecord().cursor = {view:"journal",stop:0}; showJourneyCursor(); };
ACT.jchallenge = () => prepareJourneyQuestion("task",journeyRecord().cursor.stop,0);
ACT.jhint = () => { const c = journeyRecord().cursor; if (c.answer) return; c.hint = true; store.set(saved); journeyQuestion(); };
ACT.jcheck = () => journeyAnswer((journeyRecord().cursor.selected || []).join(","));
ACT.jnextstop = nextJourneyStop;
ACT.jnextquestion = nextJourneyQuestion;
ACT.jrecap = beginJourneyRecap;
ACT.jreview = () => startJourneyReview(false);
ACT.jpractice = () => startJourneyReview(true);
ACT.jskip = () => { const task = currentJourneyTask(); if (!task) return; queueJourneyTask(task); journeyRecord().cursor.skipped = true; store.set(saved); nextJourneyQuestion(); };
ACT.jmap = () => { if (matchMedia("(max-width: 860px)").matches) { setMapHeight(innerHeight*.48); refit(true); }
  journeyMap(null,{...journeyRecord().cursor,overview:true}); };
panel.addEventListener("click", e=>{
  const visit = e.target.closest("[data-jvisit]"); if (visit) visitJourneyStop(Number(visit.dataset.jvisit));
  const answer = e.target.closest("[data-janswer]"); if (answer && !answer.disabled) journeyAnswer(answer.dataset.janswer);
  const toggle=e.target.closest("[data-jtoggle]");if(toggle && !toggle.disabled) {
    const c=journeyRecord().cursor,i=Number(toggle.dataset.jtoggle);c.selected=c.selected || [];
    c.selected=c.selected.includes(i)?c.selected.filter(n=>n!==i):[...c.selected,i];store.set(saved);
    const task=currentJourneyTask();panel.querySelectorAll("[data-jtoggle]").forEach(b=>{
      const n=Number(b.dataset.jtoggle);b.setAttribute("aria-pressed",String(c.selected.includes(n)));b.querySelector(".pick-order")?.remove();
      if(task.type==="order" && c.selected.includes(n)){const span=document.createElement("span");span.className="pick-order";span.textContent=c.selected.indexOf(n)+1;b.appendChild(span);}
    });const check=panel.querySelector("[data-act=jcheck]");if(check)check.disabled=!c.selected.length;
  }
});
panel.addEventListener("input", e=>{ if (!e.target.matches("[data-jnote]")) return;
  journeyRecord().notes[e.target.dataset.jnote] = e.target.value.slice(0,600); store.set(saved);
});
const lessonReviewCard = reviewCard;
reviewCard = function() { return lessonReviewCard() + journeyReviewCard(); };
const routeHashJourney = routeHash;
routeHash = function(initial) {
  let h = ""; try {h = decodeURIComponent(location.hash.slice(1));} catch(e){}
  const m = /^journey\/([^/]+)(?:\/([^/]+))?$/.exec(h);
  if (m && journeyData() && m[1] === journeyData().id) {
    routing = true;
    try {setMode("journeys",true); const index = journeyData().stops.findIndex(s=>s.id === m[2]); if (index >= 0) visitJourneyStop(index); else showJourneyCursor();}
    finally {routing = false;}
    return;
  }
  routeHashJourney(initial);
};
