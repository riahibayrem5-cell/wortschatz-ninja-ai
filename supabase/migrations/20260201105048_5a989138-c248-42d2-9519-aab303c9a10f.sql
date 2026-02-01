-- Week 11: Exam Strategies - 5 Lessons
-- Lesson 1: TELC B2 Exam Overview and Time Management
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "exam_strategy",
  "learning_objectives": [
    "Understand complete TELC B2 exam structure",
    "Master time management across all sections",
    "Develop personalized exam-day strategy",
    "Build confidence through familiarity"
  ],
  "complete_exam_structure": {
    "written_exam": {
      "total_time": "140 minutes",
      "sections": [
        {"section": "Leseverstehen", "time": "90 min (shared with Sprachbausteine)", "points": 75, "parts": 3},
        {"section": "Sprachbausteine", "time": "(included above)", "points": 30, "parts": 2},
        {"section": "Hörverstehen", "time": "20 min", "points": 75, "parts": 3},
        {"section": "Schriftlicher Ausdruck", "time": "30 min", "points": 45, "parts": 1}
      ]
    },
    "oral_exam": {
      "total_time": "~20 minutes prep + 16 minutes exam",
      "sections": [
        {"section": "Mündlicher Ausdruck", "time": "16 min per pair", "points": 75, "parts": 3}
      ]
    },
    "total_points": 300,
    "passing_requirements": [
      "Minimum 60% overall (180 points)",
      "Minimum 60% in written exam (135/225 points)",
      "Minimum 60% in oral exam (45/75 points)"
    ]
  },
  "time_management_strategy": {
    "leseverstehen_sprachbausteine": {
      "recommended_split": [
        {"part": "Teil 1 (Zuordnung)", "time": "15-18 min"},
        {"part": "Teil 2 (Detailverstehen)", "time": "20-25 min"},
        {"part": "Teil 3 (Selektiv)", "time": "15-18 min"},
        {"part": "Sprachbausteine 1", "time": "15 min"},
        {"part": "Sprachbausteine 2", "time": "15 min"},
        {"part": "Review buffer", "time": "5-10 min"}
      ]
    },
    "hoerverstehen": {
      "note": "Time controlled by audio",
      "strategy": "Read questions during pauses, answer immediately"
    },
    "schriftlicher_ausdruck": {
      "recommended_split": [
        {"phase": "Read & plan", "time": "5 min"},
        {"phase": "Write", "time": "20 min"},
        {"phase": "Proofread", "time": "5 min"}
      ]
    }
  },
  "exam_day_tips": [
    "Bring ID and confirmation letter",
    "Arrive 30 minutes early",
    "Bring water and a snack for the break",
    "Use all available time - don''t leave early",
    "Skip difficult questions and return later"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 11) AND lesson_number = 1;

-- Lesson 2: Reading Strategies Under Pressure
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "reading",
  "learning_objectives": [
    "Apply rapid reading techniques under time pressure",
    "Handle difficult questions efficiently",
    "Maximize points with strategic answering",
    "Build reading stamina"
  ],
  "pressure_strategies": {
    "when_stuck": {
      "step_1": "Mark the question and move on",
      "step_2": "Return with fresh eyes later",
      "step_3": "If still unsure, use elimination",
      "step_4": "Never leave blanks - always guess"
    },
    "elimination_technique": {
      "description": "Cross out definitely wrong answers first",
      "benefit": "Increases probability even when guessing",
      "example": "From 10 options, eliminate 5-6 obvious mismatches"
    },
    "time_awareness": {
      "watch_check": "Every 15 minutes",
      "adjustment": "If behind, skim more quickly",
      "priority": "Focus on questions worth points, not perfection"
    }
  },
  "rapid_reading_techniques": {
    "skimming": {
      "purpose": "Get main idea quickly",
      "how": "Read first/last sentences of paragraphs, headings, bold text",
      "when": "Teil 1 (matching), initial overview"
    },
    "scanning": {
      "purpose": "Find specific information",
      "how": "Search for key words, numbers, names",
      "when": "Teil 3 (selective reading), looking for answers"
    },
    "intensive": {
      "purpose": "Deep understanding",
      "how": "Read every word, note relationships",
      "when": "Teil 2 (detailed comprehension), tricky questions"
    }
  },
  "practice_focus": [
    "Timed practice with strict limits",
    "Practice with distractions",
    "Build up to full-length sessions"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 11) AND lesson_number = 2;

-- Lesson 3: Listening Exam Mastery
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "listening",
  "learning_objectives": [
    "Maximize listening comprehension under exam conditions",
    "Handle one-time listening challenges",
    "Develop effective note-taking",
    "Manage listening anxiety"
  ],
  "listening_exam_tactics": {
    "before_audio": {
      "actions": ["Read all questions in advance", "Underline key words", "Predict possible answers", "Note question types (who, what, when, why)"],
      "time": "Use every second of pause time"
    },
    "during_audio": {
      "teil_1_2": {
        "first_listen": "Focus on main ideas, note key facts",
        "second_listen": "Confirm answers, fill gaps"
      },
      "teil_3": {
        "only_once": "Maximum concentration required",
        "strategy": "Listen for specific details matching questions"
      }
    },
    "note_taking": {
      "tips": [
        "Use abbreviations (& for und, → for leads to)",
        "Write numbers, names, dates immediately",
        "Note key verbs and adjectives",
        "Mark uncertain answers for second listen"
      ]
    }
  },
  "challenging_situations": {
    "missed_information": {
      "action": "Don''t panic - keep listening for next question",
      "reason": "Missing one answer shouldn''t affect others"
    },
    "unclear_audio": {
      "action": "Focus on context and what you did understand",
      "strategy": "Eliminate impossible options"
    },
    "fast_speech": {
      "preparation": "Practice with varied speeds",
      "strategy": "Focus on stressed words and intonation"
    }
  },
  "audio_types_to_expect": [
    "Radio programs and news",
    "Telephone messages and voicemails",
    "Interviews and discussions",
    "Announcements and instructions"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 11) AND lesson_number = 3;

-- Lesson 4: Writing Exam Optimization
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "writing",
  "learning_objectives": [
    "Maximize writing score in limited time",
    "Handle all four Leitpunkte efficiently",
    "Apply quick error-correction techniques",
    "Build writing speed and accuracy"
  ],
  "writing_exam_optimization": {
    "leitpunkte_strategy": {
      "approach": "Address ALL four points - incomplete = major point loss",
      "allocation": "~2-3 sentences per Leitpunkt",
      "tracking": "Mentally check off each point as you write"
    },
    "planning_template": {
      "minute_1_2": "Read task, identify format (brief, email), note 4 Leitpunkte",
      "minute_3_5": "Jot down key phrases for each point, plan structure",
      "minute_6_25": "Write following your plan",
      "minute_26_30": "Proofread: verbs, cases, spelling"
    },
    "quick_formats": {
      "beschwerdebrief": {
        "opening": "ich wende mich an Sie, weil...",
        "structure": "Problem → Details → Forderung → Frist"
      },
      "bewerbungsschreiben": {
        "opening": "ich bewerbe mich um die Stelle als...",
        "structure": "Interest → Qualifications → Motivation → Interview request"
      },
      "anfrage": {
        "opening": "ich interessiere mich für...",
        "structure": "Context → Questions → Request for response"
      }
    }
  },
  "quick_correction_checklist": {
    "priority_1": ["Verb in position 2 (main clause)?", "Verb at end (subordinate clause)?"],
    "priority_2": ["Subject-verb agreement?", "Correct case after prepositions?"],
    "priority_3": ["dass vs. das?", "Capitalization of nouns?"]
  },
  "word_count_guide": {
    "target": "150-180 words",
    "too_short": "May miss points or seem incomplete",
    "too_long": "More chances for errors, time pressure"
  }
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 11) AND lesson_number = 4;

-- Lesson 5: Speaking Exam Confidence
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "speaking",
  "learning_objectives": [
    "Enter speaking exam with confidence",
    "Handle unexpected situations gracefully",
    "Maximize partner interaction quality",
    "Manage speaking anxiety"
  ],
  "confidence_building": {
    "preparation": {
      "know_the_format": "Familiarity reduces anxiety",
      "practice_aloud": "Not just in your head",
      "record_yourself": "Identify and fix weak points"
    },
    "exam_day_mindset": {
      "positive_framing": "You''re having a conversation, not being interrogated",
      "partner_is_ally": "Work together, help each other",
      "mistakes_are_ok": "Native speakers make mistakes too"
    }
  },
  "handling_difficulties": {
    "forgot_a_word": {
      "strategies": ["Umschreiben: describe what you mean", "Synonym: use a different word", "Ask: Wie sagt man... auf Deutsch?"],
      "example": "Can''t remember ''Nachhaltigkeit''? Say: ''Umweltfreundliches Verhalten für die Zukunft''"
    },
    "dont_understand_partner": {
      "phrases": ["Könnten Sie das wiederholen?", "Ich habe das nicht ganz verstanden.", "Meinen Sie damit, dass...?"]
    },
    "mind_goes_blank": {
      "strategies": ["Pause briefly - it''s natural", "Use filler: ''Das ist eine interessante Frage...''", "Return to your last point and expand"]
    },
    "disagree_with_partner": {
      "phrases": ["Ich sehe das anders.", "Da bin ich anderer Meinung, weil..."],
      "tip": "Disagreement is good - shows interaction!"
    }
  },
  "partner_interaction_tips": [
    "Make eye contact",
    "React to what they say (nod, ''Ja'', ''Genau'')",
    "Build on their points",
    "Don''t interrupt, but don''t let them dominate"
  ],
  "final_reminders": [
    "Speak clearly and at a natural pace",
    "Use the full time - don''t rush",
    "Show your German - use connectors, varied vocabulary",
    "Be yourself - personality counts!"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 11) AND lesson_number = 5;