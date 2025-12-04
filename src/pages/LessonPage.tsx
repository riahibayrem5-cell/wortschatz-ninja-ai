import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, Clock, 
  MessageCircle, BookOpen, Target, Lightbulb
} from "lucide-react";

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

  // AI Tutor chat state
  const [showTutor, setShowTutor] = useState(false);
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

  const completeLesson = async (score: number = 100) => {
    if (!user || !lessonId || !moduleId) return;
    setCompleting(true);

    const timeSpent = Math.round((Date.now() - startTime) / 60000);

    try {
      // Update or insert lesson progress
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          lesson_id: lessonId,
          status: 'completed',
          score,
          time_spent_minutes: timeSpent,
          completed_at: new Date().toISOString(),
          notes: notes || null,
        }, {
          onConflict: 'user_id,module_id,lesson_id'
        });

      if (error) throw error;

      // Check if all lessons in module are completed
      const { data: lessonProgress } = await supabase
        .from('user_course_progress')
        .select('lesson_id, status')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .not('lesson_id', 'is', null);

      const completedLessons = lessonProgress?.filter(p => p.status === 'completed') || [];
      
      if (completedLessons.length === allLessons.length) {
        // Mark module as completed
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

      // Navigate to next lesson or back to module
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

      // Handle streaming response
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

  const lessonTypeContent: Record<string, { icon: React.ReactNode; objectives: string[] }> = {
    reading: {
      icon: <BookOpen className="h-6 w-6" />,
      objectives: ["Understand main ideas", "Find specific information", "Analyze text structure", "Learn vocabulary in context"]
    },
    listening: {
      icon: <BookOpen className="h-6 w-6" />,
      objectives: ["Understand spoken German", "Take effective notes", "Identify key information", "Handle different accents"]
    },
    writing: {
      icon: <BookOpen className="h-6 w-6" />,
      objectives: ["Write formal correspondence", "Structure arguments", "Use appropriate style", "Avoid common errors"]
    },
    speaking: {
      icon: <BookOpen className="h-6 w-6" />,
      objectives: ["Express opinions clearly", "Participate in discussions", "Give presentations", "Improve pronunciation"]
    },
    grammar: {
      icon: <BookOpen className="h-6 w-6" />,
      objectives: ["Understand grammar rules", "Apply structures correctly", "Recognize patterns", "Practice with exercises"]
    },
    vocabulary: {
      icon: <BookOpen className="h-6 w-6" />,
      objectives: ["Learn new words", "Understand context usage", "Practice with examples", "Build word associations"]
    },
    exam_practice: {
      icon: <Target className="h-6 w-6" />,
      objectives: ["Practice TELC format", "Manage time effectively", "Apply test strategies", "Build confidence"]
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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

        {/* Lesson Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                Week {module?.week_number} • Lesson {lesson.lesson_number}
              </Badge>
              <Badge variant="outline">
                {lesson.lesson_type.replace('_', ' ')}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                <Clock className="h-4 w-4" />
                {lesson.estimated_minutes} minutes
              </div>
            </div>
            <CardTitle className="text-2xl">{lesson.title}</CardTitle>
            <p className="text-muted-foreground italic">{lesson.title_de}</p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="content" className="flex-1">Lesson Content</TabsTrigger>
                <TabsTrigger value="practice" className="flex-1">Practice</TabsTrigger>
                <TabsTrigger value="notes" className="flex-1">My Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <Card>
                  <CardContent className="pt-6">
                    {/* Learning Objectives */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Learning Objectives
                      </h3>
                      <ul className="space-y-2">
                        {typeInfo.objectives.map((obj, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Dynamic Content Based on Type */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Lesson Material
                      </h3>
                      
                      <div className="prose prose-sm max-w-none">
                        {lesson.lesson_type === 'vocabulary' && (
                          <div className="space-y-4">
                            <p>In this vocabulary lesson, you'll learn words related to: <strong>{(lesson.content as any)?.topics?.join(', ') || 'various topics'}</strong></p>
                            <div className="bg-secondary/30 p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Use the AI Tutor on the right to practice these words in context, get example sentences, and test your knowledge!
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {lesson.lesson_type === 'grammar' && (
                          <div className="space-y-4">
                            <p>This grammar lesson covers: <strong>{(lesson.content as any)?.topics?.join(', ') || 'key grammar concepts'}</strong></p>
                            <div className="bg-secondary/30 p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Ask the AI Tutor to explain any grammar rule, provide examples, or give you practice exercises!
                              </p>
                            </div>
                          </div>
                        )}

                        {lesson.lesson_type === 'reading' && (
                          <div className="space-y-4">
                            <p>Focus: <strong>{(lesson.content as any)?.skill || 'Reading comprehension'}</strong></p>
                            <p>Text types: {(lesson.content as any)?.text_types?.join(', ') || 'Various texts'}</p>
                            <div className="bg-secondary/30 p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                The AI Tutor can provide practice texts and guide you through comprehension strategies!
                              </p>
                            </div>
                          </div>
                        )}

                        {lesson.lesson_type === 'listening' && (
                          <div className="space-y-4">
                            <p>Audio type: <strong>{(lesson.content as any)?.audio_type || 'Various audio materials'}</strong></p>
                            <div className="bg-secondary/30 p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Use the AI Tutor to get tips on listening strategies and note-taking techniques!
                              </p>
                            </div>
                          </div>
                        )}

                        {lesson.lesson_type === 'writing' && (
                          <div className="space-y-4">
                            <p>Format: <strong>{(lesson.content as any)?.format || 'Written communication'}</strong></p>
                            <div className="bg-secondary/30 p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Ask the AI Tutor to review your writing, provide templates, or explain formal conventions!
                              </p>
                            </div>
                          </div>
                        )}

                        {lesson.lesson_type === 'speaking' && (
                          <div className="space-y-4">
                            <p>Topics: <strong>{(lesson.content as any)?.topics?.join(', ') || 'Various speaking scenarios'}</strong></p>
                            <div className="bg-secondary/30 p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Practice speaking scenarios with the AI Tutor and get feedback on your responses!
                              </p>
                            </div>
                          </div>
                        )}

                        {lesson.lesson_type === 'exam_practice' && (
                          <div className="space-y-4">
                            <p>Section: <strong>{(lesson.content as any)?.section || 'TELC B2 Exam Practice'}</strong></p>
                            <div className="bg-secondary/30 p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Get exam-style questions and strategies from the AI Tutor!
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tips Section */}
                    <div className="border-t pt-6 mt-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Pro Tips
                      </h3>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li>• Take your time to understand each concept before moving on</li>
                        <li>• Use the AI Tutor whenever you have questions</li>
                        <li>• Write notes to help remember key points</li>
                        <li>• Practice makes perfect - don't rush!</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="practice">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Interactive Practice</h3>
                      <p className="text-muted-foreground mb-4">
                        Use the AI Tutor to get personalized practice exercises for this lesson.
                      </p>
                      <Button onClick={() => setShowTutor(true)}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Practice with AI Tutor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">Your Notes</h3>
                    <Textarea
                      placeholder="Write your notes here... These will be saved when you complete the lesson."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Complete Lesson Button */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ready to continue?</p>
                    <p className="text-sm text-muted-foreground">
                      Mark this lesson as complete to unlock the next one
                    </p>
                  </div>
                  <Button 
                    onClick={() => completeLesson(100)}
                    disabled={completing}
                    size="lg"
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

          {/* AI Tutor Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  AI Tutor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                    {tutorMessages.length === 0 ? (
                      <div className="text-center text-sm text-muted-foreground py-8">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Ask me anything about this lesson!</p>
                        <div className="mt-4 space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => {
                              setTutorInput("Can you explain the main concepts of this lesson?");
                            }}
                          >
                            Explain main concepts
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => {
                              setTutorInput("Give me a practice exercise for this topic");
                            }}
                          >
                            Give me an exercise
                          </Button>
                        </div>
                      </div>
                    ) : (
                      tutorMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg text-sm ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-4'
                              : 'bg-secondary mr-4'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      ))
                    )}
                    {tutorLoading && (
                      <div className="bg-secondary p-3 rounded-lg mr-4">
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
                      placeholder="Ask a question..."
                      value={tutorInput}
                      onChange={(e) => setTutorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          askTutor();
                        }
                      }}
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                  <Button 
                    className="w-full mt-2" 
                    onClick={askTutor}
                    disabled={tutorLoading || !tutorInput.trim()}
                  >
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
