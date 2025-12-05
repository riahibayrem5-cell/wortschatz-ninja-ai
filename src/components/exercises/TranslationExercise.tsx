import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Volume2, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranslationItem {
  id: number;
  sourceText: string;
  sourceLang: "de" | "en";
  acceptedTranslations: string[];
  explanation?: string;
}

interface TranslationExerciseProps {
  items: TranslationItem[];
  onComplete: (score: number, total: number) => void;
  onPlayAudio?: (text: string) => void;
}

const TranslationExercise = ({ items, onComplete, onPlayAudio }: TranslationExerciseProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTranslation, setUserTranslation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const currentItem = items[currentIndex];
  const correctCount = results.filter(Boolean).length;

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ");
  };

  const checkAnswer = () => {
    const normalized = normalizeText(userTranslation);
    const correct = currentItem.acceptedTranslations.some(
      trans => normalizeText(trans) === normalized
    );
    
    setIsCorrect(correct);
    setSubmitted(true);
    setResults(prev => [...prev, correct]);
  };

  const nextQuestion = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserTranslation("");
      setSubmitted(false);
      setIsCorrect(false);
    } else {
      onComplete(results.filter(Boolean).length + (isCorrect ? 1 : 0), items.length);
    }
  };

  if (!currentItem) return null;

  const isGermanToEnglish = currentItem.sourceLang === "de";

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Sentence {currentIndex + 1} of {items.length}
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

      {/* Translation Card */}
      <Card className="glass-luxury border-primary/20">
        <CardContent className="p-6 space-y-6">
          {/* Direction Indicator */}
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className={cn(
              "px-3 py-1 rounded-full",
              isGermanToEnglish ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
            )}>
              {isGermanToEnglish ? "Deutsch" : "English"}
            </span>
            <ArrowRight className="h-4 w-4" />
            <span className={cn(
              "px-3 py-1 rounded-full",
              !isGermanToEnglish ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
            )}>
              {isGermanToEnglish ? "English" : "Deutsch"}
            </span>
          </div>

          {/* Source Text */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-start justify-between gap-4">
              <p className="text-lg font-medium">{currentItem.sourceText}</p>
              {onPlayAudio && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPlayAudio(currentItem.sourceText)}
                  className="shrink-0"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Translation Input */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Your translation:
            </label>
            <Textarea
              value={userTranslation}
              onChange={(e) => !submitted && setUserTranslation(e.target.value)}
              placeholder={`Type your ${isGermanToEnglish ? "English" : "German"} translation here...`}
              className={cn(
                "min-h-[100px] resize-none transition-colors",
                submitted && isCorrect && "border-green-500 bg-green-500/5",
                submitted && !isCorrect && "border-red-500 bg-red-500/5"
              )}
              disabled={submitted}
            />
          </div>

          {/* Result Feedback */}
          {submitted && (
            <div className={cn(
              "p-4 rounded-lg animate-fade-in",
              isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
            )}>
              {isCorrect ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-400">Correct!</p>
                    {currentItem.explanation && (
                      <p className="text-sm text-muted-foreground mt-1">{currentItem.explanation}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-400">Not quite right</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Accepted translations:
                    </p>
                    <ul className="mt-2 space-y-1">
                      {currentItem.acceptedTranslations.map((trans, idx) => (
                        <li key={idx} className="text-sm text-green-400">• {trans}</li>
                      ))}
                    </ul>
                    {currentItem.explanation && (
                      <p className="text-sm text-muted-foreground mt-3">{currentItem.explanation}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            {!submitted ? (
              <Button
                onClick={checkAnswer}
                disabled={!userTranslation.trim()}
                className="gradient-primary"
              >
                Check Translation
              </Button>
            ) : (
              <Button onClick={nextQuestion} className="gradient-primary">
                {currentIndex < items.length - 1 ? "Next Sentence" : "Finish Exercise"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationExercise;
