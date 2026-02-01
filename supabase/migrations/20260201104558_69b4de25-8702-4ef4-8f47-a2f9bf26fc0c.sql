-- Week 6: Grammar Mastery I - 5 Lessons
-- Lesson 1: Konjunktiv II - Polite Requests & Hypotheticals
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "grammar",
  "learning_objectives": [
    "Form Konjunktiv II for common verbs",
    "Use würde + infinitive construction",
    "Express polite requests and suggestions",
    "Form hypothetical sentences with wenn"
  ],
  "grammar_rules": [
    {
      "rule": "Konjunktiv II Formation",
      "explanation": "Formed from Präteritum stem + umlaut (for strong verbs) + endings: -e, -est, -e, -en, -et, -en",
      "examples": [
        {"german": "sein → wäre", "english": "would be"},
        {"german": "haben → hätte", "english": "would have"},
        {"german": "können → könnte", "english": "could"},
        {"german": "müssen → müsste", "english": "would have to"},
        {"german": "gehen → ginge (or: würde gehen)", "english": "would go"}
      ]
    },
    {
      "rule": "würde + Infinitiv",
      "explanation": "Used for most regular verbs instead of outdated Konjunktiv II forms",
      "examples": [
        {"german": "Ich würde gerne mitkommen.", "english": "I would like to come along."},
        {"german": "Er würde das nie tun.", "english": "He would never do that."}
      ]
    },
    {
      "rule": "Hypothetische wenn-Sätze",
      "explanation": "Wenn + Konjunktiv II in both clauses for unreal conditions",
      "examples": [
        {"german": "Wenn ich reich wäre, würde ich eine Weltreise machen.", "english": "If I were rich, I would travel around the world."},
        {"german": "Wenn er Zeit hätte, könnte er uns helfen.", "english": "If he had time, he could help us."}
      ]
    }
  ],
  "vocabulary_sets": [
    {
      "theme": "Höfliche Bitten",
      "words": [
        {"german": "Könnten Sie mir bitte helfen?", "english": "Could you please help me?", "usage": "Polite request"},
        {"german": "Wären Sie so freundlich, ...?", "english": "Would you be so kind as to ...?", "usage": "Very formal"},
        {"german": "Ich hätte gern ...", "english": "I would like ...", "usage": "Ordering/requesting"},
        {"german": "Dürfte ich Sie etwas fragen?", "english": "Might I ask you something?", "usage": "Asking permission"}
      ]
    }
  ],
  "exercises": [
    {
      "type": "transformation",
      "instruction": "Wandeln Sie in den Konjunktiv II um:",
      "items": [
        {"given": "Ich bin müde.", "answer": "Ich wäre müde."},
        {"given": "Er hat keine Zeit.", "answer": "Er hätte keine Zeit."},
        {"given": "Wir können kommen.", "answer": "Wir könnten kommen."}
      ]
    }
  ],
  "telc_relevance": "Essential for Schriftlicher Ausdruck (formal letters) and Mündlicher Ausdruck (polite negotiations)"
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 6) AND lesson_number = 1;

-- Lesson 2: Passive Voice Mastery
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "grammar",
  "learning_objectives": [
    "Form passive voice in all tenses",
    "Distinguish Vorgangspassiv and Zustandspassiv",
    "Use passive in formal writing",
    "Transform active to passive sentences"
  ],
  "grammar_rules": [
    {
      "rule": "Vorgangspassiv (werden + Partizip II)",
      "explanation": "Describes an action being done - uses werden as auxiliary",
      "tenses": [
        {"tense": "Präsens", "example": "Das Buch wird gelesen.", "english": "The book is being read."},
        {"tense": "Präteritum", "example": "Das Buch wurde gelesen.", "english": "The book was read."},
        {"tense": "Perfekt", "example": "Das Buch ist gelesen worden.", "english": "The book has been read."},
        {"tense": "Futur I", "example": "Das Buch wird gelesen werden.", "english": "The book will be read."}
      ]
    },
    {
      "rule": "Zustandspassiv (sein + Partizip II)",
      "explanation": "Describes a state resulting from an action",
      "examples": [
        {"german": "Die Tür ist geschlossen.", "english": "The door is closed (state)."},
        {"german": "Das Essen ist fertig gekocht.", "english": "The food is cooked (ready state)."}
      ]
    },
    {
      "rule": "Passiv mit Modalverben",
      "explanation": "Modal + Partizip II + werden (at end)",
      "examples": [
        {"german": "Das muss erledigt werden.", "english": "This must be done."},
        {"german": "Das kann nicht akzeptiert werden.", "english": "This cannot be accepted."}
      ]
    }
  ],
  "vocabulary_sets": [
    {
      "theme": "Passiv-Signalwörter",
      "words": [
        {"german": "von + Dativ", "english": "by (agent)", "usage": "Der Brief wurde von ihm geschrieben."},
        {"german": "durch + Akkusativ", "english": "through/by (means)", "usage": "Die Stadt wurde durch ein Erdbeben zerstört."},
        {"german": "Es wird gesagt, dass...", "english": "It is said that...", "usage": "Impersonal passive"}
      ]
    }
  ],
  "telc_relevance": "Heavily used in Sprachbausteine and formal writing tasks"
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 6) AND lesson_number = 2;

-- Lesson 3: Relative Clauses
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "grammar",
  "learning_objectives": [
    "Form relative clauses with all relative pronouns",
    "Use relative clauses with prepositions",
    "Combine sentences using relative clauses",
    "Handle was and wo as relative pronouns"
  ],
  "grammar_rules": [
    {
      "rule": "Relativpronomen",
      "explanation": "Match gender/number of noun, case depends on function in relative clause",
      "table": {
        "headers": ["", "Maskulin", "Feminin", "Neutrum", "Plural"],
        "nominativ": ["der", "die", "das", "die"],
        "akkusativ": ["den", "die", "das", "die"],
        "dativ": ["dem", "der", "dem", "denen"],
        "genitiv": ["dessen", "deren", "dessen", "deren"]
      }
    },
    {
      "rule": "Relativsätze mit Präpositionen",
      "explanation": "Preposition comes before relative pronoun",
      "examples": [
        {"german": "Das ist der Mann, mit dem ich gesprochen habe.", "english": "That is the man with whom I spoke."},
        {"german": "Das Haus, in dem wir wohnen, ist alt.", "english": "The house in which we live is old."}
      ]
    },
    {
      "rule": "was als Relativpronomen",
      "explanation": "Used after alles, etwas, nichts, das (demonstrative), superlatives",
      "examples": [
        {"german": "Alles, was er sagt, ist wahr.", "english": "Everything that he says is true."},
        {"german": "Das Beste, was passieren konnte.", "english": "The best that could happen."}
      ]
    },
    {
      "rule": "wo als Relativpronomen",
      "explanation": "Used for places, can replace in + Dativ",
      "examples": [
        {"german": "Die Stadt, wo ich geboren bin...", "english": "The city where I was born..."},
        {"german": "Das Restaurant, wo wir gegessen haben...", "english": "The restaurant where we ate..."}
      ]
    }
  ],
  "exercises": [
    {
      "type": "combine_sentences",
      "instruction": "Verbinden Sie die Sätze mit einem Relativpronomen:",
      "items": [
        {"sentence1": "Das ist der Film.", "sentence2": "Ich habe den Film gesehen.", "answer": "Das ist der Film, den ich gesehen habe."},
        {"sentence1": "Kennst du die Frau?", "sentence2": "Ihr Mann arbeitet hier.", "answer": "Kennst du die Frau, deren Mann hier arbeitet?"}
      ]
    }
  ],
  "telc_relevance": "Critical for Leseverstehen comprehension and Schriftlicher Ausdruck complexity"
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 6) AND lesson_number = 3;

-- Lesson 4: Indirect Speech (Konjunktiv I)
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "grammar",
  "learning_objectives": [
    "Form Konjunktiv I correctly",
    "Report what others have said",
    "Distinguish when to use Konjunktiv I vs II",
    "Apply in formal writing contexts"
  ],
  "grammar_rules": [
    {
      "rule": "Konjunktiv I Formation",
      "explanation": "Infinitive stem + endings: -e, -est, -e, -en, -et, -en",
      "examples": [
        {"verb": "haben", "forms": "habe, habest, habe, haben, habet, haben"},
        {"verb": "sein", "forms": "sei, seist/seiest, sei, seien, seiet, seien"},
        {"verb": "können", "forms": "könne, könnest, könne, können, könnet, können"}
      ]
    },
    {
      "rule": "Verwendung in indirekter Rede",
      "explanation": "Used to report speech without expressing personal opinion on truth",
      "examples": [
        {"direct": "Er sagte: \"Ich bin krank.\"", "indirect": "Er sagte, er sei krank.", "english": "He said he was sick."},
        {"direct": "Sie meinte: \"Das Wetter wird besser.\"", "indirect": "Sie meinte, das Wetter werde besser.", "english": "She thought the weather would improve."}
      ]
    },
    {
      "rule": "Konjunktiv II als Ersatz",
      "explanation": "Use Konjunktiv II when Konjunktiv I = Indikativ (especially 1st person plural, 3rd person plural)",
      "examples": [
        {"wrong": "Sie sagten, sie haben keine Zeit.", "correct": "Sie sagten, sie hätten keine Zeit.", "reason": "haben (K1) = haben (Indikativ)"}
      ]
    }
  ],
  "vocabulary_sets": [
    {
      "theme": "Redeeinleitende Verben",
      "words": [
        {"german": "behaupten", "english": "to claim", "usage": "Er behauptete, er habe recht."},
        {"german": "berichten", "english": "to report", "usage": "Der Reporter berichtete, es gebe Probleme."},
        {"german": "erklären", "english": "to explain/declare", "usage": "Sie erklärte, sie wolle kündigen."},
        {"german": "betonen", "english": "to emphasize", "usage": "Der Minister betonte, dies sei wichtig."}
      ]
    }
  ],
  "telc_relevance": "Appears in Leseverstehen (newspaper articles) and formal Schriftlicher Ausdruck"
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 6) AND lesson_number = 4;

-- Lesson 5: Complex Sentence Structures
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "grammar",
  "learning_objectives": [
    "Master two-part conjunctions",
    "Use infinitive clauses correctly",
    "Handle multiple subordinate clauses",
    "Write complex, exam-ready sentences"
  ],
  "grammar_rules": [
    {
      "rule": "Zweiteilige Konjunktionen",
      "explanation": "Paired conjunctions that connect clauses or phrases",
      "pairs": [
        {"german": "sowohl ... als auch", "english": "both ... and", "example": "Er spricht sowohl Deutsch als auch Englisch."},
        {"german": "weder ... noch", "english": "neither ... nor", "example": "Sie hat weder Zeit noch Geld."},
        {"german": "entweder ... oder", "english": "either ... or", "example": "Entweder du kommst mit, oder du bleibst hier."},
        {"german": "nicht nur ... sondern auch", "english": "not only ... but also", "example": "Er ist nicht nur intelligent, sondern auch fleißig."},
        {"german": "je ... desto/umso", "english": "the ... the", "example": "Je mehr ich lerne, desto besser verstehe ich."},
        {"german": "zwar ... aber", "english": "indeed ... but", "example": "Er ist zwar reich, aber nicht glücklich."}
      ]
    },
    {
      "rule": "Infinitivsätze mit zu",
      "explanation": "Used after certain verbs, adjectives, and nouns",
      "triggers": ["versuchen", "hoffen", "beginnen", "aufhören", "vorhaben", "die Möglichkeit", "die Absicht"],
      "examples": [
        {"german": "Ich hoffe, dich bald zu sehen.", "english": "I hope to see you soon."},
        {"german": "Es ist wichtig, pünktlich zu sein.", "english": "It is important to be punctual."},
        {"german": "Ich habe vor, morgen früh aufzustehen.", "english": "I plan to get up early tomorrow."}
      ]
    },
    {
      "rule": "um ... zu / ohne ... zu / anstatt ... zu",
      "explanation": "Purpose, manner, and alternative infinitive clauses",
      "examples": [
        {"german": "Ich lerne Deutsch, um in Deutschland zu arbeiten.", "english": "I learn German in order to work in Germany."},
        {"german": "Er ging, ohne sich zu verabschieden.", "english": "He left without saying goodbye."},
        {"german": "Anstatt zu arbeiten, schläft er.", "english": "Instead of working, he sleeps."}
      ]
    }
  ],
  "exercises": [
    {
      "type": "sentence_building",
      "instruction": "Verbinden Sie die Sätze mit der angegebenen Konjunktion:",
      "items": [
        {"sentences": ["Er ist müde.", "Er arbeitet weiter."], "conjunction": "zwar ... aber", "answer": "Er ist zwar müde, aber er arbeitet weiter."},
        {"sentences": ["Ich lerne viel.", "Ich verstehe mehr."], "conjunction": "je ... desto", "answer": "Je mehr ich lerne, desto mehr verstehe ich."}
      ]
    }
  ],
  "telc_relevance": "Essential for achieving B2-level sentence complexity in writing and speaking"
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 6) AND lesson_number = 5;