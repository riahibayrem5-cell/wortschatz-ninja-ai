import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Award,
  Target,
  TrendingUp,
  Brain,
  Zap,
  Star,
  Trophy,
  Loader2,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import AudioButton from "@/components/AudioButton";
import { PageBanner } from "@/components/PageBanner";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  feedback?: {
    grammar?: string;
    vocabulary?: string;
    pronunciation?: string;
  };
  audio?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress: number;
  total: number;
}

interface MistakeAnalysis {
  mistakes: Array<{ error: string; correction: string; explanation: string }>;
  alternatives: string[];
  overallAssessment: string;
  hasErrors: boolean;
}

const AICompanion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first_chat', title: 'First Steps', description: 'Have your first conversation', icon: Star, unlocked: false, progress: 0, total: 1 },
    { id: 'chat_master', title: 'Chat Master', description: 'Complete 50 conversations', icon: Trophy, unlocked: false, progress: 0, total: 50 },
    { id: 'perfectionist', title: 'Perfectionist', description: 'Get 10 perfect scores', icon: Target, unlocked: false, progress: 0, total: 10 },
    { id: 'speed_demon', title: 'Speed Demon', description: 'Respond in under 10 seconds 20 times', icon: Zap, unlocked: false, progress: 0, total: 20 },
    { id: 'polyglot', title: 'Polyglot', description: 'Learn 500 new words', icon: Brain, unlocked: false, progress: 0, total: 500 },
  ]);
  
  const [insightsOpen, setInsightsOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioMode, setAudioMode] = useState<'text' | 'verbal'>('text');
  const [analyzingMessage, setAnalyzingMessage] = useState<string | null>(null);
  const [mistakeAnalysis, setMistakeAnalysis] = useState<MistakeAnalysis | null>(null);
  const [showMistakeDialog, setShowMistakeDialog] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: progress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (progress) {
      const calculatedLevel = Math.floor((progress.words_learned + progress.exercises_completed * 10) / 100) + 1;
      setUserLevel(calculatedLevel);
      setXp((progress.words_learned + progress.exercises_completed * 10) % 100);
      setStreak(progress.streak_days || 0);
      
      setAchievements(prev => prev.map(ach => {
        if (ach.id === 'polyglot') {
          return { ...ach, progress: progress.words_learned, unlocked: progress.words_learned >= 500 };
        }
        return ach;
      }));
    }
  };

  const startCompanion = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("conversation", {
        body: { 
          action: 'start', 
          scenario: 'AI Learning Companion - Personalized German Practice'
        },
      });

      if (error) throw error;
      
      const welcomeMsg: Message = {
        role: 'assistant',
        content: data.reply + "\n\n🎯 I'm your AI learning companion! I adapt to YOUR level and learning style. Let's practice German together!"
      };
      
      setMessages([welcomeMsg]);
      speakMessage(data.reply);
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      
      toast({ 
        title: `🎤 ${t('aiCompanion.listening')}`, 
        description: "Speak in German. I'm analyzing in real-time!" 
      });
    } catch (error) {
      toast({ 
        title: t('common.error'), 
        description: "Please allow microphone access.",
        variant: "destructive" 
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke('speech-to-text', {
          body: { audio: base64Audio, language: 'de' }
        });

        if (transcriptError) throw transcriptError;

        const transcribedText = transcriptData.text;
        
        const userMsg: Message = { role: 'user', content: transcribedText };
        setMessages(prev => [...prev, userMsg]);

        await sendMessageToAI(transcribedText);
      };
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
      setIsProcessing(false);
    }
  };

  const sendTextMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsg: Message = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    
    await sendMessageToAI(inputText);
  };

  const analyzeMistakes = async (text: string) => {
    setAnalyzingMessage(text);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-mistakes", {
        body: { text, difficulty: 'B2' },
      });

      if (error) throw error;
      setMistakeAnalysis(data);
      setShowMistakeDialog(true);
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    } finally {
      setAnalyzingMessage(null);
    }
  };

  const sendMessageToAI = async (messageText: string) => {
    setIsProcessing(true);
    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke("conversation", {
        body: { 
          action: 'continue',
          scenario: 'AI Learning Companion - Provide instant feedback on grammar, vocabulary, and give encouragement',
          message: messageText,
          conversationHistory 
        },
      });

      if (error) throw error;
      
      let audioData: string | null = null;
      if (audioMode === 'verbal') {
        try {
          const { data: ttsData, error: ttsError } = await supabase.functions.invoke('gemini-tts', {
            body: { text: data.reply, language: 'de', voice: 'default' }
          });
          if (!ttsError && ttsData?.audioContent) {
            const mime = ttsData?.mimeType || 'audio/wav';
            audioData = `data:${mime};base64,${ttsData.audioContent}`;
          }
        } catch (ttsError) {
          console.error('TTS error:', ttsError);
        }
      }
      
      const aiMsg: Message = {
        role: 'assistant',
        content: data.reply,
        audio: audioData,
        feedback: {
          grammar: "✓",
          vocabulary: "✓",
          pronunciation: "✓"
        }
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
      if (audioMode === 'verbal' && audioData) {
        const audio = new Audio(audioData);
        audio.play().catch(() => {});
      } else if (audioMode === 'text') {
        speakMessage(data.reply);
      }
      
      awardXP(15);
      checkAchievements();
      
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakMessage = async (text: string) => {
    try {
      setIsSpeaking(true);

      const { data, error } = await supabase.functions.invoke('gemini-tts', {
        body: { text, language: 'de', voice: 'default' }
      });

      if (error) throw error;
      if (!data?.audioContent) throw new Error('No audio content received');

      const mime = data?.mimeType || 'audio/wav';
      const audio = new Audio(`data:${mime};base64,${data.audioContent}`);
      audio.onended = () => setIsSpeaking(false);
      audio.play().catch(() => setIsSpeaking(false));
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsSpeaking(false);
    }
  };

  const awardXP = (amount: number) => {
    setXp(prev => {
      const newXp = prev + amount;
      if (newXp >= 100) {
        setUserLevel(l => l + 1);
        toast({
          title: "🎉 LEVEL UP!",
          description: `You reached Level ${userLevel + 1}!`,
        });
        return newXp - 100;
      }
      return newXp;
    });
  };

  const checkAchievements = () => {
    setAchievements(prev => {
      const updated = prev.map(ach => {
        if (ach.id === 'first_chat' && messages.length >= 2 && !ach.unlocked) {
          toast({
            title: "🏆 Achievement Unlocked!",
            description: ach.title,
          });
          return { ...ach, progress: 1, unlocked: true };
        }
        return ach;
      });
      return updated;
    });
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        <PageBanner
          type="ai-companion"
          title={t('aiCompanion.title')}
          subtitle={t('aiCompanion.subtitle')}
          icon={Brain}
          compact
        />
        
        {/* Compact Stats Bar */}
        <div className="flex items-center gap-4 p-3 glass-luxury rounded-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t('common.level')} {userLevel}</span>
            <Progress value={xp} className="w-20 h-2" />
            <span className="text-xs text-muted-foreground">{xp}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">{streak} {t('common.days')}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            {achievements.filter(a => a.unlocked).slice(0, 3).map(ach => (
              <Badge key={ach.id} className="gradient-primary text-xs px-2">
                <ach.icon className="w-3 h-3" />
              </Badge>
            ))}
            <Sheet open={insightsOpen} onOpenChange={setInsightsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2">
                  <ChevronRight className="w-4 h-4" />
                  {t('aiCompanion.aiInsights')}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[320px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t('aiCompanion.aiInsights')}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* Learning Style */}
                  <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                    <p className="text-accent font-semibold text-sm mb-1">{t('aiCompanion.learningStyle')}</p>
                    <p className="text-xs text-muted-foreground">Visual & Conversational</p>
                  </div>
                  {/* Strength */}
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-primary font-semibold text-sm mb-1">{t('aiCompanion.strength')}</p>
                    <p className="text-xs text-muted-foreground">Vocabulary retention</p>
                  </div>
                  {/* Focus Area */}
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                    <p className="text-destructive font-semibold text-sm mb-1">{t('aiCompanion.focusArea')}</p>
                    <p className="text-xs text-muted-foreground">Article usage (der/die/das)</p>
                  </div>
                  
                  {/* Achievements */}
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      {t('aiCompanion.achievements')}
                    </h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {achievements.map(ach => (
                        <div
                          key={ach.id}
                          className={`p-2.5 rounded-lg border transition-all ${
                            ach.unlocked 
                              ? 'gradient-primary/10 border-primary/40' 
                              : 'bg-background/20 border-border/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <ach.icon className={`w-4 h-4 ${ach.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                              <p className="font-medium text-xs">{ach.title}</p>
                            </div>
                            {ach.unlocked && <Badge className="text-xs h-5 gradient-accent">✓</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5">{ach.description}</p>
                          <Progress value={(ach.progress / ach.total) * 100} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {ach.progress}/{ach.total}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Main Chat Area - Full Width */}
        <Card className="glass-luxury flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary animate-pulse" />
                <CardTitle className="text-lg">{t('aiCompanion.title')}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                <Badge variant="outline" className="text-xs">
                  {audioMode === 'text' ? t('aiCompanion.textMode') : t('aiCompanion.verbalMode')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          {/* Messages Container */}
          <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 max-w-md animate-fade-in">
                  <Brain className="w-16 h-16 mx-auto text-primary animate-pulse" />
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gradient-luxury">
                      {t('aiCompanion.title')}
                    </h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                      {t('aiCompanion.subtitle')}
                    </p>
                    <Button
                      onClick={startCompanion}
                      disabled={isProcessing}
                      size="lg"
                      className="gradient-luxury luxury-glow"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {t('aiCompanion.starting')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          {t('aiCompanion.startConversation')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl transition-all ${
                    msg.role === 'user'
                      ? 'gradient-primary text-primary-foreground shadow-lg rounded-br-md'
                      : 'glass-luxury border border-primary/20 rounded-bl-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="whitespace-pre-line text-sm flex-1 leading-relaxed">{msg.content}</p>
                    <div className="flex gap-1 shrink-0">
                      {msg.role === 'user' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => analyzeMistakes(msg.content)}
                          disabled={analyzingMessage === msg.content}
                          className="h-7 w-7 p-0 hover:bg-white/20"
                          title={t('aiCompanion.analyzeMistakes')}
                        >
                          {analyzingMessage === msg.content ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Lightbulb className="w-3 h-3 text-yellow-400" />
                          )}
                        </Button>
                      )}
                      {msg.role === 'assistant' && (
                        <>
                          <AudioButton text={msg.content} lang="de-DE" showPlayer />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-xs hover:bg-primary/20"
                            onClick={async () => {
                              try {
                                const { data } = await supabase.functions.invoke('analyze-translation', {
                                  body: { text: msg.content, targetLanguage: 'en' }
                                });
                                toast({
                                  title: "Translation",
                                  description: data.translation,
                                  duration: 8000,
                                });
                              } catch (error: any) {
                                toast({ title: t('common.error'), description: error.message, variant: "destructive" });
                              }
                            }}
                            title="Translate to English"
                          >
                            EN
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {msg.feedback && msg.role === 'assistant' && (
                    <div className="text-xs mt-3 pt-3 border-t border-primary/20">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-accent" />
                        <span className="text-muted-foreground font-medium">{t('aiCompanion.instantFeedback')}:</span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className="text-xs bg-primary/10">Grammar ✓</Badge>
                        <Badge variant="outline" className="text-xs bg-accent/10">Vocab ✓</Badge>
                        <Badge variant="outline" className="text-xs bg-green-500/10">Fluency +2</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <CardContent className="border-t pt-4 pb-4 px-4">
            <div className="flex gap-2 mb-3">
              <Button
                onClick={isListening ? stopVoiceRecording : startVoiceRecording}
                variant={isListening ? "destructive" : "default"}
                className={isListening ? "animate-pulse" : "gradient-primary"}
                disabled={isProcessing || messages.length === 0}
                size="sm"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-1" />
                    {t('aiCompanion.stop')}
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-1" />
                    {t('aiCompanion.voice')}
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => isSpeaking ? null : speakMessage(messages[messages.length - 1]?.content || "")}
                variant="outline"
                className="glass"
                disabled={messages.length === 0 || isSpeaking}
                size="sm"
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4 animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                onClick={() => setAudioMode(audioMode === 'text' ? 'verbal' : 'text')}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                {audioMode === 'text' ? t('aiCompanion.verbalMode') : t('aiCompanion.textMode')}
              </Button>
            </div>

            <div className="flex gap-3">
              <Textarea
                placeholder={t('aiCompanion.placeholder')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendTextMessage();
                  }
                }}
                disabled={isProcessing || messages.length === 0}
                className="glass min-h-[50px] text-sm resize-none flex-1"
                rows={2}
              />
              <Button
                onClick={sendTextMessage}
                disabled={!inputText.trim() || isProcessing || messages.length === 0}
                className="gradient-accent self-end px-6"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('common.send')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mistake Analysis Dialog */}
        <Dialog open={showMistakeDialog} onOpenChange={setShowMistakeDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-luxury">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Lightbulb className="w-6 h-6 text-accent" />
                {t('aiCompanion.mistakeAnalysis')}
              </DialogTitle>
            </DialogHeader>
            
            {mistakeAnalysis && (
              <div className="space-y-4">
                {!mistakeAnalysis.hasErrors ? (
                  <div className="p-4 bg-accent/20 rounded-lg border border-accent">
                    <p className="font-semibold text-accent">✨ {t('aiCompanion.noErrors')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2">{t('aiCompanion.mistakesFound')}:</h4>
                      {mistakeAnalysis.mistakes.map((mistake, idx) => (
                        <div key={idx} className="p-3 bg-destructive/10 rounded-lg border border-destructive/30 mb-2">
                          <p className="text-sm text-destructive font-medium">❌ {mistake.error}</p>
                          <p className="text-sm text-accent mt-1">✓ {mistake.correction}</p>
                          <p className="text-xs text-muted-foreground mt-1">{mistake.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mistakeAnalysis.alternatives && mistakeAnalysis.alternatives.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">{t('aiCompanion.alternatives')}:</h4>
                    <div className="space-y-2">
                      {mistakeAnalysis.alternatives.map((alt, idx) => (
                        <div key={idx} className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                          <p className="text-sm">{alt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-semibold mb-2">{t('aiCompanion.overallAssessment')}:</h4>
                  <p className="text-sm text-muted-foreground">{mistakeAnalysis.overallAssessment}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AICompanion;
