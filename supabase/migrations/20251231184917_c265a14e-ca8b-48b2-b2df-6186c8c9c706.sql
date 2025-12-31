-- Fix profiles table RLS - ensure users can ONLY view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate as PERMISSIVE policies (default) with strict user-only access
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile only" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile only" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Fix writing_submissions table RLS - ensure strict user-only access for all operations
DROP POLICY IF EXISTS "Users can manage own writing submissions" ON public.writing_submissions;

-- Create separate PERMISSIVE policies for each operation with strict user-only access
CREATE POLICY "Users can view own writing submissions only" 
ON public.writing_submissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own writing submissions only" 
ON public.writing_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own writing submissions only" 
ON public.writing_submissions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own writing submissions only" 
ON public.writing_submissions 
FOR DELETE 
USING (auth.uid() = user_id);