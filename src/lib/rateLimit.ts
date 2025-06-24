// A simple in-memory store for rate limiting
// In a production environment, you should use a persistent store like Redis.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const LIMIT = 6; // 6 generations per day
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  isBlocked: boolean;
}

export function checkRateLimit(userId: string): RateLimitInfo {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  // If a record exists and it's expired, remove it.
  if (userLimit && now > userLimit.resetAt) {
    rateLimitStore.delete(userId);
  }

  // If no record exists or it's expired, create a new one.
  if (!rateLimitStore.has(userId)) {
    rateLimitStore.set(userId, {
      count: 0,
      resetAt: now + RESET_INTERVAL,
    });
  }

  const record = rateLimitStore.get(userId)!;
  const remaining = Math.max(0, LIMIT - record.count);
  const isBlocked = record.count >= LIMIT;

  return {
    remaining,
    limit: LIMIT,
    isBlocked,
  };
}

export function incrementRateLimit(userId: string): RateLimitInfo {
  const record = rateLimitStore.get(userId);
  if (!record) {
    // This could happen if the store was cleared or the server restarted.
    // We'll create a new record and increment it.
    checkRateLimit(userId);
    const newRecord = rateLimitStore.get(userId)!;
    newRecord.count++;
    
    const remaining = Math.max(0, LIMIT - newRecord.count);
    const isBlocked = newRecord.count >= LIMIT;

    return {
      remaining,
      limit: LIMIT,
      isBlocked,
    };
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
