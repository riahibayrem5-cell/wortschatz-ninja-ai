import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  BookOpen, Clock, Trophy, Lock, CheckCircle2, Play, 
  GraduationCap, Target, Award, ChevronRight, Star
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

interface ModuleProgress {
  module_id: string;
  status: string;
  score: number | null;
  completed_at: string | null;
}

const MasteryCourse = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    await Promise.all([fetchModules(), fetchProgress(user.id)]);
    setLoading(false);
  };

  const fetchModules = async () => {
    const { data, error } = await supabase
      .from('course_modules')
      .select('*')
      .order('week_number');

    if (error) {
      console.error("Error fetching modules:", error);
      return;
    }

    setModules(data || []);
  };

  const fetchProgress = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .is('lesson_id', null);

    if (error) {
      console.error("Error fetching progress:", error);
      return;
    }

    const progressMap: Record<string, ModuleProgress> = {};
    data?.forEach(p => {
      progressMap[p.module_id] = p;
    });
    setProgress(progressMap);

    // Calculate total progress
    const completedCount = data?.filter(p => p.status === 'completed').length || 0;
    setTotalProgress(Math.round((completedCount / 12) * 100));
  };

  const getModuleStatus = (moduleId: string, weekNumber: number) => {
    const moduleProgress = progress[moduleId];
    if (moduleProgress?.status === 'completed') return 'completed';
    if (moduleProgress?.status === 'in_progress') return 'in_progress';
    
    // Check if previous module is completed (for unlocking)
    if (weekNumber === 1) return 'unlocked';
    const prevModule = modules.find(m => m.week_number === weekNumber - 1);
    if (prevModule && progress[prevModule.id]?.status === 'completed') return 'unlocked';
    
    return 'locked';
  };

  const handleModuleClick = (module: CourseModule) => {
    const status = getModuleStatus(module.id, module.week_number);
    if (status === 'locked') {
      toast.error("Complete previous modules to unlock this one");
      return;
    }
    navigate(`/mastery-course/${module.id}`);
  };

  const generateCertificate = async (type: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { certificateType: type }
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Certificate generated!");
      navigate('/certificates');
    } catch (error: any) {
      toast.error(error.message || "Failed to generate certificate");
    }
  };

  const skillIcons: Record<string, string> = {
    vocabulary: "📚",
    grammar: "✍️",
    reading: "📖",
    listening: "🎧",
    writing: "📝",
    speaking: "🗣️",
    exam_practice: "📋",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">TELC B2 Mastery Course</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Complete 12-week curriculum to master German at B2 level
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 glass-luxury">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Course Progress</span>
                  <span className="text-2xl font-bold text-primary">{totalProgress}%</span>
                </div>
                <Progress value={totalProgress} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {Object.values(progress).filter(p => p.status === 'completed').length} of 12 modules completed
                </p>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">80+</p>
                  <p className="text-sm text-muted-foreground">Hours of Content</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">60+</p>
                  <p className="text-sm text-muted-foreground">Lessons</p>
                </div>
              </div>
            </div>

            {totalProgress === 100 && (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">Congratulations! Course Completed!</p>
                      <p className="text-sm text-muted-foreground">Claim your completion certificate</p>
                    </div>
                  </div>
                  <Button onClick={() => generateCertificate('course_completion')}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Get Certificate
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="modules" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="modules">Course Modules</TabsTrigger>
            <TabsTrigger value="overview">Course Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const status = getModuleStatus(module.id, module.week_number);
                const moduleProgress = progress[module.id];
                
                return (
                  <Card 
                    key={module.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      status === 'locked' ? 'opacity-60' : ''
                    } ${status === 'completed' ? 'border-primary/50 bg-primary/5' : ''}`}
                    onClick={() => handleModuleClick(module)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                          Week {module.week_number}
                        </Badge>
                        {status === 'completed' && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                        {status === 'in_progress' && (
                          <Play className="h-5 w-5 text-yellow-500" />
                        )}
                        {status === 'locked' && (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription className="text-sm italic">
                        {module.title_de}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {module.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {module.skills_focus.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skillIcons[skill] || "📌"} {skill.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {module.estimated_hours}h
                        </div>
                        {moduleProgress?.score && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{moduleProgress.score}%</span>
                          </div>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    What You'll Learn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Complete TELC B2 Exam Preparation</p>
                      <p className="text-sm text-muted-foreground">All five exam sections covered in depth</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">2000+ B2 Vocabulary Words</p>
                      <p className="text-sm text-muted-foreground">Organized by themes and frequency</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Advanced Grammar Mastery</p>
                      <p className="text-sm text-muted-foreground">Konjunktiv, Passiv, complex sentences</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">AI-Powered Personal Tutor</p>
                      <p className="text-sm text-muted-foreground">Get instant help on any topic</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Full Mock Exams</p>
                      <p className="text-sm text-muted-foreground">Practice with authentic TELC format</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Certificates & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="h-6 w-6 text-primary" />
                      <p className="font-semibold">Course Completion Certificate</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete all 12 modules to earn your official FluentPass completion certificate
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="h-6 w-6 text-yellow-500" />
                      <p className="font-semibold">Excellence Award</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Achieve 90%+ average score to earn the Excellence distinction
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <GraduationCap className="h-6 w-6 text-blue-500" />
                      <p className="font-semibold">Module Certificates</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Earn individual certificates for each completed module
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MasteryCourse;
