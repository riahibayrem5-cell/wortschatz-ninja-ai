-- Add ai_requests_count column to daily_activity for usage tracking
ALTER TABLE public.daily_activity 
ADD COLUMN IF NOT EXISTS ai_requests_count integer DEFAULT 0;

-- Create function to track AI usage and check quotas
CREATE OR REPLACE FUNCTION public.track_ai_usage(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier_name text;
  v_max_requests integer;
  v_current_usage integer;
  v_is_premium boolean;
  v_today date := CURRENT_DATE;
BEGIN
  -- Get user's subscription tier
  SELECT 
    COALESCE(st.name, 'Free'),
    st.max_ai_requests,
    COALESCE(us.status = 'active', false)
  INTO v_tier_name, v_max_requests, v_is_premium
  FROM profiles p
  LEFT JOIN user_subscriptions us ON us.user_id = p.id AND us.status = 'active'
  LEFT JOIN subscription_tiers st ON st.id = us.tier_id
  WHERE p.id = p_user_id;
  
  -- Get or create today's activity record
  INSERT INTO daily_activity (user_id, activity_date, ai_requests_count)
  VALUES (p_user_id, v_today, 1)
  ON CONFLICT (user_id, activity_date) 
  DO UPDATE SET 
    ai_requests_count = COALESCE(daily_activity.ai_requests_count, 0) + 1,
    updated_at = now()
  RETURNING ai_requests_count INTO v_current_usage;
  
  -- Check if over quota (null = unlimited)
  IF v_max_requests IS NOT NULL AND v_current_usage > v_max_requests THEN
    RETURN json_build_object(
      'allowed', false,
      'tier', v_tier_name,
      'current_usage', v_current_usage,
      'max_requests', v_max_requests,
      'message', 'Daily AI request limit reached. Upgrade your plan for more requests.'
    );
  END IF;
  
  RETURN json_build_object(
    'allowed', true,
    'tier', v_tier_name,
    'current_usage', v_current_usage,
    'max_requests', v_max_requests,
    'remaining', CASE WHEN v_max_requests IS NULL THEN NULL ELSE v_max_requests - v_current_usage END
  );
END;
$$;

-- Create function to get AI usage stats without incrementing
CREATE OR REPLACE FUNCTION public.get_ai_usage_stats(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier_name text;
  v_max_requests integer;
  v_current_usage integer;
  v_today date := CURRENT_DATE;
BEGIN
  -- Get user's subscription tier
  SELECT 
    COALESCE(st.name, 'Free'),
    st.max_ai_requests
  INTO v_tier_name, v_max_requests
  FROM profiles p
  LEFT JOIN user_subscriptions us ON us.user_id = p.id AND us.status = 'active'
  LEFT JOIN subscription_tiers st ON st.id = us.tier_id
  WHERE p.id = p_user_id;
  
  -- Get today's usage
  SELECT COALESCE(ai_requests_count, 0)
  INTO v_current_usage
  FROM daily_activity
  WHERE user_id = p_user_id AND activity_date = v_today;
  
  v_current_usage := COALESCE(v_current_usage, 0);
  
  RETURN json_build_object(
    'tier', v_tier_name,
    'current_usage', v_current_usage,
    'max_requests', v_max_requests,
    'remaining', CASE WHEN v_max_requests IS NULL THEN NULL ELSE GREATEST(0, v_max_requests - v_current_usage) END,
    'is_unlimited', v_max_requests IS NULL
  );
END;
$$;