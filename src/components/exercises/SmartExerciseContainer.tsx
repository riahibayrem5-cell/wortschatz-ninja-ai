import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Lightbulb, Volume2, Loader2,
  ChevronRight, RotateCcw, Trophy, Star, Brain, Target, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import CachedAudioButton from "@/components/CachedAudioButton";
import { logExerciseMistake } from "@/utils/mistakeLogger";

interface Exercise {
  id: number;
  type: "fill-blank" | "mcq" | "matching-single" | "sentence-order";
  question: string;
  context?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  hint?: string;
  difficulty: "easy" | "medium" | "hard";
}

interface SmartExerciseContainerProps {
  lessonId: string;
  lessonType: string;
  lessonTitle: string;
  lessonContent: any;
  onComplete: (score: number, total: number) => void;
}

const SmartExerciseContainer = ({
  lessonId,
  lessonType,
  lessonTitle,
  lessonContent,
  onComplete
}: SmartExerciseContainerProps) => {
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<{ correct: boolean; exercise: Exercise }[]>([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    generateExercises();
  }, [lessonId]);

  const generateExercises = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-smart-exercises", {
        body: {
          lessonType,
          lessonTitle,
          topics: lessonContent?.topics || [],
          skill: lessonContent?.skill,
          difficulty: "B2",
          count: 8
        }
      });

      if (error) throw error;

      if (data?.exercises && Array.isArray(data.exercises)) {
        setExercises(data.exercises);
      } else {
        // Fallback exercises
        setExercises(generateFallbackExercises(lessonType, lessonContent?.topics));
      }
    } catch (error) {
      console.error("Error generating exercises:", error);
      setExercises(generateFallbackExercises(lessonType, lessonContent?.topics));
    } finally {
      setLoading(false);
    }
  };

  const currentExercise = exercises[currentIndex];
  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;
  const correctCount = results.filter(r => r.correct).length;

  const checkAnswer = async () => {
    if (!currentExercise || submitted) return;

    let correct = false;
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    
    if (currentExercise.type === "mcq") {
      correct = parseInt(userAnswer) === currentExercise.correctAnswer;
    } else {
      const correctAnswerStr = String(currentExercise.correctAnswer).toLowerCase();
      correct = normalizedAnswer === correctAnswerStr;
    }

    setIsCorrect(correct);
    setSubmitted(true);
    setResults(prev => [...prev, { correct, exercise: currentExercise }]);

    // Log mistake if wrong
    if (!correct) {
      await logExerciseMistake(
        userAnswer,
        String(currentExercise.correctAnswer),
        currentExercise.explanation,
        'smart-exercises',
        currentExercise.type,
        { lessonId, lessonType, difficulty: currentExercise.difficulty }
      );
    }
  };

  const nextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer("");
      setSubmitted(false);
      setShowHint(false);
    } else {
      setCompleted(true);
      onComplete(correctCount + (isCorrect ? 1 : 0), exercises.length);
    }
  };

  const retryAll = () => {
    setCurrentIndex(0);
    setUserAnswer("");
    setSubmitted(false);
    setShowHint(false);
    setResults([]);
    setCompleted(false);
    generateExercises();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="font-medium">Preparing your exercises...</p>
          <p className="text-sm text-muted-foreground">Creating personalized practice based on the lesson</p>
        </div>
      </div>
    );
  }

  if (completed) {
    const finalScore = correctCount + (isCorrect ? 1 : 0);
    const percentage = Math.round((finalScore / exercises.length) * 100);
    const passed = percentage >= 60;

    return (
      <Card className={cn(
        "border-2 animate-fade-in",
        passed ? "border-green-500 bg-green-500/5" : "border-orange-500 bg-orange-500/5"
      )}>
        <CardContent className="py-8">
          <div className="text-center space-y-6">
            <div className={cn(
              "w-20 h-20 mx-auto rounded-full flex items-center justify-center",
              passed ? "bg-green-500/20" : "bg-orange-500/20"
            )}>
              {passed ? (
                <Trophy className="h-10 w-10 text-green-500" />
              ) : (
                <Target className="h-10 w-10 text-orange-500" />
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">
                {passed ? "Excellent Work!" : "Keep Practicing!"}
              </h3>
              <p className="text-muted-foreground">
                You scored {finalScore} out of {exercises.length} ({percentage}%)
              </p>
            </div>

            <div className="flex items-center justify-center gap-1">
              {exercises.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-4 h-4 rounded-full",
                    results[idx]?.correct ? "bg-green-500" : "bg-red-500"
                  )}
                />
              ))}
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={retryAll}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button className="gradient-primary" onClick={() => onComplete(finalScore, exercises.length)}>
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentExercise) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No exercises available</p>
        <Button onClick={retryAll} className="gradient-primary">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Exercises
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Question {currentIndex + 1}/{exercises.length}
          </Badge>
          <Badge variant="secondary">
            Score: {correctCount}/{results.length}
          </Badge>
          <Badge 
            variant="outline" 
            className={cn(
              currentExercise.difficulty === "easy" && "border-green-500 text-green-500",
              currentExercise.difficulty === "medium" && "border-yellow-500 text-yellow-500",
              currentExercise.difficulty === "hard" && "border-red-500 text-red-500"
            )}
          >
            {currentExercise.difficulty}
          </Badge>
        </div>
        <div className="flex gap-1">
          {exercises.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                idx === currentIndex
                  ? "bg-primary scale-110"
                  : idx < results.length
                    ? results[idx].correct
                      ? "bg-green-500"
                      : "bg-red-500"
                    : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2" />

      {/* Exercise Card */}
      <Card className="glass-luxury border-primary/20">
        <CardContent className="p-6 space-y-6">
          {/* Context if available */}
          {currentExercise.context && (
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-sm italic">{currentExercise.context}</p>
            </div>
          )}

          {/* Question */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-medium flex-1">{currentExercise.question}</h3>
            <CachedAudioButton 
              text={currentExercise.question} 
              size="sm" 
              variant="ghost"
            />
          </div>

          {/* Answer Input based on type */}
          {currentExercise.type === "mcq" && currentExercise.options && (
            <RadioGroup
              value={userAnswer}
              onValueChange={setUserAnswer}
              disabled={submitted}
              className="space-y-3"
            >
              {currentExercise.options.map((option, idx) => {
                const isSelected = userAnswer === String(idx);
                const isCorrectOption = idx === currentExercise.correctAnswer;
                const showCorrect = submitted && isCorrectOption;
                const showWrong = submitted && isSelected && !isCorrect;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                      !submitted && isSelected && "border-primary bg-primary/10",
                      !submitted && !isSelected && "border-border/50 hover:border-primary/30",
                      showCorrect && "border-green-500 bg-green-500/10",
                      showWrong && "border-red-500 bg-red-500/10"
                    )}
                    onClick={() => !submitted && setUserAnswer(String(idx))}
                  >
                    <RadioGroupItem value={String(idx)} id={`opt-${idx}`} />
                    <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {showWrong && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                );
              })}
            </RadioGroup>
          )}

          {(currentExercise.type === "fill-blank" || currentExercise.type === "sentence-order") && (
            <div className="space-y-3">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer..."
                disabled={submitted}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && userAnswer.trim()) {
                    checkAnswer();
                  }
                }}
                className={cn(
                  "text-lg",
                  submitted && isCorrect && "border-green-500 bg-green-500/5",
                  submitted && !isCorrect && "border-red-500 bg-red-500/5"
                )}
              />
              {submitted && !isCorrect && (
                <p className="text-sm text-green-500">
                  Correct answer: <strong>{currentExercise.correctAnswer}</strong>
                </p>
              )}
            </div>
          )}

          {/* Hint Button */}
          {currentExercise.hint && !submitted && (
            <div className="flex items-center gap-2">
              {showHint ? (
                <div className="flex items-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded-lg animate-fade-in">
                  <Lightbulb className="h-4 w-4" />
                  {currentExercise.hint}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(true)}
                  className="text-yellow-500"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Show Hint
                </Button>
              )}
            </div>
          )}

          {/* Feedback */}
          {submitted && (
            <div className={cn(
              "p-4 rounded-lg animate-fade-in",
              isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
            )}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                )}
                <div>
                  <p className={cn("font-semibold", isCorrect ? "text-green-500" : "text-red-500")}>
                    {isCorrect ? "Correct!" : "Not quite right"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentExercise.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {!submitted ? (
              <Button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className="gradient-primary"
              >
                Check Answer
              </Button>
            ) : (
              <Button onClick={nextExercise} className="gradient-primary">
                {currentIndex < exercises.length - 1 ? "Next Question" : "See Results"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Fallback exercises when AI generation fails
function generateFallbackExercises(lessonType: string, topics?: string[]): Exercise[] {
  const baseExercises: Exercise[] = [
    {
      id: 1,
      type: "mcq",
      question: "Welche Präposition verlangt den Dativ?",
      options: ["für", "gegen", "mit", "ohne"],
      correctAnswer: 2,
      explanation: "'Mit' verlangt immer den Dativ: mit dem Mann, mit der Frau.",
      hint: "Think about which preposition goes with 'dem' or 'der'",
      difficulty: "easy"
    },
    {
      id: 2,
      type: "fill-blank",
      question: "Ich habe ___ (gestern) meine Hausaufgaben gemacht.",
      correctAnswer: "gestern",
      explanation: "Time expressions like 'gestern' (yesterday) are placed after the verb in Perfekt.",
      hint: "When did you do your homework?",
      difficulty: "easy"
    },
    {
      id: 3,
      type: "mcq",
      question: "Welcher Satz ist korrekt?",
      options: [
        "Ich habe das Buch gelesen gestern.",
        "Gestern habe ich das Buch gelesen.",
        "Das Buch habe gelesen ich gestern.",
        "Gelesen habe ich gestern das Buch."
      ],
      correctAnswer: 1,
      explanation: "In German, when a time expression starts the sentence, the verb comes second (V2 rule).",
      difficulty: "medium"
    },
    {
      id: 4,
      type: "fill-blank",
      question: "Das ist das Auto ___ Mannes. (Genitiv)",
      correctAnswer: "des",
      explanation: "Genitive masculine article is 'des'. The noun also gets an -s or -es ending.",
      hint: "What is the genitive article for 'der'?",
      difficulty: "medium"
    },
    {
      id: 5,
      type: "mcq",
      question: "Was bedeutet 'Ich würde gerne...'?",
      options: [
        "I want to...",
        "I would like to...",
        "I must...",
        "I can..."
      ],
      correctAnswer: 1,
      explanation: "'Ich würde gerne' is a polite way to express a wish, translated as 'I would like to'.",
      difficulty: "easy"
    },
    {
      id: 6,
      type: "fill-blank",
      question: "Wenn ich reich ___, würde ich ein Haus kaufen.",
      correctAnswer: "wäre",
      explanation: "Konjunktiv II of 'sein' (to be) is 'wäre'. This is used for hypothetical situations.",
      hint: "What is the subjunctive form of 'sein'?",
      difficulty: "hard"
    },
    {
      id: 7,
      type: "mcq",
      question: "Welches Wort passt? 'Er hat ___ sehr gefreut.'",
      options: ["mich", "sich", "dich", "uns"],
      correctAnswer: 1,
      explanation: "'Sich freuen' is a reflexive verb. 'Er' requires 'sich' as the reflexive pronoun.",
      difficulty: "medium"
    },
    {
      id: 8,
      type: "fill-blank",
      question: "Obwohl es regnet, ___ er spazieren.",
      correctAnswer: "geht",
      explanation: "After 'obwohl', the verb goes to the end of the clause, but in the main clause, the verb is in position 1 due to the subordinate clause starting the sentence.",
      hint: "What is the correct verb form for 'er' in present tense?",
      difficulty: "hard"
    }
  ];

  return baseExercises;
}

export default SmartExerciseContainer;
