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
import { useLanguage } from "@/contexts/LanguageContext";

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

  const renderAnalysis = (analysis: any) => {
    if (!analysis) return null;

    const renderValue = (value: any, depth: number = 0): JSX.Element => {
      if (typeof value === 'string') {
        return <span className="text-foreground">{value}</span>;
      }
      
      if (Array.isArray(value)) {
        return (
          <div className="space-y-1">
            {value.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {renderValue(item, depth + 1)}
              </div>
            ))}
          </div>
        );
      }
      
      if (typeof value === 'object' && value !== null) {
        return (
          <div className={`space-y-2 ${depth > 0 ? 'ml-4 pl-4 border-l-2 border-primary/20' : ''}`}>
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="font-medium text-primary capitalize">
                  {key.replace(/_/g, ' ')}:
                </div>
                <div className="ml-2">
                  {renderValue(val, depth + 1)}
                </div>
              </div>
            ))}
          </div>
        );
      }
      
      return <span className="text-foreground">{String(value)}</span>;
    };

    return (
      <div className="p-6 bg-background/30 rounded-lg space-y-4">
        {renderValue(analysis)}
      </div>
    );
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
                  {t('sentence.generating')}
                </>
              ) : (
                t('sentence.generate')
              )}
            </Button>
          </div>
        </Card>

        {result && (
          <Card className="p-8 glass glow">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">{t('sentence.german')}</h3>
                  <AudioButton text={result.german} lang="de-DE" />
                </div>
                <p className="text-2xl font-semibold text-primary">{result.german}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">{t('sentence.english')}</h3>
                  <AudioButton text={result.english} lang="en-US" />
                </div>
                <p className="text-lg text-foreground">{result.english}</p>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-3">{t('sentence.analysis')}</h3>
                <div className="space-y-4">
                  {renderAnalysis(result.analysis)}
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