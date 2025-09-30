-- Enable RLS on server_metrics table
ALTER TABLE public.server_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading server metrics (public read for status monitoring)
CREATE POLICY "Anyone can view server metrics"
  ON public.server_metrics
  FOR SELECT
  USING (true);

-- Only service role can insert metrics (for internal monitoring)
CREATE POLICY "Service role can insert metrics"
  ON public.server_metrics
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');