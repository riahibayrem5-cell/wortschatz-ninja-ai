import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SubsectionBanner from "@/components/SubsectionBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, Clock, 
  MessageCircle, BookOpen, Target, Lightbulb, 
  Headphones, PenTool, Mic, FileText, Brain
} from "lucide-react";
import LessonContentRenderer from "@/components/lessons/LessonContentRenderer";
import DetailedLessonContent from "@/components/lessons/DetailedLessonContent";
import SmartExerciseContainer from "@/components/exercises/SmartExerciseContainer";

interface CourseLesson {
  id: string;
  module_id: string;
  lesson_number: number;
  title: string;
  title_de: string;
  lesson_type: string;
  content: any;
  estimated_minutes: number;
}

interface CourseModule {
  id: string;
  week_number: number;
  title: string;
}

const LessonPage = () => {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [module, setModule] = useState<CourseModule | null>(null);
  const [allLessons, setAllLessons] = useState<CourseLesson[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [notes, setNotes] = useState("");
  const [startTime] = useState(Date.now());
  const [practiceScore, setPracticeScore] = useState<{score: number; total: number} | null>(null);

  // AI Tutor chat state
  const [tutorMessages, setTutorMessages] = useState<{role: string; content: string}[]>([]);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [lessonId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    await Promise.all([fetchLesson(), fetchModule(), fetchAllLessons()]);
    setLoading(false);
  };

  const fetchLesson = async () => {
    if (!lessonId) return;
    
    const { data, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error) {
      console.error("Error fetching lesson:", error);
      toast.error("Lesson not found");
      navigate(`/mastery-course/${moduleId}`);
      return;
    }

    setLesson(data);
  };

  const fetchModule = async () => {
    if (!moduleId) return;
    
    const { data } = await supabase
      .from('course_modules')
      .select('id, week_number, title')
      .eq('id', moduleId)
      .single();

    setModule(data);
  };

  const fetchAllLessons = async () => {
    if (!moduleId) return;
    
    const { data } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('lesson_number');

    setAllLessons(data || []);
  };

  const handlePracticeComplete = (score: number, total: number) => {
    setPracticeScore({ score, total });
  };

  const completeLesson = async (score: number = 100) => {
    if (!user || !lessonId || !moduleId) return;
    setCompleting(true);

    const timeSpent = Math.round((Date.now() - startTime) / 60000);
    const finalScore = practiceScore ? Math.round((practiceScore.score / practiceScore.total) * 100) : score;

    try {
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          lesson_id: lessonId,
          status: 'completed',
          score: finalScore,
          time_spent_minutes: timeSpent,
          completed_at: new Date().toISOString(),
          notes: notes || null,
        }, {
          onConflict: 'user_id,module_id,lesson_id'
        });

      if (error) throw error;

      const { data: lessonProgress } = await supabase
        .from('user_course_progress')
        .select('lesson_id, status')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .not('lesson_id', 'is', null);

      const completedLessons = lessonProgress?.filter(p => p.status === 'completed') || [];
      
      if (completedLessons.length === allLessons.length) {
        await supabase
          .from('user_course_progress')
          .upsert({
            user_id: user.id,
            module_id: moduleId,
            lesson_id: null,
            status: 'completed',
            completed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,module_id,lesson_id'
          });
        
        toast.success("Congratulations! Module completed!");
      } else {
        toast.success("Lesson completed!");
      }

      const currentIndex = allLessons.findIndex(l => l.id === lessonId);
      if (currentIndex < allLessons.length - 1) {
        const nextLesson = allLessons[currentIndex + 1];
        navigate(`/mastery-course/${moduleId}/lesson/${nextLesson.id}`);
      } else {
        navigate(`/mastery-course/${moduleId}`);
      }

    } catch (error: any) {
      console.error("Error completing lesson:", error);
      toast.error("Failed to save progress");
    } finally {
      setCompleting(false);
    }
  };

  const askTutor = async () => {
    if (!tutorInput.trim() || tutorLoading) return;

    const userMessage = { role: "user", content: tutorInput };
    setTutorMessages(prev => [...prev, userMessage]);
    setTutorInput("");
    setTutorLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/course-ai-tutor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...tutorMessages, userMessage],
          lessonContext: lesson,
          moduleContext: module,
          userLevel: "B2",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get tutor response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setTutorMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setTutorMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }

    } catch (error: any) {
      console.error("Tutor error:", error);
      toast.error("Failed to get tutor response");
      setTutorMessages(prev => prev.slice(0, -1));
    } finally {
      setTutorLoading(false);
    }
  };

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const lessonTypeContent: Record<string, { icon: React.ElementType; objectives: string[]; color: "blue" | "purple" | "green" | "orange" | "primary" | "accent" }> = {
    reading: {
      icon: BookOpen,
      objectives: ["Understand main ideas", "Find specific information", "Analyze text structure", "Learn vocabulary in context"],
      color: "blue"
    },
    listening: {
      icon: Headphones,
      objectives: ["Understand spoken German", "Take effective notes", "Identify key information", "Handle different accents"],
      color: "purple"
    },
    writing: {
      icon: PenTool,
      objectives: ["Write formal correspondence", "Structure arguments", "Use appropriate style", "Avoid common errors"],
      color: "green"
    },
    speaking: {
      icon: Mic,
      objectives: ["Express opinions clearly", "Participate in discussions", "Give presentations", "Improve pronunciation"],
      color: "orange"
    },
    grammar: {
      icon: FileText,
      objectives: ["Understand grammar rules", "Apply structures correctly", "Recognize patterns", "Practice with exercises"],
      color: "accent"
    },
    vocabulary: {
      icon: Brain,
      objectives: ["Learn new words", "Understand context usage", "Practice with examples", "Build word associations"],
      color: "primary"
    },
    exam_practice: {
      icon: Target,
      objectives: ["Practice TELC format", "Manage time effectively", "Apply test strategies", "Build confidence"],
      color: "primary"
    },
  };

  if (loading || !lesson) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const typeInfo = lessonTypeContent[lesson.lesson_type] || lessonTypeContent.exam_practice;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/mastery-course/${moduleId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Module
          </Button>
          
          <div className="flex items-center gap-2">
            {prevLesson && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/mastery-course/${moduleId}/lesson/${prevLesson.id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            {nextLesson && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/mastery-course/${moduleId}/lesson/${nextLesson.id}`)}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Lesson Header with Subsection Banner */}
        <SubsectionBanner
          title={lesson.title}
          subtitle={lesson.title_de}
          badge={`Week ${module?.week_number} • Lesson ${lesson.lesson_number}`}
          icon={typeInfo.icon}
          variant="gradient"
          color={typeInfo.color}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {lesson.estimated_minutes}m
          </div>
        </SubsectionBanner>

        {/* Main Content - Full Width Tabs */}
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="content" className="text-sm sm:text-base">
              <BookOpen className="h-4 w-4 mr-2 hidden sm:inline" />
              Lesson Content
            </TabsTrigger>
            <TabsTrigger value="practice" className="text-sm sm:text-base">
              <Target className="h-4 w-4 mr-2 hidden sm:inline" />
              Interactive Practice
            </TabsTrigger>
            <TabsTrigger value="tutor" className="text-sm sm:text-base">
              <MessageCircle className="h-4 w-4 mr-2 hidden sm:inline" />
              AI Tutor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Lesson Content */}
              <div className="lg:col-span-2">
                <Card className="glass">
                  <CardContent className="pt-6">
                    {lesson.content?.detailed_content ? (
                      <DetailedLessonContent
                        lessonType={lesson.lesson_type}
                        lessonTitle={lesson.title}
                        lessonTitleDe={lesson.title_de}
                        content={lesson.content}
                      />
                    ) : (
                      <LessonContentRenderer
                        lessonType={lesson.lesson_type}
                        lessonTitle={lesson.title}
                        lessonTitleDe={lesson.title_de}
                        content={lesson.content}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Notes Sidebar */}
              <div className="lg:col-span-1">
                <Card className="glass sticky top-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Your Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write your notes here... These will be saved when you complete the lesson."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="practice">
            <Card className="glass">
              <CardContent className="pt-6">
                <SmartExerciseContainer
                  lessonId={lesson.id}
                  lessonType={lesson.lesson_type}
                  lessonTitle={lesson.title}
                  lessonContent={lesson.content}
                  onComplete={handlePracticeComplete}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutor">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  AI Tutor - Personal Learning Assistant
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ask questions about this lesson, get explanations, or request additional practice
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-secondary/20 rounded-lg">
                    {tutorMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                        <p className="text-muted-foreground mb-4">Ask me anything about this lesson!</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setTutorInput("Can you explain the main concepts of this lesson?");
                            }}
                          >
                            Explain main concepts
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setTutorInput("Give me additional practice exercises");
                            }}
                          >
                            More exercises
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setTutorInput("What are common mistakes to avoid in this topic?");
                            }}
                          >
                            Common mistakes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      tutorMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg max-w-[80%] ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-secondary mr-auto'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      ))
                    )}
                    {tutorLoading && (
                      <div className="bg-secondary p-4 rounded-lg max-w-[80%]">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask a question about this lesson..."
                      value={tutorInput}
                      onChange={(e) => setTutorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          askTutor();
                        }
                      }}
                      className="min-h-[60px] resize-none flex-1"
                    />
                    <Button 
                      onClick={askTutor}
                      disabled={tutorLoading || !tutorInput.trim()}
                      className="gradient-primary self-end"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Complete Lesson Button */}
        <Card className="mt-6 glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ready to continue?</p>
                <p className="text-sm text-muted-foreground">
                  {practiceScore 
                    ? `Practice Score: ${Math.round((practiceScore.score / practiceScore.total) * 100)}%`
                    : 'Complete some exercises to track your score'
                  }
                </p>
              </div>
              <Button 
                onClick={() => completeLesson(100)}
                disabled={completing}
                size="lg"
                className="gradient-primary"
              >
                {completing ? (
                  "Saving..."
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Complete Lesson
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LessonPage;
