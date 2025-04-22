import { auth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SESSION_EXPIRY_DAYS = 5;

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "No ID token provided" },
        { status: 400 }
      );
    }

    // Create a session cookie that expires in 5 days
    const expiresIn = 60 * 60 * 24 * SESSION_EXPIRY_DAYS * 1000; // 5 days in milliseconds
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // Create response with session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn / 1000, // maxAge expects seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  // Create response that clears the session cookie
  const response = NextResponse.json({ success: true });
  response.cookies.delete("session");
  
  return response;
}