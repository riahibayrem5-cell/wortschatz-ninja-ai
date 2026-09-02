import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonPracticeItem } from "@/types/lesson";

interface LessonPracticeProps {
  items: LessonPracticeItem[];
  onComplete?: (score: number, total: number) => void;
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[.,!?;:"'„“]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const LessonPractice = ({ items, onComplete }: LessonPracticeProps) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const item = items[index];
  const total = items.length;
  const finished = results.length === total && total > 0;
  const score = results.filter(Boolean).length;

  const isChoice = useMemo(
    () => item && (item.type === "mcq" || item.type === "true_false") && item.options?.length > 0,
    [item],
  );

  if (!total) return null;

  const evaluate = () => {
    if (isChoice) return selected !== null && selected === item.answer_index;
    if (item.type === "open") return normalize(typed).length > 0;
    return normalize(typed) === normalize(item.answer);
  };

  const check = () => {
    if (isChoice && selected === null) return;
    if (!isChoice && !typed.trim()) return;
    const correct = evaluate();
    setResults((prev) => [...prev, correct]);
    setChecked(true);
  };

  const next = () => {
    if (index + 1 >= total) {
      onComplete?.(results.filter(Boolean).length, total);
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setTyped("");
    setChecked(false);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setTyped("");
    setChecked(false);
    setResults([]);
  };

  if (finished && checked && index + 1 === total) {
    const pct = Math.round((score / total) * 100);
    return (
      <Card className="border-primary/30">
        <CardContent className="py-10 text-center space-y-5">
          <Trophy className="h-14 w-14 mx-auto text-primary" />
          <div>
            <p className="font-serif text-3xl">{pct}%</p>
            <p className="text-muted-foreground">
              {score} of {total} correct
            </p>
          </div>
          <Progress value={pct} className="h-2 max-w-sm mx-auto" />
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={restart}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            <Button onClick={() => onComplete?.(score, total)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save result
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const wasCorrect = checked ? results[results.length - 1] : false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {index + 1} of {total}
        </span>
        <Badge variant="outline" className="capitalize">
          {item.type.replace("_", " ")}
        </Badge>
      </div>
      <Progress value={(index / total) * 100} className="h-1.5" />

      <Card>
        <CardContent className="pt-6 space-y-5">
          <p className="text-lg leading-relaxed">{item.question}</p>

          {isChoice ? (
            <div className="space-y-2">
              {item.options.map((option, i) => {
                const isAnswer = i === item.answer_index;
                const isPicked = i === selected;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={checked}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border transition-all",
                      "hover:border-primary/50 hover:bg-primary/5",
                      isPicked && !checked && "border-primary bg-primary/10",
                      checked && isAnswer && "border-primary bg-primary/10",
                      checked && isPicked && !isAnswer && "border-destructive bg-destructive/10",
                      !isPicked && !checked && "border-border",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-6 w-6 shrink-0 rounded-full border grid place-items-center text-xs font-medium">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{option}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <Input
              value={typed}
              disabled={checked}
              placeholder={item.type === "open" ? "Write your answer in German…" : "Type the missing word…"}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !checked && check()}
            />
          )}

          {checked && (
            <div
              className={cn(
                "rounded-lg border p-4 space-y-2",
                wasCorrect ? "border-primary/40 bg-primary/5" : "border-destructive/40 bg-destructive/5",
              )}
            >
              <p className="flex items-center gap-2 font-medium">
                {wasCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                {item.type === "open" ? "Model answer" : wasCorrect ? "Correct" : "Not quite"}
              </p>
              {!wasCorrect && item.type !== "open" && (
                <p className="text-sm">
                  Answer: <span className="font-medium">{item.answer}</span>
                </p>
              )}
              {item.type === "open" && <p className="text-sm italic">{item.answer}</p>}
              <p className="text-sm text-muted-foreground flex gap-2">
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                {item.explanation}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            {checked ? (
              <Button onClick={next}>{index + 1 === total ? "See results" : "Next question"}</Button>
            ) : (
              <Button onClick={check} disabled={isChoice ? selected === null : !typed.trim()}>
                Check answer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonPractice;
