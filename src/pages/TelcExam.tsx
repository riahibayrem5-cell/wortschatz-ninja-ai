import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PageBanner from "@/components/PageBanner";
import SubsectionBanner from "@/components/SubsectionBanner";
import TelcSectionBanner from "@/components/TelcSectionBanner";
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
  Award,
  History,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  GraduationCap
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string | number;
  explanation?: string;
  points?: number;
}


interface Teil {
  teilNumber: number;
  title: string;
  instructions: string;
  maxPoints?: number;
  pointsPerQuestion?: number;
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

interface ExamAttempt {
  id: string;
  exam_type: string;
  started_at: string;
  completed_at: string | null;
  current_section: string | null;
  current_teil: number;
  answers: Record<string, Record<number, string>>;
  writing_answers: Record<string, string>;
  exam_state: ExamState;
  results: Record<string, any>;
  time_spent_seconds: number;
  total_score: number;
  status: string;
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
  const [aiHelp, setAiHelp] = useState<Record<string, any>>({});
  const [loadingHelp, setLoadingHelp] = useState(false);
  
  // New state for persistence
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [examHistory, setExamHistory] = useState<ExamAttempt[]>([]);
  const [inProgressAttempt, setInProgressAttempt] = useState<ExamAttempt | null>(null);
  const [activeTab, setActiveTab] = useState<'exam' | 'history'>('exam');
  const [isPaused, setIsPaused] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  const sections = [
    { id: 'reading', icon: BookOpen, title: 'Leseverstehen', duration: 90, color: 'text-blue-500', maxPoints: 75 },
    { id: 'sprachbausteine', icon: PenTool, title: 'Sprachbausteine', duration: 30, color: 'text-purple-500', maxPoints: 30 },
    { id: 'listening', icon: Headphones, title: 'Hörverstehen', duration: 20, color: 'text-green-500', maxPoints: 75 },
    { id: 'writing', icon: PenTool, title: 'Schriftlicher Ausdruck', duration: 30, color: 'text-orange-500', maxPoints: 45 },
    { id: 'speaking', icon: Mic, title: 'Mündlicher Ausdruck', duration: 15, color: 'text-red-500', maxPoints: 75 }
  ];

  // Load exam history and check for in-progress attempts
  useEffect(() => {
    loadExamData();
  }, []);

  const loadExamData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load exam history
      const { data: historyData } = await supabase
        .from('telc_exam_attempts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('started_at', { ascending: false })
        .limit(20);

      if (historyData) {
        const typedHistory = historyData.map(item => ({
          ...item,
          answers: (item.answers || {}) as unknown as Record<string, Record<number, string>>,
          writing_answers: (item.writing_answers || {}) as unknown as Record<string, string>,
          exam_state: (item.exam_state || {}) as unknown as ExamState,
          results: (item.results || {}) as unknown as Record<string, any>
        }));
        setExamHistory(typedHistory);

        // Check for in-progress attempt
        const inProgress = typedHistory.find(a => a.status === 'in_progress');
        if (inProgress) {
          setInProgressAttempt(inProgress);
        }
      }
    } catch (error) {
      console.error('Error loading exam data:', error);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!currentAttemptId || isPaused) return;

    const autoSaveInterval = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [currentAttemptId, answers, writingAnswers, currentSection, currentTeil, isPaused]);

  // Timer effect
  useEffect(() => {
    if (currentSection && timeLeft[currentSection] > 0 && !showResults && !isPaused) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => ({ ...prev, [currentSection]: prev[currentSection] - 1 }));
        setTotalTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentSection, timeLeft, showResults, isPaused]);

  const saveProgress = useCallback(async () => {
    if (!currentAttemptId) return;

    try {
      const { error } = await supabase
        .from('telc_exam_attempts')
        .update({
          answers: answers as any,
          writing_answers: writingAnswers as any,
          exam_state: examState as any,
          results: results as any,
          current_section: currentSection,
          current_teil: currentTeil,
          time_spent_seconds: totalTimeSpent,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentAttemptId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [currentAttemptId, answers, writingAnswers, examState, results, currentSection, currentTeil, totalTimeSpent]);

  const createNewAttempt = async (mode: 'practice' | 'mock') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please log in", variant: "destructive" });
        return null;
      }

      const { data, error } = await supabase
        .from('telc_exam_attempts')
        .insert({
          user_id: session.user.id,
          exam_type: mode,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      toast({ title: "Error creating exam", description: error.message, variant: "destructive" });
      return null;
    }
  };

  const resumeAttempt = async (attempt: ExamAttempt) => {
    setExamMode(attempt.exam_type as 'practice' | 'mock');
    setCurrentAttemptId(attempt.id);
    setAnswers(attempt.answers || {});
    setWritingAnswers(attempt.writing_answers || {});
    const restoredState: ExamState = attempt.exam_state && typeof attempt.exam_state === 'object' 
      ? attempt.exam_state as ExamState
      : {
          reading: null,
          sprachbausteine: null,
          listening: null,
          writing: null,
          speaking: null
        };
    setExamState(restoredState);
    setResults(attempt.results || {});
    setCurrentSection(attempt.current_section);
    setCurrentTeil(attempt.current_teil || 0);
    setTotalTimeSpent(attempt.time_spent_seconds || 0);
    setInProgressAttempt(null);
    
    // Restore time left for current section
    if (attempt.current_section && attempt.exam_state) {
      const sectionContent = attempt.exam_state[attempt.current_section as keyof ExamState];
      if (sectionContent) {
        const sectionInfo = sections.find(s => s.id === attempt.current_section);
        const remainingTime = Math.max(0, (sectionInfo?.duration || 30) * 60 - (attempt.time_spent_seconds || 0));
        setTimeLeft({ [attempt.current_section]: remainingTime });
      }
    }

    toast({ title: "Exam resumed!", description: "Your progress has been restored." });
  };

  const pauseExam = async () => {
    setIsPaused(true);
    await saveProgress();
    toast({ title: "Exam paused", description: "You can resume anytime from the exam history." });
  };

  const unpauseExam = () => {
    setIsPaused(false);
  };

  const abandonAttempt = async () => {
    if (!currentAttemptId) return;

    try {
      await supabase
        .from('telc_exam_attempts')
        .update({ 
          status: 'abandoned',
          completed_at: new Date().toISOString()
        })
        .eq('id', currentAttemptId);

      resetExam();
      loadExamData();
      toast({ title: "Exam abandoned" });
    } catch (error) {
      console.error('Error abandoning exam:', error);
    }
  };

  const resetExam = () => {
    setExamMode(null);
    setCurrentSection(null);
    setCurrentTeil(0);
    setExamState({
      reading: null,
      sprachbausteine: null,
      listening: null,
      writing: null,
      speaking: null
    });
    setAnswers({});
    setWritingAnswers({});
    setResults({});
    setShowResults(false);
    setTimeLeft({});
    setCurrentAttemptId(null);
    setIsPaused(false);
    setTotalTimeSpent(0);
  };

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
    await saveProgress();
  };

  const handleAnswerSelect = (sectionId: string, questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] || {}), [questionId]: answer }
    }));

    // In practice mode, provide instant AI feedback
    if (examMode === 'practice') {
      const content = examState[sectionId as keyof ExamState];
      const teil = content?.teile.find(t => t.questions?.some(q => q.id === questionId));
      const question = teil?.questions?.find(q => q.id === questionId);

      const correctAnswerText = question
        ? (typeof question.correctAnswer === 'number'
            ? question.options?.[question.correctAnswer] ?? String(question.correctAnswer)
            : String(question.correctAnswer))
        : '';

      if (question && answer !== correctAnswerText) {
        requestAiHelp('hint', questionId, question, answer, teil?.text);
      }
    }
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
          const correctAnswerText = typeof q.correctAnswer === 'number'
            ? (q.options?.[q.correctAnswer] ?? String(q.correctAnswer))
            : String(q.correctAnswer);
          const isCorrect = userAnswer === correctAnswerText;
          if (isCorrect) correct++;
          return { ...q, userAnswer, isCorrect, correctAnswer: correctAnswerText };
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

      // Update attempt with results
      await saveProgress();

      toast({ title: `${content?.title} submitted!` });
      setCurrentSection(null);
      setShowResults(true);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const completeExam = async () => {
    if (!currentAttemptId) return;

    const totalPoints = getTotalPoints();
    
    try {
      await supabase
        .from('telc_exam_attempts')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_score: totalPoints,
          results: results as any,
          time_spent_seconds: totalTimeSpent
        })
        .eq('id', currentAttemptId);

      toast({ 
        title: "🎉 Exam Completed!", 
        description: `Final Score: ${totalPoints}/300 points` 
      });
      
      loadExamData();
    } catch (error) {
      console.error('Error completing exam:', error);
    }
  };

  const getTotalPoints = () => {
    return Object.values(results).reduce((sum, result) => sum + (result.earnedPoints || 0), 0);
  };

  const getMaxTotalPoints = () => {
    return 300;
  };

  const requestAiHelp = async (
    type: 'hint' | 'explanation',
    questionId: number,
    question: Question,
    userAnswer: string,
    text?: string
  ) => {
    setLoadingHelp(true);
    try {
      const correctAnswerText = typeof question.correctAnswer === 'number'
        ? (question.options?.[question.correctAnswer] ?? String(question.correctAnswer))
        : String(question.correctAnswer);

      const { data, error } = await supabase.functions.invoke('telc-practice-helper', {
        body: {
          type,
          question: question.question,
          userAnswer,
          correctAnswer: correctAnswerText,
          context: question.explanation,
          text
        }
      });


      if (error) throw error;

      setAiHelp(prev => ({
        ...prev,
        [questionId]: { ...data, type }
      }));
    } catch (error) {
      console.error('Error requesting AI help:', error);
      toast({
        title: "Error",
        description: "Could not get AI help. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingHelp(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Active section view
  if (currentSection && examState[currentSection as keyof ExamState]) {
    const content = examState[currentSection as keyof ExamState];
    const sectionInfo = sections.find(s => s.id === currentSection);
    const teil = content?.teile[currentTeil];
    
    return (
      <div className="min-h-screen gradient-hero">
        <Navbar />
        
        <div className="container max-w-5xl mx-auto p-4 mt-6">
          {/* Header with pause/resume */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex gap-2">
              <Button variant="outline" className="glass" onClick={() => setCurrentSection(null)}>
                Back to Overview
              </Button>
              {isPaused ? (
                <Button onClick={unpauseExam} className="gap-2">
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              ) : (
                <Button variant="outline" onClick={pauseExam} className="gap-2">
                  <Pause className="w-4 h-4" />
                  Pause Exam
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                {sectionInfo?.maxPoints} points
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-lg px-4 py-2 ${isPaused ? 'bg-yellow-500/20 text-yellow-500' : ''}`}
              >
                <Clock className="w-4 h-4 mr-2" />
                {isPaused ? 'PAUSED' : formatTime(timeLeft[currentSection] || 0)}
              </Badge>
            </div>
          </div>

          {/* Section-specific banner */}
          {sectionInfo && (
            <TelcSectionBanner
              sectionId={currentSection}
              title={content?.title || sectionInfo.title}
              subtitle={content?.instructions}
              icon={sectionInfo.icon}
              color={sectionInfo.color}
              maxPoints={sectionInfo.maxPoints}
              duration={sectionInfo.duration}
              currentTeil={currentTeil}
              totalTeile={content?.teile.length}
              timeRemaining={timeLeft[currentSection]}
              isPaused={isPaused}
            />
          )}

          {isPaused && (
            <Card className="glass-luxury border-warning/30 mb-6 animate-fade-in">
              <CardContent className="p-4 text-center">
                <Pause className="w-8 h-8 mx-auto mb-2 text-warning" />
                <p className="font-semibold">Exam Paused</p>
                <p className="text-sm text-muted-foreground">Your progress is saved. Click Resume to continue.</p>
              </CardContent>
            </Card>
          )}

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
          {teil && !isPaused && (
            <>
               <Card className="glass mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Teil {teil.teilNumber}: {teil.title}</CardTitle>
                      <CardDescription>{teil.instructions}</CardDescription>
                    </div>
                    {teil.maxPoints && (
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {teil.maxPoints} Punkte
                      </Badge>
                    )}
                  </div>
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
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{idx + 1}. {q.question}</CardTitle>
                          {q.points && (
                            <Badge variant="secondary">{q.points} Punkte</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
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

                        {/* Practice Mode AI Help */}
                        {examMode === 'practice' && (
                          <div className="pt-4 border-t space-y-3">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => requestAiHelp('hint', q.id, q, answers[currentSection]?.[q.id] || '', teil.text)}
                                disabled={loadingHelp}
                              >
                                {loadingHelp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                Get Hint
                              </Button>
                              {answers[currentSection]?.[q.id] && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => requestAiHelp('explanation', q.id, q, answers[currentSection]?.[q.id], teil.text)}
                                  disabled={loadingHelp}
                                >
                                  Explain Answer
                                </Button>
                              )}
                            </div>

                            {/* Show AI Help */}
                            {aiHelp[q.id] && (
                              <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="pt-4">
                                  {aiHelp[q.id].type === 'hint' && (
                                    <div className="space-y-2">
                                      <p className="text-sm font-semibold">💡 Hinweis:</p>
                                      <p className="text-sm">{aiHelp[q.id].hint}</p>
                                      {aiHelp[q.id].strategy && (
                                        <>
                                          <p className="text-sm font-semibold mt-3">📚 Strategie:</p>
                                          <p className="text-sm">{aiHelp[q.id].strategy}</p>
                                        </>
                                      )}
                                      {aiHelp[q.id].keyVocabulary?.length > 0 && (
                                        <>
                                          <p className="text-sm font-semibold mt-3">🔑 Wichtige Wörter:</p>
                                          <div className="flex flex-wrap gap-2">
                                            {aiHelp[q.id].keyVocabulary.map((word: string, i: number) => (
                                              <Badge key={i} variant="outline">{word}</Badge>
                                            ))}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                  
                                  {aiHelp[q.id].type === 'explanation' && (
                                    <div className="space-y-2">
                                      <p className="text-sm font-semibold">✅ Erklärung:</p>
                                      <p className="text-sm">{aiHelp[q.id].explanation}</p>
                                      {aiHelp[q.id].concept && (
                                        <>
                                          <p className="text-sm font-semibold mt-3">📖 Konzept:</p>
                                          <p className="text-sm">{aiHelp[q.id].concept}</p>
                                        </>
                                      )}
                                      {aiHelp[q.id].tips?.length > 0 && (
                                        <>
                                          <p className="text-sm font-semibold mt-3">💡 Tipps:</p>
                                          <ul className="text-sm list-disc pl-5 space-y-1">
                                            {aiHelp[q.id].tips.map((tip: string, i: number) => (
                                              <li key={i}>{tip}</li>
                                            ))}
                                          </ul>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        )}
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
          {!isPaused && (
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
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto p-4 mt-6 space-y-6">
        {/* Page Banner */}
        <PageBanner
          type="telc-exam"
          title="TELC B2 Full Mock Exam"
          subtitle="Complete simulation of the official TELC B2 exam with all 5 sections, authentic timing, and AI-powered evaluation"
          badge="Official Format"
          icon={GraduationCap}
        />

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'exam' | 'history')} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="exam" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Exam
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History ({examHistory.filter(h => h.status === 'completed').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'history' ? (
          // Exam History View
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6 text-gradient">Your Exam History</h2>
            
            {examHistory.length === 0 ? (
              <Card className="glass p-8 text-center">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No exam attempts yet. Start your first exam!</p>
                <Button onClick={() => setActiveTab('exam')} className="mt-4 gradient-primary">
                  Start Exam
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {examHistory.map((attempt) => (
                  <Card key={attempt.id} className={`glass hover:shadow-lg transition-all ${attempt.status === 'in_progress' ? 'border-primary/50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            attempt.status === 'completed' ? 'bg-emerald-500/20' : 
                            attempt.status === 'in_progress' ? 'bg-amber-500/20' : 'bg-destructive/20'
                          }`}>
                            {attempt.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : attempt.status === 'in_progress' ? (
                              <Clock className="w-5 h-5 text-amber-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold capitalize">{attempt.exam_type} Mode</p>
                            <p className="text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {formatDate(attempt.started_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {attempt.status === 'completed' && (
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">{attempt.total_score}/300</p>
                              <Badge variant={attempt.total_score >= 180 ? 'default' : 'destructive'}>
                                {getGrade(Math.round((attempt.total_score / 300) * 100))}
                              </Badge>
                            </div>
                          )}
                          
                          {attempt.status === 'in_progress' && (
                            <Button onClick={() => resumeAttempt(attempt)} className="gradient-primary gap-2">
                              <Play className="w-4 h-4" />
                              Resume
                            </Button>
                          )}
                          
                          {attempt.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {attempt.status === 'completed' && (
                        <div className="mt-3 pt-3 border-t">
                          <Progress value={(attempt.total_score / 300) * 100} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Time: {Math.round(attempt.time_spent_seconds / 60)} min</span>
                            <span>{Math.round((attempt.total_score / 300) * 100)}%</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Resume Card */}
            {inProgressAttempt && !examMode && (
              <Card className="glass-luxury border-primary/30 mb-6 animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/20">
                        <RotateCcw className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Resume Your Exam</h3>
                        <p className="text-sm text-muted-foreground">
                          You have an unfinished {inProgressAttempt.exam_type} exam from {formatDate(inProgressAttempt.started_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        supabase.from('telc_exam_attempts')
                          .update({ status: 'abandoned' })
                          .eq('id', inProgressAttempt.id)
                          .then(() => {
                            setInProgressAttempt(null);
                            loadExamData();
                          });
                      }}>
                        Discard
                      </Button>
                      <Button onClick={() => resumeAttempt(inProgressAttempt)} className="gradient-primary gap-2">
                        <Play className="w-4 h-4" />
                        Continue Exam
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mode Selection */}
            {!examMode && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold mb-3 text-gradient">TELC B2 Exam</h1>
                  <p className="text-muted-foreground">Choose your exam mode</p>
                </div>
                
                <div className="grid gap-6">
                  <Card 
                    className="glass hover:shadow-xl transition-all cursor-pointer hover:border-primary/50" 
                    onClick={async () => {
                      const attemptId = await createNewAttempt('practice');
                      if (attemptId) {
                        setCurrentAttemptId(attemptId);
                        setExamMode('practice');
                      }
                    }}
                  >
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
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span>Auto-save progress</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card 
                    className="glass hover:shadow-xl transition-all cursor-pointer hover:border-accent/50" 
                    onClick={async () => {
                      const attemptId = await createNewAttempt('mock');
                      if (attemptId) {
                        setCurrentAttemptId(attemptId);
                        setExamMode('mock');
                      }
                    }}
                  >
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
                        <li className="flex items-center gap-2">
                          <Pause className="w-4 h-4 text-accent" />
                          <span>Pause & resume anytime</span>
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
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={resetExam}>
                      Change Mode
                    </Button>
                    <Button variant="outline" onClick={abandonAttempt} className="text-destructive">
                      Abandon Exam
                    </Button>
                  </div>
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
                      
                      <div className="flex gap-2">
                        <Button onClick={exportToPDF} variant="outline" className="flex-1">
                          <Download className="w-4 h-4 mr-2" />
                          Export Results as PDF
                        </Button>
                        {Object.keys(results).length === sections.length && (
                          <Button onClick={completeExam} className="gradient-primary flex-1">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete Exam
                          </Button>
                        )}
                      </div>
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
          </>
        )}
      </div>
    </div>
  );
};

export default TelcExam;
