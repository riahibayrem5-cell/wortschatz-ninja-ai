-- Week 3: Listening Excellence - EXPANDED
-- Lesson 1: Hörverstehen Teil 1 (Globalverstehen)
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Hörverstehen Teil 1',
  'telc_points', 25,
  'telc_time_minutes', 8,
  'learning_objectives', jsonb_build_array(
    'Master the matching strategy for Hörverstehen Teil 1',
    'Identify main ideas quickly from 5 short monologues',
    'Match speakers to appropriate statements',
    'Handle the one-time listening challenge effectively'
  ),
  'introduction', 'Hörverstehen Teil 1 (Globalverstehen) tests your ability to understand the main point of 5 short monologues. Each speaker talks for about 45-60 seconds. You hear each recording only ONCE, so focused listening is essential. You must match each speaker to one of 8 statements.',
  'exam_format', jsonb_build_object(
    'title', 'Teil 1 Format',
    'items', 5,
    'points', 25,
    'plays', 'Once only!',
    'statements', 8,
    'speaker_time', '45-60 seconds each',
    'task', 'Match each of 5 speakers to one of 8 statements. 3 statements are distractors.'
  ),
  'strategy', jsonb_build_object(
    'title', 'Step-by-Step Strategy',
    'steps', jsonb_build_array(
      jsonb_build_object('step', 1, 'action', 'Use the preparation time wisely', 'detail', 'Read all 8 statements and underline key words before audio starts'),
      jsonb_build_object('step', 2, 'action', 'Focus on the main message', 'detail', 'Don''t try to understand every word - listen for the overall point'),
      jsonb_build_object('step', 3, 'action', 'Listen for attitude and emotion', 'detail', 'Is the speaker positive, negative, neutral, excited, concerned?'),
      jsonb_build_object('step', 4, 'action', 'Make quick decisions', 'detail', 'Match as soon as you''re confident - you won''t hear it again'),
      jsonb_build_object('step', 5, 'action', 'Move on if uncertain', 'detail', 'Don''t let one missed answer affect the next speaker')
    )
  ),
  'common_speaker_topics', jsonb_build_array(
    jsonb_build_object('topic', 'Work experiences', 'key_phrases', jsonb_build_array('In meinem Beruf...', 'Als ich angefangen habe...', 'Meine Kollegen...')),
    jsonb_build_object('topic', 'Life decisions', 'key_phrases', jsonb_build_array('Ich habe beschlossen...', 'Das war die beste Entscheidung...', 'Rückblickend...')),
    jsonb_build_object('topic', 'Opinions on trends', 'key_phrases', jsonb_build_array('Meiner Meinung nach...', 'Ich finde, dass...', 'Heutzutage...'))
  ),
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Opinion and Attitude Words',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'begeistert', 'english', 'enthusiastic', 'example', 'Ich bin begeistert von meiner neuen Arbeit.'),
        jsonb_build_object('german', 'enttäuscht', 'english', 'disappointed', 'example', 'Ich war enttäuscht vom Ergebnis.'),
        jsonb_build_object('german', 'skeptisch', 'english', 'skeptical', 'example', 'Ich bin da eher skeptisch.'),
        jsonb_build_object('german', 'überzeugt', 'english', 'convinced', 'example', 'Davon bin ich fest überzeugt.'),
        jsonb_build_object('german', 'zufrieden', 'english', 'satisfied', 'example', 'Im Großen und Ganzen bin ich zufrieden.')
      )
    )
  ),
  'telc_tips', jsonb_build_array(
    'You hear Teil 1 only ONCE - maximum concentration required!',
    'Read all 8 statements during preparation time',
    'Focus on main message, not every detail',
    '3 statements are distractors - they won''t match anyone',
    'Trust your first instinct - you can''t go back'
  )
)
WHERE lesson_number = 1 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 3);

-- Week 3, Lesson 2: Hörverstehen Teil 2 (Detailverstehen)
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Hörverstehen Teil 2',
  'telc_points', 25,
  'telc_time_minutes', 8,
  'learning_objectives', jsonb_build_array(
    'Answer Richtig/Falsch questions accurately based on audio',
    'Take effective notes during longer dialogues',
    'Identify speaker opinions and stated facts',
    'Handle negations and qualifiers in spoken German'
  ),
  'introduction', 'Hörverstehen Teil 2 presents a longer dialogue or interview (about 4-5 minutes). You must decide if 10 statements are Richtig (true) or Falsch (false) based on what you hear. You hear the recording twice.',
  'exam_format', jsonb_build_object(
    'title', 'Teil 2 Format',
    'items', 10,
    'points', 25,
    'plays', 'Twice',
    'audio_length', '4-5 minutes',
    'answer_type', 'Richtig / Falsch'
  ),
  'strategy', jsonb_build_object(
    'title', 'Two-Listen Strategy',
    'first_listen', jsonb_build_object(
      'focus', 'General understanding and noting key points',
      'actions', jsonb_build_array('Get the overall topic and speakers'' positions', 'Make preliminary answers', 'Note timestamps or keywords for unclear items')
    ),
    'second_listen', jsonb_build_object(
      'focus', 'Confirming answers and checking uncertain ones',
      'actions', jsonb_build_array('Verify your preliminary answers', 'Focus on statements you''re unsure about', 'Listen for exact wording for tricky items')
    )
  ),
  'common_traps', jsonb_build_array(
    jsonb_build_object('trap', 'Negations', 'example', 'Statement: Er hat keine Zeit. Audio: Er hat kaum Zeit. (Both could mean similar things!)'),
    jsonb_build_object('trap', 'Qualifiers', 'example', 'Statement: Sie geht immer joggen. Audio: Sie geht oft joggen. (Falsch - not always!)'),
    jsonb_build_object('trap', 'Opinions vs. facts', 'example', 'Statement: Das Produkt ist gut. Audio: Er findet das Produkt gut. (Opinion, not fact)')
  ),
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Qualifiers and Frequency Words',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'immer', 'english', 'always'),
        jsonb_build_object('german', 'meistens', 'english', 'mostly'),
        jsonb_build_object('german', 'oft/häufig', 'english', 'often'),
        jsonb_build_object('german', 'manchmal', 'english', 'sometimes'),
        jsonb_build_object('german', 'selten', 'english', 'rarely'),
        jsonb_build_object('german', 'nie/niemals', 'english', 'never'),
        jsonb_build_object('german', 'kaum', 'english', 'hardly')
      )
    )
  ),
  'telc_tips', jsonb_build_array(
    'Use first listening for general understanding, second for confirmation',
    'Watch for qualifiers that change meaning: immer, oft, manchmal, selten, nie',
    'Don''t confuse speaker opinions with facts',
    'Statements follow the order of information in the audio',
    'If unsure after both listenings, go with your gut'
  )
)
WHERE lesson_number = 2 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 3);

-- Week 3, Lesson 3: Hörverstehen Teil 3 (Selektivverstehen)
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Hörverstehen Teil 3',
  'telc_points', 25,
  'telc_time_minutes', 8,
  'learning_objectives', jsonb_build_array(
    'Complete forms and notes based on audio announcements',
    'Extract specific information: numbers, dates, names, places',
    'Predict information types before listening',
    'Write answers quickly and accurately'
  ),
  'introduction', 'Hörverstehen Teil 3 tests selective listening. You hear 5 short announcements or messages and must fill in missing information on a form or notepad. You hear each announcement twice.',
  'exam_format', jsonb_build_object(
    'title', 'Teil 3 Format',
    'items', 5,
    'points', 25,
    'plays', 'Twice',
    'task', 'Fill in missing information in a form, note, or table'
  ),
  'information_types', jsonb_build_array(
    jsonb_build_object('type', 'Numbers', 'examples', jsonb_build_array('Phone: 030 555 1234', 'Price: 25,50 €', 'Room: 305')),
    jsonb_build_object('type', 'Dates', 'examples', jsonb_build_array('Am 15. März', 'Vom 1. bis 5. April', 'Montag, 10:30 Uhr')),
    jsonb_build_object('type', 'Names', 'examples', jsonb_build_array('Herr Müller', 'Firma Schmidt GmbH', 'Hotel Sonnenschein')),
    jsonb_build_object('type', 'Places', 'examples', jsonb_build_array('Raum 205', 'Hauptbahnhof', 'Goethestraße 45'))
  ),
  'note_taking_techniques', jsonb_build_object(
    'title', 'Efficient Note-Taking',
    'tips', jsonb_build_array(
      jsonb_build_object('tip', 'Predict what you need', 'detail', 'Look at blanks before audio - what type of information is missing?'),
      jsonb_build_object('tip', 'Use abbreviations', 'detail', 'Mi = Mittwoch, Tel = Telefon, € = Euro'),
      jsonb_build_object('tip', 'Write numbers as digits', 'detail', 'Faster than spelling out words'),
      jsonb_build_object('tip', 'Check spelling on second listen', 'detail', 'Names especially may need correction')
    )
  ),
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Announcement Language',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'Sehr geehrte Fahrgäste', 'english', 'Dear passengers'),
        jsonb_build_object('german', 'Wir möchten Sie darauf hinweisen, dass...', 'english', 'We would like to inform you that...'),
        jsonb_build_object('german', 'Die Veranstaltung findet statt am...', 'english', 'The event takes place on...'),
        jsonb_build_object('german', 'Für Rückfragen erreichen Sie uns unter...', 'english', 'For questions, you can reach us at...'),
        jsonb_build_object('german', 'Bitte beachten Sie', 'english', 'Please note')
      )
    )
  ),
  'telc_tips', jsonb_build_array(
    'Predict information type before listening (date? name? number?)',
    'Use first listening to get the information, second to check/correct',
    'Numbers and dates are very common - listen carefully!',
    'Spelling counts - especially for names',
    'Write something even if unsure - blank = zero points'
  )
)
WHERE lesson_number = 3 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 3);

-- Week 3, Lessons 4-5: Academic Vocabulary and Note-taking
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Hörverstehen',
  'telc_points', 75,
  'telc_time_minutes', 20,
  'learning_objectives', jsonb_build_array(
    'Build vocabulary for academic and professional listening contexts',
    'Recognize formal vs. informal spoken German',
    'Understand technical and subject-specific vocabulary',
    'Apply vocabulary in real-world listening situations'
  ),
  'introduction', 'Academic and professional vocabulary is essential for understanding the complex spoken texts in TELC B2. This lesson focuses on vocabulary commonly used in educational, workplace, and media contexts that appear frequently in the Hörverstehen section.',
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Academic and Scientific',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'die Studie', 'article', 'die', 'plural', 'die Studien', 'english', 'study/research', 'example', 'Eine neue Studie zeigt, dass...'),
        jsonb_build_object('german', 'die Forschung', 'article', 'die', 'english', 'research', 'example', 'Die Forschung auf diesem Gebiet ist vielversprechend.'),
        jsonb_build_object('german', 'der Experte', 'article', 'der', 'plural', 'die Experten', 'english', 'expert', 'example', 'Laut Experten ist das Problem lösbar.'),
        jsonb_build_object('german', 'das Ergebnis', 'article', 'das', 'plural', 'die Ergebnisse', 'english', 'result', 'example', 'Die Ergebnisse waren überraschend.'),
        jsonb_build_object('german', 'die Untersuchung', 'article', 'die', 'plural', 'die Untersuchungen', 'english', 'investigation/examination', 'example', 'Die Untersuchung hat drei Jahre gedauert.'),
        jsonb_build_object('german', 'der Zusammenhang', 'article', 'der', 'plural', 'die Zusammenhänge', 'english', 'connection/context', 'example', 'Der Zusammenhang zwischen Stress und Gesundheit ist bekannt.'),
        jsonb_build_object('german', 'die Entwicklung', 'article', 'die', 'plural', 'die Entwicklungen', 'english', 'development', 'example', 'Diese Entwicklung war nicht vorhersehbar.')
      )
    ),
    jsonb_build_object(
      'theme', 'Media and News',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'laut', 'english', 'according to', 'example', 'Laut Bericht sind die Zahlen gestiegen.'),
        jsonb_build_object('german', 'berichten', 'english', 'to report', 'example', 'Die Medien berichten über den Vorfall.'),
        jsonb_build_object('german', 'der Bericht', 'article', 'der', 'plural', 'die Berichte', 'english', 'report', 'example', 'Der Bericht wurde veröffentlicht.'),
        jsonb_build_object('german', 'die Nachricht', 'article', 'die', 'plural', 'die Nachrichten', 'english', 'news/message', 'example', 'Die Nachrichten haben darüber berichtet.'),
        jsonb_build_object('german', 'aktuell', 'english', 'current', 'example', 'Aktuell gibt es keine neuen Informationen.')
      )
    )
  ),
  'telc_tips', jsonb_build_array(
    'Academic vocabulary appears in interviews and expert discussions',
    'Listen for signal phrases like "laut einer Studie", "Experten zufolge"',
    'News-style vocabulary is common in Teil 1 and Teil 2',
    'Practice with podcasts and radio programs in German'
  )
)
WHERE lesson_number = 4 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 3);

UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Hörverstehen',
  'telc_points', 75,
  'telc_time_minutes', 20,
  'learning_objectives', jsonb_build_array(
    'Develop advanced note-taking strategies for longer audio',
    'Create personal abbreviation systems',
    'Organize notes for quick reference during answer time',
    'Practice note-to-answer transfer efficiency'
  ),
  'introduction', 'Effective note-taking is crucial for Hörverstehen success, especially in Teil 2 and Teil 3. This lesson provides practical techniques for capturing key information quickly and organizing notes for efficient answer selection.',
  'note_taking_system', jsonb_build_object(
    'title', 'The 3-Column Note System',
    'explanation', 'Divide your paper into three columns for organized note-taking.',
    'columns', jsonb_build_array(
      jsonb_build_object('column', 'Facts', 'purpose', 'Concrete information: names, numbers, dates, places'),
      jsonb_build_object('column', 'Opinions', 'purpose', 'What speakers think or feel about topics'),
      jsonb_build_object('column', 'Actions/Plans', 'purpose', 'What was done, will be done, should be done')
    )
  ),
  'abbreviation_system', jsonb_build_object(
    'title', 'Recommended Abbreviations',
    'categories', jsonb_build_array(
      jsonb_build_object('category', 'Days', 'abbreviations', 'Mo Di Mi Do Fr Sa So'),
      jsonb_build_object('category', 'Time', 'abbreviations', 'h = Stunde, min = Minute, @ = um (time)'),
      jsonb_build_object('category', 'Quantity', 'abbreviations', '+ = mehr, - = weniger, ca. = circa, € = Euro'),
      jsonb_build_object('category', 'Connections', 'abbreviations', '→ = führt zu, ↔ = im Vergleich zu, ≠ = nicht gleich'),
      jsonb_build_object('category', 'Emotions', 'abbreviations', ':) = positiv, :( = negativ, ? = unsicher')
    )
  ),
  'transfer_tips', jsonb_build_array(
    'Keep notes brief but legible',
    'Use symbols and abbreviations you can read quickly',
    'Mark uncertain items with ? for second listen',
    'Number notes to match question numbers'
  ),
  'telc_tips', jsonb_build_array(
    'Practice note-taking with podcasts and radio',
    'Develop personal abbreviations you can read back',
    'Don''t try to write everything - focus on key information',
    'Leave space to add during second listening'
  )
)
WHERE lesson_number = 5 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 3);