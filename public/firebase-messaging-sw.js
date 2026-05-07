importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

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
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/chat-icon-192.png",
  });
});