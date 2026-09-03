import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle, Square, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonRow {
  id: string;
  module_id: string;
  lesson_number: number;
  title: string;
  lesson_type: string;
  content_version: number;
  content_updated_at: string | null;
}

interface ModuleRow {
  id: string;
  week_number: number;
  title: string;
}

type JobState = "idle" | "running" | "done" | "error";

const CourseStudio = () => {
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Record<string, JobState>>({});
  const [running, setRunning] = useState(false);
  const cancelRef = useRef(false);

  const load = async () => {
    const [{ data: mods }, { data: less }] = await Promise.all([
      supabase.from("course_modules").select("id, week_number, title").order("week_number"),
      supabase
        .from("course_lessons")
        .select("id, module_id, lesson_number, title, lesson_type, content_version, content_updated_at")
        .order("lesson_number"),
    ]);
    setModules(mods ?? []);
    setLessons(less ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const upgraded = lessons.filter((l) => l.content_version >= 2).length;
    return { upgraded, total: lessons.length, pct: lessons.length ? Math.round((upgraded / lessons.length) * 100) : 0 };
  }, [lessons]);

  const generateOne = async (lesson: LessonRow, force = false) => {
    setStatus((s) => ({ ...s, [lesson.id]: "running" }));
    try {
      const { data, error } = await supabase.functions.invoke("generate-lesson-content", {
        body: { lessonId: lesson.id, force },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStatus((s) => ({ ...s, [lesson.id]: "done" }));
      setLessons((prev) =>
        prev.map((l) => (l.id === lesson.id ? { ...l, content_version: 2, content_updated_at: new Date().toISOString() } : l)),
      );
      return true;
    } catch (err: any) {
      setStatus((s) => ({ ...s, [lesson.id]: "error" }));
      toast.error(`${lesson.title}: ${err.message ?? "generation failed"}`);
      return false;
    }
  };

  const runQueue = async (queue: LessonRow[], force = false) => {
    if (!queue.length) {
      toast.info("Nothing to regenerate here.");
      return;
    }
    cancelRef.current = false;
    setRunning(true);
    toast.info(`Rewriting ${queue.length} lesson${queue.length > 1 ? "s" : ""} — this takes a while.`);

    const CONCURRENCY = 3;
    let cursor = 0;
    let ok = 0;

    const worker = async () => {
      while (cursor < queue.length && !cancelRef.current) {
        const lesson = queue[cursor++];
        const success = await generateOne(lesson, force);
        if (success) ok++;
      }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
    setRunning(false);
    toast.success(`${ok} of ${queue.length} lessons rewritten.`);
    load();
  };

  const pending = lessons.filter((l) => l.content_version < 2);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Course Studio</h1>
            <p className="text-muted-foreground">
              Rewrite the TELC B2 curriculum with the flagship authoring model.
            </p>
          </div>
          <div className="flex gap-2">
            {running ? (
              <Button variant="destructive" onClick={() => (cancelRef.current = true)}>
                <Square className="h-4 w-4 mr-2" />
                Stop after current
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => runQueue(lessons, true)} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rewrite everything
                </Button>
                <Button onClick={() => runQueue(pending)} disabled={loading || !pending.length}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate {pending.length} pending
                </Button>
              </>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Curriculum quality</CardTitle>
            <CardDescription>
              {stats.upgraded} of {stats.total} lessons use the new deep-content format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={stats.pct} className="h-2" />
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : (
          modules.map((module) => {
            const moduleLessons = lessons
              .filter((l) => l.module_id === module.id)
              .sort((a, b) => a.lesson_number - b.lesson_number);
            const modulePending = moduleLessons.filter((l) => l.content_version < 2);

            return (
              <Card key={module.id}>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-base">
                      Week {module.week_number} · {module.title}
                    </CardTitle>
                    <CardDescription>
                      {moduleLessons.length - modulePending.length}/{moduleLessons.length} upgraded
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={running}
                    onClick={() => runQueue(moduleLessons, true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Rewrite module
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-2">
                  {moduleLessons.map((lesson) => {
                    const state = status[lesson.id] ?? (lesson.content_version >= 2 ? "done" : "idle");
                    return (
                      <div
                        key={lesson.id}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-3 text-sm",
                          state === "running" && "border-primary/50 bg-primary/5",
                          state === "error" && "border-destructive/50 bg-destructive/5",
                        )}
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-medium">
                          {lesson.lesson_number}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {lesson.lesson_type.replace("_", " ")}
                          </p>
                        </div>
                        {state === "running" && <RefreshCw className="h-4 w-4 animate-spin text-primary" />}
                        {state === "done" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        {state === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
                        {state === "idle" && <Badge variant="outline">v1</Badge>}
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={running || state === "running"}
                          onClick={() => generateOne(lesson, true)}
                        >
                          <Wand2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
};

export default CourseStudio;
