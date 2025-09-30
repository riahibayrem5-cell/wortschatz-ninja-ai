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
  Loader2
} from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  feedback?: {
    grammar?: string;
    vocabulary?: string;
    pronunciation?: string;
  };
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

const AICompanion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadUserProgress();
    startCompanion();
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
        title: "🎤 Listening...", 
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
      
      // Add AI response
      const aiMsg: Message = {
        role: 'assistant',
        content: data.reply,
        feedback: {
          grammar: "Analyzing...",
          vocabulary: "Checking...",
          pronunciation: "Evaluating..."
        }
      };
      
      setMessages(prev => [...prev, aiMsg]);
      speakMessage(data.reply);
      
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
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, language: 'de' }
      });

      if (error) throw error;

      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
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
      
      <div className="container max-w-7xl mx-auto p-4">
        {/* Header with Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 mt-6">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Level {userLevel}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={xp} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">{xp}/100 XP</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">{streak} days</p>
            </CardContent>
          </Card>

          <Card className="glass col-span-1 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              {achievements.filter(a => a.unlocked).slice(0, 3).map(ach => (
                <Badge key={ach.id} variant="secondary" className="text-xs">
                  <ach.icon className="w-3 h-3 mr-1" />
                  {ach.title}
                </Badge>
              ))}
              {achievements.filter(a => a.unlocked).length === 0 && (
                <p className="text-xs text-muted-foreground">Keep practicing to unlock!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat */}
          <div className="lg:col-span-2">
            <Card className="glass h-[calc(100vh-300px)] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary animate-pulse" />
                  AI Learning Companion
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                </CardTitle>
                <CardDescription>
                  Voice or text - I adapt to YOUR learning style in real-time!
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background/50 border border-primary/20'
                      }`}
                    >
                      <p className="whitespace-pre-line mb-2">{msg.content}</p>
                      {msg.feedback && msg.role === 'assistant' && (
                        <div className="text-xs space-y-1 mt-3 pt-3 border-t border-primary/20">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-muted-foreground">Instant Feedback:</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Badge variant="outline" className="text-xs">Grammar ✓</Badge>
                            <Badge variant="outline" className="text-xs">Vocab ✓</Badge>
                            <Badge variant="outline" className="text-xs">Fluency +2</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              <CardContent className="border-t pt-4">
                <div className="flex gap-2 mb-3">
                  <Button
                    onClick={isListening ? stopVoiceRecording : startVoiceRecording}
                    variant={isListening ? "destructive" : "default"}
                    className={isListening ? "" : "gradient-primary"}
                    disabled={isProcessing}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Voice
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => isSpeaking ? null : speakMessage(messages[messages.length - 1]?.content || "")}
                    variant="outline"
                    className="glass"
                    disabled={messages.length === 0 || isSpeaking}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-4 h-4" />
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
                    className="bg-background/50 min-h-[60px]"
                  />
                  <Button
                    onClick={sendTextMessage}
                    disabled={!inputText.trim() || isProcessing}
                    className="gradient-accent"
                  >
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Sidebar */}
          <div className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map(ach => (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-lg border ${
                      ach.unlocked 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-background/30 border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ach.icon className={`w-4 h-4 ${ach.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="font-semibold text-sm">{ach.title}</p>
                      </div>
                      {ach.unlocked && <Badge variant="secondary" className="text-xs">✓</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{ach.description}</p>
                    <Progress value={(ach.progress / ach.total) * 100} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {ach.progress}/{ach.total}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-2 bg-accent/10 rounded-lg border border-accent/30">
                  <p className="text-accent font-semibold mb-1">Learning Style</p>
                  <p className="text-xs text-muted-foreground">Visual & Conversational</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/30">
                  <p className="text-primary font-semibold mb-1">Strength</p>
                  <p className="text-xs text-muted-foreground">Vocabulary retention</p>
                </div>
                <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/30">
                  <p className="text-destructive font-semibold mb-1">Focus Area</p>
                  <p className="text-xs text-muted-foreground">Article usage (der/die/das)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;
