import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare, Target, Brain, TrendingUp, AlertCircle, CheckCircle2, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

      // Get AI analysis
      if (mistakesData && mistakesData.length > 0) {
        const { data: analysisData } = await supabase.functions.invoke('analyze-progress', {
          body: { mistakes: mistakesData, progress: progressData }
        });
        if (analysisData) {
          setAiAnalysis(analysisData);
        }
      }

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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient">{t('dashboard.title')}</h1>
          {aiAnalysis?.overallAssessment && (
            <Card className="glass px-3 py-2 w-full sm:max-w-md">
              <p className="text-xs sm:text-sm text-muted-foreground">{aiAnalysis.overallAssessment}</p>
            </Card>
          )}
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

            {/* Weak Spots Analysis */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                  {t('dashboard.weakSpots')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weakSpots.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-green-500" />
                    <p className="text-sm">{t('dashboard.noWeakSpots')}</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {weakSpots.map((spot: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-start sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium capitalize text-sm sm:text-base truncate">{spot.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{spot.recommendation}</p>
                          </div>
                          <Badge variant="destructive" className="text-xs shrink-0">
                            {spot.severity}/10
                          </Badge>
                        </div>
                        <Progress value={spot.severity * 10} className="h-1.5 sm:h-2" />
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
            {/* Recommendations */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  {t('dashboard.recommendations')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                {(aiAnalysis?.nextSteps || recommendations).slice(0, 4).map((rec: any, idx: number) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start glass hover:glow text-left h-auto py-2 px-3"
                    onClick={() => rec.path && navigate(rec.path)}
                  >
                    {rec.icon && <rec.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />}
                    <span className="flex-1 text-xs sm:text-sm">{rec.text || rec}</span>
                  </Button>
                ))}
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