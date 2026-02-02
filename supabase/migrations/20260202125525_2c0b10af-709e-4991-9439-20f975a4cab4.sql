-- Week 1, Lesson 3: Sentence Structure (V2 Rule) - EXPANDED
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Sprachbausteine',
  'telc_points', 30,
  'telc_time_minutes', 20,
  'learning_objectives', jsonb_build_array(
    'Master the V2 (verb-second) rule in German main clauses',
    'Correctly position verbs in subordinate clauses with verb-final order',
    'Use coordinating vs. subordinating conjunctions accurately',
    'Handle inversion correctly when starting sentences with adverbs or objects'
  ),
  'introduction', 'German word order follows strict rules that are frequently tested in the TELC B2 Sprachbausteine section. The V2 (verb-second) rule states that the conjugated verb must be in the second position in main clauses. However, subordinate clauses follow different rules with the verb at the end. Mastering these structures is essential for both written and spoken German at B2 level.',
  'grammar_focus', jsonb_build_object(
    'title', 'German Sentence Structure: The Complete Guide',
    'explanation', 'German word order is more flexible than English, but follows strict rules. The position of the verb is the key organizing principle.',
    'main_clause', jsonb_build_object(
      'title', 'Main Clause (Hauptsatz) - V2 Rule',
      'rule', 'The conjugated verb is ALWAYS in the second position. The first position can be the subject, an adverb, an object, or even a subordinate clause.',
      'patterns', jsonb_build_array(
        jsonb_build_object('pattern', 'Subject + Verb + ...', 'example', 'Ich gehe morgen ins Kino.', 'note', 'Standard word order'),
        jsonb_build_object('pattern', 'Time/Place + Verb + Subject + ...', 'example', 'Morgen gehe ich ins Kino.', 'note', 'Inversion when adverb is first'),
        jsonb_build_object('pattern', 'Object + Verb + Subject + ...', 'example', 'Das Buch habe ich schon gelesen.', 'note', 'Object emphasis - common in German'),
        jsonb_build_object('pattern', 'Subordinate clause + Verb + Subject + ...', 'example', 'Weil ich müde bin, gehe ich früh ins Bett.', 'note', 'After subordinate clause, main verb comes immediately')
      )
    ),
    'subordinate_clauses', jsonb_build_object(
      'title', 'Subordinate Clause (Nebensatz) - Verb Final',
      'rule', 'In subordinate clauses introduced by a conjunction, the conjugated verb moves to the END of the clause.',
      'conjunctions', jsonb_build_array(
        jsonb_build_object('conjunction', 'weil', 'meaning', 'because', 'example', 'Ich bleibe zu Hause, weil ich krank bin.', 'note', 'Verb "bin" at the end'),
        jsonb_build_object('conjunction', 'dass', 'meaning', 'that', 'example', 'Ich hoffe, dass du bald kommst.', 'note', 'Very common in B2'),
        jsonb_build_object('conjunction', 'obwohl', 'meaning', 'although', 'example', 'Obwohl es regnet, gehen wir spazieren.', 'note', 'Introduces concession'),
        jsonb_build_object('conjunction', 'wenn', 'meaning', 'if/when', 'example', 'Wenn ich Zeit habe, helfe ich dir.', 'note', 'Conditional and temporal'),
        jsonb_build_object('conjunction', 'als', 'meaning', 'when (past, single event)', 'example', 'Als ich jung war, spielte ich oft Fußball.', 'note', 'Only for past single events'),
        jsonb_build_object('conjunction', 'während', 'meaning', 'while/during', 'example', 'Während ich koche, hörst du Musik.', 'note', 'Simultaneous actions'),
        jsonb_build_object('conjunction', 'nachdem', 'meaning', 'after', 'example', 'Nachdem ich gegessen hatte, ging ich spazieren.', 'note', 'Often with Plusquamperfekt'),
        jsonb_build_object('conjunction', 'bevor', 'meaning', 'before', 'example', 'Bevor du gehst, musst du aufräumen.', 'note', 'Action sequence'),
        jsonb_build_object('conjunction', 'damit', 'meaning', 'so that', 'example', 'Ich spare Geld, damit ich reisen kann.', 'note', 'Purpose clause'),
        jsonb_build_object('conjunction', 'ob', 'meaning', 'whether/if', 'example', 'Ich weiß nicht, ob er kommt.', 'note', 'Indirect question')
      )
    ),
    'relative_clauses', jsonb_build_object(
      'title', 'Relative Clauses (Relativsätze)',
      'rule', 'Relative pronouns (der, die, das, den, dem, dessen, deren) introduce clauses with verb-final order. The pronoun agrees with its antecedent in gender and number, but takes the case required by its role in the relative clause.',
      'examples', jsonb_build_array(
        jsonb_build_object('sentence', 'Der Mann, der dort steht, ist mein Lehrer.', 'case', 'Nominativ', 'explanation', 'der = subject of relative clause'),
        jsonb_build_object('sentence', 'Das Buch, das ich gelesen habe, war interessant.', 'case', 'Akkusativ', 'explanation', 'das = direct object of gelesen'),
        jsonb_build_object('sentence', 'Die Frau, der ich geholfen habe, ist meine Nachbarin.', 'case', 'Dativ', 'explanation', 'der = indirect object (helfen + Dativ)'),
        jsonb_build_object('sentence', 'Der Autor, dessen Buch ich lese, ist sehr bekannt.', 'case', 'Genitiv', 'explanation', 'dessen = possession')
      )
    )
  ),
  'coordinating_conjunctions', jsonb_build_object(
    'title', 'Coordinating Conjunctions (Position 0)',
    'explanation', 'These conjunctions do NOT affect word order - the verb stays in second position after them.',
    'conjunctions', jsonb_build_array(
      jsonb_build_object('conjunction', 'und', 'meaning', 'and', 'example', 'Ich arbeite und (ich) verdiene Geld.'),
      jsonb_build_object('conjunction', 'aber', 'meaning', 'but', 'example', 'Ich bin müde, aber ich kann nicht schlafen.'),
      jsonb_build_object('conjunction', 'oder', 'meaning', 'or', 'example', 'Kommst du mit, oder bleibst du hier?'),
      jsonb_build_object('conjunction', 'denn', 'meaning', 'because (coord.)', 'example', 'Ich bleibe zu Hause, denn ich bin krank.'),
      jsonb_build_object('conjunction', 'sondern', 'meaning', 'but rather', 'example', 'Er ist nicht dumm, sondern er ist faul.')
    )
  ),
  'two_part_conjunctions', jsonb_build_object(
    'title', 'Two-Part (Correlative) Conjunctions',
    'explanation', 'These paired conjunctions are frequently tested in TELC B2 Sprachbausteine.',
    'pairs', jsonb_build_array(
      jsonb_build_object('conjunction', 'nicht nur ... sondern auch', 'meaning', 'not only ... but also', 'example', 'Sie spricht nicht nur Deutsch, sondern auch Französisch.'),
      jsonb_build_object('conjunction', 'sowohl ... als auch', 'meaning', 'both ... and', 'example', 'Sowohl der Vater als auch die Mutter arbeiten.'),
      jsonb_build_object('conjunction', 'entweder ... oder', 'meaning', 'either ... or', 'example', 'Entweder kommst du mit, oder du bleibst hier.'),
      jsonb_build_object('conjunction', 'weder ... noch', 'meaning', 'neither ... nor', 'example', 'Er hat weder Zeit noch Geld.'),
      jsonb_build_object('conjunction', 'je ... desto/umso', 'meaning', 'the more ... the more', 'example', 'Je mehr ich übe, desto besser werde ich.')
    )
  ),
  'telc_tips', jsonb_build_array(
    'In Sprachbausteine, check if the blank is after a subordinating conjunction - the verb goes at the END!',
    'Remember: weil (verb end) vs. denn (verb second) - both mean because but have different word order',
    'After coordinating conjunctions (und, aber, oder, denn, sondern), verb stays in position 2',
    'Relative pronouns must match gender/number of antecedent but take case from their role in the clause',
    'Two-part conjunctions (sowohl...als auch, weder...noch) are common in Sprachbausteine'
  ),
  'practice_exercises', jsonb_build_array(
    jsonb_build_object('type', 'word_order', 'instruction', 'Put the words in the correct order:', 'items', jsonb_build_array(
      jsonb_build_object('words', 'morgen / ich / gehe / ins Kino', 'answer', 'Morgen gehe ich ins Kino.', 'explanation', 'Time adverb first triggers inversion'),
      jsonb_build_object('words', 'weil / ich / müde / bin / bleibe / ich / zu Hause', 'answer', 'Weil ich müde bin, bleibe ich zu Hause.', 'explanation', 'Verb at end of subordinate clause, then V2 in main clause')
    ))
  )
)
WHERE lesson_number = 3 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 1);

-- Week 1, Lesson 4: Listening Fundamentals - EXPANDED
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Hörverstehen',
  'telc_points', 75,
  'telc_time_minutes', 20,
  'learning_objectives', jsonb_build_array(
    'Understand the structure of TELC B2 Hörverstehen (3 parts, 75 points)',
    'Develop effective note-taking strategies for listening tasks',
    'Practice identifying key information in German audio',
    'Learn vocabulary commonly used in announcements and dialogues'
  ),
  'introduction', 'The TELC B2 Hörverstehen (Listening Comprehension) section tests your ability to understand spoken German in various contexts. This section is worth 75 points and consists of three parts: Globalverstehen (global understanding), Detailverstehen (detailed understanding), and Selektivverstehen (selective understanding). Each part requires different listening strategies.',
  'exam_format', jsonb_build_object(
    'title', 'TELC B2 Hörverstehen Structure',
    'total_points', 75,
    'total_time', '20 minutes (+ transfer time)',
    'parts', jsonb_build_array(
      jsonb_build_object('teil', 1, 'name', 'Globalverstehen', 'items', 5, 'points', 25, 'task', 'Match statements to speakers (5 people, 8 statements)', 'audio', 'You hear 5 short monologues once. Match each to the correct statement.', 'strategy', 'Focus on the main topic and speaker''s attitude, not every detail'),
      jsonb_build_object('teil', 2, 'name', 'Detailverstehen', 'items', 10, 'points', 25, 'task', 'True/False questions about a longer text', 'audio', 'You hear a longer dialogue or interview twice.', 'strategy', 'Read questions first, listen for specific information to confirm or deny'),
      jsonb_build_object('teil', 3, 'name', 'Selektivverstehen', 'items', 5, 'points', 25, 'task', 'Fill in missing information', 'audio', 'You hear announcements or messages twice. Complete the form/notes.', 'strategy', 'Predict what information you need (name, date, time, place, number)')
    )
  ),
  'listening_strategies', jsonb_build_array(
    jsonb_build_object('name', 'Pre-listening', 'german', 'Vor dem Hören', 'description', 'Use the time before audio plays to read questions and predict content.', 'tips', jsonb_build_array('Underline key words in questions', 'Predict what type of information you need', 'Note any numbers or names mentioned in the questions')),
    jsonb_build_object('name', 'Global Listening', 'german', 'Globales Hören', 'description', 'Focus on understanding the main idea without getting stuck on unknown words.', 'tips', jsonb_build_array('Listen for topic indicators at the beginning', 'Pay attention to tone and emotion', 'Don''t panic if you miss some words')),
    jsonb_build_object('name', 'Selective Listening', 'german', 'Selektives Hören', 'description', 'Listen specifically for the information you need to answer questions.', 'tips', jsonb_build_array('Focus on numbers, dates, times, names', 'Listen for signal words (erstens, zweitens, außerdem, allerdings)', 'Write down key information immediately')),
    jsonb_build_object('name', 'Detailed Listening', 'german', 'Detailliertes Hören', 'description', 'Try to understand as much as possible, including implied meaning.', 'tips', jsonb_build_array('Pay attention to negations and qualifiers', 'Notice contrast words (aber, jedoch, trotzdem)', 'Listen for the speaker''s opinion'))
  ),
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Listening Signal Words',
      'description', 'These words help you follow the structure of spoken German.',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'zunächst / zuerst', 'english', 'first', 'example', 'Zunächst möchte ich mich vorstellen.'),
        jsonb_build_object('german', 'außerdem / darüber hinaus', 'english', 'furthermore', 'example', 'Außerdem bieten wir kostenlose Beratung an.'),
        jsonb_build_object('german', 'allerdings / jedoch', 'english', 'however', 'example', 'Allerdings gibt es einige Einschränkungen.'),
        jsonb_build_object('german', 'schließlich / zum Schluss', 'english', 'finally', 'example', 'Schließlich möchte ich noch erwähnen...'),
        jsonb_build_object('german', 'einerseits ... andererseits', 'english', 'on one hand ... on the other hand', 'example', 'Einerseits ist es teuer, andererseits sehr praktisch.'),
        jsonb_build_object('german', 'im Gegensatz dazu', 'english', 'in contrast to that', 'example', 'Im Gegensatz dazu war das Wetter gestern schön.'),
        jsonb_build_object('german', 'zusammenfassend', 'english', 'in summary', 'example', 'Zusammenfassend kann man sagen, dass...')
      )
    ),
    jsonb_build_object(
      'theme', 'Common Announcement Vocabulary',
      'description', 'Words you will hear in announcements, messages, and official communications.',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'die Durchsage', 'article', 'die', 'english', 'announcement', 'example', 'Achtung, eine wichtige Durchsage!'),
        jsonb_build_object('german', 'die Verspätung', 'article', 'die', 'english', 'delay', 'example', 'Der Zug hat leider 15 Minuten Verspätung.'),
        jsonb_build_object('german', 'die Ermäßigung', 'article', 'die', 'english', 'discount/reduction', 'example', 'Studenten bekommen eine Ermäßigung von 20 Prozent.'),
        jsonb_build_object('german', 'die Öffnungszeiten', 'article', 'die', 'english', 'opening hours', 'example', 'Unsere Öffnungszeiten sind von 9 bis 18 Uhr.'),
        jsonb_build_object('german', 'ausverkauft', 'english', 'sold out', 'example', 'Die Veranstaltung ist leider ausverkauft.'),
        jsonb_build_object('german', 'voraussichtlich', 'english', 'expected/anticipated', 'example', 'Die Ankunft ist voraussichtlich um 14:30 Uhr.')
      )
    )
  ),
  'note_taking', jsonb_build_object(
    'title', 'Effective Note-Taking for Listening',
    'explanation', 'Good notes help you remember key information during and after listening.',
    'techniques', jsonb_build_array(
      jsonb_build_object('technique', 'Abbreviations', 'description', 'Create shortcuts for common words', 'examples', jsonb_build_array('Mi = Mittwoch', 'ca. = circa', '€ = Euro', '→ = führt zu / bedeutet')),
      jsonb_build_object('technique', 'Key Words Only', 'description', 'Write only essential information, not complete sentences', 'examples', jsonb_build_array('Instead of "Der Termin ist am Montag um 15 Uhr" write "Mo 15:00"')),
      jsonb_build_object('technique', 'Symbols', 'description', 'Use symbols for common concepts', 'examples', jsonb_build_array('+ = positive/advantage', '- = negative/disadvantage', '? = uncertain', '! = important'))
    )
  ),
  'telc_tips', jsonb_build_array(
    'You hear Teil 1 (Globalverstehen) only ONCE - stay focused!',
    'Teil 2 and Teil 3 are played twice - use the first time for general understanding, second for checking',
    'Read all questions BEFORE the audio starts',
    'If you miss something, move on - don''t let one question affect the next',
    'Watch out for distractors - incorrect information designed to confuse you',
    'Pay attention to negations: "nicht", "kein", "nie", "niemand"'
  )
)
WHERE lesson_number = 4 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 1);

-- Week 1, Lesson 5: Reading Comprehension Basics - EXPANDED
UPDATE course_lessons 
SET content = jsonb_build_object(
  'detailed_content', true,
  'telc_section', 'Leseverstehen',
  'telc_points', 75,
  'telc_time_minutes', 90,
  'learning_objectives', jsonb_build_array(
    'Understand the structure of TELC B2 Leseverstehen (5 parts, 75 points)',
    'Apply skimming and scanning techniques for efficient reading',
    'Identify text types and their typical features',
    'Practice finding specific information in German texts'
  ),
  'introduction', 'The TELC B2 Leseverstehen (Reading Comprehension) section tests your ability to understand written German at an advanced level. Worth 75 points, this section includes 5 different parts testing global understanding, detailed comprehension, and the ability to match information. You have 90 minutes total for reading and Sprachbausteine together, so time management is crucial.',
  'exam_format', jsonb_build_object(
    'title', 'TELC B2 Leseverstehen Structure',
    'total_points', 75,
    'total_time', '90 minutes (shared with Sprachbausteine)',
    'parts', jsonb_build_array(
      jsonb_build_object('teil', 1, 'name', 'Globalverstehen', 'items', 5, 'points', 15, 'task', 'Match 5 people to 10 short texts (ads, notices)', 'strategy', 'Read person descriptions first, then scan texts for matching features'),
      jsonb_build_object('teil', 2, 'name', 'Detailverstehen', 'items', 5, 'points', 15, 'task', 'Multiple choice questions about a longer text', 'strategy', 'Read questions first, locate answers in text, eliminate wrong options'),
      jsonb_build_object('teil', 3, 'name', 'Selektivverstehen', 'items', 10, 'points', 20, 'task', 'Match 10 statements to sections of a text', 'strategy', 'Identify key words in statements, find matching sections'),
      jsonb_build_object('teil', 4, 'name', 'Leseverstehen', 'items', 7, 'points', 14, 'task', 'Decide if 7 statements agree with text (Ja/Nein/Text sagt dazu nichts)', 'strategy', 'Be careful with "Text sagt dazu nichts" - information must be explicitly stated'),
      jsonb_build_object('teil', 5, 'name', 'Korrekturlesen', 'items', 11, 'points', 11, 'task', 'Find 11 mistakes in a text (grammar, spelling, word choice)', 'strategy', 'Read slowly, check each word systematically')
    )
  ),
  'reading_strategies', jsonb_build_array(
    jsonb_build_object('name', 'Skimming', 'german', 'Überfliegen', 'description', 'Read quickly to get the main idea without focusing on details.', 'when_to_use', 'First read of any text, matching tasks', 'techniques', jsonb_build_array('Read title, headings, first and last paragraphs', 'Look at pictures, graphs, or formatting', 'Identify text type (article, letter, advertisement)')),
    jsonb_build_object('name', 'Scanning', 'german', 'Suchendes Lesen', 'description', 'Search quickly for specific information without reading everything.', 'when_to_use', 'When looking for names, dates, numbers, specific facts', 'techniques', jsonb_build_array('Know what you are looking for before you scan', 'Move your eyes quickly over the text', 'Stop only when you find relevant information')),
    jsonb_build_object('name', 'Intensive Reading', 'german', 'Detailliertes Lesen', 'description', 'Read carefully to understand every detail.', 'when_to_use', 'Answering specific questions, Teil 4 (Ja/Nein/Text sagt nichts)', 'techniques', jsonb_build_array('Read slowly and carefully', 'Pay attention to modifiers and negations', 'Understand the relationship between sentences'))
  ),
  'text_types', jsonb_build_object(
    'title', 'Common Text Types in TELC B2',
    'types', jsonb_build_array(
      jsonb_build_object('type', 'Zeitungsartikel', 'english', 'Newspaper article', 'features', 'Headlines, paragraphs, factual information, quotes', 'language', 'Formal, informative, objective'),
      jsonb_build_object('type', 'Anzeigen', 'english', 'Advertisements/notices', 'features', 'Short, key information, contact details', 'language', 'Concise, often with abbreviations'),
      jsonb_build_object('type', 'Formeller Brief', 'english', 'Formal letter', 'features', 'Greetings, structured paragraphs, formal closing', 'language', 'Polite, formal structures (Konjunktiv II)'),
      jsonb_build_object('type', 'Sachtext', 'english', 'Informational text', 'features', 'Facts, explanations, sometimes opinions', 'language', 'Varied, depends on topic'),
      jsonb_build_object('type', 'Meinungsbeitrag', 'english', 'Opinion piece', 'features', 'Arguments, personal viewpoint, examples', 'language', 'Persuasive, often uses rhetorical questions')
    )
  ),
  'vocabulary_sets', jsonb_build_array(
    jsonb_build_object(
      'theme', 'Text Structure Words',
      'description', 'Words that help you understand how a text is organized.',
      'words', jsonb_build_array(
        jsonb_build_object('german', 'laut', 'english', 'according to', 'example', 'Laut einer Studie...'),
        jsonb_build_object('german', 'hingegen', 'english', 'on the other hand', 'example', 'Männer arbeiten oft Vollzeit, Frauen hingegen häufig Teilzeit.'),
        jsonb_build_object('german', 'demnach', 'english', 'accordingly/thus', 'example', 'Demnach sind 60% der Befragten zufrieden.'),
        jsonb_build_object('german', 'insbesondere', 'english', 'especially/in particular', 'example', 'Insbesondere junge Menschen nutzen soziale Medien.'),
        jsonb_build_object('german', 'im Hinblick auf', 'english', 'with regard to', 'example', 'Im Hinblick auf die Zukunft müssen wir handeln.'),
        jsonb_build_object('german', 'infolgedessen', 'english', 'as a result', 'example', 'Infolgedessen stieg die Nachfrage stark an.')
      )
    )
  ),
  'teil4_strategy', jsonb_build_object(
    'title', 'Teil 4: Ja / Nein / Text sagt dazu nichts',
    'explanation', 'This part is tricky because you must distinguish between what the text explicitly says, contradicts, or does not mention at all.',
    'answer_types', jsonb_build_array(
      jsonb_build_object('answer', 'Ja', 'meaning', 'The text explicitly states this information or clearly supports it'),
      jsonb_build_object('answer', 'Nein', 'meaning', 'The text explicitly contradicts this statement'),
      jsonb_build_object('answer', 'Text sagt dazu nichts', 'meaning', 'This information is NOT in the text at all, even if it might be logically true')
    ),
    'common_traps', jsonb_build_array(
      'Do not use your own knowledge - only use information from the text',
      'Just because something is logical does not mean the text says it',
      'Partial matches are not enough - the statement must be fully supported'
    )
  ),
  'telc_tips', jsonb_build_array(
    'Allocate your time wisely: ~60 min for Leseverstehen, ~30 min for Sprachbausteine',
    'Always read questions BEFORE reading the text in detail',
    'In Teil 4, distinguish carefully between Nein (text contradicts) and Text sagt dazu nichts (not mentioned)',
    'In Teil 5 (Korrekturlesen), look for: wrong articles, verb conjugation errors, spelling mistakes, wrong prepositions',
    'Don''t spend too much time on one question - mark it and come back',
    'Watch for synonyms and paraphrases - answers are often not word-for-word matches'
  )
)
WHERE lesson_number = 5 
AND module_id = (SELECT id FROM course_modules WHERE week_number = 1);