import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Lightbulb, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlankItem {
  id: number;
  sentence: string;
  blank: string;
  correctAnswer: string;
  hint?: string;
}

interface FillInTheBlankExerciseProps {
  items: BlankItem[];
  onComplete: (score: number, total: number) => void;
  onPlayAudio?: (text: string) => void;
}

const FillInTheBlankExercise = ({ items, onComplete, onPlayAudio }: FillInTheBlankExerciseProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<Record<number, boolean>>({});

  const currentItem = items[currentIndex];
  const isCurrentSubmitted = submitted[currentItem?.id];
  const isCorrect = results[currentItem?.id];
  const totalAnswered = Object.keys(submitted).length;
  const correctCount = Object.values(results).filter(Boolean).length;

  const handleInputChange = (value: string) => {
    if (!isCurrentSubmitted) {
      setAnswers(prev => ({ ...prev, [currentItem.id]: value }));
    }
  };

  const checkAnswer = () => {
    const userAnswer = answers[currentItem.id]?.trim().toLowerCase() || "";
    const correct = userAnswer === currentItem.correctAnswer.toLowerCase();
    
    setResults(prev => ({ ...prev, [currentItem.id]: correct }));
    setSubmitted(prev => ({ ...prev, [currentItem.id]: true }));
  };

  const nextQuestion = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowHint({});
    } else {
      // All questions answered
      onComplete(correctCount + (results[currentItem.id] ? 1 : 0), items.length);
    }
  };

  const renderSentence = () => {
    const parts = currentItem.sentence.split(currentItem.blank);
    return (
      <div className="text-lg leading-relaxed">
        {parts[0]}
        <span className="inline-block mx-1 min-w-[120px]">
          {isCurrentSubmitted ? (
            <span className={cn(
              "px-3 py-1 rounded font-semibold",
              isCorrect 
                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            )}>
              {answers[currentItem.id] || "___"}
              {!isCorrect && (
                <span className="ml-2 text-green-400">({currentItem.correctAnswer})</span>
              )}
            </span>
          ) : (
            <Input
              value={answers[currentItem.id] || ""}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="___"
              className="inline-block w-32 h-8 text-center border-b-2 border-primary bg-transparent rounded-none focus:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && answers[currentItem.id]?.trim()) {
                  checkAnswer();
                }
              }}
            />
          )}
        </span>
        {parts[1]}
      </div>
    );
  };

  if (!currentItem) return null;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Question {currentIndex + 1} of {items.length}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Score: {correctCount}/{totalAnswered}
          </Badge>
        </div>
        <div className="flex gap-1">
          {items.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                idx === currentIndex 
                  ? "bg-primary scale-110" 
                  : submitted[items[idx].id]
                    ? results[items[idx].id] 
                      ? "bg-green-500" 
                      : "bg-red-500"
                    : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Exercise Card */}
      <Card className="glass-luxury border-primary/20">
        <CardContent className="p-6 space-y-6">
          {/* Audio Button */}
          {onPlayAudio && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlayAudio(currentItem.sentence.replace(currentItem.blank, currentItem.correctAnswer))}
              className="text-primary hover:text-primary/80"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Listen
            </Button>
          )}

          {/* Sentence with Blank */}
          <div className="py-4">
            {renderSentence()}
          </div>

          {/* Hint Section */}
          {currentItem.hint && !isCurrentSubmitted && (
            <div className="flex items-center gap-2">
              {showHint[currentItem.id] ? (
                <div className="flex items-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded-lg">
                  <Lightbulb className="h-4 w-4" />
                  {currentItem.hint}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(prev => ({ ...prev, [currentItem.id]: true }))}
                  className="text-yellow-500"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Show Hint
                </Button>
              )}
            </div>
          )}

          {/* Result Feedback */}
          {isCurrentSubmitted && (
            <div className={cn(
              "flex items-center gap-3 p-4 rounded-lg animate-fade-in",
              isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
            )}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-400">Correct!</p>
                    <p className="text-sm text-muted-foreground">Great job!</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-400">Not quite right</p>
                    <p className="text-sm text-muted-foreground">
                      The correct answer is: <strong className="text-green-400">{currentItem.correctAnswer}</strong>
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            {!isCurrentSubmitted ? (
              <Button
                onClick={checkAnswer}
                disabled={!answers[currentItem.id]?.trim()}
                className="gradient-primary"
              >
                Check Answer
              </Button>
            ) : (
              <Button onClick={nextQuestion} className="gradient-primary">
                {currentIndex < items.length - 1 ? "Next Question" : "Finish Exercise"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FillInTheBlankExercise;
