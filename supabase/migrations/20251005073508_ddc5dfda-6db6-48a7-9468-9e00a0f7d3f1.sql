-- Function to calculate and update user streak
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_yesterday DATE;
  v_today DATE;
  v_had_activity_yesterday BOOLEAN;
  v_current_streak INTEGER;
BEGIN
  v_user_id := NEW.user_id;
  v_today := NEW.activity_date;
  v_yesterday := v_today - INTERVAL '1 day';
  
  -- Check if there's any activity today (at least one non-zero field)
  IF (NEW.exercises_completed + NEW.words_learned + NEW.conversations_count + NEW.writing_submissions_count + NEW.review_sessions_count) = 0 THEN
    RETURN NEW;
  END IF;
  
  -- Check if user had activity yesterday
  SELECT EXISTS (
    SELECT 1 FROM public.daily_activity
    WHERE user_id = v_user_id
    AND activity_date = v_yesterday::date
    AND (exercises_completed + words_learned + conversations_count + writing_submissions_count + review_sessions_count) > 0
  ) INTO v_had_activity_yesterday;
  
  -- Get current streak
  SELECT COALESCE(streak_days, 0) INTO v_current_streak
  FROM public.user_progress
  WHERE user_id = v_user_id;
  
  -- Update streak
  IF v_had_activity_yesterday THEN
    -- Continue streak
    UPDATE public.user_progress
    SET streak_days = v_current_streak + 1,
        last_activity_date = v_today,
        updated_at = NOW()
    WHERE user_id = v_user_id;
  ELSE
    -- Check if this is a new streak or broken streak
    SELECT last_activity_date INTO v_yesterday
    FROM public.user_progress
    WHERE user_id = v_user_id;
    
    -- If last activity was more than 1 day ago, reset streak
    IF v_yesterday IS NULL OR v_yesterday < (v_today - INTERVAL '1 day')::date THEN
      UPDATE public.user_progress
      SET streak_days = 1,
          last_activity_date = v_today,
          updated_at = NOW()
      WHERE user_id = v_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to update streak when activity is tracked
DROP TRIGGER IF EXISTS trigger_update_streak ON public.daily_activity;
CREATE TRIGGER trigger_update_streak
AFTER INSERT OR UPDATE ON public.daily_activity
FOR EACH ROW
EXECUTE FUNCTION public.update_user_streak();

-- Function to sync user_progress with daily_activity totals
CREATE OR REPLACE FUNCTION public.sync_user_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update total counts in user_progress
  UPDATE public.user_progress
  SET 
    exercises_completed = (
      SELECT COALESCE(SUM(exercises_completed), 0) 
      FROM public.daily_activity 
      WHERE user_id = NEW.user_id
    ),
    words_learned = (
      SELECT COALESCE(SUM(words_learned), 0) 
      FROM public.daily_activity 
      WHERE user_id = NEW.user_id
    ),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to sync totals
DROP TRIGGER IF EXISTS trigger_sync_progress ON public.daily_activity;
CREATE TRIGGER trigger_sync_progress
AFTER INSERT OR UPDATE ON public.daily_activity
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_progress();