/**
 * Simple in-memory sliding window rate limiter.
 * For production, replace with Redis-based implementation.
 */

interface RateLimitEntry {
  timestamps: number[];
  windowMs: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < entry.windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given identifier.
 * @param identifier - Unique key (e.g., userId or IP)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60s)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier) ?? { timestamps: [], windowMs };
  entry.windowMs = windowMs;

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestInWindow + windowMs,
    };
  }

  entry.timestamps.push(now);
  store.set(identifier, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetAt: now + windowMs,
  };
}
