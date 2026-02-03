import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Highlighter } from "lucide-react";
import Navbar from "@/components/Navbar";
import { DifficultySelector, Difficulty } from "@/components/DifficultySelector";
import { PageBanner } from "@/components/PageBanner";
import TextReaderPanel from "@/components/TextReaderPanel";

interface HighlightedWord {
  word: string;
  definition: string;
  level: string;
}

const TextHighlighter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<Difficulty>('B2');
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<HighlightedWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<HighlightedWord | null>(null);

  const analyzeText = async () => {
    if (!text.trim()) {
      toast({ title: "Please enter some German text", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("highlight-text", {
        body: { text, difficulty },
      });

      if (error) throw error;
      setHighlights(data.highlightedWords || []);
      toast({ title: "Text analyzed!", description: `Found ${data.highlightedWords?.length || 0} ${difficulty} level words` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addWordToReview = async (word: HighlightedWord) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please log in to save words", variant: "destructive" });
        return;
      }

      await supabase.from("vocabulary_items").insert({
        user_id: session.user.id,
        word: word.word,
        definition: word.definition,
        example: `From highlighted text`,
        topic: 'reading',
      });

      toast({ title: "Word added to review!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getHighlightedText = () => {
    if (highlights.length === 0) return text;

    let highlightedText = text;
    highlights.forEach((h) => {
      const regex = new RegExp(`\\b${h.word}\\b`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<mark class="bg-primary/30 cursor-pointer hover:bg-primary/50 transition-colors px-1 rounded" data-word="${h.word}">${h.word}</mark>`
      );
    });

    return highlightedText;
  };

  const handleWordClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'MARK') {
      const wordText = target.getAttribute('data-word');
      const word = highlights.find(h => h.word.toLowerCase() === wordText?.toLowerCase());
      if (word) setSelectedWord(word);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-5xl mx-auto p-4 space-y-6">
        <PageBanner
          type="text-highlighter"
          title="Text Highlighter"
          subtitle="Paste German text and highlight vocabulary at your level"
          icon={Highlighter}
        />
        
        <Card className="p-8 glass">
          
          <div className="space-y-4">
            <DifficultySelector 
              value={difficulty}
              onChange={setDifficulty}
              disabled={loading}
            />
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Paste German text (e.g., news article, essay)
              </label>
              <Textarea
                placeholder="Fügen Sie einen deutschen Text ein..."
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
                `Highlight ${difficulty}+ Vocabulary`
              )}
            </Button>
          </div>
        </Card>

        {/* Text Reader Panel - Always visible when there's text */}
        {text.trim() && (
          <TextReaderPanel text={text} className="w-full" />
        )}

        {highlights.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-8 glass">
              <h3 className="text-xl font-semibold mb-4">Highlighted Text</h3>
              <div
                className="prose prose-invert max-w-none leading-relaxed"
                onClick={handleWordClick}
                dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
              />
            </Card>

            <Card className="p-6 glass">
              <h3 className="text-xl font-semibold mb-4">
                {selectedWord ? 'Word Details' : 'Vocabulary List'}
              </h3>
              
              {selectedWord ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-primary mb-2">{selectedWord.word}</h4>
                    <span className="text-xs text-muted-foreground bg-background/30 px-2 py-1 rounded">
                      {selectedWord.level}
                    </span>
                  </div>
                  <p className="text-foreground">{selectedWord.definition}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => addWordToReview(selectedWord)}
                      className="flex-1 gradient-accent hover:opacity-90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Review
                    </Button>
                    <Button
                      onClick={() => setSelectedWord(null)}
                      variant="outline"
                      className="glass"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {highlights.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedWord(word)}
                      className="w-full text-left p-3 glass hover:glow transition-all rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-primary">{word.word}</span>
                        <span className="text-xs text-muted-foreground">{word.level}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{word.definition}</p>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextHighlighter;