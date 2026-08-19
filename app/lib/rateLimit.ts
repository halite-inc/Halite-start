/**
 * In-memory sliding-window rate limiter & lightweight TTL cache helper.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface CacheRecord<T> {
  value: T;
  expiresAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const ttlCacheStore = new Map<string, CacheRecord<any>>();

// Periodic cleanup every 5 minutes to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
    for (const [key, record] of ttlCacheStore.entries()) {
      if (now > record.expiresAt) {
        ttlCacheStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Check if an IP or identifier exceeds `maxRequests` within `windowMs`.
 * Returns `{ success: boolean, remaining: number, reset: number }`.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests = 60,
  windowMs = 60 * 1000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { success: true, remaining: maxRequests - 1, reset: resetTime };
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { success: true, remaining: maxRequests - record.count, reset: record.resetTime };
}

/**
 * Get client IP from Request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Get cached value from in-memory TTL store
 */
export function getFromCache<T>(key: string): T | null {
  const record = ttlCacheStore.get(key);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    ttlCacheStore.delete(key);
    return null;
  }
  return record.value as T;
}

/**
 * Set cached value in in-memory TTL store
 */
export function setInCache<T>(key: string, value: T, ttlSeconds: number): void {
  ttlCacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
