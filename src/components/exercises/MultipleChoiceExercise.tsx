import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MCQItem {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface MultipleChoiceExerciseProps {
  items: MCQItem[];
  onComplete: (score: number, total: number) => void;
  onPlayAudio?: (text: string) => void;
}

const MultipleChoiceExercise = ({ items, onComplete, onPlayAudio }: MultipleChoiceExerciseProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const currentItem = items[currentIndex];
  const isCorrect = selectedOption === currentItem?.correctIndex;
  const correctCount = results.filter(Boolean).length;

  const handleSelect = (index: number) => {
    if (!submitted) {
      setSelectedOption(index);
    }
  };

  const checkAnswer = () => {
    setSubmitted(true);
    setResults(prev => [...prev, isCorrect]);
  };

  const nextQuestion = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      const finalResults = [...results, isCorrect];
      onComplete(finalResults.filter(Boolean).length, items.length);
    }
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
            Score: {correctCount}/{results.length}
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
                  : idx < results.length
                    ? results[idx] 
                      ? "bg-green-500" 
                      : "bg-red-500"
                    : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <Card className="glass-luxury border-primary/20">
        <CardContent className="p-6 space-y-6">
          {/* Audio Button */}
          {onPlayAudio && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlayAudio(currentItem.question)}
              className="text-primary hover:text-primary/80"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Listen
            </Button>
          )}

          {/* Question */}
          <div className="py-2">
            <h3 className="text-lg font-medium">{currentItem.question}</h3>
          </div>

          {/* Options */}
          <div className="grid gap-3">
            {currentItem.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === currentItem.correctIndex;
              const showCorrect = submitted && isCorrectOption;
              const showWrong = submitted && isSelected && !isCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={submitted}
                  className={cn(
                    "w-full p-4 text-left rounded-lg border-2 transition-all duration-200",
                    "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                    !submitted && isSelected && "border-primary bg-primary/10",
                    !submitted && !isSelected && "border-border/50 bg-secondary/30",
                    showCorrect && "border-green-500 bg-green-500/10",
                    showWrong && "border-red-500 bg-red-500/10",
                    submitted && !showCorrect && !showWrong && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
                      !submitted && isSelected && "bg-primary text-primary-foreground",
                      !submitted && !isSelected && "bg-muted",
                      showCorrect && "bg-green-500 text-white",
                      showWrong && "bg-red-500 text-white"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {showWrong && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Result Feedback */}
          {submitted && (
            <div className={cn(
              "flex items-start gap-3 p-4 rounded-lg animate-fade-in",
              isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
            )}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-400">Excellent!</p>
                    {currentItem.explanation && (
                      <p className="text-sm text-muted-foreground mt-1">{currentItem.explanation}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-400">Not quite</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The correct answer is: <strong className="text-green-400">{currentItem.options[currentItem.correctIndex]}</strong>
                    </p>
                    {currentItem.explanation && (
                      <p className="text-sm text-muted-foreground mt-2">{currentItem.explanation}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            {!submitted ? (
              <Button
                onClick={checkAnswer}
                disabled={selectedOption === null}
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

export default MultipleChoiceExercise;
