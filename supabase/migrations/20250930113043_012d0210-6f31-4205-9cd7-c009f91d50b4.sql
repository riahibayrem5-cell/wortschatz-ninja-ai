-- Create daily_activity table to track user activity per day
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercises_completed INTEGER DEFAULT 0,
  words_learned INTEGER DEFAULT 0,
  conversations_count INTEGER DEFAULT 0,
  writing_submissions_count INTEGER DEFAULT 0,
  review_sessions_count INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- Enable RLS
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own daily activity"
  ON public.daily_activity
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily activity"
  ON public.daily_activity
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily activity"
  ON public.daily_activity
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update or insert daily activity
CREATE OR REPLACE FUNCTION public.track_daily_activity(
  activity_type TEXT,
  increment_value INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.daily_activity (
    user_id,
    activity_date,
    exercises_completed,
    words_learned,
    conversations_count,
    writing_submissions_count,
    review_sessions_count
  ) VALUES (
    v_user_id,
    CURRENT_DATE,
    CASE WHEN activity_type = 'exercise' THEN increment_value ELSE 0 END,
    CASE WHEN activity_type = 'word' THEN increment_value ELSE 0 END,
    CASE WHEN activity_type = 'conversation' THEN increment_value ELSE 0 END,
    CASE WHEN activity_type = 'writing' THEN increment_value ELSE 0 END,
    CASE WHEN activity_type = 'review' THEN increment_value ELSE 0 END
  )
  ON CONFLICT (user_id, activity_date) 
  DO UPDATE SET
    exercises_completed = daily_activity.exercises_completed + 
      CASE WHEN activity_type = 'exercise' THEN increment_value ELSE 0 END,
    words_learned = daily_activity.words_learned + 
      CASE WHEN activity_type = 'word' THEN increment_value ELSE 0 END,
    conversations_count = daily_activity.conversations_count + 
      CASE WHEN activity_type = 'conversation' THEN increment_value ELSE 0 END,
    writing_submissions_count = daily_activity.writing_submissions_count + 
      CASE WHEN activity_type = 'writing' THEN increment_value ELSE 0 END,
    review_sessions_count = daily_activity.review_sessions_count + 
      CASE WHEN activity_type = 'review' THEN increment_value ELSE 0 END,
    updated_at = NOW();
END;
$$;

-- Create server health metrics table
CREATE TABLE IF NOT EXISTS public.server_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_daily_activity_user_date ON public.daily_activity(user_id, activity_date DESC);
CREATE INDEX idx_server_metrics_timestamp ON public.server_metrics(timestamp DESC);

-- Create trigger to update daily_activity updated_at
CREATE TRIGGER update_daily_activity_updated_at
  BEFORE UPDATE ON public.daily_activity
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();