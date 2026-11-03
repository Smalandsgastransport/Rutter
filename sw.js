// Gör appen användbar utan nät: själva appen sparas, data hämtas från nätet i första hand.
const SHELL="shell-v3";
const FILES=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","logo.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==SHELL&&k!=="pdf-v2").map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin)return;
  if(u.pathname.includes("/data/")){
    // Rutter och PDF:er: nätet först, sparad kopia om nätet saknas.
    e.respondWith(fetch(e.request).then(r=>{if(r.ok&&u.pathname.endsWith(".bin")&&!u.pathname.endsWith("rutt.bin")){const cp=r.clone();caches.open("pdf-v2").then(c=>c.put(u.pathname,cp))}return r}).catch(()=>caches.match(u.pathname).then(m=>m||caches.match(e.request))));
    return;
  }
  e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request)));
});
