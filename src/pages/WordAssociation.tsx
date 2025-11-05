import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, Timer, Zap, Target, Sparkles, Lightbulb, Brain, BookmarkPlus, CheckCircle2 } from "lucide-react";
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
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);

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
      setAiExplanation("");
      setHintsUsed(0);

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

  const loadAIExplanation = async () => {
    if (!currentGameData || loadingExplanation) return;
    
    setLoadingExplanation(true);
    try {
      const { data, error } = await supabase.functions.invoke('explain-word-association', {
        body: {
          germanWord: currentGameData.word.german,
          correctAnswer: currentGameData.word.correctAnswer,
          userAnswer: selectedAnswer
        }
      });

      if (error) throw error;
      setAiExplanation(data.explanation);
    } catch (error: any) {
      toast({
        title: "Error loading explanation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!currentGameData || selectedAnswer) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const isCorrect = answer === currentGameData.word.correctAnswer;
    
    if (isCorrect) {
      const basePoints = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      const timeBonus = Math.floor(timeLeft / 2);
      const hintPenalty = hintsUsed * 5;
      const totalPoints = Math.max(5, basePoints + timeBonus - hintPenalty);
      
      const newStreak = streak + 1;
      
      setScore(score + totalPoints);
      setLastPointsEarned(totalPoints);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      
      // Trigger celebration animation
      const btn = document.querySelector('.correct-answer');
      btn?.classList.add('animate-celebrate');
      
      toast({ 
        title: "🎯 Perfekt!", 
        description: `+${totalPoints} Punkte! Streak: ${newStreak}`,
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
        description: "Wort zur Wiederholung hinzugefügt. View in Review page.",
        action: (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => window.location.href = '/review'}
          >
            View
          </Button>
        )
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
            {/* Session Progress Bar */}
            <div className="glass-luxury p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Session Progress</p>
                <Badge variant="outline" className="text-xs">{round}/10 Questions</Badge>
              </div>
              <Progress value={(round / 10) * 100} className="h-2" />
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass-luxury border-primary/20">
                <CardContent className="p-4 text-center relative">
                  <div className="relative">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500 animate-pulse" />
                    {lastPointsEarned > 0 && showFeedback && (
                      <Badge className="absolute -top-1 -right-1 animate-bounce bg-green-500">
                        +{lastPointsEarned}
                      </Badge>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-gradient-luxury">{score}</p>
                  <p className="text-xs text-muted-foreground">Punkte</p>
                  <Progress 
                    value={(score / 300) * 100} 
                    className="mt-2 h-1"
                  />
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
                  <Timer className={`w-6 h-6 mx-auto mb-2 ${timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-accent'}`} />
                  <p className="text-2xl font-bold">{timeLeft}s</p>
                  <p className="text-xs text-muted-foreground">Time</p>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4 text-center">
                  <Zap className={`w-6 h-6 mx-auto mb-2 ${streak >= 3 ? 'text-orange-500 animate-pulse' : 'text-orange-500'}`} />
                  <p className="text-2xl font-bold">{streak}</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </CardContent>
              </Card>
            </div>

            {/* Time Progress */}
            <Progress value={(timeLeft / 30) * 100} className={`h-2 ${timeLeft < 10 ? 'animate-pulse' : ''}`} />

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
                    <div className="mt-4 flex gap-2 justify-center flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowHint(!showHint);
                          if (!showHint) setHintsUsed(hintsUsed + 1);
                        }}
                        className="gap-2"
                        disabled={selectedAnswer !== null}
                      >
                        <Lightbulb className={`w-4 h-4 ${showHint ? 'text-yellow-500' : ''}`} />
                        {showHint ? 'Hide Hint (-5pts)' : 'Show Hint'}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={saveToReview}
                        className="gap-2"
                        disabled={selectedAnswer !== null}
                      >
                        <BookmarkPlus className="w-4 h-4" />
                        Save for Review
                      </Button>
                    </div>
                    
                    {showHint && (
                      <div className="mt-2 p-3 glass-luxury rounded-lg animate-fade-in">
                        <p className="text-sm text-primary">💡 {currentGameData.hint}</p>
                      </div>
                    )}
                    
                    {/* AI Explanation Button */}
                    {showFeedback && (
                      <div className="mt-3 flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={loadAIExplanation}
                          className="gap-2"
                          disabled={loadingExplanation}
                        >
                          {loadingExplanation ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Why is this the answer?
                            </>
                          )}
                        </Button>
                        
                        {aiExplanation && (
                          <Card className="glass-luxury animate-fade-in">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-2">
                                <Brain className="w-5 h-5 text-primary mt-1 shrink-0" />
                                <div className="text-sm">
                                  <p className="font-semibold mb-2">AI Explanation:</p>
                                  <p className="text-muted-foreground leading-relaxed">
                                    {aiExplanation}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
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
                          h-auto py-8 text-lg font-semibold transition-all glass relative
                          ${!selectedAnswer ? 'hover:scale-105 hover:border-primary hover:shadow-lg' : ''}
                          ${showResult && isCorrect ? 'border-green-500 bg-green-500/20 scale-105 correct-answer' : ''}
                          ${showResult && !isCorrect ? 'border-destructive bg-destructive/20' : ''}
                          ${showFeedback && isCorrect && !isSelected ? 'border-green-500 bg-green-500/10' : ''}
                        `}
                      >
                        <span>{option}</span>
                        {showResult && (
                          <span className="ml-2 text-2xl">
                            {isCorrect ? '✅' : '❌'}
                          </span>
                        )}
                        {showFeedback && isCorrect && (
                          <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-green-500" />
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
