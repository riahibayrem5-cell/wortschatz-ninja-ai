-- Phase 1: Security - Restrict course content to authenticated users
-- Update course_modules policy to require authentication
DROP POLICY IF EXISTS "Anyone can view course modules" ON public.course_modules;
CREATE POLICY "Authenticated users can view course modules" 
ON public.course_modules 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update course_lessons policy to require authentication
DROP POLICY IF EXISTS "Anyone can view course lessons" ON public.course_lessons;
CREATE POLICY "Authenticated users can view course lessons" 
ON public.course_lessons 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create user_settings table for onboarding and preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  native_language TEXT DEFAULT 'en',
  exam_target_date DATE,
  daily_reminder_time TIME,
  timezone TEXT DEFAULT 'UTC',
  theme TEXT DEFAULT 'system',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_settings
CREATE POLICY "Users can view own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create TELC section scores table for persistent history
CREATE TABLE IF NOT EXISTS public.telc_section_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  section TEXT NOT NULL,
  teil INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  time_spent_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on telc_section_scores
ALTER TABLE public.telc_section_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for telc_section_scores
CREATE POLICY "Users can view own section scores" 
ON public.telc_section_scores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own section scores" 
ON public.telc_section_scores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update handle_new_user function to also create user_settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  INSERT INTO public.user_progress (user_id)
  VALUES (new.id);
  
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$function$;

-- Add updated_at trigger for user_settings
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();