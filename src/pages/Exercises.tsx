import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { TELC_B2_TOPICS } from "@/utils/constants";

const Exercises = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'quiz' | 'translation'>('quiz');
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [exercise, setExercise] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateExercise = async () => {
    setLoading(true);
    setShowResult(false);
    setUserAnswer("");
    try {
      const { data, error } = await supabase.functions.invoke("generate-exercise", {
        body: { type: mode, topic },
      });

      if (error) throw error;
      setExercise(data);
      toast({ title: "Exercise generated!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = async () => {
    if (!userAnswer.trim()) {
      toast({ title: "Please provide an answer", variant: "destructive" });
      return;
    }

    if (mode === 'quiz') {
      const isCorrect = userAnswer === exercise.correctAnswer;
      setResult({ isCorrect, explanation: exercise.explanation });
      setShowResult(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("exercises").insert({
          user_id: session.user.id,
          type: 'quiz',
          topic,
          question: exercise.question,
          correct_answer: exercise.correctAnswer,
          user_answer: userAnswer,
          is_correct: isCorrect,
          completed_at: new Date().toISOString(),
        });

        const { data: progress } = await supabase
          .from("user_progress")
          .select("exercises_completed")
          .eq("user_id", session.user.id)
          .single();

        if (progress) {
          await supabase
            .from("user_progress")
            .update({ exercises_completed: progress.exercises_completed + 1 })
            .eq("user_id", session.user.id);
        }
      }
    } else {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("analyze-translation", {
          body: {
            english: exercise.english,
            userGerman: userAnswer,
            expectedGerman: exercise.expectedGerman,
          },
        });

        if (error) throw error;
        setResult(data);
        setShowResult(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from("exercises").insert({
            user_id: session.user.id,
            type: 'translation',
            topic,
            question: exercise.english,
            correct_answer: exercise.expectedGerman,
            user_answer: userAnswer,
            analysis: data.feedback,
            is_correct: data.isCorrect,
            completed_at: new Date().toISOString(),
          });

          const { data: progress } = await supabase
            .from("user_progress")
            .select("exercises_completed")
            .eq("user_id", session.user.id)
            .single();

          if (progress) {
            await supabase
              .from("user_progress")
              .update({ exercises_completed: progress.exercises_completed + 1 })
              .eq("user_id", session.user.id);
          }
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4">
        <Card className="p-8 glass mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-6 text-gradient">Exercises</h1>
          
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => setMode('quiz')}
              variant={mode === 'quiz' ? 'default' : 'outline'}
              className={mode === 'quiz' ? 'gradient-primary' : 'glass'}
            >
              Multiple Choice Quiz
            </Button>
            <Button
              onClick={() => setMode('translation')}
              variant={mode === 'translation' ? 'default' : 'outline'}
              className={mode === 'translation' ? 'gradient-primary' : 'glass'}
            >
              Translation Challenge
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Topic (optional)</label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select a topic or leave empty" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="">Any topic</SelectItem>
                  {TELC_B2_TOPICS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateExercise}
              disabled={loading}
              className="w-full gradient-accent hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Exercise"
              )}
            </Button>
          </div>
        </Card>

        {exercise && !showResult && (
          <Card className="p-8 glass glow">
            {mode === 'quiz' ? (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">{exercise.question}</h3>
                <div className="space-y-3">
                  {exercise.options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setUserAnswer(option)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        userAnswer === option
                          ? 'border-primary bg-primary/20'
                          : 'border-border glass hover:border-primary/50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm text-muted-foreground mb-2">Translate to German:</h3>
                  <p className="text-xl font-semibold">{exercise.english}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Your German translation:</label>
                  <Textarea
                    placeholder="Ihre Übersetzung..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>
                {exercise.notes && (
                  <div className="p-4 bg-background/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">💡 Hints: {exercise.notes}</p>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={checkAnswer}
              disabled={!userAnswer.trim() || loading}
              className="w-full mt-6 gradient-primary hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Answer"
              )}
            </Button>
          </Card>
        )}

        {showResult && result && (
          <Card className={`p-8 glass glow ${result.isCorrect ? 'border-accent' : 'border-destructive'}`}>
            <div className="flex items-center mb-4">
              {result.isCorrect ? (
                <>
                  <Check className="w-8 h-8 text-accent mr-3" />
                  <h3 className="text-2xl font-bold text-accent">Correct!</h3>
                </>
              ) : (
                <>
                  <X className="w-8 h-8 text-destructive mr-3" />
                  <h3 className="text-2xl font-bold text-destructive">Not quite right</h3>
                </>
              )}
            </div>

            {mode === 'quiz' ? (
              <div className="space-y-4">
                <p className="text-foreground">{result.explanation}</p>
                <div className="p-4 bg-background/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Correct answer: </p>
                  <p className="text-accent font-semibold">{exercise.correctAnswer}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {result.score !== undefined && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Score:</span>
                    <span className="text-3xl font-bold text-primary">{result.score}/100</span>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Feedback:</p>
                  <p className="text-foreground">{result.feedback}</p>
                </div>
                <div className="p-4 bg-background/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Corrected version:</p>
                  <p className="text-accent">{result.correctedVersion}</p>
                </div>
                {result.grammarNotes && result.grammarNotes.length > 0 && (
                  <div className="p-4 bg-background/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Grammar notes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.grammarNotes.map((note: string, index: number) => (
                        <li key={index} className="text-sm">{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={() => {
                setShowResult(false);
                setExercise(null);
                setUserAnswer("");
              }}
              className="w-full mt-6 gradient-accent hover:opacity-90"
            >
              Next Exercise
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Exercises;