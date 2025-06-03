import { NextResponse } from 'next/server';
import { aiAndTranscriptionLimiter } from '@/lib/rate-limit';

/**
 * This endpoint is maintained for backward compatibility and analytics.
 * Rate limiting is now primarily handled directly in the middleware.
 */
export async function POST(request: Request) {
  try {
    // Get client IP from headers or default to localhost
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';

    // Check rate lim
    const result = aiAndTranscriptionLimiter.check(ip);

    return NextResponse.json({
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      message: result.success ? 'Request allowed' : 'Rate limit exceeded'
    }, {
      status: result.success ? 200 : 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString()
      }
    });
  } catch (error) {
    console.error('Rate limiting error:', error);
    return NextResponse.json({
      success: true, // Allow in case of error
      message: 'Error checking rate limit',
      limit: 10,
      remaining: 10,
      reset: 60
    });
  }
}