import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  TrendingUp,
  Users,
  Crown,
  Calendar,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface Subscription {
  id: string;
  user_id: string;
  tier_id: string;
  status: string;
  is_permanent: boolean;
  started_at: string;
  expires_at: string | null;
  user_email?: string;
  tier_name?: string;
  tier_price?: number;
}

interface Tier {
  id: string;
  name: string;
  price_tnd: number;
  features: string[];
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, tiersRes, profilesRes] = await Promise.all([
        supabase.from('user_subscriptions').select('*').order('started_at', { ascending: false }),
        supabase.from('subscription_tiers').select('*'),
        supabase.from('profiles').select('id, email'),
      ]);

      const tiersData = (tiersRes.data as Tier[]) || [];
      setTiers(tiersData);

      const enrichedSubs = (subsRes.data || []).map(sub => ({
        ...sub,
        user_email: profilesRes.data?.find(p => p.id === sub.user_id)?.email,
        tier_name: tiersData.find(t => t.id === sub.tier_id)?.name,
        tier_price: tiersData.find(t => t.id === sub.tier_id)?.price_tnd,
      }));

      setSubscriptions(enrichedSubs);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({ title: 'Error', description: 'Failed to fetch subscriptions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const expiringSubscriptions = activeSubscriptions.filter(s => {
    if (!s.expires_at || s.is_permanent) return false;
    return differenceInDays(new Date(s.expires_at), new Date()) <= 7;
  });

  // Calculate MRR (Monthly Recurring Revenue)
  const mrr = activeSubscriptions.reduce((sum, sub) => {
    return sum + (sub.tier_price || 0);
  }, 0);

  // Subscription distribution by tier
  const tierDistribution = tiers.map(tier => ({
    name: tier.name,
    value: activeSubscriptions.filter(s => s.tier_id === tier.id).length,
    price: tier.price_tnd,
  }));

  // Status distribution
  const statusDistribution = [
    { name: 'Active', value: subscriptions.filter(s => s.status === 'active').length },
    { name: 'Cancelled', value: subscriptions.filter(s => s.status === 'cancelled').length },
    { name: 'Expired', value: subscriptions.filter(s => s.status === 'expired').length },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

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
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mrr.toFixed(2)} TND</p>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiringSubscriptions.length}</p>
                <p className="text-sm text-muted-foreground">Expiring Soon (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'cancelled').length}</p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Subscription Tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Tiers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subscription Tiers</CardTitle>
          <CardDescription>Available subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <div key={tier.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{tier.name}</h3>
                  <Badge variant="secondary">{tier.price_tnd} TND/mo</Badge>
                </div>
                <ul className="space-y-2">
                  {(tier.features as string[]).slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-muted-foreground">
                  {activeSubscriptions.filter(s => s.tier_id === tier.id).length} subscribers
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>Manage user subscriptions</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => {
                  const isExpiringSoon = sub.expires_at && !sub.is_permanent &&
                    differenceInDays(new Date(sub.expires_at), new Date()) <= 7;
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.user_email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <Crown className="h-3 w-3" />
                          {sub.tier_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={sub.status === 'active' ? 'default' : 'secondary'}
                          className={
                            sub.status === 'active' ? 'bg-green-500' :
                            sub.status === 'cancelled' ? 'bg-red-500' : ''
                          }
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(sub.started_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {sub.is_permanent ? (
                          <Badge variant="outline">Permanent</Badge>
                        ) : sub.expires_at ? (
                          <span className={isExpiringSoon ? 'text-amber-500 font-medium' : ''}>
                            {format(new Date(sub.expires_at), 'MMM dd, yyyy')}
                            {isExpiringSoon && ' ⚠️'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
