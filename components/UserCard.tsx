type UserCardProps = {
  user: any;
  isSelected: boolean;
  onSelect: () => void;
  getAvatar: (user: any) => string;
};

export default function UserCard({
  user,
  isSelected,
  onSelect,
  getAvatar,
}: UserCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-2 transition
${isSelected ? "bg-[#202c33]" : "hover:bg-[#1a252c]"}
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
  );
}
