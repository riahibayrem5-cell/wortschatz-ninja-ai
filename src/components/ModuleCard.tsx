import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Play, BookOpen, Clock, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  module: {
    id: string;
    week_number: number;
    title: string;
    title_de: string;
    description: string;
    skills_focus: string[];
    estimated_hours: number;
  };
  status: "completed" | "in_progress" | "unlocked";
  progress?: number;
  score?: number | null;
  onClick: () => void;
}

const skillIcons: Record<string, string> = {
  vocabulary: "📚",
  grammar: "✍️",
  reading: "📖",
  listening: "🎧",
  writing: "📝",
  speaking: "🗣️",
  exam_practice: "📋",
  grammar_review: "✍️",
  reading_basics: "📖",
  text_analysis: "🔍",
  vocabulary_in_context: "📚",
  note_taking: "📝",
  audio_comprehension: "🎧",
  formal_style: "✨",
  text_structure: "📄",
  pronunciation: "🔊",
  fluency: "💬",
  subjunctive: "📖",
  passive: "📖",
  complex_sentences: "📖",
  reading_advanced: "📖",
  opinion_analysis: "💭",
  inference: "🧠",
  listening_advanced: "🎧",
  media_comprehension: "📺",
  writing_advanced: "📝",
  argumentation: "💡",
  professional_writing: "💼",
  speaking_advanced: "🗣️",
  debate: "🎯",
  presentation: "📊",
  exam_strategies: "🎯",
  time_management: "⏱️",
  practice_tests: "📋",
};

const ModuleCard = ({ module, status, progress = 0, score, onClick }: ModuleCardProps) => {
  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
        status === "completed" && "border-primary/40 bg-primary/5 hover:border-primary/60",
        status === "in_progress" && "border-yellow-500/40 bg-yellow-500/5 hover:border-yellow-500/60",
        status === "unlocked" && "hover:border-primary/30"
      )}
      onClick={onClick}
    >
      {/* Status Indicator Bar */}
      <div className={cn(
        "h-1 w-full rounded-t-lg",
        status === "completed" && "bg-primary",
        status === "in_progress" && "bg-yellow-500",
        status === "unlocked" && "bg-muted"
      )} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge
            variant={status === "completed" ? "default" : "secondary"}
            className={cn(
              status === "completed" && "bg-primary text-primary-foreground",
              status === "in_progress" && "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
            )}
          >
            Week {module.week_number}
          </Badge>
          <div className="flex items-center gap-2">
            {score && (
              <div className="flex items-center gap-1 text-sm text-yellow-500">
                <Star className="h-4 w-4 fill-yellow-500" />
                {score}%
              </div>
            )}
            {status === "completed" && (
              <CheckCircle2 className="h-5 w-5 text-primary animate-scale-in" />
            )}
            {status === "in_progress" && (
              <Play className="h-5 w-5 text-yellow-500 animate-pulse" />
            )}
            {status === "unlocked" && (
              <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
          {module.title}
        </CardTitle>
        <CardDescription className="text-sm italic line-clamp-1">
          {module.title_de}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {module.description}
        </p>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {module.skills_focus.slice(0, 3).map((skill, idx) => (
            <Badge key={idx} variant="outline" className="text-xs py-0.5">
              {skillIcons[skill] || "📌"} {skill.replace(/_/g, ' ')}
            </Badge>
          ))}
          {module.skills_focus.length > 3 && (
            <Badge variant="outline" className="text-xs py-0.5">
              +{module.skills_focus.length - 3}
            </Badge>
          )}
        </div>
        
        {/* Progress Bar for in-progress modules */}
        {status === "in_progress" && progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {module.estimated_hours}h
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
