// Taqvia service worker — network-first (her zaman güncel, çevrimdışıyken cache'ten)
// Sürüm değişince eski cache otomatik temizlenir; "eski sürümde takılma" sorunu yaşanmaz.
const CACHE = 'taqvia-v1';
const SHELL = ['./', './index.html', './icon-192.png', './icon-512.png', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // API çağrıları (namaz vakitleri vb.) her zaman ağdan
  if (req.url.includes('aladhan.com') || req.url.includes('api.')) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
