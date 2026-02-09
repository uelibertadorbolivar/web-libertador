self.addEventListener('install', (e) => {
  console.log('SIGAE Service Worker Instalado');
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});