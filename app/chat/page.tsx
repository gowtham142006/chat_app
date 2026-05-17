"use client";

import { useState } from "react";
import {
  useResponsive,
  useAuth,
  useNotifications,
  useUsers,
  useMessages,
  useAutoScroll,
  useProfileSync,
} from "@/hooks";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);

  const isMobile = useResponsive();
  const { currentUser, setCurrentUser, authLoading } = useAuth();
  useNotifications(currentUser);
  const { users, setUsers } = useUsers(currentUser);
  useProfileSync(currentUser, setCurrentUser, selectedUser, setSelectedUser);
  const {
    messages,
    setMessages,
    activeMessageId,
    setActiveMessageId,
    sendMessage,
    deleteMessage,
  } = useMessages(selectedUser, currentUser);

  const bottomRef = useAutoScroll([messages]);

  // � Safe avatar
  const getAvatar = (user: any) => {
    if (!user) return "/default.png";
    return (
      user.avatar_url ||
      `https://ui-avatars.com/api/?name=${user.username}`
    );
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setShowChat(true);
  };

  const handleAvatarUpdate = (finalUrl: string) => {
    setCurrentUser((prev: any) => ({
      ...prev,
      avatar_url: finalUrl,
    }));
    setUsers((prev: any[]) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, avatar_url: finalUrl } : u
      )
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    await sendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") handleSendMessage();
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
      <Sidebar
        users={users}
        currentUser={currentUser}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        onAvatarUpdate={handleAvatarUpdate}
        isMobile={isMobile}
        showChat={showChat}
      />

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
          {selectedUser ? (
            <>
              <ChatHeader
                selectedUser={selectedUser}
                getAvatar={getAvatar}
                isMobile={isMobile}
                onBackClick={() => setShowChat(false)}
              />

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    currentUserId={currentUser.id}
                    senderUser={
                      msg.sender === currentUser.id ? currentUser : selectedUser
                    }
                    receiverUser={
                      msg.sender === currentUser.id ? selectedUser : currentUser
                    }
                    isActive={activeMessageId === msg.id}
                    onDelete={() => deleteMessage(msg.id)}
                    onMessageClick={() => {
                      if (msg.sender === currentUser.id) {
                        setActiveMessageId((prev) =>
                          prev === msg.id ? null : msg.id
                        );
                      }
                    }}
                    getAvatar={getAvatar}
                  />
                ))}

                <div ref={bottomRef} />
              </div>

              <MessageInput
                value={newMessage}
                onChange={setNewMessage}
                onSend={handleSendMessage}
                onKeyDown={handleKeyDown}
              />
            </>
          ) : (
            <p className="flex items-center justify-center h-full">
              Select a user to start chatting
            </p>
          )}
        </div>
      )}
    </div>
  );
}