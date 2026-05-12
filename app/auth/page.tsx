"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
const [isLogin, setIsLogin] = useState(true);
useEffect(() => {
  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      router.push("/chat");
    }
  };

  checkSession();
}, []);
  const signUp = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          username,
        });
      }

      alert("Account created successfully ✅");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      router.push("/chat");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a] p-4">
      <div className="w-full max-w-sm bg-[#111b21] rounded-2xl shadow-xl p-6 text-white">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#25D366]">
            Chat App
          </h1>

          <p className="text-gray-400 mt-2">
            Secure realtime messaging
          </p>
        </div>

        <div className="space-y-4">
         {!isLogin && (
  <input
    type="text"
    placeholder="Username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    className="w-full p-3 rounded-xl bg-[#202c33] outline-none border border-transparent focus:border-[#25D366]"
  />
)}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#202c33] outline-none border border-transparent focus:border-[#25D366]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#202c33] outline-none border border-transparent focus:border-[#25D366]"
          />

          <button
  onClick={isLogin ? login : signUp}
  disabled={loading}
  className="w-full bg-[#25D366] text-black font-semibold p-3 rounded-xl hover:opacity-90 transition"
>
  {isLogin ? "Login" : "Create Account"}
</button>

<button
  onClick={() => setIsLogin(!isLogin)}
  className="w-full border border-[#25D366] text-[#25D366] p-3 rounded-xl hover:bg-[#25D366] hover:text-black transition"
>
  {isLogin
    ? "Need an account? Sign Up"
    : "Already have an account? Login"}
</button>
        </div>
      </div>
    </div>
  );
}