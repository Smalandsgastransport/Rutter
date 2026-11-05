// Gör appen användbar utan nät. Allt hämtas från nätet i första hand, så att nya versioner syns direkt;
// den sparade kopian används bara när nätet saknas.
const SHELL="shell-v85";
const FILES=["./","index.html","manifest.webmanifest","arkiv.html","arkiv.webmanifest","icon-180.png","icon-192.png","icon-512.png","logo.svg","decl-logo.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==SHELL&&k!=="pdf-v2").map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin)return;
  const isPdf=u.pathname.includes("/data/")&&u.pathname.endsWith(".bin")&&!u.pathname.endsWith("rutt.bin");
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{
    if(r.ok){const cp=r.clone();
      if(isPdf)caches.open("pdf-v2").then(c=>c.put(u.pathname,cp));
      else if(!u.pathname.includes("/data/"))caches.open(SHELL).then(c=>c.put(e.request.mode==="navigate"?(u.pathname.endsWith("arkiv.html")?"arkiv.html":"index.html"):e.request,cp));}
    return r;
  }).catch(()=>caches.match(isPdf?u.pathname:e.request).then(m=>m||(e.request.mode==="navigate"?caches.match(u.pathname.endsWith("arkiv.html")?"arkiv.html":"index.html"):caches.match(u.pathname)))));
});

self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{for(const c of cs){if("focus" in c)return c.focus()}return self.clients.openWindow("./")}))});

self.addEventListener("push",e=>{let d={};try{d=e.data.json()}catch(x){}e.waitUntil(self.registration.showNotification(d.title||"Transport Planering",{body:d.body||"",icon:"icon-192.png",badge:"icon-192.png",tag:d.tag||"rutt",renotify:true,vibrate:[200,100,200]}))});
