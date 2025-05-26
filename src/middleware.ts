import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { aiAndTranscriptionLimiter } from '@/lib/rate-limit';

// SECURITY FIX: Restrict CORS to specific trusted origins
const getAllowedOrigin = (origin: string | null) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://notorium.app',
    'https://www.notorium.app'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  
  // Default to production domain if no origin or origin not allowed
  return 'https://www.notorium.app';
};

// Add CORS headers with dynamic origin
const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(origin),
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle OPTIONS (preflight) requests immediately
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(request.headers.get('origin')),
    });
  }
  
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
        { status: 401, headers: getCorsHeaders(request.headers.get('origin')) }
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
          { status: 401, headers: getCorsHeaders(request.headers.get('origin')) }
        );
      }
    } catch (error) {
      console.error('Session verification error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401, headers: getCorsHeaders(request.headers.get('origin')) }
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
                'X-RateLimit-Reset': result.reset.toString(),
                ...getCorsHeaders(request.headers.get('origin'))
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

  // Add CORS headers to the response
  const response = NextResponse.next();
  
  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    Object.entries(getCorsHeaders(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/api/checkout/:path*',
    '/api/customer-portal/:path*',
    '/api/subscription/:path*',
    '/api/webhook',
    '/api/ai/:path*',
    '/api/transcribe/:path*',
    '/api/rate-limit-test',
    '/api/auth/:path*'  // Add auth endpoints to the matcher
  ]
};