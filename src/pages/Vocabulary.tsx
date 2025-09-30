import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Check } from "lucide-react";
import AudioButton from "@/components/AudioButton";
import Navbar from "@/components/Navbar";
import { TELC_B2_TOPICS } from "@/utils/constants";
import { trackActivity } from "@/utils/activityTracker";
import { DifficultySelector, Difficulty } from "@/components/DifficultySelector";

interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
}

const Vocabulary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<Difficulty>('B2');
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set());

  const generateVocabulary = async () => {
    const finalTopic = topic === "custom" ? customTopic : topic;
    if (!finalTopic.trim()) {
      toast({ title: "Please select or enter a topic", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const finalTopic = topic === "custom" ? customTopic : topic;
      const { data, error } = await supabase.functions.invoke("generate-vocabulary", {
        body: { topic: finalTopic, count, difficulty },
      });

      if (error) throw error;
      setVocabulary(data.vocabularyList);
      toast({ title: "Vocabulary generated!", description: `${data.vocabularyList.length} words created` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addToReview = async (item: VocabularyItem) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please log in to save words", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("vocabulary_items").insert({
        user_id: session.user.id,
        word: item.word,
        definition: item.definition,
        example: item.example,
        topic,
      });

      if (error) throw error;

      // Update progress
      const { data: progress } = await supabase
        .from("user_progress")
        .select("words_learned")
        .eq("user_id", session.user.id)
        .single();

      if (progress) {
        await supabase
          .from("user_progress")
          .update({ words_learned: progress.words_learned + 1 })
          .eq("user_id", session.user.id);
      }

      // Track activity
      await trackActivity('word', 1);

      // Mark as added
      setAddedWords(prev => new Set([...prev, item.word]));

      toast({ title: "Added to review!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4">
        <Card className="p-8 glass mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-6 text-gradient">Vocabulary Generator</h1>
          
          <div className="space-y-4">
            <DifficultySelector 
              value={difficulty}
              onChange={setDifficulty}
              disabled={loading}
            />
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Topic</label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select a TELC B2 topic" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
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
              <label className="text-sm text-muted-foreground mb-2 block">Number of words</label>
              <Input
                type="number"
                min="5"
                max="20"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="bg-background/50"
              />
            </div>

            <Button
              onClick={generateVocabulary}
              disabled={loading}
              className="w-full gradient-primary hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Vocabulary"
              )}
            </Button>
          </div>
        </Card>

        {vocabulary.length > 0 && (
          <div className="space-y-4">
            {vocabulary.map((item, index) => (
              <Card key={index} className="p-6 glass hover:glow transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-primary">{item.word}</h3>
                    <AudioButton text={item.word} lang="de-DE" />
                  </div>
                  {addedWords.has(item.word) ? (
                    <Button
                      size="sm"
                      disabled
                      className="bg-green-500/20 text-green-500 cursor-default"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Added to review!
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => addToReview(item)}
                      className="gradient-accent hover:opacity-90"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
                <p className="text-foreground mb-3">{item.definition}</p>
                <div className="p-4 bg-background/30 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-muted-foreground italic flex-1">{item.example}</p>
                    <AudioButton text={item.example} lang="de-DE" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vocabulary;