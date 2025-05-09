import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { aiAndTranscriptionLimiter } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Get client IP from headers or default to localhost
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             '127.0.0.1';

  // Allow webhook and verify-session endpoints without authentication
  if (pathname.startsWith('/api/webhook') || pathname.startsWith('/api/verify-session')) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedPaths = [
    '/api/checkout',
    '/api/customer-portal',
    '/api/subscription',
    '/api/ai/openrouter',
    '/api/ai/groq',
    '/api/transcribe',
    '/api/rate-limit-test'
  ];

  const isProtectedPath = protectedPaths.some(path =>
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // Check session cookie
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify session using our verify-session API
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionCookie: sessionCookie.value }),
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Session verification error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Apply rate limiting for AI and transcription endpoints
    if (pathname.startsWith('/api/ai/') || 
        pathname.startsWith('/api/transcribe') || 
        pathname.startsWith('/api/rate-limit-test')) {
      try {
        const result = aiAndTranscriptionLimiter.check(ip);
        
        if (!result.success) {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              limit: result.limit,
              reset: result.reset,
              remaining: result.remaining
            },
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': result.limit.toString(),
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': result.reset.toString()
              }
            }
          );
        }
      } catch (error) {
        console.error('Rate limiting error:', error);
        // Allow request to proceed in case of rate limiting error
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/checkout/:path*',
    '/api/customer-portal/:path*',
    '/api/subscription/:path*',
    '/api/webhook',
    '/api/ai/:path*',
    '/api/transcribe/:path*',
    '/api/rate-limit-test'
  ]
};