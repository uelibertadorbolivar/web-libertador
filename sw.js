/**
 * SERVICE WORKER - SIGAE v3.1
 * PWA: Progressive Web App
 */
self.addEventListener('install', (e) => {
    console.log('SIGAE Service Worker Activado');
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(fetch(e.request));
});

self.addEventListener('activate', (e) => {
    console.log('SIGAE Service Worker Activo');
});