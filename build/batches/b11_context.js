/* ---------- batch 11: keep your place — place card and a view stack ---------- */
/* In Explore, tapping a country opens its profile as before. Inside a lesson, tool or the course page, a tap opens a small
   place card instead, so the lesson text and its map stay put. "Open profile" pushes the profile on top of the lesson;
   Back (the button or the browser's Back) restores the lesson exactly: text, scroll position, colours, pins, routes and view. */
const VIEW = [];
const inStackMode = () => S.mode !== "explore" && S.mode !== "quiz";
function groupsOf(c3) {
  const f = byKey.get(k3(c3)), out = [];
  if (!f) return out;
  if ((f.reg === "Africa" && f.un) || c3 === "ESH") out.push(BLOC9.AU.groups[1][0].includes(c3) ? "AU (suspended)" : "AU");
  if (ECOWAS.includes(c3)) out.push("ECOWAS"); if (AES.includes(c3)) out.push("AES");
  const named = {NATO: "NATO", EU: "EU", ASEAN: "ASEAN", SCO: "SCO", OPEC: "OPEC"};
  Object.entries(named).forEach(([k, n]) => { if (BLOC9[k].groups[0][0].includes(c3)) out.push(n); });
  const br = BLOC9.BRICS.groups; if (br[1][0].includes(c3)) out.push("BRICS"); else if (br[0][0].includes(c3)) out.push("BRICS partner");
  const sc = BLOC9.UNSC.groups; if (sc[0][0].includes(c3)) out.push("UN Security Council (permanent)"); else if (sc[1][0].includes(c3) || sc[2][0].includes(c3)) out.push("UN Security Council (elected)");
  if (BLOC9.NUKE.groups.some(g => g[0].includes(c3))) out.push("nuclear-armed");
  return out; }
function showPeek(k) {
  const f = byKey.get(k), el = $("#peek"); banner(null);
  G.countries.selectAll("path").classed("peeked", d => d.key === k).filter(d => d.key === k).raise();
  if (!f) { el.innerHTML = `<button class="px" data-peek="close" aria-label="Close">×</button><b class="pn">${esc(nameOf(k))}</b><p class="ps">${esc(STATUS[k.replace(/^x:/, "")] || "Disputed or special status.")}</p>`; el.hidden = false; return; }
  const gs = groupsOf(f.c3);
  el.innerHTML = `<button class="px" data-peek="close" aria-label="Close">×</button>
    <div class="ph"><span class="pf">${esc(f.flag || "")}</span><div><b class="pn">${esc(f.n)}</b><span class="ps">${esc(f.sub || continentOf(f) || "")}</span></div></div>
    <div class="pfacts"><span><small>Capital</small>${esc((f.cap || [])[0] || "—")}</span><span><small>People</small>${f.pop ? shortNum(f.pop) : "—"}</span><span><small>Median age</small>${f.w && f.w.ma != null ? Math.round(f.w.ma) : "—"}</span></div>
    ${gs.length ? `<div class="pg">${gs.map(g => `<i>${esc(g)}</i>`).join("")}</div>` : ""}
    <div class="pb"><button class="btn primary" data-peek="open" data-k="${esc(k)}">Open profile</button><button class="btn" data-peek="zoom" data-k="${esc(k)}">Zoom to</button></div>`;
  el.hidden = false; }
function showPeekHTML(html) { const el = $("#peek"); el.innerHTML = `<button class="px" data-peek="close" aria-label="Close">×</button>${html}`; el.hidden = false; }
function hidePeek() { const el = $("#peek"); if (el) el.hidden = true; G.countries.selectAll("path.peeked").classed("peeked", false); }
$("#peek").addEventListener("click", e => { const b = e.target.closest("[data-peek]"); if (!b) return; e.stopPropagation();
  const v = b.dataset.peek, k = b.dataset.k;
  if (v === "close") hidePeek();
  else if (v === "zoom") { if (featByKey.has(k)) flyTo(featByKey.get(k), {maxk: 10}); else if (centroid.has(k)) flyToPoint(centroid.get(k), 12); }
  else if (v === "open") openProfile(k); });
function snapshot() { return { html: panel.innerHTML, scroll: panel.scrollTop, label: NAV_LABEL[S.mode] || "previous view", mode: S.mode,
  t: S.proj === "globe" ? null : S.t, rot: S.proj === "globe" ? projection.rotate() : null, k: S.k,
  pins: G.pins.selectAll("circle").data().slice(), routes: G.routes.selectAll("path").data().slice(),
  legend: {html: $("#legend").innerHTML, hidden: $("#legend").hidden}, pushed: false }; }
function openProfile(k) {
  hidePeek();
  if (!VIEW.length) { const s = snapshot(); try { history.pushState({mmaView: 1}, "", location.href); s.pushed = true; } catch (e) {} VIEW.push(s); }
  S.sel = k; paint(); setPins([]); setRoutes([]); legend(null);
  if (featByKey.has(k)) flyTo(featByKey.get(k)); else if (centroid.has(k)) flyToPoint(centroid.get(k), 14);
  markSeen(k); setPanel(countryPanel(k)); }
function popView() { const v = VIEW.pop(); VIEW.length = 0; if (!v) return; hidePeek();
  if (v.mode !== S.mode) return;
  S.sel = null; paint(); setPins(v.pins); setRoutes(v.routes);
  const l = $("#legend"); l.innerHTML = v.legend.html; l.hidden = v.legend.hidden;
  panel.innerHTML = v.html; panel.scrollTop = v.scroll;
  if (v.t) svg.transition().duration(700).call(zoom.transform, v.t);
  else if (v.rot) { projection.rotate(v.rot); S.k = v.k; projection.scale(baseScale * v.k); render(); } }
ACT.popview = () => { const v = VIEW[0]; if (v && v.pushed) { try { history.back(); return; } catch (e) {} } popView(); };
