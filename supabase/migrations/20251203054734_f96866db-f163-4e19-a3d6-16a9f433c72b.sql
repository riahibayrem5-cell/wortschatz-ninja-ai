-- Create telc_exam_attempts table for exam persistence and history
CREATE TABLE public.telc_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'practice',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  current_section TEXT,
  current_teil INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}'::jsonb,
  writing_answers JSONB DEFAULT '{}'::jsonb,
  exam_state JSONB DEFAULT '{}'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  time_spent_seconds INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 300,
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.telc_exam_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own exam attempts"
ON public.telc_exam_attempts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_telc_attempts_user ON public.telc_exam_attempts(user_id);
CREATE INDEX idx_telc_attempts_status ON public.telc_exam_attempts(status);
CREATE INDEX idx_telc_attempts_user_status ON public.telc_exam_attempts(user_id, status);

-- Create trigger for updated_at
CREATE TRIGGER update_telc_exam_attempts_updated_at
BEFORE UPDATE ON public.telc_exam_attempts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();