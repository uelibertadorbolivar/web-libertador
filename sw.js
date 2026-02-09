const CACHE_NAME = 'libertador-v1';
const ASSETS = [
  'index.html',
  'assets/css/style.css',
  'assets/js/config.js',
  'assets/js/app.js',
  'assets/js/router.js',
  'assets/img/logo.png',
  'assets/img/simon.png'
];

// Instalar el Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Estrategia: Primero buscar en Cache, luego en Red
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});