import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Target,
  Clock,
  ChevronRight,
  CheckCircle2,
  Circle,
  Flame,
  Trophy,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  FileText,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DailyTask {
  id: string;
  title: string;
  section: string;
  icon: any;
  color: string;
  duration: number;
  completed: boolean;
  link: string;
}

interface StudyPlanWidgetProps {
  examDate?: Date;
  dailyGoalMinutes?: number;
  completedTodayMinutes?: number;
  weeklyProgress?: number[];
  streak?: number;
}

export const StudyPlanWidget = ({
  examDate,
  dailyGoalMinutes = 60,
  completedTodayMinutes = 0,
  weeklyProgress = [100, 80, 90, 0, 0, 0, 0],
  streak = 0
}: StudyPlanWidgetProps) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const daysUntilExam = examDate 
    ? Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const todayProgress = Math.min(100, (completedTodayMinutes / dailyGoalMinutes) * 100);
  
  // Week days translated
  const weekDays = language === 'ar' 
    ? ['اث', 'ث', 'أر', 'خ', 'ج', 'س', 'أح']
    : language === 'de' 
      ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
      : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Generate personalized daily tasks - titles stay in German (learning content)
  const dailyTasks: DailyTask[] = [
    {
      id: "1",
      title: "Leseverstehen Teil 1",
      section: "reading",
      icon: BookOpen,
      color: "blue",
      duration: 20,
      completed: completedTodayMinutes >= 20,
      link: "/telc-vorbereitung?section=lesen&teil=1"
    },
    {
      id: "2",
      title: "Hörverstehen Übung",
      section: "listening",
      icon: Headphones,
      color: "green",
      duration: 15,
      completed: completedTodayMinutes >= 35,
      link: "/telc-vorbereitung?section=hoeren&teil=1"
    },
    {
      id: "3",
      title: "Sprachbausteine",
      section: "grammar",
      icon: PenTool,
      color: "purple",
      duration: 15,
      completed: completedTodayMinutes >= 50,
      link: "/telc-vorbereitung?section=sprachbausteine&teil=1"
    },
    {
      id: "4",
      title: "Schreiben Übung",
      section: "writing",
      icon: FileText,
      color: "orange",
      duration: 20,
      completed: completedTodayMinutes >= 70,
      link: "/telc-vorbereitung?section=schreiben&teil=1"
    }
  ];

  const completedTasks = dailyTasks.filter(t => t.completed).length;

  return (
    <Card className="glass-luxury border-primary/20 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {t('telc.studyPlan.todayLearn')}
          </CardTitle>
          {streak > 0 && (
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
              <Flame className="w-3 h-3 mr-1" />
              {streak} {t('telc.days')}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Exam Countdown */}
        {daysUntilExam !== null && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{t('telc.studyPlan.examDate')}</p>
                <p className="text-xs text-muted-foreground">
                  {examDate?.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'de' ? 'de-DE' : 'en-US', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{daysUntilExam}</p>
              <p className="text-xs text-muted-foreground">{t('telc.days')}</p>
            </div>
          </div>
        )}

        {/* Today's Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              {t('telc.studyPlan.dailyGoal')}
            </span>
            <span className="font-medium">
              {completedTodayMinutes}/{dailyGoalMinutes} min
            </span>
          </div>
          <Progress value={todayProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {completedTasks}/{dailyTasks.length} {t('telc.studyPlan.tasksCompleted')}
          </p>
        </div>

        {/* Weekly Activity */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {t('telc.studyPlan.thisWeek')}
          </p>
          <div className="flex justify-between gap-1">
            {weekDays.map((day, idx) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                    weeklyProgress[idx] >= 100 
                      ? 'bg-primary text-primary-foreground' 
                      : weeklyProgress[idx] > 0 
                        ? 'bg-primary/30 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {weeklyProgress[idx] >= 100 ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : weeklyProgress[idx] > 0 ? (
                    `${weeklyProgress[idx]}%`
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('telc.studyPlan.recommendedExercises')}</p>
          <div className="space-y-2">
            {dailyTasks.map((task) => {
              const Icon = task.icon;
              const colorMap: Record<string, string> = {
                blue: "bg-blue-500/10 text-blue-500",
                green: "bg-green-500/10 text-green-500",
                purple: "bg-purple-500/10 text-purple-500",
                orange: "bg-orange-500/10 text-orange-500",
              };
              
              return (
                <button
                  key={task.id}
                  onClick={() => navigate(task.link)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] ${
                    task.completed 
                      ? 'bg-muted/50 border-border/50 opacity-60' 
                      : 'bg-background/50 border-border hover:border-primary/30'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${colorMap[task.color]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.duration} min
                    </p>
                  </div>
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigate('/telc-vorbereitung')}
          >
            {t('telc.exercises')}
          </Button>
          <Button 
            size="sm" 
            className="w-full gradient-primary"
            onClick={() => navigate('/telc-exam')}
          >
            {t('telc.studyPlan.mockExam')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyPlanWidget;
