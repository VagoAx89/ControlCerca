// ============================================
// SERVICE WORKER - CONTROL DE CERCA ELÉCTRICA
// ============================================

const CACHE_NAME = "cerca-control-v1.0.1"; // Subí la versión para forzar la actualización

// RUTAS CORREGIDAS: Sin la "/" al principio para que GitHub Pages las encuentre
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./cercas.png",
  "./style.css",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Archivos en cache");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activando...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Eliminando cache viejo:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

console.log("Service Worker: Cargado correctamente");
