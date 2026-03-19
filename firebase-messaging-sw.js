importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyB4MxzITRJUg0xRvIWQPpFo-FLtUgzo3Ls",
  authDomain: "cercaselectricas-a52a4.firebaseapp.com",
  projectId: "cercaselectricas-a52a4",
  storageBucket: "cercaselectricas-a52a4.appspot.com",
  messagingSenderId: "829613948603",
  appId: "1:829613948603:android:01cd8f6bab0225a311f39e",
});

const messaging = firebase.messaging();

// self.registration.showNotification("⚡ Cerca activada", {
//   body: "Zona 2 detectó voltaje",
//   icon: "/intec_app_icons/icon-white-512.png",
//  badge: "/intec_app_icons/icon-white-144.png",
//   vibrate: [200,100,200],
//   tag: "alerta-cerca",
//   requireInteraction: true
// });

messaging.onBackgroundMessage(function (payload) {
  console.log("Push recibido:", payload);

  if (!payload.notification) return;

  self.registration.showNotification("Control de cercas", {
    body: payload.notification.body,
    icon: "/intec_app_icons/icon-white-512.png",
    badge: "/intec_app_icons/icon-white-144.png",
    vibrate: [200, 100, 200],
    tag: "alerta-cerca",
  });
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // event.waitUntil(clients.openWindow("/"));
  const url =
    event.notification.data?.url || "https://vagoax89.github.io/ControlCerca/";

  event.waitUntil(clients.openWindow(url));
});
