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
  BookOpen, Clock, Trophy, CheckCircle2, Play, 
  GraduationCap, Target, Award, ChevronRight, Star,
  ArrowRight, Sparkles
} from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import ModuleCard from "@/components/ModuleCard";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import courseBanner from "@/assets/course-banner.jpg";

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
  const [showCelebration, setShowCelebration] = useState(false);

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

  const getModuleStatus = (moduleId: string): "completed" | "in_progress" | "unlocked" => {
    const moduleProgress = progress[moduleId];
    if (moduleProgress?.status === 'completed') return 'completed';
    if (moduleProgress?.status === 'in_progress') return 'in_progress';
    return 'unlocked';
  };

  const handleModuleClick = (module: CourseModule) => {
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

      setShowCelebration(true);
      toast.success("Certificate generated!");
      navigate('/certificates');
    } catch (error: any) {
      toast.error(error.message || "Failed to generate certificate");
    }
  };

  const completedModules = Object.values(progress).filter(p => p.status === 'completed').length;
  const inProgressModules = Object.values(progress).filter(p => p.status === 'in_progress').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-muted rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
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
      <ConfettiCelebration trigger={showCelebration} />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Banner */}
        <HeroBanner
          image={courseBanner}
          title="TELC B2 Mastery Course"
          subtitle="Complete 12-week curriculum to master German at B2 level. AI-powered lessons, interactive exercises, and official certification."
          badge="🎓 Premium Course"
          height="lg"
        >
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm bg-background/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <BookOpen className="w-4 h-4" />
              <span>60+ Lessons</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-background/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" />
              <span>80+ Hours</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-background/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Trophy className="w-4 h-4" />
              <span>Certificate</span>
            </div>
          </div>
        </HeroBanner>

        {/* Progress Overview */}
        <Card className="glass-luxury border-primary/20 overflow-hidden">
          <div className="absolute inset-0 animate-shimmer opacity-50" />
          <CardContent className="pt-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Course Progress</span>
                  <span className="text-3xl font-bold text-primary">{totalProgress}%</span>
                </div>
                <Progress value={totalProgress} className="h-4 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {completedModules} of 12 modules completed
                  {inProgressModules > 0 && ` • ${inProgressModules} in progress`}
                </p>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/learning-path')}>
                <div className="p-3 rounded-lg bg-primary/20">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">80+</p>
                  <p className="text-sm text-muted-foreground">Hours of Content</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/exercises')}>
                <div className="p-3 rounded-lg bg-accent/20">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">60+</p>
                  <p className="text-sm text-muted-foreground">Interactive Lessons</p>
                </div>
              </div>
            </div>

            {totalProgress === 100 && (
              <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/30 animate-glow-pulse">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-full animate-bounce">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">🎉 Congratulations! Course Completed!</p>
                      <p className="text-sm text-muted-foreground">Claim your official completion certificate</p>
                    </div>
                  </div>
                  <Button onClick={() => generateCertificate('course_completion')} className="gradient-primary hover:scale-105 transition-transform">
                    <Trophy className="h-4 w-4 mr-2" />
                    Get Certificate
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="modules" className="w-full">
          <TabsList className="mb-6 w-full sm:w-auto grid grid-cols-2 sm:flex">
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Course</span> Modules
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Course</span> Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {modules.map((module) => {
                const status = getModuleStatus(module.id);
                const moduleProgress = progress[module.id];
                
                return (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    status={status}
                    score={moduleProgress?.score}
                    onClick={() => handleModuleClick(module)}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    What You'll Learn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Complete TELC B2 Exam Preparation", desc: "All five exam sections covered in depth" },
                    { title: "2000+ B2 Vocabulary Words", desc: "Organized by themes and frequency" },
                    { title: "Advanced Grammar Mastery", desc: "Konjunktiv, Passiv, complex sentences" },
                    { title: "AI-Powered Personal Tutor", desc: "Get instant help on any topic" },
                    { title: "Full Mock Exams", desc: "Practice with authentic TELC format" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Certificates & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="h-6 w-6 text-primary animate-float" />
                      <p className="font-semibold">Course Completion Certificate</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete all 12 modules to earn your official FluentPass completion certificate
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-xl border border-yellow-500/20 hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="h-6 w-6 text-yellow-500 animate-sparkle" />
                      <p className="font-semibold">Excellence Award</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Achieve 90%+ average score to earn the Excellence distinction
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 hover:scale-[1.02] transition-transform cursor-pointer">
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
