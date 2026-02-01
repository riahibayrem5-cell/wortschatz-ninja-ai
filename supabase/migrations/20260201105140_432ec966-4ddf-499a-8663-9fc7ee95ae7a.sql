-- Week 12: Final Preparation - 5 Lessons
-- Lesson 1: Full Mock Exam - Part 1 (Reading & Sprachbausteine)
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "mock_exam",
  "learning_objectives": [
    "Complete a full Reading section under timed conditions",
    "Complete Sprachbausteine sections accurately",
    "Identify remaining weak areas",
    "Build exam stamina"
  ],
  "mock_exam_setup": {
    "duration": "90 minutes",
    "sections": [
      {"teil": "Leseverstehen 1", "time": "18 min", "questions": 5, "points": 25},
      {"teil": "Leseverstehen 2", "time": "25 min", "questions": 5, "points": 25},
      {"teil": "Leseverstehen 3", "time": "18 min", "questions": 10, "points": 25},
      {"teil": "Sprachbausteine 1", "time": "15 min", "questions": 10, "points": 15},
      {"teil": "Sprachbausteine 2", "time": "14 min", "questions": 10, "points": 15}
    ]
  },
  "exam_simulation_tips": {
    "environment": ["Quiet room", "No phone", "Timer visible", "No aids"],
    "materials": ["Answer sheet", "Pencil", "Watch"],
    "mindset": ["Treat as real exam", "Full concentration", "No breaks"]
  },
  "post_exam_review": {
    "scoring": "Check answers against key",
    "analysis": [
      "Which Teil lost most points?",
      "Time management issues?",
      "Recurring error types?",
      "Topics needing review?"
    ],
    "action_plan": "Focus remaining study on weak areas"
  },
  "target_scores": {
    "passing": "60% (63/105 points total)",
    "good": "75% (79/105 points)",
    "excellent": "90%+ (95/105 points)"
  }
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 12) AND lesson_number = 1;

-- Lesson 2: Full Mock Exam - Part 2 (Listening & Writing)
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "mock_exam",
  "learning_objectives": [
    "Complete Hörverstehen under exam conditions",
    "Complete Schriftlicher Ausdruck with time limit",
    "Assess current level across all written skills",
    "Refine final study priorities"
  ],
  "mock_exam_setup": {
    "hoerverstehen": {
      "duration": "~20 minutes (controlled by audio)",
      "sections": [
        {"teil": 1, "description": "Global understanding", "questions": 5, "points": 25, "plays": 2},
        {"teil": 2, "description": "Detailed understanding", "questions": 10, "points": 25, "plays": 2},
        {"teil": 3, "description": "Selective understanding", "questions": 5, "points": 25, "plays": 1}
      ]
    },
    "schriftlicher_ausdruck": {
      "duration": "30 minutes",
      "task": "One of: Beschwerdebrief, Bewerbung, Anfrage",
      "points": 45
    }
  },
  "listening_simulation_note": {
    "audio_source": "Use official TELC practice materials or exam audio",
    "timing": "Follow audio timing exactly - no pauses",
    "conditions": "Listen in one sitting, no replay"
  },
  "writing_simulation_note": {
    "strict_timing": "Set 30-minute timer",
    "realistic_task": "Use official TELC task format",
    "self_scoring": "Use TELC criteria: Aufgabenbewältigung, Gestaltung, Richtigkeit"
  },
  "combined_review": {
    "total_points_this_session": "120 (75 listening + 45 writing)",
    "passing_minimum": "72 points (60%)",
    "focus_areas": "Note which section needs more work"
  }
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 12) AND lesson_number = 2;

-- Lesson 3: Speaking Exam Final Preparation
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "speaking",
  "learning_objectives": [
    "Master final speaking exam preparation",
    "Practice with partner simulation",
    "Refine presentation and discussion skills",
    "Build exam-day confidence"
  ],
  "final_speaking_practice": {
    "simulation_setup": {
      "preparation_time": "20 minutes with topic cards",
      "exam_time": "16 minutes total",
      "partner": "Practice with friend, tutor, or record yourself"
    },
    "teil_by_teil_review": {
      "teil_1_presentation": {
        "duration": "3 minutes",
        "checklist": ["Clear structure?", "Pros and cons covered?", "Personal opinion?", "Examples given?"],
        "common_mistakes": ["Running over time", "Forgetting conclusion", "No structure"]
      },
      "teil_2_discussion": {
        "duration": "6 minutes",
        "checklist": ["Interacting with partner?", "Asking questions?", "Building on ideas?"],
        "common_mistakes": ["Monologuing", "Not listening", "Only agreeing"]
      },
      "teil_3_negotiation": {
        "duration": "7 minutes",
        "checklist": ["Making proposals?", "Reaching decision?", "Including partner?"],
        "common_mistakes": ["Not deciding anything", "Dominating conversation"]
      }
    }
  },
  "vocabulary_refresh": {
    "essential_phrases": {
      "opening": ["Ich möchte heute über ... sprechen.", "Mein Thema ist ..."],
      "structuring": ["Zunächst...", "Darüber hinaus...", "Abschließend..."],
      "discussing": ["Was meinen Sie?", "Da stimme ich zu.", "Ich sehe das anders."],
      "negotiating": ["Wie wäre es, wenn...?", "Einverstanden!", "Dann machen wir es so."]
    }
  },
  "mental_preparation": [
    "Visualize success",
    "Remember: examiner wants you to pass",
    "Your partner is your ally, not competition",
    "Mistakes don''t mean failure"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 12) AND lesson_number = 3;

-- Lesson 4: Weak Area Intensive Review
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "review",
  "learning_objectives": [
    "Identify and address personal weak areas",
    "Create targeted study plan for final days",
    "Master most common exam traps",
    "Consolidate all learning"
  ],
  "self_assessment_guide": {
    "by_skill": {
      "leseverstehen": {
        "strong_indicators": ["Finishing with time to spare", "Confident about answers", ">70% accuracy"],
        "weak_indicators": ["Running out of time", "Guessing many answers", "<60% accuracy"],
        "if_weak": ["Practice skimming/scanning daily", "Build vocabulary", "Time yourself strictly"]
      },
      "hoerverstehen": {
        "strong_indicators": ["Catching main ideas first listen", "Notes help on second listen"],
        "weak_indicators": ["Missing entire questions", "Can''t keep up with audio"],
        "if_weak": ["Listen to German daily (podcasts, news)", "Practice note-taking", "Work on numbers/dates"]
      },
      "sprachbausteine": {
        "strong_indicators": [">80% accuracy", "Recognizing grammar patterns quickly"],
        "weak_indicators": ["Unsure about preposition cases", "Can''t identify errors"],
        "if_weak": ["Review prepositions + cases", "Practice verb-preposition combinations", "Do daily gap-fill exercises"]
      },
      "schreiben": {
        "strong_indicators": ["Completing in time", "All Leitpunkte covered", "Few grammar errors"],
        "weak_indicators": ["Running out of time", "Missing points", "Many corrections needed"],
        "if_weak": ["Memorize letter formats", "Practice timed writing", "Learn error-checking routine"]
      },
      "sprechen": {
        "strong_indicators": ["Speaking fluently", "Good partner interaction", "Using varied vocabulary"],
        "weak_indicators": ["Long pauses", "Repetitive expressions", "One-word answers"],
        "if_weak": ["Practice aloud daily", "Record and review", "Learn discussion phrases"]
      }
    }
  },
  "common_exam_traps": {
    "reading": ["Distractor options with similar words but different meaning", "Negatives changing meaning"],
    "listening": ["Information that seems right but is from wrong speaker", "Numbers that are corrected"],
    "writing": ["Forgetting one of four Leitpunkte", "Wrong format (email vs. formal letter)"],
    "speaking": ["Talking too long in presentation", "Not reaching decision in Teil 3"]
  },
  "final_days_plan": {
    "3_days_before": "Focus on weakest skill, light practice on others",
    "2_days_before": "Review all formats and key phrases",
    "1_day_before": "Light review only, get good sleep",
    "exam_day": "No cramming, stay calm, trust your preparation"
  }
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 12) AND lesson_number = 4;

-- Lesson 5: Exam Day Readiness
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "exam_prep",
  "learning_objectives": [
    "Be fully prepared for exam day",
    "Manage exam-day stress effectively",
    "Know exactly what to expect",
    "Maximize performance on the day"
  ],
  "exam_day_checklist": {
    "documents": ["Valid ID (Personalausweis or Reisepass)", "Exam confirmation/Anmeldung", "Payment confirmation if required"],
    "materials": ["2-3 blue or black pens", "Pencils and eraser", "Watch (no smartwatch)", "Water bottle", "Light snack for break"],
    "personal": ["Good night sleep before", "Healthy breakfast", "Comfortable clothing", "Arrive 30 min early"]
  },
  "exam_timeline": {
    "arrival": "30 minutes before start",
    "check_in": "Show ID, receive materials",
    "written_exam_order": [
      {"section": "Leseverstehen + Sprachbausteine", "duration": "90 min"},
      {"section": "Short break", "duration": "~10 min"},
      {"section": "Hörverstehen", "duration": "~20 min"},
      {"section": "Schriftlicher Ausdruck", "duration": "30 min"}
    ],
    "oral_exam": "Usually different day or afternoon, 20 min prep + 16 min exam"
  },
  "stress_management": {
    "before": ["Deep breathing", "Positive visualization", "Light stretching", "Avoid last-minute cramming"],
    "during": ["If stuck, move on and return", "Use all available time", "Don''t panic if others finish first"],
    "between_sections": ["Quick rest", "Drink water", "Reset mentally"]
  },
  "during_exam_reminders": {
    "general": ["Read ALL instructions carefully", "Check you''re marking the right question", "Use every minute"],
    "if_time_runs_out": ["Answer all remaining questions with best guesses", "Never leave blanks"]
  },
  "final_message": {
    "title": "Du schaffst das!",
    "content": "You have prepared thoroughly over 12 weeks. You know the format, the strategies, and the language. Trust your preparation, stay calm, and show what you can do. Viel Erfolg bei deiner Prüfung!"
  },
  "after_the_exam": {
    "relax": "You did it! Take time to decompress.",
    "results": "Usually available within 6-8 weeks",
    "next_steps": "If passed: Celebrate! If not: Identify weak areas and try again - you''re closer than you think!"
  }
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 12) AND lesson_number = 5;