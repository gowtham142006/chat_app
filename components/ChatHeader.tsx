type ChatHeaderProps = {
  selectedUser: any;
  getAvatar: (user: any) => string;
  isMobile: boolean;
  onBackClick: () => void;
};

export default function ChatHeader({
  selectedUser,
  getAvatar,
  isMobile,
  onBackClick,
}: ChatHeaderProps) {
  return (
    <h3 className="flex items-center gap-3 p-4 border-b border-[#222] bg-[#111b21]">
      {isMobile && (
        <button onClick={onBackClick} className="mr-2">
          ⬅
        </button>
      )}
      <img
        src={getAvatar(selectedUser)}
        width={35}
        className="rounded-full"
      />
      {selectedUser.username}
    </h3>
  );
}
