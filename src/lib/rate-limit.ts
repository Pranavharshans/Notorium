import { LRUCache } from 'lru-cache';

// Rate limit options
const RATE_LIMIT_MAX = 10; // Maximum number of requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute in milliseconds

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// Create a LRU cache to store rate limit information
const ratelimitCache = new LRUCache<string, RateLimitInfo>({
  max: 10000, // Maximum number of IPs to track
  ttl: RATE_LIMIT_WINDOW_MS, // Automatically expire entries after the window
});

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Rate limiter for AI and transcription endpoints
export const aiAndTranscriptionLimiter = {
  /**
   * Check if a request from an IP should be allowed
   * @param ip The IP address to check
   * @returns Result of the rate limit check
   */
  check: (ip: string): RateLimitResult => {
    const now = Date.now();
    let info = ratelimitCache.get(ip);
    
    if (!info) {
      // First request from this IP
      info = {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW_MS
      };
      ratelimitCache.set(ip, info);
      
      return {
        success: true,
        limit: RATE_LIMIT_MAX,
        remaining: RATE_LIMIT_MAX - 1,
        reset: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
      };
    }
    
    // If the window has expired, reset the counter
    if (now > info.resetTime) {
      info = {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW_MS
      };
      ratelimitCache.set(ip, info);
      
      return {
        success: true,
        limit: RATE_LIMIT_MAX,
        remaining: RATE_LIMIT_MAX - 1,
        reset: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
      };
    }
    
    // Check if the rate limit is exceeded
    if (info.count >= RATE_LIMIT_MAX) {
      const resetInSec = Math.ceil((info.resetTime - now) / 1000);
      
      return {
        success: false,
        limit: RATE_LIMIT_MAX,
        remaining: 0,
        reset: resetInSec
      };
    }
    
    // Increment the counter
    info.count++;
    ratelimitCache.set(ip, info);
    
    return {
      success: true,
      limit: RATE_LIMIT_MAX,
      remaining: RATE_LIMIT_MAX - info.count,
      reset: Math.ceil((info.resetTime - now) / 1000)
    };
  }
}; 