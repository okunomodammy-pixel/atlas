// One canonical document, bounded assets, and explicit activation of updates.
const C = "mma-14140ced17";
const PAGE = "fd0c09110b3f7d5830d9fe3c06e5a2f4debac7a0d74e047e029db1c41c717fe0";
const DIGESTS = {"manifest.webmanifest":"5d152f0ed95038d95a66e302acdb93c80a58b0dc69e54bb220f31323129c1cd2","icon-192.png":"1884756be716d56c0e31e5bda46997fd745d20e6cc3742295ee0e76fdeb6f281","icon-512.png":"eb4111e138e62eb013352a27ad8f7527ffccd981c591f52b9997f151da44cbc6"};
const PREFIX = "atlas:" + self.registration.scope;
const CACHE = PREFIX + C;
const INDEX = new URL("index.html", self.registration.scope).href;
const ASSETS = ["manifest.webmanifest", "icon-192.png", "icon-512.png"].map(p=>new URL(p,self.registration.scope).href);
self.addEventListener("install",e=>e.waitUntil((async()=>{
  try {
    const response=await fetch(new Request(INDEX,{cache:"reload"}));
    if(!response.ok)throw new Error("Atlas download failed");
    const hash=await crypto.subtle.digest("SHA-256",await response.clone().arrayBuffer());
    const version=[...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,"0")).join("");
    if(version!==PAGE)throw new Error("The site is still publishing; retry later");
    const cache=await caches.open(CACHE);await cache.put(INDEX,response);
    for(const url of ASSETS) {
      const asset=await fetch(new Request(url,{cache:"reload"}));if(!asset.ok)throw new Error("An install asset is missing");
      const bytes=await crypto.subtle.digest("SHA-256",await asset.clone().arrayBuffer());
      const digest=[...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,"0")).join("");
      if(digest!==DIGESTS[url.split("/").pop()])throw new Error("An install asset is still publishing");
      await cache.put(url,asset);
    }
  } catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{
  for(const name of await caches.keys()) {
    if(name.startsWith(PREFIX) && name!==CACHE)await caches.delete(name);
    else if(/^mma-/.test(name) && await (await caches.open(name)).match(INDEX))await caches.delete(name);
  }
  await self.clients.claim();
})()));
self.addEventListener("message",e=>{
  if(e.data?.type==="ATLAS_APPLY_UPDATE")self.skipWaiting();
  if(e.data?.type==="ATLAS_STATUS")e.waitUntil((async()=>{
    const cache=await caches.open(CACHE);e.ports[0]?.postMessage({ready:!!(await cache.match(INDEX)),version:C});
  })());
});
self.addEventListener("fetch",e=>{
  const request=e.request,url=new URL(request.url);
  if(request.method!=="GET" || url.origin!==self.location.origin)return;
  if(request.mode==="navigate" || url.pathname===new URL(INDEX).pathname) {
    e.respondWith((async()=>{
      const saved=await (await caches.open(CACHE)).match(INDEX);if(saved)return saved;
      try{return await fetch(request);}catch(error){return new Response("The offline copy is unavailable. Reconnect and save the atlas again.",{status:503,headers:{"Content-Type":"text/plain"}});}
    })());return;
  }
  const asset=ASSETS.find(a=>new URL(a).pathname===url.pathname);
  if(asset)e.respondWith((async()=>{
    const saved=await (await caches.open(CACHE)).match(asset);if(saved)return saved;
    try{return await fetch(request);}catch(error){return new Response("Unavailable offline",{status:503});}
  })());
});
