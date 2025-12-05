import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Target, RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseResultsProps {
  score: number;
  total: number;
  exerciseType: string;
  onRetry: () => void;
  onContinue: () => void;
  timeSpent?: number;
}

const ExerciseResults = ({ 
  score, 
  total, 
  exerciseType,
  onRetry, 
  onContinue,
  timeSpent 
}: ExerciseResultsProps) => {
  const percentage = Math.round((score / total) * 100);
  const isPerfect = score === total;
  const isGood = percentage >= 70;
  const isPassing = percentage >= 50;

  const getMessage = () => {
    if (isPerfect) return { title: "Perfect Score!", subtitle: "Outstanding performance!", emoji: "🏆" };
    if (percentage >= 90) return { title: "Excellent!", subtitle: "Almost perfect!", emoji: "🌟" };
    if (percentage >= 70) return { title: "Great Job!", subtitle: "Keep up the good work!", emoji: "💪" };
    if (percentage >= 50) return { title: "Good Effort!", subtitle: "Practice makes perfect!", emoji: "👍" };
    return { title: "Keep Practicing!", subtitle: "You'll improve with more practice!", emoji: "📚" };
  };

  const message = getMessage();

  return (
    <Card className="glass-luxury border-primary/20 overflow-hidden">
      {/* Celebration Header */}
      <div className={cn(
        "p-8 text-center",
        isPerfect && "bg-gradient-to-br from-yellow-500/20 via-primary/20 to-accent/20",
        !isPerfect && isGood && "bg-gradient-to-br from-green-500/20 to-primary/20",
        !isGood && isPassing && "bg-gradient-to-br from-blue-500/20 to-primary/20",
        !isPassing && "bg-gradient-to-br from-muted/20 to-secondary/20"
      )}>
        {/* Trophy/Stars Animation */}
        <div className="relative inline-block mb-4">
          {isPerfect ? (
            <Trophy className="h-16 w-16 text-yellow-500 animate-bounce" />
          ) : isGood ? (
            <Star className="h-16 w-16 text-primary animate-pulse" />
          ) : (
            <Target className="h-16 w-16 text-primary" />
          )}
          {isPerfect && (
            <>
              <Star className="absolute -top-2 -left-4 h-6 w-6 text-yellow-400 animate-pulse" />
              <Star className="absolute -top-2 -right-4 h-6 w-6 text-yellow-400 animate-pulse delay-150" />
              <Star className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-6 w-6 text-yellow-400 animate-pulse delay-300" />
            </>
          )}
        </div>

        <p className="text-4xl mb-2">{message.emoji}</p>
        <h2 className="text-2xl font-bold mb-1">{message.title}</h2>
        <p className="text-muted-foreground">{message.subtitle}</p>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Score Display */}
        <div className="text-center">
          <div className="relative inline-block">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke={isPerfect ? "hsl(var(--chart-1))" : isGood ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 352} 352`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <p className="text-3xl font-bold">{percentage}%</p>
                <p className="text-sm text-muted-foreground">{score}/{total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-secondary/50">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-semibold">{score}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-semibold">{total}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
          {timeSpent && (
            <div className="p-3 rounded-lg bg-secondary/50">
              <span className="text-xl">⏱️</span>
              <p className="text-lg font-semibold">{Math.round(timeSpent / 60)}m</p>
              <p className="text-xs text-muted-foreground">Time</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 gradient-primary"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseResults;
