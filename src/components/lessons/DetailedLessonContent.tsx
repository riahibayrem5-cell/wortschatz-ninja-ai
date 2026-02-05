import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, Target, Lightbulb, CheckCircle2, 
  Volume2, ChevronRight, GraduationCap, Clock,
  FileText, Award, AlertCircle, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import CachedAudioButton from "@/components/CachedAudioButton";

interface DetailedLessonContentProps {
  lessonType: string;
  lessonTitle: string;
  lessonTitleDe: string;
  content: any;
  onComplete?: () => void;
}

interface VocabWord {
  german: string;
  english: string;
  example?: string;
  article?: string;
  plural?: string;
}

interface GrammarRule {
  case?: string;
  name?: string;
  usage?: string;
  example?: string;
  examples?: string[];
  articles?: string;
  explanation?: string;
}

const DetailedLessonContent = ({
  lessonType,
  lessonTitle,
  lessonTitleDe,
  content,
  onComplete
}: DetailedLessonContentProps) => {
  const [expandedVocab, setExpandedVocab] = useState<Set<string>>(new Set());
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  
  const detailedContent = content?.detailed_content;
  const telcSection = content?.telc_section;
  const learningObjectives = content?.learning_objectives || [];
  
  // If no detailed content, show message
  if (!detailedContent) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary/50" />
        <h3 className="text-xl font-semibold mb-2">Lesson Content Loading</h3>
        <p className="text-muted-foreground">
          This lesson's detailed content is being prepared. Check back soon!
        </p>
      </div>
    );
  }

  const toggleVocab = (word: string) => {
    setExpandedVocab(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  const markComplete = (section: string) => {
    setCompletedSections(prev => new Set([...prev, section]));
  };

  // Render vocabulary sets
  const renderVocabularySets = () => {
    const vocabSets = detailedContent?.vocabulary_sets;
    if (!vocabSets || !Array.isArray(vocabSets)) return null;

    return (
      <div className="space-y-6">
        {vocabSets.map((set: any, setIdx: number) => (
          <Card key={setIdx} className="glass border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {set.theme}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {set.words?.map((word: VocabWord, idx: number) => {
                const key = `${setIdx}-${idx}`;
                return (
                  <div
                    key={key}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all",
                      expandedVocab.has(key) 
                        ? "bg-primary/10 border border-primary/30" 
                        : "bg-secondary/50 hover:bg-secondary/80"
                    )}
                    onClick={() => toggleVocab(key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {word.article && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {word.article}
                          </Badge>
                        )}
                        <span className="font-semibold">{word.german}</span>
                        <CachedAudioButton text={word.german} size="sm" variant="ghost" />
                      </div>
                      <span className="text-muted-foreground text-sm">{word.english}</span>
                    </div>
                    {expandedVocab.has(key) && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-2 animate-in fade-in-50">
                        {word.example && (
                          <div className="flex items-start gap-2">
                            <Badge variant="secondary" className="text-xs shrink-0">Example</Badge>
                            <p className="text-sm italic">{word.example}</p>
                          </div>
                        )}
                        {word.plural && (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Plural</Badge>
                            <span className="text-sm">{word.plural}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render grammar focus section
  const renderGrammarFocus = () => {
    const grammar = detailedContent?.grammar_focus;
    if (!grammar) return null;

    return (
      <Card className="glass border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-accent" />
            {grammar.title || "Grammar Focus"}
          </CardTitle>
          {grammar.explanation && (
            <p className="text-sm text-muted-foreground">{grammar.explanation}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rules/Cases */}
          {grammar.rules && Array.isArray(grammar.rules) && (
            <div className="space-y-3">
              {grammar.rules.map((rule: GrammarRule, idx: number) => (
                <div key={idx} className="p-4 rounded-lg bg-secondary/50 border-l-4 border-l-accent">
                  <h4 className="font-semibold text-accent mb-1">
                    {rule.case || rule.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">{rule.usage || rule.explanation}</p>
                  {rule.example && (
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-accent" />
                      <span className="text-sm italic">{rule.example}</span>
                      <CachedAudioButton text={rule.example} size="sm" variant="ghost" />
                    </div>
                  )}
                  {rule.examples && Array.isArray(rule.examples) && (
                    <div className="space-y-1 mt-2">
                      {rule.examples.map((ex: string, exIdx: number) => (
                        <div key={exIdx} className="flex items-center gap-2">
                          <ChevronRight className="h-3 w-3 text-accent" />
                          <span className="text-sm italic">{ex}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {rule.articles && (
                    <Badge variant="outline" className="mt-2 font-mono text-xs">
                      {rule.articles}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tenses (for verb lessons) */}
          {grammar.tenses && Array.isArray(grammar.tenses) && (
            <Accordion type="single" collapsible className="w-full">
              {grammar.tenses.map((tense: any, idx: number) => (
                <AccordionItem key={idx} value={`tense-${idx}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">{tense.name}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-3">{tense.usage}</p>
                    {tense.examples?.map((ex: string, exIdx: number) => (
                      <div key={exIdx} className="flex items-center gap-2 mb-1">
                        <ChevronRight className="h-3 w-3 text-primary" />
                        <span className="text-sm">{ex}</span>
                        <CachedAudioButton text={ex} size="sm" variant="ghost" />
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* Haben vs Sein */}
          {grammar.haben_vs_sein && (
            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold text-primary mb-3">Haben vs. Sein in Perfekt</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Badge className="mb-2">haben</Badge>
                  <p className="text-sm text-muted-foreground">{grammar.haben_vs_sein.haben_rule}</p>
                </div>
                <div>
                  <Badge variant="secondary" className="mb-2">sein</Badge>
                  <p className="text-sm text-muted-foreground">{grammar.haben_vs_sein.sein_rule}</p>
                </div>
              </div>
              {grammar.haben_vs_sein.examples && (
                <div className="mt-3 space-y-2">
                  {grammar.haben_vs_sein.examples.map((ex: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="shrink-0">{ex.verb}</Badge>
                      <span>{ex.correct}</span>
                      {ex.note && <span className="text-muted-foreground">({ex.note})</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Verbs */}
          {grammar.verbs && (
            <div className="mt-4">
              <h4 className="font-semibold mb-3">{detailedContent?.modal_verbs?.explanation || "Modal Verbs"}</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {grammar.verbs.map((verb: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-primary">{verb.modal}</span>
                      <span className="text-sm text-muted-foreground">({verb.meaning})</span>
                    </div>
                    <p className="text-sm italic">{verb.example}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subordinate Clauses */}
          {grammar.subordinate_clauses && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">{grammar.subordinate_clauses.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{grammar.subordinate_clauses.explanation}</p>
              <div className="space-y-2">
                {grammar.subordinate_clauses.conjunctions?.map((conj: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded bg-secondary/30">
                    <Badge variant="outline" className="shrink-0">{conj.conjunction}</Badge>
                    <div className="flex-1">
                      <span className="text-sm text-muted-foreground">({conj.meaning})</span>
                      <p className="text-sm mt-1">{conj.example}</p>
                    </div>
                    <CachedAudioButton text={conj.example} size="sm" variant="ghost" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render modal verbs section (if separate from grammar focus)
  const renderModalVerbs = () => {
    const modalVerbs = detailedContent?.modal_verbs;
    if (!modalVerbs || detailedContent?.grammar_focus?.verbs) return null;

    return (
      <Card className="glass border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            Modal Verbs
          </CardTitle>
          <p className="text-sm text-muted-foreground">{modalVerbs.explanation}</p>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {modalVerbs.verbs?.map((verb: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-orange-600 dark:text-orange-400">{verb.modal}</span>
                  <span className="text-xs text-muted-foreground">({verb.meaning})</span>
                </div>
                <p className="text-sm italic">{verb.example}</p>
                <CachedAudioButton text={verb.example} size="sm" variant="ghost" className="mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render TELC format info
  const renderTelcFormat = () => {
    const format = detailedContent?.telc_format;
    if (!format) return null;

    return (
      <Card className="glass bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              TELC Exam Format
            </CardTitle>
            <Badge className="bg-primary">{format.section}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Task Type</p>
              <p className="font-medium text-sm">{format.task_type}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <Target className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Items</p>
              <p className="font-medium text-sm">{format.num_items || format.word_count}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-medium text-sm">{format.time_suggestion}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <Award className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Points</p>
              <p className="font-medium text-sm">{format.max_points} pts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render TELC tips
  const renderTelcTips = () => {
    const tips = detailedContent?.telc_tips;
    if (!tips || !Array.isArray(tips)) return null;

    return (
      <Card className="glass border-yellow-500/30 bg-yellow-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <Lightbulb className="h-5 w-5" />
            TELC Exam Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tips.map((tip: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-2">
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{idx + 1}</span>
                </div>
                <p className="text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render reading strategies
  const renderStrategies = () => {
    const strategies = detailedContent?.reading_strategies || detailedContent?.listening_strategies;
    if (!strategies || !Array.isArray(strategies)) return null;

    const isListening = !!detailedContent?.listening_strategies;

    return (
      <Card className="glass border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            {isListening ? "Listening" : "Reading"} Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategies.map((strategy: any, idx: number) => (
              <div key={idx} className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-500">{strategy.name}</Badge>
                  {strategy.german && (
                    <span className="text-sm text-muted-foreground italic">({strategy.german})</span>
                  )}
                </div>
                {strategy.purpose && (
                  <p className="text-sm font-medium mb-1">{strategy.purpose}</p>
                )}
                <p className="text-sm text-muted-foreground">{strategy.how_to}</p>
                {strategy.when_to_use && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">When to use:</span> {strategy.when_to_use}
                  </p>
                )}
                {strategy.benefit && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Benefit:</span> {strategy.benefit}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render sample text with questions (for reading)
  const renderSampleText = () => {
    const sample = detailedContent?.sample_text;
    if (!sample) return null;

    return (
      <Card className="glass border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" />
            Practice Text: {sample.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50 border-l-4 border-l-green-500">
            <p className="text-sm leading-relaxed">{sample.text}</p>
            <CachedAudioButton text={sample.text} size="sm" variant="outline" className="mt-3" />
          </div>
          
          {sample.questions && (
            <div className="space-y-3">
              <h4 className="font-semibold">Comprehension Questions</h4>
              {sample.questions.map((q: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-secondary/30">
                  <p className="font-medium text-sm mb-2">{idx + 1}. {q.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options?.map((opt: string, optIdx: number) => (
                      <div 
                        key={optIdx}
                        className={cn(
                          "p-2 rounded text-sm border cursor-pointer transition-colors",
                          optIdx === q.correct 
                            ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
                            : "bg-secondary/50 border-border/50 hover:border-primary/30"
                        )}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render letter structure (for writing)
  const renderLetterStructure = () => {
    const structure = detailedContent?.letter_structure;
    if (!structure) return null;

    return (
      <Card className="glass border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            Formal Letter Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {structure.parts?.map((part: any, idx: number) => (
              <div key={idx} className="p-4 rounded-lg bg-purple-500/5 border-l-4 border-l-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-500">{idx + 1}. {part.name}</Badge>
                  <span className="text-sm text-muted-foreground">({part.english})</span>
                </div>
                {part.purpose && (
                  <p className="text-sm text-muted-foreground mb-2">{part.purpose}</p>
                )}
                {part.examples && (
                  <div className="space-y-1">
                    {part.examples.map((ex: string, exIdx: number) => (
                      <div key={exIdx} className="flex items-center gap-2 text-sm">
                        <ChevronRight className="h-3 w-3 text-purple-500" />
                        <span className="italic">{ex}</span>
                        <CachedAudioButton text={ex} size="sm" variant="ghost" />
                      </div>
                    ))}
                  </div>
                )}
                {part.connectors && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {part.connectors.map((c: string, cIdx: number) => (
                      <Badge key={cIdx} variant="outline" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render useful phrases
  const renderUsefulPhrases = () => {
    const phrases = detailedContent?.useful_phrases;
    if (!phrases) return null;

    return (
      <Card className="glass border-indigo-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Useful Phrases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Object.keys(phrases)[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {Object.keys(phrases).map(key => (
                <TabsTrigger key={key} value={key} className="capitalize">
                  {key.replace('_', ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(phrases).map(([key, phraseList]: [string, any]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="space-y-2">
                  {phraseList?.map((phrase: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{phrase.german}</span>
                        <CachedAudioButton text={phrase.german} size="sm" variant="ghost" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{phrase.english}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Learning Objectives */}
      {learningObjectives.length > 0 && (
        <Card className="glass bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Learning Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {learningObjectives.map((obj: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{obj}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* TELC Format Info */}
      {renderTelcFormat()}

      {/* Introduction - supports both string and object format */}
      {detailedContent?.introduction && (
        <Card className="glass bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-6">
            {typeof detailedContent.introduction === 'string' ? (
              <p className="text-base leading-relaxed">{detailedContent.introduction}</p>
            ) : (
              <div className="space-y-4">
                {detailedContent.introduction.title && (
                  <h3 className="text-xl font-semibold text-primary">{detailedContent.introduction.title}</h3>
                )}
                {detailedContent.introduction.content && (
                  <p className="text-base leading-relaxed">{detailedContent.introduction.content}</p>
                )}
                {detailedContent.introduction.motivation && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                      <p className="text-sm italic">{detailedContent.introduction.motivation}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exam Structure (for mock exam lessons) */}
      {detailedContent?.exam_structure && (
        <Card className="glass border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Exam Structure
            </CardTitle>
            {detailedContent.exam_structure.overview && (
              <p className="text-sm text-muted-foreground">{detailedContent.exam_structure.overview}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-primary/10">
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Total Time</p>
                <p className="font-bold text-primary">{detailedContent.exam_structure.total_time} min</p>
              </div>
              <div className="text-center">
                <Award className="h-6 w-6 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Total Points</p>
                <p className="font-bold text-primary">{detailedContent.exam_structure.total_points} pts</p>
              </div>
            </div>
            
            {detailedContent.exam_structure.sections && (
              <div className="space-y-3">
                {detailedContent.exam_structure.sections.map((section: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg bg-secondary/50 border-l-4 border-l-primary">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{section.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{section.time_minutes} min</Badge>
                        <Badge>{section.points} pts</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{section.task}</p>
                    {section.strategy && (
                      <div className="flex items-start gap-2 text-sm mt-2 p-2 rounded bg-yellow-500/10">
                        <Lightbulb className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                        <span className="text-yellow-700 dark:text-yellow-400">Tip: {section.strategy}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scoring Guide (for mock exam lessons) */}
      {detailedContent?.scoring_guide && (
        <Card className="glass border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Scoring Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {['passing', 'good', 'excellent'].map((level) => {
                const data = detailedContent.scoring_guide[level];
                if (!data) return null;
                const colors = {
                  passing: 'border-yellow-500 bg-yellow-500/10',
                  good: 'border-blue-500 bg-blue-500/10',
                  excellent: 'border-green-500 bg-green-500/10'
                };
                return (
                  <div key={level} className={cn("p-4 rounded-lg border-2 text-center", colors[level as keyof typeof colors])}>
                    <Badge className="mb-2">{data.grade}</Badge>
                    <p className="text-2xl font-bold">{data.threshold}</p>
                    <p className="text-sm text-muted-foreground">{data.points}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Post Exam Analysis (for mock exam lessons) */}
      {detailedContent?.post_exam_analysis && (
        <Card className="glass border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              After the Exam - Self Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailedContent.post_exam_analysis.immediate && (
              <div>
                <h4 className="font-semibold mb-2">Immediate Steps</h4>
                <ul className="space-y-2">
                  {detailedContent.post_exam_analysis.immediate.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {detailedContent.post_exam_analysis.reflection_questions && (
              <div className="p-4 rounded-lg bg-purple-500/10">
                <h4 className="font-semibold mb-3">Reflection Questions</h4>
                <ul className="space-y-2">
                  {detailedContent.post_exam_analysis.reflection_questions.map((q: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detailedContent.post_exam_analysis.action_plan && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Action Plan
                </h4>
                <p className="text-sm">{detailedContent.post_exam_analysis.action_plan}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vocabulary Sets */}
      {renderVocabularySets()}

      {/* Grammar Focus */}
      {renderGrammarFocus()}

      {/* Modal Verbs (if separate) */}
      {renderModalVerbs()}

      {/* Reading/Listening Strategies */}
      {renderStrategies()}

      {/* Sample Text */}
      {renderSampleText()}

      {/* Letter Structure */}
      {renderLetterStructure()}

      {/* Useful Phrases */}
      {renderUsefulPhrases()}

      {/* TELC Tips */}
      {renderTelcTips()}

      {/* Complete Section Button */}
      {onComplete && (
        <div className="flex justify-center pt-4">
          <Button onClick={onComplete} className="gradient-primary" size="lg">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            I've Completed This Section
          </Button>
        </div>
      )}
    </div>
  );
};

export default DetailedLessonContent;
