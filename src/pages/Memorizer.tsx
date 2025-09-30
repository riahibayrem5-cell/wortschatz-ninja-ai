import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Eye, EyeOff, Plus } from "lucide-react";

const Memorizer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState("B2");
  const [loading, setLoading] = useState(false);
  const [paragraph, setParagraph] = useState<any>(null);
  const [userInput, setUserInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const generateParagraph = async () => {
    if (!theme.trim()) {
      toast({ title: "Please enter a theme", variant: "destructive" });
      return;
    }

    setLoading(true);
    setShowAnswer(false);
    setUserInput("");
    try {
      const { data, error } = await supabase.functions.invoke("generate-memorizer", {
        body: { theme, difficulty },
      });

      if (error) throw error;
      setParagraph(data);
      toast({ title: "Paragraph generated!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addToReview = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please log in to save", variant: "destructive" });
        return;
      }

      await supabase.from("memorizer_items").insert({
        user_id: session.user.id,
        theme,
        difficulty,
        german_text: paragraph.germanText,
        english_translation: paragraph.englishTranslation,
      });

      toast({ title: "Added to review!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getAccuracy = () => {
    if (!userInput || !paragraph) return 0;
    const original = paragraph.germanText.toLowerCase().replace(/[^\w\s]/g, '');
    const input = userInput.toLowerCase().replace(/[^\w\s]/g, '');
    const originalWords = original.split(/\s+/);
    const inputWords = input.split(/\s+/);
    
    let matches = 0;
    const minLength = Math.min(originalWords.length, inputWords.length);
    
    for (let i = 0; i < minLength; i++) {
      if (originalWords[i] === inputWords[i]) matches++;
    }
    
    return Math.round((matches / originalWords.length) * 100);
  };

  return (
    <div className="min-h-screen gradient-hero p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          size="sm"
          className="mb-6 glass"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="p-8 glass mb-8">
          <h1 className="text-3xl font-bold mb-6 text-gradient">The Memorizer</h1>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Theme</label>
              <Input
                placeholder="e.g., climate change, German culture, technology"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateParagraph}
              disabled={loading}
              className="w-full gradient-primary hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Paragraph"
              )}
            </Button>
          </div>
        </Card>

        {paragraph && (
          <div className="space-y-6">
            <Card className="p-8 glass glow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Memorize This:</h3>
                <Button
                  onClick={() => setShowAnswer(!showAnswer)}
                  variant="outline"
                  size="sm"
                  className="glass"
                >
                  {showAnswer ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Show
                    </>
                  )}
                </Button>
              </div>

              {showAnswer ? (
                <div className="space-y-4">
                  <div className="p-4 bg-background/30 rounded-lg">
                    <p className="text-lg leading-relaxed">{paragraph.germanText}</p>
                  </div>
                  <div className="p-4 bg-background/20 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Translation:</p>
                    <p className="text-foreground">{paragraph.englishTranslation}</p>
                  </div>
                  {paragraph.keyVocabulary && paragraph.keyVocabulary.length > 0 && (
                    <div className="p-4 bg-background/20 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">Key Vocabulary:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {paragraph.keyVocabulary.map((item: any, index: number) => (
                          <div key={index} className="text-sm">
                            <span className="font-semibold text-primary">{item.word}</span>
                            <span className="text-muted-foreground"> - {item.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={addToReview}
                    className="w-full gradient-accent hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Review
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-background/30 rounded-lg text-center">
                  <p className="text-muted-foreground">Click "Show" to see the paragraph</p>
                </div>
              )}
            </Card>

            <Card className="p-8 glass">
              <h3 className="text-xl font-semibold mb-4">Practice Writing It:</h3>
              <Textarea
                placeholder="Schreiben Sie den Absatz aus dem Gedächtnis..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="bg-background/50 min-h-[200px] mb-4"
              />
              {userInput && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Accuracy:</span>
                  <span className="text-3xl font-bold text-primary">{getAccuracy()}%</span>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Memorizer;