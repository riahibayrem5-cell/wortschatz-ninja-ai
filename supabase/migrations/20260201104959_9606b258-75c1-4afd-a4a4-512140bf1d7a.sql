-- Week 10: Speaking Excellence - 5 Lessons
-- Lesson 1: Advanced Presentation Techniques
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "speaking",
  "learning_objectives": [
    "Deliver engaging and structured presentations",
    "Use rhetorical devices effectively",
    "Handle complex topics with nuance",
    "Manage presentation anxiety"
  ],
  "advanced_techniques": {
    "opening_hooks": [
      {"technique": "Provocative question", "example": "Wussten Sie, dass 80% der Deutschen täglich ihr Smartphone benutzen?"},
      {"technique": "Surprising statistic", "example": "Laut einer Studie verbringen wir im Durchschnitt 4 Stunden täglich am Bildschirm."},
      {"technique": "Personal anecdote", "example": "Als ich gestern in der U-Bahn saß, fiel mir auf, dass..."},
      {"technique": "Quote", "example": "Steve Jobs sagte einmal: ''Technologie ist nichts. Was zählt, ist...''"}
    ],
    "structuring_arguments": {
      "pro_con_balance": ["Present strongest argument first", "Acknowledge counterarguments", "End with your position"],
      "signposting": ["Erstens möchte ich auf ... eingehen.", "Zweitens ist zu beachten, dass...", "Abschließend lässt sich feststellen..."]
    },
    "conclusion_strategies": [
      {"strategy": "Call to action", "example": "Lassen Sie uns gemeinsam dafür sorgen, dass..."},
      {"strategy": "Future outlook", "example": "In zehn Jahren werden wir wahrscheinlich..."},
      {"strategy": "Personal opinion", "example": "Meiner Ansicht nach ist die beste Lösung..."}
    ]
  },
  "vocabulary_sets": [
    {
      "theme": "Präsentationsrhetorik",
      "words": [
        {"german": "Lassen Sie mich mit einem Beispiel beginnen...", "english": "Let me start with an example...", "usage": "Engaging opening"},
        {"german": "Stellen Sie sich vor, dass...", "english": "Imagine that...", "usage": "Creating scenario"},
        {"german": "Die Frage, die wir uns stellen müssen, ist...", "english": "The question we must ask ourselves is...", "usage": "Framing issue"},
        {"german": "Dies bringt mich zu meinem nächsten Punkt.", "english": "This brings me to my next point.", "usage": "Transitioning"}
      ]
    }
  ],
  "practice_topics": [
    "Die Zukunft der Mobilität in Städten",
    "Künstliche Intelligenz im Alltag",
    "Klimawandel: Was kann der Einzelne tun?"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 10) AND lesson_number = 1;

-- Lesson 2: Interactive Discussion Mastery
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "speaking",
  "learning_objectives": [
    "Lead and participate in dynamic discussions",
    "Handle disagreement diplomatically",
    "Build on partner''s contributions",
    "Demonstrate active listening"
  ],
  "discussion_dynamics": {
    "active_listening_signals": [
      {"german": "Ich verstehe, was Sie meinen.", "english": "I understand what you mean."},
      {"german": "Das ist ein interessanter Punkt.", "english": "That is an interesting point."},
      {"german": "Wenn ich Sie richtig verstehe...", "english": "If I understand you correctly..."}
    ],
    "building_on_ideas": [
      {"german": "Um auf Ihren Punkt einzugehen...", "english": "To address your point..."},
      {"german": "Das erinnert mich an...", "english": "That reminds me of..."},
      {"german": "In Ergänzung dazu möchte ich sagen...", "english": "In addition to that, I would like to say..."}
    ],
    "diplomatic_disagreement": [
      {"german": "Ich verstehe Ihre Position, aber...", "english": "I understand your position, but..."},
      {"german": "Da muss ich widersprechen.", "english": "I must disagree there."},
      {"german": "Das sehe ich etwas differenzierter.", "english": "I see that in a more nuanced way."}
    ],
    "seeking_clarification": [
      {"german": "Könnten Sie das genauer erläutern?", "english": "Could you explain that in more detail?"},
      {"german": "Was genau meinen Sie mit...?", "english": "What exactly do you mean by...?"},
      {"german": "Können Sie ein Beispiel geben?", "english": "Can you give an example?"}
    ]
  },
  "discussion_scenarios": [
    {
      "topic": "Sollte der öffentliche Nahverkehr kostenlos sein?",
      "partner_a": "Pro: Environmental benefits, social equality",
      "partner_b": "Contra: Funding challenges, quality concerns",
      "goals": ["Exchange arguments", "Find common ground", "Propose solution"]
    }
  ],
  "evaluation_focus": [
    "Interaction with partner (not monologue)",
    "Range of expressions",
    "Appropriate reactions to partner"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 10) AND lesson_number = 2;

-- Lesson 3: Negotiation and Problem-Solving Excellence
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "speaking",
  "learning_objectives": [
    "Lead collaborative problem-solving",
    "Make and evaluate proposals systematically",
    "Reach consensus through negotiation",
    "Handle time pressure effectively"
  ],
  "negotiation_framework": {
    "phase_1_understand": {
      "name": "Problem verstehen",
      "actions": ["Clarify the situation", "Identify constraints", "Agree on goals"],
      "phrases": [
        "Lass uns zuerst das Problem genau verstehen.",
        "Was genau müssen wir erreichen?",
        "Welche Einschränkungen gibt es?"
      ]
    },
    "phase_2_brainstorm": {
      "name": "Ideen sammeln",
      "actions": ["Generate options", "Build on suggestions", "Stay open-minded"],
      "phrases": [
        "Eine Möglichkeit wäre...",
        "Wir könnten auch überlegen, ob...",
        "Was hältst du von der Idee, dass...?"
      ]
    },
    "phase_3_evaluate": {
      "name": "Optionen bewerten",
      "actions": ["Weigh pros and cons", "Consider feasibility", "Compare options"],
      "phrases": [
        "Der Vorteil dieser Option wäre...",
        "Allerdings müssen wir bedenken, dass...",
        "Im Vergleich dazu wäre die andere Lösung..."
      ]
    },
    "phase_4_decide": {
      "name": "Entscheidung treffen",
      "actions": ["Propose final solution", "Get agreement", "Summarize decision"],
      "phrases": [
        "Ich denke, die beste Lösung wäre...",
        "Bist du damit einverstanden?",
        "Also machen wir es so: Wir werden..."
      ]
    }
  },
  "practice_scenarios": [
    {
      "scenario": "Geburtstagsfeier organisieren",
      "situation": "30 Gäste, 500€ Budget, unterschiedliche Interessen",
      "decisions": ["Location", "Essen/Getränke", "Programm", "Einladungen"]
    },
    {
      "scenario": "Gemeinsamer Urlaub planen",
      "situation": "Zwei Wochen, verschiedene Vorlieben (Strand vs. Städte)",
      "decisions": ["Reiseziel", "Unterkunft", "Aktivitäten", "Budget"]
    }
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 10) AND lesson_number = 3;

-- Lesson 4: Pronunciation and Fluency
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "speaking",
  "learning_objectives": [
    "Improve German pronunciation accuracy",
    "Develop natural speech rhythm and intonation",
    "Reduce hesitation and filler words",
    "Build speaking confidence"
  ],
  "pronunciation_focus": {
    "challenging_sounds": [
      {"sound": "ü", "tip": "Round lips like ''u'', try to say ''ee''", "examples": ["müde", "für", "Tür", "grün"]},
      {"sound": "ö", "tip": "Round lips like ''o'', try to say ''ay''", "examples": ["schön", "möchte", "Köln", "hören"]},
      {"sound": "ch (ach)", "tip": "Back of throat, after a, o, u", "examples": ["Buch", "auch", "Nacht", "machen"]},
      {"sound": "ch (ich)", "tip": "Front of mouth, after e, i, consonants", "examples": ["ich", "nicht", "sprechen", "möchte"]},
      {"sound": "r", "tip": "Uvular (back of throat) or slight tap", "examples": ["rot", "richtig", "Reis", "Arbeit"]},
      {"sound": "Final -e", "tip": "Always pronounced (schwa sound)", "examples": ["Schule", "Frage", "heute", "bitte"]}
    ],
    "word_stress": {
      "rule": "Stress usually on first syllable for German words",
      "exceptions": ["Verbs with inseparable prefixes: ver-STE-hen, be-GIN-nen", "Foreign words often keep original stress: Stu-DENT, Mu-SIK"]
    },
    "sentence_intonation": {
      "statements": "Falling intonation at end",
      "yes_no_questions": "Rising intonation at end",
      "wh_questions": "Falling intonation at end"
    }
  },
  "fluency_strategies": {
    "filler_reduction": {
      "avoid": ["ähm", "also", "sozusagen", "irgendwie"],
      "replace_with": ["Brief pause", "Transition phrase", "Next point directly"]
    },
    "natural_connectors": [
      "Nun, ...",
      "Also, ...",
      "Wie gesagt, ...",
      "Interessanterweise, ..."
    ]
  },
  "practice_exercises": [
    "Tongue twisters for sounds",
    "Shadowing technique with audio",
    "Recording and self-evaluation",
    "Speed reading aloud"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 10) AND lesson_number = 4;

-- Lesson 5: Full Speaking Exam Simulation
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "speaking",
  "telc_points": 75,
  "learning_objectives": [
    "Complete a full speaking exam under realistic conditions",
    "Apply all speaking strategies effectively",
    "Manage partner interaction",
    "Self-assess using TELC criteria"
  ],
  "exam_simulation": {
    "preparation": "20 minutes with topic cards",
    "exam_duration": "16 minutes per pair (8 min per candidate focus)",
    "format": "Paired exam with one other candidate"
  },
  "complete_exam_example": {
    "theme": "Gesunde Lebensweise",
    "teil_1_presentation": {
      "task": "Präsentieren Sie die Vor- und Nachteile einer vegetarischen Ernährung (3 Minuten)",
      "keywords": ["Gesundheit", "Umwelt", "Nährstoffe", "Kosten", "Gesellschaft"],
      "structure_guide": ["Introduction: Define topic", "Pro arguments (2-3)", "Contra arguments (2-3)", "Personal conclusion"]
    },
    "teil_2_discussion": {
      "task": "Diskutieren Sie mit Ihrem Partner: Wie wichtig ist Sport für die Gesundheit?",
      "duration": "6 minutes",
      "goals": ["Exchange views", "Ask questions", "Build on partner''s points"]
    },
    "teil_3_negotiation": {
      "situation": "Sie und Ihr Partner arbeiten bei einer Krankenkasse. Entwickeln Sie ein Gesundheitsprogramm für Mitarbeiter.",
      "decisions": ["Sport- oder Ernährungsfokus", "Budget-Verteilung", "Anreize für Teilnehmer", "Zeitrahmen"],
      "duration": "7 minutes"
    }
  },
  "self_evaluation_rubric": {
    "teil_1": ["Klare Struktur?", "Alle Punkte angesprochen?", "Beispiele gegeben?", "Eigene Meinung?"],
    "teil_2": ["Partner einbezogen?", "Auf Argumente reagiert?", "Vielfältige Ausdrücke?"],
    "teil_3": ["Vorschläge gemacht?", "Kompromisse gefunden?", "Lösung erreicht?"]
  }
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 10) AND lesson_number = 5;