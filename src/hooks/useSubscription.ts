import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionData {
  isSubscribed: boolean;
  isPremium: boolean;
  isPermanent: boolean;
  tier: 'free' | 'basic' | 'pro' | 'premium';
  tierName: string | null;
  tierId: string | null;
  expiresAt: Date | null;
  maxAiRequests: number | null;
  maxExercises: number | null;
  isLoading: boolean;
}

interface TierLimits {
  free: { ai: 10, exercises: 5 };
  basic: { ai: 100, exercises: 50 };
  pro: { ai: 500, exercises: 200 };
  premium: { ai: null, exercises: null };
}

const TIER_LIMITS: TierLimits = {
  free: { ai: 10, exercises: 5 },
  basic: { ai: 100, exercises: 50 },
  pro: { ai: 500, exercises: 200 },
  premium: { ai: null, exercises: null }, // null = unlimited
};

export const useSubscription = (): SubscriptionData & {
  refetch: () => Promise<void>;
  checkFeatureAccess: (feature: PremiumFeature) => boolean;
  getRemainingQuota: (type: 'ai' | 'exercises') => Promise<number | null>;
} => {
  const [data, setData] = useState<SubscriptionData>({
    isSubscribed: false,
    isPremium: false,
    isPermanent: false,
    tier: 'free',
    tierName: null,
    tierId: null,
    expiresAt: null,
    maxAiRequests: TIER_LIMITS.free.ai,
    maxExercises: TIER_LIMITS.free.exercises,
    isLoading: true,
  });

  const fetchSubscription = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Get user subscription with tier info
      const { data: subData, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_tiers (
            id,
            name,
            max_ai_requests,
            max_exercises
          )
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      if (!subData || !subData.subscription_tiers) {
        // Free tier
        setData({
          isSubscribed: false,
          isPremium: false,
          isPermanent: false,
          tier: 'free',
          tierName: 'Free',
          tierId: null,
          expiresAt: null,
          maxAiRequests: TIER_LIMITS.free.ai,
          maxExercises: TIER_LIMITS.free.exercises,
          isLoading: false,
        });
        return;
      }

      const tierInfo = subData.subscription_tiers as any;
      const tierName = tierInfo.name?.toLowerCase() || 'basic';
      const tier = (['basic', 'pro', 'premium'].includes(tierName) ? tierName : 'basic') as 'basic' | 'pro' | 'premium';
      
      // Check if subscription is still valid
      const isExpired = subData.expires_at && !subData.is_permanent && new Date(subData.expires_at) < new Date();
      
      if (isExpired) {
        setData({
          isSubscribed: false,
          isPremium: false,
          isPermanent: false,
          tier: 'free',
          tierName: 'Free',
          tierId: null,
          expiresAt: null,
          maxAiRequests: TIER_LIMITS.free.ai,
          maxExercises: TIER_LIMITS.free.exercises,
          isLoading: false,
        });
        return;
      }

      setData({
        isSubscribed: true,
        isPremium: tier === 'premium',
        isPermanent: subData.is_permanent || false,
        tier,
        tierName: tierInfo.name,
        tierId: tierInfo.id,
        expiresAt: subData.expires_at ? new Date(subData.expires_at) : null,
        maxAiRequests: tierInfo.max_ai_requests,
        maxExercises: tierInfo.max_exercises,
        isLoading: false,
      });
    } catch (error) {
      console.error('Subscription check error:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    fetchSubscription();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });

    return () => subscription.unsubscribe();
  }, [fetchSubscription]);

  const checkFeatureAccess = useCallback((feature: PremiumFeature): boolean => {
    if (data.isLoading) return false;
    
    const featureRequirements = PREMIUM_FEATURES[feature];
    if (!featureRequirements) return true; // Feature not defined, allow access
    
    const tierLevel = { free: 0, basic: 1, pro: 2, premium: 3 };
    return tierLevel[data.tier] >= tierLevel[featureRequirements.minTier];
  }, [data.isLoading, data.tier]);

  const getRemainingQuota = useCallback(async (type: 'ai' | 'exercises'): Promise<number | null> => {
    if (!data.isSubscribed && type === 'ai') {
      // For free users, count today's usage
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return 0;

      const today = new Date().toISOString().split('T')[0];
      const { data: activity } = await supabase
        .from('daily_activity')
        .select('exercises_completed')
        .eq('user_id', session.user.id)
        .eq('activity_date', today)
        .maybeSingle();

      const used = activity?.exercises_completed || 0;
      const limit = data.maxAiRequests || TIER_LIMITS.free.ai;
      return Math.max(0, limit - used);
    }

    // Unlimited for premium
    if (data.maxAiRequests === null && type === 'ai') return null;
    if (data.maxExercises === null && type === 'exercises') return null;

    // Return the remaining quota
    return type === 'ai' ? data.maxAiRequests : data.maxExercises;
  }, [data]);

  return {
    ...data,
    refetch: fetchSubscription,
    checkFeatureAccess,
    getRemainingQuota,
  };
};

// Premium features definition
export type PremiumFeature = 
  | 'ai_companion'
  | 'conversation_practice'
  | 'writing_assistant'
  | 'telc_exam'
  | 'telc_vorbereitung'
  | 'mastery_course'
  | 'word_association'
  | 'sentence_generator'
  | 'memorizer'
  | 'text_highlighter'
  | 'certificates'
  | 'unlimited_exercises'
  | 'unlimited_ai';

interface FeatureConfig {
  minTier: 'free' | 'basic' | 'pro' | 'premium';
  name: string;
  description: string;
}

export const PREMIUM_FEATURES: Record<PremiumFeature, FeatureConfig> = {
  ai_companion: { minTier: 'basic', name: 'AI Companion', description: 'Personal AI tutor for German learning' },
  conversation_practice: { minTier: 'basic', name: 'Conversation Practice', description: 'Practice real-world conversations' },
  writing_assistant: { minTier: 'basic', name: 'Writing Assistant', description: 'AI-powered writing feedback' },
  telc_exam: { minTier: 'pro', name: 'TELC Mock Exams', description: 'Full practice exams with scoring' },
  telc_vorbereitung: { minTier: 'basic', name: 'TELC Preparation', description: 'TELC B2 exam preparation materials' },
  mastery_course: { minTier: 'pro', name: 'Mastery Course', description: '12-week structured learning program' },
  word_association: { minTier: 'basic', name: 'Word Association', description: 'Advanced vocabulary learning' },
  sentence_generator: { minTier: 'basic', name: 'Sentence Generator', description: 'AI-generated practice sentences' },
  memorizer: { minTier: 'basic', name: 'Memorizer', description: 'Spaced repetition for vocabulary' },
  text_highlighter: { minTier: 'basic', name: 'Text Highlighter', description: 'Analyze and highlight German texts' },
  certificates: { minTier: 'pro', name: 'Certificates', description: 'Achievement certificates' },
  unlimited_exercises: { minTier: 'premium', name: 'Unlimited Exercises', description: 'No limits on exercises' },
  unlimited_ai: { minTier: 'premium', name: 'Unlimited AI', description: 'No limits on AI requests' },
};
