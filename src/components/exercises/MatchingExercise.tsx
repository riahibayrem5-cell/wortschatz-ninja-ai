import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Shuffle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchPair {
  id: number;
  left: string;
  right: string;
}

interface MatchingExerciseProps {
  pairs: MatchPair[];
  leftTitle?: string;
  rightTitle?: string;
  onComplete: (score: number, total: number) => void;
}

const MatchingExercise = ({ 
  pairs, 
  leftTitle = "German", 
  rightTitle = "English",
  onComplete 
}: MatchingExerciseProps) => {
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [wrongAttempts, setWrongAttempts] = useState<{left: number, right: number} | null>(null);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    shuffleRightColumn();
  }, [pairs]);

  const shuffleRightColumn = () => {
    const shuffled = [...pairs.map(p => p.right)].sort(() => Math.random() - 0.5);
    setShuffledRight(shuffled);
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setCompleted(false);
    setAttempts(0);
  };

  const handleLeftClick = (index: number) => {
    if (matches[index] !== undefined || completed) return;
    
    setSelectedLeft(index);
    setWrongAttempts(null);

    if (selectedRight !== null) {
      checkMatch(index, selectedRight);
    }
  };

  const handleRightClick = (index: number) => {
    if (Object.values(matches).includes(index) || completed) return;
    
    setSelectedRight(index);
    setWrongAttempts(null);

    if (selectedLeft !== null) {
      checkMatch(selectedLeft, index);
    }
  };

  const checkMatch = (leftIdx: number, rightIdx: number) => {
    setAttempts(prev => prev + 1);
    const correctRight = pairs[leftIdx].right;
    const selectedRightValue = shuffledRight[rightIdx];

    if (correctRight === selectedRightValue) {
      // Correct match
      setMatches(prev => ({ ...prev, [leftIdx]: rightIdx }));
      setSelectedLeft(null);
      setSelectedRight(null);

      // Check if all matched
      if (Object.keys(matches).length + 1 === pairs.length) {
        setCompleted(true);
        const perfectScore = attempts + 1 === pairs.length;
        const score = Math.max(1, pairs.length - (attempts + 1 - pairs.length));
        onComplete(score, pairs.length);
      }
    } else {
      // Wrong match - show feedback briefly
      setWrongAttempts({ left: leftIdx, right: rightIdx });
      setTimeout(() => {
        setWrongAttempts(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 800);
    }
  };

  const matchedCount = Object.keys(matches).length;
  const progress = (matchedCount / pairs.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Matched: {matchedCount}/{pairs.length}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Attempts: {attempts}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={shuffleRightColumn}
          className="text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Matching Grid */}
      <Card className="glass-luxury border-primary/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground text-center mb-4">
                {leftTitle}
              </h4>
              {pairs.map((pair, idx) => {
                const isMatched = matches[idx] !== undefined;
                const isSelected = selectedLeft === idx;
                const isWrong = wrongAttempts?.left === idx;

                return (
                  <button
                    key={`left-${idx}`}
                    onClick={() => handleLeftClick(idx)}
                    disabled={isMatched || completed}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                      isMatched && "border-green-500 bg-green-500/10 opacity-70",
                      isSelected && !isMatched && "border-primary bg-primary/10 scale-[1.02]",
                      isWrong && "border-red-500 bg-red-500/10 animate-shake",
                      !isMatched && !isSelected && !isWrong && "border-border/50 hover:border-primary/50 bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{pair.left}</span>
                      {isMatched && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground text-center mb-4">
                {rightTitle}
              </h4>
              {shuffledRight.map((item, idx) => {
                const isMatched = Object.values(matches).includes(idx);
                const isSelected = selectedRight === idx;
                const isWrong = wrongAttempts?.right === idx;

                return (
                  <button
                    key={`right-${idx}`}
                    onClick={() => handleRightClick(idx)}
                    disabled={isMatched || completed}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                      isMatched && "border-green-500 bg-green-500/10 opacity-70",
                      isSelected && !isMatched && "border-accent bg-accent/10 scale-[1.02]",
                      isWrong && "border-red-500 bg-red-500/10 animate-shake",
                      !isMatched && !isSelected && !isWrong && "border-border/50 hover:border-accent/50 bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item}</span>
                      {isMatched && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Completion Message */}
          {completed && (
            <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 animate-fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-semibold text-green-400">Excellent! All matched!</p>
                  <p className="text-sm text-muted-foreground">
                    Completed in {attempts} attempts
                    {attempts === pairs.length && " - Perfect score!"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      {!completed && matchedCount === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Click an item on the left, then click its match on the right
        </p>
      )}
    </div>
  );
};

export default MatchingExercise;
