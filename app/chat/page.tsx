"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 🔽 Auto scroll (UNCHANGED)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  // notification permission
  useEffect(() => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}, []);

  // 👤 Get current user + profile
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        // ✅ fetch profile also
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        setCurrentUser({ ...data.user, ...profile });
      }
    };
    getUser();
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
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? payload.new : msg
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

    await supabase.from("messages").insert({
      sender: currentUser.id,
      receiver: selectedUser.id,
      content: newMessage,
      seen: false,
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

    const fileName = `${currentUser.id}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (error) {
      alert("Upload failed ❌");
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", currentUser.id);

    // ✅ update instantly
    setCurrentUser((prev: any) => ({
      ...prev,
      avatar_url: data.publicUrl,
    }));

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

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* USERS */}
      <div style={{ width: "30%", borderRight: "1px solid #ccc", padding: 10 }}>
        <h3>Users</h3>

        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={uploadAvatar}>Upload</button>

        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => setSelectedUser(user)}
            style={{
              padding: 10,
              cursor: "pointer",
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background:
                selectedUser?.id === user.id ? "#f0f0f0" : "white",
            }}
          >
            <img
              src={getAvatar(user)}
              width={40}
              height={40}
              style={{ borderRadius: "50%" }}
              onError={(e) => (e.currentTarget.src = "/default.png")}
            />
            {user.username}
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div style={{ width: "70%", padding: 10 }}>
        {selectedUser ? (
          <>
            <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={getAvatar(selectedUser)}
                width={35}
                style={{ borderRadius: "50%" }}
              />
              {selectedUser.username}
            </h3>

            <div style={{ height: "70vh", overflowY: "auto" }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection:
                      msg.sender === currentUser.id ? "row-reverse" : "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
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
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        background:
                          msg.sender === currentUser.id
                            ? "#d1f7c4"
                            : "#eee",
                      }}
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

            <div style={{ marginTop: 10 }}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type message..."
                style={{ width: "80%", padding: 8 }}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p>Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
}