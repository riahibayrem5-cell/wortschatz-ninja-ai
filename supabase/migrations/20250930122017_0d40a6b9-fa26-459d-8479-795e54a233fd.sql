-- Remove the policy that allows all authenticated users to view server metrics
DROP POLICY IF EXISTS "Authenticated users can view server metrics" ON public.server_metrics;

-- Create a more restrictive policy that only allows service role to read metrics
-- This ensures internal metrics are not exposed to regular users
CREATE POLICY "Only service role can view metrics" 
ON public.server_metrics 
FOR SELECT 
USING (auth.role() = 'service_role'::text);

-- The existing INSERT policy is already correct:
-- "Service role can insert metrics" allows only service_role to insert data