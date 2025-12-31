import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  FileText,
  Target,
  Clock,
  ChevronRight,
  Star,
  Award,
  Play,
  CheckCircle2,
  Sparkles,
  Brain,
  MessageSquare,
  Users,
  Lightbulb
} from "lucide-react";

interface TelcSection {
  id: string;
  title: string;
  titleDe: string;
  icon: any;
  color: string;
  bgColor: string;
  duration: number;
  maxPoints: number;
  teile: {
    number: number;
    title: string;
    description: string;
    tips: string[];
    skills: string[];
  }[];
}

const telcSections: TelcSection[] = [
  {
    id: "lesen",
    title: "Reading Comprehension",
    titleDe: "Leseverstehen",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    duration: 90,
    maxPoints: 75,
    teile: [
      {
        number: 1,
        title: "Globalverstehen",
        description: "Match 5 headings to newspaper articles. You're testing your ability to understand the main idea of texts.",
        tips: [
          "Read all headings first before looking at texts",
          "Focus on the main topic, not details",
          "Look for key words that connect heading and text",
          "One heading won't be used - eliminate as you go"
        ],
        skills: ["Skimming", "Main idea identification", "Vocabulary range"]
      },
      {
        number: 2,
        title: "Detailverstehen",
        description: "Read a longer text (newspaper article, magazine) and answer 5 multiple-choice questions about specific details.",
        tips: [
          "Read questions before the text",
          "Underline key information while reading",
          "Answers appear in the same order as in text",
          "Watch for distractors - options that seem correct"
        ],
        skills: ["Scanning", "Detail comprehension", "Inference"]
      },
      {
        number: 3,
        title: "Selektives Verstehen",
        description: "Match 10 situations to advertisements or short texts. Find the correct offer for each person's needs.",
        tips: [
          "Understand what each person needs specifically",
          "Eliminate options that don't match key requirements",
          "Pay attention to conditions and restrictions",
          "Some options won't be used"
        ],
        skills: ["Selective reading", "Matching", "Quick comprehension"]
      }
    ]
  },
  {
    id: "sprachbausteine",
    title: "Language Elements",
    titleDe: "Sprachbausteine",
    icon: PenTool,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    duration: 30,
    maxPoints: 30,
    teile: [
      {
        number: 1,
        title: "Grammatik im Kontext",
        description: "Fill in 10 gaps in a text choosing from 3 options each. Tests grammar in context - cases, verb forms, prepositions.",
        tips: [
          "Read the entire text first for context",
          "Look at what comes before AND after the gap",
          "Check if the gap needs a specific case",
          "Pay attention to verb tenses and moods"
        ],
        skills: ["Grammar accuracy", "Case system", "Prepositions", "Verb conjugation"]
      },
      {
        number: 2,
        title: "Wortschatz und Struktur",
        description: "Complete 10 gaps in a formal letter or text. Choose from a word bank with more options than gaps.",
        tips: [
          "Identify the type of word needed (verb, noun, connector)",
          "Check collocations - words that go together",
          "Formal language is expected - avoid casual expressions",
          "Eliminate options after using them"
        ],
        skills: ["Vocabulary", "Collocations", "Formal register", "Text coherence"]
      }
    ]
  },
  {
    id: "hoeren",
    title: "Listening Comprehension",
    titleDe: "Hörverstehen",
    icon: Headphones,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    duration: 20,
    maxPoints: 75,
    teile: [
      {
        number: 1,
        title: "Globalverstehen",
        description: "Listen to 5 short statements (announcements, messages) and match them to topics or speakers. Each is heard once.",
        tips: [
          "Read all options before listening",
          "Focus on the main message, not every word",
          "Take quick notes on key words",
          "Trust your first instinct"
        ],
        skills: ["Global understanding", "Quick comprehension", "Note-taking"]
      },
      {
        number: 2,
        title: "Detailverstehen",
        description: "Listen to a longer text (interview, report) twice and answer 10 true/false/not stated questions.",
        tips: [
          "Read questions during the pause before audio",
          "First listening: understand the overall content",
          "Second listening: focus on specific details",
          "'Not stated' = information not mentioned at all"
        ],
        skills: ["Detail comprehension", "True/False judgment", "Careful listening"]
      },
      {
        number: 3,
        title: "Selektives Verstehen",
        description: "Listen to 5 short dialogues or monologues. Answer a question for each with multiple-choice options.",
        tips: [
          "Read the question and options before each audio",
          "Focus on the specific information asked",
          "Listen for tone and attitude clues",
          "Each recording is heard once only"
        ],
        skills: ["Selective listening", "Quick decision-making", "Context understanding"]
      }
    ]
  },
  {
    id: "schreiben",
    title: "Written Expression",
    titleDe: "Schriftlicher Ausdruck",
    icon: FileText,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    duration: 30,
    maxPoints: 45,
    teile: [
      {
        number: 1,
        title: "Beschwerde / Formeller Brief",
        description: "Write a semi-formal letter (usually a complaint or inquiry) responding to a situation. 150+ words expected.",
        tips: [
          "Include: Anrede, Betreff, Einleitung, Hauptteil, Schluss, Gruß",
          "Address ALL points mentioned in the task",
          "Use formal register (Sie-Form)",
          "Structure: situation → problem → request/solution",
          "Use connecting words for coherence"
        ],
        skills: ["Formal letter writing", "Complaint formulation", "Argumentation", "Text structure"]
      }
    ]
  },
  {
    id: "sprechen",
    title: "Oral Expression",
    titleDe: "Mündlicher Ausdruck",
    icon: Mic,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    duration: 15,
    maxPoints: 75,
    teile: [
      {
        number: 1,
        title: "Präsentation",
        description: "Present a topic for about 4 minutes. You'll have preparation time to organize your ideas.",
        tips: [
          "Structure: Einleitung → Hauptpunkte → eigene Meinung → Schluss",
          "Use signposting language (Erstens, Darüber hinaus, Abschließend)",
          "Speak clearly and at a natural pace",
          "Make eye contact with your partner and examiners",
          "Prepare 2-3 key examples or personal experiences"
        ],
        skills: ["Monologue", "Topic presentation", "Structuring ideas", "Fluency"]
      },
      {
        number: 2,
        title: "Diskussion",
        description: "Discuss the presentation topic with your partner. React to their ideas and share your own opinions.",
        tips: [
          "Listen actively to your partner",
          "Agree and disagree politely",
          "Ask follow-up questions",
          "Give reasons for your opinions",
          "Use phrases like: Ich bin der Meinung, dass... / Da stimme ich zu, aber..."
        ],
        skills: ["Interactive discussion", "Opinion expression", "Active listening", "Reacting"]
      },
      {
        number: 3,
        title: "Problemlösung",
        description: "Work with your partner to solve a problem or plan something together. You'll receive a situation card.",
        tips: [
          "Read the task carefully and understand all constraints",
          "Make suggestions: Wir könnten... / Wie wäre es, wenn...?",
          "Consider pros and cons of options",
          "Work towards a joint decision",
          "Summarize what you've agreed on"
        ],
        skills: ["Negotiation", "Problem-solving", "Cooperation", "Decision-making"]
      }
    ]
  }
];

interface Props {
  userProgress?: Record<string, number>;
}

const TelcVorbereitungSection = ({ userProgress = {} }: Props) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleStartPractice = (sectionId: string, teilNumber?: number) => {
    const params = new URLSearchParams({
      section: sectionId,
      ...(teilNumber && { teil: teilNumber.toString() })
    });
    navigate(`/telc-exam?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            TELC B2 Vorbereitung
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive exam preparation for every section and Teil
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/telc-exam')}
          className="group"
        >
          <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          Full Mock Exam
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Exam Overview Card */}
      <Card className="glass-luxury border-primary/20 overflow-hidden">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {telcSections.map((section) => {
              const Icon = section.icon;
              const progress = userProgress[section.id] || 0;
              return (
                <div
                  key={section.id}
                  className={`p-4 rounded-xl ${section.bgColor} cursor-pointer hover:scale-105 transition-all duration-300`}
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                >
                  <Icon className={`h-6 w-6 ${section.color} mb-2`} />
                  <p className="font-medium text-sm">{section.titleDe}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={progress} className="h-1 flex-1" />
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{section.duration} min</span>
                    <span>•</span>
                    <span>{section.maxPoints} Pkt</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Section Cards */}
      <Tabs defaultValue="lesen" className="w-full">
        <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
          {telcSections.map((section) => {
            const Icon = section.icon;
            return (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className={`data-[state=active]:${section.bgColor} data-[state=active]:${section.color} flex items-center gap-2 px-4 py-2`}
              >
                <Icon className="h-4 w-4" />
                {section.titleDe}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {telcSections.map((section) => {
          const Icon = section.icon;
          return (
            <TabsContent key={section.id} value={section.id} className="space-y-4">
              <Card className={`border-l-4 ${section.color.replace('text-', 'border-')}`}>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${section.color}`} />
                        {section.title}
                        <span className="text-muted-foreground">/ {section.titleDe}</span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {section.teile.length} Teil{section.teile.length > 1 ? 'e' : ''} • {section.duration} Minuten • {section.maxPoints} Punkte maximum
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => handleStartPractice(section.id)}
                      className="gradient-primary"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Practice All
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Teil Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {section.teile.map((teil) => (
                  <Card key={teil.number} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Badge variant="outline" className={section.color}>
                            Teil {teil.number}
                          </Badge>
                          {teil.title}
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartPractice(section.id, teil.number)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription className="mt-2">
                        {teil.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Skills */}
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-primary" />
                          Skills Tested
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {teil.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Tips */}
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          Exam Tips
                        </p>
                        <ul className="space-y-1">
                          {teil.tips.slice(0, 3).map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onClick={() => handleStartPractice(section.id, teil.number)}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Practice Teil {teil.number}
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Section-specific Strategy Card */}
              {section.id === "schreiben" && (
                <Card className="bg-orange-500/5 border-orange-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-orange-500" />
                      Beschwerde Brief Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Letter Format</h4>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 bg-background rounded border-l-2 border-orange-500">
                            <p className="font-medium">1. Betreff (Subject line)</p>
                            <p className="text-muted-foreground">Beschwerde über...</p>
                          </div>
                          <div className="p-2 bg-background rounded border-l-2 border-orange-500">
                            <p className="font-medium">2. Anrede (Salutation)</p>
                            <p className="text-muted-foreground">Sehr geehrte Damen und Herren,</p>
                          </div>
                          <div className="p-2 bg-background rounded border-l-2 border-orange-500">
                            <p className="font-medium">3. Einleitung (Introduction)</p>
                            <p className="text-muted-foreground">Reason for writing</p>
                          </div>
                          <div className="p-2 bg-background rounded border-l-2 border-orange-500">
                            <p className="font-medium">4. Hauptteil (Main body)</p>
                            <p className="text-muted-foreground">Details of complaint</p>
                          </div>
                          <div className="p-2 bg-background rounded border-l-2 border-orange-500">
                            <p className="font-medium">5. Schluss (Conclusion)</p>
                            <p className="text-muted-foreground">Request + closing</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium">Key Phrases</h4>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 bg-background rounded">
                            <p className="text-muted-foreground">Ich schreibe Ihnen, weil...</p>
                          </div>
                          <div className="p-2 bg-background rounded">
                            <p className="text-muted-foreground">Leider musste ich feststellen, dass...</p>
                          </div>
                          <div className="p-2 bg-background rounded">
                            <p className="text-muted-foreground">Ich bitte Sie daher,...</p>
                          </div>
                          <div className="p-2 bg-background rounded">
                            <p className="text-muted-foreground">Für eine baldige Rückmeldung wäre ich Ihnen sehr dankbar.</p>
                          </div>
                          <div className="p-2 bg-background rounded">
                            <p className="text-muted-foreground">Mit freundlichen Grüßen</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {section.id === "sprechen" && (
                <Card className="bg-red-500/5 border-red-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Mic className="h-5 w-5 text-red-500" />
                      Speaking Exam Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-background rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="h-5 w-5 text-red-400" />
                          <h4 className="font-medium">Präsentation</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Prepare in 20 min</li>
                          <li>• Speak for ~4 min</li>
                          <li>• Use clear structure</li>
                          <li>• Include examples</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-background rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-5 w-5 text-red-400" />
                          <h4 className="font-medium">Diskussion</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• React to partner</li>
                          <li>• Give opinions</li>
                          <li>• Ask questions</li>
                          <li>• Stay on topic</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-background rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="h-5 w-5 text-red-400" />
                          <h4 className="font-medium">Problemlösung</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Make suggestions</li>
                          <li>• Evaluate options</li>
                          <li>• Reach agreement</li>
                          <li>• Summarize decision</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default TelcVorbereitungSection;
