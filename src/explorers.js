/* One atomic local save contains all explorers and a compatibility view of the active one. */
let explorerBook = null;
let pendingExplorerImport = null;
const EXPLORER_ICONS = ["🧭", "🌍", "🌊", "⛰️", "🌿", "☀️"];
function plainObject(value) { return !!value && typeof value === "object" && !Array.isArray(value); }
function checkSafeJSON(value, depth=0, count={n:0}) {
  if (++count.n > 80000 || depth > 24) throw new Error("This backup is too complex.");
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") { if (!Number.isFinite(value)) throw new Error("Invalid number in backup."); return; }
  if (typeof value !== "object") throw new Error("Invalid backup value.");
  for (const key of Object.keys(value)) {
    if (["__proto__","constructor","prototype"].includes(key)) throw new Error("Unsupported property in backup.");
    checkSafeJSON(value[key],depth+1,count);
  }
}
function cleanExplorerData(value) {
  if (!plainObject(value)) throw new Error("Progress must be an object.");
  const data = {...value}; delete data._explorers;
  checkSafeJSON(data);
  if (data.seen != null && (!Array.isArray(data.seen) || data.seen.length>2000 || data.seen.some(x=>typeof x!=="string"))) throw new Error("Invalid visited-place list.");
  for (const key of ["best","lessons","checks","mastered","srs","journeys","placeSkills"]) {
    if (data[key] != null && !plainObject(data[key])) throw new Error(`Invalid ${key} record.`);
  }
  for (const score of Object.values(data.best || {})) if (!Number.isFinite(score) || score<0) throw new Error("Invalid score.");
  for (const r of Object.values(data.srs || {})) {
    if (!plainObject(r) || !Number.isInteger(r.b) || r.b < -1 || r.b>4 || !Number.isInteger(r.d) || r.d<0 || !Number.isInteger(r.w) || r.w<0) throw new Error("Invalid review record.");
  }
  for (const r of Object.values(data.journeys || {})) {
    if (!plainObject(r)) throw new Error("Invalid journey record.");
    if (r.notes != null && (!plainObject(r.notes) || Object.values(r.notes).some(n=>typeof n!=="string" || n.length>600))) throw new Error("Invalid field note.");
    if (r.cursor != null && (!plainObject(r.cursor) || typeof r.cursor.view!=="string" || !Number.isInteger(r.cursor.stop) || r.cursor.stop<0)) throw new Error("Invalid journey position.");
    if(r.cursor && !["story","task","recap","review","journal","review-result"].includes(r.cursor.view))throw new Error("Unsupported journey screen.");
    for(const key of ["visited","tasks"])if(r[key]!=null && !plainObject(r[key]))throw new Error("Invalid journey progress.");
    if(r.cursor?.view==="review" || r.cursor?.view==="review-result") {
      if(!plainObject(r.review) || !Array.isArray(r.review.queue) || !r.review.queue.length || r.review.queue.some(x=>typeof x!=="string") || !Number.isInteger(r.review.index) || r.review.index<0 || r.review.index>r.review.queue.length || !plainObject(r.review.answers))throw new Error("Invalid saved review session.");
    }
    if(r.cursor?.view==="recap" && (!plainObject(r.recap) || !Array.isArray(r.recap.order) || !r.recap.order.length || r.recap.order.some(x=>typeof x!=="string") || !Number.isInteger(r.recap.index) || r.recap.index<0 || r.recap.index>=r.recap.order.length || !plainObject(r.recap.answers)))throw new Error("Invalid map reconstruction.");
  }
  return JSON.parse(JSON.stringify(data));
}
function prepareExplorerData(value) {
  const data = cleanExplorerData(value);
  for (const key of ["best","lessons","srs","checks"]) data[key] = data[key] || {};
  data.seen = data.seen || [];
  if (data.schemaVersion !== 2) {
    Object.entries(data.mastered || {}).forEach(([id,day])=>{if(data.checks[id]==null)data.checks[id]=day;});
    data.schemaVersion = 2;
  }
  return data;
}
function validateExplorerBook(book) {
  checkSafeJSON(book);
  if (!plainObject(book) || book.version!==1 || !Array.isArray(book.profiles) || !book.profiles.length || book.profiles.length>20) throw new Error("Unsupported explorer collection.");
  const ids = new Set();
  for (const p of book.profiles) {
    if (!plainObject(p) || typeof p.id!=="string" || !/^[\w-]{1,80}$/.test(p.id) || ids.has(p.id) || typeof p.name!=="string" || !p.name.trim() || p.name.length>40 || !EXPLORER_ICONS.includes(p.icon)) throw new Error("Invalid explorer details.");
    ids.add(p.id); p.data = cleanExplorerData(p.data);
  }
  if (!ids.has(book.active)) throw new Error("The active explorer is missing.");
  return book;
}
function readExplorerProgress(value) {
  const data = prepareExplorerData(value);
  if (Object.hasOwn(value,"_explorers")) {
    explorerBook = validateExplorerBook(JSON.parse(JSON.stringify(value._explorers)));
    explorerBook.profiles.find(p=>p.id===explorerBook.active).data = cleanExplorerData(data);
  } else explorerBook = {version:1,active:"original",profiles:[{id:"original",name:"My explorer",icon:EXPLORER_ICONS[0],data:cleanExplorerData(data)}]};
  return data;
}
function activeExplorer() { return explorerBook && explorerBook.profiles.find(p=>p.id===explorerBook.active); }
function updateExplorerButton() {
  const p=activeExplorer(), b=document.querySelector("#explorersbtn");
  if(b){b.title=p ? `${p.name} · explorers and backups` : "Explorers and backups"; b.setAttribute("aria-label",b.title);}
}
function writeExplorerBook(book,data) {
  if (store.unreadable || store.conflict) return false;
  try {
    const current=localStorage.getItem(store.key);
    if (store.lastRaw != null && current!==store.lastRaw) {store.conflict=true;store.notice("Another tab changed this save. Download a backup of this session, then reload to use the latest progress."); return false;}
    const candidate=validateExplorerBook(JSON.parse(JSON.stringify(book))), clean=cleanExplorerData(data);
    candidate.profiles.find(p=>p.id===candidate.active).data=clean;
    const raw=JSON.stringify({...clean,_explorers:candidate});
    localStorage.setItem(store.key,raw);
    store.lastRaw=raw; explorerBook=candidate; document.querySelector("#save-warning").hidden=true; updateExplorerButton(); return true;
  } catch(e) {store.notice("Progress could not be saved on this device. Keep this page open, download a backup, and retry before leaving.");return false;}
}
function newExplorerId() { return "explorer-"+(globalThis.crypto?.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2)); }
function switchExplorer(id,book=explorerBook) {
  if (!book || !book.profiles.some(p=>p.id===id)) return false;
  const candidate=JSON.parse(JSON.stringify(book));
  const old=candidate.profiles.find(p=>p.id===explorerBook.active); if(old)old.data=cleanExplorerData(saved);
  candidate.active=id; const data=prepareExplorerData(candidate.profiles.find(p=>p.id===id).data);
  if (!writeExplorerBook(candidate,data)) return false;
  stopQuiz(); saved=data; closeOverlay(); applyTheme(saved.theme || "auto"); setMode("explore");
  updateExplorerButton(); toast(`Now exploring as ${activeExplorer().name}`); return true;
}
function explorerSummary(data) {
  const notes=Object.values(data.journeys || {}).reduce((n,j)=>n+Object.values(j.notes || {}).filter(Boolean).length,0);
  return `${(data.seen || []).length} places opened · ${Object.keys(data.checks || data.mastered || {}).length} checks passed · ${notes} field notes`;
}
function explorerSheet(message="") {
  const o=$("#overlay"), current=activeExplorer();
  o.innerHTML=`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="explorer-title"><h2 id="explorer-title">Your explorers</h2>
    <p>Separate journeys, notes and reviews on one device. These are local profiles, not private accounts; anyone using this browser can switch.</p>
    ${message ? `<p class="note" role="status">${esc(message)}</p>` : ""}
    <div class="explorer-list">${(explorerBook?.profiles || []).map(p=>`<button class="explorer-choice" data-explorer-switch="${p.id}" ${p.id===explorerBook.active?'aria-current="true"':""}><span class="explorer-icon" aria-hidden="true">${p.icon}</span><span><b>${esc(p.name)}${p.id===explorerBook.active?" · current":""}</b><small>${esc(explorerSummary(p.id===explorerBook.active?saved:p.data))}</small></span></button>`).join("")}</div>
    ${current ? `<form id="explorer-rename"><label for="explorer-name">Current explorer's name</label><div class="explorer-form"><input id="explorer-name" name="name" value="${esc(current.name)}" maxlength="40" required><button class="btn" type="submit">Rename</button></div></form>` : ""}
    <details class="journey-detail"><summary>Add an explorer</summary><form id="explorer-create"><label for="new-explorer-name">Name or nickname</label><input id="new-explorer-name" name="name" maxlength="40" required placeholder="A name just for this device"><label for="new-explorer-icon">Choose a symbol</label><select id="new-explorer-icon" name="icon">${EXPLORER_ICONS.map(icon=>`<option>${icon}</option>`).join("")}</select><button class="btn primary" type="submit">Create explorer</button></form></details>
    <h3>Keep a copy</h3><p>Backups contain progress and personal notes. Download a file you can restore here or on another device.</p>
    <div class="btnrow"><button class="btn" data-backup="current">Download my backup</button><button class="btn" data-backup="all">Back up all explorers</button></div>
    <label for="explorer-import">Restore a backup</label><input id="explorer-import" type="file" accept="application/json,.json"><p class="src">Restore adds new explorers and keeps your existing ones. Maximum file size: 2 MB.</p>
    ${offlinePanelHTML()}<div id="explorer-result" role="status"></div><div class="btnrow"><button class="btn primary" data-dlg="close">Done</button></div></div>`;
  openOverlay();
  o.querySelectorAll("[data-explorer-switch]").forEach(b=>b.onclick=()=>{if(b.dataset.explorerSwitch!==explorerBook.active)switchExplorer(b.dataset.explorerSwitch);});
  const rename=o.querySelector("#explorer-rename"); if(rename)rename.onsubmit=e=>{
    e.preventDefault();const name=rename.elements.name.value.trim();if(!name)return;
    const book=JSON.parse(JSON.stringify(explorerBook));book.profiles.find(p=>p.id===book.active).name=name;
    if(writeExplorerBook(book,saved))explorerSheet("Name saved.");
  };
  o.querySelector("#explorer-create").onsubmit=e=>{
    e.preventDefault();const form=e.currentTarget,name=form.elements.name.value.trim();if(!name)return;
    if(!explorerBook || store.unreadable){$("#explorer-result").textContent="The original save is protected because it could not be read. Download this session's backup and reload when storage is available.";return;}
    if(explorerBook.profiles.length>=20){$("#explorer-result").textContent="This device already has 20 explorers. Keep backups before moving profiles to another device.";return;}
    const book=JSON.parse(JSON.stringify(explorerBook)),id=newExplorerId();
    book.profiles.push({id,name,icon:form.elements.icon.value,data:{welcomed:1}});switchExplorer(id,book);
  };
  o.querySelectorAll("[data-backup]").forEach(b=>b.onclick=()=>downloadExplorerBackup(b.dataset.backup==="all"));
  o.querySelector("#explorer-import").onchange=async e=>{
    const file=e.target.files[0];if(!file)return;
    try{if(file.size>2_000_000)throw new Error("Choose a backup smaller than 2 MB.");previewExplorerImport(await file.text());}
    catch(err){pendingExplorerImport=null;$("#explorer-result").textContent=err.message;}
  };
  wireOfflinePanel();
}
function explorerBackup(all=false) {
  const book=explorerBook ? JSON.parse(JSON.stringify(explorerBook)) : {profiles:[],active:""};
  if(activeExplorer())book.profiles.find(p=>p.id===book.active).data=cleanExplorerData(saved);
  const profiles=book.profiles.length ? all ? book.profiles : [book.profiles.find(p=>p.id===book.active)] : [{id:"recovery",name:"Recovered session",icon:EXPLORER_ICONS[0],data:cleanExplorerData(saved)}];
  return {format:"mental-map-atlas-backup",version:1,exportedAt:new Date().toISOString(),active:profiles.some(p=>p.id===book.active)?book.active:profiles[0].id,profiles};
}
function downloadExplorerBackup(all) {
  const blob=new Blob([JSON.stringify(explorerBackup(all),null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=`atlas-${all?"all-explorers":"explorer"}-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function parseExplorerBackup(text) {
  if(typeof text!=="string" || new Blob([text]).size>2_000_000)throw new Error("Choose a backup smaller than 2 MB.");
  let value;try{value=JSON.parse(text);}catch(e){throw new Error("This file is not valid JSON. Your current progress has not changed.");}
  checkSafeJSON(value);
  if(!plainObject(value))throw new Error("This does not look like an Atlas backup.");
  if(value.format==="mental-map-atlas-backup") {
    if(value.version!==1)throw new Error("This backup version is not supported.");
    return validateExplorerBook({version:1,active:value.active,profiles:value.profiles}).profiles;
  }
  if(plainObject(value) && value._explorers)return validateExplorerBook(value._explorers).profiles;
  if(plainObject(value) && ["seen","srs","best","journeys","checks","mastered"].some(k=>Object.hasOwn(value,k)))return [{id:"legacy",name:"Restored explorer",icon:EXPLORER_ICONS[0],data:prepareExplorerData(value)}];
  throw new Error("This does not look like an Atlas backup.");
}
function previewExplorerImport(text) {
  const profiles=parseExplorerBackup(text);
  if((explorerBook?.profiles.length || 0)+profiles.length>20)throw new Error("Restoring this file would exceed 20 explorers on this device.");
  pendingExplorerImport=profiles;
  const target=$("#explorer-result");
  target.innerHTML=`<div class="note"><h4>Ready to restore ${profiles.length} explorer${profiles.length===1?"":"s"}</h4>${profiles.map(p=>`<p><b>${esc(p.name)}</b><br>${esc(explorerSummary(p.data))}</p>`).join("")}<p>Your existing explorers will be kept.</p><button class="btn primary" id="explorer-restore">Add restored explorers</button></div>`;
  $("#explorer-restore").onclick=restorePendingExplorers;
}
function restorePendingExplorers() {
  if(!pendingExplorerImport)return false;
  if(!explorerBook || store.unreadable){$("#explorer-result").textContent="The unreadable original save is protected. Download this session's backup before reloading.";return false;}
  const book=JSON.parse(JSON.stringify(explorerBook));
  book.profiles.find(p=>p.id===book.active).data=cleanExplorerData(saved);
  const added=pendingExplorerImport.map(p=>({...p,id:newExplorerId(),name:(p.name+" (restored)").slice(0,40),data:prepareExplorerData(p.data)}));
  book.profiles.push(...added);
  if(!writeExplorerBook(book,saved))return false;
  pendingExplorerImport=null;explorerSheet(`Restored ${added.length} explorer${added.length===1?"":"s"}. Select one to continue.`);return true;
}
window.addEventListener("storage",e=>{
  if(e.key===store.key && e.newValue!==store.lastRaw){store.conflict=true;store.notice("Another tab changed this save. Download a backup of this session, then reload to use the latest progress.");}
});
