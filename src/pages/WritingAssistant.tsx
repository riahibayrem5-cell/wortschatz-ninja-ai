import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { TELC_B2_WRITING_PROMPTS } from "@/utils/constants";
import { trackActivity } from "@/utils/activityTracker";
import { DifficultySelector, Difficulty } from "@/components/DifficultySelector";

const WritingAssistant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<Difficulty>('B2');
  const [prompt, setPrompt] = useState(TELC_B2_WRITING_PROMPTS[0]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeText = async () => {
    if (!text.trim()) {
      toast({ title: "Please write some text first", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("writing-assistant", {
        body: { text, prompt, difficulty },
      });

      if (error) throw error;
      setResult(data);

      // Save to database
      if (session) {
        await supabase.from("writing_submissions").insert({
          user_id: session.user.id,
          prompt,
          original_text: text,
          corrected_text: data.correctedText,
          overall_feedback: data.overallFeedback,
          errors: data.errors || [],
        });

        // Log mistakes
        if (data.errors && Array.isArray(data.errors)) {
          for (const error of data.errors) {
            await supabase.from("mistakes").insert({
              user_id: session.user.id,
              type: error.type || 'grammar',
              content: error.original,
              correction: error.correction,
              explanation: error.explanation,
              category: 'writing',
            });
          }
        }
      }

      // Track writing activity
      await trackActivity('writing', 1);

      toast({ title: "Analysis complete!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-5xl mx-auto p-4">
        <Card className="p-8 glass mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-6 text-gradient">Writing Assistant</h1>
          
          <div className="space-y-4">
            <DifficultySelector 
              value={difficulty}
              onChange={setDifficulty}
              disabled={loading}
            />
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Choose a TELC B2 prompt</label>
              <Select value={prompt} onValueChange={setPrompt}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TELC_B2_WRITING_PROMPTS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Your German text</label>
              <Textarea
                placeholder="Schreiben Sie Ihren Text hier..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="bg-background/50 min-h-[200px]"
              />
            </div>

            <Button
              onClick={analyzeText}
              disabled={loading}
              className="w-full gradient-primary hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze My Writing"
              )}
            </Button>
          </div>
        </Card>

        {result && (
          <div className="space-y-6">
            <Card className="p-8 glass">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-accent" />
                Overall Feedback
              </h3>
              <p className="text-foreground">{result.overallFeedback}</p>
            </Card>

            <Card className="p-8 glass">
              <h3 className="text-xl font-semibold mb-4">Corrected Version</h3>
              <div className="p-4 bg-background/30 rounded-lg">
                <p className="text-foreground whitespace-pre-line">{result.correctedText}</p>
              </div>
            </Card>

            {result.errors && result.errors.length > 0 && (
              <Card className="p-8 glass">
                <h3 className="text-xl font-semibold mb-4">Detailed Errors</h3>
                <div className="space-y-4">
                  {result.errors.map((error: any, index: number) => (
                    <div key={index} className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-destructive font-mono">{error.original}</span>
                        <span className="text-xs text-muted-foreground">{error.type}</span>
                      </div>
                      <div className="text-sm mb-2">
                        <span className="text-muted-foreground">Correction: </span>
                        <span className="text-accent font-medium">{error.correction}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{error.explanation}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingAssistant;