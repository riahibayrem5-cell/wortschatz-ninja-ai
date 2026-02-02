-- Week 1, Lesson 2: Verb Conjugation Mastery - EXPANDED
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Sprachbausteine',
  'telc_points', 30,
  'telc_time_minutes', 20,
  'learning_objectives', jsonb_build_array(
    'Master all German verb tenses required for TELC B2',
    'Correctly use haben vs. sein in Perfekt and Plusquamperfekt',
    'Apply modal verbs in various tenses including Konjunktiv II',
    'Understand the difference between Präteritum and Perfekt usage'
  ),
  'introduction', 'Verb conjugation is the backbone of German grammar and a key focus of the TELC B2 exam. This comprehensive lesson covers all tenses you need to master, with special emphasis on the forms most frequently tested in Sprachbausteine and required for Schriftlicher Ausdruck. Understanding when to use haben vs. sein in compound tenses is crucial, as this is one of the most common error areas for B2 learners.',
  'grammar_focus', jsonb_build_object(
    'title', 'Complete German Verb Tenses for TELC B2',
    'explanation', 'German uses six main tenses. In the TELC B2 exam, you need to recognize and produce all of them, with particular emphasis on Perfekt, Präteritum, and Konjunktiv II.',
    'tenses', jsonb_build_array(
      jsonb_build_object('name', 'Präsens (Present)', 'usage', 'Current actions, habits, general truths, and near future events', 'formation', 'Verb stem + present tense endings', 'examples', jsonb_build_array('Ich arbeite jeden Tag von 9 bis 17 Uhr.', 'Er kommt morgen aus dem Urlaub zurück.', 'Die Sonne geht im Osten auf.')),
      jsonb_build_object('name', 'Präteritum (Simple Past)', 'usage', 'Written narratives, formal writing, sein/haben/modal verbs in speech', 'formation', 'Verb stem + Präteritum endings (regular: -te, irregular: vowel change)', 'examples', jsonb_build_array('Sie ging gestern Abend früh nach Hause.', 'Er war letzte Woche krank.', 'Wir konnten das Problem nicht lösen.')),
      jsonb_build_object('name', 'Perfekt (Present Perfect)', 'usage', 'Completed actions in speech, recent past events', 'formation', 'haben/sein + Partizip II', 'examples', jsonb_build_array('Ich habe den Bericht gestern fertig geschrieben.', 'Sie ist nach Berlin gefahren.', 'Wir haben lange darüber diskutiert.')),
      jsonb_build_object('name', 'Plusquamperfekt (Past Perfect)', 'usage', 'Actions completed before another past action', 'formation', 'hatte/war + Partizip II', 'examples', jsonb_build_array('Nachdem ich gegessen hatte, ging ich spazieren.', 'Sie war schon abgefahren, als ich ankam.', 'Er hatte das Buch gelesen, bevor er den Film sah.')),
      jsonb_build_object('name', 'Futur I (Future)', 'usage', 'Future intentions, predictions, assumptions about the present', 'formation', 'werden + Infinitiv', 'examples', jsonb_build_array('Ich werde nächstes Jahr meine Prüfung ablegen.', 'Es wird morgen wahrscheinlich regnen.', 'Er wird jetzt wohl schon zu Hause sein.')),
      jsonb_build_object('name', 'Konjunktiv II (Subjunctive)', 'usage', 'Polite requests, hypothetical situations, reported speech', 'formation', 'würde + Infinitiv OR special forms (wäre, hätte, könnte)', 'examples', jsonb_build_array('Könnten Sie mir bitte helfen?', 'Wenn ich mehr Zeit hätte, würde ich mehr lesen.', 'Ich würde gern einen Termin vereinbaren.'))
    )
  ),
  'haben_vs_sein', jsonb_build_object(
    'title', 'Haben vs. Sein im Perfekt - Complete Guide',
    'explanation', 'Choosing the correct auxiliary verb is essential for TELC B2. Most verbs use haben, but verbs of movement and state change use sein.',
    'haben_rule', 'Use HABEN with: transitive verbs (with accusative object), reflexive verbs, and most other verbs',
    'sein_rule', 'Use SEIN with: verbs of movement from A to B (fahren, gehen, fliegen, kommen), verbs of state change (werden, sterben, aufwachen, einschlafen), sein/bleiben',
    'examples', jsonb_build_array(
      jsonb_build_object('verb', 'arbeiten', 'correct', 'Ich habe den ganzen Tag gearbeitet.', 'note', 'No movement or state change'),
      jsonb_build_object('verb', 'fahren', 'correct', 'Wir sind nach München gefahren.', 'note', 'Movement from A to B'),
      jsonb_build_object('verb', 'schwimmen', 'correct', 'Er ist durch den Fluss geschwommen. / Er hat eine Stunde geschwommen.', 'note', 'sein = movement, haben = activity'),
      jsonb_build_object('verb', 'aufstehen', 'correct', 'Sie ist um 7 Uhr aufgestanden.', 'note', 'State change'),
      jsonb_build_object('verb', 'bleiben', 'correct', 'Wir sind zu Hause geblieben.', 'note', 'Always with sein'),
      jsonb_build_object('verb', 'passieren', 'correct', 'Was ist gestern passiert?', 'note', 'Always with sein'),
      jsonb_build_object('verb', 'sich freuen', 'correct', 'Ich habe mich sehr gefreut.', 'note', 'Reflexive verbs use haben')
    )
  ),
  'modal_verbs', jsonb_build_object(
    'explanation', 'Modal verbs are essential for B2 level. You must know them in all tenses, especially Präteritum and Konjunktiv II.',
    'verbs', jsonb_build_array(
      jsonb_build_object('modal', 'können', 'meaning', 'can, to be able to', 'praeteritum', 'konnte', 'konjunktiv', 'könnte', 'example', 'Ich konnte gestern nicht kommen. / Könnten Sie das wiederholen?'),
      jsonb_build_object('modal', 'müssen', 'meaning', 'must, to have to', 'praeteritum', 'musste', 'konjunktiv', 'müsste', 'example', 'Ich musste früher aufstehen. / Ich müsste eigentlich mehr lernen.'),
      jsonb_build_object('modal', 'wollen', 'meaning', 'to want to', 'praeteritum', 'wollte', 'konjunktiv', 'wollte', 'example', 'Sie wollte uns besuchen, aber sie hatte keine Zeit.'),
      jsonb_build_object('modal', 'sollen', 'meaning', 'should, ought to', 'praeteritum', 'sollte', 'konjunktiv', 'sollte', 'example', 'Er sollte mehr Sport treiben. / Du solltest früher ins Bett gehen.'),
      jsonb_build_object('modal', 'dürfen', 'meaning', 'may, to be allowed to', 'praeteritum', 'durfte', 'konjunktiv', 'dürfte', 'example', 'Hier durfte man früher nicht rauchen. / Dürfte ich Sie etwas fragen?'),
      jsonb_build_object('modal', 'mögen', 'meaning', 'to like', 'praeteritum', 'mochte', 'konjunktiv', 'möchte', 'example', 'Ich mochte als Kind keinen Spinat. / Ich möchte einen Kaffee bestellen.')
    ),
    'perfekt_note', 'Modal verbs in Perfekt use a double infinitive: Ich habe arbeiten müssen. (NOT: Ich habe gemusst arbeiten.)'
  ),
  'irregular_verbs', jsonb_build_object(
    'title', 'Important Irregular Verbs for TELC B2',
    'explanation', 'These irregular verbs appear frequently in the exam. Learn their principal parts!',
    'verbs', jsonb_build_array(
      jsonb_build_object('infinitiv', 'beginnen', 'praeteritum', 'begann', 'partizip', 'begonnen', 'example', 'Der Kurs hat um 9 Uhr begonnen.'),
      jsonb_build_object('infinitiv', 'bieten', 'praeteritum', 'bot', 'partizip', 'geboten', 'example', 'Die Firma hat mir eine gute Stelle geboten.'),
      jsonb_build_object('infinitiv', 'entscheiden', 'praeteritum', 'entschied', 'partizip', 'entschieden', 'example', 'Wir haben uns für diese Option entschieden.'),
      jsonb_build_object('infinitiv', 'gelingen', 'praeteritum', 'gelang', 'partizip', 'gelungen', 'auxiliary', 'sein', 'example', 'Es ist mir gelungen, das Problem zu lösen.'),
      jsonb_build_object('infinitiv', 'geschehen', 'praeteritum', 'geschah', 'partizip', 'geschehen', 'auxiliary', 'sein', 'example', 'Was ist gestern Nacht geschehen?'),
      jsonb_build_object('infinitiv', 'halten', 'praeteritum', 'hielt', 'partizip', 'gehalten', 'example', 'Er hat eine interessante Rede gehalten.'),
      jsonb_build_object('infinitiv', 'lassen', 'praeteritum', 'ließ', 'partizip', 'gelassen', 'example', 'Ich habe mein Auto reparieren lassen.'),
      jsonb_build_object('infinitiv', 'leiden', 'praeteritum', 'litt', 'partizip', 'gelitten', 'example', 'Sie hat unter Kopfschmerzen gelitten.'),
      jsonb_build_object('infinitiv', 'schließen', 'praeteritum', 'schloss', 'partizip', 'geschlossen', 'example', 'Das Geschäft hat um 18 Uhr geschlossen.'),
      jsonb_build_object('infinitiv', 'treffen', 'praeteritum', 'traf', 'partizip', 'getroffen', 'example', 'Ich habe gestern meine alte Freundin getroffen.')
    )
  ),
  'telc_tips', jsonb_build_array(
    'In Sprachbausteine, pay attention to verb endings - they must match the subject!',
    'Modal verbs in Perfekt use double infinitive: Ich habe kommen müssen (NOT: Ich habe gemusst kommen)',
    'Präteritum is preferred in written texts and for sein/haben/modal verbs',
    'Listen for sein vs. haben errors in Hörverstehen - even native speakers sometimes make mistakes in dialects',
    'Konjunktiv II forms (könnte, würde, hätte, wäre) are essential for polite language in Schriftlicher Ausdruck'
  ),
  'practice_exercises', jsonb_build_array(
    jsonb_build_object('type', 'conjugation', 'instruction', 'Complete with the correct verb form:', 'items', jsonb_build_array(
      jsonb_build_object('sentence', 'Gestern ___ wir ins Kino ___. (gehen - Perfekt)', 'answer', 'sind ... gegangen', 'explanation', 'gehen uses sein (movement)'),
      jsonb_build_object('sentence', 'Sie ___ den ganzen Tag ___. (arbeiten - Perfekt)', 'answer', 'hat ... gearbeitet', 'explanation', 'arbeiten uses haben'),
      jsonb_build_object('sentence', 'Wenn ich reich ___, ___ ich ein Haus kaufen. (sein/werden - Konjunktiv II)', 'answer', 'wäre ... würde', 'explanation', 'Hypothetical situation requires Konjunktiv II')
    ))
  )
)
WHERE lesson_number = 2 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 1);