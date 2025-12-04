import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Brain, 
  Target, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Calendar,
  Zap,
  TrendingUp,
  Play,
  RotateCcw
} from "lucide-react";
import { trackActivity } from "@/utils/activityTracker";

interface Task {
  type: string;
  title: string;
  description: string;
  duration: number;
  path: string;
  xpReward: number;
}

interface DailyLesson {
  title: string;
  estimatedMinutes: number;
  weekProgress: string;
  focusArea: string;
  tasks: Task[];
  why: string;
  tips: string[];
  motivation: string;
}

interface LearningPath {
  id: string;
  target_level: string;
  current_week: number;
  total_weeks: number;
  completed_modules: string[];
  daily_goal_minutes: number;
}

const LearningPath = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generatingLesson, setGeneratingLesson] = useState(false);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [dailyLesson, setDailyLesson] = useState<DailyLesson | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [hasPath, setHasPath] = useState(false);

  useEffect(() => {
    loadLearningPath();
  }, []);

  const loadLearningPath = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Load learning path
      const { data: pathData } = await supabase
        .from('user_learning_paths')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (pathData) {
        setLearningPath(pathData as LearningPath);
        setHasPath(true);
      }

      // Load today's lesson
      const today = new Date().toISOString().split('T')[0];
      const { data: lessonData } = await supabase
        .from('daily_lessons')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('lesson_date', today)
        .maybeSingle();

      if (lessonData?.lesson_data) {
        setDailyLesson(lessonData.lesson_data as unknown as DailyLesson);
      }
    } catch (error) {
      console.error('Error loading learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLearningPath = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('user_learning_paths')
        .insert({
          user_id: session.user.id,
          target_level: 'B2',
          daily_goal_minutes: 30
        })
        .select()
        .single();

      if (error) throw error;

      setLearningPath(data as LearningPath);
      setHasPath(true);
      toast({ title: "Learning path created!", description: "Let's generate your first lesson." });
      
      // Generate first lesson
      await generateDailyLesson();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const generateDailyLesson = async () => {
    setGeneratingLesson(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-daily-lesson', {
        body: { 
          availableMinutes: learningPath?.daily_goal_minutes || 30
        }
      });

      if (error) throw error;

      setDailyLesson(data);
      toast({ title: "📚 Today's lesson is ready!", description: data.title });
    } catch (error: any) {
      toast({ title: "Error generating lesson", description: error.message, variant: "destructive" });
    } finally {
      setGeneratingLesson(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    if (task.path) {
      navigate(task.path);
    }
  };

  const markTaskComplete = async (taskTitle: string) => {
    if (completedTasks.includes(taskTitle)) return;
    
    setCompletedTasks([...completedTasks, taskTitle]);
    
    try {
      await trackActivity('exercise', 1);
      
      const task = dailyLesson?.tasks.find(t => t.title === taskTitle);
      if (task) {
        toast({ 
          title: `✅ Task completed!`, 
          description: `+${task.xpReward} XP earned` 
        });
      }

      // Check if all tasks completed
      if (dailyLesson && completedTasks.length + 1 === dailyLesson.tasks.length) {
        toast({ 
          title: "🎉 Daily Lesson Complete!", 
          description: "Amazing work! See you tomorrow." 
        });
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'vocabulary': return BookOpen;
      case 'exercise': return Target;
      case 'writing': return Brain;
      case 'reading': return BookOpen;
      case 'listening': return Brain;
      case 'review': return RotateCcw;
      case 'conversation': return Brain;
      default: return Zap;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <TrendingUp className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-gradient-luxury">
              Your Learning Path
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered personalized curriculum to help you achieve TELC B2 certification
          </p>
        </div>

        {!hasPath ? (
          // Onboarding Card
          <Card className="glass-luxury animate-scale-in">
            <CardHeader className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className="text-2xl">Start Your Learning Journey</CardTitle>
              <CardDescription className="text-base">
                Create a personalized 12-week learning path tailored to your goals and schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-4 rounded-lg text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Personalized</p>
                  <p className="text-xs text-muted-foreground">Adapts to your weak areas</p>
                </div>
                <div className="glass p-4 rounded-lg text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="font-semibold">Daily Lessons</p>
                  <p className="text-xs text-muted-foreground">AI-generated each day</p>
                </div>
                <div className="glass p-4 rounded-lg text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold">Track Progress</p>
                  <p className="text-xs text-muted-foreground">Week by week improvement</p>
                </div>
              </div>
              
              <Button 
                onClick={createLearningPath} 
                className="w-full gradient-primary luxury-glow"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create My Learning Path
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Progress Overview */}
            <Card className="glass-luxury">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Progress</p>
                    <p className="text-xl font-bold">Week {learningPath?.current_week || 1} of {learningPath?.total_weeks || 12}</p>
                  </div>
                  <Badge className="gradient-primary text-lg px-4 py-1">
                    {learningPath?.target_level || 'B2'}
                  </Badge>
                </div>
                <Progress 
                  value={((learningPath?.current_week || 1) / (learningPath?.total_weeks || 12)) * 100} 
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round(((learningPath?.current_week || 1) / (learningPath?.total_weeks || 12)) * 100)}% complete
                </p>
              </CardContent>
            </Card>

            {/* Today's Lesson */}
            {dailyLesson ? (
              <Card className="glass-luxury border-primary/30 animate-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">{dailyLesson.weekProgress}</Badge>
                      <CardTitle className="text-xl">{dailyLesson.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {dailyLesson.estimatedMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {dailyLesson.focusArea}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {completedTasks.length}/{dailyLesson.tasks.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Tasks done</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tasks */}
                  <div className="space-y-3">
                    {dailyLesson.tasks.map((task, idx) => {
                      const Icon = getTaskIcon(task.type);
                      const isCompleted = completedTasks.includes(task.title);
                      
                      return (
                        <div 
                          key={idx}
                          className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
                            isCompleted ? 'bg-primary/10 border-primary/30' : 'glass'
                          }`}
                          onClick={() => !isCompleted && handleTaskClick(task)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${isCompleted ? 'bg-primary/20' : 'bg-primary/10'}`}>
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              ) : (
                                <Icon className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </p>
                                <Badge variant="secondary" className="text-xs">
                                  +{task.xpReward} XP
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">{task.duration} min</p>
                              {!isCompleted && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markTaskComplete(task.title);
                                  }}
                                  className="text-xs mt-1"
                                >
                                  Mark Done
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Why this lesson */}
                  <div className="glass p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      Why this lesson?
                    </p>
                    <p className="text-sm text-muted-foreground">{dailyLesson.why}</p>
                  </div>

                  {/* Tips */}
                  {dailyLesson.tips && dailyLesson.tips.length > 0 && (
                    <div className="glass p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">💡 Today's Tips</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {dailyLesson.tips.map((tip, idx) => (
                          <li key={idx}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Motivation */}
                  {dailyLesson.motivation && (
                    <div className="text-center p-4 glass-luxury rounded-lg border-primary/20">
                      <p className="text-primary italic">{dailyLesson.motivation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="glass">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No lesson generated for today yet</p>
                  <Button 
                    onClick={generateDailyLesson} 
                    disabled={generatingLesson}
                    className="gradient-primary"
                  >
                    {generatingLesson ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Today's Lesson
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Regenerate Button */}
            {dailyLesson && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={generateDailyLesson}
                  disabled={generatingLesson}
                  className="gap-2"
                >
                  {generatingLesson ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  Generate New Lesson
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LearningPath;
