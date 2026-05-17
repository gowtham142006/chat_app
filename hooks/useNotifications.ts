import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

export function useNotifications(currentUser: any) {
  useEffect(() => {
    const setupNotifications = async () => {
      if (!currentUser) return;

      try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          const firebaseConfig = {
            apiKey: "AIzaSyAgKbWNEtWFR312MzpQn6cqe5KM7ISgytY",
            authDomain: "chat-app-397ce.firebaseapp.com",
            projectId: "chat-app-397ce",
            storageBucket: "chat-app-397ce.firebasestorage.app",
            messagingSenderId: "863365432919",
            appId: "1:863365432919:web:fe03fd43a545032577c512",
          };

          const app = initializeApp(firebaseConfig);
          const messaging = getMessaging(app);

          const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
          );

          const token = await getToken(messaging, {
            vapidKey:
              "BNOeJCQxqyyFIQ0LJOPFK53ISi1rPCjri6hYQpjeNhkP5YHp5FsN-CubDO08XiZE7I92n4wPtYNgKPwUTGafod0",
            serviceWorkerRegistration: registration,
          });

          await supabase
            .from("profiles")
            .update({
              fcm_token: token,
            })
            .eq("id", currentUser.id)
            .select();

          onMessage(messaging, (payload) => {
            new Notification(
              payload.data?.title || payload.notification?.title || "New Message",
              {
                body: payload.data?.body || payload.notification?.body || "You received a message",
                icon: payload.data?.icon || "/chat-icon-192.png",
              }
            );
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    setupNotifications();
  }, [currentUser?.id]);
}
