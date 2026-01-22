import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, MessageSquare, Target, Brain, TrendingUp, 
  AlertCircle, CheckCircle2, Activity, Sparkles, Loader2, 
  Calendar, Zap, GraduationCap, RotateCcw, Trophy, Flame, 
  Star, ArrowRight, Play, LayoutDashboard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import CourseProgressWidget from "@/components/CourseProgressWidget";
import StatCard from "@/components/StatCard";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import PageBanner from "@/components/PageBanner";
import { ExamTipsCarousel } from "@/components/telc/ExamTipsCarousel";
import { SectionProgressCards } from "@/components/telc/SectionProgressCards";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzingProgress, setAnalyzingProgress] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const analyzeProgressWithAI = async () => {
    if (mistakes.length === 0) {
      toast({ 
        title: "No mistakes to analyze", 
        description: "Complete some exercises first to get AI insights.",
        variant: "destructive" 
      });
      return;
    }

    setAnalyzingProgress(true);
    try {
      const { data: analysisData, error } = await supabase.functions.invoke('analyze-progress', {
        body: { mistakes, progress }
      });
      
      if (error) throw error;
      
      if (analysisData) {
        setAiAnalysis(analysisData);
        toast({ title: "✨ AI Analysis Complete!", description: "Check your insights below" });
      }
    } catch (error: any) {
      toast({ 
        title: "Analysis Failed", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setAnalyzingProgress(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Fetch progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      
      setProgress(progressData);

      // Check for milestones
      if (progressData?.streak_days === 7 || progressData?.streak_days === 30 || progressData?.words_learned >= 100) {
        setTimeout(() => setShowCelebration(true), 500);
      }

      // Fetch mistakes for weak spots analysis
      const { data: mistakesData } = await supabase
        .from("mistakes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      
      setMistakes(mistakesData || []);

      // Fetch real weekly activity data
      const { data: activityData } = await supabase
        .from("daily_activity")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("activity_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order("activity_date", { ascending: true });
      
      // Format data for chart with day names
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const weeklyData = last7Days.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const dayData = activityData?.find(d => d.activity_date === dateStr);
        return {
          day: dayNames[date.getDay()],
          exercises: dayData?.exercises_completed || 0,
          words: dayData?.words_learned || 0,
          conversations: dayData?.conversations_count || 0,
          writing: dayData?.writing_submissions_count || 0,
        };
      });
      setWeeklyActivity(weeklyData);

      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  // Use AI analysis or fallback to basic analysis
  const weakSpots = aiAnalysis?.weakSpots || (() => {
    const mistakesByType: { [key: string]: number } = {};
    const mistakesByCategory: { [key: string]: number } = {};
    
    mistakes.forEach(m => {
      mistakesByType[m.type] = (mistakesByType[m.type] || 0) + 1;
      mistakesByCategory[m.category] = (mistakesByCategory[m.category] || 0) + 1;
    });

    return [
      ...Object.entries(mistakesByType).map(([type, count]) => ({ 
        name: type, 
        severity: Math.min(10, count),
        recommendation: `Practice ${type} exercises`
      })),
      ...Object.entries(mistakesByCategory).map(([cat, count]) => ({ 
        name: cat, 
        severity: Math.min(10, count),
        recommendation: `Focus on ${cat} grammar`
      }))
    ].sort((a, b) => b.severity - a.severity).slice(0, 5);
  })();

  const getRecommendations = () => {
    const recs = [];
    const totalActivity = weeklyActivity.reduce((sum, day) => sum + day.exercises + day.words, 0);
    
    if (mistakes.length > 10) {
      recs.push({ icon: AlertCircle, text: "Review Mistake Diary - You have many logged errors", path: "/diary" });
    }
    
    if (weakSpots.length > 0 && weakSpots[0].severity >= 5) {
      recs.push({ icon: Target, text: `Focus on ${weakSpots[0].name} - Your weakest area`, path: "/writing" });
    }
    
    if (totalActivity < 20) {
      recs.push({ icon: TrendingUp, text: "Practice daily for better results", path: "/exercises" });
    }
    
    if ((progress?.words_learned || 0) < 100) {
      recs.push({ icon: BookOpen, text: `Learn more vocabulary`, path: "/vocabulary" });
    }
    
    if ((progress?.exercises_completed || 0) < 5) {
      recs.push({ icon: Brain, text: "Try AI Companion for interactive learning", path: "/ai-companion" });
    }
    
    if ((progress?.streak_days || 0) < 7) {
      recs.push({ icon: MessageSquare, text: `Build your streak to 7 days`, path: "/memorizer" });
    }
    
    if ((progress?.exercises_completed || 0) >= 20 && mistakes.length < 5) {
      recs.push({ icon: CheckCircle2, text: "Ready for TELC B2 Mock Exam", path: "/telc-exam" });
    }
    
    return recs.slice(0, 4);
  };

  const recommendations = getRecommendations();

  const mistakeDistribution = Object.entries(
    mistakes.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number })
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      <ConfettiCelebration trigger={showCelebration} />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* Hero Banner */}
        <PageBanner
          type="dashboard"
          title={`Welcome back${user?.email ? `, ${user.email.split('@')[0]}` : ''}!`}
          subtitle="Continue your German learning journey. Track your progress and unlock new achievements."
          badge={`🔥 ${progress?.streak_days || 0} Day Streak`}
          icon={LayoutDashboard}
        >
          <div className="flex gap-3 mt-2">
            <Button 
              onClick={() => navigate('/mastery-course')} 
              className="gradient-primary hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
            <Button 
              variant="outline" 
              onClick={analyzeProgressWithAI}
              disabled={analyzingProgress || mistakes.length === 0}
              className="glass hover:glow"
            >
              {analyzingProgress ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              AI Insights
            </Button>
          </div>
        </PageBanner>

        {/* Celebration Banner for Milestones */}
        {(progress?.streak_days === 7 || progress?.streak_days === 30 || progress?.words_learned >= 100) && (
          <Card className="glass-luxury border-primary/30 animate-bounce-in overflow-hidden">
            <div className="absolute inset-0 animate-shimmer" />
            <CardContent className="p-4 flex items-center gap-4 relative">
              <div className="p-3 rounded-full bg-primary/20 animate-glow-pulse">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-primary">🎉 Congratulations!</p>
                <p className="text-sm text-muted-foreground">
                  {progress?.streak_days === 7 && "You've maintained a 7-day streak! Keep it up!"}
                  {progress?.streak_days === 30 && "Amazing! 30-day streak achieved! You're unstoppable!"}
                  {progress?.words_learned >= 100 && progress?.streak_days !== 7 && progress?.streak_days !== 30 && "You've learned 100+ words! Great progress!"}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500 animate-float" />
            </CardContent>
          </Card>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <StatCard
            icon={<Target className="w-6 h-6" />}
            value={progress?.words_learned || 0}
            label={t('dashboard.wordsLearned')}
            variant="primary"
            onClick={() => navigate('/vocabulary')}
          />
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            value={progress?.exercises_completed || 0}
            label={t('dashboard.exercisesDone')}
            variant="accent"
            onClick={() => navigate('/exercises')}
          />
          <StatCard
            icon={<Flame className="w-6 h-6" />}
            value={progress?.streak_days || 0}
            label={t('dashboard.currentStreak')}
            variant="warning"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            value={mistakes.length}
            label={t('dashboard.totalMistakes')}
            variant="default"
            onClick={() => navigate('/diary')}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Button
            onClick={() => navigate('/ai-companion')}
            className="h-auto p-4 flex flex-col items-center gap-2 gradient-primary hover:scale-105 transition-transform group"
          >
            <Brain className="w-6 h-6 group-hover:animate-bounce" />
            <span className="text-sm font-medium">AI Session</span>
          </Button>
          <Button
            onClick={() => navigate('/exercises')}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2 glass hover:border-primary/50 group"
          >
            <Target className="w-6 h-6 text-primary group-hover:animate-bounce" />
            <span className="text-sm font-medium">Practice</span>
          </Button>
          <Button
            onClick={() => navigate('/review')}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2 glass hover:border-primary/50 group"
          >
            <RotateCcw className="w-6 h-6 text-accent group-hover:animate-spin" />
            <span className="text-sm font-medium">Review</span>
          </Button>
          <Button
            onClick={() => navigate('/telc-exam')}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2 glass hover:border-primary/50 group"
          >
            <GraduationCap className="w-6 h-6 text-green-500 group-hover:animate-bounce" />
            <span className="text-sm font-medium">TELC Exam</span>
          </Button>
        </div>

        {/* Featured: TELC B2 Mastery Course */}
        <Card 
          className="glass-luxury border-primary/30 overflow-hidden cursor-pointer hover:luxury-glow transition-all duration-300 group"
          onClick={() => navigate('/mastery-course')}
        >
          <div className="relative">
            <div className="absolute inset-0 gradient-luxury opacity-10 group-hover:opacity-20 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-4 rounded-2xl bg-primary/20 animate-sparkle group-hover:animate-glow-pulse">
                  <GraduationCap className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="gradient-primary text-primary-foreground">Featured</Badge>
                    <Badge variant="outline" className="border-primary/50">12 Weeks</Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gradient-luxury mb-1">
                    TELC B2 Mastery Course
                  </h2>
                  <p className="text-muted-foreground">
                    Complete 12-week curriculum with 60+ lessons, interactive exercises, AI tutoring, and official certificate upon completion.
                  </p>
                </div>
                <Button size="lg" className="gradient-primary hover:scale-105 transition-transform shrink-0 group-hover:shadow-lg">
                  <Flame className="w-5 h-5 mr-2" />
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              {/* Course highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>60+ Lessons</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4 text-accent" />
                  <span>AI Tutor</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-green-500" />
                  <span>Exercises</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>Certificate</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* TELC Exam Preparation Section */}
        <SectionProgressCards />

        {/* Exam Tips Carousel */}
        <ExamTipsCarousel autoRotate={true} rotateInterval={12000} />

        {/* Learning Path & Achievements Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="glass-luxury border-primary/20 cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all group"
            onClick={() => navigate('/learning-path')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20 group-hover:animate-glow-pulse">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Learning Path</p>
                <p className="text-sm text-muted-foreground">AI-powered daily lessons</p>
              </div>
              <Button size="sm" className="gradient-primary group-hover:scale-105 transition-transform">
                Start
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="glass cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all group"
            onClick={() => navigate('/achievements')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20 group-hover:animate-float">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Achievements</p>
                <p className="text-sm text-muted-foreground">Unlock badges & earn XP</p>
              </div>
              <Button size="sm" variant="outline" className="group-hover:border-primary/50">
                View
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Activity Chart */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  {t('dashboard.weeklyActivity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
                  <LineChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="exercises" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                    <Line type="monotone" dataKey="words" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Areas Needing Focus */}
            <Card className="glass border-destructive/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                    Areas Needing Focus
                  </CardTitle>
                  {aiAnalysis && (
                    <Badge variant="secondary" className="text-xs animate-pulse">AI Analyzed</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {weakSpots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500 animate-bounce-in" />
                    <p className="text-sm font-medium">Great job! No major weak areas detected.</p>
                    <p className="text-xs mt-2">Complete more exercises for detailed analysis</p>
                  </div>
                ) : (
                  <div className="space-y-4 stagger-children">
                    {weakSpots.map((spot: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 hover:border-destructive/20 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold capitalize text-sm">{spot.name}</h4>
                              <Badge variant="destructive" className="text-xs">
                                {spot.severity}/10
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {spot.recommendation}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Priority Level</span>
                            <span>{spot.severity >= 7 ? 'High' : spot.severity >= 4 ? 'Medium' : 'Low'}</span>
                          </div>
                          <Progress value={spot.severity * 10} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Strengths */}
            {aiAnalysis?.strengths && aiAnalysis.strengths.length > 0 && (
              <Card className="glass animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-500 text-sm sm:text-base">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiAnalysis.strengths.map((strength: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 animate-slide-in-left" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Course Progress & Recommendations */}
          <div className="space-y-6">
            {/* Course Progress Widget */}
            <CourseProgressWidget />

            {/* Activity Log Quick Access */}
            <Card className="glass border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-accent" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="glass p-2.5 rounded-lg text-center hover:scale-105 transition-transform">
                    <p className="text-2xl font-bold text-primary">{progress?.streak_days || 0}</p>
                    <p className="text-muted-foreground text-xs">Day Streak 🔥</p>
                  </div>
                  <div className="glass p-2.5 rounded-lg text-center hover:scale-105 transition-transform">
                    <p className="text-2xl font-bold">{weeklyActivity.filter(d => d.exercises > 0 || d.words > 0).length}/7</p>
                    <p className="text-muted-foreground text-xs">Active Days</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full group"
                  onClick={() => navigate("/activity-log")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Full Activity Log
                  <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Smart Recommendations */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-sparkle" />
                    Recommended Next Steps
                  </CardTitle>
                  {aiAnalysis && (
                    <Badge variant="default" className="text-xs">AI Powered</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {(aiAnalysis?.nextSteps || recommendations).slice(0, 5).map((rec: any, idx: number) => {
                  const Icon = rec.icon || Brain;
                  return (
                    <button
                      key={idx}
                      onClick={() => rec.path && navigate(rec.path)}
                      className="w-full p-3 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/30 transition-all text-left group hover:scale-[1.02]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-primary group-hover:animate-bounce">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">
                            {typeof rec === 'string' ? rec : (rec.text || rec.name || 'Recommendation')}
                          </p>
                          {rec.description && (
                            <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                          )}
                        </div>
                        <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Mistake Distribution */}
            {mistakeDistribution.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-sm">{t('dashboard.mistakeDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={mistakeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                        style={{ fontSize: '11px' }}
                      >
                        {mistakeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
