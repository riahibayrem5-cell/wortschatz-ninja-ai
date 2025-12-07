import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { 
  GraduationCap, BookOpen, CheckCircle2, Play, 
  ChevronRight, Trophy, Flame
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

interface DailyActivity {
  activity_date: string;
  exercises_completed: number;
  words_learned: number;
  conversations_count: number;
  writing_submissions_count: number;
  review_sessions_count: number;
}

const CourseProgressWidget = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);
  const [completedModules, setCompletedModules] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const [nextLesson, setNextLesson] = useState<CourseLesson | null>(null);
  const [activityData, setActivityData] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCourseProgress();
  }, []);

  const fetchCourseProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all data in parallel
      const [modulesRes, lessonsRes, progressRes, activityRes] = await Promise.all([
        supabase.from('course_modules').select('*').order('week_number'),
        supabase.from('course_lessons').select('*').order('lesson_number'),
        supabase.from('user_course_progress').select('*').eq('user_id', user.id),
        supabase.from('daily_activity')
          .select('*')
          .eq('user_id', user.id)
          .gte('activity_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      ]);

      const modules = modulesRes.data;
      const lessons = lessonsRes.data;
      const progress = progressRes.data;
      const dailyActivity = activityRes.data;

      if (!modules || !lessons) return;

      setTotalLessons(lessons.length);

      // Process activity data for heatmap
      const activityMap: Record<string, number> = {};
      dailyActivity?.forEach((day: DailyActivity) => {
        const total = (day.exercises_completed || 0) + 
                     (day.words_learned || 0) + 
                     (day.conversations_count || 0) + 
                     (day.writing_submissions_count || 0) +
                     (day.review_sessions_count || 0);
        activityMap[day.activity_date] = total;
      });
      setActivityData(activityMap);

      // Calculate completed modules
      const moduleProgress = progress?.filter(p => !p.lesson_id) || [];
      const completedModuleCount = moduleProgress.filter(p => p.status === 'completed').length;
      setCompletedModules(completedModuleCount);

      // Calculate completed lessons
      const lessonProgress = progress?.filter(p => p.lesson_id) || [];
      const completedLessonCount = lessonProgress.filter(p => p.status === 'completed').length;
      setCompletedLessons(completedLessonCount);

      // Calculate overall progress
      const overallProgress = lessons.length > 0 
        ? Math.round((completedLessonCount / lessons.length) * 100) 
        : 0;
      setTotalProgress(overallProgress);

      // Find current module
      const completedModuleIds = new Set(
        moduleProgress.filter(p => p.status === 'completed').map(p => p.module_id)
      );
      const inProgressModuleIds = new Set(
        moduleProgress.filter(p => p.status === 'in_progress').map(p => p.module_id)
      );

      let currentMod = modules.find(m => inProgressModuleIds.has(m.id));
      if (!currentMod) {
        currentMod = modules.find(m => !completedModuleIds.has(m.id));
      }
      if (!currentMod && modules.length > 0) {
        currentMod = modules[modules.length - 1];
      }
      setCurrentModule(currentMod || null);

      // Find next lesson
      if (currentMod) {
        const moduleLessons = lessons.filter(l => l.module_id === currentMod.id);
        const completedLessonIds = new Set(
          lessonProgress.filter(p => p.status === 'completed').map(p => p.lesson_id)
        );
        const nextLessonToComplete = moduleLessons.find(l => !completedLessonIds.has(l.id));
        setNextLesson(nextLessonToComplete || null);
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

  // Generate last 28 days for heatmap (4 weeks)
  const generateHeatmapDays = () => {
    const days = [];
    for (let i = 27; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const activity = activityData[dateStr] || 0;
      days.push({
        date: dateStr,
        day: date.getDate(),
        activity,
        dayOfWeek: date.getDay()
      });
    }
    return days;
  };

  const getActivityLevel = (activity: number): string => {
    if (activity === 0) return "bg-muted/30";
    if (activity <= 3) return "bg-primary/30";
    if (activity <= 7) return "bg-primary/50";
    if (activity <= 15) return "bg-primary/70";
    return "bg-primary";
  };

  const heatmapDays = generateHeatmapDays();

  if (loading) {
    return (
      <Card className="glass-luxury border-primary/20 animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-muted/30 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-luxury border-primary/20 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-5 w-5 text-primary" />
            Course Progress
          </CardTitle>
          <Badge 
            variant={totalProgress === 100 ? "default" : "secondary"}
            className={totalProgress === 100 ? "gradient-primary text-xs" : "text-xs"}
          >
            {totalProgress === 100 ? "Done!" : `${totalProgress}%`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress Bar */}
        <div>
          <Progress value={totalProgress} className="h-1.5" />
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>{completedLessons}/{totalLessons} lessons</span>
            <span>{completedModules}/12 modules</span>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">Last 4 weeks</span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-muted-foreground">Less</span>
              <div className="flex gap-0.5">
                <div className="w-2 h-2 rounded-sm bg-muted/30" />
                <div className="w-2 h-2 rounded-sm bg-primary/30" />
                <div className="w-2 h-2 rounded-sm bg-primary/50" />
                <div className="w-2 h-2 rounded-sm bg-primary/70" />
                <div className="w-2 h-2 rounded-sm bg-primary" />
              </div>
              <span className="text-[9px] text-muted-foreground">More</span>
            </div>
          </div>
          <TooltipProvider>
            <div className="grid grid-cols-7 gap-0.5">
              {heatmapDays.map((day, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <div 
                      className={`w-full aspect-square rounded-sm ${getActivityLevel(day.activity)} cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p className="text-muted-foreground">
                      {day.activity === 0 ? "No activity" : `${day.activity} activities`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>

        {/* Current Module Info */}
        {currentModule && (
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-1.5 mb-0.5">
              {totalProgress === 100 ? (
                <Trophy className="h-3 w-3 text-yellow-500" />
              ) : (
                <Play className="h-3 w-3 text-primary" />
              )}
              <span className="text-[10px] text-muted-foreground">
                {totalProgress === 100 ? "Complete" : "Current"}
              </span>
            </div>
            <p className="font-medium text-xs line-clamp-1">
              Week {currentModule.week_number}: {currentModule.title}
            </p>
            {nextLesson && (
              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                Next: {nextLesson.title}
              </p>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="text-center p-1.5 rounded-md bg-primary/10">
            <div className="flex items-center justify-center gap-0.5 text-primary">
              <CheckCircle2 className="h-2.5 w-2.5" />
              <span className="text-xs font-bold">{completedLessons}</span>
            </div>
            <span className="text-[9px] text-muted-foreground">Lessons</span>
          </div>
          <div className="text-center p-1.5 rounded-md bg-accent/10">
            <div className="flex items-center justify-center gap-0.5 text-accent">
              <BookOpen className="h-2.5 w-2.5" />
              <span className="text-xs font-bold">{completedModules}</span>
            </div>
            <span className="text-[9px] text-muted-foreground">Modules</span>
          </div>
          <div className="text-center p-1.5 rounded-md bg-yellow-500/10">
            <div className="flex items-center justify-center gap-0.5 text-yellow-600">
              <Flame className="h-2.5 w-2.5" />
              <span className="text-xs font-bold">{totalProgress}%</span>
            </div>
            <span className="text-[9px] text-muted-foreground">Done</span>
          </div>
        </div>

        {/* Continue Button */}
        <Button 
          onClick={handleContinue}
          size="sm"
          className="w-full gradient-primary hover:scale-[1.02] transition-transform"
        >
          {totalProgress === 100 ? "Review Course" : "Continue Learning"}
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseProgressWidget;
