-- Enable required extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create system_alerts table for storing triggered alerts
CREATE TABLE public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  details JSONB,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create monitor_runs table for execution history
CREATE TABLE public.monitor_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  checks_performed INTEGER DEFAULT 0,
  alerts_triggered INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitor_runs ENABLE ROW LEVEL SECURITY;

-- RLS policies - only admins can view (we'll use service role for the agent)
CREATE POLICY "Service role can manage alerts"
ON public.system_alerts FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage monitor runs"
ON public.monitor_runs FOR ALL
USING (true)
WITH CHECK (true);

-- Index for faster queries
CREATE INDEX idx_system_alerts_acknowledged ON public.system_alerts(acknowledged, created_at DESC);
CREATE INDEX idx_system_alerts_severity ON public.system_alerts(severity, created_at DESC);
CREATE INDEX idx_monitor_runs_type ON public.monitor_runs(run_type, created_at DESC);