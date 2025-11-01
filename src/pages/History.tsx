import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Download, 
  FileText, 
  BookOpen, 
  PenTool, 
  MessageSquare,
  Target,
  AlertCircle,
  Loader2,
  FileArchive,
  Eye
} from "lucide-react";
import {
  exportVocabularyToPDF,
  exportExercisesToPDF,
  exportWritingToPDF,
  exportMistakesToPDF,
  exportConversationsToPDF,
  exportToAnki,
  exportAllDataToPDF
} from "@/utils/exportUtils";

const History = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [data, setData] = useState({
    vocabulary: [],
    exercises: [],
    writing: [],
    conversations: [],
    mistakes: [],
    memorizer: [],
    progress: null
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ title: "Please log in to view history", variant: "destructive" });
        return;
      }

      // Fetch all data in parallel
      const [
        vocabRes,
        exercisesRes,
        writingRes,
        conversationsRes,
        mistakesRes,
        memorizerRes,
        progressRes
      ] = await Promise.all([
        supabase.from("vocabulary_items").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("exercises").select("*").eq("user_id", session.user.id).order("completed_at", { ascending: false }),
        supabase.from("writing_submissions").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("conversations").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("mistakes").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("memorizer_items").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("user_progress").select("*").eq("user_id", session.user.id).single()
      ]);

      setData({
        vocabulary: vocabRes.data || [],
        exercises: exercisesRes.data || [],
        writing: writingRes.data || [],
        conversations: conversationsRes.data || [],
        mistakes: mistakesRes.data || [],
        memorizer: memorizerRes.data || [],
        progress: progressRes.data
      });
    } catch (error: any) {
      console.error("Error loading history:", error);
      toast({ title: "Error loading history", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: string) => {
    try {
      switch(type) {
        case 'vocabulary-pdf':
          await exportVocabularyToPDF(data.vocabulary);
          break;
        case 'vocabulary-anki':
          exportToAnki(data.vocabulary, 'vocabulary');
          break;
        case 'exercises-pdf':
          await exportExercisesToPDF(data.exercises);
          break;
        case 'writing-pdf':
          await exportWritingToPDF(data.writing);
          break;
        case 'mistakes-pdf':
          await exportMistakesToPDF(data.mistakes);
          break;
        case 'conversations-pdf':
          await exportConversationsToPDF(data.conversations);
          break;
        case 'memorizer-anki':
          exportToAnki(data.memorizer, 'memorizer');
          break;
        case 'all-pdf':
          await exportAllDataToPDF(data);
          break;
        default:
          break;
      }
      toast({ title: "Export successful!", description: "Your file has been downloaded." });
    } catch (error: any) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto p-4 mt-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 text-gradient">Learning History</h1>
          <p className="text-muted-foreground">View and export all your learning data</p>
        </div>

        {/* Export All Card */}
        <Card className="glass mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Export Everything</CardTitle>
                <CardDescription>Download your complete learning history</CardDescription>
              </div>
              <Button 
                onClick={() => handleExport('all-pdf')}
                className="gradient-primary"
                size="lg"
              >
                <FileArchive className="w-4 h-4 mr-2" />
                Export All to PDF
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="vocabulary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 glass">
            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="writing">Writing</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
            <TabsTrigger value="memorizer">Memorizer</TabsTrigger>
          </TabsList>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle>Vocabulary Items</CardTitle>
                      <CardDescription>{data.vocabulary.length} words saved</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleExport('vocabulary-pdf')} variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button onClick={() => handleExport('vocabulary-anki')} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Anki
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.vocabulary.slice(0, 10).map((item: any) => (
                    <div key={item.id} className="p-3 bg-background/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary">{item.word}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{item.definition}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.topic && <Badge variant="secondary">{item.topic}</Badge>}
                          <Button size="sm" variant="ghost" onClick={() => setPreviewItem({ type: 'vocabulary', data: item })}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.vocabulary.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      ...and {data.vocabulary.length - 10} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle>Exercise History</CardTitle>
                      <CardDescription>{data.exercises.length} exercises completed</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => handleExport('exercises-pdf')} variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.exercises.slice(0, 10).map((ex: any) => (
                    <div key={ex.id} className="p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={ex.is_correct ? "default" : "destructive"}>
                              {ex.is_correct ? "Correct" : "Incorrect"}
                            </Badge>
                            <span className="text-sm font-medium">{ex.type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(ex.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Writing Tab */}
          <TabsContent value="writing" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PenTool className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle>Writing Submissions</CardTitle>
                      <CardDescription>{data.writing.length} submissions</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => handleExport('writing-pdf')} variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.writing.slice(0, 5).map((sub: any) => (
                    <div key={sub.id} className="p-3 bg-background/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{sub.prompt}</h4>
                        {sub.score && <Badge>{sub.score}/100</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {sub.original_text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle>Conversation History</CardTitle>
                      <CardDescription>{data.conversations.length} conversations</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => handleExport('conversations-pdf')} variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.conversations.slice(0, 5).map((conv: any) => (
                    <div key={conv.id} className="p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{conv.scenario}</h4>
                        <Badge variant={conv.status === 'completed' ? 'default' : 'secondary'}>
                          {conv.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mistakes Tab */}
          <TabsContent value="mistakes" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                    <div>
                      <CardTitle>Mistake Diary</CardTitle>
                      <CardDescription>{data.mistakes.length} mistakes recorded</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => handleExport('mistakes-pdf')} variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.mistakes.slice(0, 5).map((mistake: any) => (
                    <div key={mistake.id} className="p-3 bg-background/50 rounded-lg border-l-4 border-destructive">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{mistake.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(mistake.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{mistake.content}</p>
                      {mistake.correction && (
                        <p className="text-sm text-green-500 mt-2">✓ {mistake.correction}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memorizer Tab */}
          <TabsContent value="memorizer" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle>Memorizer Items</CardTitle>
                      <CardDescription>{data.memorizer.length} flashcards</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => handleExport('memorizer-anki')} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export to Anki
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.memorizer.slice(0, 10).map((item: any) => (
                    <div key={item.id} className="p-3 bg-background/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-primary">{item.german_text}</p>
                          <p className="text-sm text-muted-foreground">{item.english_translation}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="secondary">{item.difficulty}</Badge>
                          <Badge variant="outline">SRS {item.srs_level}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-luxury">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Content Preview</DialogTitle>
            </DialogHeader>
            {previewItem?.type === 'vocabulary' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-2">{previewItem.data.word}</h3>
                  <p className="text-muted-foreground">{previewItem.data.definition}</p>
                </div>
                {previewItem.data.example_sentence && (
                  <div className="p-4 bg-background/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Example:</p>
                    <p className="text-sm">{previewItem.data.example_sentence}</p>
                  </div>
                )}
                {previewItem.data.topic && <Badge>{previewItem.data.topic}</Badge>}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default History;
