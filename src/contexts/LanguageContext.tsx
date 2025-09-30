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
    'nav.dashboard': 'Dashboard',
    'nav.vocabulary': 'Vocabulary',
    'nav.sentence': 'Sentences',
    'nav.writing': 'Writing',
    'nav.exercises': 'Exercises',
    'nav.memorizer': 'Memorizer',
    'nav.conversation': 'Conversation',
    'nav.highlighter': 'Highlighter',
    'nav.diary': 'Mistake Diary',
    'nav.review': 'Review',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
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
  },
  de: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.vocabulary': 'Wortschatz',
    'nav.sentence': 'Sätze',
    'nav.writing': 'Schreiben',
    'nav.exercises': 'Übungen',
    'nav.memorizer': 'Memorizer',
    'nav.conversation': 'Konversation',
    'nav.highlighter': 'Textmarker',
    'nav.diary': 'Fehlertagebuch',
    'nav.review': 'Wiederholen',
    'nav.settings': 'Einstellungen',
    'nav.logout': 'Abmelden',
    
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
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.vocabulary': 'المفردات',
    'nav.sentence': 'الجمل',
    'nav.writing': 'الكتابة',
    'nav.exercises': 'التمارين',
    'nav.memorizer': 'الحفظ',
    'nav.conversation': 'المحادثة',
    'nav.highlighter': 'التظليل',
    'nav.diary': 'يومية الأخطاء',
    'nav.review': 'المراجعة',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',
    
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
