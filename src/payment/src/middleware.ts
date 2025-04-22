import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Allow webhook endpoint without authentication
  if (request.nextUrl.pathname.startsWith('/api/webhook')) {
    return NextResponse.next();
  }

  // Check for session cookie on protected routes
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie && request.nextUrl.pathname.startsWith('/api/checkout')) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/checkout/:path*',  // Protect checkout routes
    '/api/webhook',          // Include webhook route but allow it above
  ]
}