import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Plus, Brain } from "lucide-react";
import AudioButton from "@/components/AudioButton";
import AudioPlayer from "@/components/AudioPlayer";
import Navbar from "@/components/Navbar";
import { TELC_B2_TOPICS } from "@/utils/constants";
import { DifficultySelector, Difficulty } from "@/components/DifficultySelector";
import { trackActivity } from "@/utils/activityTracker";
import { PageBanner } from "@/components/PageBanner";
import { analyzeAndStoreMistakes } from "@/utils/mistakeLogger";
const Memorizer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("B2");
  const [loading, setLoading] = useState(false);
  const [paragraph, setParagraph] = useState<any>(null);
  const [userInput, setUserInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  
  const [selectedWord, setSelectedWord] = useState<{ word: string; index: number } | null>(null);
  const [wordAnalysis, setWordAnalysis] = useState<any>(null);
  const [analyzingWord, setAnalyzingWord] = useState(false);

  const generateParagraph = async () => {
    const finalTheme = theme === "custom" ? customTheme : theme;
    if (!finalTheme.trim()) {
      toast({ title: "Please select or enter a theme", variant: "destructive" });
      return;
    }

    setLoading(true);
    setShowAnswer(false);
    setUserInput("");
    try {
      const { data, error } = await supabase.functions.invoke("generate-memorizer", {
        body: { theme: finalTheme, difficulty },
      });

      if (error) throw error;
      setParagraph(data);
      
      // Track activity
      await trackActivity('review', 1);
      
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

  const analyzeWord = async (word: string) => {
    setAnalyzingWord(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-word", {
        body: { word: word.replace(/[.,!?;]/g, ''), targetLanguage: "en" },
      });

      if (error) throw error;
      setWordAnalysis(data);
    } catch (error: any) {
      toast({ title: "Error analyzing word", description: error.message, variant: "destructive" });
    } finally {
      setAnalyzingWord(false);
    }
  };

  const handleWordClick = (word: string, index: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (e.button === 1 || e.ctrlKey || e.metaKey) {
      const url = `/word-dossier?word=${encodeURIComponent(word.replace(/[.,!?;]/g, ''))}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedWord({ word, index });
      analyzeWord(word);
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

  // Analyze user input when they finish typing with low accuracy
  const handleInputBlur = async () => {
    const accuracy = getAccuracy();
    if (accuracy < 80 && userInput.length > 20) {
      // Silently analyze and store mistakes
      await analyzeAndStoreMistakes(
        userInput,
        'memorizer',
        difficulty,
        { theme, accuracy, originalText: paragraph?.germanText }
      );
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <PageBanner
          type="memorizer"
          title="The Memorizer"
          subtitle="Generate German paragraphs for memorization and practice"
          icon={Brain}
        />
        
        <Card className="p-8 glass">
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Theme</label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select a TELC B2 theme" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {TELC_B2_TOPICS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Theme...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {theme === "custom" && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Custom Theme</label>
                <Input
                  placeholder="Enter your own theme..."
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            )}

            <DifficultySelector 
              value={difficulty}
              onChange={setDifficulty}
              disabled={loading}
            />

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
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm text-muted-foreground">German Text</h3>
                      <AudioPlayer text={paragraph.germanText} lang="de-DE" />
                    </div>
                    
                    <p className="text-lg leading-relaxed mb-4">
                      {paragraph.germanText.split(/\s+/).map((word: string, idx: number) => (
                        <span key={idx}>
                          <button
                            onClick={(e) => handleWordClick(word, idx, e as any)}
                            onMouseDown={(e) => {
                              if (e.button === 1) e.preventDefault();
                            }}
                            onAuxClick={(e) => {
                              if (e.button === 1) handleWordClick(word, idx, e as any);
                            }}
                            className={`inline-block transition-all hover:scale-105 rounded px-1 ${
                              selectedWord?.index === idx
                                ? 'bg-primary text-primary-foreground'
                                : 'text-primary hover:bg-primary/10'
                            }`}
                          >
                            {word}
                          </button>
                          {idx < paragraph.germanText.split(/\s+/).length - 1 && ' '}
                        </span>
                      ))}
                    </p>
                    
                    {selectedWord && (
                      <Card className="p-4 glass border-primary/30 animate-in fade-in-50 slide-in-from-top-2">
                        {analyzingWord ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : wordAnalysis ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xl font-bold text-primary">
                                {wordAnalysis.article && <span className="text-sm mr-2">{wordAnalysis.article}</span>}
                                {selectedWord.word.replace(/[.,!?;]/g, '')}
                              </h4>
                              <AudioPlayer text={selectedWord.word} lang="de-DE" />
                            </div>
                            
                            {wordAnalysis.translation && (
                              <p className="text-sm text-muted-foreground">{wordAnalysis.translation}</p>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2">
                              {wordAnalysis.synonyms && wordAnalysis.synonyms.length > 0 && (
                                <div className="p-2 bg-background/40 rounded">
                                  <p className="text-xs text-muted-foreground mb-1">Synonyms</p>
                                  <div className="flex flex-wrap gap-1">
                                    {wordAnalysis.synonyms.slice(0, 3).map((syn: string, i: number) => (
                                      <span key={i} className="text-xs px-1.5 py-0.5 bg-primary/10 rounded">{syn}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {wordAnalysis.wordFamily && wordAnalysis.wordFamily.length > 0 && (
                                <div className="p-2 bg-background/40 rounded">
                                  <p className="text-xs text-muted-foreground mb-1">Related</p>
                                  <div className="flex flex-wrap gap-1">
                                    {wordAnalysis.wordFamily.slice(0, 3).map((item: any, i: number) => (
                                      <span key={i} className="text-xs px-1.5 py-0.5 bg-accent/10 rounded">{item.word}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {wordAnalysis.examples && wordAnalysis.examples[0] && (
                              <div className="p-2 bg-background/20 rounded text-xs">
                                <p className="italic text-muted-foreground">{wordAnalysis.examples[0].german}</p>
                              </div>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => window.open(`/word-dossier?word=${encodeURIComponent(selectedWord.word.replace(/[.,!?;]/g, ''))}`, '_blank')}
                            >
                              Full Analysis →
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Loading analysis...</p>
                        )}
                      </Card>
                    )}
                  </div>
                  <div className="p-4 bg-background/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Translation:</p>
                      <AudioButton text={paragraph.englishTranslation} lang="en-US" />
                    </div>
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
                onBlur={handleInputBlur}
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