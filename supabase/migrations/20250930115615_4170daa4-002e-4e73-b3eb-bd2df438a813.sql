-- Fix function search_path issues by updating existing functions

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  INSERT INTO public.user_progress (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$function$;

-- Update handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix server_metrics RLS - remove public access, only allow authenticated users to view
DROP POLICY IF EXISTS "Anyone can view server metrics" ON public.server_metrics;

CREATE POLICY "Authenticated users can view server metrics" 
ON public.server_metrics 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Note: profiles INSERT policy is intentionally not added as profiles are created via trigger only
-- This is correct security design - users shouldn't manually insert profiles

-- Add comment explaining the design
COMMENT ON TABLE public.profiles IS 'User profiles are created automatically via trigger on auth.users. Manual INSERT is intentionally not allowed.';