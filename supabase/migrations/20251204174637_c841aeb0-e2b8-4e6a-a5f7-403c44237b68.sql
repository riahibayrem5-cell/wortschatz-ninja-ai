-- Create user_learning_paths table for AI-powered learning paths
CREATE TABLE public.user_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_level TEXT DEFAULT 'B2',
  target_date DATE,
  current_week INTEGER DEFAULT 1,
  total_weeks INTEGER DEFAULT 12,
  completed_modules TEXT[] DEFAULT ARRAY[]::TEXT[],
  weak_areas JSONB DEFAULT '{}'::jsonb,
  strong_areas JSONB DEFAULT '{}'::jsonb,
  recommended_next_action TEXT,
  daily_goal_minutes INTEGER DEFAULT 30,
  preferred_focus TEXT,
  last_lesson_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create achievements table for gamification
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 50,
  badge_color TEXT DEFAULT 'primary',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  notified BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, achievement_id)
);

-- Create daily_lessons table for tracking lesson completions
CREATE TABLE public.daily_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  learning_path_id UUID REFERENCES public.user_learning_paths(id) ON DELETE CASCADE,
  lesson_date DATE DEFAULT CURRENT_DATE,
  lesson_data JSONB NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_date)
);

-- Enable RLS on all tables
ALTER TABLE public.user_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_lessons ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_learning_paths
CREATE POLICY "Users can manage own learning paths"
ON public.user_learning_paths
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for achievements (public read)
CREATE POLICY "Anyone can view achievements"
ON public.achievements
FOR SELECT
USING (true);

-- RLS policies for user_achievements
CREATE POLICY "Users can manage own achievements"
ON public.user_achievements
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for daily_lessons
CREATE POLICY "Users can manage own daily lessons"
ON public.daily_lessons
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_learning_paths_user ON public.user_learning_paths(user_id);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_completed ON public.user_achievements(user_id, completed);
CREATE INDEX idx_daily_lessons_user_date ON public.daily_lessons(user_id, lesson_date);
CREATE INDEX idx_vocab_next_review ON public.vocabulary_items(user_id, next_review_date);
CREATE INDEX idx_daily_activity_date ON public.daily_activity(user_id, activity_date DESC);
CREATE INDEX idx_mistakes_recent ON public.mistakes(user_id, created_at DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_user_learning_paths_updated_at
BEFORE UPDATE ON public.user_learning_paths
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default achievements
INSERT INTO public.achievements (id, name, description, icon, category, requirement, points, badge_color) VALUES
('streak_7', '7-Day Streak', 'Maintain a 7-day learning streak', '🔥', 'streak', 7, 50, 'orange'),
('streak_30', 'Month Master', 'Maintain a 30-day learning streak', '🔥', 'streak', 30, 200, 'orange'),
('streak_100', 'Century Streak', 'Maintain a 100-day learning streak', '🔥', 'streak', 100, 500, 'orange'),
('words_50', 'Word Explorer', 'Learn 50 vocabulary words', '📚', 'vocabulary', 50, 50, 'blue'),
('words_100', 'Word Collector', 'Learn 100 vocabulary words', '📚', 'vocabulary', 100, 100, 'blue'),
('words_500', 'Word Master', 'Learn 500 vocabulary words', '📚', 'vocabulary', 500, 300, 'blue'),
('exercises_25', 'Exercise Starter', 'Complete 25 exercises', '💪', 'exercises', 25, 50, 'green'),
('exercises_100', 'Exercise Pro', 'Complete 100 exercises', '💪', 'exercises', 100, 150, 'green'),
('exercises_500', 'Exercise Champion', 'Complete 500 exercises', '💪', 'exercises', 500, 400, 'green'),
('telc_first', 'First Mock Exam', 'Complete your first TELC mock exam', '🎓', 'telc', 1, 100, 'purple'),
('telc_pass', 'TELC Passer', 'Score 60%+ on a TELC mock exam', '🎓', 'telc', 60, 250, 'purple'),
('telc_excellent', 'TELC Excellence', 'Score 90%+ on a TELC mock exam', '🎓', 'telc', 90, 500, 'purple'),
('conversations_10', 'Conversationalist', 'Complete 10 AI conversations', '💬', 'conversation', 10, 75, 'cyan'),
('writing_10', 'Writer', 'Submit 10 writing exercises', '✍️', 'writing', 10, 75, 'pink'),
('perfect_day', 'Perfect Day', 'Complete all daily activities', '⭐', 'special', 1, 100, 'gold'),
('early_bird', 'Early Bird', 'Practice before 8 AM', '🌅', 'special', 1, 50, 'yellow'),
('night_owl', 'Night Owl', 'Practice after 10 PM', '🌙', 'special', 1, 50, 'indigo');