import { supabase } from "@/lib/supabase";

type AvatarUploaderProps = {
  currentUser: any;
  onAvatarUpdate: (url: string) => void;
};

export default function AvatarUploader({
  currentUser,
  onAvatarUpdate,
}: AvatarUploaderProps) {
  const uploadAvatar = async (file: File) => {
    if (!file || !currentUser) return;

    const fileExt = file.name.split(".").pop();
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
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    const finalUrl = `${publicUrl}?t=${Date.now()}`;

    await supabase
      .from("profiles")
      .update({
        avatar_url: finalUrl,
      })
      .eq("id", currentUser.id);

    onAvatarUpdate(finalUrl);
    alert("Avatar updated ✅");
  };

  return (
    <label className="flex items-center justify-center gap-2 bg-[#202c33] hover:bg-[#2a3942] transition cursor-pointer p-3 rounded-xl text-sm">
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadAvatar(file);
        }}
        className="hidden"
      />
      Upload Profile
    </label>
  );
}
