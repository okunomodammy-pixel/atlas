/* ---------- batch 24: compare two countries ----------
   Any two countries side by side, on every figure the registry can compare. Each row says where both sit
   among all countries, flags when the two values are of different kinds (an estimate against a projection),
   and links to the figure's explanation. Nothing is derived beyond plain ratios and differences. */
const VS_GROUPS = [
  ["People", ["pop", "median_age", "tfr", "life_exp", "imr", "pop_growth", "pop_change_2050"]],
  ["Money", ["gdp_usd_25", "gdp_pc_25", "gdp_growth_26", "cpi_avg_26", "unemp_26", "ca_26"]],
  ["Movement", ["net_mig", "mig_share", "mig_in", "mig_out"]],
  ["Energy and climate", ["oil_share", "gas_share", "ndgain"]]
];
const vsKey = c3 => { const k = k3(c3); return k && byKey.get(k) ? k : null; };
const vsAll = () => Object.values(D.facts).filter(f => f.un || f.obs).sort((a, b) => a.n.localeCompare(b.n));
function vsPartner(c3) { const f = byKey.get(k3(c3)); if (!f) return "GHA";
  const pop = c => ival("pop", c) || 0, nb = (f.b || []).map(x => byKey.get(k3(x))).filter(x => x && (x.un || x.obs));
  if (nb.length) return nb.sort((a, b) => pop(b.c3) - pop(a.c3))[0].c3;
  const same = vsAll().filter(x => x.c3 !== f.c3 && x.sub === f.sub);
  const p0 = pop(f.c3); same.sort((a, b) => Math.abs(Math.log((pop(a.c3) || 1) / (p0 || 1))) - Math.abs(Math.log((pop(b.c3) || 1) / (p0 || 1))));
  return same.length ? same[0].c3 : f.c3 === "NGA" ? "GHA" : "NGA"; }
/* where each value sits among all countries with data: 0 = lowest, 1 = highest */
function vsDots(id, a, b) { const set = setOf(id); if (set.length < 10) return "";
  const pos = v => v == null ? null : set.filter(x => x.v < v).length / (set.length - 1 || 1);
  const pa = pos(a), pb = pos(b), X = p => (Math.min(1, p) * 100).toFixed(1);
  return `<div class="vsdots" aria-hidden="true">${pb != null ? `<i class="vb" style="left:${X(pb)}%"></i>` : ""}${pa != null ? `<i class="va" style="left:${X(pa)}%"></i>` : ""}</div>`; }
/* "the" before names that take it, so sentences read naturally */
const VS_THE = /^(United |Netherlands|Philippines|Bahamas|Gambia|Central African|Dominican Republic|Republic of the|Marshall|Solomon|Maldives|Comoros|Seychelles)/;
const theN = (n, cap) => VS_THE.test(n) ? (cap ? "The " : "the ") + n : n;
/* the difference, stated as which country is higher and by how much; neither direction is called better */
function vsUnit(id) { const u = IND[id].unit || "", m = (CMP[id] || {}).m;
  if (u.includes("%") || m === "share") return " points"; if (u === "years") return " years"; if (u === "children") return " children";
  if (u.startsWith("per 1,000")) return " per 1,000"; return ""; }
const vsTimes = r => r >= 10 ? fmt(Math.round(r)) : r.toFixed(1);
function vsDiff(id, a, b, A, B) { if (a == null || b == null) return "";
  const m = (CMP[id] || {}).m, hi = a >= b ? A : B;
  if (m === "level" && a > 0 && b > 0 && IND[id].unit !== "years") { const r = Math.max(a, b) / Math.min(a, b);
    if (r < 1.005) return "about the same"; return `<b>${esc(hi.n)}</b><br>${r >= 2 ? vsTimes(r) + " times" : "+" + Math.round((r - 1) * 100) + "%"}`; }
  const d = Math.abs(a - b); if (d < .05) return "about the same";
  return `<b>${esc(hi.n)}</b><br>+${d >= 100 ? fmt(Math.round(d)) : d.toFixed(1)}${vsUnit(id)}`; }
function vsGlance(A, B) { const out = [], pa = ival("pop", A.c3), pb = ival("pop", B.c3), ga = ival("gdp_pc_25", A.c3), gb = ival("gdp_pc_25", B.c3);
  if (pa && pb) { const [big, small, r] = pa >= pb ? [A, B, pa / pb] : [B, A, pb / pa];
    out.push(r < 1.1 ? `${esc(theN(A.n, 1))} and ${esc(theN(B.n))} have about the same number of people.` : `${esc(theN(big.n, 1))} has <b>${vsTimes(r)} times</b> as many people as ${esc(theN(small.n))}.`); }
  if (ga && gb) { const [rich, poor, r] = ga >= gb ? [A, B, ga / gb] : [B, A, gb / ga];
    out.push(r < 1.1 ? "Their output per person is about the same." : `Output per person in ${esc(theN(rich.n))} is <b>${vsTimes(r)} times</b> ${esc(theN(poor.n))}'s (${r >= 2 ? "in US dollars at market exchange rates, which widen the gap because prices are lower in poorer countries" : "in US dollars at market exchange rates"}).`); }
  if (pa && pb && ga && gb && (pa - pb) * (pa * ga - pb * gb) < 0) out.push("So the smaller population has the larger economy.");
  return out.length ? `<p class="vsglance">${out.join(" ")}</p>` : ""; }
function vsRow(id, A, B) { const r = IND[id]; if (!r || !CMP[id]) return "";
  const a = ival(id, A.c3), b = ival(id, B.c3); if (a == null && b == null) return "";
  const ka = r.st ? r.st(A.c3) || r.kind : r.kind, kb = r.st ? r.st(B.c3) || r.kind : r.kind;
  const mixed = a != null && b != null && ka !== kb ? ` · <span class="kmix">${esc(A.n)}: ${esc((KIND[ka] || ka).toLowerCase())}; ${esc(B.n)}: ${esc((KIND[kb] || kb).toLowerCase())}</span>` : "";
  const per = r.period && !r.name.includes(r.period) ? esc(r.period) : "", val = v => v == null ? `<span class="src">no data</span>` : esc(r.f(v));
  return `<div class="vsr"><div class="vsn"><button class="lnk" data-ind="${id}">${esc(r.name)}</button>${per || mixed ? ` <span class="src">${per}${mixed}</span>` : ""}</div>
    <div class="vsv"><span>${val(a)}</span><span>${val(b)}</span><span class="vsd">${vsDiff(id, a, b, A, B)}</span></div>${vsDots(id, a, b)}</div>`; }
function compareCountriesHTML(a, b) { const A = byKey.get(vsKey(a)), B = byKey.get(vsKey(b));
  const opt = sel => vsAll().map(f => `<option value="${esc(f.c3)}"${f.c3 === sel ? " selected" : ""}>${esc(f.n)}</option>`).join("");
  const groups = VS_GROUPS.map(([g, ids]) => { const rows = ids.map(id => vsRow(id, A, B)).join(""); return rows ? `<h4 class="vsg">${esc(g)}</h4>${rows}` : ""; }).join("");
  const shared = (A.b || []).includes(B.c3);
  return `<div class="dialog cmp vs" role="dialog" aria-modal="true" aria-labelledby="cmpT"><div class="eyebrow">${shared ? "Neighbours compared" : "Two countries compared"}</div>
    <h2 id="cmpT">${esc(A.flag)} ${esc(A.n)} <span class="vsand">and</span> ${esc(B.flag)} ${esc(B.n)}</h2>
    <div class="pick"><label>Country <select data-vsa>${opt(A.c3)}</select></label><button class="btn" data-vsswap aria-label="Swap the two countries">Swap</button><label>with <select data-vsb>${opt(B.c3)}</select></label></div>
    ${vsGlance(A, B)}
    <div class="vst"><div class="vsv vshead"><span><i class="vkey va"></i>${esc(A.n)}</span><span><i class="vkey vb"></i>${esc(B.n)}</span><span class="vsd">Which is higher</span></div>${groups}</div>
    <p class="src">The line under each row runs from the lowest country in the world to the highest, so you can see whether a gap is large by world standards. Where the two values are of different kinds, the row says so. Figures show how the countries differ, not why: that takes history, geography and policy, which the profiles cover.</p>
    <div class="btnrow" style="margin:14px 0 0"><button class="btn" data-vsopen="${esc(vsKey(A.c3))}">Open ${esc(A.n)}</button><button class="btn" data-vsopen="${esc(vsKey(B.c3))}">Open ${esc(B.n)}</button><button class="btn" data-vsshare>Share</button><button class="btn primary" data-dlg="close">Close</button></div></div>`; }
function compareCountries(a, b) { if (!vsKey(a)) return; if (!b || !vsKey(b) || b === a) b = vsPartner(a);
  $("#overlay").innerHTML = compareCountriesHTML(a, b); $("#overlay").hidden = false; $("#overlay .dialog").scrollTop = 0; S.lastSheet = () => compareCountries(a, b);
  const o = $("#overlay"), go = () => compareCountries(o.querySelector("select[data-vsa]").value, o.querySelector("select[data-vsb]").value);
  o.querySelectorAll("select[data-vsa],select[data-vsb]").forEach(s => s.addEventListener("change", go));
  o.querySelector("[data-vsswap]").addEventListener("click", e => { e.stopPropagation(); compareCountries(b, a); });
  o.querySelectorAll("[data-vsopen]").forEach(x => x.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); closeOverlay();
    if (S.mode !== "explore") setMode("explore"); selectCountry(x.dataset.vsopen, true); }));
  o.querySelector("[data-vsshare]").addEventListener("click", async e => { e.stopPropagation(); const url = shareURL(`vs/${a}/${b}`), title = `${nameOf(vsKey(a))} and ${nameOf(vsKey(b))} · Mental Map Atlas`;
    try { if (navigator.share) { await navigator.share({title, url}); return; } } catch (er) { if (er && er.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); toast("Link copied"); } catch (er) { toast(url, 6000); } }); }
ACT.vs = el => compareCountries(el.dataset.c3, el.dataset.b);
const routeHashVS = routeHash;
routeHash = function (initial) { let h = ""; try { h = decodeURIComponent((location.hash || "").slice(1)); } catch (e) {}
  const m = /^vs\/([A-Z]{3})(?:\/([A-Z]{3}))?$/.exec(h);
  if (m && vsKey(m[1])) { routing = true; try { setMode("explore", true); MODES.explore(); } finally { routing = false; } setTimeout(() => compareCountries(m[1], m[2]), 50); return; }
  return routeHashVS(initial); };
