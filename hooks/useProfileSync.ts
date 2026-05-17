import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useProfileSync(
  currentUser: any,
  setCurrentUser: (fn: any) => void,
  selectedUser: any,
  setSelectedUser: (fn: any) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel("profiles-sync-current")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const updated = payload.new;

          // Update current user if it changed
          setCurrentUser((prev: any) =>
            prev && prev.id === updated.id ? { ...prev, ...updated } : prev
          );

          // Update selected user if it changed
          setSelectedUser((prev: any) =>
            prev && prev.id === updated.id ? updated : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
