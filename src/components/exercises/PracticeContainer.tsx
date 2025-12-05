import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Loader2, RefreshCw, BookOpen, ListChecks, 
  ArrowLeftRight, Languages, Sparkles 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FillInTheBlankExercise from "./FillInTheBlankExercise";
import MultipleChoiceExercise from "./MultipleChoiceExercise";
import MatchingExercise from "./MatchingExercise";
import TranslationExercise from "./TranslationExercise";
import ExerciseResults from "./ExerciseResults";

interface LessonContent {
  topics?: string[];
  word_count?: number;
  skill?: string;
  format?: string;
  audio_type?: string;
  section?: string;
}

interface PracticeContainerProps {
  lessonId: string;
  lessonType: string;
  lessonTitle: string;
  lessonContent: LessonContent;
  onExerciseComplete?: (score: number, total: number) => void;
}

type ExerciseType = "fill-blank" | "mcq" | "matching" | "translation";

const PracticeContainer = ({ 
  lessonId, 
  lessonType, 
  lessonTitle,
  lessonContent,
  onExerciseComplete 
}: PracticeContainerProps) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ExerciseType>("fill-blank");
  const [exercises, setExercises] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [lastResult, setLastResult] = useState<{score: number; total: number} | null>(null);
  const [generatedTypes, setGeneratedTypes] = useState<Set<ExerciseType>>(new Set());

  const exerciseTypes: { id: ExerciseType; label: string; icon: React.ReactNode }[] = [
    { id: "fill-blank", label: "Fill in Blanks", icon: <BookOpen className="h-4 w-4" /> },
    { id: "mcq", label: "Multiple Choice", icon: <ListChecks className="h-4 w-4" /> },
    { id: "matching", label: "Matching", icon: <ArrowLeftRight className="h-4 w-4" /> },
    { id: "translation", label: "Translation", icon: <Languages className="h-4 w-4" /> },
  ];

  const generateExercises = async (type: ExerciseType) => {
    setLoading(true);
    setShowResults(false);

    try {
      const { data, error } = await supabase.functions.invoke("generate-gap-fill", {
        body: {
          exerciseType: type,
          lessonType,
          lessonTitle,
          topics: lessonContent?.topics || [],
          skill: lessonContent?.skill,
          format: lessonContent?.format,
          difficulty: "B2"
        }
      });

      if (error) throw error;

      setExercises(prev => ({
        ...prev,
        [type]: data.exercises
      }));
      setGeneratedTypes(prev => new Set([...prev, type]));

    } catch (error: any) {
      console.error("Error generating exercises:", error);
      toast.error("Failed to generate exercises. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseComplete = (score: number, total: number) => {
    setLastResult({ score, total });
    setShowResults(true);
    onExerciseComplete?.(score, total);
  };

  const handleRetry = () => {
    setShowResults(false);
    // Re-generate exercises
    generateExercises(activeTab);
  };

  const handleContinue = () => {
    setShowResults(false);
    // Move to next exercise type or show selection
    const currentIndex = exerciseTypes.findIndex(t => t.id === activeTab);
    if (currentIndex < exerciseTypes.length - 1) {
      const nextType = exerciseTypes[currentIndex + 1].id;
      setActiveTab(nextType);
      if (!generatedTypes.has(nextType)) {
        generateExercises(nextType);
      }
    }
  };

  const handleTabChange = (value: string) => {
    const newTab = value as ExerciseType;
    setActiveTab(newTab);
    setShowResults(false);
    
    if (!generatedTypes.has(newTab) && !loading) {
      generateExercises(newTab);
    }
  };

  // Initial load
  useEffect(() => {
    if (!generatedTypes.has(activeTab)) {
      generateExercises(activeTab);
    }
  }, []);

  const renderExercise = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="font-medium">Generating exercises...</p>
            <p className="text-sm text-muted-foreground">AI is creating personalized practice for you</p>
          </div>
        </div>
      );
    }

    if (showResults && lastResult) {
      return (
        <ExerciseResults
          score={lastResult.score}
          total={lastResult.total}
          exerciseType={activeTab}
          onRetry={handleRetry}
          onContinue={handleContinue}
        />
      );
    }

    const currentExercises = exercises?.[activeTab];

    if (!currentExercises || currentExercises.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No exercises generated yet</p>
          <Button onClick={() => generateExercises(activeTab)} className="gradient-primary">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Exercises
          </Button>
        </div>
      );
    }

    switch (activeTab) {
      case "fill-blank":
        return (
          <FillInTheBlankExercise
            items={currentExercises}
            onComplete={handleExerciseComplete}
          />
        );
      case "mcq":
        return (
          <MultipleChoiceExercise
            items={currentExercises}
            onComplete={handleExerciseComplete}
          />
        );
      case "matching":
        return (
          <MatchingExercise
            pairs={currentExercises}
            onComplete={handleExerciseComplete}
          />
        );
      case "translation":
        return (
          <TranslationExercise
            items={currentExercises}
            onComplete={handleExerciseComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Type Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-4 w-full">
          {exerciseTypes.map((type) => (
            <TabsTrigger 
              key={type.id} 
              value={type.id}
              className="flex items-center gap-2 text-xs sm:text-sm"
              disabled={loading}
            >
              {type.icon}
              <span className="hidden sm:inline">{type.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          {/* Refresh Button */}
          {!loading && !showResults && exercises?.[activeTab] && (
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateExercises(activeTab)}
                className="text-muted-foreground"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Questions
              </Button>
            </div>
          )}

          {/* Exercise Content */}
          {renderExercise()}
        </div>
      </Tabs>

      {/* Lesson Context Badge */}
      <div className="flex flex-wrap gap-2 justify-center pt-4 border-t border-border/50">
        <Badge variant="outline" className="text-xs">
          📚 {lessonTitle}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Level: B2
        </Badge>
        {lessonContent?.topics && lessonContent.topics.length > 0 && (
          <Badge variant="outline" className="text-xs">
            Topics: {lessonContent.topics.slice(0, 2).join(", ")}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default PracticeContainer;
