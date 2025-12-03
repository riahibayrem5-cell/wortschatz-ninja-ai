import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare, Target, Brain, TrendingUp, AlertCircle, CheckCircle2, Activity, Sparkles, Loader2, Calendar, Zap, GraduationCap, RotateCcw, Trophy, Flame, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";

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
    
    // Priority 1: Critical mistakes need review
    if (mistakes.length > 10) {
      recs.push({ icon: AlertCircle, text: "⚠️ Review Mistake Diary - You have many logged errors", path: "/diary" });
    }
    
    // Priority 2: Weak spots identified by AI
    if (weakSpots.length > 0 && weakSpots[0].severity >= 5) {
      recs.push({ icon: Target, text: `🎯 Focus on ${weakSpots[0].name} - Your weakest area`, path: "/writing" });
    }
    
    // Priority 3: Low activity warning
    if (totalActivity < 20) {
      recs.push({ icon: TrendingUp, text: "📈 You've been less active - Practice daily for better results", path: "/exercises" });
    }
    
    // Priority 4: Vocabulary building (always important)
    if ((progress?.words_learned || 0) < 100) {
      recs.push({ icon: BookOpen, text: `📚 Learn more vocabulary - Target: ${1000 - (progress?.words_learned || 0)} words to go`, path: "/vocabulary" });
    }
    
    // Priority 5: Try new features
    if ((progress?.exercises_completed || 0) < 5) {
      recs.push({ icon: Brain, text: "🧠 Try AI Companion - Interactive learning with real-time feedback", path: "/ai-companion" });
    }
    
    // Priority 6: Consistency building
    if ((progress?.streak_days || 0) < 7) {
      recs.push({ icon: MessageSquare, text: `🔥 Build your streak - Practice ${7 - (progress?.streak_days || 0)} more days for a week streak`, path: "/memorizer" });
    }
    
    // Priority 7: TELC exam prep
    if ((progress?.exercises_completed || 0) >= 20 && mistakes.length < 5) {
      recs.push({ icon: CheckCircle2, text: "🎓 Ready for TELC B2 Mock Exam - Test your skills", path: "/telc-exam" });
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
          <Activity className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 sm:pt-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient-luxury">{t('dashboard.title')}</h1>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <Button
              onClick={analyzeProgressWithAI}
              disabled={analyzingProgress || mistakes.length === 0}
              variant="outline"
              className="glass hover:glow flex-1 sm:flex-none"
            >
              {analyzingProgress ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Insights
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Celebration Banner for Milestones */}
        {(progress?.streak_days === 7 || progress?.streak_days === 30 || progress?.words_learned >= 100) && (
          <Card className="glass-luxury border-primary/30 animate-fade-in">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20 animate-pulse">
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
              <Star className="w-8 h-8 text-yellow-500 animate-bounce" />
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Button
            onClick={() => navigate('/ai-companion')}
            className="h-auto p-4 flex flex-col items-center gap-2 gradient-primary hover:scale-105 transition-transform"
          >
            <Brain className="w-6 h-6" />
            <span className="text-sm font-medium">AI Session</span>
          </Button>
          <Button
            onClick={() => navigate('/exercises')}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2 glass hover:border-primary/50"
          >
            <Target className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Practice</span>
          </Button>
          <Button
            onClick={() => navigate('/review')}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2 glass hover:border-primary/50"
          >
            <RotateCcw className="w-6 h-6 text-accent" />
            <span className="text-sm font-medium">Review</span>
          </Button>
          <Button
            onClick={() => navigate('/telc-exam')}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2 glass hover:border-primary/50"
          >
            <GraduationCap className="w-6 h-6 text-green-500" />
            <span className="text-sm font-medium">TELC Exam</span>
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="glass">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{t('dashboard.wordsLearned')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{progress?.words_learned || 0}</div>
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary opacity-50" />
              </div>
              <Progress value={(progress?.words_learned || 0) / 10} className="mt-2 sm:mt-3" />
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2">{t('dashboard.goal')}: 1000 {t('dashboard.words')}</p>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{t('dashboard.exercisesDone')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-bold text-accent">{progress?.exercises_completed || 0}</div>
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-accent opacity-50" />
              </div>
              <Progress value={(progress?.exercises_completed || 0) / 5} className="mt-2 sm:mt-3" />
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2">{t('dashboard.goal')}: 500 {t('dashboard.exercises')}</p>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{t('dashboard.currentStreak')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{progress?.streak_days || 0}</div>
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-3 sm:mt-5">{t('dashboard.keepGoing')}</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{t('dashboard.totalMistakes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-bold text-destructive">{mistakes.length}</div>
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-3 sm:mt-5">{t('dashboard.learningOpportunities')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Activity & Progress */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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
                    <Line type="monotone" dataKey="exercises" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="words" stroke="hsl(var(--accent))" strokeWidth={2} />
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
                    <Badge variant="secondary" className="text-xs">AI Analyzed</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {weakSpots.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-green-500" />
                    <p className="text-sm">Great job! No major weak areas detected.</p>
                    <p className="text-xs mt-2">Complete more exercises for detailed analysis</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {weakSpots.map((spot: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
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
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-500 text-sm sm:text-base">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiAnalysis.strengths.map((strength: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-xs sm:text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Recommendations & Mistakes */}
          <div className="space-y-4 sm:space-y-6">
            {/* Activity Log Quick Access */}
            <Card className="glass-luxury border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Your Monthly Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="glass p-3 rounded-lg">
                    <p className="text-muted-foreground text-xs">Streak</p>
                    <p className="text-2xl font-bold text-primary">{progress?.streak_days || 0} 🔥</p>
                  </div>
                  <div className="glass p-3 rounded-lg">
                    <p className="text-muted-foreground text-xs">Active Days</p>
                    <p className="text-2xl font-bold">{weeklyActivity.filter(d => d.exercises > 0 || d.words > 0).length}/7</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full gradient-accent text-white border-0"
                  onClick={() => navigate("/activity-log")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Activity Log
                </Button>
              </CardContent>
            </Card>

            {/* Smart Recommendations */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
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
                      className="w-full p-3 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/30 transition-all text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-primary">
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
                          →
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
                  <CardTitle className="text-xs sm:text-sm">{t('dashboard.mistakeDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
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