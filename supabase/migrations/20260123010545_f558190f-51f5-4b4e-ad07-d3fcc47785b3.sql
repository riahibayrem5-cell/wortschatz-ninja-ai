-- Update Week 1: Foundation Building with detailed, TELC-aligned content
UPDATE course_lessons SET content = jsonb_build_object(
  'topics', ARRAY['b2_vocabulary_essentials', 'cases_review', 'verb_conjugation'],
  'skill', 'vocabulary_and_grammar_foundations',
  'telc_section', 'Sprachbausteine',
  'learning_objectives', ARRAY[
    'Master 50 essential B2 vocabulary words for daily life and work',
    'Review all four German cases with confidence',
    'Conjugate regular and irregular verbs in all tenses'
  ],
  'detailed_content', jsonb_build_object(
    'introduction', 'Welcome to Week 1 of your TELC B2 journey! This foundational module ensures you have the core vocabulary and grammar needed to succeed. We focus on the most frequently tested words and structures in the TELC B2 exam.',
    'vocabulary_sets', jsonb_build_array(
      jsonb_build_object('theme', 'Berufsleben (Professional Life)', 'words', jsonb_build_array(
        jsonb_build_object('german', 'die Bewerbung', 'english', 'application', 'example', 'Ich schreibe gerade eine Bewerbung für eine neue Stelle.', 'article', 'die', 'plural', 'die Bewerbungen'),
        jsonb_build_object('german', 'das Vorstellungsgespräch', 'english', 'job interview', 'example', 'Morgen habe ich ein wichtiges Vorstellungsgespräch.', 'article', 'das', 'plural', 'die Vorstellungsgespräche'),
        jsonb_build_object('german', 'die Berufserfahrung', 'english', 'professional experience', 'example', 'Sie hat fünf Jahre Berufserfahrung im Marketing.', 'article', 'die'),
        jsonb_build_object('german', 'der Arbeitsvertrag', 'english', 'employment contract', 'example', 'Bitte lesen Sie den Arbeitsvertrag sorgfältig durch.', 'article', 'der', 'plural', 'die Arbeitsverträge'),
        jsonb_build_object('german', 'kündigen', 'english', 'to resign/give notice', 'example', 'Er hat seine Stelle gekündigt, weil er umziehen musste.')
      )),
      jsonb_build_object('theme', 'Alltag und Freizeit (Daily Life)', 'words', jsonb_build_array(
        jsonb_build_object('german', 'der Alltag', 'english', 'everyday life', 'example', 'Im Alltag spreche ich meistens Deutsch.', 'article', 'der'),
        jsonb_build_object('german', 'die Verabredung', 'english', 'appointment/date', 'example', 'Ich habe heute Abend eine Verabredung mit Freunden.', 'article', 'die', 'plural', 'die Verabredungen'),
        jsonb_build_object('german', 'sich erholen', 'english', 'to recover/relax', 'example', 'Am Wochenende erhole ich mich von der Arbeitswoche.'),
        jsonb_build_object('german', 'der Haushalt', 'english', 'household', 'example', 'Wer macht bei euch den Haushalt?', 'article', 'der'),
        jsonb_build_object('german', 'entspannen', 'english', 'to relax', 'example', 'Nach der Arbeit entspanne ich mich mit einem Buch.')
      ))
    ),
    'grammar_focus', jsonb_build_object(
      'title', 'Cases Review (Nominativ, Akkusativ, Dativ, Genitiv)',
      'explanation', 'German has four grammatical cases that determine the form of articles, pronouns, and adjective endings. Mastering cases is essential for the Sprachbausteine section.',
      'rules', jsonb_build_array(
        jsonb_build_object('case', 'Nominativ', 'usage', 'Subject of the sentence', 'example', 'Der Mann liest ein Buch.', 'articles', 'der/die/das/die'),
        jsonb_build_object('case', 'Akkusativ', 'usage', 'Direct object', 'example', 'Ich sehe den Mann.', 'articles', 'den/die/das/die'),
        jsonb_build_object('case', 'Dativ', 'usage', 'Indirect object', 'example', 'Ich gebe dem Mann das Buch.', 'articles', 'dem/der/dem/den'),
        jsonb_build_object('case', 'Genitiv', 'usage', 'Possession', 'example', 'Das ist das Auto des Mannes.', 'articles', 'des/der/des/der')
      )
    ),
    'telc_tips', ARRAY[
      'In Sprachbausteine Teil 1, you must choose the correct word from 3 options - pay attention to case endings!',
      'Read the entire sentence before choosing - context determines the correct case',
      'Common prepositions to memorize: für/um/durch/gegen/ohne + Akkusativ, mit/bei/nach/von/zu/aus + Dativ'
    ],
    'practice_scenarios', ARRAY[
      'Fill in the correct article: Ich gebe ___ Frau das Geschenk.',
      'Choose the correct preposition: Er arbeitet ___ drei Jahren in dieser Firma.',
      'Complete the sentence: Wegen ___ schlechten Wetters bleiben wir zu Hause.'
    ]
  )
) WHERE module_id = '5ed3bc41-60dd-4e6a-a6df-c1552e51a3ac' AND lesson_number = 1;

UPDATE course_lessons SET content = jsonb_build_object(
  'topics', ARRAY['verb_tenses', 'haben_sein', 'modal_verbs'],
  'skill', 'verb_conjugation',
  'telc_section', 'Sprachbausteine',
  'learning_objectives', ARRAY[
    'Conjugate verbs correctly in Präsens, Präteritum, and Perfekt',
    'Master haben vs. sein auxiliary selection',
    'Use modal verbs (können, müssen, wollen, sollen, dürfen, mögen) accurately'
  ],
  'detailed_content', jsonb_build_object(
    'introduction', 'Verb conjugation is the backbone of German grammar. This lesson covers the tenses and verb forms most frequently tested in TELC B2, with special focus on auxiliary verb selection for Perfekt.',
    'grammar_focus', jsonb_build_object(
      'title', 'Verb Tenses for TELC B2',
      'tenses', jsonb_build_array(
        jsonb_build_object('name', 'Präsens', 'usage', 'Current actions, habits, near future', 'examples', ARRAY['Ich arbeite bei einer Bank.', 'Er kommt morgen.']),
        jsonb_build_object('name', 'Präteritum', 'usage', 'Written narratives, formal past', 'examples', ARRAY['Sie ging nach Hause.', 'Er war sehr müde.']),
        jsonb_build_object('name', 'Perfekt', 'usage', 'Spoken past, completed actions', 'examples', ARRAY['Ich habe das Buch gelesen.', 'Sie ist nach Berlin gefahren.'])
      ),
      'haben_vs_sein', jsonb_build_object(
        'haben_rule', 'Most verbs use haben: transitive verbs, reflexive verbs',
        'sein_rule', 'Movement verbs (gehen, fahren, fliegen) and state-change verbs (werden, sterben, einschlafen) use sein',
        'examples', jsonb_build_array(
          jsonb_build_object('verb', 'fahren', 'correct', 'Ich bin nach München gefahren.', 'note', 'Movement from A to B'),
          jsonb_build_object('verb', 'arbeiten', 'correct', 'Ich habe den ganzen Tag gearbeitet.', 'note', 'No movement'),
          jsonb_build_object('verb', 'einschlafen', 'correct', 'Das Kind ist eingeschlafen.', 'note', 'State change')
        )
      )
    ),
    'modal_verbs', jsonb_build_object(
      'explanation', 'Modal verbs modify the meaning of the main verb. In TELC B2, you need to use them correctly in all tenses.',
      'verbs', jsonb_build_array(
        jsonb_build_object('modal', 'können', 'meaning', 'can/be able to', 'example', 'Ich kann gut Deutsch sprechen.'),
        jsonb_build_object('modal', 'müssen', 'meaning', 'must/have to', 'example', 'Du musst den Bericht heute abgeben.'),
        jsonb_build_object('modal', 'wollen', 'meaning', 'want to', 'example', 'Sie will nächstes Jahr studieren.'),
        jsonb_build_object('modal', 'sollen', 'meaning', 'should/ought to', 'example', 'Er soll mehr Sport treiben.'),
        jsonb_build_object('modal', 'dürfen', 'meaning', 'may/be allowed to', 'example', 'Hier darf man nicht rauchen.'),
        jsonb_build_object('modal', 'mögen', 'meaning', 'to like', 'example', 'Ich mag italienisches Essen.')
      )
    ),
    'telc_tips', ARRAY[
      'Modal verbs in Perfekt: Ich habe arbeiten müssen. (double infinitive at the end)',
      'Präteritum of modal verbs is commonly used: konnte, musste, wollte, sollte, durfte, mochte',
      'Watch for sein/haben errors in listening comprehension - native speakers sometimes speak quickly'
    ]
  )
) WHERE module_id = '5ed3bc41-60dd-4e6a-a6df-c1552e51a3ac' AND lesson_number = 2;

-- Add more detailed lessons to Week 1
UPDATE course_lessons SET content = jsonb_build_object(
  'topics', ARRAY['word_order', 'main_clauses', 'subordinate_clauses', 'conjunctions'],
  'skill', 'sentence_structure',
  'telc_section', 'Sprachbausteine, Schriftlicher Ausdruck',
  'learning_objectives', ARRAY[
    'Master German word order rules (V2 position)',
    'Use coordinating and subordinating conjunctions correctly',
    'Build complex sentences for writing tasks'
  ],
  'detailed_content', jsonb_build_object(
    'introduction', 'German word order follows specific rules that differ from English. Understanding these rules is crucial for both Sprachbausteine and Schriftlicher Ausdruck sections of TELC B2.',
    'grammar_focus', jsonb_build_object(
      'main_clause_rule', jsonb_build_object(
        'title', 'V2 Rule: Verb in Second Position',
        'explanation', 'In German main clauses, the conjugated verb is ALWAYS in second position. The first position can be filled by the subject or any other element for emphasis.',
        'examples', jsonb_build_array(
          jsonb_build_object('german', 'Ich gehe morgen ins Kino.', 'english', 'I am going to the cinema tomorrow.', 'note', 'Subject first'),
          jsonb_build_object('german', 'Morgen gehe ich ins Kino.', 'english', 'Tomorrow I am going to the cinema.', 'note', 'Time adverb first - verb stays in 2nd position'),
          jsonb_build_object('german', 'Ins Kino gehe ich morgen.', 'english', 'To the cinema I am going tomorrow.', 'note', 'Location first for emphasis')
        )
      ),
      'subordinate_clauses', jsonb_build_object(
        'title', 'Verb at the End in Subordinate Clauses',
        'explanation', 'When you use subordinating conjunctions (weil, dass, obwohl, wenn, nachdem, etc.), the verb moves to the end of the clause.',
        'conjunctions', jsonb_build_array(
          jsonb_build_object('conjunction', 'weil', 'meaning', 'because', 'example', 'Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte.'),
          jsonb_build_object('conjunction', 'dass', 'meaning', 'that', 'example', 'Ich hoffe, dass du morgen kommen kannst.'),
          jsonb_build_object('conjunction', 'obwohl', 'meaning', 'although', 'example', 'Er ging zur Arbeit, obwohl er krank war.'),
          jsonb_build_object('conjunction', 'wenn', 'meaning', 'if/when', 'example', 'Wenn ich Zeit habe, lese ich gern.'),
          jsonb_build_object('conjunction', 'nachdem', 'meaning', 'after', 'example', 'Nachdem ich gegessen hatte, ging ich spazieren.'),
          jsonb_build_object('conjunction', 'bevor', 'meaning', 'before', 'example', 'Bevor du gehst, ruf mich bitte an.')
        )
      ),
      'coordinating_conjunctions', jsonb_build_object(
        'explanation', 'These do NOT change word order: und, oder, aber, denn, sondern',
        'examples', ARRAY[
          'Ich arbeite hier, und meine Frau arbeitet dort.',
          'Er ist müde, aber er muss noch arbeiten.',
          'Sie kommt nicht, denn sie ist krank.'
        ]
      )
    ),
    'telc_tips', ARRAY[
      'In Schriftlicher Ausdruck, use varied sentence structures to demonstrate B2 competence',
      'Common error: putting the verb in wrong position after subordinating conjunctions',
      'Practice: Transform simple sentences into complex sentences using different conjunctions'
    ]
  )
) WHERE module_id = '5ed3bc41-60dd-4e6a-a6df-c1552e51a3ac' AND lesson_number = 3;