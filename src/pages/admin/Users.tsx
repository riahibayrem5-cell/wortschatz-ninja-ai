import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  MoreVertical,
  Crown,
  Eye,
  Ban,
  Gift,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Flame,
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  created_at: string;
  progress?: {
    streak_days: number;
    words_learned: number;
    exercises_completed: number;
  };
  subscription?: {
    status: string;
    tier_name: string;
    expires_at: string | null;
  };
  settings?: {
    display_name: string | null;
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [grantTier, setGrantTier] = useState<string>('');
  const [grantDays, setGrantDays] = useState('30');
  const [tiers, setTiers] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  const pageSize = 20;

  useEffect(() => {
    fetchUsers();
    fetchTiers();
  }, [page, filterStatus]);

  const fetchTiers = async () => {
    const { data } = await supabase.from('subscription_tiers').select('id, name');
    setTiers(data || []);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get total count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      setTotalUsers(count || 0);

      // Get profiles with pagination
      let query = supabase
        .from('profiles')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (searchQuery) {
        query = query.ilike('email', `%${searchQuery}%`);
      }

      const { data: profiles, error } = await query;
      if (error) throw error;

      if (!profiles) {
        setUsers([]);
        return;
      }

      // Fetch related data for each user
      const userIds = profiles.map(p => p.id);

      const [progressRes, subscriptionsRes, settingsRes] = await Promise.all([
        supabase.from('user_progress').select('user_id, streak_days, words_learned, exercises_completed').in('user_id', userIds),
        supabase.from('user_subscriptions').select('user_id, status, tier_id, expires_at').in('user_id', userIds),
        supabase.from('user_settings').select('user_id, display_name').in('user_id', userIds),
      ]);

      const enrichedUsers = profiles.map(profile => {
        const progress = progressRes.data?.find(p => p.user_id === profile.id);
        const subscription = subscriptionsRes.data?.find(s => s.user_id === profile.id);
        const settings = settingsRes.data?.find(s => s.user_id === profile.id);

        return {
          ...profile,
          progress: progress ? {
            streak_days: progress.streak_days,
            words_learned: progress.words_learned,
            exercises_completed: progress.exercises_completed,
          } : undefined,
          subscription: subscription ? {
            status: subscription.status,
            tier_name: tiers.find(t => t.id === subscription.tier_id)?.name || 'Unknown',
            expires_at: subscription.expires_at,
          } : undefined,
          settings: settings ? {
            display_name: settings.display_name,
          } : undefined,
        };
      });

      // Filter by subscription status
      let filteredUsers = enrichedUsers;
      if (filterStatus === 'premium') {
        filteredUsers = enrichedUsers.filter(u => u.subscription?.status === 'active');
      } else if (filterStatus === 'free') {
        filteredUsers = enrichedUsers.filter(u => !u.subscription || u.subscription.status !== 'active');
      }

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleGrantPremium = async () => {
    if (!selectedUser || !grantTier) return;

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(grantDays));

      // Check if user already has subscription
      const { data: existing } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', selectedUser.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_subscriptions')
          .update({
            tier_id: grantTier,
            status: 'active',
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', selectedUser.id);
      } else {
        await supabase
          .from('user_subscriptions')
          .insert({
            user_id: selectedUser.id,
            tier_id: grantTier,
            status: 'active',
            expires_at: expiresAt.toISOString(),
          });
      }

      // Log the action
      await supabase.from('admin_audit_log').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'grant_premium',
        target_type: 'user',
        target_id: selectedUser.id,
        details: { tier_id: grantTier, days: parseInt(grantDays) },
      });

      toast({
        title: 'Premium Granted',
        description: `Premium access granted to ${selectedUser.email} for ${grantDays} days`,
      });

      setShowGrantDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error granting premium:', error);
      toast({
        title: 'Error',
        description: 'Failed to grant premium access',
        variant: 'destructive',
      });
    }
  };

  const handleRevokePremium = async (user: User) => {
    try {
      await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      await supabase.from('admin_audit_log').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'revoke_premium',
        target_type: 'user',
        target_id: user.id,
      });

      toast({
        title: 'Premium Revoked',
        description: `Premium access revoked for ${user.email}`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error revoking premium:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke premium access',
        variant: 'destructive',
      });
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Email', 'Display Name', 'Subscription', 'Streak', 'Words Learned', 'Joined'],
      ...users.map(u => [
        u.email,
        u.settings?.display_name || '',
        u.subscription?.tier_name || 'Free',
        u.progress?.streak_days || 0,
        u.progress?.words_learned || 0,
        format(new Date(u.created_at), 'yyyy-MM-dd'),
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fluentpass-users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <AdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.subscription?.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Premium Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <UserX className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => !u.subscription || u.subscription.status !== 'active').length}</p>
                <p className="text-sm text-muted-foreground">Free Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => (u.progress?.streak_days || 0) >= 7).length}</p>
                <p className="text-sm text-muted-foreground">7+ Day Streaks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} variant="secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportUsers} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage all platform users</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Streak</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead>Exercises</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.settings?.display_name || user.email}</p>
                          {user.settings?.display_name && (
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.subscription?.status === 'active' ? (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                            <Crown className="h-3 w-3 mr-1" />
                            {user.subscription.tier_name}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4 text-orange-500" />
                          {user.progress?.streak_days || 0}
                        </div>
                      </TableCell>
                      <TableCell>{user.progress?.words_learned || 0}</TableCell>
                      <TableCell>{user.progress?.exercises_completed || 0}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowGrantDialog(true); }}>
                              <Gift className="h-4 w-4 mr-2" />
                              Grant Premium
                            </DropdownMenuItem>
                            {user.subscription?.status === 'active' && (
                              <DropdownMenuItem onClick={() => handleRevokePremium(user)} className="text-destructive">
                                <Ban className="h-4 w-4 mr-2" />
                                Revoke Premium
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalUsers)} of {totalUsers}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">Page {page} of {totalPages}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Grant Premium Dialog */}
      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Premium Access</DialogTitle>
            <DialogDescription>
              Grant premium subscription to {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Subscription Tier</label>
              <Select value={grantTier} onValueChange={setGrantTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Duration (days)</label>
              <Input
                type="number"
                value={grantDays}
                onChange={(e) => setGrantDays(e.target.value)}
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGrantDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGrantPremium} disabled={!grantTier}>
              Grant Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
