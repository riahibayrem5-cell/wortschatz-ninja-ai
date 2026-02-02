-- Week 4: Writing Foundations - EXPANDED
-- Lesson 1: Schriftlicher Ausdruck Overview
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Schriftlicher Ausdruck',
  'telc_points', 45,
  'telc_time_minutes', 30,
  'learning_objectives', jsonb_build_array(
    'Understand the complete TELC B2 Schriftlicher Ausdruck format',
    'Master formal letter conventions and structure',
    'Apply the assessment criteria effectively',
    'Plan and organize writing time efficiently'
  ),
  'introduction', 'The Schriftlicher Ausdruck (Written Expression) section of TELC B2 requires you to write a formal letter of approximately 150 words in 30 minutes. You respond to a given situation (complaint, inquiry, application, etc.) and must address all points mentioned in the task. This lesson provides a complete overview of the section and assessment criteria.',
  'exam_format', jsonb_build_object(
    'title', 'Schriftlicher Ausdruck Format',
    'points', 45,
    'time', '30 minutes',
    'word_count', 'approximately 150 words',
    'task_type', 'Formal letter responding to a situation',
    'common_scenarios', jsonb_build_array('Complaint (Beschwerde)', 'Inquiry (Anfrage)', 'Application (Bewerbung)', 'Request (Bitte)', 'Response (Antwort)')
  ),
  'assessment_criteria', jsonb_build_object(
    'title', 'How Your Letter is Graded',
    'criteria', jsonb_build_array(
      jsonb_build_object('criterion', 'Task Completion', 'points', 18, 'description', 'Did you address all points in the task? Is the content appropriate and complete?'),
      jsonb_build_object('criterion', 'Communication', 'points', 9, 'description', 'Is your letter easy to understand? Does it flow logically? Is the register appropriate?'),
      jsonb_build_object('criterion', 'Language', 'points', 18, 'description', 'Grammar, vocabulary, spelling, and punctuation accuracy. Variety of structures.')
    )
  ),
  'letter_template', jsonb_build_object(
    'title', 'Universal Formal Letter Template',
    'structure', jsonb_build_array(
      jsonb_build_object('part', 'Opening', 'word_count', '20-30 words', 'content', 'Greeting + reason for writing + reference to situation'),
      jsonb_build_object('part', 'Body', 'word_count', '80-100 words', 'content', 'Address each point from the task, provide details, express your position'),
      jsonb_build_object('part', 'Closing', 'word_count', '20-30 words', 'content', 'Request/expectation + thanks + formal closing')
    )
  ),
  'time_management', jsonb_build_object(
    'title', '30-Minute Writing Plan',
    'phases', jsonb_build_array(
      jsonb_build_object('phase', 'Planning', 'minutes', 5, 'actions', jsonb_build_array('Read task carefully', 'Underline key points', 'Note main ideas for each point')),
      jsonb_build_object('phase', 'Writing', 'minutes', 20, 'actions', jsonb_build_array('Write introduction', 'Address all task points', 'Write conclusion')),
      jsonb_build_object('phase', 'Review', 'minutes', 5, 'actions', jsonb_build_array('Check grammar and spelling', 'Verify all points addressed', 'Count words (approximately)'))
    )
  ),
  'telc_tips', jsonb_build_array(
    'Address ALL points in the task - missing points costs many marks',
    'Use formal register throughout: Sie, Konjunktiv II for requests',
    'Write at least 150 words - significantly less may affect your score',
    'Leave time for proofreading - correct obvious errors',
    'Use paragraphs to organize your letter clearly'
  )
)
WHERE lesson_number = 1 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 4);

-- Week 4, Lesson 2: Beschwerde (Complaint Letter)
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Schriftlicher Ausdruck',
  'telc_points', 45,
  'telc_time_minutes', 30,
  'learning_objectives', jsonb_build_array(
    'Write effective formal complaint letters in German',
    'Express dissatisfaction politely but firmly',
    'State problems clearly and request specific solutions',
    'Use appropriate vocabulary for complaints'
  ),
  'introduction', 'The Beschwerde (complaint letter) is one of the most common task types in TELC B2 Schriftlicher Ausdruck. You must describe a problem, express your dissatisfaction appropriately, and request a specific solution. The key is to be firm but polite.',
  'letter_structure', jsonb_build_object(
    'title', 'Complaint Letter Structure',
    'sections', jsonb_build_array(
      jsonb_build_object('section', 'Opening', 'purpose', 'State that you are complaining and about what', 'example', 'Ich schreibe Ihnen, weil ich mich über [Problem] beschweren möchte.'),
      jsonb_build_object('section', 'Problem Description', 'purpose', 'Describe what happened, when, and the impact', 'example', 'Am [Datum] habe ich [Produkt/Dienstleistung] bestellt/erhalten. Leider...'),
      jsonb_build_object('section', 'Your Expectation', 'purpose', 'State what you want as resolution', 'example', 'Ich erwarte, dass Sie... / Ich bitte Sie, mir... zurückzuerstatten.'),
      jsonb_build_object('section', 'Closing', 'purpose', 'Set a deadline if appropriate, formal closing', 'example', 'Ich erwarte Ihre Antwort bis zum [Datum].')
    )
  ),
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Complaint Vocabulary',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'sich beschweren über + Akk.', 'english', 'to complain about'),
        jsonb_build_object('german', 'reklamieren', 'english', 'to make a complaint/claim'),
        jsonb_build_object('german', 'der Mangel', 'english', 'defect', 'example', 'Das Produkt weist mehrere Mängel auf.'),
        jsonb_build_object('german', 'die Beanstandung', 'english', 'complaint/objection'),
        jsonb_build_object('german', 'enttäuscht sein von', 'english', 'to be disappointed by'),
        jsonb_build_object('german', 'unzufrieden sein mit', 'english', 'to be dissatisfied with')
      )
    ),
    jsonb_build_object(
      'theme', 'Problem Description',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Das Produkt ist beschädigt/defekt.', 'english', 'The product is damaged/defective.'),
        jsonb_build_object('german', 'Die Lieferung war verspätet.', 'english', 'The delivery was delayed.'),
        jsonb_build_object('german', 'Der Service war mangelhaft.', 'english', 'The service was inadequate.'),
        jsonb_build_object('german', 'Dies entspricht nicht meinen Erwartungen.', 'english', 'This does not meet my expectations.'),
        jsonb_build_object('german', 'Trotz mehrmaliger Versuche...', 'english', 'Despite several attempts...')
      )
    ),
    jsonb_build_object(
      'theme', 'Requesting Solutions',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Ich bitte um Erstattung des Kaufpreises.', 'english', 'I request a refund of the purchase price.'),
        jsonb_build_object('german', 'Ich erwarte einen Umtausch.', 'english', 'I expect an exchange.'),
        jsonb_build_object('german', 'Ich fordere eine Entschädigung.', 'english', 'I demand compensation.'),
        jsonb_build_object('german', 'Bitte teilen Sie mir mit, wie Sie das Problem lösen werden.', 'english', 'Please inform me how you will resolve the problem.')
      )
    )
  ),
  'sample_outline', jsonb_build_object(
    'scenario', 'You ordered a laptop online, it arrived damaged, and customer service has not responded.',
    'outline', jsonb_build_array(
      '1. Betreff: Beschwerde - Beschädigtes Notebook, Bestellnr. 12345',
      '2. Anrede: Sehr geehrte Damen und Herren,',
      '3. Einleitung: Reference order, state complaint',
      '4. Problem: Describe damage, mention unanswered calls',
      '5. Forderung: Request replacement or refund within 14 days',
      '6. Schluss: Mit freundlichen Grüßen'
    )
  ),
  'telc_tips', jsonb_build_array(
    'Be firm but polite - avoid aggressive language',
    'Include specific details: dates, order numbers, names',
    'State clearly what resolution you expect',
    'Set a reasonable deadline for response',
    'Use Konjunktiv II for polite requests: Ich wäre Ihnen dankbar, wenn...'
  )
)
WHERE lesson_number = 2 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 4);

-- Week 4, Lesson 3: Anfrage (Inquiry Letter)
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Schriftlicher Ausdruck',
  'telc_points', 45,
  'telc_time_minutes', 30,
  'learning_objectives', jsonb_build_array(
    'Write formal inquiry letters requesting information',
    'Ask clear, specific questions',
    'Express interest professionally',
    'Use polite question forms and Konjunktiv II'
  ),
  'introduction', 'The Anfrage (inquiry letter) asks for information about products, services, courses, or opportunities. You need to express your interest, ask specific questions, and request a response. This type appears frequently in TELC B2.',
  'letter_structure', jsonb_build_object(
    'title', 'Inquiry Letter Structure',
    'sections', jsonb_build_array(
      jsonb_build_object('section', 'Opening', 'purpose', 'Explain why you are writing and what you are interested in', 'example', 'Mit großem Interesse habe ich Ihre Anzeige gelesen...'),
      jsonb_build_object('section', 'Questions', 'purpose', 'Ask specific questions about what you need to know', 'example', 'Könnten Sie mir bitte mitteilen, ob...'),
      jsonb_build_object('section', 'Request', 'purpose', 'Ask for materials or further action', 'example', 'Ich wäre Ihnen dankbar, wenn Sie mir weitere Informationen zusenden könnten.'),
      jsonb_build_object('section', 'Closing', 'purpose', 'Thank for response, formal closing', 'example', 'Für Ihre Bemühungen danke ich Ihnen im Voraus.')
    )
  ),
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Expressing Interest',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Mit großem Interesse habe ich... gelesen/gehört.', 'english', 'With great interest I have read/heard...'),
        jsonb_build_object('german', 'Ich interessiere mich für...', 'english', 'I am interested in...'),
        jsonb_build_object('german', 'Ich beziehe mich auf Ihre Anzeige vom...', 'english', 'I refer to your advertisement from...'),
        jsonb_build_object('german', 'Ich wende mich an Sie, weil...', 'english', 'I am contacting you because...')
      )
    ),
    jsonb_build_object(
      'theme', 'Asking Questions Politely',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Könnten Sie mir bitte mitteilen...', 'english', 'Could you please inform me...'),
        jsonb_build_object('german', 'Ich hätte gern gewusst, ob...', 'english', 'I would like to know whether...'),
        jsonb_build_object('german', 'Wäre es möglich zu erfahren...', 'english', 'Would it be possible to find out...'),
        jsonb_build_object('german', 'Dürfte ich Sie fragen, wann...', 'english', 'May I ask you when...')
      )
    ),
    jsonb_build_object(
      'theme', 'Requesting Information',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Ich bitte um Zusendung von Unterlagen.', 'english', 'I request that you send me documentation.'),
        jsonb_build_object('german', 'Könnten Sie mir einen Katalog schicken?', 'english', 'Could you send me a catalog?'),
        jsonb_build_object('german', 'Ich wäre Ihnen sehr dankbar für nähere Informationen.', 'english', 'I would be very grateful for more information.')
      )
    )
  ),
  'common_topics', jsonb_build_array(
    jsonb_build_object('topic', 'Course inquiry', 'questions', jsonb_build_array('Start date?', 'Course fees?', 'Prerequisites?', 'Certificate?')),
    jsonb_build_object('topic', 'Product inquiry', 'questions', jsonb_build_array('Availability?', 'Price?', 'Delivery time?', 'Warranty?')),
    jsonb_build_object('topic', 'Service inquiry', 'questions', jsonb_build_array('Opening hours?', 'Appointments?', 'Costs?', 'Location?'))
  ),
  'telc_tips', jsonb_build_array(
    'Use Konjunktiv II for polite questions: Könnten Sie... / Wäre es möglich...',
    'Ask specific, focused questions - not too many',
    'Show genuine interest in the opening',
    'Always thank for the anticipated response',
    'Request specific materials or actions if appropriate'
  )
)
WHERE lesson_number = 3 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 4);

-- Week 4, Lessons 4-5: Bewerbung and Proofreading
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Schriftlicher Ausdruck',
  'telc_points', 45,
  'telc_time_minutes', 30,
  'learning_objectives', jsonb_build_array(
    'Write compelling application letters in German',
    'Present qualifications and motivation effectively',
    'Use appropriate formal language for applications',
    'Structure a persuasive cover letter'
  ),
  'introduction', 'The Bewerbung (application letter) requires you to apply for a position, course, or opportunity. You must present your qualifications, express your motivation, and make a positive impression. This task tests your ability to write persuasively in formal German.',
  'letter_structure', jsonb_build_object(
    'title', 'Application Letter Structure',
    'sections', jsonb_build_array(
      jsonb_build_object('section', 'Opening', 'purpose', 'Reference the position and express interest', 'example', 'Mit großem Interesse habe ich Ihre Stellenanzeige gelesen und bewerbe mich hiermit um die Position als...'),
      jsonb_build_object('section', 'Qualifications', 'purpose', 'Present relevant experience and skills', 'example', 'Ich verfüge über [X] Jahre Berufserfahrung im Bereich...'),
      jsonb_build_object('section', 'Motivation', 'purpose', 'Explain why you want this position/opportunity', 'example', 'Diese Position ist für mich besonders interessant, weil...'),
      jsonb_build_object('section', 'Closing', 'purpose', 'Request interview, express availability', 'example', 'Über eine Einladung zu einem Vorstellungsgespräch würde ich mich sehr freuen.')
    )
  ),
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Application Openings',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Hiermit bewerbe ich mich um...', 'english', 'I hereby apply for...'),
        jsonb_build_object('german', 'Bezugnehmend auf Ihre Anzeige...', 'english', 'Referring to your advertisement...'),
        jsonb_build_object('german', 'Mit großer Begeisterung habe ich erfahren, dass...', 'english', 'With great enthusiasm I learned that...')
      )
    ),
    jsonb_build_object(
      'theme', 'Presenting Qualifications',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Ich verfüge über umfangreiche Erfahrung in...', 'english', 'I have extensive experience in...'),
        jsonb_build_object('german', 'Zu meinen Stärken gehören...', 'english', 'My strengths include...'),
        jsonb_build_object('german', 'Ich bringe fundierte Kenntnisse mit in...', 'english', 'I bring solid knowledge in...')
      )
    ),
    jsonb_build_object(
      'theme', 'Application Closings',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Über eine Einladung zum Gespräch würde ich mich freuen.', 'english', 'I would be pleased to receive an invitation for an interview.'),
        jsonb_build_object('german', 'Für Rückfragen stehe ich Ihnen gern zur Verfügung.', 'english', 'I am happy to answer any questions.'),
        jsonb_build_object('german', 'Ich freue mich auf Ihre positive Rückmeldung.', 'english', 'I look forward to your positive response.')
      )
    )
  ),
  'telc_tips', jsonb_build_array(
    'Be specific about your qualifications - don''t be vague',
    'Show enthusiasm without being excessive',
    'Always mention why you want THIS specific position',
    'End with a call to action (interview request)'
  )
)
WHERE lesson_number = 4 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 4);

UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Schriftlicher Ausdruck + Korrekturlesen',
  'telc_points', 56,
  'telc_time_minutes', 35,
  'learning_objectives', jsonb_build_array(
    'Develop effective proofreading strategies for German',
    'Identify common B2-level grammar errors',
    'Correct spelling and punctuation mistakes',
    'Apply systematic checking procedures'
  ),
  'introduction', 'Proofreading (Korrekturlesen) is essential both for your own writing and for Leseverstehen Teil 5, where you must find errors in a text. This lesson covers the most common errors at B2 level and systematic strategies for finding and correcting them.',
  'common_errors', jsonb_build_object(
    'title', 'Most Common Errors in B2 German',
    'categories', jsonb_build_array(
      jsonb_build_object('category', 'Articles and Cases', 'errors', jsonb_build_array('Wrong article gender', 'Wrong case after preposition', 'Adjective ending errors')),
      jsonb_build_object('category', 'Verb Forms', 'errors', jsonb_build_array('haben/sein confusion in Perfekt', 'Wrong verb conjugation', 'Incorrect Partizip II')),
      jsonb_build_object('category', 'Word Order', 'errors', jsonb_build_array('Verb not in position 2', 'Verb not at end in subordinate clause', 'Wrong position after conjunction')),
      jsonb_build_object('category', 'Spelling', 'errors', jsonb_build_array('ß vs. ss', 'Compound noun spelling', 'Capital letters for nouns'))
    )
  ),
  'proofreading_checklist', jsonb_build_object(
    'title', 'Systematic Proofreading Checklist',
    'steps', jsonb_build_array(
      jsonb_build_object('step', 1, 'check', 'Read for meaning', 'focus', 'Does each sentence make sense?'),
      jsonb_build_object('step', 2, 'check', 'Check verb positions', 'focus', 'Position 2 in main clause? End in subordinate?'),
      jsonb_build_object('step', 3, 'check', 'Verify articles and cases', 'focus', 'Correct gender? Case after preposition?'),
      jsonb_build_object('step', 4, 'check', 'Review adjective endings', 'focus', 'Match gender, number, case of noun?'),
      jsonb_build_object('step', 5, 'check', 'Scan for spelling', 'focus', 'Capital nouns? ß/ss? Common misspellings?')
    )
  ),
  'telc_tips', jsonb_build_array(
    'In Teil 5 (Korrekturlesen), each line has 0 or 1 error',
    'Read slowly and systematically - don''t skim',
    'Check preposition + case combinations carefully',
    'Remember: all German nouns are capitalized',
    'Common trick: wrong conjunction or connector'
  )
)
WHERE lesson_number = 5 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 4);