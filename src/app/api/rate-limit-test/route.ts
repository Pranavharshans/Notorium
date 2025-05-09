import { NextResponse } from 'next/server';
import { aiAndTranscriptionLimiter } from '@/lib/rate-limit';

/**
 * This is a simple test endpoint to verify that rate limiting is working
 * Hit this endpoint multiple times to see rate limiting in action
 */
export async function GET(request: Request) {
  // Get client IP from headers or default to localhost
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             '127.0.0.1';

  // Check rate limit
  const result = aiAndTranscriptionLimiter.check(ip);
  
  // Return response with rate limit information
  return NextResponse.json({
    message: 'Rate limiting test endpoint',
    timestamp: new Date().toISOString(),
    rateLimit: {
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset
    }
  }, {
    status: result.success ? 200 : 429,
    headers: {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString()
    }
  });
} 