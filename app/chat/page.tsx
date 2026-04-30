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

  // ✅ Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getUser();
  }, []);

  // ✅ Fetch users with last message
  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", currentUser.id);

      const usersWithLastMessage = await Promise.all(
        (profiles || []).map(async (user) => {
          const { data } = await supabase
            .from("messages")
            .select("*")
            .or(
              `and(sender.eq.${currentUser.id},receiver.eq.${user.id}),and(sender.eq.${user.id},receiver.eq.${currentUser.id})`
            )
            .order("created_at", { ascending: false })
            .limit(1);

          const lastMessage = data?.[0];

          return {
            ...user,
            lastMessage: lastMessage?.content || "",
            time: lastMessage?.created_at || null,
          };
        })
      );

      // ✅ Sort by latest chat
      usersWithLastMessage.sort(
        (a, b) =>
          new Date(b.time || 0).getTime() -
          new Date(a.time || 0).getTime()
      );

      setUsers(usersWithLastMessage);
    };

    fetchUsers();
  }, [currentUser]);

  // ✅ Fetch messages + realtime
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
        (payload) => {
          const msg = payload.new;

          if (
            (msg.sender === currentUser.id &&
              msg.receiver === selectedUser.id) ||
            (msg.sender === selectedUser.id &&
              msg.receiver === currentUser.id)
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, currentUser]);

  // ✅ Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    await supabase.from("messages").insert({
      sender: currentUser.id,
      receiver: selectedUser.id,
      content: newMessage,
    });

    setNewMessage("");
  };

  // ✅ Enter to send
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") sendMessage();
  };

  // ⏱ Format time
  const formatTime = (time: string) => {
    if (!time) return "";
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* 🔹 USERS PANEL */}
      <div style={{ width: "30%", borderRight: "1px solid #ccc" }}>
        <h3 style={{ padding: 10 }}>Chats</h3>

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
            <b>{user.username}</b>

            <div style={{ fontSize: 12, color: "gray" }}>
              {user.lastMessage || "No messages"}
            </div>

            <div style={{ fontSize: 10, color: "#999" }}>
              {formatTime(user.time)}
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 CHAT PANEL */}
      <div style={{ width: "70%", padding: 10 }}>
        {selectedUser ? (
          <>
            <h3>Chat with {selectedUser.username}</h3>

            <div
              style={{
                height: "70vh",
                overflowY: "auto",
                padding: 10,
              }}
            >
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