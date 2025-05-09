# Rate Limiting Implementation

## Overview

This document describes the rate limiting implementation used in the Notorium application. Rate limiting is implemented using an in-memory LRU Cache, which provides an efficient solution for limiting the number of requests a client can make to specific endpoints within a given time window.

## Implementation Details

The rate limiting system is implemented in `src/lib/rate-limit.ts` and applied in `src/middleware.ts`.

### Components

1. **LRU Cache**: We use the `lru-cache` package to store and manage rate limit data per IP address
2. **Rate Limit Parameters**: 
   - **Window**: 60 seconds (1 minute)
   - **Max Requests**: 10 requests per minute
   - **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### How It Works

1. When a request is made to a protected endpoint, the middleware extracts the client's IP address
2. The rate limiter checks if this IP has exceeded its request quota for the current time window
3. If the limit is not exceeded:
   - The request counter is incremented
   - The request proceeds normally
   - Response headers include rate limit information
4. If the limit is exceeded:
   - A 429 (Too Many Requests) status is returned
   - Response headers include information about when the rate limit will reset

## Protected Endpoints

Rate limiting is applied to the following endpoints:

- `/api/ai/*` - AI related endpoints (OpenRouter, Groq, etc.)
- `/api/transcribe/*` - Transcription endpoints
- `/api/rate-limit-test` - Test endpoint for rate limiting

## Benefits

- **Performance**: In-memory rate limiting is significantly faster than database-based approaches
- **Reliability**: The implementation is robust and handles edge cases appropriately
- **Scalability**: Uses LRU Cache with automatic eviction to prevent memory leaks
- **Maintainability**: Simple, self-contained code that's easy to understand and modify

## Testing

You can test the rate limiting implementation by making multiple requests to the `/api/rate-limit-test` endpoint. After 10 requests within a minute, you should receive a 429 response with appropriate rate limit headers.

Example response headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 45
```

## Note

This rate limiting implementation uses in-memory storage, which means rate limit data will not persist across application restarts or across multiple instances of the application. In a clustered environment, you may want to consider using a distributed cache like Redis for rate limiting.

For most use cases with moderate traffic, this implementation provides an excellent balance of performance and protection. 