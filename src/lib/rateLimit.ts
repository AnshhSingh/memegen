// A simple in-memory store for rate limiting
// should use redis but its fine
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const LIMIT = 6;
const RESET_INTERVAL = 24 * 60 * 60 * 1000;

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  isBlocked: boolean;
}

export function checkRateLimit(ip: string): RateLimitInfo {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);

  if (userLimit && now > userLimit.resetAt) {
    rateLimitStore.delete(ip);
  }

  // If no record exists or it's expired, create a new one
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, {
      count: 0,
      resetAt: now + RESET_INTERVAL,
    });
  }

  const record = rateLimitStore.get(ip)!;
  const remaining = Math.max(0, LIMIT - record.count);
  const isBlocked = record.count >= LIMIT;

  return {
    remaining,
    limit: LIMIT,
    isBlocked,
  };
}

export function incrementRateLimit(ip: string): RateLimitInfo {
  const record = rateLimitStore.get(ip);
  if (!record) {
    // This shouldn't happen as checkRateLimit should have been called first
    throw new Error('Rate limit record not found');
  }

  record.count++;
  const remaining = Math.max(0, LIMIT - record.count);
  const isBlocked = record.count >= LIMIT;

  return {
    remaining,
    limit: LIMIT,
    isBlocked,
  };
}
