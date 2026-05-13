"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

export default function ChatPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showChat, setShowChat] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔽 Auto scroll (UNCHANGED)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  // notification permission
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

const registration =
  await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );

const token = await getToken(messaging, {
  vapidKey:
    "BNOeJCQxqyyFIQ0LJOPFK53ISi1rPCjri6hYQpjeNhkP5YHp5FsN-CubDO08XiZE7I92n4wPtYNgKPwUTGafod0",

  serviceWorkerRegistration: registration,
});
          console.log("FCM Token:", token);
          console.log("Current User:", currentUser);

          const { data, error } = await supabase
            .from("profiles")
            .update({
              fcm_token: token,
            })
            .eq("id", currentUser.id)
            .select();

          console.log("Update Data:", data);
          console.log("Update Error:", error);

          console.log("FCM Token:", token);

          onMessage(messaging, (payload) => {
            console.log("Message received:", payload);

            new Notification(
              payload.notification?.title || "New Message",
              {
                body: payload.notification?.body || "You received a message",
                icon: "/chat-icon-192.png",
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

  // 👤 Get current user + profile
 useEffect(() => {
  const getSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setCurrentUser({
        ...session.user,
        ...profile,
      });
      setAuthLoading(false);
  } else {
    setAuthLoading(false);
    }
  };

  getSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setCurrentUser({
          ...session.user,
          ...profile,
        });
        setAuthLoading(false);
      } else {
        setCurrentUser(null);
        setAuthLoading(false);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, []);

  // 👥 Fetch users (UNCHANGED)
  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", currentUser.id);

      setUsers(data || []);
    };

    fetchUsers();
  }, [currentUser]);

  // 💬 Messages realtime (UNCHANGED)
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender.eq.${currentUser.id},receiver.eq.${selectedUser.id}),and(sender.eq.${selectedUser.id},receiver.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true });

      setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
      .channel("chat-room")

      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new;

          const isRelevant =
            (msg.sender === currentUser.id &&
              msg.receiver === selectedUser.id) ||
            (msg.sender === selectedUser.id &&
              msg.receiver === currentUser.id);

          // ✅ keep your existing message update
          if (isRelevant) {
            setMessages((prev) => [...prev, msg]);
          }

          // 🔥 STEP 2: FIXED NOTIFICATION
          if (
            msg.sender !== currentUser?.id &&
            Notification.permission === "granted"
          ) {
            const senderUser = users.find((u) => u.id === msg.sender);

            new Notification(
              `Message from ${senderUser?.username || "User"}`,
              {
                body: msg.content || "Sent an image",
              }
            );
          }

          // ✅ keep your existing seen logic
          if (
            msg.sender === selectedUser.id &&
            msg.receiver === currentUser.id
          ) {
            await supabase
              .from("messages")
              .update({ seen: true })
              .eq("id", msg.id);

            setMessages((prev) =>
              prev.map((m) =>
                m.id === msg.id ? { ...m, seen: true } : m
              )
            );
          }
        }
      )

      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updated = payload.new;

          const isRelevant =
            (updated.sender === currentUser.id &&
              updated.receiver === selectedUser.id) ||
            (updated.sender === selectedUser.id &&
              updated.receiver === currentUser.id);

          if (!isRelevant) return;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updated.id
                ? { ...msg, seen: updated.seen }
                : msg
            )
          );
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, currentUser]);

  // 🔥 REALTIME PROFILE FIX (NEW)
  useEffect(() => {
    const channel = supabase
      .channel("profiles-sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const updated = payload.new;

          setUsers((prev) =>
            prev.map((u) => (u.id === updated.id ? updated : u))
          );

          setCurrentUser((prev: any) =>
            prev && prev.id === updated.id ? { ...prev, ...updated } : prev
          );

          setSelectedUser((prev: any) =>
            prev && prev.id === updated.id ? updated : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // keep EMPTY
  // 📤 Send message (UNCHANGED)
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const messageText = newMessage;

    await supabase.from("messages").insert({
      sender: currentUser.id,
      receiver: selectedUser.id,
      content: messageText,
      seen: false,
    });

    await fetch("/api/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId: selectedUser.id,
        senderName: currentUser.username,
        message: messageText,
      }),
    });

    setNewMessage("");
  };

  // ⌨️ Enter send (UNCHANGED)
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") sendMessage();
  };

  // ⏱ Time (UNCHANGED)
  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🔥 Upload Avatar (FIXED)
 const uploadAvatar = async () => {
  if (!file || !currentUser) return;

  const fileExt = file.name.split(".").pop();

  // always same filename per user
  const fileName = `${currentUser.id}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      upsert: true,
    });

  if (uploadError) {
    console.error(uploadError);
    alert("Upload failed ❌");
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  const finalUrl = `${publicUrl}?t=${Date.now()}`;

  await supabase
    .from("profiles")
    .update({
      avatar_url: finalUrl,
    })
    .eq("id", currentUser.id);

  // update current user instantly
  setCurrentUser((prev: any) => ({
    ...prev,
    avatar_url: finalUrl,
  }));

  // update users list instantly
  setUsers((prev: any[]) =>
    prev.map((u) =>
      u.id === currentUser.id
        ? { ...u, avatar_url: finalUrl }
        : u
    )
  );

  alert("Avatar updated ✅");
};

  // 🔥 Safe avatar
  const getAvatar = (user: any) => {
    if (!user) return "/default.png";

    return (
      user.avatar_url ||
      `https://ui-avatars.com/api/?name=${user.username}`
    );
  };
  if (authLoading) {
  return (
    <div className="h-screen flex items-center justify-center bg-[#0b141a] text-white">
      Loading...
    </div>
  );
}

  return (
    <div className="flex h-screen w-full bg-[#0b141a] text-white overflow-hidden">

      {/* ✅ USERS PANEL */}
      {(!showChat || !isMobile) && (
        <div
          className={`
${isMobile ? "w-full" : "w-[30%]"}
bg-[#111b21]
border-r
border-[#222]
p-3
overflow-y-auto
flex
flex-col
`}
        >
          <h3>Users</h3>

          <div className="p-3 space-y-2">
  <label className="flex items-center justify-center gap-2 bg-[#202c33] hover:bg-[#2a3942] transition cursor-pointer p-3 rounded-xl text-sm">

    <input
      type="file"
      onChange={(e) =>
        setFile(e.target.files?.[0] || null)
      }
      className="hidden"
    />

     {file ? file.name : "Upload Profile"}
  </label>

  {file && (
    <button
      onClick={uploadAvatar}
      className="w-full bg-[#25D366] text-black p-3 rounded-xl font-semibold"
    >
      Update Avatar
    </button>
  )}
</div>
        <div className="flex-1">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                setSelectedUser(user);
                setShowChat(true); // 🔥 mobile switch
              }}
              className={`
flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-2 transition
${
  selectedUser?.id === user.id
    ? "bg-[#202c33]"
    : "hover:bg-[#1a252c]"
}
`}
            >
              
              <img
                src={getAvatar(user)}
                width={40}
                height={40}
                className="rounded-full"
                onError={(e) => (e.currentTarget.src = "/default.png")}
              />
              {user.username}
            </div>
          ))}
          </div>
          <button
  onClick={async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }}
  className="w-full mt-4 bg-red-500 hover:bg-red-600 transition p-3 rounded-xl font-semibold"
>
  Logout
</button>
        </div>
      )}

      {/* ✅ CHAT PANEL */}
      {(showChat || !isMobile) && (
        <div
          className={`
${isMobile ? "w-full" : "w-[70%]"}
flex
flex-col
bg-[#0b141a]
`}
        >
          {/* 🔥 BACK BUTTON (mobile only) */}
          {isMobile && (
            <button onClick={() => setShowChat(false)}>⬅ Back</button>
          )}

          {selectedUser ? (
            <>
              <h3 className="flex items-center gap-3 p-4 border-b border-[#222] bg-[#111b21]">
                <img
                  src={getAvatar(selectedUser)}
                  width={35}
                  className="rounded-full"
                />
                {selectedUser.username}
              </h3>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
  key={msg.id}
  className={`
    flex items-end gap-2 mb-3
    ${
      msg.sender === currentUser.id
        ? "justify-end"
        : "justify-start"
    }
  `}
>
                    <img
                      src={
                        msg.sender === currentUser.id
                          ? getAvatar(currentUser)
                          : getAvatar(selectedUser)
                      }
                      width={30}
                      style={{ borderRadius: "50%" }}
                    />

                    <div>
                      <div
  className={`
  px-4
  py-2
  rounded-2xl
  max-w-[240px]
  text-sm
  shadow
  ${
    msg.sender === currentUser.id
      ? "bg-[#25D366] text-black"
      : "bg-[#202c33] text-white"
  }
`}
>
                        {msg.content}
                      </div>

                      <div style={{ fontSize: 10, color: "gray" }}>
                        {formatTime(msg.created_at)}

                        {msg.sender === currentUser.id && (
                          <span style={{ marginLeft: 5 }}>
                            {msg.seen ? "✔✔" : "✔"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div ref={bottomRef} />
              </div>

              <div className="p-3 border-t border-[#222] flex gap-2 bg-[#111b21]">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message"
                  className="flex-1 p-3 rounded-full bg-[#202c33] outline-none text-white"
                />

                <button
                  onClick={sendMessage}
                  className="bg-[#25D366] text-black px-5 rounded-full font-semibold"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p>Select a user to start chatting</p>
          )}
        </div>
      )}
    </div>
  );
}