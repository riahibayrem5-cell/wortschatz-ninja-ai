import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { useLanguage } from "@/contexts/LanguageContext";
import AudioButton from "@/components/AudioButton";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  BookOpen,
  Mic,
  Volume2,
  Sparkles
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface ExamContent {
  title?: string;
  text?: string;
  script?: string;
  context?: string;
  task?: string;
  questions?: Question[];
  gaps?: Array<{
    id: number;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
  timeLimit: number;
  instructions: string;
  [key: string]: any;
}

const TelcExamSection = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ExamContent | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [writingAnswer, setWritingAnswer] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState("");

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, showResults]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-telc-exam', {
        body: { section, difficulty: 'b2' }
      });

      if (error) throw error;
      
      setContent(data);
      setTimeLeft(data.timeLimit * 60); // Convert to seconds
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: "Error",
        description: "Failed to load exam content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (section === 'writing' || section === 'speaking') {
        const { data, error } = await supabase.functions.invoke('evaluate-telc-answer', {
          body: {
            section,
            task: content?.task || content?.title,
            userAnswer: section === 'writing' ? writingAnswer : audioTranscript
          }
        });

        if (error) throw error;
        setEvaluation(data);
      } else {
        // Auto-grade multiple choice
        const questions = content?.questions || content?.gaps || [];
        let correct = 0;
        const results = questions.map((q: any) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          if (isCorrect) correct++;
          return {
            ...q,
            userAnswer,
            isCorrect
          };
        });

        setEvaluation({
          score: (correct / questions.length) * 100,
          correctAnswers: correct,
          totalQuestions: questions.length,
          results
        });
      }

      setShowResults(true);
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast({
        title: "Error",
        description: "Failed to submit answers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      // In a real implementation, you would use Web Audio API
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak clearly in German. Recording will be transcribed.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    // Here you would send audio to speech-to-text function
    toast({
      title: "Processing",
      description: "Transcribing your speech...",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-muted-foreground mb-6">
            Click the button below to generate your TELC B2 {section} exam section.
          </p>
          <Button 
            onClick={loadContent} 
            disabled={loading}
            className="gradient-primary hover:opacity-90"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Exam...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Exam Content
              </>
            )}
          </Button>
          <div className="mt-4">
            <Button 
              onClick={() => navigate('/telc-exam')} 
              variant="outline"
              className="glass"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exam Selection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with Timer */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/telc-exam')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            {formatTime(timeLeft)}
          </Badge>
        </div>

        <Card className="glass mb-6">
          <CardHeader>
            <CardTitle>{content.title}</CardTitle>
            <CardDescription>{content.instructions}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={showResults ? 100 : (currentQuestion / (content.questions?.length || 1)) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>

        {!showResults ? (
          <>
            {/* Reading/Listening Content */}
            {(section === 'reading' || section === 'sprachbausteine') && content.text && (
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

            {section === 'listening' && content.script && (
              <Card className="glass mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Audio Script
                  </CardTitle>
                  {content.context && (
                    <CardDescription>{content.context}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <AudioButton text={content.script} lang="de-DE" size="lg" />
                  <p className="text-sm text-muted-foreground mt-4">
                    Listen carefully. You can play the audio multiple times.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Questions for Reading/Listening/Sprachbausteine */}
            {content.questions && content.questions.length > 0 && (
              <div className="space-y-6">
                {content.questions.map((question, idx) => (
                  <Card key={question.id} className="glass">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {idx + 1}. {question.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={answers[question.id]}
                        onValueChange={(value) => handleAnswerSelect(question.id, value)}
                      >
                        {question.options.map((option) => {
                          const optionKey = option[0]; // a, b, c, d
                          return (
                            <div key={option} className="flex items-center space-x-2 mb-3">
                              <RadioGroupItem value={optionKey} id={`q${question.id}-${optionKey}`} />
                              <Label 
                                htmlFor={`q${question.id}-${optionKey}`}
                                className="cursor-pointer flex-1"
                              >
                                {option}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Writing Task */}
            {section === 'writing' && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Writing Task</CardTitle>
                  <CardDescription>{content.task}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.requirements && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {content.requirements.map((req: string, idx: number) => (
                          <li key={idx}>• {req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {content.usefulPhrases && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Useful Phrases:</h4>
                      <div className="flex flex-wrap gap-2">
                        {content.usefulPhrases.map((phrase: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Textarea
                    value={writingAnswer}
                    onChange={(e) => setWritingAnswer(e.target.value)}
                    placeholder="Write your answer here in German..."
                    className="min-h-[300px] font-mono"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Word count: {writingAnswer.split(/\s+/).filter(Boolean).length}</span>
                    <span>Target: ~{content.wordCount} words</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Speaking Task */}
            {section === 'speaking' && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Speaking Task</CardTitle>
                  <CardDescription>{content.task}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.stimulusMaterial && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">{content.stimulusMaterial}</p>
                    </div>
                  )}

                  {content.discussionPoints && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Discussion Points:</h4>
                      <ul className="text-sm space-y-1">
                        {content.discussionPoints.map((point: string, idx: number) => (
                          <li key={idx}>• {point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-center py-8">
                    {!isRecording ? (
                      <Button size="lg" onClick={startRecording}>
                        <Mic className="w-5 h-5 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button size="lg" variant="destructive" onClick={stopRecording}>
                        <XCircle className="w-5 h-5 mr-2" />
                        Stop Recording
                      </Button>
                    )}
                  </div>

                  {audioTranscript && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Transcript:</h4>
                      <p className="text-sm">{audioTranscript}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="mt-8 text-center">
              <Button 
                size="lg"
                onClick={handleSubmit}
                disabled={loading}
                className="glass"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Answers
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          /* Results */
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {evaluation.score >= 60 ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  Your Score: {Math.round(evaluation.score)}%
                </CardTitle>
                <CardDescription>
                  {evaluation.grade && `Grade: ${evaluation.grade}`}
                  {evaluation.correctAnswers !== undefined && 
                    ` - ${evaluation.correctAnswers}/${evaluation.totalQuestions} correct`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={evaluation.score} className="h-3" />
              </CardContent>
            </Card>

            {/* Detailed Feedback for Writing/Speaking */}
            {(section === 'writing' || section === 'speaking') && evaluation.taskCompletion && (
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(evaluation).map(([key, value]: [string, any]) => {
                  if (key === 'score' || key === 'grade' || key === 'strengths' || 
                      key === 'improvements' || !value?.score) return null;
                  
                  return (
                    <Card key={key} className="glass">
                      <CardHeader>
                        <CardTitle className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold">{value.score}/10</span>
                          <Progress value={value.score * 10} className="h-2 flex-1 ml-4" />
                        </div>
                        <p className="text-sm text-muted-foreground">{value.feedback}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Multiple Choice Results */}
            {evaluation.results && (
              <div className="space-y-4">
                {evaluation.results.map((result: any, idx: number) => (
                  <Card key={result.id} className="glass">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Question {idx + 1}</CardTitle>
                        {result.isCorrect ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Incorrect
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{result.question}</CardDescription>
                    </CardHeader>
                    {!result.isCorrect && (
                      <CardContent>
                        <p className="text-sm mb-2">
                          <span className="font-semibold">Your answer:</span> {result.userAnswer}
                        </p>
                        <p className="text-sm mb-2">
                          <span className="font-semibold text-green-600">Correct answer:</span> {result.correctAnswer}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.explanation}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Strengths and Improvements */}
            {(evaluation.strengths || evaluation.improvements) && (
              <div className="grid md:grid-cols-2 gap-6">
                {evaluation.strengths && (
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-sm text-green-600">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {evaluation.strengths.map((strength: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {evaluation.improvements && (
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-sm text-orange-600">Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {evaluation.improvements.map((improvement: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/telc-exam')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exam
              </Button>
              <Button onClick={() => window.location.reload()}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TelcExamSection;
