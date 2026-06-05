const CACHE = 'saludvital-v32';
self.addEventListener('install', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  if(e.request.url.includes('/.netlify/functions/')) { e.respondWith(fetch(e.request)); return; }
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
