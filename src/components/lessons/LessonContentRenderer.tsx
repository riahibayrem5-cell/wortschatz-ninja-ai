import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Video, FileText, Lightbulb, 
  CheckCircle2, Volume2, Play, ChevronRight,
  GraduationCap, Brain, Target, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import CachedAudioButton from "@/components/CachedAudioButton";

interface LessonSection {
  id: string;
  title: string;
  titleDe?: string;
  type: "text" | "video" | "examples" | "rules" | "vocabulary" | "tips";
  content: string | string[] | VocabItem[] | RuleItem[];
}

interface VocabItem {
  german: string;
  english: string;
  example?: string;
  article?: string;
}

interface RuleItem {
  rule: string;
  explanation: string;
  examples: string[];
}

interface LessonContentRendererProps {
  lessonType: string;
  lessonTitle: string;
  lessonTitleDe: string;
  content: any;
  onSectionComplete?: (sectionId: string) => void;
}

const LessonContentRenderer = ({
  lessonType,
  lessonTitle,
  lessonTitleDe,
  content,
  onSectionComplete
}: LessonContentRendererProps) => {
  const [activeSection, setActiveSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [expandedVocab, setExpandedVocab] = useState<Set<number>>(new Set());

  // Generate structured lesson content based on lesson type
  const generateLessonSections = (): LessonSection[] => {
    const topics = content?.topics || [];
    const exercises = content?.exercises || [];

    switch (lessonType) {
      case "vocabulary":
        return [
          {
            id: "intro",
            title: "Introduction",
            titleDe: "Einführung",
            type: "text",
            content: `In this vocabulary lesson, you will learn essential B2-level words related to ${topics.join(", ")}. These words are commonly used in everyday German and are essential for the TELC B2 exam.`
          },
          {
            id: "video",
            title: "Video Lesson",
            titleDe: "Video-Lektion",
            type: "video",
            content: "vocabulary-intro"
          },
          {
            id: "vocab",
            title: "Key Vocabulary",
            titleDe: "Schlüsselvokabeln",
            type: "vocabulary",
            content: generateVocabularyForTopics(topics)
          },
          {
            id: "tips",
            title: "Learning Tips",
            titleDe: "Lerntipps",
            type: "tips",
            content: [
              "Use flashcards to memorize new words",
              "Practice words in context, not isolation",
              "Create associations between German and English words",
              "Review vocabulary regularly using spaced repetition"
            ]
          }
        ];

      case "grammar":
        return [
          {
            id: "intro",
            title: "Grammar Overview",
            titleDe: "Grammatik Übersicht",
            type: "text",
            content: `This lesson covers ${topics.join(", ")} - essential grammar topics for B2 level German. Understanding these concepts will help you communicate more accurately and confidently.`
          },
          {
            id: "video",
            title: "Video Explanation",
            titleDe: "Video-Erklärung",
            type: "video",
            content: "grammar-explanation"
          },
          {
            id: "rules",
            title: "Grammar Rules",
            titleDe: "Grammatikregeln",
            type: "rules",
            content: generateGrammarRules(topics)
          },
          {
            id: "examples",
            title: "Examples in Context",
            titleDe: "Beispiele im Kontext",
            type: "examples",
            content: generateGrammarExamples(topics)
          },
          {
            id: "tips",
            title: "Common Mistakes to Avoid",
            titleDe: "Häufige Fehler vermeiden",
            type: "tips",
            content: [
              "Pay attention to verb endings for each case",
              "Remember that prepositions determine the case",
              "Practice with real sentences, not just rules",
              "When in doubt, check the verb's case requirements"
            ]
          }
        ];

      case "reading":
        return [
          {
            id: "intro",
            title: "Reading Skills Focus",
            titleDe: "Lesekompetenz-Fokus",
            type: "text",
            content: `This lesson focuses on ${content?.skill || "reading comprehension"} skills. You'll learn strategies for understanding ${content?.text_types?.join(", ") || "various German texts"}.`
          },
          {
            id: "strategies",
            title: "Reading Strategies",
            titleDe: "Lesestrategien",
            type: "rules",
            content: [
              { rule: "Skimming", explanation: "Quickly read to get the main idea", examples: ["Read titles, headings, and first sentences"] },
              { rule: "Scanning", explanation: "Search for specific information", examples: ["Look for keywords, dates, or names"] },
              { rule: "Detailed Reading", explanation: "Read carefully for full understanding", examples: ["Analyze sentence structure and vocabulary"] }
            ]
          },
          {
            id: "tips",
            title: "Exam Tips",
            titleDe: "Prüfungstipps",
            type: "tips",
            content: [
              "Read the questions before the text",
              "Underline key words while reading",
              "Don't spend too much time on one question",
              "Use context clues for unknown vocabulary"
            ]
          }
        ];

      case "listening":
        return [
          {
            id: "intro",
            title: "Listening Skills Focus",
            titleDe: "Hörverständnis-Fokus",
            type: "text",
            content: `This lesson focuses on understanding ${content?.audio_type || "various German audio materials"}. You'll develop strategies for the TELC B2 listening section.`
          },
          {
            id: "strategies",
            title: "Listening Strategies",
            titleDe: "Hörstrategien",
            type: "rules",
            content: [
              { rule: "Prediction", explanation: "Anticipate content before listening", examples: ["Use context and questions to predict"] },
              { rule: "Note-taking", explanation: "Write key words while listening", examples: ["Focus on numbers, names, and main points"] },
              { rule: "Focus on Stress", explanation: "Pay attention to emphasized words", examples: ["Stressed words often carry key information"] }
            ]
          },
          {
            id: "tips",
            title: "Exam Tips",
            titleDe: "Prüfungstipps",
            type: "tips",
            content: [
              "Read all questions during the pause before audio",
              "Take quick notes while listening",
              "Don't panic if you miss something - keep listening",
              "Trust your first instinct"
            ]
          }
        ];

      case "writing":
        return [
          {
            id: "intro",
            title: "Writing Focus",
            titleDe: "Schreib-Fokus",
            type: "text",
            content: `This lesson covers ${content?.format || "formal letter writing"} skills essential for the TELC B2 writing section.`
          },
          {
            id: "structure",
            title: "Text Structure",
            titleDe: "Textstruktur",
            type: "rules",
            content: [
              { rule: "Anrede (Greeting)", explanation: "Start with formal greeting", examples: ["Sehr geehrte Damen und Herren,", "Sehr geehrte Frau Müller,"] },
              { rule: "Einleitung (Introduction)", explanation: "State your purpose clearly", examples: ["Ich schreibe Ihnen, weil...", "Bezugnehmend auf Ihre Anzeige..."] },
              { rule: "Hauptteil (Main Body)", explanation: "Develop your points logically", examples: ["Erstens..., Zweitens..., Darüber hinaus..."] },
              { rule: "Schluss (Conclusion)", explanation: "End with a request or summary", examples: ["Ich würde mich freuen, von Ihnen zu hören.", "Für Rückfragen stehe ich gerne zur Verfügung."] }
            ]
          },
          {
            id: "phrases",
            title: "Useful Phrases",
            titleDe: "Nützliche Wendungen",
            type: "examples",
            content: [
              "hiermit möchte ich mich über... beschweren",
              "ich wäre Ihnen sehr dankbar, wenn Sie...",
              "leider muss ich feststellen, dass...",
              "ich bitte Sie daher, ..."
            ]
          }
        ];

      case "speaking":
        return [
          {
            id: "intro",
            title: "Speaking Focus",
            titleDe: "Sprech-Fokus",
            type: "text",
            content: `This lesson focuses on ${content?.topics?.join(", ") || "various speaking scenarios"} for the TELC B2 speaking exam.`
          },
          {
            id: "structure",
            title: "Presentation Structure",
            titleDe: "Präsentationsstruktur",
            type: "rules",
            content: [
              { rule: "Einleitung (30 sec)", explanation: "Introduce your topic", examples: ["Ich möchte heute über... sprechen"] },
              { rule: "Hauptteil (3 min)", explanation: "Present main points with examples", examples: ["Einerseits... andererseits..."] },
              { rule: "Schluss (30 sec)", explanation: "Summarize and give your opinion", examples: ["Zusammenfassend lässt sich sagen..."] }
            ]
          },
          {
            id: "phrases",
            title: "Discussion Phrases",
            titleDe: "Diskussionswendungen",
            type: "examples",
            content: [
              "Da stimme ich Ihnen zu",
              "Ich bin anderer Meinung, weil...",
              "Könnten Sie das näher erläutern?",
              "Wie wäre es, wenn wir..."
            ]
          }
        ];

      default:
        return [
          {
            id: "intro",
            title: "Lesson Overview",
            titleDe: "Lektionsübersicht",
            type: "text",
            content: `Welcome to this ${lessonType} lesson. Follow the content and complete the exercises to master this topic.`
          }
        ];
    }
  };

  const sections = generateLessonSections();

  const markSectionComplete = (sectionId: string) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
    onSectionComplete?.(sectionId);
  };

  const renderSectionContent = (section: LessonSection) => {
    switch (section.type) {
      case "text":
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-base leading-relaxed">{section.content as string}</p>
          </div>
        );

      case "video":
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center border-2 border-dashed border-primary/30">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <Play className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Video Coming Soon</p>
                  <p className="text-sm text-muted-foreground">Professional video explanations will be added</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Video className="h-3 w-3 mr-1" />
                  Premium Content
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Video lessons with native German speakers are being prepared
            </p>
          </div>
        );

      case "vocabulary":
        const vocabItems = section.content as VocabItem[];
        return (
          <div className="grid gap-3">
            {vocabItems.map((item, idx) => (
              <Card 
                key={idx}
                className={cn(
                  "group cursor-pointer transition-all hover:shadow-md",
                  expandedVocab.has(idx) ? "bg-primary/5 border-primary/30" : "hover:border-primary/20"
                )}
                onClick={() => {
                  setExpandedVocab(prev => {
                    const next = new Set(prev);
                    if (next.has(idx)) next.delete(idx);
                    else next.add(idx);
                    return next;
                  });
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.article && (
                        <Badge variant="secondary" className="text-xs font-mono">
                          {item.article}
                        </Badge>
                      )}
                      <span className="font-semibold text-lg">{item.german}</span>
                      <CachedAudioButton text={item.german} size="sm" variant="ghost" />
                    </div>
                    <span className="text-muted-foreground">{item.english}</span>
                  </div>
                  {expandedVocab.has(idx) && item.example && (
                    <div className="mt-3 pt-3 border-t border-border/50 animate-fade-in">
                      <p className="text-sm text-muted-foreground italic">
                        <span className="font-medium text-foreground">Example: </span>
                        {item.example}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "rules":
        const rules = section.content as RuleItem[];
        return (
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <Card key={idx} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-primary mb-2">{rule.rule}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{rule.explanation}</p>
                  <div className="space-y-1">
                    {rule.examples.map((ex, exIdx) => (
                      <div key={exIdx} className="flex items-center gap-2 text-sm">
                        <ChevronRight className="h-3 w-3 text-primary" />
                        <span className="italic">{ex}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "examples":
        const examples = section.content as string[];
        return (
          <div className="grid gap-2">
            {examples.map((example, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors"
              >
                <Badge variant="outline" className="shrink-0">{idx + 1}</Badge>
                <span className="text-sm">{example}</span>
                <CachedAudioButton text={example} size="sm" variant="ghost" className="ml-auto" />
              </div>
            ))}
          </div>
        );

      case "tips":
        const tips = section.content as string[];
        return (
          <div className="space-y-3">
            {tips.map((tip, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
              >
                <Lightbulb className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <span className="text-sm">{tip}</span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "text": return <FileText className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "vocabulary": return <BookOpen className="h-4 w-4" />;
      case "rules": return <GraduationCap className="h-4 w-4" />;
      case "examples": return <Target className="h-4 w-4" />;
      case "tips": return <Lightbulb className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section, idx) => (
          <Button
            key={section.id}
            variant={activeSection === idx ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSection(idx)}
            className={cn(
              "shrink-0 gap-2",
              activeSection === idx && "gradient-primary",
              completedSections.has(section.id) && "border-green-500/50"
            )}
          >
            {completedSections.has(section.id) ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              getSectionIcon(section.type)
            )}
            {section.title}
          </Button>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${((activeSection + 1) / sections.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {activeSection + 1}/{sections.length}
        </span>
      </div>

      {/* Active Section Content */}
      <Card className="glass-luxury border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getSectionIcon(sections[activeSection].type)}
                {sections[activeSection].title}
              </CardTitle>
              {sections[activeSection].titleDe && (
                <p className="text-sm text-muted-foreground italic mt-1">
                  {sections[activeSection].titleDe}
                </p>
              )}
            </div>
            <Badge variant="outline">
              {sections[activeSection].type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {renderSectionContent(sections[activeSection])}

          {/* Section Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {!completedSections.has(sections[activeSection].id) && (
                <Button
                  variant="ghost"
                  onClick={() => markSectionComplete(sections[activeSection].id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              <Button
                onClick={() => {
                  markSectionComplete(sections[activeSection].id);
                  setActiveSection(Math.min(sections.length - 1, activeSection + 1));
                }}
                disabled={activeSection === sections.length - 1}
                className="gradient-primary"
              >
                Next Section
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions to generate content
function generateVocabularyForTopics(topics: string[]): VocabItem[] {
  const vocabByTopic: Record<string, VocabItem[]> = {
    daily_life: [
      { german: "der Alltag", english: "daily life/routine", article: "der", example: "Mein Alltag beginnt um 7 Uhr." },
      { german: "die Gewohnheit", english: "habit", article: "die", example: "Frühstücken ist eine gesunde Gewohnheit." },
      { german: "der Haushalt", english: "household", article: "der", example: "Wer macht den Haushalt?" },
      { german: "die Verabredung", english: "appointment/date", article: "die", example: "Ich habe eine Verabredung mit Freunden." },
      { german: "entspannen", english: "to relax", example: "Am Wochenende entspanne ich mich." }
    ],
    work: [
      { german: "die Bewerbung", english: "application", article: "die", example: "Ich schreibe eine Bewerbung." },
      { german: "das Vorstellungsgespräch", english: "job interview", article: "das", example: "Morgen habe ich ein Vorstellungsgespräch." },
      { german: "die Erfahrung", english: "experience", article: "die", example: "Ich habe viel Erfahrung in diesem Bereich." },
      { german: "der Arbeitgeber", english: "employer", article: "der", example: "Mein Arbeitgeber ist sehr flexibel." },
      { german: "kündigen", english: "to resign/quit", example: "Er hat gestern gekündigt." }
    ],
    education: [
      { german: "die Ausbildung", english: "education/training", article: "die", example: "Sie macht eine Ausbildung zur Krankenschwester." },
      { german: "die Weiterbildung", english: "further education", article: "die", example: "Weiterbildung ist wichtig für die Karriere." },
      { german: "die Prüfung", english: "exam", article: "die", example: "Die Prüfung war sehr schwer." },
      { german: "der Abschluss", english: "degree/diploma", article: "der", example: "Er hat einen guten Abschluss gemacht." },
      { german: "bestehen", english: "to pass (an exam)", example: "Ich habe die Prüfung bestanden." }
    ],
    health: [
      { german: "die Gesundheit", english: "health", article: "die", example: "Gesundheit ist das Wichtigste." },
      { german: "die Behandlung", english: "treatment", article: "die", example: "Die Behandlung war erfolgreich." },
      { german: "die Erkältung", english: "cold (illness)", article: "die", example: "Ich habe eine starke Erkältung." },
      { german: "verschreiben", english: "to prescribe", example: "Der Arzt hat mir Medikamente verschrieben." },
      { german: "sich erholen", english: "to recover", example: "Er muss sich von der Operation erholen." }
    ],
    environment: [
      { german: "die Umwelt", english: "environment", article: "die", example: "Wir müssen die Umwelt schützen." },
      { german: "die Verschmutzung", english: "pollution", article: "die", example: "Die Luftverschmutzung ist ein großes Problem." },
      { german: "erneuerbar", english: "renewable", example: "Wir brauchen mehr erneuerbare Energien." },
      { german: "der Klimawandel", english: "climate change", article: "der", example: "Der Klimawandel betrifft uns alle." },
      { german: "nachhaltig", english: "sustainable", example: "Wir sollten nachhaltiger leben." }
    ],
    technology: [
      { german: "die Digitalisierung", english: "digitalization", article: "die", example: "Die Digitalisierung verändert unsere Arbeit." },
      { german: "die Künstliche Intelligenz", english: "artificial intelligence", article: "die", example: "KI wird immer wichtiger." },
      { german: "herunterladen", english: "to download", example: "Ich muss die App herunterladen." },
      { german: "der Datenschutz", english: "data protection", article: "der", example: "Datenschutz ist in Europa sehr wichtig." },
      { german: "vernetzen", english: "to network/connect", example: "Die Geräte sind miteinander vernetzt." }
    ]
  };

  let result: VocabItem[] = [];
  for (const topic of topics) {
    const normalizedTopic = topic.toLowerCase().replace(/\s+/g, "_");
    if (vocabByTopic[normalizedTopic]) {
      result = [...result, ...vocabByTopic[normalizedTopic]];
    }
  }
  
  // If no matching topics, return default vocabulary
  if (result.length === 0) {
    result = [
      { german: "die Meinung", english: "opinion", article: "die", example: "Meiner Meinung nach ist das richtig." },
      { german: "der Vorteil", english: "advantage", article: "der", example: "Das hat viele Vorteile." },
      { german: "der Nachteil", english: "disadvantage", article: "der", example: "Es gibt auch Nachteile." },
      { german: "zustimmen", english: "to agree", example: "Ich stimme Ihnen zu." },
      { german: "ablehnen", english: "to reject/decline", example: "Er hat das Angebot abgelehnt." }
    ];
  }

  return result.slice(0, 10);
}

function generateGrammarRules(topics: string[]): RuleItem[] {
  const rulesByTopic: Record<string, RuleItem[]> = {
    accusative: [
      { 
        rule: "Akkusativ (Accusative Case)", 
        explanation: "Used for direct objects - the person or thing directly affected by the verb action",
        examples: ["Ich sehe den Mann (I see the man)", "Sie kauft einen Apfel (She buys an apple)"]
      }
    ],
    dative: [
      {
        rule: "Dativ (Dative Case)",
        explanation: "Used for indirect objects - the recipient of the direct object",
        examples: ["Ich gebe dem Mann das Buch (I give the man the book)", "Er hilft der Frau (He helps the woman)"]
      }
    ],
    genitive: [
      {
        rule: "Genitiv (Genitive Case)",
        explanation: "Used to show possession or relationship between nouns",
        examples: ["Das ist das Auto des Mannes (That is the man's car)", "Wegen des Wetters (Because of the weather)"]
      }
    ],
    prepositions: [
      {
        rule: "Prepositions with Cases",
        explanation: "German prepositions require specific cases (accusative, dative, or both)",
        examples: ["für + Akkusativ: für mich", "mit + Dativ: mit dem Bus", "in + Akk/Dat: in die Stadt / in der Stadt"]
      }
    ],
    present: [
      {
        rule: "Präsens (Present Tense)",
        explanation: "Used for current actions, habits, and general truths",
        examples: ["Ich arbeite jeden Tag (I work every day)", "Er spricht Deutsch (He speaks German)"]
      }
    ],
    past: [
      {
        rule: "Präteritum (Simple Past)",
        explanation: "Used primarily in written German for past events",
        examples: ["Er ging nach Hause (He went home)", "Sie war sehr müde (She was very tired)"]
      }
    ],
    perfect: [
      {
        rule: "Perfekt (Present Perfect)",
        explanation: "Most common past tense in spoken German - haben/sein + past participle",
        examples: ["Ich habe gegessen (I have eaten)", "Sie ist gekommen (She has come)"]
      }
    ],
    future: [
      {
        rule: "Futur I (Future Tense)",
        explanation: "Used for future events and predictions - werden + infinitive",
        examples: ["Ich werde morgen kommen (I will come tomorrow)", "Es wird regnen (It will rain)"]
      }
    ]
  };

  let result: RuleItem[] = [];
  for (const topic of topics) {
    const normalizedTopic = topic.toLowerCase().replace(/\s+/g, "_");
    if (rulesByTopic[normalizedTopic]) {
      result = [...result, ...rulesByTopic[normalizedTopic]];
    }
  }

  if (result.length === 0) {
    result = [
      {
        rule: "Word Order in German",
        explanation: "German follows the V2 rule - the conjugated verb is always in second position",
        examples: ["Heute gehe ich einkaufen", "Morgen wird es regnen"]
      }
    ];
  }

  return result;
}

function generateGrammarExamples(topics: string[]): string[] {
  return [
    "Der neue Mitarbeiter arbeitet sehr fleißig.",
    "Ich habe dem Kunden eine E-Mail geschickt.",
    "Wegen des schlechten Wetters bleiben wir zu Hause.",
    "Nachdem ich gegessen hatte, ging ich spazieren.",
    "Wenn ich Zeit hätte, würde ich mehr lesen."
  ];
}

export default LessonContentRenderer;
