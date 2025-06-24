import type { SupabaseClient } from '@supabase/supabase-js'

const LIMIT = 6;

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  isBlocked: boolean;
}

export async function checkRateLimit(supabase: SupabaseClient, userId: string): Promise<RateLimitInfo> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', twentyFourHoursAgo);//should work
  
  if (error) {
    console.error('Error checking rate limit:', error);
    // Fail open: if the check fails, allow the request but log the error
    return {
      remaining: LIMIT,
      limit: LIMIT,
      isBlocked: false,
    };
  }

  const used = count ?? 0;
  const remaining = Math.max(0, LIMIT - used);
  const isBlocked = used >= LIMIT;

  return {
    remaining,
    limit: LIMIT,
    isBlocked,
  };
}
