import { auth } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers"; // Commented out to fix @typescript-eslint/no-unused-vars error

const SESSION_EXPIRY_DAYS = 5;

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "No ID token provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create a session cookie that expires in 5 days
    const expiresIn = 60 * 60 * 24 * SESSION_EXPIRY_DAYS * 1000; // 5 days in milliseconds
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // Create response with session cookie
    const response = NextResponse.json({ success: true }, { headers: corsHeaders });
    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn / 1000, // maxAge expects seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax", // SECURITY FIX: Changed from "none" to "lax" - allows payment redirects while preventing most CSRF attacks
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401, headers: corsHeaders }
    );
  }
}

export async function DELETE() {
  // Create response that clears the session cookie
  const response = NextResponse.json({ success: true }, { headers: corsHeaders });
  response.cookies.delete("session");
  
  return response;
}