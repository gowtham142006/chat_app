import { supabase } from "@/lib/supabase";
import UserCard from "./UserCard";
import AvatarUploader from "./AvatarUploader";

type SidebarProps = {
  users: any[];
  currentUser: any;
  selectedUser: any;
  onSelectUser: (user: any) => void;
  onAvatarUpdate: (url: string) => void;
  isMobile: boolean;
  showChat: boolean;
};

export default function Sidebar({
  users,
  currentUser,
  selectedUser,
  onSelectUser,
  onAvatarUpdate,
  isMobile,
  showChat,
}: SidebarProps) {
  const getAvatar = (user: any) => {
    if (!user) return "/default.png";
    return (
      user.avatar_url ||
      `https://ui-avatars.com/api/?name=${user.username}`
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  if (isMobile && showChat) return null;

  return (
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
        <AvatarUploader currentUser={currentUser} onAvatarUpdate={onAvatarUpdate} />
      </div>

      <div className="flex-1">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isSelected={selectedUser?.id === user.id}
            onSelect={() => {
              onSelectUser(user);
            }}
            getAvatar={getAvatar}
          />
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="w-full mt-4 bg-red-500 hover:bg-red-600 transition p-3 rounded-xl font-semibold"
      >
        Logout
      </button>
    </div>
  );
}
