import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Bot,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface EdgeFunction {
  name: string;
  description: string;
  category: 'ai' | 'payment' | 'utility' | 'content' | 'monitoring';
}

const EDGE_FUNCTIONS: EdgeFunction[] = [
  { name: 'analyze-mistakes', description: 'Analyze user mistakes with AI', category: 'ai' },
  { name: 'analyze-progress', description: 'Generate progress insights', category: 'ai' },
  { name: 'analyze-pronunciation', description: 'Speech analysis', category: 'ai' },
  { name: 'analyze-translation', description: 'Translation quality check', category: 'ai' },
  { name: 'analyze-word', description: 'Deep word analysis', category: 'ai' },
  { name: 'conversation', description: 'AI conversation partner', category: 'ai' },
  { name: 'course-ai-tutor', description: 'Course tutoring AI', category: 'ai' },
  { name: 'evaluate-telc-answer', description: 'TELC answer evaluation', category: 'ai' },
  { name: 'explain-word-association', description: 'Word association explanations', category: 'ai' },
  { name: 'generate-daily-lesson', description: 'Daily lesson generation', category: 'content' },
  { name: 'generate-exercise', description: 'Exercise generation', category: 'content' },
  { name: 'generate-gap-fill', description: 'Gap fill exercise creation', category: 'content' },
  { name: 'generate-memorizer', description: 'Memorization content', category: 'content' },
  { name: 'generate-sentence', description: 'Sentence examples', category: 'content' },
  { name: 'generate-smart-exercises', description: 'Adaptive exercises', category: 'content' },
  { name: 'generate-telc-exam', description: 'TELC exam generation', category: 'content' },
  { name: 'generate-vocab-image', description: 'Vocabulary images', category: 'content' },
  { name: 'generate-vocabulary', description: 'Vocabulary content', category: 'content' },
  { name: 'generate-word-association', description: 'Word associations', category: 'content' },
  { name: 'generate-word-association-dynamic', description: 'Dynamic associations', category: 'content' },
  { name: 'highlight-text', description: 'Text highlighting analysis', category: 'ai' },
  { name: 'score-telc-section', description: 'TELC scoring', category: 'ai' },
  { name: 'writing-assistant', description: 'Writing correction AI', category: 'ai' },
  { name: 'check-subscription', description: 'Subscription verification', category: 'payment' },
  { name: 'create-checkout', description: 'Stripe checkout', category: 'payment' },
  { name: 'customer-portal', description: 'Stripe portal', category: 'payment' },
  { name: 'gemini-tts', description: 'Gemini text-to-speech', category: 'utility' },
  { name: 'text-to-speech', description: 'ElevenLabs TTS', category: 'utility' },
  { name: 'speech-to-text', description: 'Speech recognition', category: 'utility' },
  { name: 'generate-certificate', description: 'Certificate generation', category: 'utility' },
  { name: 'check-achievements', description: 'Achievement checking', category: 'utility' },
  { name: 'send-alert-email', description: 'Alert emails', category: 'monitoring' },
  { name: 'ai-monitor-agent', description: 'AI monitoring agent', category: 'monitoring' },
  { name: 'telc-practice-helper', description: 'TELC practice helper', category: 'ai' },
];

export default function AdminAIControls() {
  const [loading, setLoading] = useState(true);
  const [functionStats, setFunctionStats] = useState<Record<string, { calls: number; errors: number }>>({});
  const [testingFunction, setTestingFunction] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; time: number; error?: string }>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    // In a real implementation, you'd fetch actual function invocation stats
    // For now, we'll simulate some data
    const stats: Record<string, { calls: number; errors: number }> = {};
    EDGE_FUNCTIONS.forEach(fn => {
      stats[fn.name] = {
        calls: Math.floor(Math.random() * 1000),
        errors: Math.floor(Math.random() * 10),
      };
    });
    setFunctionStats(stats);
    setLoading(false);
  };

  const testFunction = async (functionName: string) => {
    setTestingFunction(functionName);
    const startTime = Date.now();
    try {
      // For AI functions, we need to provide some basic test input
      const testPayloads: Record<string, any> = {
        'check-subscription': {},
        'ai-monitor-agent': { check: 'health' },
      };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: testPayloads[functionName] || {},
      });

      const time = Date.now() - startTime;

      if (error) {
        setTestResults(prev => ({
          ...prev,
          [functionName]: { success: false, time, error: error.message },
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [functionName]: { success: true, time },
        }));
        toast({ title: 'Function test passed', description: `${functionName} responded in ${time}ms` });
      }
    } catch (error) {
      const time = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        [functionName]: { success: false, time, error: error instanceof Error ? error.message : 'Unknown error' },
      }));
    } finally {
      setTestingFunction(null);
    }
  };

  const categoryColors: Record<string, string> = {
    ai: 'bg-purple-500/10 text-purple-500',
    payment: 'bg-green-500/10 text-green-500',
    utility: 'bg-blue-500/10 text-blue-500',
    content: 'bg-amber-500/10 text-amber-500',
    monitoring: 'bg-red-500/10 text-red-500',
  };

  const groupedFunctions = EDGE_FUNCTIONS.reduce((acc, fn) => {
    if (!acc[fn.category]) acc[fn.category] = [];
    acc[fn.category].push(fn);
    return acc;
  }, {} as Record<string, EdgeFunction[]>);

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

  const totalCalls = Object.values(functionStats).reduce((sum, s) => sum + s.calls, 0);
  const totalErrors = Object.values(functionStats).reduce((sum, s) => sum + s.errors, 0);
  const errorRate = totalCalls > 0 ? ((totalErrors / totalCalls) * 100).toFixed(2) : '0';

  return (
    <AdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{EDGE_FUNCTIONS.length}</p>
                <p className="text-sm text-muted-foreground">Edge Functions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCalls.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Invocations</p>
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
                <p className="text-2xl font-bold">{totalErrors}</p>
                <p className="text-sm text-muted-foreground">Total Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{errorRate}%</p>
                <p className="text-sm text-muted-foreground">Error Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Functions by Category */}
      <Tabs defaultValue="ai">
        <TabsList className="mb-6">
          <TabsTrigger value="ai">AI Functions ({groupedFunctions.ai?.length || 0})</TabsTrigger>
          <TabsTrigger value="content">Content ({groupedFunctions.content?.length || 0})</TabsTrigger>
          <TabsTrigger value="payment">Payment ({groupedFunctions.payment?.length || 0})</TabsTrigger>
          <TabsTrigger value="utility">Utility ({groupedFunctions.utility?.length || 0})</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring ({groupedFunctions.monitoring?.length || 0})</TabsTrigger>
        </TabsList>

        {Object.entries(groupedFunctions).map(([category, functions]) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{category} Functions</CardTitle>
                <CardDescription>Manage and test {category} edge functions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {functions.map((fn) => {
                      const stats = functionStats[fn.name] || { calls: 0, errors: 0 };
                      const testResult = testResults[fn.name];
                      return (
                        <div
                          key={fn.name}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-sm font-mono font-medium">{fn.name}</code>
                                <Badge className={categoryColors[fn.category]}>
                                  {fn.category}
                                </Badge>
                                {testResult && (
                                  <Badge variant={testResult.success ? 'default' : 'destructive'}>
                                    {testResult.success ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                    {testResult.time}ms
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{fn.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  {stats.calls} calls
                                </span>
                                <span className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {stats.errors} errors
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testFunction(fn.name)}
                              disabled={testingFunction === fn.name}
                            >
                              {testingFunction === fn.name ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {testResult?.error && (
                            <div className="mt-2 p-2 bg-red-500/10 rounded text-sm text-red-500">
                              {testResult.error}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </AdminLayout>
  );
}
