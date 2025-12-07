import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  GraduationCap, BookOpen, CheckCircle2, Play, 
  ChevronRight, Clock, Trophy, Flame
} from "lucide-react";

interface ModuleProgress {
  module_id: string;
  status: string;
  lesson_id?: string;
}

interface CourseModule {
  id: string;
  week_number: number;
  title: string;
  title_de: string;
}

interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  lesson_number: number;
}

const CourseProgressWidget = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);
  const [completedModules, setCompletedModules] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);
  const [nextLesson, setNextLesson] = useState<CourseLesson | null>(null);

  useEffect(() => {
    fetchCourseProgress();
  }, []);

  const fetchCourseProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all modules
      const { data: modules } = await supabase
        .from('course_modules')
        .select('*')
        .order('week_number');

      // Fetch all lessons
      const { data: lessons } = await supabase
        .from('course_lessons')
        .select('*')
        .order('lesson_number');

      // Fetch user's course progress
      const { data: progress } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id);

      if (!modules || !lessons) return;

      setTotalLessons(lessons.length);

      // Calculate completed modules
      const moduleProgress = progress?.filter(p => !p.lesson_id) || [];
      const completedModuleCount = moduleProgress.filter(p => p.status === 'completed').length;
      setCompletedModules(completedModuleCount);

      // Calculate completed lessons
      const lessonProgress = progress?.filter(p => p.lesson_id) || [];
      const completedLessonCount = lessonProgress.filter(p => p.status === 'completed').length;
      setCompletedLessons(completedLessonCount);

      // Calculate overall progress
      const overallProgress = Math.round((completedLessonCount / lessons.length) * 100);
      setTotalProgress(overallProgress);

      // Find current module (first non-completed or first)
      const completedModuleIds = new Set(
        moduleProgress.filter(p => p.status === 'completed').map(p => p.module_id)
      );
      
      const inProgressModuleIds = new Set(
        moduleProgress.filter(p => p.status === 'in_progress').map(p => p.module_id)
      );

      // Current module is the first in-progress or first non-completed
      let currentMod = modules.find(m => inProgressModuleIds.has(m.id));
      if (!currentMod) {
        currentMod = modules.find(m => !completedModuleIds.has(m.id));
      }
      if (!currentMod && modules.length > 0) {
        currentMod = modules[modules.length - 1]; // All completed
      }
      setCurrentModule(currentMod || null);

      // Find next lesson to complete
      if (currentMod) {
        const moduleLessons = lessons.filter(l => l.module_id === currentMod.id);
        const completedLessonIds = new Set(
          lessonProgress.filter(p => p.status === 'completed').map(p => p.lesson_id)
        );

        const nextLessonToComplete = moduleLessons.find(l => !completedLessonIds.has(l.id));
        setNextLesson(nextLessonToComplete || null);

        // Current lesson is the one we're working on
        if (nextLessonToComplete) {
          setCurrentLesson(nextLessonToComplete);
        }
      }

    } catch (error) {
      console.error("Error fetching course progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (nextLesson && currentModule) {
      navigate(`/mastery-course/${currentModule.id}/lesson/${nextLesson.id}`);
    } else if (currentModule) {
      navigate(`/mastery-course/${currentModule.id}`);
    } else {
      navigate('/mastery-course');
    }
  };

  if (loading) {
    return (
      <Card className="glass-luxury border-primary/20 animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-muted/30 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-luxury border-primary/20 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-primary" />
            Course Progress
          </CardTitle>
          <Badge 
            variant={totalProgress === 100 ? "default" : "secondary"}
            className={totalProgress === 100 ? "gradient-primary" : ""}
          >
            {totalProgress === 100 ? "Completed!" : `${totalProgress}%`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <Progress value={totalProgress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{completedLessons} of {totalLessons} lessons</span>
            <span>{completedModules} of 12 modules</span>
          </div>
        </div>

        {/* Current Module Info */}
        {currentModule && (
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              {totalProgress === 100 ? (
                <Trophy className="h-4 w-4 text-yellow-500" />
              ) : (
                <Play className="h-4 w-4 text-primary" />
              )}
              <span className="text-xs text-muted-foreground">
                {totalProgress === 100 ? "All Complete" : "Currently on"}
              </span>
            </div>
            <p className="font-medium text-sm">
              Week {currentModule.week_number}: {currentModule.title}
            </p>
            {nextLesson && (
              <p className="text-xs text-muted-foreground mt-1">
                Next: {nextLesson.title}
              </p>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-primary/10">
            <div className="flex items-center justify-center gap-1 text-primary">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-sm font-bold">{completedLessons}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Lessons</span>
          </div>
          <div className="text-center p-2 rounded-lg bg-accent/10">
            <div className="flex items-center justify-center gap-1 text-accent">
              <BookOpen className="h-3 w-3" />
              <span className="text-sm font-bold">{completedModules}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Modules</span>
          </div>
          <div className="text-center p-2 rounded-lg bg-yellow-500/10">
            <div className="flex items-center justify-center gap-1 text-yellow-600">
              <Flame className="h-3 w-3" />
              <span className="text-sm font-bold">{totalProgress}%</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Complete</span>
          </div>
        </div>

        {/* Continue Button */}
        <Button 
          onClick={handleContinue}
          className="w-full gradient-primary hover:scale-[1.02] transition-transform"
        >
          {totalProgress === 100 ? "Review Course" : "Continue Learning"}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseProgressWidget;
