import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { receiverId, senderName, message } = body;

    const { data: profile } = await supabase
      .from("profiles")
      .select("fcm_token")
      .eq("id", receiverId)
      .single();

    if (!profile?.fcm_token) {
      return NextResponse.json({
        success: false,
        message: "No FCM token found",
      });
    }

    await admin.messaging().send({
      token: profile.fcm_token,
      // Send data-only payload so the service worker is the single place
      // that displays background notifications (avoids duplicate toasts).
      data: {
        title: senderName,
        body: message,
        icon: "/chat-icon-192.png",
        link: "/chat",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
    });
  }
}