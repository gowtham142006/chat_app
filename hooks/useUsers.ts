import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUsers(currentUser: any) {
  const [users, setUsers] = useState<any[]>([]);

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

  // Realtime profile sync
  useEffect(() => {
    const channel = supabase
      .channel("profiles-sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const updated = payload.new;
          setUsers((prev) =>
            prev.map((u) => (u.id === updated.id ? updated : u))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { users, setUsers };
}
