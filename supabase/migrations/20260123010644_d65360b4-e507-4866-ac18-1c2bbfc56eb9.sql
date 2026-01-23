-- Update Week 2: Reading Comprehension I with detailed TELC-aligned content
UPDATE course_lessons SET content = jsonb_build_object(
  'topics', ARRAY['leseverstehen_teil1', 'global_reading', 'main_idea'],
  'skill', 'reading_comprehension',
  'telc_section', 'Leseverstehen',
  'learning_objectives', ARRAY[
    'Identify main ideas and supporting details in texts',
    'Apply skimming and scanning techniques',
    'Understand authentic German texts on everyday topics'
  ],
  'detailed_content', jsonb_build_object(
    'introduction', 'The TELC B2 Leseverstehen section tests your ability to understand written German at an upper-intermediate level. This lesson focuses on Teil 1: understanding the main message of short texts.',
    'telc_format', jsonb_build_object(
      'section', 'Leseverstehen Teil 1',
      'task_type', 'Match headlines to short texts',
      'num_items', 5,
      'time_suggestion', '10 minutes',
      'max_points', 15
    ),
    'reading_strategies', jsonb_build_array(
      jsonb_build_object(
        'name', 'Skimming',
        'german', 'Überfliegen',
        'purpose', 'Get the general idea quickly',
        'how_to', 'Read first and last sentences, look at headings, scan for keywords',
        'when_to_use', 'First read-through to understand the topic'
      ),
      jsonb_build_object(
        'name', 'Scanning',
        'german', 'Gezieltes Suchen',
        'purpose', 'Find specific information',
        'how_to', 'Look for names, dates, numbers, keywords from questions',
        'when_to_use', 'When you need to find a specific detail'
      ),
      jsonb_build_object(
        'name', 'Intensive Reading',
        'german', 'Intensives Lesen',
        'purpose', 'Understand every detail',
        'how_to', 'Read slowly, note unknown words, analyze sentence structure',
        'when_to_use', 'For complex passages or when answers are not obvious'
      )
    ),
    'sample_text', jsonb_build_object(
      'title', 'Homeoffice: Vor- und Nachteile',
      'text', 'Seit der Corona-Pandemie arbeiten immer mehr Menschen von zu Hause aus. Das sogenannte Homeoffice bietet viele Vorteile: Man spart Zeit und Geld für den Arbeitsweg, kann seine Arbeitszeit flexibler einteilen und hat mehr Zeit für die Familie. Allerdings gibt es auch Nachteile. Viele Arbeitnehmer klagen über Einsamkeit und mangelnden Kontakt zu Kollegen. Außerdem fällt es manchen schwer, Arbeit und Privatleben zu trennen, wenn beides am selben Ort stattfindet.',
      'questions', jsonb_build_array(
        jsonb_build_object('question', 'Was ist der Hauptgedanke des Textes?', 'options', ARRAY['Homeoffice hat nur Vorteile', 'Homeoffice hat sowohl Vor- als auch Nachteile', 'Niemand möchte im Homeoffice arbeiten', 'Homeoffice ist die Zukunft der Arbeit'], 'correct', 1),
        jsonb_build_object('question', 'Welcher Nachteil wird genannt?', 'options', ARRAY['Zu viel Arbeit', 'Technische Probleme', 'Isolation von Kollegen', 'Niedrigeres Gehalt'], 'correct', 2)
      )
    ),
    'key_vocabulary', jsonb_build_array(
      jsonb_build_object('german', 'der Arbeitsweg', 'english', 'commute to work'),
      jsonb_build_object('german', 'flexibel einteilen', 'english', 'to organize flexibly'),
      jsonb_build_object('german', 'klagen über', 'english', 'to complain about'),
      jsonb_build_object('german', 'mangelnder Kontakt', 'english', 'lack of contact'),
      jsonb_build_object('german', 'trennen', 'english', 'to separate')
    ),
    'telc_tips', ARRAY[
      'Read the headlines/options BEFORE reading the texts',
      'Underline keywords in both texts and options',
      'Watch out for distractors - answers that seem correct but miss the main point',
      'Don''t spend more than 2 minutes per text on first reading'
    ]
  )
) WHERE module_id = 'fe804135-dce0-4aa0-a6bb-198293b685eb' AND lesson_number = 1;

-- Update Week 3: Listening Skills I
UPDATE course_lessons SET content = jsonb_build_object(
  'topics', ARRAY['hoerverstehen_teil1', 'note_taking', 'audio_comprehension'],
  'skill', 'listening_comprehension',
  'telc_section', 'Hörverstehen',
  'learning_objectives', ARRAY[
    'Understand announcements and short messages',
    'Take effective notes while listening',
    'Identify key information from audio'
  ],
  'detailed_content', jsonb_build_object(
    'introduction', 'The TELC B2 Hörverstehen section tests your ability to understand spoken German. This lesson focuses on Teil 1: understanding announcements and extracting key information.',
    'telc_format', jsonb_build_object(
      'section', 'Hörverstehen Teil 1',
      'task_type', 'Listen and answer multiple choice questions',
      'num_items', 10,
      'time_suggestion', 'Audio plays twice',
      'max_points', 25
    ),
    'listening_strategies', jsonb_build_array(
      jsonb_build_object(
        'name', 'Prediction',
        'german', 'Vorhersage',
        'how_to', 'Before listening, read questions and predict possible answers',
        'benefit', 'Helps you focus on relevant information'
      ),
      jsonb_build_object(
        'name', 'Note-taking',
        'german', 'Notizen machen',
        'how_to', 'Write keywords, numbers, names - not full sentences',
        'benefit', 'Helps remember details for answering'
      ),
      jsonb_build_object(
        'name', 'First vs Second Listen',
        'how_to', 'First: get general understanding. Second: verify and complete answers',
        'benefit', 'Don''t panic if you miss something the first time'
      )
    ),
    'common_audio_types', jsonb_build_array(
      jsonb_build_object('type', 'Ansagen', 'english', 'Announcements', 'examples', ARRAY['Train station announcements', 'Flight information', 'Store announcements']),
      jsonb_build_object('type', 'Nachrichten', 'english', 'News', 'examples', ARRAY['Radio news', 'Weather reports', 'Traffic updates']),
      jsonb_build_object('type', 'Anrufbeantworter', 'english', 'Voicemail', 'examples', ARRAY['Appointment confirmations', 'Business messages', 'Personal messages'])
    ),
    'practice_transcript', jsonb_build_object(
      'context', 'Ansage am Bahnhof',
      'text', 'Achtung auf Gleis 3! Der ICE 574 nach München Hauptbahnhof, planmäßige Abfahrt 14:35 Uhr, wird heute ca. 15 Minuten später eintreffen. Wir bitten um Ihr Verständnis.',
      'key_info', jsonb_build_object(
        'train', 'ICE 574',
        'destination', 'München Hauptbahnhof',
        'platform', 'Gleis 3',
        'scheduled_time', '14:35',
        'delay', '15 Minuten'
      )
    ),
    'telc_tips', ARRAY[
      'Listen for stressed words - they often contain the answer',
      'Numbers and times are frequently tested - practice listening for these',
      'Common distractors: similar-sounding words or related but incorrect information',
      'If you miss something, don''t panic - the audio plays twice'
    ]
  )
) WHERE module_id = 'b95e71eb-d2f5-446a-92b9-5cd960d5733c' AND lesson_number = 1;

-- Update Week 4: Writing Fundamentals 
UPDATE course_lessons SET content = jsonb_build_object(
  'topics', ARRAY['formal_letter', 'beschwerde', 'anfrage'],
  'skill', 'formal_writing',
  'telc_section', 'Schriftlicher Ausdruck',
  'learning_objectives', ARRAY[
    'Write formal letters with correct structure and register',
    'Use appropriate opening and closing formulas',
    'Express complaints and requests professionally'
  ],
  'detailed_content', jsonb_build_object(
    'introduction', 'The TELC B2 Schriftlicher Ausdruck requires you to write a formal text of about 150-180 words. This lesson teaches you the structure and phrases for formal German letters.',
    'telc_format', jsonb_build_object(
      'section', 'Schriftlicher Ausdruck',
      'task_type', 'Write a formal letter based on given situation',
      'word_count', '150-180 words',
      'time_suggestion', '30 minutes',
      'max_points', 45
    ),
    'letter_structure', jsonb_build_object(
      'parts', jsonb_build_array(
        jsonb_build_object('name', 'Anrede', 'english', 'Greeting', 'examples', ARRAY['Sehr geehrte Damen und Herren,', 'Sehr geehrte Frau Müller,', 'Sehr geehrter Herr Schmidt,']),
        jsonb_build_object('name', 'Einleitung', 'english', 'Introduction', 'purpose', 'State your reason for writing', 'examples', ARRAY['ich schreibe Ihnen, weil...', 'bezugnehmend auf Ihre Anzeige vom...', 'hiermit möchte ich mich über... beschweren']),
        jsonb_build_object('name', 'Hauptteil', 'english', 'Main Body', 'purpose', 'Develop your points with details', 'connectors', ARRAY['Erstens...', 'Zweitens...', 'Außerdem...', 'Darüber hinaus...']),
        jsonb_build_object('name', 'Schluss', 'english', 'Closing', 'purpose', 'Request action or summarize', 'examples', ARRAY['Ich bitte Sie daher, ...', 'Für Rückfragen stehe ich Ihnen gerne zur Verfügung.', 'Ich würde mich freuen, von Ihnen zu hören.']),
        jsonb_build_object('name', 'Grußformel', 'english', 'Farewell', 'examples', ARRAY['Mit freundlichen Grüßen', 'Hochachtungsvoll', 'Mit besten Grüßen'])
      )
    ),
    'useful_phrases', jsonb_build_object(
      'complaint', jsonb_build_array(
        jsonb_build_object('german', 'Ich möchte mich über ... beschweren', 'english', 'I would like to complain about...'),
        jsonb_build_object('german', 'Leider muss ich feststellen, dass...', 'english', 'Unfortunately I have to note that...'),
        jsonb_build_object('german', 'Das entspricht nicht meinen Erwartungen', 'english', 'This does not meet my expectations'),
        jsonb_build_object('german', 'Ich fordere Sie auf, ...', 'english', 'I request that you...')
      ),
      'request', jsonb_build_array(
        jsonb_build_object('german', 'Ich wäre Ihnen sehr dankbar, wenn Sie...', 'english', 'I would be very grateful if you...'),
        jsonb_build_object('german', 'Könnten Sie mir bitte mitteilen, ...', 'english', 'Could you please inform me...'),
        jsonb_build_object('german', 'Ich bitte um Rückmeldung bis zum...', 'english', 'I request a response by...')
      )
    ),
    'sample_task', jsonb_build_object(
      'situation', 'Sie haben online einen Laptop bestellt. Nach 3 Wochen ist er immer noch nicht angekommen. Schreiben Sie eine Beschwerde an den Online-Shop.',
      'points_to_include', ARRAY['Bestelldatum und Bestellnummer', 'Das Problem beschreiben', 'Was Sie erwarten (Lieferung oder Erstattung)', 'Frist setzen']
    ),
    'telc_tips', ARRAY[
      'Address ALL points mentioned in the task - you lose points for missing any',
      'Use formal register throughout - no abbreviations or colloquial language',
      'Vary your sentence structure to show B2-level competence',
      'Leave 5 minutes to check for grammar and spelling errors'
    ]
  )
) WHERE module_id = '94954118-f439-4068-850d-00af442db251' AND lesson_number = 1;