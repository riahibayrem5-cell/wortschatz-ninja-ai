import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AudioButton from "@/components/AudioButton";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  FileText,
  Target,
  Clock,
  ChevronRight,
  ChevronLeft,
  Star,
  Award,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  Brain,
  MessageSquare,
  Users,
  Lightbulb,
  Loader2,
  RotateCcw,
  Send,
  ArrowRight,
  Home
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points?: number;
}

interface Teil {
  teilNumber: number;
  title: string;
  instructions: string;
  questions?: Question[];
  text?: string;
  task?: string;
}

interface SectionContent {
  title: string;
  instructions: string;
  timeLimit: number;
  maxPoints: number;
  teile: Teil[];
}

const sectionIcons: Record<string, any> = {
  lesen: BookOpen,
  sprachbausteine: PenTool,
  hoeren: Headphones,
  schreiben: FileText,
  sprechen: Mic,
  reading: BookOpen,
  listening: Headphones,
  writing: FileText,
  speaking: Mic
};

const sectionColors: Record<string, string> = {
  lesen: "text-blue-500",
  sprachbausteine: "text-purple-500",
  hoeren: "text-green-500",
  schreiben: "text-orange-500",
  sprechen: "text-red-500",
  reading: "text-blue-500",
  listening: "text-green-500",
  writing: "text-orange-500",
  speaking: "text-red-500"
};

const TelcVorbereitung = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sectionParam = searchParams.get("section");
  const teilParam = searchParams.get("teil");

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<SectionContent | null>(null);
  const [currentTeil, setCurrentTeil] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [writingAnswer, setWritingAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [aiHelp, setAiHelp] = useState<Record<number, any>>({});
  const [loadingHelp, setLoadingHelp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    if (sectionParam) {
      generateContent(sectionParam, teilParam ? parseInt(teilParam) : undefined);
    }
  }, [sectionParam, teilParam]);

  // Timer
  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isTimerActive, submitted]);

  const generateContent = async (section: string, teil?: number) => {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setWritingAnswer("");
    setResults(null);
    setAiHelp({});

    try {
      const { data, error } = await supabase.functions.invoke('generate-telc-exam', {
        body: { 
          section: section === "hoeren" ? "listening" : 
                   section === "lesen" ? "reading" :
                   section === "schreiben" ? "writing" :
                   section === "sprechen" ? "speaking" :
                   section,
          difficulty: 'b2',
          teil 
        }
      });

      if (error) throw error;

      setContent(data);
      setTimeLeft(data.timeLimit * 60);
      setIsTimerActive(true);
      
      if (teil) {
        const teilIndex = data.teile.findIndex((t: Teil) => t.teilNumber === teil);
        setCurrentTeil(teilIndex >= 0 ? teilIndex : 0);
      }
    } catch (error: any) {
      toast.error("Error loading content: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const requestAiHelp = async (question: Question, userAnswer: string) => {
    setLoadingHelp(true);
    try {
      const { data, error } = await supabase.functions.invoke('telc-practice-helper', {
        body: {
          type: 'explanation',
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          context: question.explanation
        }
      });

      if (error) throw error;
      setAiHelp(prev => ({ ...prev, [question.id]: data }));
    } catch (error) {
      toast.error("Could not get AI help");
    } finally {
      setLoadingHelp(false);
    }
  };

  const submitAnswers = async () => {
    if (!content) return;
    setLoading(true);

    try {
      const currentTeile = content.teile[currentTeil];
      
      if (sectionParam === "schreiben" || sectionParam === "sprechen" || sectionParam === "writing" || sectionParam === "speaking") {
        const { data, error } = await supabase.functions.invoke('evaluate-telc-answer', {
          body: {
            section: sectionParam === "schreiben" ? "writing" : sectionParam === "sprechen" ? "speaking" : sectionParam,
            task: currentTeile.task || currentTeile.instructions,
            userAnswer: writingAnswer
          }
        });

        if (error) throw error;
        setResults(data);
      } else {
        const questions = currentTeile.questions || [];
        let correct = 0;
        const questionResults = questions.map(q => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          if (isCorrect) correct++;
          return { ...q, userAnswer, isCorrect };
        });

        const percentage = Math.round((correct / questions.length) * 100);
        setResults({
          correct,
          total: questions.length,
          percentage,
          results: questionResults,
          passed: percentage >= 60
        });
      }

      setSubmitted(true);
      setIsTimerActive(false);
    } catch (error: any) {
      toast.error("Error submitting: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const Icon = sectionIcons[sectionParam || "reading"] || BookOpen;
  const color = sectionColors[sectionParam || "reading"] || "text-primary";

  if (!sectionParam) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Select a Section</CardTitle>
              <CardDescription>Choose which part of the TELC B2 exam to practice</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {[
                { id: "lesen", label: "Leseverstehen", icon: BookOpen, color: "text-blue-500" },
                { id: "sprachbausteine", label: "Sprachbausteine", icon: PenTool, color: "text-purple-500" },
                { id: "hoeren", label: "Hörverstehen", icon: Headphones, color: "text-green-500" },
                { id: "schreiben", label: "Schreiben", icon: FileText, color: "text-orange-500" },
                { id: "sprechen", label: "Sprechen", icon: Mic, color: "text-red-500" },
              ].map(section => {
                const SectionIcon = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => navigate(`/telc-vorbereitung?section=${section.id}`)}
                  >
                    <SectionIcon className={`h-6 w-6 ${section.color}`} />
                    {section.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/mastery-course')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Icon className={`h-6 w-6 ${color}`} />
                {content?.title || "TELC B2 Practice"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {content?.instructions || "Loading..."}
              </p>
            </div>
          </div>
          
          {isTimerActive && (
            <Badge variant={timeLeft < 300 ? "destructive" : "secondary"} className="text-lg px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>

        {loading && !content ? (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Generating exam content...</p>
            </div>
          </Card>
        ) : content ? (
          <div className="space-y-6">
            {/* Teil Navigation */}
            {content.teile.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {content.teile.map((teil, index) => (
                  <Button
                    key={teil.teilNumber}
                    variant={currentTeil === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setCurrentTeil(index);
                      setSubmitted(false);
                      setAnswers({});
                      setResults(null);
                    }}
                    disabled={submitted}
                  >
                    Teil {teil.teilNumber}: {teil.title}
                  </Button>
                ))}
              </div>
            )}

            {/* Current Teil Content */}
            {content.teile[currentTeil] && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">Teil {content.teile[currentTeil].teilNumber}</Badge>
                    {content.teile[currentTeil].title}
                  </CardTitle>
                  <CardDescription>{content.teile[currentTeil].instructions}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Text if present */}
                  {content.teile[currentTeil].text && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {content.teile[currentTeil].text}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Writing/Speaking Task */}
                  {(sectionParam === "schreiben" || sectionParam === "sprechen" || sectionParam === "writing" || sectionParam === "speaking") && (
                    <div className="space-y-4">
                      {content.teile[currentTeil].task && (
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="pt-4">
                            <p className="font-medium mb-2">Aufgabe:</p>
                            <p className="whitespace-pre-wrap">{content.teile[currentTeil].task}</p>
                          </CardContent>
                        </Card>
                      )}
                      
                      <Textarea
                        placeholder={sectionParam === "sprechen" || sectionParam === "speaking" ? "Prepare your speaking notes here..." : "Write your response here..."}
                        value={writingAnswer}
                        onChange={(e) => setWritingAnswer(e.target.value)}
                        className="min-h-[300px]"
                        disabled={submitted}
                      />
                      
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Words: {writingAnswer.split(/\s+/).filter(Boolean).length}</span>
                        <span>Recommended: 150+ words</span>
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  {content.teile[currentTeil].questions && (
                    <div className="space-y-6">
                      {content.teile[currentTeil].questions?.map((question, idx) => {
                        const isCorrect = submitted && answers[question.id] === question.correctAnswer;
                        const isWrong = submitted && answers[question.id] && answers[question.id] !== question.correctAnswer;

                        return (
                          <Card key={question.id} className={`transition-all ${isCorrect ? 'border-green-500 bg-green-500/5' : isWrong ? 'border-red-500 bg-red-500/5' : ''}`}>
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between gap-4">
                                <CardTitle className="text-base flex items-start gap-2">
                                  <Badge variant="outline" className="shrink-0">{idx + 1}</Badge>
                                  <span>{question.question}</span>
                                </CardTitle>
                                {submitted && (
                                  isCorrect ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                  ) : isWrong ? (
                                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                                  ) : null
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <RadioGroup
                                value={answers[question.id] || ""}
                                onValueChange={(value) => handleAnswerSelect(question.id, value)}
                                disabled={submitted}
                                className="space-y-2"
                              >
                                {question.options.map((option, optIdx) => {
                                  const isThisCorrect = submitted && option === question.correctAnswer;
                                  const isThisWrong = submitted && answers[question.id] === option && option !== question.correctAnswer;
                                  
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                        isThisCorrect ? 'bg-green-500/10 border-green-500' :
                                        isThisWrong ? 'bg-red-500/10 border-red-500' :
                                        'hover:bg-muted/50'
                                      }`}
                                    >
                                      <RadioGroupItem value={option} id={`q${question.id}-${optIdx}`} />
                                      <Label htmlFor={`q${question.id}-${optIdx}`} className="flex-1 cursor-pointer">
                                        {option}
                                      </Label>
                                      {isThisCorrect && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                      {isThisWrong && <XCircle className="h-4 w-4 text-red-500" />}
                                    </div>
                                  );
                                })}
                              </RadioGroup>

                              {submitted && isWrong && (
                                <div className="space-y-3">
                                  <div className="p-3 bg-muted rounded-lg text-sm">
                                    <p className="font-medium text-green-600 mb-1">Correct answer: {question.correctAnswer}</p>
                                    <p className="text-muted-foreground">{question.explanation}</p>
                                  </div>
                                  
                                  {!aiHelp[question.id] && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => requestAiHelp(question, answers[question.id])}
                                      disabled={loadingHelp}
                                    >
                                      {loadingHelp ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Sparkles className="h-4 w-4 mr-2" />
                                      )}
                                      Get AI Explanation
                                    </Button>
                                  )}

                                  {aiHelp[question.id] && (
                                    <Card className="bg-primary/5 border-primary/20">
                                      <CardContent className="pt-4 text-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Sparkles className="h-4 w-4 text-primary" />
                                          <span className="font-medium">AI Tutor</span>
                                        </div>
                                        <p className="whitespace-pre-wrap">{aiHelp[question.id].explanation || aiHelp[question.id].hint}</p>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {submitted && results && (
              <Card className={`border-2 ${results.passed || results.percentage >= 60 ? 'border-green-500 bg-green-500/5' : 'border-orange-500 bg-orange-500/5'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {results.passed || results.percentage >= 60 ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        Well Done!
                      </>
                    ) : (
                      <>
                        <Target className="h-6 w-6 text-orange-500" />
                        Keep Practicing!
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.correct !== undefined ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-3xl font-bold text-primary">{results.correct}</p>
                        <p className="text-sm text-muted-foreground">Correct</p>
                      </div>
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-3xl font-bold">{results.total}</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-3xl font-bold">{results.percentage}%</p>
                        <p className="text-sm text-muted-foreground">Score</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                        <span>Score</span>
                        <span className="text-2xl font-bold">{results.score || 0}/45</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                        <span>Grade</span>
                        <Badge variant={results.grade === "sehr gut" || results.grade === "gut" ? "default" : "secondary"}>
                          {results.grade || "N/A"}
                        </Badge>
                      </div>
                      {results.strengths && (
                        <div className="p-4 bg-green-500/10 rounded-lg">
                          <p className="font-medium mb-2 text-green-700">Strengths:</p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {results.strengths.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {results.improvements && (
                        <div className="p-4 bg-orange-500/10 rounded-lg">
                          <p className="font-medium mb-2 text-orange-700">Areas to Improve:</p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {results.improvements.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <Button variant="outline" onClick={() => navigate('/mastery-course')}>
                <Home className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
              
              <div className="flex gap-2">
                {submitted ? (
                  <>
                    <Button variant="outline" onClick={() => generateContent(sectionParam, teilParam ? parseInt(teilParam) : undefined)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    {currentTeil < content.teile.length - 1 && (
                      <Button onClick={() => {
                        setCurrentTeil(prev => prev + 1);
                        setSubmitted(false);
                        setAnswers({});
                        setResults(null);
                      }}>
                        Next Teil
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </>
                ) : (
                  <Button onClick={submitAnswers} disabled={loading} className="gradient-primary">
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Submit Answers
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TelcVorbereitung;
