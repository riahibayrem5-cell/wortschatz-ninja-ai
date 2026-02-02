-- Week 1, Lesson 1: Essential B2 Vocabulary Part 1 - EXPANDED with 30+ vocabulary items
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Sprachbausteine',
  'telc_points', 30,
  'telc_time_minutes', 20,
  'learning_objectives', jsonb_build_array(
    'Master 50+ essential B2-level vocabulary across professional and daily life contexts',
    'Understand and apply all four German grammatical cases correctly',
    'Recognize common TELC B2 vocabulary patterns and collocations',
    'Practice using new words in authentic German sentences'
  ),
  'introduction', 'Welcome to the foundation of your TELC B2 preparation! This comprehensive lesson introduces the most frequently tested vocabulary on the TELC B2 exam. The vocabulary has been carefully selected based on analysis of past exams and the official TELC B2 word list. You will learn words essential for the Leseverstehen (Reading), Hörverstehen (Listening), and especially the Sprachbausteine sections. Each word includes example sentences that mirror actual exam contexts.',
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Berufsleben (Professional Life)',
      'description', 'Essential vocabulary for discussing work, careers, and professional situations - a major topic in TELC B2.',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'die Bewerbung', 'article', 'die', 'plural', 'die Bewerbungen', 'english', 'application', 'example', 'Ich schreibe gerade eine Bewerbung für eine neue Stelle als Projektmanager.', 'telc_note', 'Frequently appears in Schriftlicher Ausdruck tasks'),
        jsonb_build_object('german', 'das Vorstellungsgespräch', 'article', 'das', 'plural', 'die Vorstellungsgespräche', 'english', 'job interview', 'example', 'Morgen habe ich ein wichtiges Vorstellungsgespräch bei einer internationalen Firma.'),
        jsonb_build_object('german', 'die Berufserfahrung', 'article', 'die', 'english', 'professional experience', 'example', 'Sie verfügt über zehn Jahre Berufserfahrung im Bereich Marketing und Kommunikation.'),
        jsonb_build_object('german', 'der Arbeitsvertrag', 'article', 'der', 'plural', 'die Arbeitsverträge', 'english', 'employment contract', 'example', 'Bevor Sie anfangen zu arbeiten, müssen Sie den Arbeitsvertrag sorgfältig durchlesen und unterschreiben.'),
        jsonb_build_object('german', 'kündigen', 'english', 'to resign/give notice', 'example', 'Er hat seine Stelle gekündigt, weil er eine bessere Möglichkeit im Ausland gefunden hat.'),
        jsonb_build_object('german', 'die Gehaltserhöhung', 'article', 'die', 'plural', 'die Gehaltserhöhungen', 'english', 'salary increase/raise', 'example', 'Nach zwei Jahren in der Firma hat sie endlich eine Gehaltserhöhung bekommen.'),
        jsonb_build_object('german', 'die Fortbildung', 'article', 'die', 'plural', 'die Fortbildungen', 'english', 'professional development/training', 'example', 'Die Firma bietet regelmäßige Fortbildungen für alle Mitarbeiter an.'),
        jsonb_build_object('german', 'der Arbeitgeber', 'article', 'der', 'plural', 'die Arbeitgeber', 'english', 'employer', 'example', 'Mein Arbeitgeber unterstützt flexible Arbeitszeiten und Homeoffice.'),
        jsonb_build_object('german', 'der Arbeitnehmer', 'article', 'der', 'plural', 'die Arbeitnehmer', 'english', 'employee', 'example', 'Alle Arbeitnehmer haben Anspruch auf mindestens 24 Urlaubstage pro Jahr.'),
        jsonb_build_object('german', 'die Überstunden', 'article', 'die', 'english', 'overtime (plural)', 'example', 'Wegen des wichtigen Projekts musste ich letzte Woche viele Überstunden machen.')
      )
    ),
    jsonb_build_object(
      'theme', 'Alltag und Freizeit (Daily Life & Leisure)',
      'description', 'Vocabulary for everyday situations and leisure activities, commonly tested in Hörverstehen and Leseverstehen.',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'der Alltag', 'article', 'der', 'english', 'everyday life', 'example', 'Im Alltag spreche ich hauptsächlich Deutsch mit meinen Kollegen und Nachbarn.'),
        jsonb_build_object('german', 'die Verabredung', 'article', 'die', 'plural', 'die Verabredungen', 'english', 'appointment/date', 'example', 'Ich habe heute Abend eine Verabredung mit alten Freunden aus der Universität.'),
        jsonb_build_object('german', 'sich erholen', 'english', 'to recover/relax', 'example', 'Am Wochenende erhole ich mich von der stressigen Arbeitswoche.'),
        jsonb_build_object('german', 'der Haushalt', 'article', 'der', 'english', 'household', 'example', 'Wir teilen uns die Arbeit im Haushalt: Ich koche, und mein Partner putzt.'),
        jsonb_build_object('german', 'entspannen', 'english', 'to relax', 'example', 'Nach einem langen Arbeitstag entspanne ich mich gern mit einem guten Buch.'),
        jsonb_build_object('german', 'die Unternehmung', 'article', 'die', 'plural', 'die Unternehmungen', 'english', 'activity/outing', 'example', 'Am Wochenende planen wir immer verschiedene Unternehmungen mit der Familie.'),
        jsonb_build_object('german', 'die Gewohnheit', 'article', 'die', 'plural', 'die Gewohnheiten', 'english', 'habit', 'example', 'Sport am Morgen ist eine gute Gewohnheit, die ich seit Jahren pflege.'),
        jsonb_build_object('german', 'die Leidenschaft', 'article', 'die', 'plural', 'die Leidenschaften', 'english', 'passion', 'example', 'Musik ist meine größte Leidenschaft – ich spiele seit meiner Kindheit Klavier.')
      )
    ),
    jsonb_build_object(
      'theme', 'Gesundheit und Wohlbefinden (Health & Well-being)',
      'description', 'Health vocabulary appears frequently in TELC B2 reading and listening comprehension sections.',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'die Behandlung', 'article', 'die', 'plural', 'die Behandlungen', 'english', 'treatment', 'example', 'Die Behandlung beim Arzt war sehr erfolgreich, und ich fühle mich viel besser.'),
        jsonb_build_object('german', 'die Untersuchung', 'article', 'die', 'plural', 'die Untersuchungen', 'english', 'examination/check-up', 'example', 'Ich habe nächste Woche eine Untersuchung beim Facharzt.'),
        jsonb_build_object('german', 'die Nebenwirkung', 'article', 'die', 'plural', 'die Nebenwirkungen', 'english', 'side effect', 'example', 'Das Medikament kann Nebenwirkungen wie Müdigkeit und Kopfschmerzen verursachen.'),
        jsonb_build_object('german', 'sich ausruhen', 'english', 'to rest', 'example', 'Der Arzt hat mir geraten, mich ein paar Tage auszuruhen.'),
        jsonb_build_object('german', 'die Ernährung', 'article', 'die', 'english', 'nutrition/diet', 'example', 'Eine ausgewogene Ernährung ist wichtig für die Gesundheit.'),
        jsonb_build_object('german', 'das Wohlbefinden', 'article', 'das', 'english', 'well-being', 'example', 'Regelmäßiger Sport trägt zum allgemeinen Wohlbefinden bei.'),
        jsonb_build_object('german', 'die Vorsorge', 'article', 'die', 'english', 'prevention/preventive care', 'example', 'Zur Vorsorge sollte man regelmäßig zum Zahnarzt gehen.')
      )
    ),
    jsonb_build_object(
      'theme', 'Bildung und Lernen (Education & Learning)',
      'description', 'Education vocabulary is essential for the TELC B2 exam context.',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'die Ausbildung', 'article', 'die', 'plural', 'die Ausbildungen', 'english', 'vocational training', 'example', 'Nach der Schule habe ich eine Ausbildung als Bankkaufmann gemacht.'),
        jsonb_build_object('german', 'das Studium', 'article', 'das', 'plural', 'die Studien', 'english', 'university studies', 'example', 'Mein Studium der Wirtschaftswissenschaften dauerte insgesamt fünf Jahre.'),
        jsonb_build_object('german', 'der Abschluss', 'article', 'der', 'plural', 'die Abschlüsse', 'english', 'degree/graduation', 'example', 'Mit einem guten Abschluss hat man bessere Chancen auf dem Arbeitsmarkt.'),
        jsonb_build_object('german', 'die Prüfung', 'article', 'die', 'plural', 'die Prüfungen', 'english', 'exam', 'example', 'Für die TELC B2 Prüfung muss man sowohl schriftlich als auch mündlich geprüft werden.'),
        jsonb_build_object('german', 'die Kenntnisse', 'article', 'die', 'english', 'knowledge/skills (plural)', 'example', 'Gute Deutschkenntnisse sind für viele Berufe in Deutschland erforderlich.'),
        jsonb_build_object('german', 'die Weiterbildung', 'article', 'die', 'plural', 'die Weiterbildungen', 'english', 'further education', 'example', 'Weiterbildung ist wichtig, um im Beruf aktuell zu bleiben.')
      )
    )
  ),
  'grammar_focus', jsonb_build_object(
    'title', 'Die vier Fälle: Nominativ, Akkusativ, Dativ, Genitiv',
    'explanation', 'German has four grammatical cases that determine the form of articles, pronouns, and adjective endings. Mastering cases is essential for the Sprachbausteine section of TELC B2, where you must choose correct articles and prepositions.',
    'rules', jsonb_build_array(
      jsonb_build_object('case', 'Nominativ', 'usage', 'Subject of the sentence - the person or thing performing the action', 'example', 'Der neue Mitarbeiter beginnt heute mit seiner Arbeit.', 'articles', 'der / die / das / die (Plural)', 'question', 'Wer? Was?'),
      jsonb_build_object('case', 'Akkusativ', 'usage', 'Direct object - the person or thing receiving the action directly', 'example', 'Ich schreibe einen langen Brief an meine Großmutter.', 'articles', 'den / die / das / die (Plural)', 'question', 'Wen? Was?'),
      jsonb_build_object('case', 'Dativ', 'usage', 'Indirect object - the recipient of the direct object', 'example', 'Ich gebe dem Kollegen die wichtigen Dokumente.', 'articles', 'dem / der / dem / den (Plural + n)', 'question', 'Wem?'),
      jsonb_build_object('case', 'Genitiv', 'usage', 'Possession and with certain prepositions (wegen, trotz, während, anstatt)', 'example', 'Die Meinung des Experten ist sehr wichtig für unsere Entscheidung.', 'articles', 'des / der / des / der (Plural)', 'question', 'Wessen?')
    )
  ),
  'preposition_cases', jsonb_build_object(
    'title', 'Präpositionen mit festen Fällen',
    'explanation', 'Certain prepositions always require a specific case. This is crucial for Sprachbausteine!',
    'akkusativ', jsonb_build_object('prepositions', 'für, um, durch, gegen, ohne, bis, entlang', 'examples', jsonb_build_array('Ich arbeite für eine internationale Firma.', 'Wir gehen durch den Park.', 'Das Geschenk ist für meinen Bruder.')),
    'dativ', jsonb_build_object('prepositions', 'mit, bei, nach, von, zu, aus, seit, gegenüber', 'examples', jsonb_build_array('Ich fahre mit dem Zug zur Arbeit.', 'Nach dem Essen gehen wir spazieren.', 'Seit einem Jahr lerne ich Deutsch.')),
    'genitiv', jsonb_build_object('prepositions', 'wegen, trotz, während, anstatt/statt, außerhalb, innerhalb', 'examples', jsonb_build_array('Wegen des schlechten Wetters bleiben wir zu Hause.', 'Trotz der Schwierigkeiten hat sie nicht aufgegeben.', 'Während des Meetings darf man nicht telefonieren.'))
  ),
  'telc_tips', jsonb_build_array(
    'In Sprachbausteine Teil 1, you must choose the correct word from 3 options - pay attention to case endings!',
    'Read the entire sentence before choosing - context determines the correct case',
    'Common prepositions to memorize: für/um/durch/gegen/ohne + Akkusativ, mit/bei/nach/von/zu/aus + Dativ',
    'Genitiv prepositions (wegen, trotz, während) are frequently tested - they are often confused with Dativ in spoken German',
    'Time expressions often use specific prepositions: am + Tag, im + Monat/Jahr, um + Uhrzeit'
  ),
  'practice_exercises', jsonb_build_array(
    jsonb_build_object('type', 'gap_fill', 'instruction', 'Fill in the correct article:', 'items', jsonb_build_array(
      jsonb_build_object('sentence', 'Ich gebe ___ Frau das Geschenk.', 'answer', 'der', 'explanation', 'Dativ required after geben (indirect object)'),
      jsonb_build_object('sentence', 'Er hat ___ Arbeitsvertrag unterschrieben.', 'answer', 'den', 'explanation', 'Akkusativ required (direct object of unterschreiben)'),
      jsonb_build_object('sentence', '___ Meinung des Chefs ist wichtig.', 'answer', 'Die', 'explanation', 'Nominativ required (subject of sentence)')
    )),
    jsonb_build_object('type', 'preposition', 'instruction', 'Choose the correct preposition:', 'items', jsonb_build_array(
      jsonb_build_object('sentence', 'Er arbeitet ___ drei Jahren in dieser Firma.', 'answer', 'seit', 'explanation', 'seit + Dativ for duration from a point in the past'),
      jsonb_build_object('sentence', '___ des Regens konnten wir nicht grillen.', 'answer', 'Wegen', 'explanation', 'wegen + Genitiv for reason/cause')
    ))
  )
)
WHERE lesson_number = 1 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 1);