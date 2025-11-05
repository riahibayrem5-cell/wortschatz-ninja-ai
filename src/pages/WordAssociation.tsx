import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, Timer, Zap, Target, Sparkles, Lightbulb, Brain, BookmarkPlus } from "lucide-react";
import { trackActivity } from "@/utils/activityTracker";

interface Word {
  german: string;
  article?: string;
  correctAnswer: string;
  category: string;
  example?: string;
  level?: string;
}

interface GameData {
  word: Word;
  options: string[];
  hint: string;
}

const WordAssociation = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [currentGameData, setCurrentGameData] = useState<GameData | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showHint, setShowHint] = useState(false);
  const [previousWords, setPreviousWords] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameActive]);

  const startGame = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please log in to play", variant: "destructive" });
        return;
      }

      setGameActive(true);
      setScore(0);
      setRound(0);
      setStreak(0);
      setTimeLeft(30);
      await loadNextRound();
    } catch (error: any) {
      toast({ title: "Error starting game", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadNextRound = async () => {
    try {
      setLoading(true);
      setShowHint(false);
      setSelectedAnswer(null);
      setShowFeedback(false);

      // Call AI to generate word association question
      const { data, error } = await supabase.functions.invoke('generate-word-association', {
        body: { 
          difficulty, 
          round: round + 1,
          previousWords 
        }
      });

      if (error) throw error;

      setCurrentGameData(data);
      setPreviousWords([...previousWords, data.word.german]);
      setRound(round + 1);
      setTimeLeft(30);
    } catch (error: any) {
      toast({ 
        title: "Error loading question", 
        description: error.message, 
        variant: "destructive" 
      });
      if (error.message.includes('Rate limit') || error.message.includes('credits')) {
        setGameActive(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!currentGameData || selectedAnswer) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const isCorrect = answer === currentGameData.word.correctAnswer;
    
    if (isCorrect) {
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      const bonusPoints = Math.floor(timeLeft / 2);
      const newStreak = streak + 1;
      
      setScore(score + points + bonusPoints);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      
      toast({ 
        title: "🎯 Perfekt!", 
        description: `+${points + bonusPoints} Punkte! Streak: ${newStreak}`,
        className: "bg-primary text-primary-foreground"
      });
    } else {
      setStreak(0);
      toast({ 
        title: "❌ Nicht ganz", 
        description: `Richtig: ${currentGameData.word.correctAnswer}`, 
        variant: "destructive" 
      });
    }

    // Track activity
    try {
      await trackActivity('word', 1);
    } catch (error) {
      console.error("Error tracking activity:", error);
    }

    if (round < 10) {
      setTimeout(() => loadNextRound(), 2500);
    } else {
      setTimeout(() => endGame(), 2500);
    }
  };

  const saveToReview = async () => {
    if (!currentGameData) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Bitte anmelden", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("vocabulary_items").insert({
        user_id: session.user.id,
        word: currentGameData.word.german,
        article: currentGameData.word.article || null,
        definition: currentGameData.word.correctAnswer,
        example: currentGameData.word.example || null,
        topic: currentGameData.word.category
      });

      if (error) throw error;

      toast({ 
        title: "✅ Gespeichert!", 
        description: "Wort zur Wiederholung hinzugefügt" 
      });
    } catch (error: any) {
      toast({ 
        title: "Fehler", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const endGame = async () => {
    setGameActive(false);
    
    const earnedStars = score > 200 ? 3 : score > 100 ? 2 : 1;
    
    toast({
      title: `🏆 Spiel Beendet!`,
      description: `Punktzahl: ${score} | Beste Serie: ${bestStreak} | ${'⭐'.repeat(earnedStars)}`,
    });
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4 md:p-6">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-luxury">
              Wortassoziation
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Test your German vocabulary with AI-generated word associations! 
            Match words with their correct English translations and build your streak.
          </p>
        </div>

        {!gameActive ? (
          <Card className="glass-luxury animate-scale-in">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">AI-Powered Word Association</CardTitle>
                  <CardDescription>
                    Dynamically generated questions tailored to your level
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <p className="font-semibold">Schwierigkeitsgrad wählen:</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={difficulty === level ? "default" : "outline"}
                      onClick={() => setDifficulty(level)}
                      className={`capitalize transition-all ${
                        difficulty === level ? 'gradient-primary scale-105' : ''
                      }`}
                    >
                      {level === 'easy' ? 'Leicht (A2-B1)' : 
                       level === 'medium' ? 'Mittel (B1-B2)' : 
                       'Schwer (B2-C1)'}
                    </Button>
                  ))}
                </div>
                
                <div className="glass p-4 rounded-lg space-y-2">
                  <p className="font-semibold text-sm">🎯 Punktesystem:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Leicht</Badge>
                      <span>10 Punkte</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Mittel</Badge>
                      <span>20 Punkte</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Schwer</Badge>
                      <span>30 Punkte</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>Bonus: Zeit ÷ 2</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={startGame}
                disabled={loading}
                size="lg"
                className="w-full gradient-luxury luxury-glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Wird geladen...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Spiel Starten
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{score}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4 text-center">
                  <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{round}/10</p>
                  <p className="text-xs text-muted-foreground">Round</p>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4 text-center">
                  <Timer className="w-6 h-6 mx-auto mb-2 text-destructive" />
                  <p className="text-2xl font-bold">{timeLeft}s</p>
                  <p className="text-xs text-muted-foreground">Time</p>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">{streak}</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </CardContent>
              </Card>
            </div>

            {/* Time Progress */}
            <Progress value={(timeLeft / 30) * 100} className="h-2" />

            {/* Current Word */}
            {currentGameData && (
              <>
                <Card className="glass-luxury border-2 border-primary luxury-glow animate-scale-in">
                  <CardHeader className="text-center pb-3">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Badge className="gradient-primary px-3 py-1">
                        {currentGameData.word.level || 'B1-B2'}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1">
                        {currentGameData.word.category}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-4xl md:text-6xl font-bold text-gradient-luxury mb-3">
                      {currentGameData.word.article ? 
                        `${currentGameData.word.article} ${currentGameData.word.german}` : 
                        currentGameData.word.german
                      }
                    </CardTitle>
                    
                    <CardDescription className="text-lg">
                      Wähle die richtige englische Übersetzung
                    </CardDescription>

                    {currentGameData.word.example && (
                      <div className="mt-4 p-3 glass rounded-lg">
                        <p className="text-sm italic text-muted-foreground">
                          "{currentGameData.word.example}"
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHint(!showHint)}
                        className="gap-2"
                      >
                        <Lightbulb className={`w-4 h-4 ${showHint ? 'text-yellow-500' : ''}`} />
                        {showHint ? 'Hinweis verbergen' : 'Hinweis anzeigen'}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={saveToReview}
                        className="gap-2"
                        disabled={selectedAnswer !== null}
                      >
                        <BookmarkPlus className="w-4 h-4" />
                        Speichern
                      </Button>
                    </div>
                    
                    {showHint && (
                      <div className="mt-2 p-3 glass-luxury rounded-lg animate-fade-in">
                        <p className="text-sm text-primary">💡 {currentGameData.hint}</p>
                      </div>
                    )}
                  </CardHeader>
                </Card>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentGameData.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === currentGameData.word.correctAnswer;
                    const showResult = showFeedback && isSelected;
                    
                    return (
                      <Button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        disabled={loading || selectedAnswer !== null}
                        variant="outline"
                        className={`
                          h-auto py-6 text-lg font-semibold transition-all glass
                          ${!selectedAnswer ? 'hover:scale-105 hover:border-primary' : ''}
                          ${showResult && isCorrect ? 'border-green-500 bg-green-500/20 scale-105' : ''}
                          ${showResult && !isCorrect ? 'border-destructive bg-destructive/20' : ''}
                          ${showFeedback && isCorrect && !isSelected ? 'border-green-500 bg-green-500/10' : ''}
                        `}
                      >
                        <span>{option}</span>
                        {showResult && (
                          <span className="ml-2">
                            {isCorrect ? '✅' : '❌'}
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </>
            )}
            
            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            )}

            <Button
              onClick={() => {
                setGameActive(false);
                toast({ title: "Game ended" });
              }}
              variant="ghost"
              className="w-full"
            >
              End Game
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordAssociation;
