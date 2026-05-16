importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAgKbWNEtWFR312MzpQn6cqe5KM7ISgytY",
  authDomain: "chat-app-397ce.firebaseapp.com",
  projectId: "chat-app-397ce",
  storageBucket: "chat-app-397ce.firebasestorage.app",
  messagingSenderId: "863365432919",
  appId: "1:863365432919:web:fe03fd43a545032577c512",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Background message ",
    payload
  );

  const notificationTitle =
    payload.notification?.title || "New Message";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "You received a new message",
    icon: "/chat-icon-192.png",
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow("/chat")
  );
});