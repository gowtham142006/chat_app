"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.push("/auth"); // or /chat later
      } else {
        router.push("/auth");
      }
    };

    checkUser();
  }, []);

  return <div>Loading...</div>;
}