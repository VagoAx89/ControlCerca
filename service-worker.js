// ============================================
// SERVICE WORKER - CONTROL DE CERCA ELÉCTRICA
// ============================================

// Nombre del cache - cambiar la versión cuando actualices la app
const CACHE_NAME = "cerca-control-v1.0.0";

// Archivos que se guardarán en cache para funcionar offline
const urlsToCache = ["/esp32test.html", "/manifest.json", "/cercas.png"];

// ============================================
// EVENTO: Instalación del Service Worker
// ============================================
// Este evento se ejecuta cuando se instala el service worker por primera vez
self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando...");

  // Esperar a que se complete el cacheo de archivos
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Archivos en cache");
        // Guardar todos los archivos importantes en cache
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Activar el service worker inmediatamente sin esperar
        return self.skipWaiting();
      }),
  );
});

// ============================================
// EVENTO: Activación del Service Worker
// ============================================
// Este evento se ejecuta cuando el service worker se activa
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activando...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches viejos cuando se actualiza la versión
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Eliminando cache viejo:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        // Tomar control de todas las páginas inmediatamente
        return self.clients.claim();
      }),
  );
});

// ============================================
// NOTIFICACIÓN DE SINCRONIZACIÓN (opcional)
// ============================================
// Puedes usar esto para sincronizar datos cuando vuelva la conexión
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-commands") {
    console.log("Service Worker: Sincronizando comandos pendientes...");
    // Aquí podrías implementar lógica para enviar comandos
    // que quedaron pendientes cuando no había internet
  }
});

// ============================================
// EVENTO: Intercepción de peticiones (FETCH)
// ============================================
// REQUERIDO para que Chrome permita la instalación como App
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si el archivo está en cache, lo devuelve; si no, va a la red
      return response || fetch(event.request);
    }),
  );
});

console.log("Service Worker: Cargado correctamente");
