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
  Volume2
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

interface SectionContent {
  title: string;
  text?: string;
  script?: string;
  task?: string;
  questions?: Question[];
  instructions: string;
  timeLimit: number;
  requirements?: string[];
  usefulPhrases?: string[];
  wordCount?: number;
  discussionPoints?: string[];
  stimulusMaterial?: string;
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
  const [currentSection, setCurrentSection] = useState<string | null>(null);
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
    { id: 'reading', icon: BookOpen, title: 'Leseverstehen', duration: 90, color: 'text-blue-500' },
    { id: 'sprachbausteine', icon: PenTool, title: 'Sprachbausteine', duration: 30, color: 'text-purple-500' },
    { id: 'listening', icon: Headphones, title: 'Hörverstehen', duration: 20, color: 'text-green-500' },
    { id: 'writing', icon: PenTool, title: 'Schriftlicher Ausdruck', duration: 30, color: 'text-orange-500' },
    { id: 'speaking', icon: Mic, title: 'Mündlicher Ausdruck', duration: 15, color: 'text-red-500' }
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
      toast({ title: `${sectionId} section loaded!` });
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
            task: content?.task,
            userAnswer: writingAnswers[sectionId] || ''
          }
        });

        if (error) throw error;
        setResults(prev => ({ ...prev, [sectionId]: data }));
      } else {
        const questions = content?.questions || [];
        let correct = 0;
        const sectionResults = questions.map((q: any) => {
          const userAnswer = answers[sectionId]?.[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          if (isCorrect) correct++;
          return { ...q, userAnswer, isCorrect };
        });

        setResults(prev => ({
          ...prev,
          [sectionId]: {
            score: (correct / questions.length) * 100,
            correctAnswers: correct,
            totalQuestions: questions.length,
            results: sectionResults
          }
        }));
      }

      toast({ title: `${sectionId} section submitted!` });
      setCurrentSection(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Cover page
    doc.setFontSize(24);
    doc.setTextColor(147, 51, 234);
    doc.text('TELC B2 Exam Results', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
    
    // Overall score
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('Overall Performance', 20, 20);
    
    const overallData = Object.keys(results).map(key => [
      sections.find(s => s.id === key)?.title || key,
      `${Math.round(results[key].score || 0)}%`
    ]);
    
    autoTable(doc, {
      head: [['Section', 'Score']],
      body: overallData,
      startY: 30,
      headStyles: { fillColor: [147, 51, 234] }
    });
    
    // Detailed results per section
    Object.keys(results).forEach((sectionId, index) => {
      if (index > 0 || overallData.length > 0) doc.addPage();
      
      const sectionTitle = sections.find(s => s.id === sectionId)?.title || sectionId;
      doc.setFontSize(16);
      doc.text(sectionTitle, 20, 20);
      
      const result = results[sectionId];
      if (result.results) {
        const tableData = result.results.map((r: any, idx: number) => [
          `Q${idx + 1}`,
          r.userAnswer || 'N/A',
          r.correctAnswer,
          r.isCorrect ? 'Correct' : 'Wrong'
        ]);
        
        autoTable(doc, {
          head: [['#', 'Your Answer', 'Correct Answer', 'Result']],
          body: tableData,
          startY: 30,
          headStyles: { fillColor: [147, 51, 234] }
        });
      }
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
    
    return (
      <div className="min-h-screen gradient-hero">
        <Navbar />
        
        <div className="container max-w-4xl mx-auto p-4 mt-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" className="glass" onClick={() => setCurrentSection(null)}>
              Back to Overview
            </Button>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(timeLeft[currentSection] || 0)}
            </Badge>
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

          {/* Reading/Sprachbausteine Content */}
          {(currentSection === 'reading' || currentSection === 'sprachbausteine') && content?.text && (
            <Card className="glass mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Text</CardTitle>
                  <AudioButton text={content.text} lang="de-DE" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-foreground">
                  {content.text.split('\n').map((para, idx) => (
                    <p key={idx} className="mb-4">{para}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Listening Content */}
          {currentSection === 'listening' && content?.script && (
            <Card className="glass mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Audio Script
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AudioButton text={content.script} lang="de-DE" size="lg" />
              </CardContent>
            </Card>
          )}

          {/* Questions */}
          {content?.questions && (
            <div className="space-y-4 mb-6">
              {content.questions.map((q, idx) => (
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

          {/* Writing Section */}
          {currentSection === 'writing' && (
            <Card className="glass mb-6">
              <CardHeader>
                <CardTitle>Writing Task</CardTitle>
                <CardDescription>{content?.task}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {content?.requirements && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
                    <ul className="text-sm space-y-1">
                      {content.requirements.map((req, idx) => (
                        <li key={idx}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Textarea
                  value={writingAnswers[currentSection] || ''}
                  onChange={(e) => setWritingAnswers(prev => ({ ...prev, [currentSection]: e.target.value }))}
                  placeholder="Write your answer in German..."
                  className="min-h-[300px]"
                />
                <div className="text-sm text-muted-foreground">
                  Word count: {(writingAnswers[currentSection] || '').split(/\s+/).filter(Boolean).length} / {content?.wordCount}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Speaking Section */}
          {currentSection === 'speaking' && (
            <Card className="glass mb-6">
              <CardHeader>
                <CardTitle>Speaking Task</CardTitle>
                <CardDescription>{content?.task}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {content?.discussionPoints && (
                  <div>
                    <h4 className="font-semibold mb-2">Discussion Points:</h4>
                    <ul className="space-y-1">
                      {content.discussionPoints.map((point, idx) => (
                        <li key={idx}>• {point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Textarea
                  value={writingAnswers[currentSection] || ''}
                  onChange={(e) => setWritingAnswers(prev => ({ ...prev, [currentSection]: e.target.value }))}
                  placeholder="Type your speaking response here (or record notes)..."
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={() => submitSection(currentSection)}
            disabled={loading}
            size="lg"
            className="w-full gradient-primary"
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto p-4 mt-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gradient">TELC B2 Mock Exam</h1>
          <p className="text-muted-foreground mb-4">
            AI-Powered Complete Examination with Instant Feedback
          </p>
          {Object.keys(results).length > 0 && (
            <Button onClick={exportToPDF} className="gradient-accent">
              <Download className="w-4 h-4 mr-2" />
              Export Results to PDF
            </Button>
          )}
        </div>

        {/* Sections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map(section => {
            const Icon = section.icon;
            const hasContent = examState[section.id as keyof ExamState] !== null;
            const hasResults = results[section.id];
            
            return (
              <Card key={section.id} className="glass hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-6 h-6 ${section.color}`} />
                    {hasResults && (
                      <Badge variant={hasResults.score >= 60 ? 'default' : 'destructive'}>
                        {Math.round(hasResults.score)}%
                      </Badge>
                    )}
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {section.duration} min
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasResults && (
                    <div className="p-3 bg-background/50 rounded-lg mb-3">
                      <div className="flex items-center justify-between mb-2">
                        {hasResults.score >= 60 ? (
                          <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Passed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-destructive">
                            <XCircle className="w-5 h-5" />
                            <span className="font-semibold">Needs Improvement</span>
                          </div>
                        )}
                      </div>
                      {hasResults.correctAnswers && (
                        <p className="text-sm text-muted-foreground">
                          {hasResults.correctAnswers}/{hasResults.totalQuestions} correct
                        </p>
                      )}
                    </div>
                  )}
                  
                  <Button
                    onClick={() => startSection(section.id)}
                    disabled={loading}
                    className="w-full"
                    variant={hasContent ? 'outline' : 'default'}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : hasResults ? (
                      'Review'
                    ) : hasContent ? (
                      'Continue'
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Start Section
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Instructions */}
        <Card className="glass mt-8">
          <CardHeader>
            <CardTitle>About the TELC B2 Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              This is a complete AI-powered mock exam that simulates the official TELC B2 German examination.
              Each section is generated dynamically and evaluated using advanced AI.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Features:</h4>
                <ul className="space-y-1">
                  <li>• Realistic exam format</li>
                  <li>• Instant AI evaluation</li>
                  <li>• Detailed feedback</li>
                  <li>• Export results to PDF</li>
                  <li>• Practice mode available</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Tips:</h4>
                <ul className="space-y-1">
                  <li>• Complete sections in order</li>
                  <li>• Watch the time limits</li>
                  <li>• Review explanations carefully</li>
                  <li>• Retake sections to improve</li>
                  <li>• Track your progress over time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelcExam;
