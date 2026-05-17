import { decryptMessage } from "@/lib/crypto";

type MessageBubbleProps = {
  message: any;
  currentUserId: string;
  senderUser: any;
  receiverUser: any;
  isActive: boolean;
  onDelete: () => void;
  onMessageClick: () => void;
  getAvatar: (user: any) => string;
};

export default function MessageBubble({
  message,
  currentUserId,
  senderUser,
  receiverUser,
  isActive,
  onDelete,
  onMessageClick,
  getAvatar,
}: MessageBubbleProps) {
  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOwnMessage = message.sender === currentUserId;

  return (
    <div
      className={`
flex items-end gap-2 mb-3
${isOwnMessage ? "justify-end" : "justify-start"}
`}
      onClick={onMessageClick}
    >
      <img
        src={getAvatar(isOwnMessage ? senderUser : senderUser)}
        width={30}
        style={{ borderRadius: "50%" }}
      />

      <div className="relative">
        <div
          className={`
px-4
py-2
rounded-2xl
max-w-[240px]
text-sm
shadow
${isOwnMessage ? "bg-[#25D366] text-black" : "bg-[#202c33] text-white"}
`}
        >
          {decryptMessage(message.content)}
        </div>

        <div
          style={{ fontSize: 10, color: "gray" }}
          className="mt-1 flex items-center gap-2"
        >
          {formatTime(message.created_at)}

          {isOwnMessage && (
            <span style={{ marginLeft: 5 }}>
              {message.seen ? "✔✔" : "✔"}
            </span>
          )}

          {isOwnMessage && isActive && (
            <button
              type="button"
              onClick={onDelete}
              className="ml-2 rounded-full border border-red-500/30 px-2 py-1 text-[10px] font-semibold text-red-400 transition hover:border-red-400 hover:text-red-300"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
