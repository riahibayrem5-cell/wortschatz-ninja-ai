-- Week 5: Speaking Practice (Mündlicher Ausdruck) - 5 Lessons
-- Lesson 1: Introduction to TELC Speaking Exam
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "speaking",
  "telc_points": 75,
  "telc_time_minutes": 16,
  "learning_objectives": [
    "Understand the structure of TELC B2 Speaking exam",
    "Learn evaluation criteria and scoring",
    "Practice self-introduction techniques",
    "Build confidence for oral examination"
  ],
  "exam_format": {
    "parts": [
      {"name": "Teil 1: Präsentation", "duration": "3 min", "points": 25, "description": "Present a topic with pros/cons"},
      {"name": "Teil 2: Diskussion", "duration": "6 min", "points": 25, "description": "Discuss the topic with partner"},
      {"name": "Teil 3: Problemlösung", "duration": "7 min", "points": 25, "description": "Negotiate a solution together"}
    ],
    "evaluation_criteria": [
      {"criterion": "Aufgabenbewältigung", "weight": "25%", "description": "Task completion and relevance"},
      {"criterion": "Flüssigkeit", "weight": "25%", "description": "Fluency and natural speech flow"},
      {"criterion": "Ausdrucksfähigkeit", "weight": "25%", "description": "Range of vocabulary and expressions"},
      {"criterion": "Korrektheit", "weight": "25%", "description": "Grammatical and phonetic accuracy"}
    ]
  },
  "vocabulary_sets": [
    {
      "theme": "Präsentationsphrasen",
      "words": [
        {"german": "Ich möchte heute über ... sprechen", "english": "I would like to talk about ... today", "usage": "Opening a presentation"},
        {"german": "Zunächst möchte ich auf ... eingehen", "english": "First, I would like to address ...", "usage": "Structuring points"},
        {"german": "Ein wichtiger Aspekt ist ...", "english": "An important aspect is ...", "usage": "Highlighting key points"},
        {"german": "Einerseits ... andererseits ...", "english": "On one hand ... on the other hand ...", "usage": "Presenting pros/cons"},
        {"german": "Zusammenfassend lässt sich sagen ...", "english": "In summary, one can say ...", "usage": "Concluding"},
        {"german": "Meiner Meinung nach ...", "english": "In my opinion ...", "usage": "Expressing opinion"},
        {"german": "Es gibt sowohl Vor- als auch Nachteile", "english": "There are both advantages and disadvantages", "usage": "Balanced view"}
      ]
    }
  ],
  "practice_topics": [
    {
      "topic": "Homeoffice vs. Büroarbeit",
      "prompt": "Präsentieren Sie die Vor- und Nachteile von Homeoffice im Vergleich zur Büroarbeit.",
      "key_points": ["Flexibilität", "Work-Life-Balance", "Kommunikation", "Produktivität", "Soziale Kontakte"]
    },
    {
      "topic": "Soziale Medien",
      "prompt": "Diskutieren Sie den Einfluss von sozialen Medien auf unser Leben.",
      "key_points": ["Vernetzung", "Informationsaustausch", "Datenschutz", "Suchtgefahr", "Fake News"]
    }
  ],
  "tips": [
    "Üben Sie lautes Sprechen - timing ist wichtig",
    "Strukturieren Sie Ihre Präsentation: Einleitung, Hauptteil, Schluss",
    "Blickkontakt mit Ihrem Partner halten",
    "Sprechen Sie deutlich und in angemessenem Tempo"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 5) AND lesson_number = 1;

-- Lesson 2: Presentation Skills
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "speaking",
  "learning_objectives": [
    "Structure a 3-minute presentation effectively",
    "Use transition phrases and connectors",
    "Present arguments with supporting examples",
    "Handle the topic card efficiently"
  ],
  "presentation_structure": {
    "introduction": {
      "duration": "30 seconds",
      "elements": ["Greet the examiner", "Introduce your topic", "Outline what you will cover"],
      "example_phrases": [
        "Guten Tag, ich möchte Ihnen heute das Thema ... vorstellen.",
        "In meiner Präsentation werde ich zunächst ... erklären, dann ... besprechen und schließlich ... diskutieren."
      ]
    },
    "main_body": {
      "duration": "2 minutes",
      "elements": ["Present 2-3 main points", "Give examples for each", "Show both sides"],
      "example_phrases": [
        "Der erste Punkt, den ich ansprechen möchte, ist ...",
        "Ein Beispiel dafür wäre ...",
        "Auf der anderen Seite muss man bedenken, dass ..."
      ]
    },
    "conclusion": {
      "duration": "30 seconds",
      "elements": ["Summarize key points", "Give your opinion", "Thank the audience"],
      "example_phrases": [
        "Abschließend möchte ich sagen, dass ...",
        "Meiner Meinung nach überwiegen die Vorteile/Nachteile.",
        "Vielen Dank für Ihre Aufmerksamkeit."
      ]
    }
  },
  "vocabulary_sets": [
    {
      "theme": "Übergangswörter",
      "words": [
        {"german": "Zunächst", "english": "First of all", "usage": "Starting first point"},
        {"german": "Darüber hinaus", "english": "Furthermore", "usage": "Adding information"},
        {"german": "Im Gegensatz dazu", "english": "In contrast to that", "usage": "Contrasting"},
        {"german": "Folglich", "english": "Consequently", "usage": "Showing result"},
        {"german": "Abschließend", "english": "In conclusion", "usage": "Ending presentation"},
        {"german": "Es ist erwähnenswert, dass", "english": "It is worth mentioning that", "usage": "Adding important point"}
      ]
    }
  ],
  "practice_exercise": {
    "topic": "Digitalisierung in der Schule",
    "task": "Präsentieren Sie in 3 Minuten die Vor- und Nachteile der Digitalisierung im Schulunterricht.",
    "suggested_structure": {
      "intro": "Was ist Digitalisierung im Bildungsbereich?",
      "pro": ["Interaktives Lernen", "Zugang zu Ressourcen", "Vorbereitung auf Arbeitswelt"],
      "contra": ["Ablenkungsgefahr", "Bildschirmzeit", "Soziale Interaktion leidet"],
      "conclusion": "Persönliche Meinung mit Begründung"
    }
  }
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 5) AND lesson_number = 2;

-- Lesson 3: Discussion Strategies
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "speaking",
  "learning_objectives": [
    "Engage effectively in a discussion",
    "Agree and disagree politely",
    "Ask for and give opinions",
    "Keep the conversation flowing"
  ],
  "discussion_phrases": {
    "agreeing": [
      {"phrase": "Da stimme ich Ihnen völlig zu.", "english": "I completely agree with you.", "formality": "formal"},
      {"phrase": "Das sehe ich genauso.", "english": "I see it the same way.", "formality": "neutral"},
      {"phrase": "Sie haben absolut recht.", "english": "You are absolutely right.", "formality": "formal"},
      {"phrase": "Das ist ein guter Punkt.", "english": "That is a good point.", "formality": "neutral"}
    ],
    "disagreeing": [
      {"phrase": "Da bin ich anderer Meinung.", "english": "I have a different opinion on that.", "formality": "neutral"},
      {"phrase": "Ich sehe das etwas anders.", "english": "I see that somewhat differently.", "formality": "polite"},
      {"phrase": "Das stimmt zwar, aber ...", "english": "That is true, but ...", "formality": "conceding"},
      {"phrase": "Ich verstehe Ihren Standpunkt, jedoch ...", "english": "I understand your point, however ...", "formality": "formal"}
    ],
    "asking_opinion": [
      {"phrase": "Was meinen Sie dazu?", "english": "What do you think about that?", "formality": "formal"},
      {"phrase": "Wie sehen Sie das?", "english": "How do you see it?", "formality": "neutral"},
      {"phrase": "Sind Sie auch dieser Meinung?", "english": "Are you also of this opinion?", "formality": "formal"}
    ],
    "elaborating": [
      {"phrase": "Lassen Sie mich das erklären ...", "english": "Let me explain that ...", "formality": "formal"},
      {"phrase": "Was ich damit meine, ist ...", "english": "What I mean by that is ...", "formality": "neutral"},
      {"phrase": "Um ein Beispiel zu geben ...", "english": "To give an example ...", "formality": "neutral"}
    ]
  },
  "common_discussion_topics": [
    "Umweltschutz und Klimawandel",
    "Work-Life-Balance",
    "Digitale Medien und Gesellschaft",
    "Gesundheit und Ernährung",
    "Bildung und Karriere"
  ],
  "practice_dialogue": {
    "topic": "Sollten Unternehmen Homeoffice dauerhaft anbieten?",
    "role_a": "Pro Homeoffice",
    "role_b": "Pro Büroarbeit",
    "discussion_points": [
      "Produktivität und Effizienz",
      "Teamarbeit und Kommunikation",
      "Kosten für Unternehmen",
      "Mitarbeiterzufriedenheit"
    ]
  }
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 5) AND lesson_number = 3;

-- Lesson 4: Problem-Solving Negotiations
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "speaking",
  "learning_objectives": [
    "Negotiate solutions collaboratively",
    "Make suggestions and counter-proposals",
    "Reach compromises",
    "Use conditional and diplomatic language"
  ],
  "negotiation_phases": {
    "phase_1": {
      "name": "Problemerkennung",
      "goal": "Identify and understand the problem",
      "phrases": [
        "Das Problem ist, dass ...",
        "Wir müssen eine Lösung finden für ...",
        "Die Hauptschwierigkeit besteht darin, dass ..."
      ]
    },
    "phase_2": {
      "name": "Vorschläge machen",
      "goal": "Propose solutions",
      "phrases": [
        "Ich schlage vor, dass wir ...",
        "Wie wäre es, wenn wir ...?",
        "Eine Möglichkeit wäre ...",
        "Wir könnten auch ..."
      ]
    },
    "phase_3": {
      "name": "Auf Vorschläge reagieren",
      "goal": "Respond to proposals",
      "phrases": [
        "Das klingt gut, aber ...",
        "Das wäre eine Option, allerdings ...",
        "Ich finde die Idee gut. Vielleicht könnten wir auch ..."
      ]
    },
    "phase_4": {
      "name": "Kompromiss finden",
      "goal": "Reach agreement",
      "phrases": [
        "Können wir uns darauf einigen, dass ...?",
        "Als Kompromiss könnten wir ...",
        "Einverstanden! Dann machen wir es so."
      ]
    }
  },
  "vocabulary_sets": [
    {
      "theme": "Diplomatische Sprache",
      "words": [
        {"german": "Wäre es möglich, dass ...?", "english": "Would it be possible that ...?", "usage": "Polite suggestion"},
        {"german": "Ich würde vorschlagen ...", "english": "I would suggest ...", "usage": "Konjunktiv II for politeness"},
        {"german": "Es wäre vielleicht besser, wenn ...", "english": "It might be better if ...", "usage": "Softened suggestion"},
        {"german": "Könnten wir nicht ...?", "english": "Couldn''t we ...?", "usage": "Proposing alternative"}
      ]
    }
  ],
  "practice_scenarios": [
    {
      "scenario": "Betriebsausflug planen",
      "situation": "Sie und Ihr Partner sollen einen Betriebsausflug für 30 Kollegen organisieren. Budget: 50€ pro Person.",
      "decisions": ["Ziel (Stadt, Natur, Freizeitpark)", "Transport", "Aktivitäten", "Verpflegung"],
      "constraints": ["Unterschiedliche Interessen", "Mobilitätseinschränkungen einiger Kollegen"]
    }
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 5) AND lesson_number = 4;

-- Lesson 5: Speaking Exam Simulation
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "speaking",
  "learning_objectives": [
    "Complete a full speaking exam simulation",
    "Apply all learned strategies",
    "Manage time effectively",
    "Handle unexpected questions"
  ],
  "exam_simulation": {
    "preparation_time": "20 minutes",
    "exam_duration": "16 minutes per pair",
    "materials": "Topic card with key words"
  },
  "sample_exam": {
    "topic": "Berufliche Weiterbildung",
    "teil_1": {
      "task": "Präsentieren Sie in ca. 3 Minuten die Vor- und Nachteile von beruflicher Weiterbildung.",
      "keywords": ["Karrierechancen", "Zeitaufwand", "Kosten", "Spezialisierung", "Arbeitsmarkt"]
    },
    "teil_2": {
      "task": "Diskutieren Sie mit Ihrem Partner: Sollten Arbeitgeber Weiterbildung bezahlen?",
      "discussion_points": ["Verantwortung des Arbeitgebers", "Motivation der Mitarbeiter", "Kosten-Nutzen"]
    },
    "teil_3": {
      "situation": "Sie arbeiten in der Personalabteilung. Planen Sie ein Weiterbildungsprogramm für Ihre Abteilung.",
      "decisions": ["Art der Weiterbildung", "Zeitrahmen", "Budget", "Teilnehmerauswahl"]
    }
  },
  "evaluation_checklist": [
    {"criterion": "Klare Struktur in der Präsentation", "points": 5},
    {"criterion": "Verwendung von Konnektoren", "points": 5},
    {"criterion": "Aktive Teilnahme an Diskussion", "points": 5},
    {"criterion": "Diplomatische Formulierungen", "points": 5},
    {"criterion": "Grammatische Korrektheit", "points": 5}
  ],
  "common_mistakes": [
    "Zu schnell oder zu langsam sprechen",
    "Monolog statt Dialog in der Diskussion",
    "Keine Beispiele zur Unterstützung",
    "Vergessen, den Partner einzubeziehen"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 5) AND lesson_number = 5;