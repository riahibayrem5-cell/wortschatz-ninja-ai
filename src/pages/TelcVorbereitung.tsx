import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import AudioButton from "@/components/AudioButton";
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
  Pause,
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
  VolumeX,
  Square,
  Circle,
  AlertCircle,
  GraduationCap,
  Timer,
  MessageSquare,
  Users,
  HelpCircle
} from "lucide-react";

// Section configurations matching official TELC B2 format
const TELC_SECTIONS = {
  lesen: {
    title: "Leseverstehen",
    titleEn: "Reading Comprehension",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500",
    duration: 90,
    maxPoints: 75,
    teile: [
      { number: 1, title: "Globalverstehen", description: "5 Überschriften zu Textabschnitten zuordnen", points: 25, questions: 5 },
      { number: 2, title: "Detailverstehen", description: "Längeren Text lesen, 5 MC-Fragen beantworten", points: 25, questions: 5 },
      { number: 3, title: "Selektives Verstehen", description: "10 Situationen zu Anzeigen zuordnen", points: 25, questions: 10 }
    ]
  },
  sprachbausteine: {
    title: "Sprachbausteine",
    titleEn: "Language Elements",
    icon: PenTool,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500",
    duration: 30,
    maxPoints: 30,
    teile: [
      { number: 1, title: "Grammatik im Kontext", description: "10 Lücken mit je 3 Optionen füllen", points: 15, questions: 10 },
      { number: 2, title: "Wortschatz und Struktur", description: "10 Lücken aus Wortbank füllen", points: 15, questions: 10 }
    ]
  },
  hoeren: {
    title: "Hörverstehen",
    titleEn: "Listening Comprehension",
    icon: Headphones,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500",
    duration: 20,
    maxPoints: 75,
    teile: [
      { number: 1, title: "Globalverstehen", description: "5 kurze Texte hören, Themen zuordnen", points: 25, questions: 5 },
      { number: 2, title: "Detailverstehen", description: "Längeren Text hören, richtig/falsch/nicht im Text", points: 25, questions: 10 },
      { number: 3, title: "Selektives Verstehen", description: "5 Dialoge hören, MC-Fragen beantworten", points: 25, questions: 5 }
    ]
  },
  schreiben: {
    title: "Schriftlicher Ausdruck",
    titleEn: "Written Expression",
    icon: FileText,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500",
    duration: 30,
    maxPoints: 45,
    teile: [
      { number: 1, title: "Beschwerde / Anfrage", description: "Halbformellen Brief schreiben (150+ Wörter)", points: 45, questions: 1 }
    ]
  },
  sprechen: {
    title: "Mündlicher Ausdruck",
    titleEn: "Oral Expression",
    icon: Mic,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500",
    duration: 20,
    maxPoints: 75,
    teile: [
      { number: 1, title: "Präsentation", description: "Ein Thema 3-4 Minuten präsentieren", points: 25, questions: 1 },
      { number: 2, title: "Diskussion", description: "Über das Thema 4-5 Minuten diskutieren", points: 25, questions: 1 },
      { number: 3, title: "Problemlösung", description: "Gemeinsam eine Lösung finden", points: 25, questions: 1 }
    ]
  }
};

// Writing templates for Beschwerde
const BESCHWERDE_TEMPLATES = {
  structure: [
    { label: "Absender", example: "Max Mustermann\nMusterstraße 123\n12345 Berlin" },
    { label: "Datum", example: "Berlin, den 15. März 2024" },
    { label: "Empfänger", example: "Firma XYZ GmbH\nKundenservice\nHauptstraße 1\n10115 Berlin" },
    { label: "Betreff", example: "Beschwerde über [Produkt/Service] vom [Datum]" },
    { label: "Anrede", example: "Sehr geehrte Damen und Herren," },
    { label: "Einleitung", example: "hiermit möchte ich mich über... beschweren." },
    { label: "Hauptteil", example: "Am [Datum] habe ich... Das Problem ist..." },
    { label: "Forderung", example: "Ich bitte Sie daher, ... / Ich erwarte..." },
    { label: "Schluss", example: "Für eine baldige Rückmeldung wäre ich Ihnen dankbar." },
    { label: "Grußformel", example: "Mit freundlichen Grüßen" }
  ],
  usefulPhrases: {
    opening: [
      "hiermit möchte ich mich über... beschweren",
      "mit großem Bedauern muss ich feststellen, dass...",
      "leider muss ich Ihnen mitteilen, dass...",
      "ich wende mich an Sie, weil..."
    ],
    complaint: [
      "Das entspricht nicht meinen Erwartungen",
      "Ich bin sehr enttäuscht über...",
      "Dies ist absolut inakzeptabel",
      "Das Produkt/Die Leistung weist folgende Mängel auf..."
    ],
    demand: [
      "Ich erwarte eine Erstattung / einen Umtausch",
      "Ich bitte um eine angemessene Entschädigung",
      "Ich fordere Sie auf, das Problem umgehend zu lösen",
      "Bitte setzen Sie sich bis zum [Datum] mit mir in Verbindung"
    ],
    closing: [
      "Für eine baldige Rückmeldung wäre ich Ihnen dankbar",
      "Ich erwarte Ihre Antwort bis zum [Datum]",
      "Sollte ich bis [Datum] nichts von Ihnen hören, werde ich weitere Schritte einleiten"
    ]
  }
};

// Speaking preparation templates
const SPEAKING_TEMPLATES = {
  presentation: {
    structure: [
      { phase: "Einleitung (30 Sek)", tips: ["Thema vorstellen", "Gliederung ankündigen", "Interesse wecken"] },
      { phase: "Hauptteil 1 (1 Min)", tips: ["Definition/Erklärung", "Allgemeine Situation", "Statistiken/Fakten"] },
      { phase: "Hauptteil 2 (1 Min)", tips: ["Persönliche Erfahrung", "Konkretes Beispiel", "Vor- und Nachteile"] },
      { phase: "Schluss (30 Sek)", tips: ["Zusammenfassung", "Eigene Meinung", "Ausblick/Frage"] }
    ],
    usefulPhrases: [
      "Ich möchte heute über das Thema ... sprechen",
      "Zunächst werde ich ... erklären, dann ... und schließlich ...",
      "Was versteht man unter ...?",
      "Aus meiner persönlichen Erfahrung kann ich sagen, dass ...",
      "Einerseits ... , andererseits ...",
      "Zusammenfassend lässt sich sagen, dass ...",
      "Meiner Meinung nach ..."
    ]
  },
  discussion: {
    agreeing: [
      "Da stimme ich Ihnen völlig zu",
      "Das sehe ich genauso",
      "Sie haben recht, wenn Sie sagen...",
      "Ich teile Ihre Meinung"
    ],
    disagreeing: [
      "Da bin ich anderer Meinung",
      "Das sehe ich etwas anders",
      "Ich verstehe Ihren Punkt, aber...",
      "Ich möchte dem widersprechen, weil..."
    ],
    asking: [
      "Könnten Sie das näher erläutern?",
      "Was meinen Sie damit genau?",
      "Haben Sie dafür ein Beispiel?"
    ]
  },
  problemSolving: {
    suggestions: [
      "Ich schlage vor, dass wir...",
      "Wie wäre es, wenn wir...?",
      "Wir könnten auch...",
      "Eine Möglichkeit wäre..."
    ],
    evaluating: [
      "Das klingt gut, aber...",
      "Der Vorteil dabei wäre...",
      "Ich finde diese Idee gut, weil...",
      "Das könnte problematisch sein, weil..."
    ],
    concluding: [
      "Dann sind wir uns einig, dass...",
      "Also, wir haben beschlossen...",
      "Zusammenfassend haben wir folgendes geplant..."
    ]
  }
};

const TelcVorbereitung = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [activeSection, setActiveSection] = useState<string | null>(searchParams.get("section"));
  const [activeTeil, setActiveTeil] = useState<number | null>(searchParams.get("teil") ? parseInt(searchParams.get("teil")!) : null);
  const [mode, setMode] = useState<"overview" | "learn" | "practice" | "simulate">(
    searchParams.get("mode") as any || "overview"
  );
  
  // Practice state
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [writingAnswer, setWritingAnswer] = useState("");
  const [speakingNotes, setSpeakingNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // AI Coach state (hints/explanations per question)
  const [loadingHelp, setLoadingHelp] = useState(false);
  const [aiHelp, setAiHelp] = useState<Record<number, any>>({});
  
  // Audio state for Hören
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioText, setAudioText] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Recording state for Sprechen
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isTimerActive) {
      handleTimeUp();
    }
  }, [timeLeft, isTimerActive, submitted]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const handleTimeUp = () => {
    setIsTimerActive(false);
    toast.warning("Zeit ist abgelaufen! Ihre Antworten werden automatisch eingereicht.");
    submitAnswers();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCorrectAnswerText = (question: any): string => {
    const ca = question?.correctAnswer;
    if (typeof ca === "number") {
      return question?.options?.[ca] ?? String(ca);
    }
    return String(ca ?? "");
  };

  const requestAiHelp = async (
    type: 'hint' | 'explanation',
    questionId: number,
    question: any,
    userAnswer: string,
    text?: string
  ) => {
    setLoadingHelp(true);
    try {
      const { data, error } = await supabase.functions.invoke('telc-practice-helper', {
        body: {
          type,
          question: question?.question,
          userAnswer,
          correctAnswer: getCorrectAnswerText(question),
          context: question?.explanation,
          text
        }
      });

      if (error) throw error;

      setAiHelp(prev => ({
        ...prev,
        [questionId]: { ...data, type }
      }));
    } catch (e) {
      console.error('Error requesting AI help:', e);
      toast.error('AI-Hilfe konnte nicht geladen werden');
    } finally {
      setLoadingHelp(false);
    }
  };

  const generateContent = async (section: string, teil?: number) => {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setWritingAnswer("");
    setSpeakingNotes("");
    setResults(null);
    setAudioUrl(null);
    setAudioText(null);
    setAiHelp({});

    try {
      const sectionMap: Record<string, string> = {
        lesen: "reading",
        hoeren: "listening",
        schreiben: "writing",
        sprechen: "speaking",
        sprachbausteine: "sprachbausteine"
      };

      const { data, error } = await supabase.functions.invoke('generate-telc-exam', {
        body: { 
          section: sectionMap[section] || section,
          difficulty: 'b2',
          teil 
        }
      });

      if (error) throw error;

      setContent(data);
      const sectionConfig = TELC_SECTIONS[section as keyof typeof TELC_SECTIONS];
      if (sectionConfig) {
        setTimeLeft(sectionConfig.duration * 60);
      }
      setIsTimerActive(mode === "simulate");

      // Generate audio for Hören section
      if (section === "hoeren" && data.teile?.[0]?.text) {
        await generateAudio(data.teile[0].text);
      }
    } catch (error: any) {
      toast.error("Fehler beim Laden: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAudio = async (text: string, autoPlay = false) => {
    setAudioLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-tts', {
        body: {
          text,
          language: 'de',
          voice: 'default'
        }
      });

      if (error) throw error;

      if (data?.audioContent) {
        const mime = data?.mimeType || 'audio/wav';
        const url = `data:${mime};base64,${data.audioContent}`;
        setAudioText(text);
        setAudioUrl(url);

        if (autoPlay) {
          // Let React update the <audio> src before playing.
          setTimeout(() => {
            audioRef.current?.play().catch(() => {});
          }, 50);
        }
      }
    } catch (error: any) {
      console.error("Audio generation error:", error);
      toast.error("Audio konnte nicht generiert werden");
    } finally {
      setAudioLoading(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  const handleListen = async (text?: string) => {
    if (!text) return;

    if (audioUrl && audioText === text) {
      playAudio();
      return;
    }

    await generateAudio(text, true);
  };


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedAudio(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      toast.error("Mikrofon-Zugriff verweigert");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitAnswers = async () => {
    if (!content) return;
    setLoading(true);

    try {
      if (activeSection === "schreiben" || activeSection === "sprechen") {
        const { data, error } = await supabase.functions.invoke('evaluate-telc-answer', {
          body: {
            section: activeSection === "schreiben" ? "writing" : "speaking",
            task: content.teile?.[0]?.task || content.teile?.[0]?.instructions,
            userAnswer: activeSection === "schreiben" ? writingAnswer : speakingNotes
          }
        });

        if (error) throw error;
        setResults(data);
      } else {
        // Score multiple choice questions
        const questions = content.teile?.flatMap((t: any) => t.questions || []) || [];
        let correct = 0;
        const questionResults = questions.map((q: any, idx: number) => {
          const userAnswer = answers[q.id || idx];
          const correctAnswer = getCorrectAnswerText(q);
          const isCorrect = userAnswer === correctAnswer;
          if (isCorrect) correct++;
          return { ...q, userAnswer, isCorrect, correctAnswer };
        });


        const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
        setResults({
          correct,
          total: questions.length,
          percentage,
          results: questionResults,
          passed: percentage >= 60
        });
      }

      setSubmitted(true);
      setIsTimerActive(false);
    } catch (error: any) {
      toast.error("Fehler beim Einreichen: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startPractice = (section: string, teil?: number, practiceMode: "learn" | "practice" | "simulate" = "practice") => {
    setActiveSection(section);
    setActiveTeil(teil || null);
    setMode(practiceMode);
    setSearchParams({ section, ...(teil && { teil: teil.toString() }), mode: practiceMode });
    generateContent(section, teil);
  };

  const resetToOverview = () => {
    setActiveSection(null);
    setActiveTeil(null);
    setMode("overview");
    setContent(null);
    setSubmitted(false);
    setResults(null);
    setSearchParams({});
  };

  // Render section overview
  if (!activeSection || mode === "overview") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-background p-8 border border-primary/20">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-10 w-10 text-primary animate-pulse" />
                <div>
                  <h1 className="text-3xl font-bold">TELC B2 Vorbereitung</h1>
                  <p className="text-muted-foreground">Umfassende Prüfungsvorbereitung für alle Teile</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-6">
                <Badge variant="outline" className="text-sm py-1.5 px-3">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  ~3 Stunden Prüfungszeit
                </Badge>
                <Badge variant="outline" className="text-sm py-1.5 px-3">
                  <Target className="h-3.5 w-3.5 mr-1.5" />
                  300 Punkte gesamt
                </Badge>
                <Badge variant="outline" className="text-sm py-1.5 px-3">
                  <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                  60% zum Bestehen
                </Badge>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          </div>

          {/* Section Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(TELC_SECTIONS).map(([key, section]) => {
              const Icon = section.icon;
              return (
                <Card 
                  key={key} 
                  className={`group hover:shadow-xl transition-all duration-300 border-l-4 ${section.borderColor} cursor-pointer`}
                  onClick={() => {
                    setActiveSection(key);
                    setMode("overview");
                    setSearchParams({ section: key });
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${section.bgColor}`}>
                        <Icon className={`h-6 w-6 ${section.color}`} />
                      </div>
                      <Badge variant="secondary">{section.maxPoints} Pkt</Badge>
                    </div>
                    <CardTitle className="mt-4">{section.title}</CardTitle>
                    <CardDescription>{section.titleEn}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {section.duration} Min
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {section.teile.length} Teil{section.teile.length > 1 ? 'e' : ''}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      {section.teile.map(teil => (
                        <div 
                          key={teil.number}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            startPractice(key, teil.number);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={section.color}>
                              Teil {teil.number}
                            </Badge>
                            <span className="text-sm font-medium">{teil.title}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        startPractice(key);
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Übung starten
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Full Exam Simulation Button */}
          <Card className="glass-luxury border-primary/30">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-primary/10">
                  <Timer className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Vollständige Prüfungssimulation</h3>
                  <p className="text-muted-foreground">Üben Sie unter echten Prüfungsbedingungen</p>
                </div>
              </div>
              <Button 
                size="lg" 
                className="gradient-primary"
                onClick={() => navigate('/telc-exam')}
              >
                <Play className="h-5 w-5 mr-2" />
                Prüfung starten
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Section detail view with Teil selection
  const sectionConfig = TELC_SECTIONS[activeSection as keyof typeof TELC_SECTIONS];
  if (!sectionConfig) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Sektion nicht gefunden</p>
          <Button onClick={resetToOverview}>Zurück</Button>
        </div>
      </div>
    );
  }

  const Icon = sectionConfig.icon;

  // If no content loaded yet or in section overview mode
  if (!content && mode !== "learn") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={resetToOverview}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className={`p-3 rounded-xl ${sectionConfig.bgColor}`}>
              <Icon className={`h-6 w-6 ${sectionConfig.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{sectionConfig.title}</h1>
              <p className="text-muted-foreground">{sectionConfig.titleEn} • {sectionConfig.duration} Minuten • {sectionConfig.maxPoints} Punkte</p>
            </div>
          </div>

          {/* Teil Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sectionConfig.teile.map(teil => (
              <Card key={teil.number} className="group hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`${sectionConfig.color} text-lg px-4 py-1`}>
                      Teil {teil.number}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{teil.points} Punkte</span>
                  </div>
                  <CardTitle className="text-xl mt-2">{teil.title}</CardTitle>
                  <CardDescription className="text-base">{teil.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Section-specific learning content */}
                  {activeSection === "schreiben" && teil.number === 1 && (
                    <Card className="bg-orange-500/5 border-orange-500/20">
                      <CardContent className="pt-4 space-y-3">
                        <p className="font-medium flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-orange-500" />
                          Briefstruktur
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {BESCHWERDE_TEMPLATES.structure.slice(0, 6).map((item, idx) => (
                            <Badge key={idx} variant="secondary" className="justify-start">
                              {idx + 1}. {item.label}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === "sprechen" && (
                    <Card className="bg-red-500/5 border-red-500/20">
                      <CardContent className="pt-4 space-y-2">
                        <p className="font-medium flex items-center gap-2">
                          <Mic className="h-4 w-4 text-red-500" />
                          {teil.number === 1 ? "Präsentationsstruktur" : 
                           teil.number === 2 ? "Diskussionstipps" : "Problemlösungsstrategien"}
                        </p>
                        <ul className="text-sm space-y-1">
                          {(teil.number === 1 ? SPEAKING_TEMPLATES.presentation.structure.map(s => s.phase) :
                            teil.number === 2 ? ["Zustimmen", "Widersprechen", "Nachfragen"] :
                            ["Vorschläge machen", "Bewerten", "Einigung finden"]
                          ).map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === "hoeren" && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                      <Headphones className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Mit Audio-Wiedergabe</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setActiveTeil(teil.number);
                        setMode("learn");
                        setSearchParams({ section: activeSection, teil: teil.number.toString(), mode: "learn" });
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Lernen
                    </Button>
                    <Button 
                      className="flex-1 gradient-primary"
                      onClick={() => startPractice(activeSection, teil.number)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Üben
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full section practice */}
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-bold text-lg">Kompletter {sectionConfig.title}</h3>
                <p className="text-muted-foreground">Alle Teile nacheinander üben</p>
              </div>
              <Button onClick={() => startPractice(activeSection)} size="lg">
                <Play className="h-5 w-5 mr-2" />
                Alle Teile starten
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Learning mode - show templates and tips
  if (mode === "learn") {
    const teil = sectionConfig.teile.find(t => t.number === activeTeil);
    
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => {
                setMode("overview");
                setSearchParams({ section: activeSection });
              }}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className={`h-6 w-6 ${sectionConfig.color}`} />
                  Lernmodus: {teil?.title || sectionConfig.title}
                </h1>
                <p className="text-muted-foreground">Tipps und Strategien für die Prüfung</p>
              </div>
            </div>
            <Button onClick={() => startPractice(activeSection, activeTeil || undefined)}>
              <Play className="h-4 w-4 mr-2" />
              Jetzt üben
            </Button>
          </div>

          {/* Learning content based on section */}
          {activeSection === "schreiben" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Letter Structure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    Briefaufbau
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {BESCHWERDE_TEMPLATES.structure.map((item, idx) => (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm text-orange-600">{idx + 1}. {item.label}</p>
                      <p className="text-sm text-muted-foreground mt-1 italic">{item.example}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Useful Phrases */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-orange-500" />
                    Nützliche Redewendungen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(BESCHWERDE_TEMPLATES.usefulPhrases).map(([category, phrases]) => (
                    <div key={category}>
                      <h4 className="font-medium capitalize mb-2">
                        {category === "opening" ? "Einleitung" : 
                         category === "complaint" ? "Beschwerde" :
                         category === "demand" ? "Forderung" : "Schluss"}
                      </h4>
                      <ul className="space-y-1">
                        {phrases.map((phrase, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            {phrase}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "sprechen" && (
            <div className="space-y-6">
              <Tabs defaultValue="presentation" className="w-full">
                <TabsList className="grid grid-cols-3 w-full max-w-lg">
                  <TabsTrigger value="presentation">Präsentation</TabsTrigger>
                  <TabsTrigger value="discussion">Diskussion</TabsTrigger>
                  <TabsTrigger value="problem">Problemlösung</TabsTrigger>
                </TabsList>

                <TabsContent value="presentation" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Präsentationsstruktur (3-4 Min)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {SPEAKING_TEMPLATES.presentation.structure.map((phase, idx) => (
                          <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{phase.phase}</Badge>
                            </div>
                            <ul className="space-y-1">
                              {phase.tips.map((tip, tidx) => (
                                <li key={tidx} className="text-sm flex items-center gap-2">
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Nützliche Redemittel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {SPEAKING_TEMPLATES.presentation.usefulPhrases.map((phrase, idx) => (
                            <li key={idx} className="p-2 bg-muted/30 rounded text-sm flex items-start gap-2">
                              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              {phrase}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="discussion" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(SPEAKING_TEMPLATES.discussion).map(([key, phrases]) => (
                      <Card key={key}>
                        <CardHeader>
                          <CardTitle className="text-lg capitalize">
                            {key === "agreeing" ? "Zustimmen" : 
                             key === "disagreeing" ? "Widersprechen" : "Nachfragen"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {phrases.map((phrase, idx) => (
                              <li key={idx} className="text-sm p-2 bg-muted/30 rounded">
                                {phrase}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="problem" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(SPEAKING_TEMPLATES.problemSolving).map(([key, phrases]) => (
                      <Card key={key}>
                        <CardHeader>
                          <CardTitle className="text-lg capitalize">
                            {key === "suggestions" ? "Vorschläge machen" :
                             key === "evaluating" ? "Bewerten" : "Abschließen"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {phrases.map((phrase, idx) => (
                              <li key={idx} className="text-sm p-2 bg-muted/30 rounded">
                                {phrase}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Generic learning tips for other sections */}
          {(activeSection === "lesen" || activeSection === "hoeren" || activeSection === "sprachbausteine") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className={`h-5 w-5 ${sectionConfig.color}`} />
                  Prüfungstipps für {sectionConfig.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sectionConfig.teile.map(teil => (
                  <div key={teil.number} className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <Badge variant="outline">Teil {teil.number}</Badge>
                      {teil.title}
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                        Lesen Sie zuerst die Fragen/Aufgaben
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                        Markieren Sie Schlüsselwörter
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                        Vertrauen Sie Ihrem ersten Eindruck
                      </li>
                      <li className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                        Lassen Sie keine Frage unbeantwortet
                      </li>
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Practice/Simulate mode with content loaded
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hidden audio element for Hören */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={() => setAudioPlaying(false)}
          onPause={() => setAudioPlaying(false)}
          onPlay={() => setAudioPlaying(true)}
        />
      )}

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with timer */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={resetToOverview}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Icon className={`h-6 w-6 ${sectionConfig.color}`} />
                {content?.title || sectionConfig.title}
              </h1>
              <p className="text-muted-foreground text-sm">
                {mode === "simulate" ? "Prüfungssimulation" : "Übungsmodus"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isTimerActive && (
              <Badge 
                variant={timeLeft < 300 ? "destructive" : "secondary"} 
                className="text-lg px-4 py-2 font-mono"
              >
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(timeLeft)}
              </Badge>
            )}
            
            {/* Audio controls for Hören */}
            {activeSection === "hoeren" && (
              <Button
                variant={audioPlaying ? "destructive" : "default"}
                size="sm"
                onClick={playAudio}
                disabled={audioLoading || !audioUrl}
              >
                {audioLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : audioPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Audio abspielen
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {loading && !content ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg">Prüfungsinhalte werden generiert...</p>
            </div>
          </Card>
        ) : content ? (
          <div className="space-y-6">
            {/* Content display */}
            {content.teile?.map((teil: any, teilIdx: number) => (
              <Card key={teilIdx} className="overflow-hidden">
                <CardHeader className={`${sectionConfig.bgColor} border-b`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className={sectionConfig.color}>
                        Teil {teil.teilNumber || teilIdx + 1}
                      </Badge>
                      <CardTitle className="mt-2">{teil.title}</CardTitle>
                    </div>
                    <Badge variant="secondary">{teil.maxPoints || teil.points} Punkte</Badge>
                  </div>
                  <CardDescription>{teil.instructions}</CardDescription>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Text passage */}
                  {teil.text && (
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">{activeSection === "hoeren" ? "Transkript" : "Lesetext"}</span>
                          {activeSection === "hoeren" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleListen(teil.text)}
                              disabled={audioLoading || !teil.text}
                            >
                              <Volume2 className="h-4 w-4 mr-1" />
                              Anhören
                            </Button>
                          )}
                        </div>
                        <ScrollArea className="h-[300px]">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed pr-4">
                            {teil.text}
                          </p>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}

                  {/* Writing task */}
                  {(activeSection === "schreiben") && (
                    <div className="space-y-4">
                      {teil.task && (
                        <Card className="bg-orange-500/5 border-orange-500/20">
                          <CardContent className="pt-4">
                            <p className="font-medium mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-orange-500" />
                              Aufgabe
                            </p>
                            <p className="whitespace-pre-wrap">{teil.task}</p>
                          </CardContent>
                        </Card>
                      )}

                      <Textarea
                        placeholder="Schreiben Sie Ihren Brief hier..."
                        value={writingAnswer}
                        onChange={(e) => setWritingAnswer(e.target.value)}
                        className="min-h-[400px] text-base"
                        disabled={submitted}
                      />

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Wörter: <span className={writingAnswer.split(/\s+/).filter(Boolean).length >= 150 ? "text-green-500 font-medium" : ""}>
                            {writingAnswer.split(/\s+/).filter(Boolean).length}
                          </span>
                        </span>
                        <span className="text-muted-foreground">Mindestens 150 Wörter empfohlen</span>
                      </div>
                    </div>
                  )}

                  {/* Speaking task */}
                  {(activeSection === "sprechen") && (
                    <div className="space-y-4">
                      {teil.task && (
                        <Card className="bg-red-500/5 border-red-500/20">
                          <CardContent className="pt-4">
                            <p className="font-medium mb-2 flex items-center gap-2">
                              <Mic className="h-4 w-4 text-red-500" />
                              Aufgabe für Teil {teil.teilNumber}
                            </p>
                            <p className="whitespace-pre-wrap">{teil.task}</p>
                          </CardContent>
                        </Card>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Notes area */}
                        <div className="space-y-3">
                          <Label>Ihre Notizen & Stichpunkte</Label>
                          <Textarea
                            placeholder="Bereiten Sie hier Ihre Stichpunkte vor..."
                            value={speakingNotes}
                            onChange={(e) => setSpeakingNotes(e.target.value)}
                            className="min-h-[250px]"
                            disabled={submitted}
                          />
                        </div>

                        {/* Recording area */}
                        <Card className="flex flex-col">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Mic className="h-5 w-5 text-red-500" />
                              Aufnahme
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
                            {isRecording ? (
                              <>
                                <div className="relative">
                                  <div className="w-24 h-24 rounded-full bg-red-500 animate-pulse flex items-center justify-center">
                                    <Mic className="h-10 w-10 text-white" />
                                  </div>
                                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background px-3 py-1 rounded-full border">
                                    <span className="font-mono text-red-500 font-bold">{formatTime(recordingTime)}</span>
                                  </div>
                                </div>
                                <Button variant="destructive" size="lg" onClick={stopRecording}>
                                  <Square className="h-5 w-5 mr-2" />
                                  Aufnahme stoppen
                                </Button>
                              </>
                            ) : recordedAudio ? (
                              <>
                                <div className="flex items-center gap-2 text-green-500">
                                  <CheckCircle2 className="h-6 w-6" />
                                  <span>Aufnahme gespeichert ({formatTime(recordingTime)})</span>
                                </div>
                                <audio controls src={URL.createObjectURL(recordedAudio)} className="w-full" />
                                <Button variant="outline" onClick={() => { setRecordedAudio(null); setRecordingTime(0); }}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Neue Aufnahme
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                                  <Mic className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <Button size="lg" onClick={startRecording} disabled={submitted}>
                                  <Circle className="h-5 w-5 mr-2 text-red-500" />
                                  Aufnahme starten
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                  Sprechen Sie mindestens 3-4 Minuten für die Präsentation
                                </p>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Multiple choice questions */}
                  {teil.questions && (
                    <div className="space-y-4">
                      {teil.questions.map((question: any, qIdx: number) => {
                        const qId = question.id || qIdx;
                        const correctAnswerText = getCorrectAnswerText(question);
                        const userAnswer = answers[qId] || "";
                        const isCorrect = submitted && userAnswer === correctAnswerText;
                        const isWrong = submitted && !!userAnswer && userAnswer !== correctAnswerText;
                        const help = aiHelp[qId];

                        return (
                          <Card 
                            key={qId} 
                            className={`transition-all ${
                              isCorrect ? 'border-green-500 bg-green-500/5' : 
                              isWrong ? 'border-red-500 bg-red-500/5' : ''
                            }`}
                          >
                            <CardContent className="pt-4 space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                  <Badge variant="outline">{qIdx + 1}</Badge>
                                  <p className="font-medium">{question.question}</p>
                                </div>
                                {submitted && (
                                  isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> :
                                  isWrong ? <XCircle className="h-5 w-5 text-red-500 shrink-0" /> : null
                                )}
                              </div>

                              <RadioGroup
                                value={userAnswer}
                                onValueChange={(value) => setAnswers(prev => ({ ...prev, [qId]: value }))}
                                disabled={submitted}
                                className="space-y-2"
                              >
                                {question.options?.map((option: string, optIdx: number) => {
                                  const isThisCorrect = submitted && option === correctAnswerText;
                                  const isThisWrong = submitted && userAnswer === option && option !== correctAnswerText;

                                  return (
                                    <div
                                      key={optIdx}
                                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                        isThisCorrect ? 'bg-green-500/10 border-green-500' :
                                        isThisWrong ? 'bg-red-500/10 border-red-500' :
                                        'hover:bg-muted/50'
                                      }`}
                                    >
                                      <RadioGroupItem value={option} id={`q${qId}-${optIdx}`} />
                                      <Label htmlFor={`q${qId}-${optIdx}`} className="flex-1 cursor-pointer">
                                        {option}
                                      </Label>
                                      {isThisCorrect && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                      {isThisWrong && <XCircle className="h-4 w-4 text-red-500" />}
                                    </div>
                                  );
                                })}
                              </RadioGroup>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => requestAiHelp('hint', qId, question, userAnswer, teil.text)}
                                  disabled={loadingHelp}
                                >
                                  <Lightbulb className="h-4 w-4 mr-2" />
                                  Hinweis
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => requestAiHelp('explanation', qId, question, userAnswer, teil.text)}
                                  disabled={loadingHelp || !userAnswer}
                                >
                                  <Brain className="h-4 w-4 mr-2" />
                                  Erklärung
                                </Button>
                              </div>

                              {help && (
                                <div className="p-3 bg-muted/40 rounded-lg text-sm space-y-2">
                                  {help.type === 'hint' ? (
                                    <>
                                      {help.hint && <p className="whitespace-pre-wrap">{help.hint}</p>}
                                      {Array.isArray(help.keyVocabulary) && help.keyVocabulary.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                          {help.keyVocabulary.slice(0, 8).map((w: string, i: number) => (
                                            <Badge key={i} variant="secondary">{w}</Badge>
                                          ))}
                                        </div>
                                      )}
                                      {help.strategy && (
                                        <p className="text-muted-foreground">{help.strategy}</p>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {help.explanation && <p className="whitespace-pre-wrap">{help.explanation}</p>}
                                      {help.concept && (
                                        <p className="text-muted-foreground"><span className="font-medium">Konzept:</span> {help.concept}</p>
                                      )}
                                      {Array.isArray(help.tips) && help.tips.length > 0 && (
                                        <ul className="list-disc pl-5 space-y-1">
                                          {help.tips.slice(0, 4).map((t: string, i: number) => (
                                            <li key={i}>{t}</li>
                                          ))}
                                        </ul>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}

                              {submitted && isWrong && (
                                <div className="p-3 bg-muted rounded-lg text-sm">
                                  <p className="font-medium text-green-600 mb-1">
                                    Richtige Antwort: {correctAnswerText}
                                  </p>
                                  {question.explanation && (
                                    <p className="text-muted-foreground">{question.explanation}</p>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Results */}
            {submitted && results && (
              <Card className={`border-2 ${
                results.passed || results.percentage >= 60 || results.grade === "sehr gut" || results.grade === "gut" 
                  ? 'border-green-500 bg-green-500/5' 
                  : 'border-orange-500 bg-orange-500/5'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(results.passed || results.percentage >= 60) ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        Gut gemacht!
                      </>
                    ) : (
                      <>
                        <Target className="h-6 w-6 text-orange-500" />
                        Weiter üben!
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.correct !== undefined ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-3xl font-bold text-green-500">{results.correct}</p>
                        <p className="text-sm text-muted-foreground">Richtig</p>
                      </div>
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-3xl font-bold">{results.total}</p>
                        <p className="text-sm text-muted-foreground">Gesamt</p>
                      </div>
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-3xl font-bold">{results.percentage}%</p>
                        <p className="text-sm text-muted-foreground">Punkte</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-background rounded-lg text-center">
                          <p className="text-3xl font-bold">{results.score || 0}/45</p>
                          <p className="text-sm text-muted-foreground">Punkte</p>
                        </div>
                        <div className="p-4 bg-background rounded-lg text-center">
                          <Badge variant={results.grade === "sehr gut" || results.grade === "gut" ? "default" : "secondary"} className="text-lg px-4 py-2">
                            {results.grade || "N/A"}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">Note</p>
                        </div>
                      </div>

                      {results.strengths && results.strengths.length > 0 && (
                        <div className="p-4 bg-green-500/10 rounded-lg">
                          <p className="font-medium mb-2 flex items-center gap-2">
                            <Star className="h-4 w-4 text-green-500" />
                            Stärken
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {results.strengths.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {results.improvements && results.improvements.length > 0 && (
                        <div className="p-4 bg-orange-500/10 rounded-lg">
                          <p className="font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-orange-500" />
                            Verbesserungsmöglichkeiten
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {results.improvements.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {results.correctedVersion && (
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="font-medium mb-2">Korrigierte Version:</p>
                          <p className="text-sm whitespace-pre-wrap">{results.correctedVersion}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action buttons */}
            <div className="flex justify-between items-center flex-wrap gap-4 pt-4">
              <Button variant="outline" onClick={resetToOverview}>
                <Home className="h-4 w-4 mr-2" />
                Zurück zur Übersicht
              </Button>

              <div className="flex gap-2">
                {submitted ? (
                  <>
                    <Button variant="outline" onClick={() => generateContent(activeSection, activeTeil || undefined)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Erneut versuchen
                    </Button>
                    <Button onClick={resetToOverview}>
                      Weiter üben
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={submitAnswers} 
                    disabled={loading} 
                    className="gradient-primary"
                    size="lg"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Antworten einreichen
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TelcVorbereitung;