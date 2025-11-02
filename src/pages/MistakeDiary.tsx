import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  AlertCircle, 
  BookOpen, 
  CheckCircle2, 
  Filter, 
  Search, 
  TrendingUp,
  Edit,
  Trash2,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { openInNewTab } from "@/utils/contentCache";
import { exportMistakesToPDF } from "@/utils/exportUtils";

interface Mistake {
  id: string;
  type: string;
  content: string;
  correction: string | null;
  explanation: string | null;
  category: string | null;
  created_at: string;
  source?: string | null;
  context?: any;
  resolved?: boolean;
  notes?: string | null;
}

const MistakeDiary = () => {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [autoDetecting, setAutoDetecting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchMistakes();
  }, []);

  const fetchMistakes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("mistakes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMistakes(data || []);
    } catch (error) {
      console.error("Error fetching mistakes:", error);
      toast({
        title: "Error",
        description: "Failed to load mistakes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (id: string, resolved: boolean) => {
    try {
      const { error } = await supabase
        .from("mistakes")
        .update({ resolved })
        .eq("id", id);

      if (error) throw error;

      setMistakes(prev =>
        prev.map(m => (m.id === id ? { ...m, resolved } : m))
      );

      toast({
        title: "Success",
        description: resolved ? "Mistake marked as resolved" : "Marked as unresolved",
      });
    } catch (error) {
      console.error("Error updating mistake:", error);
      toast({
        title: "Error",
        description: "Failed to update mistake",
        variant: "destructive",
      });
    }
  };

  const saveNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from("mistakes")
        .update({ notes: noteText })
        .eq("id", id);

      if (error) throw error;

      setMistakes(prev =>
        prev.map(m => (m.id === id ? { ...m, notes: noteText } : m))
      );

      setEditingNote(null);
      setNoteText("");

      toast({
        title: "Success",
        description: "Note saved successfully",
      });
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };

  const deleteMistake = async (id: string) => {
    try {
      const { error } = await supabase
        .from("mistakes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMistakes(prev => prev.filter(m => m.id !== id));

      toast({
        title: t('success'),
        description: t('diary.mistakeDeleted') || "Mistake deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting mistake:", error);
      toast({
        title: t('error'),
        description: t('diary.deleteFailed') || "Failed to delete mistake",
        variant: "destructive",
      });
    }
  };

  const autoDetectMistakes = async () => {
    setAutoDetecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('error'),
          description: "Please log in to use auto-detection",
          variant: "destructive",
        });
        return;
      }

      // Fetch recent exercises, writing submissions, and conversations
      const [exercisesRes, writingRes, conversationsRes] = await Promise.all([
        supabase.from("exercises").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("writing_submissions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("conversations").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(5)
      ]);

      const textsToAnalyze = [];

      // Add incorrect exercise answers
      if (exercisesRes.data) {
        exercisesRes.data
          .filter(e => e.user_answer && !e.is_correct)
          .forEach(e => textsToAnalyze.push({ text: e.user_answer, source: 'exercise' }));
      }

      // Add writing submissions
      if (writingRes.data) {
        writingRes.data.forEach(w => textsToAnalyze.push({ text: w.original_text, source: 'writing' }));
      }

      // Add conversation messages
      if (conversationsRes.data) {
        conversationsRes.data.forEach(c => {
          if (c.messages && Array.isArray(c.messages)) {
            c.messages
              .filter((m: any) => m.role === 'user' && m.content)
              .forEach((m: any) => textsToAnalyze.push({ text: m.content, source: 'conversation' }));
          }
        });
      }

      if (textsToAnalyze.length === 0) {
        toast({
          title: t('diary.noContentFound') || "No content to analyze",
          description: t('diary.completeExercises') || "Complete some exercises first",
        });
        return;
      }

      // Analyze each text
      let totalDetected = 0;
      for (const item of textsToAnalyze.slice(0, 5)) { // Limit to 5 to avoid rate limits
        try {
          const { data: analysisData, error } = await supabase.functions.invoke('analyze-mistakes', {
            body: { text: item.text, autoStore: true }
          });

          if (!error && analysisData?.mistakes) {
            totalDetected += analysisData.mistakes.length;
          }
        } catch (err) {
          console.error('Error analyzing text:', err);
        }
      }

      if (totalDetected > 0) {
        toast({
          title: t('success'),
          description: `${t('diary.detected') || 'Detected'} ${totalDetected} ${t('diary.newMistakes') || 'new mistake(s)'}!`,
        });
        fetchMistakes(); // Refresh the list
      } else {
        toast({
          title: t('diary.noNewMistakes') || "No new mistakes detected",
          description: t('diary.greatJob') || "Great job! Keep practicing!",
        });
      }
    } catch (error) {
      console.error('Auto-detection error:', error);
      toast({
        title: t('error'),
        description: t('diary.autoDetectFailed') || "Failed to auto-detect mistakes",
        variant: "destructive",
      });
    } finally {
      setAutoDetecting(false);
    }
  };

  const filteredMistakes = mistakes.filter((mistake) => {
    const matchesFilter = filter === "all" || mistake.category === filter;
    const matchesSearch = searchQuery === "" || 
      mistake.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mistake.correction?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mistake.explanation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesResolved = showResolved ? true : !mistake.resolved;
    
    return matchesFilter && matchesSearch && matchesResolved;
  });

  const categories = Array.from(new Set(mistakes.map((m) => m.category).filter(Boolean)));
  
  const mistakeStats = {
    total: mistakes.length,
    resolved: mistakes.filter(m => m.resolved).length,
    byCategory: categories.reduce((acc, cat) => {
      acc[cat!] = mistakes.filter(m => m.category === cat).length;
      return acc;
    }, {} as Record<string, number>),
    byType: mistakes.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('diary.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('diary.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={autoDetectMistakes}
            disabled={autoDetecting}
            className="glass hover:glow"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {autoDetecting ? t('diary.autoDetecting') : t('diary.autoDetect') || 'Auto-Detect'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMistakesToPDF(mistakes)}
          >
            {t('diary.exportPDF')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openInNewTab('/mistake-diary')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {t('diary.openNewTab')}
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('diary.totalMistakes')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mistakeStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('diary.resolved')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mistakeStats.resolved}</div>
            <p className="text-xs text-muted-foreground">
              {mistakeStats.total > 0 ? Math.round((mistakeStats.resolved / mistakeStats.total) * 100) : 0}% {t('diary.completion')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('diary.active')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mistakeStats.total - mistakeStats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('diary.categories')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('diary.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showResolved ? "default" : "outline"}
                size="sm"
                onClick={() => setShowResolved(!showResolved)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showResolved ? t('diary.showAll') : t('diary.showResolved')}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              {t('diary.all')}
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={filter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(category!)}
              >
                {category} ({mistakeStats.byCategory[category!]})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mistakes List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">{t('diary.listView')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('diary.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredMistakes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t('diary.noMistakes')}</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? t('diary.tryAdjusting') : t('diary.keepPracticing')}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMistakes.map((mistake) => (
              <Card key={mistake.id} className={mistake.resolved ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{mistake.type}</Badge>
                        <Badge variant="secondary">{mistake.category || "General"}</Badge>
                        {mistake.resolved && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t('diary.resolved')}
                          </Badge>
                        )}
                        {mistake.source && (
                          <Badge variant="outline" className="text-xs">
                            {mistake.source}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{t('diary.yourText')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{mistake.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsResolved(mistake.id, !mistake.resolved)}
                      >
                        {mistake.resolved ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMistake(mistake.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mistake.correction && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{t('diary.correction')}</h4>
                      <p className="text-sm text-green-600 dark:text-green-400">{mistake.correction}</p>
                    </div>
                  )}
                  {mistake.explanation && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{t('diary.explanation')}</h4>
                      <p className="text-sm">{mistake.explanation}</p>
                    </div>
                  )}
                  {mistake.context && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{t('diary.context')}</h4>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(mistake.context, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingNote(mistake.id);
                            setNoteText(mistake.notes || "");
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {mistake.notes ? t('diary.editNote') : t('diary.addNote')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-luxury">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">
                            {mistake.notes ? t('diary.editNote') : t('diary.addNote')}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder={t('diary.notePlaceholder')}
                            rows={4}
                          />
                          <Button onClick={() => saveNote(mistake.id)}>
                            {t('diary.saveNote')}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {mistake.notes && (
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-sm italic">{mistake.notes}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(mistake.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('diary.mistakesByType')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(mistakeStats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(count / mistakeStats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('diary.mistakesByCategory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(mistakeStats.byCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary"
                            style={{ width: `${(count / mistakeStats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MistakeDiary;