import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AudioButton from "@/components/AudioButton";
import { 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic, 
  Clock,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  Sparkles,
  Loader2,
  Volume2,
  Award
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Teil {
  teilNumber: number;
  title: string;
  instructions: string;
  questions?: Question[];
  text?: string;
  task?: string;
  wordCount?: number;
}

interface SectionContent {
  title: string;
  instructions: string;
  timeLimit: number;
  maxPoints: number;
  teile: Teil[];
}

interface ExamState {
  reading: SectionContent | null;
  sprachbausteine: SectionContent | null;
  listening: SectionContent | null;
  writing: SectionContent | null;
  speaking: SectionContent | null;
}

const TelcExam = () => {
  const { toast } = useToast();
  const [examMode, setExamMode] = useState<'practice' | 'mock' | null>(null);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [currentTeil, setCurrentTeil] = useState(0);
  const [examState, setExamState] = useState<ExamState>({
    reading: null,
    sprachbausteine: null,
    listening: null,
    writing: null,
    speaking: null
  });
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});
  const [writingAnswers, setWritingAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  const sections = [
    { id: 'reading', icon: BookOpen, title: 'Leseverstehen', duration: 90, color: 'text-blue-500', maxPoints: 75 },
    { id: 'sprachbausteine', icon: PenTool, title: 'Sprachbausteine', duration: 30, color: 'text-purple-500', maxPoints: 30 },
    { id: 'listening', icon: Headphones, title: 'Hörverstehen', duration: 20, color: 'text-green-500', maxPoints: 75 },
    { id: 'writing', icon: PenTool, title: 'Schriftlicher Ausdruck', duration: 30, color: 'text-orange-500', maxPoints: 45 },
    { id: 'speaking', icon: Mic, title: 'Mündlicher Ausdruck', duration: 15, color: 'text-red-500', maxPoints: 75 }
  ];

  useEffect(() => {
    if (currentSection && timeLeft[currentSection] > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => ({ ...prev, [currentSection]: prev[currentSection] - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentSection, timeLeft, showResults]);

  const generateSection = async (sectionId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-telc-exam', {
        body: { section: sectionId, difficulty: 'b2' }
      });

      if (error) throw error;
      
      setExamState(prev => ({ ...prev, [sectionId]: data }));
      setTimeLeft(prev => ({ ...prev, [sectionId]: data.timeLimit * 60 }));
      toast({ title: `${data.title} loaded!` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const startSection = async (sectionId: string) => {
    if (!examState[sectionId as keyof ExamState]) {
      await generateSection(sectionId);
    }
    setCurrentSection(sectionId);
    setCurrentTeil(0);
  };

  const handleAnswerSelect = (sectionId: string, questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] || {}), [questionId]: answer }
    }));
  };

  const submitSection = async (sectionId: string) => {
    try {
      setLoading(true);
      const content = examState[sectionId as keyof ExamState];
      
      if (sectionId === 'writing' || sectionId === 'speaking') {
        const { data, error } = await supabase.functions.invoke('evaluate-telc-answer', {
          body: {
            section: sectionId,
            task: content?.teile.map(t => t.task).join('\n'),
            userAnswer: writingAnswers[sectionId] || ''
          }
        });

        if (error) throw error;
        setResults(prev => ({ ...prev, [sectionId]: data }));
      } else {
        const allQuestions = content?.teile.flatMap(t => t.questions || []) || [];
        let correct = 0;
        const sectionResults = allQuestions.map((q: any) => {
          const userAnswer = answers[sectionId]?.[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          if (isCorrect) correct++;
          return { ...q, userAnswer, isCorrect };
        });

        const { data: scoreData, error: scoreError } = await supabase.functions.invoke('score-telc-section', {
          body: {
            section: sectionId,
            totalQuestions: allQuestions.length,
            correctAnswers: correct
          }
        });

        if (scoreError) throw scoreError;

        setResults(prev => ({
          ...prev,
          [sectionId]: {
            ...scoreData,
            results: sectionResults
          }
        }));
      }

      toast({ title: `${content?.title} submitted!` });
      setCurrentSection(null);
      setShowResults(true);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getTotalPoints = () => {
    return Object.values(results).reduce((sum, result) => sum + (result.earnedPoints || 0), 0);
  };

  const getMaxTotalPoints = () => {
    return sections.reduce((sum, section) => sum + section.maxPoints, 0);
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'Sehr gut';
    if (percentage >= 75) return 'Gut';
    if (percentage >= 60) return 'Befriedigend';
    if (percentage >= 45) return 'Ausreichend';
    return 'Nicht bestanden';
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(24);
    doc.setTextColor(147, 51, 234);
    doc.text('TELC B2 Exam Results', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
    
    const totalPoints = getTotalPoints();
    const maxPoints = getMaxTotalPoints();
    const percentage = Math.round((totalPoints / maxPoints) * 100);
    
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('Overall Performance', 20, 20);
    doc.text(`${totalPoints}/${maxPoints} points (${percentage}%)`, 20, 30);
    doc.text(`Grade: ${getGrade(percentage)}`, 20, 40);
    
    const overallData = Object.keys(results).map(key => {
      const section = sections.find(s => s.id === key);
      return [
        section?.title || key,
        `${results[key].earnedPoints || 0}/${section?.maxPoints || 0}`,
        `${Math.round(((results[key].earnedPoints || 0) / (section?.maxPoints || 1)) * 100)}%`
      ];
    });
    
    autoTable(doc, {
      head: [['Section', 'Points', 'Percentage']],
      body: overallData,
      startY: 50,
      headStyles: { fillColor: [147, 51, 234] }
    });
    
    doc.save(`telc_b2_exam_${Date.now()}.pdf`);
    toast({ title: "PDF exported successfully!" });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentSection && examState[currentSection as keyof ExamState]) {
    const content = examState[currentSection as keyof ExamState];
    const sectionInfo = sections.find(s => s.id === currentSection);
    const teil = content?.teile[currentTeil];
    
    return (
      <div className="min-h-screen gradient-hero">
        <Navbar />
        
        <div className="container max-w-5xl mx-auto p-4 mt-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" className="glass" onClick={() => setCurrentSection(null)}>
              Back to Overview
            </Button>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                {sectionInfo?.maxPoints} points
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(timeLeft[currentSection] || 0)}
              </Badge>
            </div>
          </div>

          <Card className="glass mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                {sectionInfo && <sectionInfo.icon className={`w-6 h-6 ${sectionInfo.color}`} />}
                <div>
                  <CardTitle>{content?.title}</CardTitle>
                  <CardDescription>{content?.instructions}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Teil Navigation */}
          {content && content.teile.length > 1 && (
            <Tabs value={`teil-${currentTeil}`} onValueChange={(v) => setCurrentTeil(parseInt(v.split('-')[1]))} className="mb-6">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${content.teile.length}, 1fr)` }}>
                {content.teile.map((t, idx) => (
                  <TabsTrigger key={idx} value={`teil-${idx}`}>
                    Teil {t.teilNumber}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* Teil Content */}
          {teil && (
            <>
              <Card className="glass mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Teil {teil.teilNumber}: {teil.title}</CardTitle>
                  <CardDescription>{teil.instructions}</CardDescription>
                </CardHeader>
                {teil.text && (
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Text</h4>
                      <AudioButton text={teil.text} lang="de-DE" />
                    </div>
                    <div className="prose prose-sm max-w-none text-foreground">
                      {teil.text.split('\n').map((para, idx) => (
                        <p key={idx} className="mb-4">{para}</p>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Questions */}
              {teil.questions && (
                <div className="space-y-4 mb-6">
                  {teil.questions.map((q, idx) => (
                    <Card key={q.id} className="glass">
                      <CardHeader>
                        <CardTitle className="text-base">{idx + 1}. {q.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RadioGroup
                          value={answers[currentSection]?.[q.id]}
                          onValueChange={(val) => handleAnswerSelect(currentSection, q.id, val)}
                        >
                          {q.options.map(opt => (
                            <div key={opt} className="flex items-center space-x-2 mb-2">
                              <RadioGroupItem value={opt[0]} id={`${currentSection}-${q.id}-${opt[0]}`} />
                              <Label htmlFor={`${currentSection}-${q.id}-${opt[0]}`} className="cursor-pointer">
                                {opt}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Writing/Speaking Tasks */}
              {teil.task && (
                <Card className="glass mb-6">
                  <CardHeader>
                    <CardTitle>Task</CardTitle>
                    <CardDescription>{teil.task}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={writingAnswers[`${currentSection}-teil${teil.teilNumber}`] || ''}
                      onChange={(e) => setWritingAnswers(prev => ({ 
                        ...prev, 
                        [`${currentSection}-teil${teil.teilNumber}`]: e.target.value,
                        [currentSection]: Object.values({...prev, [`${currentSection}-teil${teil.teilNumber}`]: e.target.value})
                          .filter(v => typeof v === 'string' && v.includes(`${currentSection}-teil`))
                          .join('\n\n')
                      }))}
                      placeholder="Write your answer in German..."
                      className="min-h-[300px]"
                    />
                    {teil.wordCount && (
                      <div className="text-sm text-muted-foreground">
                        Word count: {(writingAnswers[`${currentSection}-teil${teil.teilNumber}`] || '').split(/\s+/).filter(Boolean).length} / {teil.wordCount}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <Button 
              variant="outline"
              onClick={() => setCurrentTeil(prev => Math.max(0, prev - 1))}
              disabled={currentTeil === 0}
            >
              Previous Teil
            </Button>
            
            {currentTeil < (content?.teile.length || 1) - 1 ? (
              <Button 
                onClick={() => setCurrentTeil(prev => prev + 1)}
                className="gradient-primary"
              >
                Next Teil
              </Button>
            ) : (
              <Button 
                onClick={() => submitSection(currentSection)}
                disabled={loading}
                className="gradient-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Section
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto p-4 mt-6">
        {/* Mode Selection */}
        {!examMode && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-3 text-gradient">TELC B2 Exam</h1>
              <p className="text-muted-foreground">Choose your exam mode</p>
            </div>
            
            <div className="grid gap-6">
              <Card className="glass hover:shadow-xl transition-all cursor-pointer" onClick={() => setExamMode('practice')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    Practice Mode
                  </CardTitle>
                  <CardDescription>
                    Practice individual sections at your own pace with instant feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>No time pressure</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Immediate feedback after each section</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Review explanations for every question</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass hover:shadow-xl transition-all cursor-pointer" onClick={() => setExamMode('mock')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-accent" />
                    Mock Exam Mode
                  </CardTitle>
                  <CardDescription>
                    Simulate the real TELC B2 exam with official timing and structure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>Official timing per section</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Complete all sections</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-accent" />
                      <span>Official TELC scoring system</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Section Selection */}
        {examMode && !currentSection && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-3 text-gradient">
                {examMode === 'practice' ? 'Practice Mode' : 'Mock Exam Mode'}
              </h1>
              <Button variant="outline" onClick={() => setExamMode(null)}>
                Change Mode
              </Button>
            </div>

            {/* Results Summary */}
            {showResults && Object.keys(results).length > 0 && (
              <Card className="glass mb-8 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gradient">Your Results</h2>
                      <p className="text-muted-foreground">Total Score: {getTotalPoints()}/{getMaxTotalPoints()} points</p>
                    </div>
                    <Badge variant="outline" className="text-2xl px-6 py-3">
                      {getGrade(Math.round((getTotalPoints() / getMaxTotalPoints()) * 100))}
                    </Badge>
                  </div>
                  
                  <Progress value={(getTotalPoints() / getMaxTotalPoints()) * 100} className="h-3" />
                  
                  <Button onClick={exportToPDF} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Results as PDF
                  </Button>
                </div>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {sections.map((section) => {
                const result = results[section.id];
                const completed = !!result;
                
                return (
                  <Card key={section.id} className="glass hover:shadow-xl transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <section.icon className={`w-6 h-6 ${section.color}`} />
                          <div>
                            <CardTitle>{section.title}</CardTitle>
                            <CardDescription>
                              {section.duration} min · {section.maxPoints} points
                            </CardDescription>
                          </div>
                        </div>
                        {completed && (
                          <CheckCircle className="w-6 h-6 text-accent" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {completed ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Score</span>
                            <Badge variant="outline">
                              {result.earnedPoints}/{section.maxPoints} points
                            </Badge>
                          </div>
                          <Progress value={(result.earnedPoints / section.maxPoints) * 100} />
                          <p className="text-sm font-medium text-center">
                            {Math.round((result.earnedPoints / section.maxPoints) * 100)}% - {result.grade}
                          </p>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => startSection(section.id)}
                          disabled={loading}
                          className="w-full gradient-primary"
                        >
                          Start Section
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TelcExam;
