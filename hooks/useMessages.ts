import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type MessageRow = {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  seen: boolean;
  created_at: string;
};

export function useMessages(
  selectedUser: any,
  currentUser: any
) {
  const [messages, setMessages] = useState<any[]>([]);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const currentUserId = currentUser?.id;
  const selectedUserId = selectedUser?.id;

  useEffect(() => {
    if (!selectedUserId || !currentUserId) return;
    const channelName = `chat-room:${currentUserId}:${selectedUserId}`;

    setActiveMessageId(null);

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender.eq.${currentUserId},receiver.eq.${selectedUserId}),and(sender.eq.${selectedUserId},receiver.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload: { new: MessageRow }) => {
          const msg = payload.new;

          const isRelevant =
            (msg.sender === currentUserId &&
              msg.receiver === selectedUserId) ||
            (msg.sender === selectedUserId &&
              msg.receiver === currentUserId);

          if (isRelevant) {
            setMessages((prev) => [...prev, msg]);
          }

          if (
            msg.sender === selectedUserId &&
            msg.receiver === currentUserId
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
        (payload: { new: Pick<MessageRow, "id" | "sender" | "receiver" | "seen"> }) => {
          const updated = payload.new;

          const isRelevant =
            (updated.sender === currentUserId &&
              updated.receiver === selectedUserId) ||
            (updated.sender === selectedUserId &&
              updated.receiver === currentUserId);

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
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload: { old: Partial<MessageRow> }) => {
          const deleted = payload.old as MessageRow;

          const isRelevant =
            (deleted.sender === currentUserId &&
              deleted.receiver === selectedUserId) ||
            (deleted.sender === selectedUserId &&
              deleted.receiver === currentUserId);

          if (!isRelevant) return;

          setMessages((prev) =>
            prev.filter((msg) => msg.id !== deleted.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedUserId]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !selectedUserId || !currentUserId) return;

    const { encryptMessage } = await import("@/lib/crypto");

    await supabase.from("messages").insert({
      sender: currentUserId,
      receiver: selectedUserId,
      content: encryptMessage(messageText),
      seen: false,
    });

    await fetch("/api/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId: selectedUserId,
        senderName: currentUser.username,
        message: messageText,
      }),
    });
  };

  const deleteMessage = async (messageId: string) => {
    const confirmed = window.confirm(
      "Delete this message for everyone?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error(error);
      alert("Failed to delete message");
      return;
    }

    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    setActiveMessageId(null);
  };

  return {
    messages,
    setMessages,
    activeMessageId,
    setActiveMessageId,
    sendMessage,
    deleteMessage,
  };
}
