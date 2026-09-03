import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BookOpen,
  Target,
  Lightbulb,
  GraduationCap,
  AlertTriangle,
  ListChecks,
  Quote,
  Languages,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CachedAudioButton from "@/components/CachedAudioButton";
import type { LessonContentV2 } from "@/types/lesson";

interface Props {
  content: LessonContentV2;
}

const SectionTitle = ({
  icon: Icon,
  children,
  hint,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  hint?: string;
}) => (
  <div className="flex items-baseline gap-3 mb-4">
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </span>
    <div>
      <h2 className="font-serif text-2xl leading-tight">{children}</h2>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  </div>
);

const LessonV2Content = ({ content }: Props) => {
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <article className="space-y-14">
      {/* Opening */}
      <section className="space-y-5">
        <p className="font-serif text-xl md:text-2xl leading-relaxed text-foreground/90 border-l-2 border-primary pl-5">
          {content.hook}
        </p>
        <p className="text-muted-foreground leading-relaxed">{content.overview}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="bg-secondary/40 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
                Learning objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {content.objectives?.map((objective, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-primary">—</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {content.telc && (
            <Card className="border-primary/25 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium tracking-wide uppercase text-primary">
                  In the TELC B2 exam
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{content.telc.section}</Badge>
                  {content.telc.teil && <Badge variant="outline">{content.telc.teil}</Badge>}
                  <Badge variant="outline">{content.telc.minutes} min</Badge>
                  <Badge variant="outline">{content.telc.points} pts</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{content.telc.why_it_matters}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Teaching sections */}
      {content.sections?.length > 0 && (
        <section className="space-y-10">
          {content.sections.map((section, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl text-primary/30 leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-serif text-2xl leading-tight">{section.heading}</h2>
                  <p className="text-sm italic text-muted-foreground">{section.heading_de}</p>
                </div>
              </div>

              <p className="leading-[1.85] text-foreground/90 whitespace-pre-line">{section.body}</p>

              {section.bullets?.length > 0 && (
                <ul className="space-y-2 pl-1">
                  {section.bullets.map((bullet, bi) => (
                    <li key={bi} className="flex gap-3 text-sm">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-foreground/85">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.examples?.length > 0 && (
                <div className="rounded-xl border border-border/70 bg-secondary/30 divide-y divide-border/60">
                  {section.examples.map((example, ei) => (
                    <div key={ei} className="p-4 space-y-1">
                      <div className="flex items-start gap-2">
                        <p className="font-medium leading-relaxed flex-1">{example.de}</p>
                        <CachedAudioButton text={example.de} size="sm" variant="ghost" />
                      </div>
                      <p className="text-sm text-muted-foreground">{example.en}</p>
                      {example.note && (
                        <p className="text-xs text-primary/80 italic pt-1">{example.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Grammar boxes */}
      {content.grammar_boxes?.length > 0 && (
        <section>
          <SectionTitle icon={GraduationCap} hint="Rules you will be tested on">
            Grammar focus
          </SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {content.grammar_boxes.map((box, i) => (
              <Card key={i} className="border-accent/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{box.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed">{box.rule}</p>
                  <div className="space-y-1.5">
                    {box.examples?.map((example, ei) => (
                      <div key={ei} className="rounded-md bg-secondary/50 px-3 py-2">
                        <p className="text-sm font-medium">{example.de}</p>
                        <p className="text-xs text-muted-foreground">{example.en}</p>
                      </div>
                    ))}
                  </div>
                  {box.pitfall && (
                    <p className="flex gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-accent" />
                      {box.pitfall}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Model text */}
      {content.model_text && (
        <section>
          <SectionTitle icon={Quote} hint="Authentic exam-level material">
            {content.model_text.title}
          </SectionTitle>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center gap-3">
                <CachedAudioButton text={content.model_text.text} size="sm" variant="outline" />
                <Button variant="ghost" size="sm" onClick={() => setShowTranslation((v) => !v)}>
                  <Languages className="h-4 w-4 mr-2" />
                  {showTranslation ? "Hide" : "Show"} translation
                </Button>
              </div>
              <p className="font-serif text-[1.05rem] leading-[1.9] whitespace-pre-line">
                {content.model_text.text}
              </p>
              {showTranslation && (
                <p className="rounded-lg bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {content.model_text.translation}
                </p>
              )}
              {content.model_text.notes?.length > 0 && (
                <ul className="space-y-2 border-t border-border/60 pt-4">
                  {content.model_text.notes.map((note, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">▸</span>
                      {note}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Key terms */}
      {content.key_terms?.length > 0 && (
        <section>
          <SectionTitle icon={BookOpen} hint={`${content.key_terms.length} words and phrases to own`}>
            Key vocabulary
          </SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {content.key_terms.map((term, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/70 p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">
                    {term.article && <span className="text-primary mr-1">{term.article}</span>}
                    {term.german}
                    {term.plural && (
                      <span className="ml-2 text-xs text-muted-foreground">pl. {term.plural}</span>
                    )}
                  </p>
                  <CachedAudioButton text={term.german} size="sm" variant="ghost" />
                </div>
                <p className="text-sm text-muted-foreground">{term.english}</p>
                <p className="mt-2 text-sm italic border-l-2 border-primary/30 pl-3">{term.example}</p>
                <p className="text-xs text-muted-foreground pl-3">{term.example_en}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Strategy */}
      {content.strategy?.length > 0 && (
        <section>
          <SectionTitle icon={Compass} hint="Step by step, in the exam room">
            Exam strategy
          </SectionTitle>
          <ol className="space-y-3">
            {content.strategy.map((step, i) => (
              <li key={i} className="flex gap-4 rounded-lg border border-border/60 p-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Common mistakes */}
      {content.common_mistakes?.length > 0 && (
        <section>
          <SectionTitle icon={AlertTriangle} hint="Fix these before exam day">
            Common mistakes
          </SectionTitle>
          <Accordion type="single" collapsible className="rounded-xl border border-border/70 px-4">
            {content.common_mistakes.map((mistake, i) => (
              <AccordionItem key={i} value={`m-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="line-through text-destructive/80">{mistake.wrong}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{mistake.right}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{mistake.why}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* Recap + tips */}
      <section className="grid gap-4 md:grid-cols-2">
        {content.recap?.length > 0 && (
          <Card className="bg-secondary/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ListChecks className="h-4 w-4 text-primary" />
                Recap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {content.recap.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-primary">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {content.exam_tips?.length > 0 && (
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-accent" />
                Exam-day tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {content.exam_tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>
    </article>
  );
};

export default LessonV2Content;
