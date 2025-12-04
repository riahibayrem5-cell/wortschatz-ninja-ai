import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  BookOpen, Clock, CheckCircle2, Play, ArrowLeft, 
  MessageCircle, Trophy, Lock, ChevronRight, Star
} from "lucide-react";

interface CourseModule {
  id: string;
  week_number: number;
  title: string;
  title_de: string;
  description: string;
  description_de: string;
  skills_focus: any;
  estimated_hours: number;
}

interface CourseLesson {
  id: string;
  module_id: string;
  lesson_number: number;
  title: string;
  title_de: string;
  lesson_type: string;
  content: any;
  estimated_minutes: number;
}

interface LessonProgress {
  lesson_id: string;
  status: string;
  score: number | null;
  completed_at: string | null;
}

const ModuleDetail = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const [module, setModule] = useState<CourseModule | null>(null);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [moduleProgress, setModuleProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, [moduleId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    await Promise.all([
      fetchModule(),
      fetchLessons(),
      fetchProgress(user.id)
    ]);
    setLoading(false);
  };

  const fetchModule = async () => {
    if (!moduleId) return;
    
    const { data, error } = await supabase
      .from('course_modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (error) {
      console.error("Error fetching module:", error);
      toast.error("Module not found");
      navigate('/mastery-course');
      return;
    }

    setModule(data);
  };

  const fetchLessons = async () => {
    if (!moduleId) return;
    
    const { data, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('lesson_number');

    if (error) {
      console.error("Error fetching lessons:", error);
      return;
    }

    setLessons(data || []);
  };

  const fetchProgress = async (userId: string) => {
    if (!moduleId) return;
    
    // Fetch lesson progress
    const { data: lessonProgress, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .not('lesson_id', 'is', null);

    if (!error) {
      const progressMap: Record<string, LessonProgress> = {};
      lessonProgress?.forEach(p => {
        if (p.lesson_id) {
          progressMap[p.lesson_id] = p;
        }
      });
      setProgress(progressMap);
    }

    // Fetch module progress
    const { data: modProgress } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .is('lesson_id', null)
      .single();

    setModuleProgress(modProgress);
  };

  const getLessonStatus = (lessonId: string, lessonNumber: number) => {
    const lessonProgress = progress[lessonId];
    if (lessonProgress?.status === 'completed') return 'completed';
    if (lessonProgress?.status === 'in_progress') return 'in_progress';
    
    // First lesson is always unlocked
    if (lessonNumber === 1) return 'unlocked';
    
    // Check if previous lesson is completed
    const prevLesson = lessons.find(l => l.lesson_number === lessonNumber - 1);
    if (prevLesson && progress[prevLesson.id]?.status === 'completed') return 'unlocked';
    
    return 'locked';
  };

  const handleLessonClick = (lesson: CourseLesson) => {
    const status = getLessonStatus(lesson.id, lesson.lesson_number);
    if (status === 'locked') {
      toast.error("Complete previous lessons to unlock this one");
      return;
    }
    navigate(`/mastery-course/${moduleId}/lesson/${lesson.id}`);
  };

  const openAITutor = () => {
    navigate(`/mastery-course/${moduleId}/tutor`);
  };

  const generateModuleCertificate = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { certificateType: 'module_completion', moduleId }
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Module certificate generated!");
      navigate('/certificates');
    } catch (error: any) {
      toast.error(error.message || "Failed to generate certificate");
    }
  };

  const lessonTypeIcons: Record<string, { icon: string; color: string }> = {
    reading: { icon: "📖", color: "bg-blue-500/10 text-blue-600" },
    listening: { icon: "🎧", color: "bg-purple-500/10 text-purple-600" },
    writing: { icon: "📝", color: "bg-green-500/10 text-green-600" },
    speaking: { icon: "🗣️", color: "bg-orange-500/10 text-orange-600" },
    grammar: { icon: "✍️", color: "bg-red-500/10 text-red-600" },
    vocabulary: { icon: "📚", color: "bg-yellow-500/10 text-yellow-600" },
    exam_practice: { icon: "📋", color: "bg-primary/10 text-primary" },
  };

  const completedLessons = Object.values(progress).filter(p => p.status === 'completed').length;
  const progressPercent = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!module) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/mastery-course')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>

        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary">Week {module.week_number}</Badge>
            {moduleProgress?.status === 'completed' && (
              <Badge className="bg-primary">Completed</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-1">{module.title}</h1>
          <p className="text-lg text-muted-foreground italic mb-4">{module.title_de}</p>
          <p className="text-muted-foreground">{module.description}</p>
        </div>

        {/* Progress & AI Tutor */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Module Progress</span>
                <span className="text-xl font-bold text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {completedLessons} of {lessons.length} lessons completed
              </p>
              
              {progressPercent === 100 && (
                <Button 
                  className="mt-4 w-full"
                  onClick={generateModuleCertificate}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Get Module Certificate
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold">AI Tutor</p>
                  <p className="text-sm text-muted-foreground">Get help anytime</p>
                </div>
              </div>
              <Button className="w-full" onClick={openAITutor}>
                Start Tutoring Session
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Lessons</h2>
          
          {lessons.map((lesson) => {
            const status = getLessonStatus(lesson.id, lesson.lesson_number);
            const lessonProgress = progress[lesson.id];
            const typeStyle = lessonTypeIcons[lesson.lesson_type] || lessonTypeIcons.exam_practice;
            
            return (
              <Card 
                key={lesson.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  status === 'locked' ? 'opacity-60' : ''
                } ${status === 'completed' ? 'border-primary/30' : ''}`}
                onClick={() => handleLessonClick(lesson)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Lesson Number */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      status === 'completed' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : status === 'locked' ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <span className="font-semibold">{lesson.lesson_number}</span>
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={typeStyle.color}>
                          {typeStyle.icon} {lesson.lesson_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h3 className="font-medium truncate">{lesson.title}</h3>
                      <p className="text-sm text-muted-foreground italic truncate">{lesson.title_de}</p>
                    </div>

                    {/* Duration & Score */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {lesson.estimated_minutes}m
                      </div>
                      {lessonProgress?.score && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{lessonProgress.score}%</span>
                        </div>
                      )}
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;
