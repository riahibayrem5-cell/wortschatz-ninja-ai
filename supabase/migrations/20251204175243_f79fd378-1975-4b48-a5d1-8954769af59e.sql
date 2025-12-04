
-- Create course_modules table for the 12-week curriculum
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_de TEXT NOT NULL,
  description TEXT NOT NULL,
  description_de TEXT NOT NULL,
  skills_focus JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_hours INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_lessons table
CREATE TABLE public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_de TEXT NOT NULL,
  lesson_type TEXT NOT NULL, -- 'reading', 'listening', 'writing', 'speaking', 'grammar', 'vocabulary', 'exam_practice'
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  estimated_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_course_progress table
CREATE TABLE public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  score INTEGER,
  time_spent_minutes INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, module_id, lesson_id)
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  certificate_type TEXT NOT NULL DEFAULT 'course_completion', -- 'course_completion', 'module_completion', 'excellence'
  title TEXT NOT NULL,
  description TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  certificate_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ai_tutor_sessions table
CREATE TABLE public.ai_tutor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id UUID REFERENCES public.course_modules(id),
  lesson_id UUID REFERENCES public.course_lessons(id),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  topic TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_modules (public read)
CREATE POLICY "Anyone can view course modules" ON public.course_modules FOR SELECT USING (true);

-- RLS policies for course_lessons (public read)
CREATE POLICY "Anyone can view course lessons" ON public.course_lessons FOR SELECT USING (true);

-- RLS policies for user_course_progress
CREATE POLICY "Users can manage own course progress" ON public.user_course_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS policies for certificates
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for ai_tutor_sessions
CREATE POLICY "Users can manage own tutor sessions" ON public.ai_tutor_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_course_lessons_module ON public.course_lessons(module_id);
CREATE INDEX idx_user_course_progress_user ON public.user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_module ON public.user_course_progress(module_id);
CREATE INDEX idx_certificates_user ON public.certificates(user_id);
CREATE INDEX idx_certificates_verification ON public.certificates(verification_code);
CREATE INDEX idx_ai_tutor_sessions_user ON public.ai_tutor_sessions(user_id);

-- Insert 12-week course curriculum
INSERT INTO public.course_modules (week_number, title, title_de, description, description_de, skills_focus, estimated_hours) VALUES
(1, 'Foundation Building', 'Grundlagen aufbauen', 'Master essential B2 vocabulary and review core grammar structures needed for TELC success.', 'Beherrschen Sie den wesentlichen B2-Wortschatz und wiederholen Sie die für den TELC-Erfolg erforderlichen Kerngrammatikstrukturen.', '["vocabulary", "grammar_review", "reading_basics"]', 6),
(2, 'Reading Comprehension I', 'Leseverstehen I', 'Develop strategies for understanding complex texts, main ideas, and detailed information.', 'Entwickeln Sie Strategien zum Verstehen komplexer Texte, Hauptideen und detaillierter Informationen.', '["reading", "text_analysis", "vocabulary_in_context"]', 7),
(3, 'Listening Skills I', 'Hörverstehen I', 'Train your ear to understand native speakers, extract key information from audio materials.', 'Trainieren Sie Ihr Ohr, um Muttersprachler zu verstehen und wichtige Informationen aus Audiomaterialien zu extrahieren.', '["listening", "note_taking", "audio_comprehension"]', 6),
(4, 'Writing Fundamentals', 'Schreiben Grundlagen', 'Learn to write formal letters, emails, and structured arguments for the TELC writing section.', 'Lernen Sie, formelle Briefe, E-Mails und strukturierte Argumente für den TELC-Schreibteil zu verfassen.', '["writing", "formal_style", "text_structure"]', 7),
(5, 'Speaking Basics', 'Sprechen Grundlagen', 'Build confidence in spoken German through presentations, discussions, and role-plays.', 'Bauen Sie Selbstvertrauen im gesprochenen Deutsch durch Präsentationen, Diskussionen und Rollenspiele auf.', '["speaking", "pronunciation", "fluency"]', 6),
(6, 'Grammar Mastery', 'Grammatik Meisterschaft', 'Deep dive into B2 grammar: subjunctive, passive voice, complex sentence structures.', 'Vertiefen Sie sich in die B2-Grammatik: Konjunktiv, Passiv, komplexe Satzstrukturen.', '["grammar", "subjunctive", "passive", "complex_sentences"]', 8),
(7, 'Reading Comprehension II', 'Leseverstehen II', 'Advanced reading techniques for opinion texts, arguments, and detailed comprehension.', 'Fortgeschrittene Lesetechniken für Meinungstexte, Argumente und detailliertes Verstehen.', '["reading_advanced", "opinion_analysis", "inference"]', 7),
(8, 'Listening Skills II', 'Hörverstehen II', 'Handle complex audio: interviews, discussions, and authentic German media.', 'Bewältigen Sie komplexe Audioinhalte: Interviews, Diskussionen und authentische deutsche Medien.', '["listening_advanced", "media_comprehension", "inference"]', 6),
(9, 'Writing Excellence', 'Schreiben Exzellenz', 'Perfect your writing with complex arguments, professional correspondence, and essay writing.', 'Perfektionieren Sie Ihr Schreiben mit komplexen Argumenten, professioneller Korrespondenz und Aufsatzschreiben.', '["writing_advanced", "argumentation", "professional_writing"]', 7),
(10, 'Speaking Mastery', 'Sprechen Meisterschaft', 'Master discussions, negotiations, and presentations at B2 level with native-like fluency.', 'Beherrschen Sie Diskussionen, Verhandlungen und Präsentationen auf B2-Niveau mit muttersprachlicher Flüssigkeit.', '["speaking_advanced", "debate", "presentation"]', 6),
(11, 'Exam Strategies', 'Prüfungsstrategien', 'Learn test-taking strategies, time management, and practice with authentic TELC formats.', 'Lernen Sie Prüfungsstrategien, Zeitmanagement und üben Sie mit authentischen TELC-Formaten.', '["exam_strategies", "time_management", "practice_tests"]', 8),
(12, 'Final Preparation', 'Abschlussvorbereitung', 'Complete mock exams, review weak areas, and final preparation for TELC B2 success.', 'Komplette Probeprüfungen, Überprüfung schwacher Bereiche und Abschlussvorbereitung für den TELC B2-Erfolg.', '["mock_exams", "review", "final_tips"]', 8);

-- Insert lessons for each module (5-6 lessons per module)
-- Week 1: Foundation Building
INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 1, 'Essential B2 Vocabulary Part 1', 'Wesentlicher B2-Wortschatz Teil 1', 'vocabulary', 
  '{"topics": ["daily_life", "work", "education"], "word_count": 50, "exercises": ["flashcards", "matching", "fill_blanks"]}'::jsonb, 45
FROM public.course_modules WHERE week_number = 1;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 2, 'Essential B2 Vocabulary Part 2', 'Wesentlicher B2-Wortschatz Teil 2', 'vocabulary',
  '{"topics": ["health", "environment", "technology"], "word_count": 50, "exercises": ["context_usage", "synonyms", "collocations"]}'::jsonb, 45
FROM public.course_modules WHERE week_number = 1;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 3, 'Grammar Review: Cases and Prepositions', 'Grammatik Wiederholung: Fälle und Präpositionen', 'grammar',
  '{"topics": ["accusative", "dative", "genitive", "prepositions"], "exercises": ["transformation", "gap_fill", "error_correction"]}'::jsonb, 50
FROM public.course_modules WHERE week_number = 1;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 4, 'Grammar Review: Verb Tenses', 'Grammatik Wiederholung: Verbzeiten', 'grammar',
  '{"topics": ["present", "past", "perfect", "future"], "exercises": ["conjugation", "timeline", "narrative"]}'::jsonb, 50
FROM public.course_modules WHERE week_number = 1;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 5, 'Introduction to TELC B2 Format', 'Einführung in das TELC B2 Format', 'exam_practice',
  '{"sections": ["overview", "scoring", "time_allocation"], "sample_questions": true}'::jsonb, 40
FROM public.course_modules WHERE week_number = 1;

-- Week 2: Reading Comprehension I
INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 1, 'Understanding Main Ideas', 'Hauptideen verstehen', 'reading',
  '{"skill": "skimming", "text_types": ["articles", "reports"], "strategies": ["topic_sentences", "headings"]}'::jsonb, 45
FROM public.course_modules WHERE week_number = 2;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 2, 'Finding Specific Information', 'Spezifische Informationen finden', 'reading',
  '{"skill": "scanning", "text_types": ["advertisements", "schedules"], "strategies": ["keywords", "numbers"]}'::jsonb, 45
FROM public.course_modules WHERE week_number = 2;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 3, 'Vocabulary in Context', 'Wortschatz im Kontext', 'vocabulary',
  '{"skill": "inference", "strategies": ["word_roots", "context_clues", "collocations"]}'::jsonb, 50
FROM public.course_modules WHERE week_number = 2;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 4, 'Text Analysis Techniques', 'Textanalyse Techniken', 'reading',
  '{"skill": "analysis", "elements": ["structure", "tone", "purpose"], "exercises": ["multiple_choice", "matching"]}'::jsonb, 50
FROM public.course_modules WHERE week_number = 2;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 5, 'TELC Reading Practice Teil 1', 'TELC Leseverstehen Übung Teil 1', 'exam_practice',
  '{"section": "leseverstehen", "teil": 1, "question_type": "matching", "time_limit": 20}'::jsonb, 40
FROM public.course_modules WHERE week_number = 2;

-- Week 3: Listening Skills I
INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 1, 'Understanding Announcements', 'Ansagen verstehen', 'listening',
  '{"audio_type": "announcements", "settings": ["station", "airport", "office"], "skills": ["key_info", "numbers", "times"]}'::jsonb, 40
FROM public.course_modules WHERE week_number = 3;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 2, 'Conversations and Dialogues', 'Gespräche und Dialoge', 'listening',
  '{"audio_type": "dialogues", "topics": ["shopping", "appointments", "complaints"], "skills": ["attitude", "opinion", "detail"]}'::jsonb, 45
FROM public.course_modules WHERE week_number = 3;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 3, 'Note-Taking Strategies', 'Strategien zum Notizen machen', 'listening',
  '{"skill": "note_taking", "techniques": ["abbreviations", "symbols", "key_words"], "practice": "live_dictation"}'::jsonb, 45
FROM public.course_modules WHERE week_number = 3;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 4, 'Understanding Different Accents', 'Verschiedene Akzente verstehen', 'listening',
  '{"accents": ["hochdeutsch", "bavarian", "austrian", "swiss"], "exposure": "authentic_audio"}'::jsonb, 40
FROM public.course_modules WHERE week_number = 3;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 5, 'TELC Listening Practice Teil 1', 'TELC Hörverstehen Übung Teil 1', 'exam_practice',
  '{"section": "hoerverstehen", "teil": 1, "question_type": "true_false", "audio_plays": 2}'::jsonb, 35
FROM public.course_modules WHERE week_number = 3;

-- Week 4: Writing Fundamentals
INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 1, 'Formal Letter Writing', 'Formelle Briefe schreiben', 'writing',
  '{"format": "formal_letter", "elements": ["salutation", "body", "closing"], "templates": ["complaint", "inquiry", "application"]}'::jsonb, 50
FROM public.course_modules WHERE week_number = 4;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 2, 'Email Communication', 'E-Mail Kommunikation', 'writing',
  '{"format": "email", "styles": ["formal", "semi_formal"], "scenarios": ["business", "customer_service"]}'::jsonb, 45
FROM public.course_modules WHERE week_number = 4;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 3, 'Structuring Arguments', 'Argumente strukturieren', 'writing',
  '{"skill": "argumentation", "structure": ["thesis", "supporting_points", "conclusion"], "connectors": true}'::jsonb, 50
FROM public.course_modules WHERE week_number = 4;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 4, 'Common Writing Mistakes', 'Häufige Schreibfehler', 'grammar',
  '{"focus": "error_correction", "categories": ["word_order", "articles", "prepositions", "verb_forms"]}'::jsonb, 45
FROM public.course_modules WHERE week_number = 4;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 5, 'TELC Writing Practice Teil 1', 'TELC Schreiben Übung Teil 1', 'exam_practice',
  '{"section": "schriftlicher_ausdruck", "teil": 1, "task": "formal_letter", "word_count": 150}'::jsonb, 50
FROM public.course_modules WHERE week_number = 4;

-- Week 5: Speaking Basics
INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 1, 'Self-Introduction and Small Talk', 'Selbstvorstellung und Smalltalk', 'speaking',
  '{"topics": ["personal_info", "hobbies", "work"], "phrases": true, "practice": "monologue"}'::jsonb, 40
FROM public.course_modules WHERE week_number = 5;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 2, 'Expressing Opinions', 'Meinungen ausdrücken', 'speaking',
  '{"structures": ["ich_denke", "meiner_meinung_nach", "ich_bin_der_ansicht"], "topics": ["current_events", "social_issues"]}'::jsonb, 45
FROM public.course_modules WHERE week_number = 5;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 3, 'Pronunciation Practice', 'Aussprache Übung', 'speaking',
  '{"focus": ["umlauts", "ch_sounds", "word_stress", "sentence_intonation"], "exercises": "repeat_after"}'::jsonb, 40
FROM public.course_modules WHERE week_number = 5;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 4, 'Role-Play Scenarios', 'Rollenspiel Szenarien', 'speaking',
  '{"scenarios": ["at_doctor", "at_office", "shopping"], "skills": ["requesting", "complaining", "negotiating"]}'::jsonb, 45
FROM public.course_modules WHERE week_number = 5;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 5, 'TELC Speaking Overview', 'TELC Sprechen Überblick', 'exam_practice',
  '{"section": "muendlicher_ausdruck", "parts": ["presentation", "discussion", "problem_solving"], "timing": true}'::jsonb, 40
FROM public.course_modules WHERE week_number = 5;

-- Week 6: Grammar Mastery
INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 1, 'Konjunktiv II: Wishes and Hypotheticals', 'Konjunktiv II: Wünsche und Hypothesen', 'grammar',
  '{"forms": ["würde", "hätte", "wäre", "könnte"], "usage": ["wishes", "polite_requests", "unreal_conditions"]}'::jsonb, 55
FROM public.course_modules WHERE week_number = 6;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 2, 'Passive Voice', 'Passiv', 'grammar',
  '{"tenses": ["present", "past", "perfect"], "agents": ["von", "durch"], "alternatives": ["man", "lassen"]}'::jsonb, 50
FROM public.course_modules WHERE week_number = 6;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 3, 'Complex Sentence Structures', 'Komplexe Satzstrukturen', 'grammar',
  '{"conjunctions": ["obwohl", "damit", "falls", "je_desto"], "word_order": true, "punctuation": true}'::jsonb, 55
FROM public.course_modules WHERE week_number = 6;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 4, 'Relative Clauses', 'Relativsätze', 'grammar',
  '{"pronouns": ["der", "die", "das", "dessen", "deren"], "prepositions": true, "extended": true}'::jsonb, 50
FROM public.course_modules WHERE week_number = 6;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 5, 'Sprachbausteine Practice', 'Sprachbausteine Übung', 'exam_practice',
  '{"section": "sprachbausteine", "teil": [1, 2], "grammar_focus": true, "vocabulary_focus": true}'::jsonb, 45
FROM public.course_modules WHERE week_number = 6;

-- Week 7: Reading Comprehension II
INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 1, 'Opinion and Argumentative Texts', 'Meinungs- und Argumentationstexte', 'reading',
  '{"text_types": ["editorial", "commentary", "essay"], "skills": ["identifying_stance", "evaluating_arguments"]}'::jsonb, 50
FROM public.course_modules WHERE week_number = 7;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 2, 'Inference and Implication', 'Schlussfolgerung und Implikation', 'reading',
  '{"skill": "inference", "techniques": ["reading_between_lines", "author_intent", "implicit_meaning"]}'::jsonb, 50
FROM public.course_modules WHERE week_number = 7;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 3, 'Academic and Scientific Texts', 'Akademische und wissenschaftliche Texte', 'reading',
  '{"text_types": ["research_summary", "scientific_article"], "vocabulary": "academic", "structures": "formal"}'::jsonb, 55
FROM public.course_modules WHERE week_number = 7;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 4, 'Speed Reading Techniques', 'Schnelllesen Techniken', 'reading',
  '{"techniques": ["chunking", "eliminating_subvocalization", "preview"], "timed_practice": true}'::jsonb, 45
FROM public.course_modules WHERE week_number = 7;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 5, 'TELC Reading Full Practice', 'TELC Leseverstehen Komplettübung', 'exam_practice',
  '{"section": "leseverstehen", "teile": [1, 2, 3, 4, 5], "timed": true, "scoring": true}'::jsonb, 60
FROM public.course_modules WHERE week_number = 7;

-- Week 8: Listening Skills II
INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 1, 'Understanding Interviews', 'Interviews verstehen', 'listening',
  '{"audio_type": "interviews", "skills": ["main_points", "speaker_attitudes", "details"]}'::jsonb, 45
FROM public.course_modules WHERE week_number = 8;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 2, 'Radio and Podcast Comprehension', 'Radio und Podcast Verstehen', 'listening',
  '{"media_types": ["news", "documentary", "discussion"], "authentic_materials": true}'::jsonb, 50
FROM public.course_modules WHERE week_number = 8;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 3, 'Lectures and Presentations', 'Vorträge und Präsentationen', 'listening',
  '{"audio_type": "academic", "skills": ["structure", "main_arguments", "examples"], "note_taking": true}'::jsonb, 50
FROM public.course_modules WHERE week_number = 8;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 4, 'Handling Unclear Audio', 'Mit undeutlichem Audio umgehen', 'listening',
  '{"challenges": ["background_noise", "fast_speech", "mumbling"], "strategies": ["context", "prediction", "key_words"]}'::jsonb, 40
FROM public.course_modules WHERE week_number = 8;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 5, 'TELC Listening Full Practice', 'TELC Hörverstehen Komplettübung', 'exam_practice',
  '{"section": "hoerverstehen", "teile": [1, 2, 3], "timed": true, "scoring": true}'::jsonb, 50
FROM public.course_modules WHERE week_number = 8;

-- Week 9: Writing Excellence
INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 1, 'Advanced Argumentation', 'Fortgeschrittene Argumentation', 'writing',
  '{"skills": ["thesis_development", "counter_arguments", "evidence"], "structure": "academic_essay"}'::jsonb, 55
FROM public.course_modules WHERE week_number = 9;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 2, 'Professional Correspondence', 'Professionelle Korrespondenz', 'writing',
  '{"types": ["cover_letter", "business_proposal", "formal_complaint"], "register": "formal", "conventions": true}'::jsonb, 50
FROM public.course_modules WHERE week_number = 9;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 3, 'Cohesion and Coherence', 'Kohäsion und Kohärenz', 'writing',
  '{"elements": ["connectors", "reference_words", "paragraph_structure"], "exercises": "text_improvement"}'::jsonb, 45
FROM public.course_modules WHERE week_number = 9;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 4, 'Style and Register', 'Stil und Register', 'writing',
  '{"registers": ["formal", "neutral", "informal"], "style_elements": ["word_choice", "sentence_variety", "tone"]}'::jsonb, 45
FROM public.course_modules WHERE week_number = 9;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 5, 'TELC Writing Full Practice', 'TELC Schreiben Komplettübung', 'exam_practice',
  '{"section": "schriftlicher_ausdruck", "teile": [1, 2], "timed": true, "ai_feedback": true}'::jsonb, 60
FROM public.course_modules WHERE week_number = 9;

-- Week 10: Speaking Mastery
INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 1, 'Formal Presentations', 'Formelle Präsentationen', 'speaking',
  '{"structure": ["introduction", "main_points", "conclusion"], "visual_aids": true, "time_management": true}'::jsonb, 50
FROM public.course_modules WHERE week_number = 10;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 2, 'Discussion and Debate', 'Diskussion und Debatte', 'speaking',
  '{"skills": ["agreeing", "disagreeing", "mediating"], "phrases": true, "topics": "controversial"}'::jsonb, 50
FROM public.course_modules WHERE week_number = 10;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 3, 'Problem-Solving Conversations', 'Problemlösungsgespräche', 'speaking',
  '{"scenarios": ["planning_event", "resolving_conflict", "making_decisions"], "strategies": ["proposing", "evaluating", "compromising"]}'::jsonb, 45
FROM public.course_modules WHERE week_number = 10;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 4, 'Handling Difficult Questions', 'Schwierige Fragen bewältigen', 'speaking',
  '{"techniques": ["clarification", "buying_time", "redirecting"], "confidence_building": true}'::jsonb, 40
FROM public.course_modules WHERE week_number = 10;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 5, 'TELC Speaking Full Practice', 'TELC Sprechen Komplettübung', 'exam_practice',
  '{"section": "muendlicher_ausdruck", "teile": [1, 2, 3], "partner_simulation": true, "ai_feedback": true}'::jsonb, 50
FROM public.course_modules WHERE week_number = 10;

-- Week 11: Exam Strategies
INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 1, 'Time Management Strategies', 'Zeitmanagement Strategien', 'exam_practice',
  '{"skills": ["pacing", "prioritizing", "time_allocation"], "section_timing": true}'::jsonb, 45
FROM public.course_modules WHERE week_number = 11;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 2, 'Multiple Choice Techniques', 'Multiple-Choice Techniken', 'exam_practice',
  '{"strategies": ["elimination", "keyword_matching", "answer_prediction"], "common_traps": true}'::jsonb, 45
FROM public.course_modules WHERE week_number = 11;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 3, 'Dealing with Difficult Questions', 'Umgang mit schwierigen Fragen', 'exam_practice',
  '{"strategies": ["skip_and_return", "educated_guessing", "partial_credit"], "stress_management": true}'::jsonb, 40
FROM public.course_modules WHERE week_number = 11;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 4, 'Review: Common Mistakes', 'Wiederholung: Häufige Fehler', 'grammar',
  '{"categories": ["grammar", "vocabulary", "structure"], "error_analysis": true, "correction_practice": true}'::jsonb, 50
FROM public.course_modules WHERE week_number = 11;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 5, 'Mini Mock Exam', 'Mini Probeprüfung', 'exam_practice',
  '{"sections": ["reading_sample", "listening_sample", "writing_sample"], "timed": true, "scoring": true}'::jsonb, 90
FROM public.course_modules WHERE week_number = 11;

-- Week 12: Final Preparation
INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 1, 'Full Mock Exam - Written', 'Komplette Probeprüfung - Schriftlich', 'exam_practice',
  '{"sections": ["leseverstehen", "sprachbausteine", "hoerverstehen", "schriftlicher_ausdruck"], "full_time": true, "official_format": true}'::jsonb, 180
FROM public.course_modules WHERE week_number = 12;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 2, 'Full Mock Exam - Oral', 'Komplette Probeprüfung - Mündlich', 'exam_practice',
  '{"section": "muendlicher_ausdruck", "all_parts": true, "partner_simulation": true}'::jsonb, 30
FROM public.course_modules WHERE week_number = 12;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 3, 'Personalized Weak Area Review', 'Persönliche Schwächen Wiederholung', 'exam_practice',
  '{"ai_analysis": true, "targeted_exercises": true, "progress_based": true}'::jsonb, 60
FROM public.course_modules WHERE week_number = 12;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 4, 'Final Tips and Exam Day Preparation', 'Letzte Tipps und Prüfungstagvorbereitung', 'exam_practice',
  '{"topics": ["day_before", "exam_day", "during_exam", "common_pitfalls"], "checklist": true}'::jsonb, 30
FROM public.course_modules WHERE week_number = 12;

INSERT INTO public.course_lessons (module_id, lesson_number, title, title_de, lesson_type, content, estimated_minutes)
SELECT id, 5, 'Course Completion and Certification', 'Kursabschluss und Zertifizierung', 'exam_practice',
  '{"review": "course_summary", "achievement_check": true, "certificate_generation": true}'::jsonb, 20
FROM public.course_modules WHERE week_number = 12;
