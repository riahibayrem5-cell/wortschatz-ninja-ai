import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import AudioButton from "@/components/AudioButton";
import Navbar from "@/components/Navbar";
import { TELC_B2_TOPICS, GRAMMAR_BY_DIFFICULTY } from "@/utils/constants";
import { DifficultySelector, Difficulty } from "@/components/DifficultySelector";

const SentenceGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<Difficulty>("B2");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [grammarFocus, setGrammarFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateSentence = async () => {
    setLoading(true);
    try {
      const finalTopic = topic === "custom" ? customTopic : (topic === "none" ? "" : topic);
      const { data, error } = await supabase.functions.invoke("generate-sentence", {
        body: { difficulty, topic: finalTopic, grammarFocus: grammarFocus === "none" ? "" : grammarFocus },
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
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4">
        <Card className="p-8 glass mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-6 text-gradient">Sentence Generator</h1>
          
          <div className="space-y-4">
            <DifficultySelector 
              value={difficulty}
              onChange={setDifficulty}
              disabled={loading}
            />

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Topic (optional)</label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select a topic or leave empty" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="none">No specific topic</SelectItem>
                  {TELC_B2_TOPICS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Topic...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {topic === "custom" && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Custom Topic</label>
                <Input
                  placeholder="Enter your own topic..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Grammar Focus (optional)</label>
              <Select value={grammarFocus} onValueChange={setGrammarFocus}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select grammar point or leave empty" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="none">No specific grammar</SelectItem>
                  {GRAMMAR_BY_DIFFICULTY[difficulty].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">German</h3>
                  <AudioButton text={result.german} lang="de-DE" />
                </div>
                <p className="text-2xl font-semibold text-primary">{result.german}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">English</h3>
                  <AudioButton text={result.english} lang="en-US" />
                </div>
                <p className="text-lg text-foreground">{result.english}</p>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-3">Grammatical Analysis</h3>
                <div className="p-4 bg-background/30 rounded-lg">
                  <pre className="text-foreground whitespace-pre-wrap text-sm">{JSON.stringify(result.analysis, null, 2)}</pre>
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