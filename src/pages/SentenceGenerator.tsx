import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import Navbar from "@/components/Navbar";
import { TELC_B2_TOPICS, GRAMMAR_BY_DIFFICULTY } from "@/utils/constants";
import { DifficultySelector, Difficulty } from "@/components/DifficultySelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackActivity } from "@/utils/activityTracker";

const SentenceGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [difficulty, setDifficulty] = useState<Difficulty>("B2");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [grammarFocus, setGrammarFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [selectedWord, setSelectedWord] = useState<{ word: string; index: number } | null>(null);
  const [wordAnalysis, setWordAnalysis] = useState<any>(null);
  const [analyzingWord, setAnalyzingWord] = useState(false);

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
      // Middle click or Ctrl/Cmd+click - open in new tab
      const url = `/word-dossier?word=${encodeURIComponent(word.replace(/[.,!?;]/g, ''))}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Regular click
      setSelectedWord({ word, index });
      analyzeWord(word);
    }
  };

  const renderAnalysis = (analysis: any) => {
    if (!analysis) return null;

    const renderValue = (value: any, depth: number = 0): JSX.Element => {
      if (typeof value === 'string') {
        return <span className="text-sm text-foreground/90">{value}</span>;
      }
      
      if (Array.isArray(value)) {
        return (
          <div className="flex flex-wrap gap-2">
            {value.map((item, idx) => (
              <span key={idx} className="px-2 py-1 bg-primary/10 rounded text-xs">
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </span>
            ))}
          </div>
        );
      }
      
      if (typeof value === 'object' && value !== null) {
        return (
          <div className="grid gap-2">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="p-3 bg-background/40 rounded-lg">
                <div className="text-xs font-semibold text-primary/80 uppercase tracking-wide mb-1">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className="text-sm">
                  {renderValue(val, depth + 1)}
                </div>
              </div>
            ))}
          </div>
        );
      }
      
      return <span className="text-sm text-foreground/90">{String(value)}</span>;
    };

    return renderValue(analysis);
  };


  const generateSentence = async () => {
    setLoading(true);
    try {
      const finalTopic = topic === "custom" ? customTopic : (topic === "none" ? "" : topic);
      const { data, error } = await supabase.functions.invoke("generate-sentence", {
        body: { difficulty, topic: finalTopic, grammarFocus: grammarFocus === "none" ? "" : grammarFocus },
      });

      if (error) throw error;
      setResult(data);
      
      // Track activity
      await trackActivity('exercise', 1);
      
      toast({ title: t('sentence.generated') });
    } catch (error: any) {
      toast({ title: t('sentence.error'), description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4">
        <Card className="p-8 glass mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-6 text-gradient">{t('sentence.title')}</h1>
          
          <div className="space-y-4">
            <DifficultySelector 
              value={difficulty}
              onChange={setDifficulty}
              disabled={loading}
            />

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">{t('sentence.topic')}</label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={t('sentence.topicPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="none">{t('sentence.noTopic')}</SelectItem>
                  {TELC_B2_TOPICS.map((topicItem) => (
                    <SelectItem key={topicItem} value={topicItem}>{topicItem}</SelectItem>
                  ))}
                  <SelectItem value="custom">{t('sentence.customTopic')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {topic === "custom" && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t('sentence.customTopic')}</label>
                <Input
                  placeholder={t('sentence.customTopicPlaceholder')}
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">{t('sentence.grammarFocus')}</label>
              <Select value={grammarFocus} onValueChange={setGrammarFocus}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={t('sentence.grammarPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="none">{t('sentence.noGrammar')}</SelectItem>
                  {(GRAMMAR_BY_DIFFICULTY[difficulty] || []).map((g) => (
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
                  {t('sentence.generating')}
                </>
              ) : (
                t('sentence.generate')
              )}
            </Button>
          </div>
        </Card>

        {result && (
          <>
            <Card className="p-8 glass glow mb-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm text-muted-foreground">{t('sentence.german')}</h3>
                    <AudioPlayer text={result.german} lang="de-DE" />
                  </div>
                  
                  {/* Continuous sentence with clickable words */}
                  <p className="text-2xl font-semibold leading-relaxed mb-4">
                    {result.german.split(/\s+/).map((word: string, idx: number) => (
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
                        {idx < result.german.split(/\s+/).length - 1 && ' '}
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

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm text-muted-foreground">{t('sentence.english')}</h3>
                    <AudioPlayer text={result.english} lang="en-US" />
                  </div>
                  <p className="text-lg text-foreground">{result.english}</p>
                </div>
              </div>
            </Card>

            <Card className="p-8 glass glow">
              <h3 className="text-lg font-semibold mb-4 text-gradient">{t('sentence.analysis')}</h3>
              <div className="grid gap-3">
                {renderAnalysis(result.analysis)}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default SentenceGenerator;