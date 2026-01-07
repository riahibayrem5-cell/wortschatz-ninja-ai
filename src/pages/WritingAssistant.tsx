import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, PenTool } from "lucide-react";
import Navbar from "@/components/Navbar";
import { TELC_B2_WRITING_PROMPTS } from "@/utils/constants";
import { trackActivity } from "@/utils/activityTracker";
import { DifficultySelector, Difficulty } from "@/components/DifficultySelector";
import { PageBanner } from "@/components/PageBanner";
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
      
      <div className="container max-w-5xl mx-auto p-4 space-y-6">
        <PageBanner
          type="writing"
          title="AI Writing Assistant"
          subtitle="Get expert B2-C1 level feedback on your German writing with detailed corrections and grammar explanations"
          icon={PenTool}
        />
        
        <Card className="p-8 glass">

          {/* Tips Section */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent" />
              Writing Tips for Success
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Structure:</strong> Use clear paragraphs with introduction, body, and conclusion</li>
              <li>• <strong>Vocabulary:</strong> Demonstrate B2-C1 level words and expressions</li>
              <li>• <strong>Grammar:</strong> Use complex sentence structures (subordinate clauses, passive voice)</li>
              <li>• <strong>Connectors:</strong> Use linking words (allerdings, außerdem, dennoch, folglich)</li>
              <li>• <strong>Length:</strong> Aim for 150-180 words for TELC B2 writing tasks</li>
            </ul>
          </div>
          
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
              <label className="text-sm text-muted-foreground mb-2 block">
                Your German text (aim for 150-180 words)
              </label>
              <Textarea
                placeholder="Schreiben Sie Ihren Text hier... Verwenden Sie B2-C1 Strukturen und Vokabular."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="bg-background/50 min-h-[250px]"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Word count: {text.trim().split(/\s+/).filter(Boolean).length} words
              </div>
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
                Overall Assessment
              </h3>
              <div className="space-y-4">
                <p className="text-foreground leading-relaxed">{result.overallFeedback}</p>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-background/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {result.errors?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Errors Found</div>
                  </div>
                  <div className="bg-background/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-accent mb-1">
                      {difficulty}
                    </div>
                    <div className="text-xs text-muted-foreground">Target Level</div>
                  </div>
                  <div className="bg-background/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {text.trim().split(/\s+/).filter(Boolean).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Words Written</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 glass">
              <h3 className="text-xl font-semibold mb-4">Corrected Version</h3>
              <div className="p-6 bg-background/30 rounded-lg border-l-4 border-accent">
                <p className="text-foreground whitespace-pre-line leading-relaxed">{result.correctedText}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                💡 Compare this with your original text to understand the improvements
              </p>
            </Card>

            {result.errors && result.errors.length > 0 && (
              <Card className="p-8 glass">
                <h3 className="text-xl font-semibold mb-4">
                  Detailed Error Analysis ({result.errors.length} issues)
                </h3>
                <div className="space-y-4">
                  {result.errors.map((error: any, index: number) => (
                    <div key={index} className="p-5 bg-destructive/10 rounded-lg border border-destructive/30 hover:border-destructive/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold uppercase text-destructive">
                              {error.type || 'Error'}
                            </span>
                          </div>
                          <div className="text-destructive font-mono text-sm mb-2 p-2 bg-background/50 rounded">
                            ❌ {error.original}
                          </div>
                          <div className="text-accent font-mono text-sm mb-3 p-2 bg-background/50 rounded">
                            ✓ {error.correction}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed bg-background/30 p-3 rounded">
                        <strong className="text-foreground">Explanation:</strong> {error.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {(!result.errors || result.errors.length === 0) && (
              <Card className="p-8 glass border-accent/30">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold mb-2 text-accent">Excellent Work!</h3>
                  <p className="text-muted-foreground">
                    No significant errors were found in your text. Your German writing is at an excellent B2-C1 level!
                  </p>
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