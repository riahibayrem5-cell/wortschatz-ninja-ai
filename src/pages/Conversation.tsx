import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { trackActivity } from "@/utils/activityTracker";

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
}

const Conversation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("conversation", {
        body: { action: 'start', scenario },
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

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
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
          message: input,
          conversationHistory 
        },
      });

      if (error) throw error;
      
      const aiMessage: Message = { role: 'assistant', content: data.reply };
      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

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
      
      <div className="container max-w-4xl mx-auto p-4">
        {!started ? (
          <Card className="p-8 glass mt-6">
            <h1 className="text-3xl font-bold mb-6 text-gradient">Conversation Practice</h1>
            
            <div className="space-y-4">
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
                      <p className="whitespace-pre-line">{message.content}</p>
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
      </div>
    </div>
  );
};

export default Conversation;