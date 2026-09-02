ALTER TABLE public.course_lessons
  ADD COLUMN IF NOT EXISTS content_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS xp_reward integer NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS focus_skill text,
  ADD COLUMN IF NOT EXISTS generation_brief text,
  ADD COLUMN IF NOT EXISTS content_updated_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS course_lessons_module_lesson_uniq
  ON public.course_lessons (module_id, lesson_number);

CREATE INDEX IF NOT EXISTS course_lessons_version_idx
  ON public.course_lessons (content_version);

GRANT SELECT ON public.course_lessons TO authenticated;
GRANT ALL ON public.course_lessons TO service_role;