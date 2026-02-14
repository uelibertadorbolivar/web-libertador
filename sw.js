self.addEventListener('install', (e) => { console.log('SIGAE Service Worker Activado'); });
self.addEventListener('fetch', (e) => { e.respondWith(fetch(e.request)); });