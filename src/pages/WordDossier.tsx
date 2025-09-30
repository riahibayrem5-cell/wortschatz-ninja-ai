import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, BookOpen } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";

const WordDossier = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [searchWord, setSearchWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeWord = async () => {
    if (!searchWord.trim()) {
      toast({ title: "Error", description: "Please enter a word", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-word", {
        body: { word: searchWord, targetLanguage: language },
      });

      if (error) throw error;
      setResult(data);
      toast({ title: "Analysis complete!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      analyzeWord();
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto p-4">
        <Card className="p-8 glass mb-8 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gradient">Word Dossier</h1>
          </div>
          
          <div className="flex gap-3">
            <Input
              placeholder="Enter a German word to analyze..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-background/50 flex-1"
              disabled={loading}
            />
            <Button
              onClick={analyzeWord}
              disabled={loading}
              className="gradient-primary hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </Card>

        {result && (
          <div className="space-y-6">
            {/* Main Word Info */}
            <Card className="p-8 glass glow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-4xl font-bold text-primary mb-2">{result.word}</h2>
                    {result.article && (
                      <Badge variant="secondary" className="text-lg">{result.article}</Badge>
                    )}
                  </div>
                </div>
                
                <AudioPlayer text={result.word} lang="de-DE" />
                
                <Separator />
                
                <div>
                  <h3 className="text-sm text-muted-foreground mb-2">Definition</h3>
                  <p className="text-lg text-foreground">{result.definition}</p>
                </div>

                {result.translation && (
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-2">Translation</h3>
                    <p className="text-lg text-foreground">{result.translation}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Word Family */}
            {result.wordFamily && result.wordFamily.length > 0 && (
              <Card className="p-8 glass">
                <h3 className="text-xl font-semibold mb-4 text-gradient">Word Family (Wortfamilie)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.wordFamily.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-background/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-primary">{item.word}</p>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.meaning}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Prefix Verbs */}
            {result.prefixVerbs && result.prefixVerbs.length > 0 && (
              <Card className="p-8 glass">
                <h3 className="text-xl font-semibold mb-4 text-gradient">Prefix Verbs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.prefixVerbs.map((verb: any, idx: number) => (
                    <div key={idx} className="p-4 bg-background/30 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-primary">{verb.verb}</p>
                        {verb.separable !== undefined && (
                          <Badge variant={verb.separable ? "default" : "secondary"}>
                            {verb.separable ? "Separable" : "Inseparable"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{verb.meaning}</p>
                      {verb.example && (
                        <div className="mt-2 p-2 bg-background/20 rounded">
                          <p className="text-sm italic">{verb.example}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Synonyms & Antonyms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.synonyms && result.synonyms.length > 0 && (
                <Card className="p-6 glass">
                  <h3 className="text-lg font-semibold mb-4 text-green-500">Synonyms</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.synonyms.map((syn: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {syn}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {result.antonyms && result.antonyms.length > 0 && (
                <Card className="p-6 glass">
                  <h3 className="text-lg font-semibold mb-4 text-red-500">Antonyms</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.antonyms.map((ant: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {ant}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Example Sentences */}
            {result.examples && result.examples.length > 0 && (
              <Card className="p-8 glass">
                <h3 className="text-xl font-semibold mb-6 text-gradient">Example Sentences</h3>
                <div className="space-y-6">
                  {result.examples.map((example: any, idx: number) => (
                    <div key={idx} className="p-6 bg-background/30 rounded-lg space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">German</p>
                        <p className="text-lg font-medium text-foreground">{example.german}</p>
                      </div>
                      
                      <AudioPlayer text={example.german} lang="de-DE" />
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Translation</p>
                        <p className="text-base text-muted-foreground">{example.translation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordDossier;
