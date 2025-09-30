-- Add INSERT policy to profiles table for defense-in-depth
-- This allows users to create only their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);