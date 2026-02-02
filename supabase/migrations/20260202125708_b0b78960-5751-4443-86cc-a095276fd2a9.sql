-- Week 2, Lessons 1-5: Communication & Reading - EXPANDED
-- Lesson 1: Formal Communication
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Schriftlicher Ausdruck',
  'telc_points', 45,
  'telc_time_minutes', 30,
  'learning_objectives', jsonb_build_array(
    'Master formal letter structure for TELC B2 Schriftlicher Ausdruck',
    'Use appropriate greeting and closing formulas',
    'Apply Konjunktiv II for polite requests',
    'Handle all formal letter types: Beschwerde, Anfrage, Bewerbung'
  ),
  'introduction', 'Formal written communication is essential for the TELC B2 Schriftlicher Ausdruck section. You must write a formal letter (ca. 150 words) responding to a given situation. This lesson covers the structure, conventions, and language needed for successful formal correspondence in German.',
  'letter_structure', jsonb_build_object(
    'title', 'Formal Letter Structure (Formeller Brief)',
    'explanation', 'German formal letters follow a strict structure. Each element must be in the correct place.',
    'elements', jsonb_build_array(
      jsonb_build_object('element', 'Absender (Sender)', 'position', 'Top right or top left', 'example', 'Max Mustermann\nMusterstraße 12\n80331 München'),
      jsonb_build_object('element', 'Datum (Date)', 'position', 'Right side, below sender', 'example', 'München, den 15. März 2026', 'note', 'German format: day.month.year'),
      jsonb_build_object('element', 'Empfänger (Recipient)', 'position', 'Left side', 'example', 'Firma XY GmbH\nKundenservice\nHauptstraße 1\n10115 Berlin'),
      jsonb_build_object('element', 'Betreff (Subject)', 'position', 'Before greeting, bold or underlined', 'example', 'Betreff: Beschwerde über Lieferung Nr. 12345'),
      jsonb_build_object('element', 'Anrede (Greeting)', 'position', 'After subject', 'examples', jsonb_build_array('Sehr geehrte Damen und Herren,', 'Sehr geehrter Herr Müller,', 'Sehr geehrte Frau Schmidt,')),
      jsonb_build_object('element', 'Hauptteil (Body)', 'position', 'Main content in paragraphs', 'structure', '1. Reason for writing, 2. Details/Arguments, 3. Request/Conclusion'),
      jsonb_build_object('element', 'Grußformel (Closing)', 'position', 'After body', 'examples', jsonb_build_array('Mit freundlichen Grüßen', 'Hochachtungsvoll (very formal)', 'Mit freundlichem Gruß'))
    )
  ),
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Opening Phrases (Einleitungssätze)',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Ich schreibe Ihnen, weil...', 'english', 'I am writing to you because...'),
        jsonb_build_object('german', 'Mit Bezug auf Ihr Schreiben vom...', 'english', 'With reference to your letter of...'),
        jsonb_build_object('german', 'Ich beziehe mich auf unsere Telefonat vom...', 'english', 'I refer to our phone call on...'),
        jsonb_build_object('german', 'Hiermit möchte ich mich beschweren über...', 'english', 'I hereby wish to complain about...'),
        jsonb_build_object('german', 'Ich wende mich an Sie mit der Bitte um...', 'english', 'I am contacting you to request...')
      )
    ),
    jsonb_build_object(
      'theme', 'Polite Request Phrases (Höfliche Bitten)',
      'description', 'Use Konjunktiv II for polite requests - essential for B2!',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Könnten Sie mir bitte mitteilen...', 'english', 'Could you please inform me...'),
        jsonb_build_object('german', 'Ich wäre Ihnen sehr dankbar, wenn...', 'english', 'I would be very grateful if...'),
        jsonb_build_object('german', 'Wären Sie so freundlich, mir zu helfen?', 'english', 'Would you be so kind as to help me?'),
        jsonb_build_object('german', 'Ich würde Sie bitten, ... zu...', 'english', 'I would like to ask you to...'),
        jsonb_build_object('german', 'Es wäre mir möglich, wenn...', 'english', 'It would be possible for me if...')
      )
    ),
    jsonb_build_object(
      'theme', 'Closing Phrases (Schlusssätze)',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Für Ihre Bemühungen danke ich Ihnen im Voraus.', 'english', 'Thank you in advance for your efforts.'),
        jsonb_build_object('german', 'Ich freue mich auf Ihre baldige Antwort.', 'english', 'I look forward to your prompt reply.'),
        jsonb_build_object('german', 'Bei Rückfragen stehe ich Ihnen gern zur Verfügung.', 'english', 'I am happy to answer any questions.'),
        jsonb_build_object('german', 'Über eine positive Rückmeldung würde ich mich freuen.', 'english', 'I would be pleased to receive a positive response.')
      )
    )
  ),
  'letter_types', jsonb_build_array(
    jsonb_build_object('type', 'Beschwerdebrief', 'english', 'Complaint letter', 'structure', jsonb_build_array('State the problem clearly', 'Describe what happened and when', 'Express your dissatisfaction', 'State what you expect as resolution')),
    jsonb_build_object('type', 'Anfrage', 'english', 'Inquiry letter', 'structure', jsonb_build_array('Explain why you are writing', 'Ask specific questions', 'Request detailed information', 'Thank for anticipated response')),
    jsonb_build_object('type', 'Bewerbung', 'english', 'Application letter', 'structure', jsonb_build_array('Reference the job advertisement', 'Highlight relevant qualifications', 'Explain your motivation', 'Request an interview'))
  ),
  'telc_tips', jsonb_build_array(
    'Write 150 words minimum - practice counting!',
    'Always use Sie (formal you) unless specifically told otherwise',
    'Start with a clear reason for writing in the first sentence',
    'Use paragraph breaks for different topics',
    'End with a polite closing request or thanks',
    'Avoid contractions (don''t write "ich würde" as "ich würd")'
  )
)
WHERE lesson_number = 1 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 2);

-- Week 2, Lesson 2: Informal Communication
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Schriftlicher Ausdruck',
  'telc_points', 45,
  'telc_time_minutes', 30,
  'learning_objectives', jsonb_build_array(
    'Distinguish between formal and informal register in German',
    'Use appropriate greetings and closings for informal correspondence',
    'Express emotions and personal opinions naturally',
    'Handle informal letter topics: invitations, advice, personal updates'
  ),
  'introduction', 'While TELC B2 primarily tests formal writing, understanding informal communication helps you recognize register differences. Some exam tasks may ask you to write to a friend or respond to an informal situation. This lesson covers the conventions of informal German communication.',
  'grammar_focus', jsonb_build_object(
    'title', 'Formal vs. Informal: Key Differences',
    'comparison', jsonb_build_array(
      jsonb_build_object('aspect', 'Address', 'formal', 'Sie / Ihnen / Ihr', 'informal', 'du / dir / dein (singular), ihr / euch / euer (plural)'),
      jsonb_build_object('aspect', 'Greeting', 'formal', 'Sehr geehrte/r...', 'informal', 'Liebe/r..., Hallo..., Hi...'),
      jsonb_build_object('aspect', 'Closing', 'formal', 'Mit freundlichen Grüßen', 'informal', 'Liebe Grüße, Viele Grüße, Bis bald'),
      jsonb_build_object('aspect', 'Tone', 'formal', 'Objective, polite, distant', 'informal', 'Personal, warm, emotional'),
      jsonb_build_object('aspect', 'Vocabulary', 'formal', 'bezüglich, diesbezüglich, hiermit', 'informal', 'wegen, darüber, hier')
    )
  ),
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Informal Greetings and Closings',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Lieber/Liebe...', 'english', 'Dear... (informal)'),
        jsonb_build_object('german', 'Hallo...', 'english', 'Hello...'),
        jsonb_build_object('german', 'Liebe Grüße', 'english', 'Love / Best wishes'),
        jsonb_build_object('german', 'Viele Grüße', 'english', 'Best regards'),
        jsonb_build_object('german', 'Bis bald!', 'english', 'See you soon!'),
        jsonb_build_object('german', 'Mach''s gut!', 'english', 'Take care!')
      )
    ),
    jsonb_build_object(
      'theme', 'Expressing Emotions',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Ich freue mich riesig, dass...', 'english', 'I am really happy that...'),
        jsonb_build_object('german', 'Es tut mir total leid, dass...', 'english', 'I am really sorry that...'),
        jsonb_build_object('german', 'Ich bin so aufgeregt!', 'english', 'I am so excited!'),
        jsonb_build_object('german', 'Das ist ja super!', 'english', 'That is great!'),
        jsonb_build_object('german', 'Echt schade!', 'english', 'Really a pity!')
      )
    )
  ),
  'telc_tips', jsonb_build_array(
    'Even in informal writing, maintain clear structure and paragraphs',
    'Match the tone to the situation - not too casual for the exam',
    'Use emotional vocabulary but don''t overdo exclamation marks',
    'Address all points mentioned in the task'
  )
)
WHERE lesson_number = 2 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 2);

-- Week 2, Lesson 3: Reading Teil 1 (Globalverstehen)
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Leseverstehen Teil 1',
  'telc_points', 15,
  'telc_time_minutes', 15,
  'learning_objectives', jsonb_build_array(
    'Master the matching strategy for Leseverstehen Teil 1',
    'Quickly identify key information in short texts',
    'Match person descriptions to appropriate texts',
    'Avoid common traps in matching exercises'
  ),
  'introduction', 'Leseverstehen Teil 1 tests your ability to match 5 people (with specific needs or preferences) to 10 short texts (usually advertisements, notices, or announcements). You must find the most suitable match for each person. This task tests skimming and matching skills.',
  'exam_format', jsonb_build_object(
    'title', 'Teil 1 Format',
    'items', 5,
    'points', 15,
    'time_suggestion', '10-15 minutes',
    'task_description', 'You read descriptions of 5 people who are looking for something specific. Then you must match each person to one of 10 short texts.',
    'common_topics', jsonb_build_array('Course offerings', 'Job advertisements', 'Housing listings', 'Event announcements', 'Service providers')
  ),
  'strategy', jsonb_build_object(
    'title', 'Step-by-Step Strategy',
    'steps', jsonb_build_array(
      jsonb_build_object('step', 1, 'action', 'Read person descriptions first', 'detail', 'Underline key requirements: what, when, where, how much, special conditions'),
      jsonb_build_object('step', 2, 'action', 'Skim all 10 texts quickly', 'detail', 'Get a general idea of what each text offers'),
      jsonb_build_object('step', 3, 'action', 'Match easy ones first', 'detail', 'Some matches are obvious - do these to reduce options'),
      jsonb_build_object('step', 4, 'action', 'Check for ALL requirements', 'detail', 'A match must fulfill ALL criteria, not just some'),
      jsonb_build_object('step', 5, 'action', 'Eliminate impossible matches', 'detail', 'Cross out texts that clearly don''t fit anyone')
    )
  ),
  'common_traps', jsonb_build_array(
    jsonb_build_object('trap', 'Partial matches', 'explanation', 'A text may match some criteria but not all', 'example', 'Person wants an evening course that costs max 50€. Text A offers evening course for 80€ - NOT a match!'),
    jsonb_build_object('trap', 'Similar words', 'explanation', 'Two texts may seem similar but have crucial differences', 'example', 'Text offers "for beginners" but person has "some experience"'),
    jsonb_build_object('trap', 'Distractors', 'explanation', 'Some texts won''t match anyone - they are distractors', 'example', 'Text F might not be the right answer for any person')
  ),
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Advertisement Keywords',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'die Ermäßigung', 'english', 'discount', 'example', 'Studenten erhalten 20% Ermäßigung.'),
        jsonb_build_object('german', 'die Voraussetzung', 'english', 'requirement', 'example', 'Voraussetzung: Deutschkenntnisse B1'),
        jsonb_build_object('german', 'die Vorkenntnisse', 'english', 'prior knowledge', 'example', 'Keine Vorkenntnisse erforderlich.'),
        jsonb_build_object('german', 'die Anmeldung', 'english', 'registration', 'example', 'Anmeldung bis 15. März'),
        jsonb_build_object('german', 'die Teilnahme', 'english', 'participation', 'example', 'Teilnahme kostenlos')
      )
    )
  ),
  'telc_tips', jsonb_build_array(
    'Don''t spend more than 15 minutes on Teil 1',
    'ALL requirements must be met - partial matches are wrong',
    'Some texts (distractors) don''t match anyone',
    'Read numbers carefully: times, prices, dates',
    'Watch for negations in both person descriptions and texts'
  )
)
WHERE lesson_number = 3 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 2);

-- Week 2, Lesson 4: Reading Teil 2 (Detailverstehen)
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Leseverstehen Teil 2',
  'telc_points', 15,
  'telc_time_minutes', 20,
  'learning_objectives', jsonb_build_array(
    'Answer multiple-choice questions about longer texts accurately',
    'Locate specific information in dense German texts',
    'Distinguish between what the text says and what it implies',
    'Eliminate wrong answer options systematically'
  ),
  'introduction', 'Leseverstehen Teil 2 presents a longer text (article, report, or essay) followed by 5 multiple-choice questions. Each question has 3 options (a, b, c). This task tests your ability to understand detailed information and the author''s perspective.',
  'exam_format', jsonb_build_object(
    'title', 'Teil 2 Format',
    'items', 5,
    'points', 15,
    'time_suggestion', '15-20 minutes',
    'text_length', 'Approximately 500-600 words',
    'question_types', jsonb_build_array('Factual information', 'Author opinion', 'Implied meaning', 'Vocabulary in context')
  ),
  'strategy', jsonb_build_object(
    'title', 'Approach for Multiple Choice',
    'steps', jsonb_build_array(
      jsonb_build_object('step', 1, 'action', 'Read questions first (not options)', 'detail', 'Understand what information you need to find'),
      jsonb_build_object('step', 2, 'action', 'Read the text once for general understanding', 'detail', 'Don''t stop at unknown words - get the main idea'),
      jsonb_build_object('step', 3, 'action', 'For each question, find the relevant text section', 'detail', 'Questions usually follow the order of the text'),
      jsonb_build_object('step', 4, 'action', 'Read all three options carefully', 'detail', 'Sometimes two seem correct - look for subtle differences'),
      jsonb_build_object('step', 5, 'action', 'Match option to text evidence', 'detail', 'The correct answer is supported by the text, not your opinion')
    )
  ),
  'elimination_technique', jsonb_build_object(
    'title', 'How to Eliminate Wrong Answers',
    'types', jsonb_build_array(
      jsonb_build_object('type', 'Contradiction', 'description', 'Option directly contradicts the text'),
      jsonb_build_object('type', 'Not mentioned', 'description', 'Option contains information not in the text'),
      jsonb_build_object('type', 'Too extreme', 'description', 'Option uses always/never/all but text is more nuanced'),
      jsonb_build_object('type', 'Partial truth', 'description', 'Option is partly correct but missing key elements')
    )
  ),
  'telc_tips', jsonb_build_array(
    'Questions follow the order of information in the text',
    'The correct answer is often paraphrased, not a direct quote',
    'Watch for modifiers: sometimes, often, rarely, always',
    'If two options seem correct, re-read the relevant text section',
    'Don''t choose an answer just because words match - check meaning'
  )
)
WHERE lesson_number = 4 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 2);

-- Week 2, Lesson 5: Essential Connectors
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Sprachbausteine',
  'telc_points', 30,
  'telc_time_minutes', 20,
  'learning_objectives', jsonb_build_array(
    'Master all major German connectors (Konnektoren) for B2',
    'Understand the word order effects of different connector types',
    'Use connectors to express logical relationships',
    'Apply connectors in Sprachbausteine and Schriftlicher Ausdruck'
  ),
  'introduction', 'Connectors (Konnektoren) are essential for expressing logical relationships between ideas. In the TELC B2 exam, they appear frequently in Sprachbausteine and are needed for coherent writing. Understanding the three types - coordinating, subordinating, and adverbial connectors - is key to mastering German syntax.',
  'grammar_focus', jsonb_build_object(
    'title', 'Three Types of Connectors',
    'types', jsonb_build_array(
      jsonb_build_object('type', 'Konjunktionen (Position 0)', 'description', 'Connect clauses without changing word order', 'position', 'Does not count as position - verb stays 2nd', 'examples', jsonb_build_array('und', 'aber', 'oder', 'denn', 'sondern')),
      jsonb_build_object('type', 'Subjunktionen', 'description', 'Introduce subordinate clauses with verb at end', 'position', 'Verb moves to end of clause', 'examples', jsonb_build_array('weil', 'obwohl', 'wenn', 'dass', 'während', 'bevor', 'nachdem')),
      jsonb_build_object('type', 'Konjunktionaladverbien (Position 1)', 'description', 'Adverbs that connect ideas', 'position', 'Takes position 1, verb follows in position 2', 'examples', jsonb_build_array('deshalb', 'trotzdem', 'außerdem', 'jedoch', 'allerdings', 'deswegen'))
    )
  ),
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Cause and Effect',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'weil', 'type', 'Subjunktion', 'english', 'because', 'example', 'Ich bleibe zu Hause, weil ich krank bin.'),
        jsonb_build_object('german', 'denn', 'type', 'Konjunktion', 'english', 'because', 'example', 'Ich bleibe zu Hause, denn ich bin krank.'),
        jsonb_build_object('german', 'deshalb/deswegen', 'type', 'Adverb', 'english', 'therefore', 'example', 'Ich bin krank. Deshalb bleibe ich zu Hause.'),
        jsonb_build_object('german', 'daher', 'type', 'Adverb', 'english', 'hence', 'example', 'Die Kosten sind gestiegen, daher müssen wir sparen.')
      )
    ),
    jsonb_build_object(
      'theme', 'Contrast',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'obwohl', 'type', 'Subjunktion', 'english', 'although', 'example', 'Obwohl es regnet, gehen wir spazieren.'),
        jsonb_build_object('german', 'aber', 'type', 'Konjunktion', 'english', 'but', 'example', 'Ich bin müde, aber ich kann nicht schlafen.'),
        jsonb_build_object('german', 'trotzdem', 'type', 'Adverb', 'english', 'nevertheless', 'example', 'Es regnet. Trotzdem gehen wir spazieren.'),
        jsonb_build_object('german', 'jedoch/allerdings', 'type', 'Adverb', 'english', 'however', 'example', 'Das Produkt ist gut. Allerdings ist es teuer.')
      )
    ),
    jsonb_build_object(
      'theme', 'Addition',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'und', 'type', 'Konjunktion', 'english', 'and', 'example', 'Ich lerne Deutsch und ich arbeite.'),
        jsonb_build_object('german', 'außerdem', 'type', 'Adverb', 'english', 'besides/moreover', 'example', 'Das Hotel ist schön. Außerdem ist es günstig.'),
        jsonb_build_object('german', 'darüber hinaus', 'type', 'Phrase', 'english', 'furthermore', 'example', 'Darüber hinaus bieten wir kostenlose Beratung.')
      )
    ),
    jsonb_build_object(
      'theme', 'Condition',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'wenn', 'type', 'Subjunktion', 'english', 'if/when', 'example', 'Wenn ich Zeit habe, helfe ich dir.'),
        jsonb_build_object('german', 'falls', 'type', 'Subjunktion', 'english', 'in case', 'example', 'Falls du Fragen hast, ruf mich an.'),
        jsonb_build_object('german', 'sonst', 'type', 'Adverb', 'english', 'otherwise', 'example', 'Beeil dich, sonst kommen wir zu spät.')
      )
    )
  ),
  'telc_tips', jsonb_build_array(
    'In Sprachbausteine, check the word order after the connector to determine its type',
    'weil (verb end) and denn (verb 2nd) both mean "because" - don''t confuse them!',
    'Adverbial connectors (deshalb, trotzdem, außerdem) cause inversion',
    'Use connectors in Schriftlicher Ausdruck to show logical text structure',
    'Two-part connectors like "sowohl...als auch" are common in exam texts'
  )
)
WHERE lesson_number = 5 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 2);