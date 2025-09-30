import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const SentenceGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState("B2");
  const [topic, setTopic] = useState("");
  const [grammarFocus, setGrammarFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateSentence = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sentence", {
        body: { difficulty, topic, grammarFocus },
      });

      if (error) throw error;
      setResult(data);
      toast({ title: "Sentence generated!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold mb-6 text-gradient">Sentence Generator</h1>
          
          <div className="space-y-4">
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

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Topic (optional)</label>
              <Input
                placeholder="e.g., travel, business, environment"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Grammar Focus (optional)</label>
              <Input
                placeholder="e.g., Konjunktiv II, Passiv, Relativsätze"
                value={grammarFocus}
                onChange={(e) => setGrammarFocus(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <Button
              onClick={generateSentence}
              disabled={loading}
              className="w-full gradient-primary hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Sentence"
              )}
            </Button>
          </div>
        </Card>

        {result && (
          <Card className="p-8 glass glow">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm text-muted-foreground mb-2">German</h3>
                <p className="text-2xl font-semibold text-primary">{result.german}</p>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-2">English</h3>
                <p className="text-lg text-foreground">{result.english}</p>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-3">Grammatical Analysis</h3>
                <div className="p-4 bg-background/30 rounded-lg">
                  <p className="text-foreground whitespace-pre-line">{result.analysis}</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SentenceGenerator;