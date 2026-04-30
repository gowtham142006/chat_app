"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabase"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const signUp = async () => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    alert(error.message)
    return
  }

  // ✅ THIS IS THE NEW IMPORTANT PART
  if (data.user) {
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        username: email.split("@")[0],
      })

    if (insertError) {
      console.log(insertError)
      alert(insertError?.message)
console.log(insertError)
    }
  }

  alert("Check your email")
}

 const login = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    alert(error.message)
    return
  }

  // ✅ OPTIONAL SAFETY (recommended)
  const user = data.user

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!existingProfile) {
    await supabase.from("profiles").insert({
      id: user.id,
      username: email.split("@")[0],
    })
  }

  alert("Logged in")

  // ✅ REDIRECT (VERY IMPORTANT)
  window.location.href = "/chat" // or "/" or "/dashboard"
}

  return (
    <div style={{ padding: 20 }}>
      <h2>Auth Page</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <div style={{ marginTop: 10 }}>
  <button onClick={signUp}>Sign Up</button>
  <button onClick={login} style={{ marginLeft: 10 }}>Login</button>
</div>
    </div>
  )
}