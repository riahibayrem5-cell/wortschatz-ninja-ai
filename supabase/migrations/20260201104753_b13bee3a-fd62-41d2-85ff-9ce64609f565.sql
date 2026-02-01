-- Week 8: Grammar Mastery II - 5 Lessons
-- Lesson 1: Verb Prefixes (Trennbar/Untrennbar)
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "grammar",
  "learning_objectives": [
    "Distinguish separable and inseparable prefixes",
    "Use prefixed verbs correctly in all tenses",
    "Understand meaning changes with different prefixes",
    "Handle reflexive verbs with prefixes"
  ],
  "grammar_rules": [
    {
      "rule": "Trennbare Präfixe (Separable)",
      "explanation": "Prefixes that separate in main clauses; stressed in pronunciation",
      "prefixes": ["ab-", "an-", "auf-", "aus-", "bei-", "ein-", "mit-", "nach-", "vor-", "zu-", "zurück-"],
      "examples": [
        {"infinitiv": "anfangen", "präsens": "Ich fange an.", "perfekt": "Ich habe angefangen."},
        {"infinitiv": "aufstehen", "präsens": "Er steht früh auf.", "perfekt": "Er ist früh aufgestanden."},
        {"infinitiv": "mitnehmen", "präsens": "Sie nimmt das Buch mit.", "nebensatz": "..., weil sie das Buch mitnimmt."}
      ]
    },
    {
      "rule": "Untrennbare Präfixe (Inseparable)",
      "explanation": "Prefixes that never separate; unstressed; no ge- in Partizip II",
      "prefixes": ["be-", "emp-", "ent-", "er-", "ge-", "miss-", "ver-", "zer-"],
      "examples": [
        {"infinitiv": "verstehen", "präsens": "Ich verstehe das.", "perfekt": "Ich habe das verstanden."},
        {"infinitiv": "beginnen", "präsens": "Der Kurs beginnt.", "perfekt": "Der Kurs hat begonnen."},
        {"infinitiv": "erklären", "präsens": "Sie erklärt die Regel.", "perfekt": "Sie hat die Regel erklärt."}
      ]
    },
    {
      "rule": "Wechselnde Präfixe",
      "explanation": "Prefixes that can be separable OR inseparable with different meanings",
      "prefixes": ["durch-", "über-", "um-", "unter-", "wieder-"],
      "examples": [
        {"separable": "durchlesen - Er liest den Text durch. (read through)", "inseparable": "durchsuchen - Sie durchsucht die Tasche. (search through)"},
        {"separable": "umziehen - Ich ziehe um. (move house)", "inseparable": "umarmen - Sie umarmt ihn. (embrace)"}
      ]
    }
  ],
  "vocabulary_sets": [
    {
      "theme": "Wichtige Präfixverben",
      "words": [
        {"german": "sich anmelden", "english": "to register/sign up", "usage": "Ich melde mich für den Kurs an."},
        {"german": "aufhören", "english": "to stop", "usage": "Er hört mit dem Rauchen auf."},
        {"german": "vorhaben", "english": "to plan/intend", "usage": "Was hast du heute vor?"},
        {"german": "sich entscheiden", "english": "to decide", "usage": "Ich habe mich entschieden."},
        {"german": "beantragen", "english": "to apply for", "usage": "Ich beantrage ein Visum."}
      ]
    }
  ],
  "telc_relevance": "Critical for Sprachbausteine gap-fill and writing coherence"
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 8) AND lesson_number = 1;

-- Lesson 2: Adjective Endings Mastery
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "grammar",
  "learning_objectives": [
    "Apply adjective endings after definite articles",
    "Apply adjective endings after indefinite articles",
    "Handle adjectives without articles",
    "Combine multiple adjectives correctly"
  ],
  "grammar_rules": [
    {
      "rule": "Nach bestimmtem Artikel (der, die, das...)",
      "explanation": "Weak endings: -e or -en only",
      "table": {
        "headers": ["", "Maskulin", "Feminin", "Neutrum", "Plural"],
        "nominativ": ["-e", "-e", "-e", "-en"],
        "akkusativ": ["-en", "-e", "-e", "-en"],
        "dativ": ["-en", "-en", "-en", "-en"],
        "genitiv": ["-en", "-en", "-en", "-en"]
      },
      "examples": [
        {"german": "der neue Computer", "case": "Nom. Mask."},
        {"german": "die schöne Stadt", "case": "Nom. Fem."},
        {"german": "mit dem alten Auto", "case": "Dat. Neut."}
      ]
    },
    {
      "rule": "Nach unbestimmtem Artikel (ein, eine, kein, mein...)",
      "explanation": "Mixed endings: Strong in Nom. Mask., Nom./Akk. Neut.; weak elsewhere",
      "table": {
        "headers": ["", "Maskulin", "Feminin", "Neutrum", "Plural (kein/mein)"],
        "nominativ": ["-er", "-e", "-es", "-en"],
        "akkusativ": ["-en", "-e", "-es", "-en"],
        "dativ": ["-en", "-en", "-en", "-en"],
        "genitiv": ["-en", "-en", "-en", "-en"]
      },
      "examples": [
        {"german": "ein neuer Computer", "case": "Nom. Mask."},
        {"german": "eine schöne Stadt", "case": "Nom. Fem."},
        {"german": "kein altes Haus", "case": "Nom./Akk. Neut."}
      ]
    },
    {
      "rule": "Ohne Artikel (Strong Endings)",
      "explanation": "Adjective shows gender/case itself",
      "table": {
        "headers": ["", "Maskulin", "Feminin", "Neutrum", "Plural"],
        "nominativ": ["-er", "-e", "-es", "-e"],
        "akkusativ": ["-en", "-e", "-es", "-e"],
        "dativ": ["-em", "-er", "-em", "-en"],
        "genitiv": ["-en", "-er", "-en", "-er"]
      },
      "examples": [
        {"german": "frischer Kaffee", "case": "Nom. Mask."},
        {"german": "kalte Milch", "case": "Nom. Fem."},
        {"german": "mit großer Freude", "case": "Dat. Fem."}
      ]
    }
  ],
  "quick_tips": [
    "Trick: If article shows gender/case clearly → weak ending (-e/-en)",
    "If article doesn''t show it clearly (ein, eine in some cases) → adjective shows it",
    "No article → adjective MUST show gender/case (strong endings)"
  ],
  "telc_relevance": "Tested directly in Sprachbausteine; affects overall written accuracy"
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 8) AND lesson_number = 2;

-- Lesson 3: Temporal Connectors and Time Expressions
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "grammar",
  "learning_objectives": [
    "Use temporal subordinate conjunctions correctly",
    "Express simultaneity, anteriority, and posteriority",
    "Handle tense sequence in temporal clauses",
    "Write fluent narratives with time markers"
  ],
  "grammar_rules": [
    {
      "rule": "Gleichzeitigkeit (Simultaneity)",
      "conjunctions": [
        {"conjunction": "während", "english": "while/during", "example": "Während ich arbeitete, hörte ich Musik."},
        {"conjunction": "solange", "english": "as long as", "example": "Solange es regnet, bleiben wir drinnen."},
        {"conjunction": "als", "english": "when (past, single event)", "example": "Als ich Kind war, lebte ich in Berlin."},
        {"conjunction": "wenn", "english": "when (present/future, repeated past)", "example": "Wenn ich Zeit habe, lese ich."}
      ]
    },
    {
      "rule": "Vorzeitigkeit (Anteriority)",
      "conjunctions": [
        {"conjunction": "nachdem", "english": "after", "example": "Nachdem er gegessen hatte, ging er spazieren.", "tense_note": "Nachdem + Plusquamperfekt, Hauptsatz = Präteritum/Perfekt"},
        {"conjunction": "sobald", "english": "as soon as", "example": "Sobald ich fertig bin, rufe ich dich an."},
        {"conjunction": "seit/seitdem", "english": "since", "example": "Seitdem er hier wohnt, ist er glücklicher."}
      ]
    },
    {
      "rule": "Nachzeitigkeit (Posteriority)",
      "conjunctions": [
        {"conjunction": "bevor", "english": "before", "example": "Bevor du gehst, ruf mich an."},
        {"conjunction": "ehe", "english": "before (formal)", "example": "Ehe ich es vergesse, hier ist dein Buch."},
        {"conjunction": "bis", "english": "until", "example": "Warte, bis ich komme."}
      ]
    }
  ],
  "vocabulary_sets": [
    {
      "theme": "Zeitadverbien",
      "words": [
        {"german": "damals", "english": "back then", "usage": "Referring to past time"},
        {"german": "inzwischen", "english": "meanwhile/since then", "usage": "Time has passed"},
        {"german": "schließlich", "english": "finally/eventually", "usage": "End of sequence"},
        {"german": "zunächst", "english": "first/initially", "usage": "Start of sequence"},
        {"german": "anschließend", "english": "afterwards/subsequently", "usage": "Following action"}
      ]
    }
  ],
  "als_vs_wenn": {
    "als": ["Past tense only", "Single, unique event", "Er freute sich, als er die Nachricht hörte."],
    "wenn": ["Present/Future tense", "Repeated events (also in past)", "Wenn/Immer wenn ich ihn sah, lächelte er."]
  }
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 8) AND lesson_number = 3;

-- Lesson 4: Causal and Concessive Clauses
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "grammar",
  "learning_objectives": [
    "Express reasons with various conjunctions",
    "Use concessive clauses (despite, although)",
    "Understand nuances between similar connectors",
    "Write sophisticated argumentative sentences"
  ],
  "grammar_rules": [
    {
      "rule": "Kausale Konjunktionen (Causal)",
      "connectors": [
        {"connector": "weil", "type": "subordinating", "example": "Ich bleibe zu Hause, weil ich krank bin."},
        {"connector": "da", "type": "subordinating", "example": "Da es regnet, nehme ich den Schirm.", "note": "Often at beginning of sentence, reason is known"},
        {"connector": "denn", "type": "coordinating", "example": "Ich bleibe zu Hause, denn ich bin krank.", "note": "No word order change"},
        {"connector": "nämlich", "type": "adverb", "example": "Ich kann nicht kommen. Ich bin nämlich krank.", "note": "In second position"}
      ]
    },
    {
      "rule": "Konsekutive Konjunktionen (Consequence)",
      "connectors": [
        {"connector": "sodass / so dass", "type": "subordinating", "example": "Es regnete stark, sodass wir nicht gehen konnten."},
        {"connector": "deshalb / deswegen / daher", "type": "adverb", "example": "Es regnet. Deshalb bleibe ich zu Hause."},
        {"connector": "folglich", "type": "adverb", "example": "Er hat nicht gelernt. Folglich hat er die Prüfung nicht bestanden."}
      ]
    },
    {
      "rule": "Konzessive Konjunktionen (Concessive)",
      "connectors": [
        {"connector": "obwohl", "type": "subordinating", "example": "Obwohl er müde war, arbeitete er weiter."},
        {"connector": "obgleich / obschon", "type": "subordinating", "example": "Obgleich es regnete, gingen sie spazieren.", "note": "More formal/literary"},
        {"connector": "trotzdem", "type": "adverb", "example": "Es regnet. Trotzdem gehe ich spazieren."},
        {"connector": "dennoch", "type": "adverb", "example": "Er ist krank. Dennoch geht er zur Arbeit.", "note": "More formal"}
      ]
    }
  ],
  "vocabulary_sets": [
    {
      "theme": "Argumentative Konnektoren",
      "words": [
        {"german": "aufgrund + Genitiv", "english": "due to/because of", "usage": "Aufgrund des schlechten Wetters..."},
        {"german": "infolge + Genitiv", "english": "as a result of", "usage": "Infolge der Krise..."},
        {"german": "angesichts + Genitiv", "english": "in view of", "usage": "Angesichts der Situation..."},
        {"german": "ungeachtet + Genitiv", "english": "regardless of", "usage": "Ungeachtet der Kritik..."}
      ]
    }
  ],
  "telc_relevance": "Essential for argumentative writing and sophisticated reading comprehension"
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 8) AND lesson_number = 4;

-- Lesson 5: Grammar Review and Sprachbausteine Practice
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "sprachbausteine",
  "telc_points": 30,
  "learning_objectives": [
    "Apply all grammar knowledge to Sprachbausteine tasks",
    "Master Teil 1 (cloze text) strategies",
    "Master Teil 2 (error correction) strategies",
    "Achieve time-efficient accuracy"
  ],
  "sprachbausteine_overview": {
    "teil_1": {
      "format": "Lückentext (Cloze test) - 10 gaps",
      "points": 15,
      "time": "15 minutes recommended",
      "what_is_tested": ["Prepositions", "Conjunctions", "Articles", "Pronouns", "Verb forms"]
    },
    "teil_2": {
      "format": "Fehlerkorrektur - 10 lines to check",
      "points": 15,
      "time": "15 minutes recommended",
      "what_is_tested": ["Word order", "Case errors", "Agreement errors", "Missing/extra words"]
    }
  },
  "teil_1_strategies": {
    "steps": [
      "Read the entire text first for context",
      "Identify what type of word is missing (preposition, conjunction, article...)",
      "Check surrounding words for clues (verbs that require specific prepositions, etc.)",
      "Eliminate impossible options",
      "Double-check your answer fits grammatically AND semantically"
    ],
    "common_patterns": [
      {"pattern": "Verb + Präposition", "examples": ["warten auf", "sich freuen über", "träumen von"]},
      {"pattern": "Kasus nach Präposition", "examples": ["trotz + Gen", "wegen + Gen", "während + Gen"]},
      {"pattern": "Konjunktionen", "examples": ["obwohl vs. trotzdem", "weil vs. denn", "wenn vs. als"]}
    ]
  },
  "teil_2_strategies": {
    "steps": [
      "Read each line carefully - one error per line OR line is correct",
      "Check: Subject-verb agreement, case usage, word order",
      "Look for: Wrong articles, wrong prepositions, extra/missing words",
      "Mark lines you''re unsure about for review",
      "Trust your instincts - if it sounds wrong, it probably is"
    ],
    "common_errors": [
      {"error": "Dativ statt Akkusativ", "wrong": "Ich helfe ihn.", "correct": "Ich helfe ihm."},
      {"error": "Falsche Wortstellung", "wrong": "Ich gestern habe gearbeitet.", "correct": "Ich habe gestern gearbeitet."},
      {"error": "Falsche Endung", "wrong": "der neue Computers", "correct": "des neuen Computers"}
    ]
  },
  "practice_focus": [
    "Präpositionen mit festem Kasus",
    "Verb-Präposition-Verbindungen",
    "Adjektivendungen",
    "Konjunktionen und Satzbau"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 8) AND lesson_number = 5;