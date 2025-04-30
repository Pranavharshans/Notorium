import { auth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { sessionCookie } = await request.json();

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session cookie provided' },
        { status: 400 }
      );
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie);
    
    return NextResponse.json({
      valid: true,
      uid: decodedClaims.uid
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    );
  }
}