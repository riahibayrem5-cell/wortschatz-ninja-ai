import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIUsageStats {
  tier: string;
  currentUsage: number;
  maxRequests: number | null;
  remaining: number | null;
  isUnlimited: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAIUsage = () => {
  const [stats, setStats] = useState<AIUsageStats>({
    tier: 'Free',
    currentUsage: 0,
    maxRequests: 10,
    remaining: 10,
    isUnlimited: false,
    isLoading: true,
    error: null,
  });

  const fetchUsage = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStats(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const { data, error } = await supabase.rpc('get_ai_usage_stats', {
        p_user_id: session.user.id
      });

      if (error) {
        console.error('Error fetching AI usage:', error);
        setStats(prev => ({ ...prev, isLoading: false, error: error.message }));
        return;
      }

      if (data) {
        // Type assertion since the database function returns Json type
        const usageData = data as unknown as {
          tier?: string;
          current_usage?: number;
          max_requests?: number | null;
          remaining?: number | null;
          is_unlimited?: boolean;
        };
        
        setStats({
          tier: usageData.tier || 'Free',
          currentUsage: usageData.current_usage || 0,
          maxRequests: usageData.max_requests ?? null,
          remaining: usageData.remaining ?? null,
          isUnlimited: usageData.is_unlimited || false,
          isLoading: false,
          error: null,
        });
      }
    } catch (err) {
      console.error('Exception fetching AI usage:', err);
      setStats(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }));
    }
  }, []);

  useEffect(() => {
    fetchUsage();

    // Refresh on auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUsage();
    });

    return () => subscription.unsubscribe();
  }, [fetchUsage]);

  const getUsagePercentage = useCallback(() => {
    if (stats.isUnlimited || !stats.maxRequests) return 0;
    return Math.min(100, Math.round((stats.currentUsage / stats.maxRequests) * 100));
  }, [stats]);

  const isNearLimit = useCallback(() => {
    if (stats.isUnlimited) return false;
    return stats.remaining !== null && stats.remaining <= 3;
  }, [stats]);

  const isAtLimit = useCallback(() => {
    if (stats.isUnlimited) return false;
    return stats.remaining !== null && stats.remaining <= 0;
  }, [stats]);

  return {
    ...stats,
    refetch: fetchUsage,
    getUsagePercentage,
    isNearLimit,
    isAtLimit,
  };
};
