const CACHE = 'hr-portfolio-v14-floating-assistant';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/styles.css',
  './assets/js/app.js',
  './assets/img/cover-gradient.svg',
  './assets/img/avatar.svg',
  './assets/img/platen-logo.svg',
  './assets/img/quran-reels-logo.png',
  './assets/img/amnshield-logo.png',
  './assets/img/amngaze-logo.png',
  './assets/img/Initiative-Logo.png',
  './assets/img/vscode-ext-logo.png',
  './assets/img/pohlang-logo.png',
  './assets/img/plhub-logo.png',
  './assets/img/amniguard-logo.png',
  './assets/img/amniblur-logo.png',
  './assets/img/studio-logo.png',
  './assets/img/quranhub-logo.png',
  './assets/img/library-logo.png',
  './assets/icons/icon-192-maskable.svg',
  './assets/icons/icon-512-maskable.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;

  // Keep the document current so content updates are not hidden behind an old PWA cache.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put('./index.html', copy));
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }

  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
