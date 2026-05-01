"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 🔽 Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 👤 Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getUser();
  }, []);

  // 👥 Fetch users
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

  // 💬 Fetch messages + realtime
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

    // 🔥 Realtime listener
    const channel = supabase
      .channel("chat-room")

      // INSERT (new messages)
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

          if (isRelevant) {
            setMessages((prev) => [...prev, msg]);
          }

          // 🔥 Auto mark as seen (REAL FIX)
          if (
            msg.sender === selectedUser.id &&
            msg.receiver === currentUser.id
          ) {
            await supabase
              .from("messages")
              .update({ seen: true })
              .eq("id", msg.id);

            // 🔥 instant UI update
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msg.id ? { ...m, seen: true } : m
              )
            );
          }
        }
      )

      // UPDATE (seen status change)
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

  // 📤 Send message
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

  // ⌨️ Enter to send
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") sendMessage();
  };

  // ⏱ Format time
  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* USERS */}
      <div style={{ width: "30%", borderRight: "1px solid #ccc" }}>
        <h3 style={{ padding: 10 }}>Users</h3>

        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => setSelectedUser(user)}
            style={{
              padding: 10,
              cursor: "pointer",
              borderBottom: "1px solid #eee",
              background:
                selectedUser?.id === user.id ? "#f0f0f0" : "white",
            }}
          >
            👤 {user.username}
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div style={{ width: "70%", padding: 10 }}>
        {selectedUser ? (
          <>
            <h3>Chat with {selectedUser.username}</h3>

            <div style={{ height: "70vh", overflowY: "auto" }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    textAlign:
                      msg.sender === currentUser.id ? "right" : "left",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
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