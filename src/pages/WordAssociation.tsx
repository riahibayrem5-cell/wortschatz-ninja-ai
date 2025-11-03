import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, Timer, Zap, Target, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Word {
  german: string;
  english: string;
  category: string;
}

const WordAssociation = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

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
      // Fetch random words from vocabulary_items
      const limit = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
      const { data: words, error } = await supabase
        .from("vocabulary_items")
        .select("word, definition, example")
        .limit(limit);

      if (error) throw error;
      if (!words || words.length < 4) {
        toast({ title: "Not enough vocabulary", description: "Add more words to play", variant: "destructive" });
        setGameActive(false);
        return;
      }

      // Pick random word as answer
      const shuffled = words.sort(() => Math.random() - 0.5);
      const correct = shuffled[0];
      setCurrentWord({
        german: correct.word,
        english: correct.definition,
        category: 'German'
      });

      // Create options (3 wrong + 1 correct)
      const wrongOptions = shuffled.slice(1, 4);
      const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
      setOptions(allOptions.map(w => ({
        german: w.word,
        english: w.definition,
        category: 'German'
      })));

      setRound(round + 1);
    } catch (error: any) {
      toast({ title: "Error loading round", description: error.message, variant: "destructive" });
      setGameActive(false);
    }
  };

  const handleAnswer = async (selectedWord: Word) => {
    const isCorrect = selectedWord.german === currentWord?.german;
    
    if (isCorrect) {
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      const bonusPoints = Math.floor(timeLeft / 2);
      setScore(score + points + bonusPoints);
      setStreak(streak + 1);
      toast({ title: "✅ Correct!", description: `+${points + bonusPoints} points` });
    } else {
      setStreak(0);
      toast({ title: "❌ Wrong", description: `Correct: ${currentWord?.german} = ${currentWord?.english}`, variant: "destructive" });
    }

    // Save to progress
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("user_progress").insert({
          user_id: session.user.id,
          activity_type: 'word_association',
          score: isCorrect ? 1 : 0,
          details: { word: currentWord?.german, correct: isCorrect }
        });
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }

    if (round < 10) {
      setTimeout(() => loadNextRound(), 1500);
    } else {
      setTimeout(() => endGame(), 1500);
    }
  };

  const endGame = async () => {
    setGameActive(false);
    toast({
      title: "🎮 Game Over!",
      description: `Final Score: ${score} | Rounds: ${round}`,
    });

    // Save final score
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("user_progress").insert({
          user_id: session.user.id,
          activity_type: 'word_association_game',
          score,
          details: { difficulty, rounds_completed: round, final_score: score }
        });
      }
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4 md:p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-luxury">
            🎯 Word Association Game
          </h1>
          <p className="text-muted-foreground text-lg">
            Match German words with their English translations as fast as you can!
          </p>
        </div>

        {!gameActive ? (
          <Card className="glass-luxury">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Play?</CardTitle>
              <CardDescription>Choose your difficulty and start matching words!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="font-semibold">Select Difficulty:</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={difficulty === level ? "default" : "outline"}
                      onClick={() => setDifficulty(level)}
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Easy: 10 points per correct answer</p>
                  <p>• Medium: 20 points per correct answer</p>
                  <p>• Hard: 30 points per correct answer</p>
                  <p>• Bonus: Time remaining ÷ 2</p>
                </div>
              </div>

              <Button
                onClick={startGame}
                disabled={loading}
                size="lg"
                className="w-full gradient-luxury"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Start Game
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
            <Card className="glass-luxury border-2 border-primary">
              <CardHeader className="text-center pb-3">
                <Badge className="w-fit mx-auto mb-2">{currentWord?.category}</Badge>
                <CardTitle className="text-4xl md:text-5xl font-bold text-primary">
                  {currentWord?.german}
                </CardTitle>
                <CardDescription className="text-lg">
                  Select the correct English translation
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((word, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(word)}
                  variant="outline"
                  className="h-auto py-6 text-lg font-semibold hover:scale-105 transition-all glass"
                >
                  {word.english}
                </Button>
              ))}
            </div>

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
