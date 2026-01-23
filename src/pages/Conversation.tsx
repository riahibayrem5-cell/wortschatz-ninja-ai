import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Lightbulb, Volume2, VolumeX, Mic, MicOff, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import { trackActivity } from "@/utils/activityTracker";
import { DifficultySelector, Difficulty } from "@/components/DifficultySelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AudioButton from "@/components/AudioButton";
import PageBanner from "@/components/PageBanner";

const SCENARIOS = [
  "Job Interview (Vorstellungsgespräch)",
  "Restaurant Order (Im Restaurant bestellen)",
  "Hotel Check-in (Hotel Anmeldung)",
  "Doctor's Appointment (Arzttermin)",
  "Shopping for Clothes (Kleidung kaufen)",
  "Asking for Directions (Nach dem Weg fragen)",
  "Small Talk with Neighbors (Smalltalk mit Nachbarn)",
  "Phone Call to Customer Service (Anruf beim Kundenservice)",
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  audio?: string;
}

interface MistakeAnalysis {
  mistakes: Array<{ error: string; correction: string; explanation: string }>;
  alternatives: string[];
  overallAssessment: string;
  hasErrors: boolean;
}

const Conversation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<Difficulty>('B2');
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [audioMode, setAudioMode] = useState<'text' | 'verbal'>('text');
  const [analyzingMessage, setAnalyzingMessage] = useState<string | null>(null);
  const [mistakeAnalysis, setMistakeAnalysis] = useState<MistakeAnalysis | null>(null);
  const [showMistakeDialog, setShowMistakeDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("conversation", {
        body: { action: 'start', scenario, difficulty },
      });

      if (error) throw error;
      
      const aiMessage: Message = { role: 'assistant', content: data.reply };
      setMessages([aiMessage]);
      setStarted(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: conv } = await supabase.from("conversations").insert({
          user_id: session.user.id,
          scenario,
          messages: [aiMessage] as any,
        }).select().single();
        
        setConversationId(conv?.id || null);
      }

      toast({ title: "Conversation started!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const analyzeMistakes = async (text: string) => {
    setAnalyzingMessage(text);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-mistakes", {
        body: { text, difficulty, autoStore: true, source: 'conversation' },
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({ 
        title: "🎤 Recording...", 
        description: "Speak in German now" 
      });
    } catch (error) {
      toast({ 
        title: "Microphone Error", 
        description: "Please allow microphone access.",
        variant: "destructive" 
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setLoading(true);
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
        setInput(transcribedText);
        
        toast({
          title: "Transcribed",
          description: "Your speech was converted to text"
        });
      };
    } catch (error: any) {
      toast({ title: "Transcription Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const conversationHistory = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke("conversation", {
        body: { 
          action: 'continue', 
          scenario, 
          message: currentInput,
          conversationHistory,
          difficulty
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
      
      const aiMessage: Message = { role: 'assistant', content: data.reply, audio: audioData };
      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      // Auto-play in verbal mode with error handling
      if (audioMode === 'verbal' && audioData) {
        try {
          const audio = new Audio(audioData);
          await audio.play().catch((e) => {
            console.warn('Audio autoplay blocked:', e.message);
          });
        } catch (audioErr) {
          console.warn('Audio creation error:', audioErr);
        }
      }

      if (conversationId) {
        await supabase.from("conversations")
          .update({ messages: updatedMessages as any })
          .eq("id", conversationId);
      }

      // Track conversation activity
      await trackActivity('conversation', 1);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const endConversation = async () => {
    if (conversationId) {
      await supabase.from("conversations")
        .update({ status: 'completed' })
        .eq("id", conversationId);
    }
    setStarted(false);
    setMessages([]);
    setConversationId(null);
    toast({ title: "Conversation ended" });
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        {!started ? (
          <>
            <PageBanner
              type="conversation"
              title="Conversation Practice"
              subtitle="Practice real-life German conversations with AI. Choose a scenario and start speaking!"
              icon={MessageSquare}
              badge="Interactive"
              compact
            />
            
            <Card className="p-8 glass">
            
            <div className="space-y-4">
              <DifficultySelector 
                value={difficulty}
                onChange={setDifficulty}
                disabled={loading}
              />

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Audio Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setAudioMode('text')}
                    variant={audioMode === 'text' ? 'default' : 'outline'}
                    className={audioMode === 'text' ? 'gradient-primary' : 'glass'}
                  >
                    <VolumeX className="w-4 h-4 mr-2" />
                    Text Only
                  </Button>
                  <Button
                    onClick={() => setAudioMode('verbal')}
                    variant={audioMode === 'verbal' ? 'default' : 'outline'}
                    className={audioMode === 'verbal' ? 'gradient-primary' : 'glass'}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Verbal Mode
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {audioMode === 'text' ? 'Manual audio playback only' : 'Audio plays automatically'}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Choose a scenario</label>
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCENARIOS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={startConversation}
                disabled={loading}
                className="w-full gradient-primary hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Start Conversation"
                )}
              </Button>
            </div>
          </Card>
          </>
        ) : (
          <div className="space-y-4">
            <Card className="p-6 glass">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{scenario}</h2>
                <Button onClick={endConversation} variant="outline" size="sm" className="glass">
                  End Conversation
                </Button>
              </div>
            </Card>

            <Card className="p-6 glass min-h-[500px] flex flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="whitespace-pre-line flex-1">{message.content}</p>
                        <div className="flex gap-1 shrink-0">
                          {message.role === 'user' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => analyzeMistakes(message.content)}
                              disabled={analyzingMessage === message.content}
                            >
                              {analyzingMessage === message.content ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Lightbulb className="w-4 h-4 text-yellow-500" />
                              )}
                            </Button>
                          )}
                          {message.role === 'assistant' && (
                            <>
                              <AudioButton text={message.content} lang="de-DE" showPlayer />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async () => {
                                  try {
                                    const { data } = await supabase.functions.invoke('analyze-translation', {
                                      body: { text: message.content, targetLanguage: 'en' }
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
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-background/50 p-4 rounded-lg">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2">
                {audioMode === 'verbal' && (
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={loading}
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    className={isRecording ? "animate-pulse" : ""}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                <Input
                  placeholder="Schreiben Sie Ihre Antwort auf Deutsch..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                  disabled={loading}
                  className="bg-background/50"
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="gradient-primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}

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

export default Conversation;