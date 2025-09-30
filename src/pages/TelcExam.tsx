import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic, 
  CheckCircle, 
  Clock,
  PlayCircle,
  BookMarked,
  Target
} from "lucide-react";

const TelcExam = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'practice' | 'full' | null>(null);

  const examSections = [
    {
      id: 'reading',
      title: 'Leseverstehen',
      titleEn: 'Reading Comprehension',
      icon: BookOpen,
      duration: '90 min',
      tasks: 3,
      points: 25,
      description: 'Read authentic texts and answer comprehension questions',
      color: 'bg-blue-500'
    },
    {
      id: 'sprachbausteine',
      title: 'Sprachbausteine',
      titleEn: 'Language Elements',
      icon: BookMarked,
      duration: '30 min',
      tasks: 2,
      points: 25,
      description: 'Complete texts with correct grammar and vocabulary',
      color: 'bg-purple-500'
    },
    {
      id: 'listening',
      title: 'Hörverstehen',
      titleEn: 'Listening Comprehension',
      icon: Headphones,
      duration: '20 min',
      tasks: 3,
      points: 25,
      description: 'Listen to audio passages and answer questions',
      color: 'bg-green-500'
    },
    {
      id: 'writing',
      title: 'Schriftlicher Ausdruck',
      titleEn: 'Written Expression',
      icon: PenTool,
      duration: '30 min',
      tasks: 1,
      points: 25,
      description: 'Write a formal text based on given prompts',
      color: 'bg-orange-500'
    },
    {
      id: 'speaking',
      title: 'Mündlicher Ausdruck',
      titleEn: 'Oral Expression',
      icon: Mic,
      duration: '15 min',
      tasks: 3,
      points: 25,
      description: 'Demonstrate speaking skills in various situations',
      color: 'bg-red-500'
    }
  ];

  const modes = [
    {
      id: 'practice',
      title: 'Practice Mode',
      titleDe: 'Übungsmodus',
      description: 'Practice individual sections with instant feedback',
      descriptionDe: 'Übe einzelne Bereiche mit sofortigem Feedback',
      icon: Target,
      features: [
        'Choose specific sections',
        'Unlimited attempts',
        'Detailed explanations',
        'Progress tracking'
      ]
    },
    {
      id: 'full',
      title: 'Full Exam Mode',
      titleDe: 'Vollständige Prüfung',
      description: 'Take the complete TELC B2 exam under real conditions',
      descriptionDe: 'Absolviere die komplette TELC B2 Prüfung unter realen Bedingungen',
      icon: PlayCircle,
      features: [
        'All 5 sections',
        'Real time limits',
        'Official format',
        'Final score and certificate'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            TELC B2 Mock Exam
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            AI-Powered Exam Simulation with Comprehensive Feedback
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge variant="outline" className="text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Authentic Format
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Target className="w-4 h-4 mr-1" />
              AI Evaluation
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Clock className="w-4 h-4 mr-1" />
              Real Timing
            </Badge>
          </div>
        </div>

        {/* Mode Selection */}
        {!selectedMode && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Mode</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Card 
                    key={mode.id}
                    className="glass hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                    onClick={() => setSelectedMode(mode.id as 'practice' | 'full')}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{mode.titleDe}</CardTitle>
                          <CardDescription className="text-xs">{mode.title}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {mode.descriptionDe}
                      </p>
                      <ul className="space-y-2">
                        {mode.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Exam Sections */}
        {selectedMode === 'practice' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Select Section to Practice</h2>
              <Button variant="outline" onClick={() => setSelectedMode(null)}>
                Change Mode
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card 
                    key={section.id}
                    className="glass hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(`/telc-exam/${section.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-3 rounded-lg ${section.color} bg-opacity-10`}>
                          <Icon className={`w-6 h-6 ${section.color.replace('bg-', 'text-')}`} />
                        </div>
                        <Badge>{section.points} pts</Badge>
                      </div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription className="text-xs">{section.titleEn}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {section.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{section.duration}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {section.tasks} {section.tasks === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Full Exam Mode */}
        {selectedMode === 'full' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Full TELC B2 Examination</h2>
              <Button variant="outline" onClick={() => setSelectedMode(null)}>
                Change Mode
              </Button>
            </div>
            
            <Card className="glass mb-8">
              <CardHeader>
                <CardTitle>Exam Information</CardTitle>
                <CardDescription>Complete all 5 sections in order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Duration</span>
                    <Badge variant="outline">~3 hours</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Points</span>
                    <Badge variant="outline">125 points</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Passing Score</span>
                    <Badge variant="outline">60% (75 points)</Badge>
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    You haven't started yet. Click below to begin your exam.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {examSections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Card key={section.id} className="glass">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${section.color} bg-opacity-10`}>
                          <Icon className={`w-6 h-6 ${section.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{section.title}</h3>
                          <p className="text-sm text-muted-foreground">{section.titleEn}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Duration</div>
                          <div className="font-semibold">{section.duration}</div>
                        </div>
                        <Badge variant="outline">{section.points} pts</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Button 
                size="lg" 
                className="glass"
                onClick={() => navigate('/telc-exam/reading')}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Full Exam
              </Button>
            </div>
          </div>
        )}

        {/* Instructions Card */}
        {!selectedMode && (
          <Card className="glass max-w-4xl mx-auto mt-12">
            <CardHeader>
              <CardTitle>About TELC B2 Exam</CardTitle>
              <CardDescription>What to expect in this mock examination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The TELC B2 German exam tests your language skills at an upper-intermediate level. 
                This mock exam uses AI to generate realistic questions and provide detailed feedback on your performance.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">What You'll Practice:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Reading comprehension of authentic texts</li>
                    <li>• Grammar and vocabulary in context</li>
                    <li>• Listening to various audio formats</li>
                    <li>• Writing formal correspondence</li>
                    <li>• Speaking in structured situations</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">AI Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Instant feedback on multiple-choice</li>
                    <li>• Detailed writing corrections</li>
                    <li>• Pronunciation analysis</li>
                    <li>• Personalized improvement tips</li>
                    <li>• Progress tracking over time</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TelcExam;
