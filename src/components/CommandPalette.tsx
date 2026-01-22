import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BookOpen,
  Brain,
  FileText,
  GraduationCap,
  History,
  MessageSquare,
  PenTool,
  Settings,
  Trophy,
  Lightbulb,
  BookMarked,
  Puzzle,
  RefreshCw,
  Highlighter,
  BookOpenCheck,
  Target,
  Award,
  Bot,
  BarChart3,
  CreditCard,
  Home,
  Search,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  labelDe: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  keywords: string[];
  group: string;
}

const navigationItems: CommandItem[] = [
  // Main
  { id: "dashboard", label: "Dashboard", labelDe: "Dashboard", icon: Home, path: "/dashboard", keywords: ["home", "start", "main"], group: "main" },
  { id: "settings", label: "Settings", labelDe: "Einstellungen", icon: Settings, path: "/settings", keywords: ["preferences", "account", "profile"], group: "main" },
  
  // Foundations
  { id: "vocabulary", label: "Vocabulary", labelDe: "Wortschatz", icon: BookOpen, path: "/vocabulary", keywords: ["words", "learn", "vocab"], group: "foundations" },
  { id: "word-dossier", label: "Word Dossier", labelDe: "Wort-Dossier", icon: FileText, path: "/word-dossier", keywords: ["analyze", "deep", "meaning"], group: "foundations" },
  { id: "sentence-generator", label: "Sentence Generator", labelDe: "Satzgenerator", icon: PenTool, path: "/sentence-generator", keywords: ["create", "practice", "context"], group: "foundations" },
  { id: "mastery-course", label: "B2 Mastery Course", labelDe: "B2 Meisterkurs", icon: GraduationCap, path: "/mastery-course", keywords: ["course", "learn", "structured"], group: "foundations" },
  { id: "learning-path", label: "Learning Path", labelDe: "Lernpfad", icon: Target, path: "/learning-path", keywords: ["plan", "goals", "progress"], group: "foundations" },
  
  // Practice
  { id: "exercises", label: "Exercises", labelDe: "Übungen", icon: Puzzle, path: "/exercises", keywords: ["practice", "quiz", "test"], group: "practice" },
  { id: "memorizer", label: "Memorizer", labelDe: "Memorizer", icon: Brain, path: "/memorizer", keywords: ["flashcards", "srs", "remember"], group: "practice" },
  { id: "word-association", label: "Word Association", labelDe: "Wortassoziation", icon: Lightbulb, path: "/word-association", keywords: ["connect", "relate", "links"], group: "practice" },
  { id: "highlighter", label: "Text Highlighter", labelDe: "Textmarker", icon: Highlighter, path: "/highlighter", keywords: ["read", "mark", "annotate"], group: "practice" },
  
  // Communication
  { id: "conversation", label: "Conversation", labelDe: "Konversation", icon: MessageSquare, path: "/conversation", keywords: ["speak", "talk", "chat", "dialog"], group: "communication" },
  { id: "writing", label: "Writing Assistant", labelDe: "Schreibassistent", icon: PenTool, path: "/writing", keywords: ["write", "essay", "text"], group: "communication" },
  
  // Progress
  { id: "review", label: "Smart Review", labelDe: "Smart Review", icon: RefreshCw, path: "/review", keywords: ["spaced", "repetition", "revise"], group: "progress" },
  { id: "diary", label: "Mistake Diary", labelDe: "Fehlertagebuch", icon: BookMarked, path: "/diary", keywords: ["errors", "learn", "improve"], group: "progress" },
  { id: "achievements", label: "Achievements", labelDe: "Erfolge", icon: Trophy, path: "/achievements", keywords: ["badges", "rewards", "gamification"], group: "progress" },
  { id: "certificates", label: "Certificates", labelDe: "Zertifikate", icon: Award, path: "/certificates", keywords: ["award", "completion", "proof"], group: "progress" },
  { id: "history", label: "History", labelDe: "Verlauf", icon: History, path: "/history", keywords: ["past", "log", "activity"], group: "progress" },
  { id: "activity-log", label: "Activity Log", labelDe: "Aktivitätsprotokoll", icon: BarChart3, path: "/activity-log", keywords: ["stats", "analytics", "tracking"], group: "progress" },
  
  // TELC
  { id: "telc-exam", label: "TELC Exam Simulator", labelDe: "TELC Prüfungssimulator", icon: BookOpenCheck, path: "/telc-exam", keywords: ["test", "exam", "b2", "certification"], group: "telc" },
  { id: "telc-vorbereitung", label: "TELC Preparation", labelDe: "TELC Vorbereitung", icon: GraduationCap, path: "/telc-vorbereitung", keywords: ["prepare", "practice", "section"], group: "telc" },
  
  // AI
  { id: "ai-companion", label: "AI Companion", labelDe: "KI-Begleiter", icon: Bot, path: "/ai-companion", keywords: ["assistant", "help", "tutor", "ai"], group: "ai" },
  
  // Account
  { id: "subscriptions", label: "Subscriptions", labelDe: "Abonnements", icon: CreditCard, path: "/subscriptions", keywords: ["billing", "plan", "upgrade", "premium"], group: "account" },
];

const groupLabels: Record<string, { en: string; de: string }> = {
  main: { en: "Navigation", de: "Navigation" },
  foundations: { en: "Foundations", de: "Grundlagen" },
  practice: { en: "Practice", de: "Übung" },
  communication: { en: "Communication", de: "Kommunikation" },
  progress: { en: "Progress", de: "Fortschritt" },
  telc: { en: "TELC B2", de: "TELC B2" },
  ai: { en: "AI Features", de: "KI-Funktionen" },
  account: { en: "Account", de: "Konto" },
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    navigate(path);
  }, [navigate]);

  const getLabel = (item: CommandItem) => {
    return language === "de" ? item.labelDe : item.label;
  };

  const getGroupLabel = (group: string) => {
    const labels = groupLabels[group];
    return language === "de" ? labels.de : labels.en;
  };

  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const groupOrder = ["main", "foundations", "practice", "communication", "progress", "telc", "ai", "account"];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder={language === "de" ? "Suche nach Seiten..." : "Search pages..."} 
      />
      <CommandList>
        <CommandEmpty>
          {language === "de" ? "Keine Ergebnisse gefunden." : "No results found."}
        </CommandEmpty>
        
        {groupOrder.map((group, idx) => {
          const items = groupedItems[group];
          if (!items) return null;
          
          return (
            <div key={group}>
              {idx > 0 && <CommandSeparator />}
              <CommandGroup heading={getGroupLabel(group)}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.labelDe} ${item.keywords.join(" ")}`}
                    onSelect={() => handleSelect(item.path)}
                    className="cursor-pointer"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{getLabel(item)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
