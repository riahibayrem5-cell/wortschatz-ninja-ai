-- Add exercises table
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('quiz', 'translation')),
  topic text,
  question text NOT NULL,
  correct_answer text NOT NULL,
  user_answer text,
  options jsonb,
  analysis text,
  is_correct boolean,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exercises"
  ON public.exercises FOR ALL
  USING (auth.uid() = user_id);

-- Add memorizer_items table
CREATE TABLE public.memorizer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  theme text NOT NULL,
  difficulty text NOT NULL,
  german_text text NOT NULL,
  english_translation text NOT NULL,
  srs_level integer DEFAULT 0 NOT NULL,
  next_review_date timestamptz DEFAULT now() NOT NULL,
  last_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.memorizer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own memorizer items"
  ON public.memorizer_items FOR ALL
  USING (auth.uid() = user_id);

-- Add conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scenario text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations"
  ON public.conversations FOR ALL
  USING (auth.uid() = user_id);

-- Add writing_submissions table
CREATE TABLE public.writing_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL,
  original_text text NOT NULL,
  corrected_text text NOT NULL,
  overall_feedback text NOT NULL,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  score integer,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.writing_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own writing submissions"
  ON public.writing_submissions FOR ALL
  USING (auth.uid() = user_id);

-- Add highlighted_articles table
CREATE TABLE public.highlighted_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  highlighted_words jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.highlighted_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own articles"
  ON public.highlighted_articles FOR ALL
  USING (auth.uid() = user_id);

-- Add trigger for conversations updated_at
CREATE TRIGGER handle_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Update mistakes table to add category
ALTER TABLE public.mistakes ADD COLUMN IF NOT EXISTS category text DEFAULT 'grammar';

-- Create indexes for performance
CREATE INDEX idx_vocabulary_next_review ON public.vocabulary_items(user_id, next_review_date);
CREATE INDEX idx_memorizer_next_review ON public.memorizer_items(user_id, next_review_date);
CREATE INDEX idx_exercises_user_created ON public.exercises(user_id, created_at DESC);
CREATE INDEX idx_conversations_user_status ON public.conversations(user_id, status);
CREATE INDEX idx_writing_user_created ON public.writing_submissions(user_id, created_at DESC);