/* Mind-OS Service Worker v2026.1 — офлайн + PWA установка */
const CACHE = 'mindos-2026-1';
const PRECACHE = ['./','./index.html','./css/style.css',
  './js/config.js','./js/storage.js','./js/translations.js',
  './js/quiz.js','./js/tracker.js','./js/game.js','./js/poll.js','./js/main.js','./js/card.js',
  './manifest.json','./favicon.ico','./apple-touch-icon.png','./cover.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
  e.respondWith(caches.match(e.request).then(cached=>{
    if(cached)return cached;
    return fetch(e.request).then(res=>{
      if(res&&res.status===200&&res.type==='basic'){const c=res.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c));}
      return res;
    }).catch(()=>caches.match('./index.html'));
  }));
});
