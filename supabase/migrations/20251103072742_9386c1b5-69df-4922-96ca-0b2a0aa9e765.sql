-- Update subscription tiers if they don't have proper data
UPDATE subscription_tiers 
SET features = '["Basic vocabulary tools", "10 exercises/day", "Email support", "Progress tracking"]',
    max_ai_requests = 100,
    max_exercises = 300
WHERE name = 'Starter';

UPDATE subscription_tiers 
SET features = '["Everything in Starter", "Unlimited exercises", "AI conversation practice", "TELC B2 exam prep", "Priority support", "Mistake analysis"]',
    max_ai_requests = 500,
    max_exercises = NULL
WHERE name = 'Premium';

UPDATE subscription_tiers 
SET features = '["Everything in Premium", "Unlimited AI requests", "1-on-1 coaching session/month", "Custom learning path", "Advanced analytics", "Lifetime access option"]',
    max_ai_requests = NULL,
    max_exercises = NULL
WHERE name = 'Elite';

-- Create stripe_product_mappings table for mapping tiers to Stripe products
CREATE TABLE IF NOT EXISTS stripe_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID REFERENCES subscription_tiers(id) ON DELETE CASCADE,
  stripe_price_id TEXT NOT NULL UNIQUE,
  stripe_product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stripe_product_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stripe product mappings"
  ON stripe_product_mappings FOR SELECT
  USING (true);

-- Create subscription_reminders table for tracking reminder dismissals
CREATE TABLE IF NOT EXISTS subscription_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT now(),
  reminder_type TEXT NOT NULL DEFAULT 'renewal',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscription_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders"
  ON subscription_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
  ON subscription_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_reminders_user_id ON subscription_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_product_mappings_tier ON stripe_product_mappings(tier_id);