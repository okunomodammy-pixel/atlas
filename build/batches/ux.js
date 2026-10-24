/* ---------- v9: navigation, course path, home, sharing, theme, phone layout ---------- */
const COURSE = [
  ["learn", "Reading the map", "Globes, projections, the grid, distance and direction"],
  ["regions", "Continents & regions", "The seven continents and the regions inside them"],
  ["africa", "Africa", "Five regions, the great rivers and the blocs"],
  ["nigeria", "Nigeria", "36 states, the FCT and the six geopolitical zones"],
  ["history", "History through maps", "How the political map changed, from 200 to 1994"],
  ["borders", "How borders are made", "Case studies of lines drawn, moved and disputed"],
  ["geo", "Chokepoints & landlocked states", "The narrow seas trade depends on, and life without a coast"]];
const COURSE_IDS = COURSE.map(c => c[0]);
const NAV_LABEL = {explore: "Explore", course: "the course", quiz: "Play", tools: "Tools", about: "About"};
COURSE.forEach(([id, n]) => NAV_LABEL[id] = n);
saved.lessons = saved.lessons || {};
const groupOf = m => COURSE_IDS.includes(m) || m === "course" ? "learn" : m;
const shortNum = n => n >= 1e9 ? (n / 1e9).toFixed(n >= 1e10 ? 0 : 2) + " billion" : n >= 1e6 ? (n / 1e6).toFixed(n >= 1e8 ? 0 : 1) + " million" : fmt(n);
const UNKEYS = () => Object.keys(D.facts).filter(k => D.facts[k].un || D.facts[k].obs);

function updateNav(m) {
  const g = groupOf(m);
  document.querySelectorAll("nav.primary button").forEach(b => b.dataset.nav === g ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
  const cb = $("#crumb"), i = COURSE_IDS.indexOf(m);
  if (i < 0) { cb.hidden = true; return; }
  cb.innerHTML = `<button data-crumb="${i - 1}" ${i === 0 ? "disabled" : ""} aria-label="Previous lesson">‹</button>
    <div class="cl"><span>Lesson ${i + 1} of ${COURSE.length}</span><b>${esc(COURSE[i][1])}</b>
    <div class="dots">${COURSE.map(([id], j) => `<i class="${j === i ? "cur" : saved.lessons[id] ? "done" : ""}"></i>`).join("")}</div></div>
    <button data-crumb="all">All lessons</button>
    <button data-crumb="${i + 1}" ${i === COURSE.length - 1 ? "disabled" : ""} aria-label="Next lesson">›</button>`;
  cb.hidden = false; }
$("#crumb").addEventListener("click", e => { const b = e.target.closest("[data-crumb]"); if (!b || b.disabled) return;
  const v = b.dataset.crumb; setMode(v === "all" ? "course" : COURSE_IDS[+v]); });

function afterMode(m) {
  S.back = null;
  if (COURSE_IDS.includes(m)) { saved.lessons[m] = 1; saved.lastLesson = m; store.set(saved); updateNav(m); } }
function navGo(id) { setMode(id === "learn" ? "course" : id); }

/* history: every section and every country has its own address, so Back works and links can be shared */
let routing = false;
function setHash(h) { if (routing) return; try { if (decodeURIComponent(location.hash.slice(1)) !== h) history.pushState(null, "", "#" + h); } catch (e) {} }
function routeHash(initial) {
  let h = ""; try { h = decodeURIComponent((location.hash || "").slice(1)); } catch (e) {}
  routing = true;
  try {
    if (h.startsWith("c/")) { const id = h.slice(2), k = byC3.has(id) ? byC3.get(id) : featByKey.has(id) || byKey.has(id) ? id : null;
      if (k) { if (S.mode !== "explore" || initial) { setMode("explore", true); MODES.explore(); } selectCountry(k, true); return; } }
    setMode(MODES[h] ? h : "explore");
  } finally { routing = false; } }
window.addEventListener("popstate", () => { closeOverlay(); routeHash(false); });
function countryHash(k) { const f = byKey.get(k); return "c/" + (f ? f.c3 : k); }

function backLink() { return S.back ? `<button class="back" data-mode-go="${S.back}">← Back to ${esc(NAV_LABEL[S.back] || "previous")}</button>` : ""; }

/* small helpers */
let toastT; function toast(t, ms = 2400) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, ms); }
function shareURL(h) { const base = location.href.split("#")[0]; return base + "#" + h; }
ACT.share = async el => { const k = byC3.get(el.dataset.c3), url = shareURL(countryHash(k)), title = nameOf(k) + " · Mental Map Atlas";
  try { if (navigator.share) { await navigator.share({title, url}); return; } } catch (e) { if (e && e.name === "AbortError") return; }
  try { await navigator.clipboard.writeText(url); toast("Link copied"); } catch (e) { toast(url, 6000); } };
ACT.random = () => { const all = UNKEYS(), fresh = all.filter(k => !saved.seen.includes(k)), pool = fresh.length ? fresh : all;
  selectCountry(pool[Math.floor(Math.random() * pool.length)], true); };
ACT.walk = el => { const nb = relPos(el.dataset.k); if (nb.length) selectCountry(nb[Math.floor(Math.random() * nb.length)].k, true); };

/* home */
function countryOfDay() { const all = UNKEYS().filter(k => PROFILES[byKey.get(k).c3]).sort();
  const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5); return all[(day * 37) % all.length]; }
function progressBars() {
  const all = UNKEYS(), seen = new Set(saved.seen);
  const row = (label, keys) => { const n = keys.filter(k => seen.has(k)).length, p = keys.length ? n / keys.length : 0;
    return `<div class="bar"><span>${esc(label)}</span><span class="track"><i style="width:${(p * 100).toFixed(1)}%"></i></span><span class="n">${n}/${keys.length}</span></div>`; };
  return row("All countries", all) + CONT.filter(c => c !== "Antarctica").map(c => row(c, all.filter(k => continentOf(byKey.get(k)) === c))).join(""); }
MODES.explore = () => { resetView();
  const cd = countryOfDay(), cf = cd && byKey.get(cd), cp = cf && PROFILES[cf.c3];
  const li = saved.lastLesson ? COURSE_IDS.indexOf(saved.lastLesson) : -1;
  const games = Object.keys(saved.best).length;
  setPanel(`<div class="eyebrow">Explore</div><h2>Start anywhere on Earth</h2>
  <p>Tap any country on the map, or search above. Every country opens a page with its neighbours, so you can walk across the world one border at a time.</p>
  ${li >= 0 ? `<div class="card accent"><h4>Pick up where you left off</h4><p style="margin:0">Lesson ${li + 1} of ${COURSE.length}: <b>${esc(COURSE[li][1])}</b></p><button class="btn primary go" data-mode-go="${COURSE[li][0]}">Continue →</button></div>` : ""}
  ${cf ? `<div class="card"><h4>Country of the day</h4><div class="cotd"><span class="fl">${esc(cf.flag)}</span><div><b style="font-size:17px">${esc(cf.n)}</b><br><span class="src" style="margin:0">${esc(cf.sub || continentOf(cf))}</span></div></div>
    ${cp ? `<p style="margin:10px 0 6px">${cp.memo}</p>` : ""}<button class="btn go" data-go="${cd}">Open ${esc(cf.n)} →</button></div>` : ""}
  <h4>Where to next</h4>
  <div class="cards">
    <button class="cardbtn" data-mode-go="course"><span class="ic">🎓</span><b>Take the course</b><span>${COURSE.length} short lessons, in order</span></button>
    <button class="cardbtn" data-mode-go="quiz"><span class="ic">🎯</span><b>Play a game</b><span>Quizzes on places, flags and shapes</span></button>
    <button class="cardbtn" data-mode-go="tools"><span class="ic">📏</span><b>Measure the world</b><span>Distances and true sizes</span></button>
    <button class="cardbtn" data-act="random"><span class="ic">🎲</span><b>Surprise me</b><span>A country you have not opened yet</span></button>
  </div>
  <h4>A first walk across West Africa</h4><div class="chips">${["566","204","562","148","120","288","710","818","231"].map(k => `<button class="chip" data-go="${k}">${esc(nameOf(k))}</button>`).join("")}</div>
  <h4>Your progress</h4>${progressBars()}
  <p class="src">${games ? `Games with a saved best score: ${games}. ` : ""}Progress is saved in this browser only. Counting convention: 193 UN member states plus 2 UN observer states (Vatican City and Palestine) = 195.</p>`); };

/* course hub */
MODES.course = () => { resetView();
  const next = COURSE.find(([id]) => !saved.lessons[id]), done = COURSE.filter(([id]) => saved.lessons[id]).length;
  const go = saved.lastLesson && !next ? saved.lastLesson : next ? next[0] : COURSE_IDS[0];
  setPanel(`<div class="eyebrow">Learn</div><h2>The course</h2>
  <p>Seven short lessons. Each one changes the map beside you as you read, so the picture builds in your head. Go in order, or jump to any lesson.</p>
  <div class="progress"><i style="width:${done / COURSE.length * 100}%"></i></div><p class="src" style="margin-top:-8px">${done} of ${COURSE.length} lessons opened</p>
  <ol class="lessons">${COURSE.map(([id, n, d], i) => `<li class="${saved.lessons[id] ? "done" : ""}"><button data-mode-go="${id}"><span class="num">${saved.lessons[id] ? "✓" : i + 1}</span><span><b>${esc(n)}</b><span>${esc(d)}</span></span><span class="arr">›</span></button></li>`).join("")}</ol>
  <div class="btnrow"><button class="btn primary" data-mode-go="${go}">${done === 0 ? "Start lesson 1" : next ? "Continue with lesson " + (COURSE_IDS.indexOf(next[0]) + 1) : "Review the last lesson"} →</button><button class="btn" data-mode-go="quiz">Test yourself</button></div>`); };

/* theme */
const THEMES = ["auto", "light", "dark"], THEME_TXT = {auto: "automatic (follows your device)", light: "light", dark: "dark"};
function applyTheme(t) { if (t === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
  $("#themebtn").title = "Theme: " + THEME_TXT[t]; }
applyTheme(saved.theme || "auto");
$("#themebtn").addEventListener("click", () => { const t = THEMES[(THEMES.indexOf(saved.theme || "auto") + 1) % 3]; saved.theme = t; store.set(saved); applyTheme(t); toast("Theme: " + THEME_TXT[t]); });

/* welcome and help */
function closeOverlay() { const o = $("#overlay"); if (o.hidden) return; o.hidden = true; o.innerHTML = ""; if (!saved.welcomed) { saved.welcomed = 1; store.set(saved); } }
function showWelcome(isHelp) {
  const o = $("#overlay");
  o.innerHTML = `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgT">
    <h2 id="dlgT">${isHelp ? "How to use the atlas" : "Welcome to the Mental Map Atlas"}</h2>
    <p>The goal is a map of the world you can see with your eyes closed: where each country sits, what borders it, and why that matters.</p>
    <div class="cards">
      <button class="cardbtn" data-dlg="explore"><span class="ic">🧭</span><b>Explore</b><span>Tap countries and walk across borders</span></button>
      <button class="cardbtn" data-dlg="course"><span class="ic">🎓</span><b>Learn</b><span>${COURSE.length} lessons that build the picture</span></button>
      <button class="cardbtn" data-dlg="quiz"><span class="ic">🎯</span><b>Play</b><span>Test what has stuck</span></button>
      <button class="cardbtn" data-dlg="tools"><span class="ic">📏</span><b>Tools</b><span>Distances and true sizes</span></button>
    </div>
    <dl class="tips">
      <dt>Tap</dt><dd>Open a country, or read coordinates on the sea.</dd>
      <dt>Drag · pinch</dt><dd>Move and zoom the map. On a computer, scroll to zoom.</dd>
      <dt>Search</dt><dd>Countries, capitals, cities, seas and mountains. On a keyboard, press <kbd>/</kbd>.</dd>
      <dt>Map button</dt><dd>Change projection, or switch layers such as rivers, cities and time zones.</dd>
      <dt>Handle</dt><dd>On a phone, drag the bar above the reading panel to give the map more room.</dd>
      <dt>Back</dt><dd>Your browser's Back button works, and every country has a link you can share.</dd>
    </dl>
    <div class="btnrow" style="justify-content:flex-end;margin:0"><button class="btn primary" data-dlg="close">${isHelp ? "Got it" : "Start exploring"}</button></div></div>`;
  o.hidden = false; setTimeout(() => o.querySelector("[data-dlg=close]").focus(), 30); }
$("#overlay").addEventListener("click", e => { const b = e.target.closest("[data-dlg]");
  if (b) { const v = b.dataset.dlg; closeOverlay(); if (v !== "close") setMode(v); return; }
  if (e.target.id === "overlay") closeOverlay(); });
$("#helpbtn").addEventListener("click", () => showWelcome(true));

/* phone: drag or tap the handle to share the screen between map and reading */
(() => { const g = $("#grip"); let y0 = null, h0 = 0, moved = 0;
  const setH = px => { const vh = window.innerHeight, cl = Math.max(vh * .2, Math.min(vh * .76, px)); document.documentElement.style.setProperty("--mh", cl + "px"); };
  const done = () => setTimeout(() => refit(true), 280);
  g.addEventListener("pointerdown", e => { y0 = e.clientY; h0 = $("#mapwrap").getBoundingClientRect().height; moved = 0; g.setPointerCapture(e.pointerId); $("#main").style.transition = "none"; });
  g.addEventListener("pointermove", e => { if (y0 == null) return; moved = Math.max(moved, Math.abs(e.clientY - y0)); if (moved > 4) setH(h0 + e.clientY - y0); });
  g.addEventListener("pointerup", () => { $("#main").style.transition = ""; if (y0 == null) return; y0 = null;
    if (moved <= 4) { const big = h0 > window.innerHeight * .5; setH(window.innerHeight * (big ? .3 : .66)); } done(); }); })();
const _refit0 = refit;
refit = function (force) { if (force) lastSize = [0, 0]; _refit0(); };

/* installable on GitHub Pages: works offline after the first visit */
if (/github\.io$/.test(location.hostname)) {
  try { const l = document.createElement("link"); l.rel = "manifest"; l.href = "manifest.webmanifest"; document.head.appendChild(l);
    const a = document.createElement("link"); a.rel = "apple-touch-icon"; a.href = "icon-192.png"; document.head.appendChild(a);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {}); } catch (e) {} }
