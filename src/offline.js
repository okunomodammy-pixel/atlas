const offlineState={mode:"checking",registration:null,ready:false,update:false,error:"",applying:false};
function offlineText() {
  if(location.protocol==="file:")return "Standalone edition: the atlas and journeys are included in this file. Keep a progress backup too.";
  if(offlineState.error)return offlineState.error+(offlineState.ready?" Your saved version remains available offline.":"");
  if(offlineState.update)return "An update is ready. Your current saved version remains available until you apply it.";
  if(offlineState.ready)return navigator.onLine ? "Ready offline · your atlas and journeys are saved on this device." : "Offline · using the saved atlas and journeys.";
  if(offlineState.mode==="unsupported")return "Use the published site to save an offline copy, or download the standalone edition.";
  return "Checking the offline copy. You can keep exploring.";
}
function offlinePanelHTML() {
  return `<section class="offline-state"><h3>Offline & updates</h3><p id="offline-detail" role="status">${esc(offlineText())}</p>
    ${location.protocol!=="file:" ? '<div class="btnrow"><button class="btn" id="offline-save">Save / check offline copy</button><button class="btn primary" id="offline-apply" hidden>Save progress & apply update</button></div>' : ""}
    <p class="src">An offline copy keeps the app available; a downloaded backup protects your notes and progress if browser data is cleared. They are separate.</p></section>`;
}
function paintOfflineStatus() {
  const detail=$("#offline-detail");if(detail)detail.textContent=offlineText();
  const inline=$("#offline-inline");if(inline)inline.textContent=location.protocol==="file:" ? "Standalone · available offline" : offlineState.ready ? "Ready offline" : offlineState.update ? "Update ready" : "Offline copy: open Explorers to check";
  const apply=$("#offline-apply");if(apply)apply.hidden=!offlineState.update;
}
function workerStatus(worker) {
  return new Promise(resolve=>{
    if(!worker){resolve(false);return;}
    const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(false);},1800);
    channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(!!e.data.ready);};
    worker.postMessage({type:"ATLAS_STATUS"},[channel.port2]);
  });
}
async function checkOfflineState() {
  const reg=offlineState.registration;if(!reg)return;
  offlineState.update=!!reg.waiting;offlineState.ready=await workerStatus(reg.active);paintOfflineStatus();
}
async function startOfflineSupport() {
  if(location.protocol==="file:"){offlineState.mode="standalone";paintOfflineStatus();return;}
  if(!$("meta[name=atlas-installable]") || !("serviceWorker" in navigator) || !isSecureContext){offlineState.mode="unsupported";paintOfflineStatus();return;}
  try {
    const manifest=document.createElement("link");manifest.rel="manifest";manifest.href="manifest.webmanifest";document.head.appendChild(manifest);
    const icon=document.createElement("link");icon.rel="apple-touch-icon";icon.href="icon-192.png";document.head.appendChild(icon);
    const reg=await navigator.serviceWorker.register("sw.js");offlineState.registration=reg;
    const watch=worker=>{if(!worker)return;worker.addEventListener("statechange",()=>{
      if(worker.state==="installed" || worker.state==="activated")checkOfflineState();
      if(worker.state==="redundant"){offlineState.error="The new offline copy could not be saved. Keep using this version and retry when connected.";paintOfflineStatus();}
    });};
    watch(reg.installing);reg.addEventListener("updatefound",()=>watch(reg.installing));
    navigator.serviceWorker.addEventListener("controllerchange",()=>{if(offlineState.applying)location.reload();else checkOfflineState();});
    await checkOfflineState();reg.update().catch(()=>{});
  } catch(e) {offlineState.error="The offline copy could not be confirmed. Try again while connected; the atlas still works in this page.";paintOfflineStatus();}
}
function wireOfflinePanel() {
  const save=$("#offline-save"),apply=$("#offline-apply");paintOfflineStatus();
  if(save)save.onclick=async()=>{
    save.disabled=true;
    try {
      if(!offlineState.registration)await startOfflineSupport();
      if(!offlineState.registration)throw new Error("Installation is unavailable in this copy. Use the published site or standalone download.");
      offlineState.error="";await offlineState.registration.update();
      await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error("The offline copy is not ready yet. Keep this page open and try again while connected.")),10000))]);
      await checkOfflineState();if(!offlineState.ready && !offlineState.update)throw new Error("The offline copy could not be confirmed. Please retry while connected.");
    } catch(e){offlineState.error=e.message;}
    finally {save.disabled=false;paintOfflineStatus();}
  };
  if(apply)apply.onclick=()=>{
    const worker=offlineState.registration?.waiting;if(!worker)return;
    if(!store.set(saved)){offlineState.error="Save or download your progress before applying the update.";paintOfflineStatus();return;}
    offlineState.applying=true;apply.disabled=true;worker.postMessage({type:"ATLAS_APPLY_UPDATE"});
  };
}
window.addEventListener("online",()=>{paintOfflineStatus();checkOfflineState();});
window.addEventListener("offline",paintOfflineStatus);
