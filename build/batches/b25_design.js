/* ---------- batch 25: design review ----------
   Map labels no longer pile on top of each other: after each zoom or pan settles, labels are placed in order of
   importance (Nigerian states, countries, cities, oceans and seas, landforms) and any label that would overlap
   one already placed is hidden until there is room for it. */
const DECLUTTER = [["stateslabels", null], ["cities", null, d => d.force], ["countrylabels", (a, b) => a.minz - b.minz],
  ["cities", (a, b) => (b.cap ? 1 : 0) - (a.cap ? 1 : 0), d => !d.force], ["seas", (a, b) => a.minz - b.minz || (a.c === "ocean" ? -1 : 0)], ["phys", (a, b) => a.minz - b.minz]];
function declutter() { const placed = [], box = el => { const t = el.tagName === "g" ? el.querySelector("text") || el : el, r = t.getBoundingClientRect(); return r.width ? [r.left - 2, r.top - 1, r.right + 2, r.bottom + 1] : null; };
  const hit = r => placed.some(q => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]);
  DECLUTTER.forEach(([g, order, only]) => { const grp = G[g]; if (!grp || grp.attr("display") === "none") return;
    let items = grp.selectAll(g === "cities" ? "g" : "text").nodes().filter(n => n.getAttribute("display") !== "none" && (!only || only(n.__data__ || {})));
    if (order) items = items.map(n => [n, n.__data__ || {}]).sort((x, y) => order(x[1], y[1])).map(x => x[0]);
    items.forEach(n => { const r = box(n); if (!r) return; if (hit(r)) n.setAttribute("display", "none"); else placed.push(r); }); }); }
/* state labels are not managed by the zoom rules, so they are shown again before each pass */
const labelVisibilityDC = labelVisibility;
/* with a data layer on, only the oceans stay named, so the colours carry the map */
labelVisibility = function () { labelVisibilityDC(); if (G.stateslabels) G.stateslabels.selectAll("text").attr("display", null);
  if (S.theme && S.theme !== "ngpov") G.seas.selectAll("text").filter(d => d.c !== "ocean").attr("display", "none");
  try { declutter(); } catch (e) {} };
let dcT = 0; const renderDC = render;
render = function () { renderDC(); clearTimeout(dcT); dcT = setTimeout(() => labelVisibility(), 140); };
const setThemeDC = setTheme;
setTheme = function (v) { setThemeDC(v); labelVisibility(); };
