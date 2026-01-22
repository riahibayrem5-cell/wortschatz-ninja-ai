import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'de' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation  
    dashboard: "Dashboard",
    vocabulary: "Vocabulary",
    exercises: "Exercises",
    writingAssistant: "Writing Assistant",
    conversations: "Conversations",
    review: "Review",
    history: "History",
    telcExam: "TELC Exam",
    progress: "Progress",
    communication: "Communication",
    practice: "Practice",
    foundations: "Foundations",
    aiCompanion: "AI Companion",
    settings: "Settings",
    subscriptions: "Subscriptions",
    
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    close: "Close",
    
    'nav.dashboard': 'Dashboard',
    'nav.vocabulary': 'Vocabulary',
    'nav.wordDossier': 'Word Dossier',
    'nav.sentence': 'Sentences',
    'nav.writing': 'Writing',
    'nav.exercises': 'Exercises',
    'nav.memorizer': 'Memorizer',
    'nav.wordAssociation': 'Word Association',
    'nav.conversation': 'Conversation',
    'nav.highlighter': 'Highlighter',
    'nav.diary': 'Mistake Diary',
    'nav.review': 'Review',
    'nav.activityLog': 'Activity Log',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.aiCompanion': 'AI Companion',
    'nav.telcExam': 'TELC B2 Exam',
    'nav.history': 'History & Export',
    'nav.foundations': 'Foundations',
    'nav.practice': 'Practice',
    'nav.communication': 'Communication',
    'nav.progress': 'Progress',
    'nav.serverStatus': 'Server Status',
    'nav.allSystemsOperational': 'All Systems Operational',
    'nav.performanceDegraded': 'Performance Degraded',
    'nav.serviceUnavailable': 'Service Unavailable',
    'nav.database': 'Database',
    'nav.apiLatency': 'API Latency',
    'nav.authService': 'Auth Service',
    'nav.online': 'Online',
    'nav.down': 'Down',
    'nav.active': 'Active',
    'nav.lastChecked': 'Last checked',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.wordsLearned': 'Words Learned',
    'dashboard.exercisesDone': 'Exercises Done',
    'dashboard.currentStreak': 'Current Streak',
    'dashboard.totalMistakes': 'Total Mistakes',
    'dashboard.weeklyActivity': 'Weekly Activity',
    'dashboard.weakSpots': 'Areas Needing Focus',
    'dashboard.recommendations': 'Recommended Next Steps',
    'dashboard.mistakeDistribution': 'Mistake Distribution',
    'dashboard.keepGoing': '🔥 Keep it going!',
    'dashboard.learningOpportunities': 'Learning opportunities',
    'dashboard.noWeakSpots': 'No weak spots identified yet. Keep practicing!',
    'dashboard.goal': 'Goal',
    'dashboard.words': 'words',
    'dashboard.exercises': 'exercises',
    'dashboard.errors': 'errors',
    
    // Server Status
    'server.healthy': 'All Systems Operational',
    'server.degraded': 'Degraded Performance',
    'server.down': 'System Down',
    
    // Theme
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    
    // Common
    'common.loading': 'Loading...',
    
    // Sentence Generator
    'sentence.title': 'Sentence Generator',
    'sentence.difficulty': 'Difficulty Level',
    'sentence.topic': 'Topic (optional)',
    'sentence.topicPlaceholder': 'Select a topic or leave empty',
    'sentence.noTopic': 'No specific topic',
    'sentence.customTopic': 'Custom Topic...',
    'sentence.customTopicPlaceholder': 'Enter your own topic...',
    'sentence.grammarFocus': 'Grammar Focus (optional)',
    'sentence.grammarPlaceholder': 'Select grammar point or leave empty',
    'sentence.noGrammar': 'No specific grammar',
    'sentence.generate': 'Generate Sentence',
    'sentence.generating': 'Generating...',
    'sentence.german': 'German',
    'sentence.english': 'English',
    'sentence.analysis': 'Grammatical Analysis',
    'sentence.generated': 'Sentence generated!',
    'sentence.error': 'Error',
    
    // Word Dossier
    'word.title': 'Word Dossier',
    'word.search': 'Enter a German word to analyze...',
    'word.analyze': 'Analyze',
    'word.analyzing': 'Analyzing...',
    'word.definition': 'Definition',
    'word.translation': 'Translation',
    'word.wordFamily': 'Word Family (Wortfamilie)',
    'word.prefixVerbs': 'Prefix Verbs',
    'word.synonyms': 'Synonyms',
    'word.antonyms': 'Antonyms',
    'word.examples': 'Example Sentences',
    
    // Vocabulary
    'vocabulary.title': 'Vocabulary Generator',
    'vocabulary.topic': 'Topic',
    'vocabulary.customTopic': 'Custom Topic',
    'vocabulary.numberOfWords': 'Number of words',
    'vocabulary.generate': 'Generate Vocabulary',
    'vocabulary.addToReview': 'Add to Review',
    'vocabulary.added': 'Added to review!',
    
    // Settings
    'settings.title': 'Settings',
    'settings.account': 'Account Information',
    'settings.email': 'Email',
    'settings.apiKeys': 'API Keys',
    'settings.preferences': 'Preferences',
    'settings.audioPlayback': 'Audio Playback',
    'settings.reviewReminders': 'Review Reminders',
    'settings.savePreferences': 'Save Preferences',
    'settings.dangerZone': 'Danger Zone',
    'settings.deleteAccount': 'Delete Account',
    
    // AI Companion
    'aiCompanion.title': 'AI Learning Companion',
    'aiCompanion.startConversation': 'Start Conversation',
    'aiCompanion.listening': 'Listening...',
    'aiCompanion.processing': 'Processing...',
    'aiCompanion.textMode': 'Text Mode',
    'aiCompanion.verbalMode': 'Verbal Mode',
    'aiCompanion.analyzeMistakes': 'Analyze Mistakes',
    
    // Subscriptions
    'subscriptions.title': 'Subscriptions',
    'subscriptions.choosePlan': 'Choose Your Plan',
    'subscriptions.currentPlan': 'Current Plan',
    'subscriptions.upgradeNow': 'Upgrade Now',
    'subscriptions.perMonth': 'per month',
    
    // Mistake Diary
    'diary.title': 'Mistake Diary',
    'diary.subtitle': 'Track and learn from your mistakes',
    'diary.exportPDF': 'Export PDF',
    'diary.openNewTab': 'Open in New Tab',
    'diary.totalMistakes': 'Total Mistakes',
    'diary.resolved': 'Resolved',
    'diary.active': 'Active',
    'diary.categories': 'Categories',
    'diary.completion': 'completion',
    'diary.search': 'Search mistakes...',
    'diary.showAll': 'Show All',
    'diary.showResolved': 'Show Resolved',
    'diary.all': 'All',
    'diary.listView': 'List View',
    'diary.analytics': 'Analytics',
    'diary.noMistakes': 'No mistakes found',
    'diary.tryAdjusting': 'Try adjusting your search',
    'diary.keepPracticing': 'Keep practicing to track your progress!',
    'diary.yourText': 'Your Text:',
    'diary.correction': 'Correction:',
    'diary.explanation': 'Explanation:',
    'diary.context': 'Context:',
    'diary.addNote': 'Add Note',
    'diary.editNote': 'Edit Note',
    'diary.saveNote': 'Save Note',
    'diary.notePlaceholder': 'Add your personal notes about this mistake...',
    'diary.markResolved': 'Mistake marked as resolved',
    'diary.markUnresolved': 'Marked as unresolved',
    'diary.mistakesByType': 'Mistakes by Type',
    'diary.mistakesByCategory': 'Mistakes by Category',
    'diary.autoDetecting': 'Auto-detecting mistakes...',
    'diary.autoDetect': 'Auto-Detect',
    'diary.mistakeDeleted': 'Mistake deleted successfully',
    'diary.deleteFailed': 'Failed to delete mistake',
    'diary.noContentFound': 'No content to analyze',
    'diary.completeExercises': 'Complete some exercises first',
    'diary.detected': 'Detected',
    'diary.newMistakes': 'new mistake(s)',
    'diary.noNewMistakes': 'No new mistakes detected',
    'diary.greatJob': 'Great job! Keep practicing!',
    'diary.autoDetectFailed': 'Failed to auto-detect mistakes',
    
    // Learning German - Always keep this in German
    'learningGerman': 'Learning German',
    
    // TELC B2 Preparation
    'telc.title': 'TELC B2 Exam Preparation',
    'telc.subtitle': 'Prepare for your TELC B2 exam with interactive exercises and AI coaching',
    'telc.examSections': 'Exam Sections',
    'telc.myProgress': 'My Progress',
    'telc.startExam': 'Start Mock Exam',
    'telc.startPractice': 'Start Practice',
    'telc.showAll': 'Show All',
    'telc.passingScore': 'Passing Score',
    'telc.maxPoints': 'Max Points',
    'telc.totalDuration': 'Total Duration',
    'telc.examParts': 'Exam Parts',
    'telc.progress': 'Progress',
    'telc.points': 'points',
    'telc.minutes': 'minutes',
    'telc.parts': 'parts',
    'telc.exercises': 'Exercises',
    'telc.days': 'Days',
    
    // Sections
    'telc.section.reading': 'Reading Comprehension',
    'telc.section.listening': 'Listening Comprehension',
    'telc.section.writing': 'Written Expression',
    'telc.section.speaking': 'Oral Expression',
    'telc.section.sprachbausteine': 'Language Elements',
    
    // Stats
    'telc.stats.examsTaken': 'Exams Taken',
    'telc.stats.averageScore': 'Average Score',
    'telc.stats.dayStreak': 'Day Streak 🔥',
    'telc.stats.practiceTime': 'Practice Time',
    'telc.stats.sectionPerformance': 'Section Performance',
    'telc.stats.best': 'Best',
    'telc.stats.focus': 'Focus',
    
    // Grades
    'telc.grade.excellent': 'Excellent',
    'telc.grade.good': 'Good',
    'telc.grade.satisfactory': 'Satisfactory',
    'telc.grade.sufficient': 'Sufficient',
    'telc.grade.failed': 'Not Passed',
    
    // Study Plan
    'telc.studyPlan.todayLearn': 'Learn Today',
    'telc.studyPlan.examDate': 'TELC B2 Exam',
    'telc.studyPlan.dailyGoal': 'Daily Goal',
    'telc.studyPlan.tasksCompleted': 'tasks completed',
    'telc.studyPlan.thisWeek': 'This Week',
    'telc.studyPlan.recommendedExercises': 'Recommended Exercises',
    'telc.studyPlan.mockExam': 'Mock Exam',
    
    // Progress Cards
    'telc.progressCard.advanced': 'Advanced',
    'telc.progressCard.intermediate': 'Intermediate',
    'telc.progressCard.beginner': 'Beginner',
    'telc.progressCard.newStart': 'Start New',
    'telc.progressCard.bestScore': 'Best Score',
    
    // Tips
    'telc.tips.example': 'Example:',
  },
  de: {
    'nav.dashboard': 'Dashboard',
    'nav.vocabulary': 'Wortschatz',
    'nav.wordDossier': 'Wort-Dossier',
    'nav.sentence': 'Sätze',
    'nav.writing': 'Schreiben',
    'nav.exercises': 'Übungen',
    'nav.memorizer': 'Memorizer',
    'nav.wordAssociation': 'Wortassoziation',
    'nav.conversation': 'Konversation',
    'nav.highlighter': 'Textmarker',
    'nav.diary': 'Fehlertagebuch',
    'nav.review': 'Wiederholen',
    'nav.activityLog': 'Aktivitätsprotokoll',
    'nav.settings': 'Einstellungen',
    'nav.logout': 'Abmelden',
    'nav.aiCompanion': 'KI-Begleiter',
    'nav.telcExam': 'TELC B2 Prüfung',
    'nav.history': 'Verlauf & Export',
    'nav.foundations': 'Grundlagen',
    'nav.practice': 'Übung',
    'nav.communication': 'Kommunikation',
    'nav.progress': 'Fortschritt',
    'nav.serverStatus': 'Serverstatus',
    'nav.allSystemsOperational': 'Alle Systeme betriebsbereit',
    'nav.performanceDegraded': 'Leistung beeinträchtigt',
    'nav.serviceUnavailable': 'Service nicht verfügbar',
    'nav.database': 'Datenbank',
    'nav.apiLatency': 'API-Latenz',
    'nav.authService': 'Auth-Service',
    'nav.online': 'Online',
    'nav.down': 'Offline',
    'nav.active': 'Aktiv',
    'nav.lastChecked': 'Zuletzt geprüft',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.wordsLearned': 'Gelernte Wörter',
    'dashboard.exercisesDone': 'Erledigte Übungen',
    'dashboard.currentStreak': 'Aktuelle Serie',
    'dashboard.totalMistakes': 'Gesamte Fehler',
    'dashboard.weeklyActivity': 'Wöchentliche Aktivität',
    'dashboard.weakSpots': 'Bereiche, die Aufmerksamkeit brauchen',
    'dashboard.recommendations': 'Empfohlene nächste Schritte',
    'dashboard.mistakeDistribution': 'Fehlerverteilung',
    'dashboard.keepGoing': '🔥 Weiter so!',
    'dashboard.learningOpportunities': 'Lernmöglichkeiten',
    'dashboard.noWeakSpots': 'Noch keine Schwachstellen identifiziert. Üben Sie weiter!',
    'dashboard.goal': 'Ziel',
    'dashboard.words': 'Wörter',
    'dashboard.exercises': 'Übungen',
    'dashboard.errors': 'Fehler',
    
    // Server Status
    'server.healthy': 'Alle Systeme betriebsbereit',
    'server.degraded': 'Eingeschränkte Leistung',
    'server.down': 'System ausgefallen',
    
    // Theme
    'theme.light': 'Heller Modus',
    'theme.dark': 'Dunkler Modus',
    
    // Common
    'common.loading': 'Lädt...',
    
    // Sentence Generator
    'sentence.title': 'Satzgenerator',
    'sentence.difficulty': 'Schwierigkeitsgrad',
    'sentence.topic': 'Thema (optional)',
    'sentence.topicPlaceholder': 'Thema auswählen oder leer lassen',
    'sentence.noTopic': 'Kein bestimmtes Thema',
    'sentence.customTopic': 'Benutzerdefiniertes Thema...',
    'sentence.customTopicPlaceholder': 'Eigenes Thema eingeben...',
    'sentence.grammarFocus': 'Grammatik-Fokus (optional)',
    'sentence.grammarPlaceholder': 'Grammatikpunkt auswählen oder leer lassen',
    'sentence.noGrammar': 'Keine bestimmte Grammatik',
    'sentence.generate': 'Satz Generieren',
    'sentence.generating': 'Generiere...',
    'sentence.german': 'Deutsch',
    'sentence.english': 'Englisch',
    'sentence.analysis': 'Grammatikalische Analyse',
    'sentence.generated': 'Satz generiert!',
    'sentence.error': 'Fehler',
    
    // Word Dossier
    'word.title': 'Wort-Dossier',
    'word.search': 'Geben Sie ein deutsches Wort zur Analyse ein...',
    'word.analyze': 'Analysieren',
    'word.analyzing': 'Analysiere...',
    'word.definition': 'Definition',
    'word.translation': 'Übersetzung',
    'word.wordFamily': 'Wortfamilie',
    'word.prefixVerbs': 'Präfixverben',
    'word.synonyms': 'Synonyme',
    'word.antonyms': 'Antonyme',
    'word.examples': 'Beispielsätze',
    
    // Vocabulary
    'vocabulary.title': 'Vokabel-Generator',
    'vocabulary.topic': 'Thema',
    'vocabulary.customTopic': 'Benutzerdefiniertes Thema',
    'vocabulary.numberOfWords': 'Anzahl der Wörter',
    'vocabulary.generate': 'Vokabeln generieren',
    'vocabulary.addToReview': 'Zur Wiederholung hinzufügen',
    'vocabulary.added': 'Zur Wiederholung hinzugefügt!',
    
    // Settings
    'settings.title': 'Einstellungen',
    'settings.account': 'Kontoinformationen',
    'settings.email': 'E-Mail',
    'settings.apiKeys': 'API-Schlüssel',
    'settings.preferences': 'Einstellungen',
    'settings.audioPlayback': 'Audio-Wiedergabe',
    'settings.reviewReminders': 'Wiederholungserinnerungen',
    'settings.savePreferences': 'Einstellungen speichern',
    'settings.dangerZone': 'Gefahrenzone',
    'settings.deleteAccount': 'Konto löschen',
    
    // AI Companion
    'aiCompanion.title': 'KI-Lernbegleiter',
    'aiCompanion.startConversation': 'Gespräch starten',
    'aiCompanion.listening': 'Höre zu...',
    'aiCompanion.processing': 'Verarbeitung...',
    'aiCompanion.textMode': 'Textmodus',
    'aiCompanion.verbalMode': 'Verbaler Modus',
    'aiCompanion.analyzeMistakes': 'Fehler analysieren',
    
    // Subscriptions
    'subscriptions.title': 'Abonnements',
    'subscriptions.choosePlan': 'Wählen Sie Ihren Plan',
    'subscriptions.currentPlan': 'Aktueller Plan',
    'subscriptions.upgradeNow': 'Jetzt upgraden',
    'subscriptions.perMonth': 'pro Monat',
    
    // Mistake Diary
    'diary.title': 'Fehlertagebuch',
    'diary.subtitle': 'Verfolgen und lernen Sie aus Ihren Fehlern',
    'diary.exportPDF': 'PDF exportieren',
    'diary.openNewTab': 'In neuem Tab öffnen',
    'diary.totalMistakes': 'Gesamte Fehler',
    'diary.resolved': 'Gelöst',
    'diary.active': 'Aktiv',
    'diary.categories': 'Kategorien',
    'diary.completion': 'Abschluss',
    'diary.search': 'Fehler suchen...',
    'diary.showAll': 'Alle anzeigen',
    'diary.showResolved': 'Gelöste anzeigen',
    'diary.all': 'Alle',
    'diary.listView': 'Listenansicht',
    'diary.analytics': 'Analytik',
    'diary.noMistakes': 'Keine Fehler gefunden',
    'diary.tryAdjusting': 'Versuchen Sie, Ihre Suche anzupassen',
    'diary.keepPracticing': 'Üben Sie weiter, um Ihren Fortschritt zu verfolgen!',
    'diary.yourText': 'Ihr Text:',
    'diary.correction': 'Korrektur:',
    'diary.explanation': 'Erklärung:',
    'diary.context': 'Kontext:',
    'diary.addNote': 'Notiz hinzufügen',
    'diary.editNote': 'Notiz bearbeiten',
    'diary.saveNote': 'Notiz speichern',
    'diary.notePlaceholder': 'Fügen Sie Ihre persönlichen Notizen zu diesem Fehler hinzu...',
    'diary.markResolved': 'Fehler als gelöst markiert',
    'diary.markUnresolved': 'Als ungelöst markiert',
    'diary.mistakesByType': 'Fehler nach Typ',
    'diary.mistakesByCategory': 'Fehler nach Kategorie',
    'diary.autoDetecting': 'Automatische Fehlererkennung...',
    'diary.autoDetect': 'Auto-Erkennung',
    'diary.mistakeDeleted': 'Fehler erfolgreich gelöscht',
    'diary.deleteFailed': 'Fehler beim Löschen',
    'diary.noContentFound': 'Kein Inhalt zum Analysieren',
    'diary.completeExercises': 'Vervollständigen Sie zuerst einige Übungen',
    'diary.detected': 'Erkannt',
    'diary.newMistakes': 'neue(r) Fehler',
    'diary.noNewMistakes': 'Keine neuen Fehler erkannt',
    'diary.greatJob': 'Gute Arbeit! Üben Sie weiter!',
    'diary.autoDetectFailed': 'Automatische Fehlererkennung fehlgeschlagen',
    
    // Learning German - Always keep this in German
    'learningGerman': 'Deutsch lernen',
    
    // TELC B2 Preparation
    'telc.title': 'TELC B2 Prüfungsvorbereitung',
    'telc.subtitle': 'Bereite dich optimal auf deine TELC B2 Prüfung vor mit interaktiven Übungen und KI-Coaching',
    'telc.examSections': 'Prüfungsbereiche',
    'telc.myProgress': 'Mein Fortschritt',
    'telc.startExam': 'Probeklausur starten',
    'telc.startPractice': 'Übungen starten',
    'telc.showAll': 'Alle anzeigen',
    'telc.passingScore': 'Bestehensgrenze',
    'telc.maxPoints': 'Maximalpunkte',
    'telc.totalDuration': 'Gesamtdauer',
    'telc.examParts': 'Prüfungsteile',
    'telc.progress': 'Fortschritt',
    'telc.points': 'Punkte',
    'telc.minutes': 'Minuten',
    'telc.parts': 'Teile',
    'telc.exercises': 'Übungen',
    'telc.days': 'Tage',
    
    // Sections
    'telc.section.reading': 'Leseverstehen',
    'telc.section.listening': 'Hörverstehen',
    'telc.section.writing': 'Schriftlicher Ausdruck',
    'telc.section.speaking': 'Mündlicher Ausdruck',
    'telc.section.sprachbausteine': 'Sprachbausteine',
    
    // Stats
    'telc.stats.examsTaken': 'Prüfungen absolviert',
    'telc.stats.averageScore': 'Durchschnitt',
    'telc.stats.dayStreak': 'Tage-Serie 🔥',
    'telc.stats.practiceTime': 'Übungszeit',
    'telc.stats.sectionPerformance': 'Bereichsleistung',
    'telc.stats.best': 'Beste',
    'telc.stats.focus': 'Fokus',
    
    // Grades
    'telc.grade.excellent': 'Sehr gut',
    'telc.grade.good': 'Gut',
    'telc.grade.satisfactory': 'Befriedigend',
    'telc.grade.sufficient': 'Ausreichend',
    'telc.grade.failed': 'Nicht bestanden',
    
    // Study Plan
    'telc.studyPlan.todayLearn': 'Heute lernen',
    'telc.studyPlan.examDate': 'TELC B2 Prüfung',
    'telc.studyPlan.dailyGoal': 'Tagesziel',
    'telc.studyPlan.tasksCompleted': 'Aufgaben erledigt',
    'telc.studyPlan.thisWeek': 'Diese Woche',
    'telc.studyPlan.recommendedExercises': 'Empfohlene Übungen',
    'telc.studyPlan.mockExam': 'Probeklausur',
    
    // Progress Cards
    'telc.progressCard.advanced': 'Fortgeschritten',
    'telc.progressCard.intermediate': 'Gut',
    'telc.progressCard.beginner': 'Anfänger',
    'telc.progressCard.newStart': 'Neu starten',
    'telc.progressCard.bestScore': 'Beste Note',
    
    // Tips
    'telc.tips.example': 'Beispiel:',
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.vocabulary': 'المفردات',
    'nav.wordDossier': 'ملف الكلمات',
    'nav.sentence': 'الجمل',
    'nav.writing': 'الكتابة',
    'nav.exercises': 'التمارين',
    'nav.memorizer': 'الحفظ',
    'nav.wordAssociation': 'ربط الكلمات',
    'nav.conversation': 'المحادثة',
    'nav.highlighter': 'التظليل',
    'nav.diary': 'يومية الأخطاء',
    'nav.review': 'المراجعة',
    'nav.activityLog': 'سجل النشاط',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',
    'nav.aiCompanion': 'رفيق الذكاء الاصطناعي',
    'nav.telcExam': 'امتحان TELC B2',
    'nav.history': 'السجل والتصدير',
    'nav.foundations': 'الأساسيات',
    'nav.practice': 'التدريب',
    'nav.communication': 'التواصل',
    'nav.progress': 'التقدم',
    'nav.serverStatus': 'حالة الخادم',
    'nav.allSystemsOperational': 'جميع الأنظمة تعمل',
    'nav.performanceDegraded': 'الأداء منخفض',
    'nav.serviceUnavailable': 'الخدمة غير متاحة',
    'nav.database': 'قاعدة البيانات',
    'nav.apiLatency': 'وقت استجابة API',
    'nav.authService': 'خدمة المصادقة',
    'nav.online': 'متصل',
    'nav.down': 'معطل',
    'nav.active': 'نشط',
    'nav.lastChecked': 'آخر فحص',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.wordsLearned': 'الكلمات المتعلمة',
    'dashboard.exercisesDone': 'التمارين المنجزة',
    'dashboard.currentStreak': 'السلسلة الحالية',
    'dashboard.totalMistakes': 'إجمالي الأخطاء',
    'dashboard.weeklyActivity': 'النشاط الأسبوعي',
    'dashboard.weakSpots': 'المجالات التي تحتاج إلى تركيز',
    'dashboard.recommendations': 'الخطوات التالية الموصى بها',
    'dashboard.mistakeDistribution': 'توزيع الأخطاء',
    'dashboard.keepGoing': '🔥 استمر!',
    'dashboard.learningOpportunities': 'فرص التعلم',
    'dashboard.noWeakSpots': 'لم يتم تحديد نقاط ضعف بعد. استمر في الممارسة!',
    'dashboard.goal': 'الهدف',
    'dashboard.words': 'كلمات',
    'dashboard.exercises': 'تمارين',
    'dashboard.errors': 'أخطاء',
    
    // Server Status
    'server.healthy': 'جميع الأنظمة تعمل',
    'server.degraded': 'أداء منخفض',
    'server.down': 'النظام معطل',
    
    // Theme
    'theme.light': 'الوضع الفاتح',
    'theme.dark': 'الوضع الداكن',
    
    // Common
    'common.loading': 'جاري التحميل...',
    
    // Sentence Generator
    'sentence.title': 'مولد الجمل',
    'sentence.difficulty': 'مستوى الصعوبة',
    'sentence.topic': 'الموضوع (اختياري)',
    'sentence.topicPlaceholder': 'اختر موضوعاً أو اتركه فارغاً',
    'sentence.noTopic': 'لا يوجد موضوع محدد',
    'sentence.customTopic': 'موضوع مخصص...',
    'sentence.customTopicPlaceholder': 'أدخل موضوعك الخاص...',
    'sentence.grammarFocus': 'التركيز النحوي (اختياري)',
    'sentence.grammarPlaceholder': 'اختر نقطة نحوية أو اتركها فارغة',
    'sentence.noGrammar': 'لا توجد قواعد محددة',
    'sentence.generate': 'إنشاء جملة',
    'sentence.generating': 'جاري الإنشاء...',
    'sentence.german': 'الألمانية',
    'sentence.english': 'الإنجليزية',
    'sentence.analysis': 'التحليل النحوي',
    'sentence.generated': 'تم إنشاء الجملة!',
    'sentence.error': 'خطأ',
    
    // Word Dossier
    'word.title': 'ملف الكلمة',
    'word.search': 'أدخل كلمة ألمانية للتحليل...',
    'word.analyze': 'تحليل',
    'word.analyzing': 'جاري التحليل...',
    'word.definition': 'التعريف',
    'word.translation': 'الترجمة',
    'word.wordFamily': 'عائلة الكلمة',
    'word.prefixVerbs': 'أفعال البادئة',
    'word.synonyms': 'المرادفات',
    'word.antonyms': 'الأضداد',
    'word.examples': 'جمل مثالية',
    
    // Vocabulary
    'vocabulary.title': 'مولد المفردات',
    'vocabulary.topic': 'الموضوع',
    'vocabulary.customTopic': 'موضوع مخصص',
    'vocabulary.numberOfWords': 'عدد الكلمات',
    'vocabulary.generate': 'توليد المفردات',
    'vocabulary.addToReview': 'إضافة للمراجعة',
    'vocabulary.added': 'تمت الإضافة للمراجعة!',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.account': 'معلومات الحساب',
    'settings.email': 'البريد الإلكتروني',
    'settings.apiKeys': 'مفاتيح API',
    'settings.preferences': 'التفضيلات',
    'settings.audioPlayback': 'تشغيل الصوت',
    'settings.reviewReminders': 'تذكيرات المراجعة',
    'settings.savePreferences': 'حفظ التفضيلات',
    'settings.dangerZone': 'منطقة الخطر',
    'settings.deleteAccount': 'حذف الحساب',
    
    // AI Companion
    'aiCompanion.title': 'رفيق التعلم الذكي',
    'aiCompanion.startConversation': 'بدء المحادثة',
    'aiCompanion.listening': 'الاستماع...',
    'aiCompanion.processing': 'جاري المعالجة...',
    'aiCompanion.textMode': 'وضع النص',
    'aiCompanion.verbalMode': 'الوضع الشفهي',
    'aiCompanion.analyzeMistakes': 'تحليل الأخطاء',
    
    // Subscriptions
    'subscriptions.title': 'الاشتراكات',
    'subscriptions.choosePlan': 'اختر خطتك',
    'subscriptions.currentPlan': 'الخطة الحالية',
    'subscriptions.upgradeNow': 'ترقية الآن',
    'subscriptions.perMonth': 'شهريًا',
    
    // Mistake Diary
    'diary.title': 'يومية الأخطاء',
    'diary.subtitle': 'تتبع وتعلم من أخطائك',
    'diary.exportPDF': 'تصدير PDF',
    'diary.openNewTab': 'فتح في علامة تبويب جديدة',
    'diary.totalMistakes': 'إجمالي الأخطاء',
    'diary.resolved': 'تم الحل',
    'diary.active': 'نشط',
    'diary.categories': 'الفئات',
    'diary.completion': 'الإكمال',
    'diary.search': 'البحث عن الأخطاء...',
    'diary.showAll': 'إظهار الكل',
    'diary.showResolved': 'إظهار المحلول',
    'diary.all': 'الكل',
    'diary.listView': 'عرض القائمة',
    'diary.analytics': 'التحليلات',
    'diary.noMistakes': 'لم يتم العثور على أخطاء',
    'diary.tryAdjusting': 'حاول تعديل بحثك',
    'diary.keepPracticing': 'استمر في الممارسة لتتبع تقدمك!',
    'diary.yourText': 'نصك:',
    'diary.correction': 'التصحيح:',
    'diary.explanation': 'الشرح:',
    'diary.context': 'السياق:',
    'diary.addNote': 'إضافة ملاحظة',
    'diary.editNote': 'تحرير الملاحظة',
    'diary.saveNote': 'حفظ الملاحظة',
    'diary.notePlaceholder': 'أضف ملاحظاتك الشخصية حول هذا الخطأ...',
    'diary.markResolved': 'تم تحديد الخطأ كمحلول',
    'diary.markUnresolved': 'تحديد كغير محلول',
    'diary.mistakesByType': 'الأخطاء حسب النوع',
    'diary.mistakesByCategory': 'الأخطاء حسب الفئة',
    'diary.autoDetecting': 'الكشف التلقائي عن الأخطاء...',
    'diary.autoDetect': 'الكشف التلقائي',
    'diary.mistakeDeleted': 'تم حذف الخطأ بنجاح',
    'diary.deleteFailed': 'فشل في حذف الخطأ',
    'diary.noContentFound': 'لا يوجد محتوى للتحليل',
    'diary.completeExercises': 'أكمل بعض التمارين أولاً',
    'diary.detected': 'تم الكشف عن',
    'diary.newMistakes': 'خطأ (أخطاء) جديد',
    'diary.noNewMistakes': 'لم يتم الكشف عن أخطاء جديدة',
    'diary.greatJob': 'عمل رائع! استمر في الممارسة!',
    'diary.autoDetectFailed': 'فشل الكشف التلقائي عن الأخطاء',
    
    // Learning German - Always keep this in German
    'learningGerman': 'تعلم الألمانية',
    
    // TELC B2 Preparation
    'telc.title': 'التحضير لامتحان TELC B2',
    'telc.subtitle': 'استعد لامتحان TELC B2 مع تمارين تفاعلية وتدريب بالذكاء الاصطناعي',
    'telc.examSections': 'أقسام الامتحان',
    'telc.myProgress': 'تقدمي',
    'telc.startExam': 'بدء الامتحان التجريبي',
    'telc.startPractice': 'بدء التمارين',
    'telc.showAll': 'عرض الكل',
    'telc.passingScore': 'درجة النجاح',
    'telc.maxPoints': 'أقصى النقاط',
    'telc.totalDuration': 'المدة الإجمالية',
    'telc.examParts': 'أقسام الامتحان',
    'telc.progress': 'التقدم',
    'telc.points': 'نقاط',
    'telc.minutes': 'دقائق',
    'telc.parts': 'أجزاء',
    'telc.exercises': 'تمارين',
    'telc.days': 'أيام',
    
    // Sections
    'telc.section.reading': 'فهم القراءة',
    'telc.section.listening': 'فهم الاستماع',
    'telc.section.writing': 'التعبير الكتابي',
    'telc.section.speaking': 'التعبير الشفهي',
    'telc.section.sprachbausteine': 'العناصر اللغوية',
    
    // Stats
    'telc.stats.examsTaken': 'الامتحانات المؤداة',
    'telc.stats.averageScore': 'متوسط الدرجة',
    'telc.stats.dayStreak': 'أيام متتالية 🔥',
    'telc.stats.practiceTime': 'وقت الممارسة',
    'telc.stats.sectionPerformance': 'أداء الأقسام',
    'telc.stats.best': 'الأفضل',
    'telc.stats.focus': 'التركيز',
    
    // Grades
    'telc.grade.excellent': 'ممتاز',
    'telc.grade.good': 'جيد',
    'telc.grade.satisfactory': 'مقبول',
    'telc.grade.sufficient': 'كافٍ',
    'telc.grade.failed': 'غير ناجح',
    
    // Study Plan
    'telc.studyPlan.todayLearn': 'تعلم اليوم',
    'telc.studyPlan.examDate': 'امتحان TELC B2',
    'telc.studyPlan.dailyGoal': 'الهدف اليومي',
    'telc.studyPlan.tasksCompleted': 'المهام المنجزة',
    'telc.studyPlan.thisWeek': 'هذا الأسبوع',
    'telc.studyPlan.recommendedExercises': 'التمارين الموصى بها',
    'telc.studyPlan.mockExam': 'امتحان تجريبي',
    
    // Progress Cards
    'telc.progressCard.advanced': 'متقدم',
    'telc.progressCard.intermediate': 'جيد',
    'telc.progressCard.beginner': 'مبتدئ',
    'telc.progressCard.newStart': 'ابدأ جديد',
    'telc.progressCard.bestScore': 'أفضل درجة',
    
    // Tips
    'telc.tips.example': 'مثال:',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
