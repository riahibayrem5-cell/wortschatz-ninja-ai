import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Plus } from "lucide-react";

interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
}

const Vocabulary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);

  const generateVocabulary = async () => {
    if (!topic.trim()) {
      toast({ title: "Please enter a topic", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-vocabulary", {
        body: { topic, count },
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

      toast({ title: "Added to review!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
          <h1 className="text-3xl font-bold mb-6 text-gradient">Vocabulary Generator</h1>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Topic</label>
              <Input
                placeholder="e.g., Wirtschaft, Umwelt, Politik"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background/50"
              />
            </div>

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
                  <h3 className="text-2xl font-bold text-primary">{item.word}</h3>
                  <Button
                    size="sm"
                    onClick={() => addToReview(item)}
                    className="gradient-accent hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <p className="text-foreground mb-3">{item.definition}</p>
                <div className="p-4 bg-background/30 rounded-lg">
                  <p className="text-sm text-muted-foreground italic">{item.example}</p>
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