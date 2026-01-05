import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  FileText,
  Target,
  Clock,
  ChevronRight,
  ChevronLeft,
  Star,
  Award,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  Brain,
  Lightbulb,
  Loader2,
  RotateCcw,
  Send,
  ArrowRight,
  Home,
  Volume2,
  Square,
  Circle,
  GraduationCap,
  Timer,
  MessageSquare,
  Zap,
  Trophy,
  BarChart3,
  ArrowLeft
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TELC B2 Section Configuration
// ─────────────────────────────────────────────────────────────
const TELC_SECTIONS = {
  lesen: {
    id: "lesen",
    title: "Leseverstehen",
    titleEn: "Reading Comprehension",
    icon: BookOpen,
    color: "hsl(217 91% 60%)",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/20",
    borderClass: "border-blue-500/30",
    textClass: "text-blue-600 dark:text-blue-400",
    duration: 90,
    maxPoints: 75,
    teile: [
      { number: 1, title: "Globalverstehen", description: "5 Überschriften zu Textabschnitten zuordnen", points: 25 },
      { number: 2, title: "Detailverstehen", description: "Längeren Text lesen, 5 MC-Fragen beantworten", points: 25 },
      { number: 3, title: "Selektives Verstehen", description: "10 Situationen zu Anzeigen zuordnen", points: 25 }
    ]
  },
  sprachbausteine: {
    id: "sprachbausteine",
    title: "Sprachbausteine",
    titleEn: "Language Elements",
    icon: PenTool,
    color: "hsl(271 81% 56%)",
    bgClass: "bg-purple-500/10 dark:bg-purple-500/20",
    borderClass: "border-purple-500/30",
    textClass: "text-purple-600 dark:text-purple-400",
    duration: 30,
    maxPoints: 30,
    teile: [
      { number: 1, title: "Grammatik im Kontext", description: "10 Lücken mit je 3 Optionen füllen", points: 15 },
      { number: 2, title: "Wortschatz und Struktur", description: "10 Lücken aus Wortbank füllen", points: 15 }
    ]
  },
  hoeren: {
    id: "hoeren",
    title: "Hörverstehen",
    titleEn: "Listening Comprehension",
    icon: Headphones,
    color: "hsl(142 71% 45%)",
    bgClass: "bg-green-500/10 dark:bg-green-500/20",
    borderClass: "border-green-500/30",
    textClass: "text-green-600 dark:text-green-400",
    duration: 20,
    maxPoints: 75,
    teile: [
      { number: 1, title: "Globalverstehen", description: "5 kurze Texte hören, Themen zuordnen", points: 25 },
      { number: 2, title: "Detailverstehen", description: "Längeren Text hören, richtig/falsch", points: 25 },
      { number: 3, title: "Selektives Verstehen", description: "5 Dialoge hören, MC-Fragen", points: 25 }
    ]
  },
  schreiben: {
    id: "schreiben",
    title: "Schriftlicher Ausdruck",
    titleEn: "Written Expression",
    icon: FileText,
    color: "hsl(25 95% 53%)",
    bgClass: "bg-orange-500/10 dark:bg-orange-500/20",
    borderClass: "border-orange-500/30",
    textClass: "text-orange-600 dark:text-orange-400",
    duration: 30,
    maxPoints: 45,
    teile: [
      { number: 1, title: "Beschwerde / Anfrage", description: "Halbformellen Brief schreiben (150+ Wörter)", points: 45 }
    ]
  },
  sprechen: {
    id: "sprechen",
    title: "Mündlicher Ausdruck",
    titleEn: "Oral Expression",
    icon: Mic,
    color: "hsl(0 72% 51%)",
    bgClass: "bg-red-500/10 dark:bg-red-500/20",
    borderClass: "border-red-500/30",
    textClass: "text-red-600 dark:text-red-400",
    duration: 20,
    maxPoints: 75,
    teile: [
      { number: 1, title: "Präsentation", description: "Ein Thema 3-4 Minuten präsentieren", points: 25 },
      { number: 2, title: "Diskussion", description: "Über das Thema 4-5 Minuten diskutieren", points: 25 },
      { number: 3, title: "Problemlösung", description: "Gemeinsam eine Lösung finden", points: 25 }
    ]
  }
};

type SectionKey = keyof typeof TELC_SECTIONS;
type ViewMode = "overview" | "section" | "practice";

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const TelcVorbereitung = () => {
  const navigate = useNavigate();
  
  // View state
  const [view, setView] = useState<ViewMode>("overview");
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [activeTeil, setActiveTeil] = useState<number>(1);
  
  // Practice state
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [writingAnswer, setWritingAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  // AI Coach
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCoachOpen, setAiCoachOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  
  // Audio
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Recording (Sprechen)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timerActive) {
      handleSubmit();
    }
  }, [timeLeft, timerActive, submitted]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ───────────────────────────────────────────
  // Navigation
  // ───────────────────────────────────────────
  const openSection = (sectionId: SectionKey) => {
    setActiveSection(sectionId);
    setActiveTeil(1);
    setView("section");
  };

  const startPractice = async (sectionId: SectionKey, teil: number) => {
    setActiveSection(sectionId);
    setActiveTeil(teil);
    setView("practice");
    setAnswers({});
    setWritingAnswer("");
    setSubmitted(false);
    setResults(null);
    setCurrentQuestion(0);
    setAiMessages([]);
    setAiCoachOpen(false);
    await generateContent(sectionId, teil);
  };

  const goBack = () => {
    if (view === "practice") {
      setView("section");
      setContent(null);
      setTimerActive(false);
    } else if (view === "section") {
      setView("overview");
      setActiveSection(null);
    }
  };

  // ───────────────────────────────────────────
  // Content Generation
  // ───────────────────────────────────────────
  const generateContent = async (section: SectionKey, teil: number) => {
    setLoading(true);
    try {
      const sectionMap: Record<string, string> = {
        lesen: "reading",
        hoeren: "listening",
        schreiben: "writing",
        sprechen: "speaking",
        sprachbausteine: "sprachbausteine"
      };

      const { data, error } = await supabase.functions.invoke('generate-telc-exam', {
        body: { section: sectionMap[section], difficulty: 'b2', teil }
      });

      if (error) throw error;
      setContent(data);
      
      const sectionConfig = TELC_SECTIONS[section];
      setTimeLeft(sectionConfig.duration * 60);

      // Generate audio for listening
      if (section === "hoeren" && data.teile?.[0]?.text) {
        await generateAudio(data.teile[0].text);
      }
    } catch (error: any) {
      toast.error("Fehler beim Laden: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAudio = async (text: string) => {
    setAudioLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-tts', {
        body: { text, language: 'de', voice: 'default' }
      });
      if (error) throw error;
      if (data?.audioContent) {
        const mime = data?.mimeType || 'audio/wav';
        setAudioUrl(`data:${mime};base64,${data.audioContent}`);
      }
    } catch {
      toast.error("Audio konnte nicht generiert werden");
    } finally {
      setAudioLoading(false);
    }
  };

  // ───────────────────────────────────────────
  // AI Coach
  // ───────────────────────────────────────────
  const askAiCoach = async (type: 'hint' | 'explain' | 'feedback') => {
    if (!content || !activeSection) return;
    setAiLoading(true);
    setAiCoachOpen(true);

    const questions = content.teile?.[0]?.questions || [];
    const currentQ = questions[currentQuestion];
    const userAnswer = answers[currentQuestion] || writingAnswer;

    try {
      const { data, error } = await supabase.functions.invoke('telc-practice-helper', {
        body: {
          type,
          question: currentQ?.question || content.teile?.[0]?.task,
          userAnswer,
          correctAnswer: getCorrectAnswerText(currentQ),
          context: currentQ?.explanation,
          section: activeSection
        }
      });

      if (error) throw error;

      const message = data?.hint || data?.explanation || data?.feedback || "Keine Antwort verfügbar.";
      setAiMessages(prev => [...prev, { role: 'assistant', content: message }]);
    } catch {
      toast.error('AI-Coach konnte nicht antworten');
    } finally {
      setAiLoading(false);
    }
  };

  const getCorrectAnswerText = (question: any): string => {
    if (!question) return "";
    const ca = question.correctAnswer;
    if (typeof ca === "number") return question.options?.[ca] ?? String(ca);
    return String(ca ?? "");
  };

  // ───────────────────────────────────────────
  // Submit & Score
  // ───────────────────────────────────────────
  const handleSubmit = async () => {
    if (!content || !activeSection) return;
    setLoading(true);
    setTimerActive(false);

    try {
      if (activeSection === "schreiben" || activeSection === "sprechen") {
        const { data, error } = await supabase.functions.invoke('evaluate-telc-answer', {
          body: {
            section: activeSection === "schreiben" ? "writing" : "speaking",
            task: content.teile?.[0]?.task || content.teile?.[0]?.instructions,
            userAnswer: writingAnswer
          }
        });
        if (error) throw error;
        setResults(data);
      } else {
        // Score MC questions
        const questions = content.teile?.[0]?.questions || [];
        let correct = 0;
        const details = questions.map((q: any, idx: number) => {
          const userAns = answers[idx];
          const correctAns = getCorrectAnswerText(q);
          const isCorrect = userAns === correctAns || 
            (typeof q.correctAnswer === 'number' && parseInt(userAns) === q.correctAnswer);
          if (isCorrect) correct++;
          return { question: q.question, userAnswer: userAns, correctAnswer: correctAns, isCorrect };
        });
        setResults({
          score: correct,
          total: questions.length,
          percentage: Math.round((correct / questions.length) * 100),
          details
        });
      }
      setSubmitted(true);
    } catch (error: any) {
      toast.error("Fehler beim Auswerten: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────
  // Recording (Sprechen)
  // ───────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => stream.getTracks().forEach(t => t.stop());
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch {
      toast.error("Mikrofon-Zugriff verweigert");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ───────────────────────────────────────────
  // Render: Overview
  // ───────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-background to-accent/10 p-8 md:p-12 border border-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl gradient-primary glow">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <Badge className="gradient-primary text-primary-foreground border-0 text-sm px-4 py-1">
              B2 Niveau
            </Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            TELC B2 <span className="text-gradient">Prüfungsvorbereitung</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-6">
            Bereite dich optimal auf deine TELC B2 Prüfung vor. Interaktive Übungen mit KI-gestütztem Coaching für jeden Prüfungsteil.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="gradient-primary glow text-primary-foreground gap-2"
              onClick={() => navigate('/telc-exam')}
            >
              <Play className="h-5 w-5" />
              Vollständige Prüfung starten
            </Button>
            <Button variant="outline" size="lg" className="gap-2 glass-luxury">
              <BarChart3 className="h-5 w-5" />
              Mein Fortschritt
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Prüfungsteile", value: "5", icon: BookOpen },
          { label: "Gesamtdauer", value: "190 Min", icon: Clock },
          { label: "Maximalpunkte", value: "300", icon: Trophy },
          { label: "Bestanden ab", value: "60%", icon: Target }
        ].map((stat, i) => (
          <Card key={i} className="glass-luxury border-primary/10 hover:border-primary/30 transition-all duration-300 card-hover-lift">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(TELC_SECTIONS).map((section, idx) => {
          const Icon = section.icon;
          return (
            <Card 
              key={section.id}
              className={`group cursor-pointer glass-luxury border-2 ${section.borderClass} hover:shadow-xl transition-all duration-500 overflow-hidden animate-slide-up`}
              style={{ animationDelay: `${idx * 0.1}s` }}
              onClick={() => openSection(section.id as SectionKey)}
            >
              <div className={`h-2 w-full ${section.bgClass}`} style={{ background: section.color }} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${section.bgClass}`}>
                    <Icon className={`h-6 w-6 ${section.textClass}`} />
                  </div>
                  <Badge variant="outline" className={section.textClass}>
                    {section.maxPoints} Pkt
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-3 group-hover:text-primary transition-colors">
                  {section.title}
                </CardTitle>
                <CardDescription>{section.titleEn}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {section.duration} Min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    {section.teile.length} Teile
                  </span>
                </div>
                
                <div className="space-y-2">
                  {section.teile.map(teil => (
                    <div key={teil.number} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">Teil {teil.number}: {teil.title}</span>
                      <Badge variant="secondary" className="text-xs">{teil.points} Pkt</Badge>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                >
                  Übungen starten
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // ───────────────────────────────────────────
  // Render: Section Detail
  // ───────────────────────────────────────────
  const renderSectionDetail = () => {
    if (!activeSection) return null;
    const section = TELC_SECTIONS[activeSection];
    const Icon = section.icon;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className={`p-3 rounded-xl ${section.bgClass}`}>
            <Icon className={`h-6 w-6 ${section.textClass}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <p className="text-muted-foreground">{section.duration} Minuten • {section.maxPoints} Punkte</p>
          </div>
        </div>

        {/* Practice All Button */}
        <Card className="glass-luxury border-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10 animate-glow-pulse">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Kompletten Bereich üben</h3>
                <p className="text-muted-foreground text-sm">Alle {section.teile.length} Teile nacheinander</p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="gradient-primary glow text-primary-foreground gap-2"
              onClick={() => navigate(`/telc-exam?section=${activeSection}`)}
            >
              <Play className="h-5 w-5" />
              Prüfungsmodus starten
            </Button>
          </CardContent>
        </Card>

        {/* Teil Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {section.teile.map((teil, idx) => (
            <Card 
              key={teil.number}
              className={`group glass-luxury border ${section.borderClass} hover:shadow-lg transition-all duration-300 animate-slide-up overflow-hidden`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge 
                    className="text-sm px-3 py-1"
                    style={{ background: section.color, color: 'white' }}
                  >
                    Teil {teil.number}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{teil.points} Punkte</span>
                </div>
                <CardTitle className="text-lg mt-2">{teil.title}</CardTitle>
                <CardDescription>{teil.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Tips */}
                <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Tipps für diesen Teil
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {getTeileenTips(activeSection, teil.number).slice(0, 3).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 gap-2"
                    variant="outline"
                    onClick={() => startPractice(activeSection, teil.number)}
                  >
                    <Brain className="h-4 w-4" />
                    Mit AI-Coach üben
                  </Button>
                  <Button 
                    className="flex-1 gap-2 gradient-primary text-primary-foreground"
                    onClick={() => startPractice(activeSection, teil.number)}
                  >
                    <Play className="h-4 w-4" />
                    Übung starten
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────
  // Render: Practice View
  // ───────────────────────────────────────────
  const renderPractice = () => {
    if (!activeSection || !content) return null;
    const section = TELC_SECTIONS[activeSection];
    const Icon = section.icon;
    const questions = content.teile?.[0]?.questions || [];
    const currentQ = questions[currentQuestion];

    return (
      <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className={`p-2.5 rounded-xl ${section.bgClass}`}>
                <Icon className={`h-5 w-5 ${section.textClass}`} />
              </div>
              <div>
                <h2 className="font-bold">{section.title} - Teil {activeTeil}</h2>
                <p className="text-sm text-muted-foreground">
                  {section.teile.find(t => t.number === activeTeil)?.title}
                </p>
              </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${timerActive ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
                <Timer className="h-4 w-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
              {!timerActive && !submitted && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setTimerActive(true)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Timer starten
                </Button>
              )}
            </div>
          </div>

          {/* Progress */}
          {questions.length > 0 && !submitted && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fortschritt</span>
                <span className="font-medium">{currentQuestion + 1} / {questions.length}</span>
              </div>
              <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
            </div>
          )}

          {/* Content Area */}
          <Card className="glass-luxury">
            <CardContent className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">Übung wird generiert...</p>
                </div>
              ) : submitted && results ? (
                renderResults()
              ) : activeSection === "schreiben" || activeSection === "sprechen" ? (
                renderWritingSpeaking()
              ) : questions.length > 0 ? (
                renderQuestion(currentQ, currentQuestion)
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Keine Fragen verfügbar
                </p>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          {!submitted && questions.length > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(prev => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Zurück
              </Button>
              
              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={!answers[currentQuestion]}
                >
                  Weiter
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  className="gradient-primary text-primary-foreground"
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questions.length}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Abschicken
                </Button>
              )}
            </div>
          )}

          {/* Submit for Writing/Speaking */}
          {!submitted && (activeSection === "schreiben" || activeSection === "sprechen") && (
            <Button
              className="w-full gradient-primary text-primary-foreground"
              size="lg"
              onClick={handleSubmit}
              disabled={writingAnswer.length < 50}
            >
              <Send className="h-5 w-5 mr-2" />
              Zur Bewertung einreichen
            </Button>
          )}
        </div>

        {/* AI Coach Panel */}
        <div className={`lg:w-80 shrink-0 ${aiCoachOpen ? 'block' : 'hidden lg:block'}`}>
          <Card className="glass-luxury border-primary/20 sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                AI Coach
              </CardTitle>
              <CardDescription>Dein persönlicher Lernassistent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => askAiCoach('hint')}
                  disabled={aiLoading}
                >
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Hinweis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => askAiCoach('explain')}
                  disabled={aiLoading}
                >
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  Erklärung
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {aiMessages.length === 0 && !aiLoading && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Klicke auf "Hinweis" oder "Erklärung" für Hilfe vom AI Coach</p>
                    </div>
                  )}
                  
                  {aiMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded-xl bg-muted/50 text-sm animate-slide-up"
                    >
                      {msg.content}
                    </div>
                  ))}
                  
                  {aiLoading && (
                    <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI Coach denkt nach...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Mobile AI Coach Toggle */}
        <Button
          className="fixed bottom-6 right-6 lg:hidden rounded-full h-14 w-14 gradient-primary glow shadow-xl"
          onClick={() => setAiCoachOpen(!aiCoachOpen)}
        >
          <Brain className="h-6 w-6" />
        </Button>
      </div>
    );
  };

  // ───────────────────────────────────────────
  // Render: Question
  // ───────────────────────────────────────────
  const renderQuestion = (q: any, idx: number) => {
    if (!q) return null;

    return (
      <div className="space-y-6 animate-slide-up" key={idx}>
        <div className="space-y-2">
          <Badge variant="outline" className="mb-2">Frage {idx + 1}</Badge>
          <h3 className="text-lg font-medium">{q.question}</h3>
          {q.context && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {q.context}
            </p>
          )}
        </div>

        <RadioGroup
          value={answers[idx] || ""}
          onValueChange={(val) => setAnswers(prev => ({ ...prev, [idx]: val }))}
          className="space-y-3"
        >
          {q.options?.map((option: string, optIdx: number) => (
            <Label
              key={optIdx}
              htmlFor={`q${idx}-opt${optIdx}`}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                answers[idx] === option
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <RadioGroupItem value={option} id={`q${idx}-opt${optIdx}`} />
              <span>{option}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>
    );
  };

  // ───────────────────────────────────────────
  // Render: Writing / Speaking
  // ───────────────────────────────────────────
  const renderWritingSpeaking = () => {
    const task = content?.teile?.[0]?.task || content?.teile?.[0]?.instructions;
    const isWriting = activeSection === "schreiben";

    return (
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-muted/50">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Aufgabe
          </h3>
          <p className="text-muted-foreground">{task}</p>
        </div>

        {isWriting ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deine Antwort</span>
              <span className={writingAnswer.split(/\s+/).filter(Boolean).length >= 150 ? 'text-green-500' : 'text-muted-foreground'}>
                {writingAnswer.split(/\s+/).filter(Boolean).length} / 150+ Wörter
              </span>
            </div>
            <Textarea
              value={writingAnswer}
              onChange={(e) => setWritingAnswer(e.target.value)}
              placeholder="Schreiben Sie Ihren Text hier..."
              className="min-h-[300px] text-base"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-center">
              {isRecording ? (
                <div className="space-y-4">
                  <div className="relative inline-flex">
                    <Circle className="h-16 w-16 text-destructive animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-sm">{formatTime(recordingTime)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Aufnahme läuft...</p>
                  <Button variant="destructive" onClick={stopRecording}>
                    <Square className="h-4 w-4 mr-2" />
                    Aufnahme stoppen
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Mic className="h-12 w-12 mx-auto text-primary/50" />
                  <p className="text-muted-foreground">Klicke zum Starten der Aufnahme</p>
                  <Button onClick={startRecording} className="gradient-primary text-primary-foreground">
                    <Mic className="h-4 w-4 mr-2" />
                    Aufnahme starten
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Oder schreibe deine Notizen:</Label>
              <Textarea
                value={writingAnswer}
                onChange={(e) => setWritingAnswer(e.target.value)}
                placeholder="Notizen für deine Präsentation..."
                className="min-h-[150px]"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // ───────────────────────────────────────────
  // Render: Results
  // ───────────────────────────────────────────
  const renderResults = () => {
    if (!results) return null;

    const isWritingOrSpeaking = activeSection === "schreiben" || activeSection === "sprechen";

    return (
      <div className="space-y-6 animate-pop-in">
        {/* Score Header */}
        <div className="text-center space-y-4">
          <div className={`inline-flex p-4 rounded-full ${
            (results.percentage || results.score) >= 60 ? 'bg-green-500/10' : 'bg-destructive/10'
          }`}>
            {(results.percentage || results.score) >= 60 ? (
              <Trophy className="h-12 w-12 text-green-500" />
            ) : (
              <Target className="h-12 w-12 text-destructive" />
            )}
          </div>
          
          <div>
            <h3 className="text-2xl font-bold">
              {isWritingOrSpeaking ? (
                `${results.score || results.overall_score || 0} Punkte`
              ) : (
                `${results.score} / ${results.total} richtig`
              )}
            </h3>
            <p className="text-muted-foreground">
              {(results.percentage || results.score) >= 60 ? 'Gut gemacht!' : 'Weiter üben!'}
            </p>
          </div>
        </div>

        {/* Detailed Results */}
        {isWritingOrSpeaking && results.feedback && (
          <div className="p-4 rounded-xl bg-muted/50 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Feedback
            </h4>
            <p className="text-sm text-muted-foreground">{results.feedback}</p>
            
            {results.improvements && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Verbesserungsvorschläge:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {results.improvements.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!isWritingOrSpeaking && results.details && (
          <div className="space-y-3">
            {results.details.map((d: any, i: number) => (
              <div 
                key={i} 
                className={`p-3 rounded-lg border ${
                  d.isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'
                }`}
              >
                <div className="flex items-start gap-2">
                  {d.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  )}
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{d.question}</p>
                    <p className="text-muted-foreground">
                      Deine Antwort: {d.userAnswer || '-'}
                    </p>
                    {!d.isCorrect && (
                      <p className="text-green-600 dark:text-green-400">
                        Richtig: {d.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => askAiCoach('feedback')}
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Analyse anfordern
          </Button>
          <Button
            className="flex-1"
            onClick={() => startPractice(activeSection!, activeTeil)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Nochmal üben
          </Button>
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────
  // Helper: Tips per Teil
  // ───────────────────────────────────────────
  const getTeileenTips = (section: SectionKey, teil: number): string[] => {
    const tips: Record<string, Record<number, string[]>> = {
      lesen: {
        1: ["Lies alle Überschriften zuerst", "Fokus auf Hauptidee, nicht Details", "Eine Überschrift bleibt übrig"],
        2: ["Lies die Fragen vor dem Text", "Unterstreiche wichtige Infos", "Antworten erscheinen in Textreihenfolge"],
        3: ["Verstehe die Bedürfnisse jeder Person", "Eliminiere unpassende Optionen", "Achte auf Bedingungen"]
      },
      sprachbausteine: {
        1: ["Lies den ganzen Text zuerst", "Prüfe was vor und nach der Lücke steht", "Achte auf Kasus"],
        2: ["Bestimme die Wortart", "Prüfe Kollokationen", "Formelle Sprache verwenden"]
      },
      hoeren: {
        1: ["Lies alle Optionen vorher", "Fokus auf Hauptbotschaft", "Vertraue deinem ersten Eindruck"],
        2: ["Erstes Hören: Gesamtverständnis", "Zweites Hören: Details prüfen", "'Nicht im Text' = gar nicht erwähnt"],
        3: ["Lies Frage und Optionen vorher", "Achte auf Ton und Haltung", "Nur einmal zu hören"]
      },
      schreiben: {
        1: ["Alle Punkte der Aufgabe behandeln", "Formelle Anrede und Grußformel", "Mindestens 150 Wörter"]
      },
      sprechen: {
        1: ["Einleitung → Hauptpunkte → Schluss", "Persönliche Beispiele einbauen", "Sprich klar und natürlich"],
        2: ["Aktiv zuhören", "Höflich widersprechen", "Gründe für Meinung nennen"],
        3: ["Aufgabe genau lesen", "Vorschläge machen", "Gemeinsame Lösung finden"]
      }
    };
    return tips[section]?.[teil] || [];
  };

  // ───────────────────────────────────────────
  // Main Render
  // ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setAudioPlaying(false)}
            onPlay={() => setAudioPlaying(true)}
            onPause={() => setAudioPlaying(false)}
          />
        )}

        {view === "overview" && renderOverview()}
        {view === "section" && renderSectionDetail()}
        {view === "practice" && renderPractice()}
      </main>
    </div>
  );
};

export default TelcVorbereitung;
