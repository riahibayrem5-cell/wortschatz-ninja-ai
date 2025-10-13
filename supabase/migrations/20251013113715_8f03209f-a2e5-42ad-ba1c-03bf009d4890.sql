-- Create subscription tiers table
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_tnd DECIMAL(10,2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_ai_requests INTEGER,
  max_exercises INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier_id UUID REFERENCES public.subscription_tiers(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  is_permanent BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_tiers (public read)
CREATE POLICY "Anyone can view subscription tiers"
  ON public.subscription_tiers FOR SELECT
  USING (true);

-- Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert subscription tiers
INSERT INTO public.subscription_tiers (name, price_tnd, features, max_ai_requests, max_exercises) VALUES
  ('Basic', 5.00, '["100 AI requests/month", "50 exercises/month", "Basic features"]'::jsonb, 100, 50),
  ('Pro', 12.00, '["500 AI requests/month", "200 exercises/month", "All features", "Priority support"]'::jsonb, 500, 200),
  ('Premium', 20.00, '["Unlimited AI requests", "Unlimited exercises", "All features", "Priority support", "Exclusive content"]'::jsonb, NULL, NULL);

-- Function to check subscription status
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = user_id_param
    AND status = 'active'
    AND (is_permanent = true OR expires_at > NOW())
  );
END;
$$;

-- Grant permanent premium subscription to specified email
DO $$
DECLARE
  target_user_id UUID;
  premium_tier_id UUID;
BEGIN
  -- Get user ID for the specified email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'riahibayrem5@gmail.com';
  
  -- Get Premium tier ID
  SELECT id INTO premium_tier_id
  FROM public.subscription_tiers
  WHERE name = 'Premium';
  
  -- Only insert if user exists
  IF target_user_id IS NOT NULL AND premium_tier_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, tier_id, status, is_permanent)
    VALUES (target_user_id, premium_tier_id, 'active', true)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      tier_id = premium_tier_id,
      status = 'active',
      is_permanent = true,
      updated_at = NOW();
  END IF;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();