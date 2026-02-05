-- Fix permissive RLS policies on monitor_runs and system_alerts
-- These tables should only be managed by service role, not public

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Service role can manage monitor runs" ON public.monitor_runs;
DROP POLICY IF EXISTS "Service role can manage alerts" ON public.system_alerts;

-- Create proper restrictive policies for monitor_runs
-- Only service role should manage monitor runs (for internal system monitoring)
CREATE POLICY "Service role manages monitor runs"
ON public.monitor_runs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can view monitor runs
CREATE POLICY "Admins can view monitor runs"
ON public.monitor_runs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create proper restrictive policies for system_alerts
-- Only service role can manage alerts (insert/update/delete)
CREATE POLICY "Service role manages system alerts"
ON public.system_alerts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can view and acknowledge alerts
CREATE POLICY "Admins can view system alerts"
ON public.system_alerts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update alerts (acknowledge them)
CREATE POLICY "Admins can acknowledge alerts"
ON public.system_alerts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));