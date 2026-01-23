import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Globe,
  Target,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  GraduationCap,
} from "lucide-react";

interface OnboardingData {
  nativeLanguage: string;
  targetLevel: string;
  dailyGoal: number;
  examDate: string | null;
}

const STEPS = [
  { id: "welcome", icon: Sparkles },
  { id: "language", icon: Globe },
  { id: "level", icon: Target },
  { id: "goal", icon: Clock },
  { id: "exam", icon: Calendar },
  { id: "complete", icon: CheckCircle2 },
];

const languages = [
  { code: "en", label: "English", labelDe: "Englisch" },
  { code: "ar", label: "Arabic", labelDe: "Arabisch" },
  { code: "tr", label: "Turkish", labelDe: "Türkisch" },
  { code: "ru", label: "Russian", labelDe: "Russisch" },
  { code: "es", label: "Spanish", labelDe: "Spanisch" },
  { code: "fr", label: "French", labelDe: "Französisch" },
  { code: "other", label: "Other", labelDe: "Andere" },
];

const levels = [
  { code: "a2", label: "A2 → B1", desc: "Elementary to Intermediate" },
  { code: "b1", label: "B1 → B2", desc: "Intermediate to Upper-Intermediate" },
  { code: "b2", label: "B2 (TELC)", desc: "Upper-Intermediate (Exam Prep)" },
  { code: "c1", label: "B2 → C1", desc: "Upper-Intermediate to Advanced" },
];

const dailyGoals = [
  { minutes: 15, label: "Casual", labelDe: "Entspannt", desc: "15 min/day" },
  { minutes: 30, label: "Regular", labelDe: "Regelmäßig", desc: "30 min/day" },
  { minutes: 45, label: "Serious", labelDe: "Ernsthaft", desc: "45 min/day" },
  { minutes: 60, label: "Intensive", labelDe: "Intensiv", desc: "60 min/day" },
];

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    nativeLanguage: "",
    targetLevel: "b2",
    dailyGoal: 30,
    examDate: null,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      // Update user_settings with proper conflict handling
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: session.user.id,
          native_language: data.nativeLanguage,
          exam_target_date: data.examDate,
          onboarding_completed: true,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Update learning path with proper conflict handling
      await supabase
        .from("user_learning_paths")
        .upsert({
          user_id: session.user.id,
          target_level: data.targetLevel,
          daily_goal_minutes: data.dailyGoal,
          target_date: data.examDate,
        }, { onConflict: 'user_id' });

      toast({
        title: language === "de" ? "Willkommen!" : "Welcome!",
        description: language === "de" 
          ? "Dein Lernpfad wurde erstellt." 
          : "Your learning path has been created.",
      });

      onComplete();
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isDE = language === "de";

  const renderStep = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold">
              {isDE ? "Willkommen bei FluentPass!" : "Welcome to FluentPass!"}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isDE 
                ? "Lass uns deinen personalisierten Lernpfad erstellen. Das dauert nur eine Minute!"
                : "Let's create your personalized learning path. This will only take a minute!"}
            </p>
          </div>
        );

      case 1: // Native Language
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-bold">
                {isDE ? "Was ist deine Muttersprache?" : "What's your native language?"}
              </h2>
            </div>
            <RadioGroup
              value={data.nativeLanguage}
              onValueChange={(value) => setData({ ...data, nativeLanguage: value })}
              className="grid grid-cols-2 gap-3"
            >
              {languages.map((lang) => (
                <Label
                  key={lang.code}
                  htmlFor={lang.code}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    data.nativeLanguage === lang.code
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={lang.code} id={lang.code} />
                  <span>{isDE ? lang.labelDe : lang.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        );

      case 2: // Target Level
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-bold">
                {isDE ? "Was ist dein Ziel?" : "What's your goal?"}
              </h2>
            </div>
            <RadioGroup
              value={data.targetLevel}
              onValueChange={(value) => setData({ ...data, targetLevel: value })}
              className="space-y-3"
            >
              {levels.map((level) => (
                <Label
                  key={level.code}
                  htmlFor={level.code}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                    data.targetLevel === level.code
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={level.code} id={level.code} />
                    <span className="font-medium">{level.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{level.desc}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        );

      case 3: // Daily Goal
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-bold">
                {isDE ? "Wie viel Zeit pro Tag?" : "How much time per day?"}
              </h2>
            </div>
            <RadioGroup
              value={data.dailyGoal.toString()}
              onValueChange={(value) => setData({ ...data, dailyGoal: parseInt(value) })}
              className="grid grid-cols-2 gap-3"
            >
              {dailyGoals.map((goal) => (
                <Label
                  key={goal.minutes}
                  htmlFor={goal.minutes.toString()}
                  className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    data.dailyGoal === goal.minutes
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem 
                    value={goal.minutes.toString()} 
                    id={goal.minutes.toString()} 
                    className="sr-only"
                  />
                  <span className="font-medium">{isDE ? goal.labelDe : goal.label}</span>
                  <span className="text-sm text-muted-foreground">{goal.desc}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        );

      case 4: // Exam Date
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-bold">
                {isDE ? "Hast du ein Prüfungsdatum?" : "Do you have an exam date?"}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {isDE ? "(Optional - hilft bei der Planung)" : "(Optional - helps with planning)"}
              </p>
            </div>
            <div className="max-w-xs mx-auto">
              <Label htmlFor="exam-date">{isDE ? "Prüfungsdatum" : "Exam Date"}</Label>
              <Input
                id="exam-date"
                type="date"
                value={data.examDate || ""}
                onChange={(e) => setData({ ...data, examDate: e.target.value || null })}
                className="mt-2"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleNext}
            >
              {isDE ? "Überspringen" : "Skip"}
            </Button>
          </div>
        );

      case 5: // Complete
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">
              {isDE ? "Alles bereit!" : "All set!"}
            </h2>
            <div className="text-left bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isDE ? "Muttersprache:" : "Native Language:"}</span>
                <span className="font-medium">
                  {languages.find(l => l.code === data.nativeLanguage)?.label || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isDE ? "Ziel:" : "Target:"}</span>
                <span className="font-medium">
                  {levels.find(l => l.code === data.targetLevel)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isDE ? "Tägliches Ziel:" : "Daily Goal:"}</span>
                <span className="font-medium">{data.dailyGoal} min</span>
              </div>
              {data.examDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isDE ? "Prüfung:" : "Exam:"}</span>
                  <span className="font-medium">
                    {new Date(data.examDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!data.nativeLanguage;
      case 2: return !!data.targetLevel;
      case 3: return !!data.dailyGoal;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 glass-luxury">
        <Progress value={progress} className="mb-6" />
        
        <div className="min-h-[350px] flex flex-col">
          <div className="flex-1">
            {renderStep()}
          </div>
          
          <div className="flex justify-between mt-8 pt-4 border-t border-border/50">
            {step > 0 && step < STEPS.length - 1 ? (
              <Button variant="ghost" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                {isDE ? "Zurück" : "Back"}
              </Button>
            ) : (
              <div />
            )}
            
            {step < STEPS.length - 1 ? (
              <Button 
                onClick={handleNext} 
                disabled={!canProceed()}
                className="gradient-primary"
              >
                {isDE ? "Weiter" : "Continue"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={saving}
                className="gradient-primary"
              >
                {saving 
                  ? (isDE ? "Wird gespeichert..." : "Saving...") 
                  : (isDE ? "Los geht's!" : "Let's Go!")}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
