-- Week 9: Writing Excellence - 5 Lessons
-- Lesson 1: Formal Letter Writing Mastery
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "writing",
  "telc_points": 45,
  "learning_objectives": [
    "Master formal letter structure and conventions",
    "Write effective Beschwerde (complaint) letters",
    "Write Bewerbung (application) letters",
    "Use appropriate register and formality"
  ],
  "formal_letter_structure": {
    "elements": [
      {"element": "Absender", "description": "Your address (top right)", "example": "Max Mustermann\nMusterstraße 1\n12345 Musterstadt"},
      {"element": "Empfänger", "description": "Recipient address (left)", "example": "Firma ABC GmbH\nKundenservice\nHauptstraße 10\n98765 Beispielstadt"},
      {"element": "Datum", "description": "Date (right aligned)", "example": "Berlin, den 15. März 2024"},
      {"element": "Betreff", "description": "Subject line (bold, no period)", "example": "Betreff: Beschwerde über fehlerhafte Lieferung"},
      {"element": "Anrede", "description": "Salutation", "examples": ["Sehr geehrte Damen und Herren,", "Sehr geehrter Herr Schmidt,", "Sehr geehrte Frau Müller,"]},
      {"element": "Einleitung", "description": "Opening paragraph - state purpose", "example": "ich wende mich an Sie, weil..."},
      {"element": "Hauptteil", "description": "Main content - details, arguments", "example": "Am 10. März bestellte ich... Leider musste ich feststellen, dass..."},
      {"element": "Schluss", "description": "Closing - request action, thank", "example": "Ich bitte Sie daher, das Problem zu lösen. Für Ihre Bemühungen danke ich Ihnen im Voraus."},
      {"element": "Grußformel", "description": "Closing salutation", "example": "Mit freundlichen Grüßen"},
      {"element": "Unterschrift", "description": "Your name", "example": "Max Mustermann"}
    ]
  },
  "vocabulary_sets": [
    {
      "theme": "Beschwerdebrief Phrasen",
      "words": [
        {"german": "Ich muss Ihnen leider mitteilen, dass...", "english": "I must unfortunately inform you that...", "usage": "Opening complaint"},
        {"german": "Zu meinem Bedauern musste ich feststellen...", "english": "To my regret, I had to notice...", "usage": "Expressing disappointment"},
        {"german": "Dies entspricht nicht meinen Erwartungen.", "english": "This does not meet my expectations.", "usage": "Stating dissatisfaction"},
        {"german": "Ich fordere Sie auf, das Problem zu beheben.", "english": "I request that you resolve the problem.", "usage": "Demanding action"},
        {"german": "Ich erwarte Ihre baldige Antwort.", "english": "I await your prompt response.", "usage": "Closing urgency"}
      ]
    },
    {
      "theme": "Bewerbungsbrief Phrasen",
      "words": [
        {"german": "ich bewerbe mich um die Stelle als...", "english": "I am applying for the position of...", "usage": "Opening application"},
        {"german": "Ihre Anzeige hat mein Interesse geweckt.", "english": "Your advertisement has sparked my interest.", "usage": "Reference to job posting"},
        {"german": "Ich verfüge über ... Jahre Erfahrung.", "english": "I have ... years of experience.", "usage": "Stating qualifications"},
        {"german": "Über die Einladung zu einem Vorstellungsgespräch würde ich mich freuen.", "english": "I would be pleased to receive an invitation for an interview.", "usage": "Closing application"}
      ]
    }
  ],
  "common_mistakes": [
    {"mistake": "Using du instead of Sie", "correction": "Always use Sie in formal letters"},
    {"mistake": "Starting with Ich", "correction": "Start with lowercase after comma: sehr geehrte..., ich..."},
    {"mistake": "Missing Betreff", "correction": "Always include a clear subject line"},
    {"mistake": "Too informal closing", "correction": "Use Mit freundlichen Grüßen (not Liebe Grüße)"}
  ],
  "telc_writing_criteria": [
    {"criterion": "Aufgabenbewältigung", "weight": "40%", "description": "All points addressed, appropriate format"},
    {"criterion": "Kommunikative Gestaltung", "weight": "20%", "description": "Coherent, well-structured, reader-friendly"},
    {"criterion": "Formale Richtigkeit", "weight": "40%", "description": "Grammar, spelling, punctuation"}
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 9) AND lesson_number = 1;

-- Lesson 2: Email Writing for Professional Contexts
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "writing",
  "learning_objectives": [
    "Write professional emails in German",
    "Handle inquiries and requests",
    "Write appropriate follow-ups",
    "Balance formality in digital communication"
  ],
  "email_structure": {
    "subject_line": {
      "tips": ["Be specific and clear", "Include reference numbers if relevant", "Keep under 50 characters"],
      "examples": ["Anfrage: Produktinformationen", "Rückmeldung zu Ihrer Nachricht vom 10.03.", "Terminbestätigung für Montag, 15.03."]
    },
    "salutations": {
      "formal": ["Sehr geehrte Damen und Herren,", "Sehr geehrter Herr Dr. Schmidt,"],
      "semi_formal": ["Guten Tag Frau Müller,", "Liebe Frau Weber,"],
      "note": "Email allows slightly less formal greetings than letters"
    },
    "closings": {
      "formal": ["Mit freundlichen Grüßen", "Mit besten Grüßen"],
      "semi_formal": ["Freundliche Grüße", "Beste Grüße"],
      "informal_business": ["Viele Grüße", "Herzliche Grüße"]
    }
  },
  "vocabulary_sets": [
    {
      "theme": "Email-Standardformulierungen",
      "words": [
        {"german": "Vielen Dank für Ihre E-Mail vom...", "english": "Thank you for your email of...", "usage": "Acknowledging receipt"},
        {"german": "Ich beziehe mich auf unser Telefonat vom...", "english": "I am referring to our phone call of...", "usage": "Reference to conversation"},
        {"german": "Anbei finden Sie...", "english": "Please find attached...", "usage": "Mentioning attachments"},
        {"german": "Falls Sie Fragen haben, stehe ich Ihnen gerne zur Verfügung.", "english": "If you have questions, I am happy to help.", "usage": "Offering assistance"},
        {"german": "Ich wäre Ihnen dankbar, wenn Sie...", "english": "I would be grateful if you...", "usage": "Polite request"}
      ]
    }
  ],
  "email_scenarios": [
    {
      "type": "Terminanfrage",
      "example_opening": "ich möchte gerne einen Termin mit Ihnen vereinbaren.",
      "key_elements": ["Specify purpose", "Suggest dates/times", "Ask for confirmation"]
    },
    {
      "type": "Informationsanfrage",
      "example_opening": "ich interessiere mich für Ihre Dienstleistungen und hätte einige Fragen.",
      "key_elements": ["State what you need", "List specific questions", "Thank in advance"]
    }
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 9) AND lesson_number = 2;

-- Lesson 3: Argumentative Writing
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "writing",
  "learning_objectives": [
    "Structure argumentative texts effectively",
    "Present thesis and supporting arguments",
    "Integrate counterarguments",
    "Write convincing conclusions"
  ],
  "argumentative_structure": {
    "einleitung": {
      "purpose": "Introduce topic and state thesis",
      "techniques": ["Start with a provocative question", "Use a relevant statistic", "Present a common misconception"],
      "example": "Immer mehr Menschen arbeiten von zu Hause aus. Doch ist das Homeoffice wirklich die Zukunft der Arbeit?"
    },
    "hauptteil": {
      "purpose": "Present arguments with evidence",
      "structure": [
        {"step": "Argument 1", "format": "Claim → Evidence → Explanation"},
        {"step": "Argument 2", "format": "Claim → Example → Impact"},
        {"step": "Counterargument", "format": "Opponent view → Your rebuttal"}
      ],
      "example": "Ein wesentlicher Vorteil ist die Flexibilität. Studien zeigen, dass 67% der Arbeitnehmer... Kritiker argumentieren jedoch, dass..."
    },
    "schluss": {
      "purpose": "Summarize and reinforce thesis",
      "techniques": ["Restate main points briefly", "Offer a solution or outlook", "End with a memorable statement"],
      "example": "Zusammenfassend lässt sich sagen, dass das Homeoffice trotz einiger Nachteile mehr Vorteile bietet und sich als fester Bestandteil der modernen Arbeitswelt etablieren wird."
    }
  },
  "vocabulary_sets": [
    {
      "theme": "Argumentative Konnektoren",
      "words": [
        {"german": "Zunächst ist festzuhalten, dass...", "english": "First, it should be noted that...", "usage": "Introducing first point"},
        {"german": "Hinzu kommt, dass...", "english": "In addition, ...", "usage": "Adding argument"},
        {"german": "Dem ist entgegenzuhalten, dass...", "english": "Against this, one could argue that...", "usage": "Introducing counter"},
        {"german": "Allerdings darf nicht übersehen werden, dass...", "english": "However, one must not overlook that...", "usage": "Conceding a point"},
        {"german": "Letztendlich überwiegen die Vorteile.", "english": "Ultimately, the advantages outweigh.", "usage": "Concluding"}
      ]
    }
  ],
  "practice_topics": [
    "Sollte Social Media für Kinder verboten werden?",
    "Homeoffice: Fluch oder Segen?",
    "Ist ein Tempolimit auf Autobahnen sinnvoll?",
    "Sollte Plastik komplett verboten werden?"
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 9) AND lesson_number = 3;

-- Lesson 4: Error Correction and Self-Editing
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "writing",
  "learning_objectives": [
    "Identify and correct common errors",
    "Develop effective proofreading strategies",
    "Use a systematic editing checklist",
    "Improve overall writing accuracy"
  ],
  "common_error_categories": {
    "grammatik": [
      {"error": "Kasus nach Präpositionen", "wrong": "wegen dem Wetter", "correct": "wegen des Wetters", "rule": "wegen + Genitiv"},
      {"error": "Verbstellung im Nebensatz", "wrong": "..., weil ich habe keine Zeit.", "correct": "..., weil ich keine Zeit habe.", "rule": "Verb at end"},
      {"error": "Adjektivendungen", "wrong": "das neue Computer", "correct": "der neue Computer", "rule": "Check article agreement"}
    ],
    "rechtschreibung": [
      {"error": "Groß-/Kleinschreibung", "wrong": "ich Freue mich", "correct": "Ich freue mich", "rule": "Nouns capitalized, verbs not"},
      {"error": "dass vs. das", "wrong": "Ich denke, das er kommt.", "correct": "Ich denke, dass er kommt.", "rule": "dass = conjunction, das = article/pronoun"},
      {"error": "Zusammen-/Getrenntschreibung", "wrong": "kennen lernen", "correct": "kennenlernen", "rule": "Compound verbs"}
    ],
    "stil": [
      {"error": "Wiederholungen", "suggestion": "Use synonyms and pronouns to avoid repetition"},
      {"error": "Zu lange Sätze", "suggestion": "Break into shorter sentences for clarity"},
      {"error": "Umgangssprache", "suggestion": "Replace informal expressions in formal writing"}
    ]
  },
  "editing_checklist": {
    "first_pass": ["Check that all task points are addressed", "Verify appropriate format (letter, email, essay)"],
    "second_pass": ["Check verb conjugation and position", "Verify case usage (especially after prepositions)"],
    "third_pass": ["Check adjective endings", "Verify comma placement (before subordinate clauses)"],
    "final_pass": ["Read aloud for flow", "Check spelling of common mistakes"]
  },
  "vocabulary_sets": [
    {
      "theme": "Häufig verwechselte Wörter",
      "words": [
        {"german": "seid vs. seit", "english": "are (2nd pl.) vs. since", "usage": "Ihr seid nett. / Seit gestern regnet es."},
        {"german": "wen vs. wenn", "english": "whom vs. when/if", "usage": "Wen rufst du an? / Wenn du kommst..."},
        {"german": "wieder vs. wider", "english": "again vs. against", "usage": "Ich komme wieder. / Das ist wider die Regeln."}
      ]
    }
  ]
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 9) AND lesson_number = 4;

-- Lesson 5: Writing Exam Simulation
UPDATE public.course_lessons SET content = '{
  "detailed_content": true,
  "telc_section": "writing",
  "telc_points": 45,
  "learning_objectives": [
    "Complete a full writing exam under timed conditions",
    "Apply all writing strategies",
    "Manage time effectively",
    "Self-evaluate using TELC criteria"
  ],
  "exam_format": {
    "time": "30 minutes",
    "task_types": ["Formal letter (complaint, inquiry, application)", "Semi-formal email", "Argumentation on given topic"],
    "word_count": "150-180 words recommended"
  },
  "sample_exam_task": {
    "type": "Beschwerdebrief",
    "situation": "Sie haben online ein Smartphone bestellt. Nach zwei Wochen ist es immer noch nicht angekommen. Sie haben bereits angerufen, aber niemand konnte Ihnen helfen.",
    "tasks": [
      "Beschreiben Sie das Problem",
      "Erklären Sie, was Sie bereits unternommen haben",
      "Fordern Sie eine Lösung (Erstattung oder Lieferung)",
      "Setzen Sie eine Frist"
    ],
    "format": "Formeller Brief"
  },
  "time_management": {
    "planning": "5 minutes - Read task, note key points, plan structure",
    "writing": "20 minutes - Write your response, following your plan",
    "checking": "5 minutes - Proofread for errors, ensure all points covered"
  },
  "evaluation_rubric": {
    "aufgabenbewältigung": {
      "description": "All points addressed, appropriate format",
      "max_points": 18,
      "checkpoints": ["All 4 Leitpunkte addressed?", "Correct format (address, date, greeting, closing)?", "Appropriate length?"]
    },
    "kommunikative_gestaltung": {
      "description": "Coherent, well-structured, reader-friendly",
      "max_points": 9,
      "checkpoints": ["Logical flow?", "Clear paragraphing?", "Appropriate connectors?"]
    },
    "formale_richtigkeit": {
      "description": "Grammar, spelling, punctuation",
      "max_points": 18,
      "checkpoints": ["Verb forms correct?", "Cases correct?", "Spelling accurate?"]
    }
  }
}'::jsonb
WHERE module_id = (SELECT id FROM course_modules WHERE week_number = 9) AND lesson_number = 5;