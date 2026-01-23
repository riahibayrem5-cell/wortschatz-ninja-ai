import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  RefreshCw,
  Eye,
  CheckCheck,
  XCircle,
  Activity,
  Server,
  CreditCard,
  Users,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Alert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  details: any;
  acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

interface MonitorRun {
  id: string;
  run_type: string;
  status: string;
  checks_performed: number;
  alerts_triggered: number;
  execution_time_ms: number | null;
  details: any;
  created_at: string;
}

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [monitorRuns, setMonitorRuns] = useState<MonitorRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('admin-alerts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_alerts' }, () => {
        fetchAlerts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monitor_runs' }, () => {
        fetchMonitorRuns();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAlerts(), fetchMonitorRuns()]);
    setLoading(false);
  };

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('system_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setAlerts((data as Alert[]) || []);
  };

  const fetchMonitorRuns = async () => {
    const { data } = await supabase
      .from('monitor_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setMonitorRuns((data as MonitorRun[]) || []);
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('system_alerts')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user?.id,
        })
        .eq('id', alertId);

      toast({ title: 'Alert acknowledged' });
      fetchAlerts();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to acknowledge alert', variant: 'destructive' });
    }
  };

  const acknowledgeAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('system_alerts')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user?.id,
        })
        .eq('acknowledged', false);

      toast({ title: 'All alerts acknowledged' });
      fetchAlerts();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to acknowledge alerts', variant: 'destructive' });
    }
  };

  const runManualCheck = async (checkType: string) => {
    setRunningCheck(checkType);
    try {
      const { data, error } = await supabase.functions.invoke('ai-monitor-agent', {
        body: { check: checkType },
      });

      if (error) throw error;

      toast({
        title: 'Check Complete',
        description: `${checkType} check finished. ${data.alertsTriggered} alerts triggered.`,
      });

      fetchData();
    } catch (error) {
      console.error('Error running check:', error);
      toast({ title: 'Error', description: 'Failed to run check', variant: 'destructive' });
    } finally {
      setRunningCheck(null);
    }
  };

  const severityConfig = {
    low: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Activity },
    medium: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: AlertTriangle },
    high: { color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: AlertTriangle },
    critical: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
  };

  const alertTypeIcons: Record<string, React.ComponentType<any>> = {
    server_health: Server,
    payment: CreditCard,
    user_activity: Users,
    high_error_rate: AlertTriangle,
  };

  const pendingAlerts = alerts.filter(a => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.acknowledged);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-500">{pendingAlerts.filter(a => a.severity === 'critical').length}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-500">{pendingAlerts.filter(a => a.severity === 'high').length}</p>
                <p className="text-sm text-muted-foreground">High</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-500">{pendingAlerts.filter(a => a.severity === 'medium').length}</p>
                <p className="text-sm text-muted-foreground">Medium</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-500">{pendingAlerts.filter(a => a.severity === 'low').length}</p>
                <p className="text-sm text-muted-foreground">Low</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Checks */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Manual Checks
          </CardTitle>
          <CardDescription>Run health checks manually</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {['health', 'activity', 'payment', 'full'].map((check) => (
              <Button
                key={check}
                variant="outline"
                onClick={() => runManualCheck(check)}
                disabled={runningCheck !== null}
              >
                {runningCheck === check ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {check.charAt(0).toUpperCase() + check.slice(1)} Check
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    System Alerts
                  </CardTitle>
                  <CardDescription>{pendingAlerts.length} pending alerts</CardDescription>
                </div>
                {pendingAlerts.length > 0 && (
                  <Button variant="outline" size="sm" onClick={acknowledgeAll}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Acknowledge All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                  <TabsTrigger value="pending">
                    Pending ({pendingAlerts.length})
                  </TabsTrigger>
                  <TabsTrigger value="acknowledged">
                    Acknowledged ({acknowledgedAlerts.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  <ScrollArea className="h-[500px]">
                    {pendingAlerts.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                        <p className="text-lg font-medium">All Clear!</p>
                        <p className="text-sm">No pending alerts</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingAlerts.map((alert) => {
                          const config = severityConfig[alert.severity];
                          const Icon = alertTypeIcons[alert.alert_type] || AlertTriangle;
                          return (
                            <div
                              key={alert.id}
                              className={`p-4 rounded-lg border ${config.color}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <Icon className="h-5 w-5 mt-0.5" />
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className={config.color}>
                                        {alert.severity}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                                      </span>
                                    </div>
                                    <p className="font-medium">{alert.title}</p>
                                    {alert.details && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {typeof alert.details === 'string' ? alert.details : JSON.stringify(alert.details)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => acknowledgeAlert(alert.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="acknowledged">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {acknowledgedAlerts.map((alert) => {
                        const config = severityConfig[alert.severity];
                        return (
                          <div
                            key={alert.id}
                            className="p-4 rounded-lg border bg-muted/30 opacity-60"
                          >
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className={config.color}>
                                    {alert.severity}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(alert.created_at), 'MMM dd, HH:mm')}
                                  </span>
                                </div>
                                <p className="font-medium">{alert.title}</p>
                                {alert.acknowledged_at && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Acknowledged {formatDistanceToNow(new Date(alert.acknowledged_at), { addSuffix: true })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Monitor Runs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Monitor Runs
            </CardTitle>
            <CardDescription>Last 50 automated checks</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[550px]">
              <div className="space-y-3">
                {monitorRuns.map((run) => (
                  <div key={run.id} className="p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={run.status === 'success' ? 'default' : 'destructive'}>
                        {run.run_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {run.checks_performed} checks
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {run.alerts_triggered} alerts
                      </span>
                      {run.execution_time_ms && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {run.execution_time_ms}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
