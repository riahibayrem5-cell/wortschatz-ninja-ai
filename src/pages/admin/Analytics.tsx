import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  MessageSquare,
  Pencil,
  Target,
  Calendar,
  Clock,
  Flame,
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DailyStats {
  date: string;
  users: number;
  exercises: number;
  words: number;
  conversations: number;
  writing: number;
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('14');
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [totals, setTotals] = useState({
    totalUsers: 0,
    totalExercises: 0,
    totalWords: 0,
    totalConversations: 0,
    avgStreak: 0,
    avgExercisesPerUser: 0,
  });
  const [featureUsage, setFeatureUsage] = useState<{ name: string; value: number }[]>([]);
  const [telcStats, setTelcStats] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = format(subDays(new Date(), parseInt(timeRange)), 'yyyy-MM-dd');

      // Fetch all data in parallel
      const [
        activityRes,
        usersRes,
        progressRes,
        vocabRes,
        exercisesRes,
        conversationsRes,
        writingRes,
        telcRes,
      ] = await Promise.all([
        supabase.from('daily_activity').select('*').gte('activity_date', startDate),
        supabase.from('profiles').select('id, created_at'),
        supabase.from('user_progress').select('streak_days, exercises_completed, words_learned'),
        supabase.from('vocabulary_items').select('id', { count: 'exact', head: true }),
        supabase.from('exercises').select('id', { count: 'exact', head: true }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
        supabase.from('writing_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('telc_section_scores').select('section, score, max_score'),
      ]);

      // Process daily stats
      const dailyMap = new Map<string, DailyStats>();
      for (let i = parseInt(timeRange) - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyMap.set(date, {
          date: format(new Date(date), 'MMM dd'),
          users: 0,
          exercises: 0,
          words: 0,
          conversations: 0,
          writing: 0,
        });
      }

      // Count unique users per day and aggregate activity
      const usersByDate = new Map<string, Set<string>>();
      activityRes.data?.forEach((activity) => {
        const date = activity.activity_date;
        if (dailyMap.has(date)) {
          const stats = dailyMap.get(date)!;
          stats.exercises += activity.exercises_completed || 0;
          stats.words += activity.words_learned || 0;
          stats.conversations += activity.conversations_count || 0;
          stats.writing += activity.writing_submissions_count || 0;
          
          if (!usersByDate.has(date)) usersByDate.set(date, new Set());
          usersByDate.get(date)!.add(activity.user_id);
        }
      });

      usersByDate.forEach((users, date) => {
        if (dailyMap.has(date)) {
          dailyMap.get(date)!.users = users.size;
        }
      });

      setDailyStats(Array.from(dailyMap.values()));

      // Calculate totals
      const totalUsers = usersRes.data?.length || 0;
      const totalExercises = exercisesRes.count || 0;
      const totalWords = vocabRes.count || 0;
      const totalConversations = conversationsRes.count || 0;
      
      const streaks = progressRes.data?.map(p => p.streak_days) || [];
      const avgStreak = streaks.length > 0 ? streaks.reduce((a, b) => a + b, 0) / streaks.length : 0;
      const avgExercisesPerUser = totalUsers > 0 ? totalExercises / totalUsers : 0;

      setTotals({
        totalUsers,
        totalExercises,
        totalWords,
        totalConversations,
        avgStreak: Math.round(avgStreak * 10) / 10,
        avgExercisesPerUser: Math.round(avgExercisesPerUser * 10) / 10,
      });

      // Feature usage
      setFeatureUsage([
        { name: 'Vocabulary', value: vocabRes.count || 0 },
        { name: 'Exercises', value: exercisesRes.count || 0 },
        { name: 'Conversations', value: conversationsRes.count || 0 },
        { name: 'Writing', value: writingRes.count || 0 },
      ]);

      // TELC stats by section
      const telcBySection = new Map<string, { totalScore: number; totalMax: number; count: number }>();
      telcRes.data?.forEach((score) => {
        const existing = telcBySection.get(score.section) || { totalScore: 0, totalMax: 0, count: 0 };
        telcBySection.set(score.section, {
          totalScore: existing.totalScore + score.score,
          totalMax: existing.totalMax + score.max_score,
          count: existing.count + 1,
        });
      });

      setTelcStats(
        Array.from(telcBySection.entries()).map(([section, data]) => ({
          section,
          avgScore: Math.round((data.totalScore / data.count) * 10) / 10,
          avgPercent: Math.round((data.totalScore / data.totalMax) * 100),
          attempts: data.count,
        }))
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Time Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Platform Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.totalExercises}</p>
                <p className="text-sm text-muted-foreground">Exercises Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Flame className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.avgStreak}</p>
                <p className="text-sm text-muted-foreground">Avg Streak (days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.avgExercisesPerUser}</p>
                <p className="text-sm text-muted-foreground">Exercises/User</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="activity">Daily Activity</TabsTrigger>
          <TabsTrigger value="users">User Engagement</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="telc">TELC Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exercises & Words Learned</CardTitle>
                <CardDescription>Daily learning activity trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="exercises"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="words"
                        stackId="2"
                        stroke="hsl(var(--secondary))"
                        fill="hsl(var(--secondary))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversations & Writing</CardTitle>
                <CardDescription>Communication practice trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="conversations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="writing" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Daily Active Users</CardTitle>
              <CardDescription>Unique users with activity per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Distribution</CardTitle>
                <CardDescription>Total usage by feature</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={featureUsage}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {featureUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Breakdown</CardTitle>
                <CardDescription>Detailed feature statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featureUsage.map((feature, index) => (
                    <div key={feature.name} className="flex items-center gap-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{feature.name}</span>
                          <span className="text-muted-foreground">{feature.value.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(feature.value / Math.max(...featureUsage.map(f => f.value))) * 100}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="telc">
          <Card>
            <CardHeader>
              <CardTitle>TELC Exam Performance</CardTitle>
              <CardDescription>Average scores by section</CardDescription>
            </CardHeader>
            <CardContent>
              {telcStats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3" />
                  <p>No TELC exam data yet</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={telcStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="section" type="category" width={120} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Avg Score']}
                      />
                      <Bar dataKey="avgPercent" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
