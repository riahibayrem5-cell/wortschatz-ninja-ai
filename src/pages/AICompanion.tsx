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
  Lightbulb
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import AudioButton from "@/components/AudioButton";

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
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
      
      // Update achievements
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
        title: "Microphone Error", 
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
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        // Transcribe
        const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke('speech-to-text', {
          body: { audio: base64Audio, language: 'de' }
        });

        if (transcriptError) throw transcriptError;

        const transcribedText = transcriptData.text;
        
        // Add user message
        const userMsg: Message = { role: 'user', content: transcribedText };
        setMessages(prev => [...prev, userMsg]);

        // Get AI response with feedback
        await sendMessageToAI(transcribedText);
      };
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      toast({ title: "Error analyzing mistakes", description: error.message, variant: "destructive" });
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
      
      // Generate audio for AI response if in verbal mode
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
      
      // Add AI response
      const aiMsg: Message = {
        role: 'assistant',
        content: data.reply,
        audio: audioData,
        feedback: {
          grammar: "Analyzing...",
          vocabulary: "Checking...",
          pronunciation: "Evaluating..."
        }
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
      // Auto-play in verbal mode
      if (audioMode === 'verbal' && audioData) {
        const audio = new Audio(audioData);
        audio.play();
      } else if (audioMode === 'text') {
        speakMessage(data.reply);
      }
      
      // Award XP
      awardXP(15);
      
      // Check achievements
      checkAchievements();
      
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      audio.play();
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
      
      <div className="container max-w-7xl mx-auto p-4 md:p-6">
        {/* Compact Header with Progress */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 mt-2">
          <Card className="glass-luxury">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">Level</p>
              </div>
              <p className="text-2xl font-bold text-gradient-luxury">{userLevel}</p>
              <Progress value={xp} className="h-1.5 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{xp}/100 XP</p>
            </CardContent>
          </Card>

          <Card className="glass-luxury">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-4 h-4 text-accent" />
                <p className="text-xs font-semibold text-muted-foreground">Streak</p>
              </div>
              <p className="text-2xl font-bold text-accent">{streak}</p>
              <p className="text-xs text-muted-foreground">days</p>
            </CardContent>
          </Card>

          <Card className="glass-luxury col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">Recent Achievements</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {achievements.filter(a => a.unlocked).slice(0, 3).map(ach => (
                  <Badge key={ach.id} className="gradient-primary text-xs">
                    <ach.icon className="w-3 h-3 mr-1" />
                    {ach.title}
                  </Badge>
                ))}
                {achievements.filter(a => a.unlocked).length === 0 && (
                  <p className="text-xs text-muted-foreground">Start chatting to unlock!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area - Full Width on Mobile, 2/3 on Desktop */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Chat */}
          <div className="xl:col-span-2">
            <Card className="glass-luxury h-[calc(100vh-280px)] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary animate-pulse" />
                    <CardTitle className="text-lg">{t('aiCompanion.title')}</CardTitle>
                  </div>
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                </div>
                <CardDescription className="text-xs">
                  Voice or text - I adapt to YOUR learning style in real-time!
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto space-y-3 px-4">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4 max-w-md animate-fade-in">
                      <Brain className="w-20 h-20 mx-auto text-primary animate-pulse" />
                      <div>
                        <h3 className="text-2xl font-bold mb-2 text-gradient-luxury">
                          AI Learning Companion
                        </h3>
                        <p className="text-muted-foreground mb-6 text-sm">
                          Your personal German tutor that adapts to your level and provides instant feedback!
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
                              Wird gestartet...
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
                      className={`max-w-[85%] md:max-w-[75%] p-3 rounded-xl transition-all hover:scale-[1.02] ${
                        msg.role === 'user'
                          ? 'gradient-primary text-primary-foreground shadow-lg'
                          : 'glass-luxury border border-primary/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="whitespace-pre-line text-sm flex-1">{msg.content}</p>
                        <div className="flex gap-1 shrink-0">
                          {msg.role === 'user' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => analyzeMistakes(msg.content)}
                              disabled={analyzingMessage === msg.content}
                              className="h-7 w-7 p-0"
                            >
                              {analyzingMessage === msg.content ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Lightbulb className="w-3 h-3 text-yellow-500" />
                              )}
                            </Button>
                          )}
                          {msg.role === 'assistant' && (
                            <>
                              <AudioButton text={msg.content} lang="de-DE" showPlayer />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-xs"
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
                                    toast({ title: "Translation Error", description: error.message, variant: "destructive" });
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
                        <div className="text-xs space-y-1 mt-2 pt-2 border-t border-primary/20">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-accent" />
                            <span className="text-muted-foreground font-medium">Instant Feedback:</span>
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

              <CardContent className="border-t pt-3 pb-4 px-4">
                <div className="flex gap-2 mb-2">
                  <Button
                    onClick={isListening ? stopVoiceRecording : startVoiceRecording}
                    variant={isListening ? "destructive" : "default"}
                    className={isListening ? "animate-pulse" : "gradient-primary"}
                    disabled={isProcessing}
                    size="sm"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4 mr-1" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-1" />
                        Voice
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
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type in German or use voice..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendTextMessage())}
                    disabled={isProcessing}
                    className="glass min-h-[60px] text-sm resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={sendTextMessage}
                    disabled={!inputText.trim() || isProcessing}
                    className="gradient-accent self-end"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Sidebar - Responsive */}
          <div className="xl:block space-y-3">
            <Card className="glass-luxury">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {achievements.map(ach => (
                  <div
                    key={ach.id}
                    className={`p-2.5 rounded-lg border transition-all hover:scale-[1.02] ${
                      ach.unlocked 
                        ? 'gradient-primary/10 border-primary/40 shadow-sm' 
                        : 'bg-background/20 border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <ach.icon className={`w-4 h-4 ${ach.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="font-semibold text-xs">{ach.title}</p>
                      </div>
                      {ach.unlocked && <Badge className="text-xs h-5 gradient-accent">✓</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">{ach.description}</p>
                    <Progress value={(ach.progress / ach.total) * 100} className="h-1.5 mb-1" />
                    <p className="text-xs text-muted-foreground">
                      {ach.progress}/{ach.total}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-luxury">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-2.5 bg-accent/10 rounded-lg border border-accent/30 transition-all hover:bg-accent/15">
                  <p className="text-accent font-semibold text-xs mb-0.5">Learning Style</p>
                  <p className="text-xs text-muted-foreground">Visual & Conversational</p>
                </div>
                <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/30 transition-all hover:bg-primary/15">
                  <p className="text-primary font-semibold text-xs mb-0.5">Strength</p>
                  <p className="text-xs text-muted-foreground">Vocabulary retention</p>
                </div>
                <div className="p-2.5 bg-destructive/10 rounded-lg border border-destructive/30 transition-all hover:bg-destructive/15">
                  <p className="text-destructive font-semibold text-xs mb-0.5">Focus Area</p>
                  <p className="text-xs text-muted-foreground">Article usage (der/die/das)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showMistakeDialog} onOpenChange={setShowMistakeDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-luxury">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Lightbulb className="w-6 h-6 text-accent" />
                Mistake Analysis & Suggestions
              </DialogTitle>
            </DialogHeader>
            
            {mistakeAnalysis && (
              <div className="space-y-4">
                {!mistakeAnalysis.hasErrors ? (
                  <div className="p-4 bg-accent/20 rounded-lg border border-accent">
                    <p className="font-semibold text-accent">✨ Excellent! No significant errors found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2">Mistakes Found:</h4>
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
                    <h4 className="font-semibold mb-2">Alternative Ways to Say It:</h4>
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
                  <h4 className="font-semibold mb-2">Overall Assessment:</h4>
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
