/* Mind-OS Service Worker v2026.1 — офлайн + PWA установка */
const CACHE = 'mindos-2026-28';
const PRECACHE = ['./','./index.html','./faq.html','./protocols.html','./poll.html','./css/style.css','./css/fonts.css',
  './css/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2',
  './css/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2',
  './css/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2',
  './css/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2',
  './css/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2',
  './css/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2',
  './css/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2',
  './js/config.js','./js/storage.js','./js/translations-core.js','./js/translations/en.js',
  './js/quiz.js','./js/poll.js','./js/main.js','./js/card.js',
  './manifest.json','./favicon.ico','./apple-touch-icon.png','./apple-touch-icon-192.png','./apple-touch-icon-512.png','./cover.jpg',
  './ru/','./es/','./de/','./fr/','./ja/','./vi/','./th/','./pt/','./ko/','./it/','./hi/'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// Pages, styles and scripts: network first, so a visitor sees an update on the first load after a release
// (cache only when offline). Fonts, images and other files: cache first with a background refresh.
function store(req, res){
  if(res&&res.status===200&&res.type==='basic'){const c=res.clone();caches.open(CACHE).then(ca=>ca.put(req,c));}
  return res;
}
self.addEventListener('fetch', e => {
  if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
  const d=e.request.destination;
  if(e.request.mode==='navigate'||d==='style'||d==='script'){
    e.respondWith(fetch(e.request).then(res=>store(e.request,res))
      .catch(()=>caches.match(e.request).then(c=>c||(e.request.mode==='navigate'?caches.match('./index.html'):undefined))));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{
    const net=fetch(e.request).then(res=>store(e.request,res)).catch(()=>cached);
    return cached||net;
  }));
});
