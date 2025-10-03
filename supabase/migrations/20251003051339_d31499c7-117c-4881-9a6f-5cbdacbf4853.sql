-- Create content cache table for storing generated text and audio
CREATE TABLE IF NOT EXISTS public.content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'text', 'audio', 'exercise', 'vocabulary', etc.
  cache_key TEXT NOT NULL, -- hash of input parameters
  content_data JSONB NOT NULL, -- the actual generated content
  audio_url TEXT, -- for audio content
  difficulty TEXT,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_count INTEGER DEFAULT 0,
  UNIQUE(cache_key, user_id)
);

-- Enable RLS
ALTER TABLE public.content_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own cached content"
  ON public.content_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cached content"
  ON public.content_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cached content"
  ON public.content_cache FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cached content"
  ON public.content_cache FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_content_cache_key ON public.content_cache(cache_key, user_id);
CREATE INDEX idx_content_cache_type ON public.content_cache(content_type, user_id);
CREATE INDEX idx_content_cache_accessed ON public.content_cache(accessed_at DESC);

-- Add metadata to mistakes table for better tracking
ALTER TABLE public.mistakes ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.mistakes ADD COLUMN IF NOT EXISTS context JSONB;
ALTER TABLE public.mistakes ADD COLUMN IF NOT EXISTS resolved BOOLEAN DEFAULT false;
ALTER TABLE public.mistakes ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for better mistake querying
CREATE INDEX IF NOT EXISTS idx_mistakes_type ON public.mistakes(type, user_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_category ON public.mistakes(category, user_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_resolved ON public.mistakes(resolved, user_id);