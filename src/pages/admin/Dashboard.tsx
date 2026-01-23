import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  CreditCard,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Activity,
  Zap,
  CheckCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  Bot,
  Settings,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  activeSubscriptions: number;
  pendingAlerts: number;
  totalVocabulary: number;
  totalExercises: number;
}

interface DailyActivity {
  date: string;
  exercises: number;
  words: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityData, setActivityData] = useState<DailyActivity[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<{ name: string; value: number }[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<'ok' | 'warning' | 'critical'>('ok');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all stats in parallel
        const [
          usersRes,
          activityRes,
          subscriptionsRes,
          alertsRes,
          vocabRes,
          exercisesRes,
          tiersRes,
          metricsRes,
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase
            .from('daily_activity')
            .select('activity_date, exercises_completed, words_learned')
            .gte('activity_date', format(subDays(new Date(), 14), 'yyyy-MM-dd'))
            .order('activity_date'),
          supabase.from('user_subscriptions').select('status, tier_id').eq('status', 'active'),
          supabase.from('system_alerts').select('*').eq('acknowledged', false).order('created_at', { ascending: false }).limit(5),
          supabase.from('vocabulary_items').select('id', { count: 'exact', head: true }),
          supabase.from('exercises').select('id', { count: 'exact', head: true }),
          supabase.from('subscription_tiers').select('id, name'),
          supabase.from('server_metrics').select('*').order('timestamp', { ascending: false }).limit(10),
        ]);

        // Get unique active users today
        const today = format(new Date(), 'yyyy-MM-dd');
        const { count: activeToday } = await supabase
          .from('daily_activity')
          .select('user_id', { count: 'exact', head: true })
          .eq('activity_date', today);

        setStats({
          totalUsers: usersRes.count || 0,
          activeToday: activeToday || 0,
          activeSubscriptions: subscriptionsRes.data?.length || 0,
          pendingAlerts: alertsRes.data?.length || 0,
          totalVocabulary: vocabRes.count || 0,
          totalExercises: exercisesRes.count || 0,
        });

        // Process activity data for chart
        const activityMap = new Map<string, { exercises: number; words: number }>();
        activityRes.data?.forEach((item) => {
          const existing = activityMap.get(item.activity_date) || { exercises: 0, words: 0 };
          activityMap.set(item.activity_date, {
            exercises: existing.exercises + (item.exercises_completed || 0),
            words: existing.words + (item.words_learned || 0),
          });
        });

        const chartData: DailyActivity[] = [];
        for (let i = 13; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
          const data = activityMap.get(date) || { exercises: 0, words: 0 };
          chartData.push({
            date: format(new Date(date), 'MMM dd'),
            exercises: data.exercises,
            words: data.words,
          });
        }
        setActivityData(chartData);

        // Process subscription distribution
        const tierCounts = new Map<string, number>();
        subscriptionsRes.data?.forEach((sub) => {
          const tierName = tiersRes.data?.find(t => t.id === sub.tier_id)?.name || 'Unknown';
          tierCounts.set(tierName, (tierCounts.get(tierName) || 0) + 1);
        });
        const freeUsers = (usersRes.count || 0) - (subscriptionsRes.data?.length || 0);
        setSubscriptionData([
          { name: 'Free', value: freeUsers },
          ...Array.from(tierCounts.entries()).map(([name, value]) => ({ name, value })),
        ]);

        setRecentAlerts(alertsRes.data || []);

        // Determine system health
        const hasErrors = metricsRes.data?.some(m => m.metric_type === 'error_rate' && Number(m.metric_value) > 5);
        const hasCriticalAlerts = alertsRes.data?.some(a => a.severity === 'critical');
        if (hasCriticalAlerts) {
          setSystemHealth('critical');
        } else if (hasErrors) {
          setSystemHealth('warning');
        } else {
          setSystemHealth('ok');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['hsl(var(--muted))', 'hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  const severityColors = {
    low: 'bg-blue-500/10 text-blue-500',
    medium: 'bg-yellow-500/10 text-yellow-500',
    high: 'bg-orange-500/10 text-orange-500',
    critical: 'bg-red-500/10 text-red-500',
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardContent className="pt-6"><Skeleton className="h-64" /></CardContent></Card>
          <Card><CardContent className="pt-6"><Skeleton className="h-64" /></CardContent></Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* System Health Banner */}
      <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
        systemHealth === 'ok' ? 'bg-green-500/10 text-green-500' :
        systemHealth === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
        'bg-red-500/10 text-red-500'
      }`}>
        <div className="flex items-center gap-3">
          {systemHealth === 'ok' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          <span className="font-medium">
            System Status: {systemHealth === 'ok' ? 'All Systems Operational' : systemHealth === 'warning' ? 'Minor Issues Detected' : 'Critical Issues Require Attention'}
          </span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/alerts">View Details</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">{stats?.activeToday || 0}</span> active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats?.activeSubscriptions || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vocabulary</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVocabulary || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalExercises || 0} exercises completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingAlerts || 0}</div>
            <Button variant="link" className="p-0 h-auto text-xs" asChild>
              <Link to="/admin/alerts">View all <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Platform Activity (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
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
                  <Line type="monotone" dataKey="exercises" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="words" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>Exercises</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span>Words Learned</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
              {subscriptionData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Unacknowledged system alerts</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>No pending alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Badge className={severityColors[alert.severity as keyof typeof severityColors]}>
                      {alert.severity}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(alert.created_at), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/admin/alerts">View All Alerts</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/users">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/content">
                <BookOpen className="h-4 w-4 mr-2" />
                Edit Content
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/subscriptions">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscriptions
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/ai">
                <Bot className="h-4 w-4 mr-2" />
                AI Functions
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
