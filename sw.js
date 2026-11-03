// Gör appen användbar utan nät. Allt hämtas från nätet i första hand, så att nya versioner syns direkt;
// den sparade kopian används bara när nätet saknas.
const SHELL="shell-v32";
const FILES=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","logo.svg","decl-logo.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==SHELL&&k!=="pdf-v2").map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin)return;
  const isPdf=u.pathname.includes("/data/")&&u.pathname.endsWith(".bin")&&!u.pathname.endsWith("rutt.bin");
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{
    if(r.ok){const cp=r.clone();
      if(isPdf)caches.open("pdf-v2").then(c=>c.put(u.pathname,cp));
      else if(!u.pathname.includes("/data/"))caches.open(SHELL).then(c=>c.put(e.request.mode==="navigate"?"index.html":e.request,cp));}
    return r;
  }).catch(()=>caches.match(isPdf?u.pathname:e.request).then(m=>m||(e.request.mode==="navigate"?caches.match("index.html"):caches.match(u.pathname)))));
});
