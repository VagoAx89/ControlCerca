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

messaging.onBackgroundMessage(function (payload) {
  console.log("Push recibido:", payload);

  const title = payload.notification?.title || "Alerta";
  const body = payload.notification?.body || "Evento detectado";

  self.registration.showNotification(title, {
    body: body,
    icon: "/cercas.png",
  });
});
