-- Week 7: Advanced Reading & Listening - 5 Lessons
-- Lesson 1: Advanced Reading Comprehension
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "reading",
  "telc_points": 75,
  "learning_objectives": [
    "Master skimming and scanning techniques for long texts",
    "Identify main arguments and supporting details",
    "Handle complex vocabulary in context",
    "Manage time across all reading Teile"
  ],
  "telc_reading_overview": {
    "total_time": "90 minutes (with Sprachbausteine)",
    "teile": [
      {"teil": 1, "type": "Zuordnung", "texts": 5, "options": 10, "points": 25, "strategy": "Match headlines to paragraphs"},
      {"teil": 2, "type": "Informationsentnahme", "texts": 1, "questions": 5, "points": 25, "strategy": "Detailed reading for specific info"},
      {"teil": 3, "type": "Selektives Lesen", "texts": 10, "questions": 10, "points": 25, "strategy": "Quick scanning of short texts"}
    ]
  },
  "advanced_strategies": {
    "teil_1": {
      "name": "Headline Matching",
      "steps": [
        "Read all headlines first - understand the general topics",
        "Identify key words in each headline",
        "Skim each paragraph for topic sentences (usually first/last)",
        "Match based on main idea, not just vocabulary matches",
        "Watch for distractors - similar words but different meaning"
      ],
      "time_recommendation": "15-20 minutes"
    },
    "teil_2": {
      "name": "Detailed Comprehension",
      "steps": [
        "Read questions FIRST before the text",
        "Underline key words in questions",
        "Read text carefully, noting where answers appear",
        "Answer in order - answers follow text sequence",
        "Check for negatives and qualifiers"
      ],
      "time_recommendation": "20-25 minutes"
    },
    "teil_3": {
      "name": "Scanning Short Texts",
      "steps": [
        "Read all questions first",
        "Scan texts quickly for key information",
        "Each text corresponds to one question only",
        "Focus on numbers, names, dates, specific details",
        "Don''t get stuck - move on and return"
      ],
      "time_recommendation": "15-20 minutes"
    }
  },
  "vocabulary_sets": [
    {
      "theme": "Textsorten und Signalwörter",
      "words": [
        {"german": "der Leitartikel", "english": "editorial", "usage": "Opinion-based newspaper article"},
        {"german": "der Bericht", "english": "report", "usage": "Factual news report"},
        {"german": "die Anzeige", "english": "advertisement", "usage": "Commercial or classified ad"},
        {"german": "die Pressemitteilung", "english": "press release", "usage": "Official company/org statement"},
        {"german": "allerdings", "english": "however/though", "usage": "Signals contrast"},
        {"german": "demnach", "english": "accordingly", "usage": "Signals conclusion"}
      ]
    }
  ],
  "practice_text_types": [
    "Zeitungsartikel (Current events, society)",
    "Sachtext (Science, technology, environment)",
    "Werbung und Anzeigen (Products, services)",
    "Formelle Briefe (Business correspondence)"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 7) AND lesson_number = 1;

-- Lesson 2: Listening Comprehension Strategies
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "listening",
  "telc_points": 75,
  "learning_objectives": [
    "Understand main ideas on first listening",
    "Take effective notes while listening",
    "Handle different German accents",
    "Apply strategies for each listening Teil"
  ],
  "telc_listening_overview": {
    "total_time": "20 minutes (audio plays twice for Teile 1-2)",
    "teile": [
      {"teil": 1, "type": "Globalverstehen", "audio": "5 short texts", "questions": 5, "points": 25, "plays": 2},
      {"teil": 2, "type": "Detailverstehen", "audio": "1 interview/monologue", "questions": 10, "points": 25, "plays": 2},
      {"teil": 3, "type": "Selektives Verstehen", "audio": "5 short messages", "questions": 5, "points": 25, "plays": 1}
    ]
  },
  "listening_strategies": {
    "teil_1": {
      "name": "Global Understanding",
      "before": ["Read all questions and options carefully", "Identify key words", "Predict possible answers"],
      "during": ["First listen: Get general idea, note key words", "Second listen: Confirm/correct your answers"],
      "tips": ["Focus on the overall message, not every word", "Pay attention to tone and context"]
    },
    "teil_2": {
      "name": "Detailed Understanding",
      "before": ["Read all 10 statements", "Mark potential answers", "Identify what type of info is needed"],
      "during": ["Take notes on key facts", "Mark uncertain answers for second listen", "Pay attention to sequence"],
      "tips": ["Answers come in order with the audio", "Listen for specific numbers, names, facts"]
    },
    "teil_3": {
      "name": "Selective Understanding",
      "before": ["Read situations carefully", "Understand what each person is looking for"],
      "during": ["This only plays ONCE - focus completely", "Match announcement details to needs"],
      "tips": ["Often about practical situations (events, services, announcements)", "Listen for specific details that match requirements"]
    }
  },
  "vocabulary_sets": [
    {
      "theme": "Hörverstehen-Signalwörter",
      "words": [
        {"german": "im Gegensatz dazu", "english": "in contrast to that", "usage": "Signals opposing information"},
        {"german": "wie bereits erwähnt", "english": "as already mentioned", "usage": "References earlier point"},
        {"german": "zusammenfassend", "english": "in summary", "usage": "Signals conclusion coming"},
        {"german": "das bedeutet", "english": "that means", "usage": "Explanation follows"},
        {"german": "trotzdem", "english": "nevertheless", "usage": "Signals unexpected continuation"}
      ]
    }
  ],
  "common_audio_contexts": [
    "Radio reports and interviews",
    "Announcements (train stations, airports, events)",
    "Voicemail and phone messages",
    "Podcasts and discussions"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 7) AND lesson_number = 2;

-- Lesson 3: Academic and Professional Texts
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "reading",
  "learning_objectives": [
    "Understand academic register and formal language",
    "Navigate complex argumentative structures",
    "Extract key information from professional documents",
    "Handle specialized vocabulary"
  ],
  "text_analysis_framework": {
    "structure_elements": [
      {"element": "These (Thesis)", "purpose": "Main argument or claim", "signal_words": ["Es wird behauptet, dass...", "Die These lautet..."]},
      {"element": "Argumente", "purpose": "Supporting reasons", "signal_words": ["erstens, zweitens", "ein Grund dafür ist"]},
      {"element": "Beispiele", "purpose": "Concrete illustrations", "signal_words": ["zum Beispiel", "ein Beispiel hierfür"]},
      {"element": "Gegenargumente", "purpose": "Counter-arguments", "signal_words": ["Kritiker behaupten", "dagegen spricht"]},
      {"element": "Fazit", "purpose": "Conclusion", "signal_words": ["Zusammenfassend", "Insgesamt lässt sich sagen"]}
    ]
  },
  "vocabulary_sets": [
    {
      "theme": "Akademische Sprache",
      "words": [
        {"german": "die Studie", "english": "study", "usage": "Laut einer aktuellen Studie..."},
        {"german": "die Untersuchung", "english": "investigation/research", "usage": "Die Untersuchung zeigt..."},
        {"german": "der Experte / die Expertin", "english": "expert", "usage": "Experten zufolge..."},
        {"german": "erörtern", "english": "to discuss/analyze", "usage": "Im Folgenden wird das Thema erörtert."},
        {"german": "darlegen", "english": "to present/explain", "usage": "Der Autor legt dar, dass..."},
        {"german": "im Hinblick auf", "english": "with regard to", "usage": "Im Hinblick auf die Zukunft..."}
      ]
    },
    {
      "theme": "Berufliche Dokumente",
      "words": [
        {"german": "die Vereinbarung", "english": "agreement", "usage": "Contract language"},
        {"german": "die Frist", "english": "deadline", "usage": "Die Frist endet am..."},
        {"german": "die Bestimmung", "english": "regulation/provision", "usage": "Gemäß den Bestimmungen..."},
        {"german": "verbindlich", "english": "binding", "usage": "Diese Regelung ist verbindlich."}
      ]
    }
  ],
  "practice_focus": [
    "Wissenschaftliche Artikel (Environment, Technology)",
    "Wirtschaftsberichte (Business reports)",
    "Arbeitsverträge und Regelungen",
    "Politische Stellungnahmen"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 7) AND lesson_number = 3;

-- Lesson 4: Understanding Nuances and Implicit Meaning
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "reading",
  "learning_objectives": [
    "Identify author opinion vs. neutral reporting",
    "Recognize irony, criticism, and persuasion techniques",
    "Understand implicit meanings",
    "Distinguish fact from opinion"
  ],
  "analysis_skills": {
    "opinion_markers": {
      "description": "Words and phrases that signal author''s view",
      "positive": ["erfreulicherweise", "sinnvoll", "vielversprechend", "zu begrüßen"],
      "negative": ["leider", "bedauerlicherweise", "fragwürdig", "bedenklich"],
      "neutral_reporting": ["laut + Dativ", "zufolge", "nach Angaben von", "wie ... berichtet"]
    },
    "persuasion_techniques": [
      {"technique": "Appell an Autorität", "example": "Wissenschaftler bestätigen...", "purpose": "Credibility through expertise"},
      {"technique": "Statistiken", "example": "78% der Befragten...", "purpose": "Factual support"},
      {"technique": "Emotionale Sprache", "example": "erschreckend, besorgniserregend", "purpose": "Emotional response"},
      {"technique": "Rhetorische Fragen", "example": "Ist das wirklich akzeptabel?", "purpose": "Engage reader, suggest answer"}
    ]
  },
  "vocabulary_sets": [
    {
      "theme": "Meinungsausdrücke",
      "words": [
        {"german": "der Verfasser/die Verfasserin vertritt die Ansicht", "english": "the author holds the view", "usage": "Identifying stance"},
        {"german": "es liegt auf der Hand", "english": "it is obvious", "usage": "Asserting obviousness"},
        {"german": "es steht außer Frage", "english": "there is no doubt", "usage": "Certainty marker"},
        {"german": "man darf nicht vergessen", "english": "one must not forget", "usage": "Emphasizing point"}
      ]
    }
  ],
  "practice_exercise": {
    "task": "Read the following excerpt and identify: 1) Main claim 2) Supporting evidence 3) Author''s opinion 4) Any counter-arguments mentioned",
    "sample_text": "Die Digitalisierung der Arbeitswelt schreitet unaufhaltsam voran. Während Optimisten von erhöhter Effizienz und neuen Möglichkeiten schwärmen, warnen Kritiker vor dem drohenden Verlust von Millionen Arbeitsplätzen. Fest steht: Wer sich nicht anpasst, wird abgehängt.",
    "analysis_points": ["Unaufhaltsam = author sees as unstoppable", "Optimisten vs. Kritiker = balanced presentation", "Fest steht = author''s conclusion/judgment"]
  }
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 7) AND lesson_number = 4;

-- Lesson 5: Integrated Skills Practice
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "integrated",
  "learning_objectives": [
    "Combine reading and listening skills",
    "Transfer information between modalities",
    "Build comprehensive topic knowledge",
    "Practice time management across skills"
  ],
  "integrated_practice": {
    "theme": "Nachhaltigkeit und Umweltschutz",
    "reading_component": {
      "type": "Newspaper article",
      "focus": "EU regulations on plastic waste",
      "tasks": ["Identify main policy changes", "Note key dates and numbers", "Understand industry reactions"]
    },
    "listening_component": {
      "type": "Radio interview",
      "focus": "Expert discussing same topic",
      "tasks": ["Compare expert view to article", "Note additional information", "Identify areas of agreement/disagreement"]
    },
    "synthesis_questions": [
      "Was sind die wichtigsten Maßnahmen laut Text und Interview?",
      "Wie unterscheiden sich die Perspektiven?",
      "Was könnte Ihre eigene Meinung sein?"
    ]
  },
  "vocabulary_sets": [
    {
      "theme": "Umwelt und Nachhaltigkeit",
      "words": [
        {"german": "die Nachhaltigkeit", "english": "sustainability", "usage": "Environmental context"},
        {"german": "der CO2-Ausstoß", "english": "CO2 emissions", "usage": "Climate discussions"},
        {"german": "erneuerbare Energien", "english": "renewable energies", "usage": "Energy policy"},
        {"german": "die Mülltrennung", "english": "waste separation/recycling", "usage": "Everyday context"},
        {"german": "der ökologische Fußabdruck", "english": "ecological footprint", "usage": "Personal impact"},
        {"german": "umweltschonend", "english": "environmentally friendly", "usage": "Products/processes"}
      ]
    }
  ],
  "exam_simulation_note": "This type of integrated thinking prepares you for the TELC exam where themes often repeat across sections"
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 7) AND lesson_number = 5;