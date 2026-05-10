import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAgKbWNEtWFR312MzpQn6cqe5KM7ISgytY",
  authDomain: "chat-app-397ce.firebaseapp.com",
  projectId: "chat-app-397ce",
  storageBucket: "chat-app-397ce.firebasestorage.app",
  messagingSenderId: "863365432919",
  appId: "1:863365432919:web:fe03fd43a545032577c512",
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);