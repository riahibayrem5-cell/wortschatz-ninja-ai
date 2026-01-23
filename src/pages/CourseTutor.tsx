import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Send, Trash2, Sparkles } from "lucide-react";
import { analyzeAndStoreMistakes } from "@/utils/mistakeLogger";

interface CourseModule {
  id: string;
  week_number: number;
  title: string;
  title_de: string;
  description: string;
}

const CourseTutor = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const [module, setModule] = useState<CourseModule | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<{role: string; content: string}[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, [moduleId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    await fetchModule();
    setLoading(false);
  };

  const fetchModule = async () => {
    if (!moduleId) return;
    
    const { data } = await supabase
      .from('course_modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    setModule(data);
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setStreaming(true);

    // Silently analyze user message for mistakes in the background
    if (currentInput.length > 15) {
      analyzeAndStoreMistakes(
        currentInput,
        'course-tutor',
        'B2',
        { moduleId, moduleTitle: module?.title }
      ).catch(console.error);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/course-ai-tutor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          moduleContext: module,
          userLevel: "B2",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get tutor response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                  return updated;
                });
              }
            } catch (parseError) {
              // SSE parsing can fail for incomplete chunks, continue processing
              console.debug('SSE chunk parse skipped');
            }
          }
        }
      }

    } catch (error: any) {
      console.error("Tutor error:", error);
      toast.error(error.message || "Failed to get tutor response");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const quickPrompts = [
    "What are the key concepts I should master in this module?",
    "Give me a practice exercise for this week's topics",
    "Explain the most common mistakes students make",
    "How can I prepare for the TELC B2 exam with this content?",
    "Can you quiz me on what I've learned?",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/mastery-course/${moduleId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Module
          </Button>
          <Button variant="outline" size="sm" onClick={clearChat}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Tutor - {module?.title || 'TELC B2 Course'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your personal German language tutor. Ask anything about Week {module?.week_number}: {module?.title}
            </p>
          </CardHeader>
        </Card>

        {/* Chat Area */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="h-[500px] overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    I'm your AI tutor for the TELC B2 Mastery Course. Ask me anything about {module?.title || 'German language learning'}!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {quickPrompts.slice(0, 3).map((prompt, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setInput(prompt)}
                      >
                        {prompt.slice(0, 40)}...
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary rounded-bl-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {streaming && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="bg-secondary p-4 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <Textarea
                placeholder="Ask your tutor anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="min-h-[60px] resize-none"
              />
              <Button 
                className="self-end"
                onClick={sendMessage}
                disabled={streaming || !input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Prompts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suggested Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(prompt)}
                  disabled={streaming}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseTutor;
