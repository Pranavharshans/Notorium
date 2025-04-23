import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow webhook endpoint without authentication
  if (pathname.startsWith('/api/webhook')) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedPaths = [
    '/api/checkout',
    '/api/customer-portal',
    '/api/subscription'
  ];

  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/checkout/:path*',
    '/api/customer-portal/:path*',
    '/api/subscription/:path*',
    '/api/webhook'
  ]
};