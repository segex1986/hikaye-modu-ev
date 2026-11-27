// Uygulama olarak kurulabilmesi için basit bir servis çalışanı. Önce ağdan alınır (program güncellenince hemen
// yenisi gelir); ağ yoksa son kopya gösterilir. Kayıtlar ve diğer /api/ istekleri asla önbelleğe alınmaz.
const ONBELLEK = 'hikaye-ev-20261127125309';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(ONBELLEK).then((c) => c.addAll(["./", "./index.html", "./stil.css", "./manifest.webmanifest", "./js/beceriler.js", "./js/ceviri.js", "./js/cizimler.js", "./js/hava.js", "./js/karakterler.js", "./js/kokler.js", "./js/ortamlar.js", "./js/senaryolar.js", "./js/ses.js", "./js/uygulama.js", "./ikonlar/ikon-192.png", "./ikonlar/ikon-512.png", "./ikonlar/ikon-maskeli-512.png"].map((u) => new Request(u, { cache: 'reload' })))).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((adlar) => Promise.all(adlar.filter((a) => a !== ONBELLEK).map((a) => caches.delete(a)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return;
  // Tarayıcının kendi önbelleği atlanır; program güncellenince yeni dosya hemen gelir.
  const istek = e.request.mode === 'navigate' ? new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }) : new Request(e.request, { cache: 'no-cache' });
  e.respondWith(fetch(istek).then((yanit) => {
    if (yanit.ok) { const kopya = yanit.clone(); caches.open(ONBELLEK).then((c) => c.put(e.request, kopya)); }
    return yanit;
  }).catch(() => caches.match(e.request).then((y) => y || caches.match('./index.html'))));
});
