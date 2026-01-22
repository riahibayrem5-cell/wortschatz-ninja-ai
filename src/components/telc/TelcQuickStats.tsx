import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, Trophy, Clock, Flame, BookOpen, 
  CheckCircle2, TrendingUp, Award, Zap 
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TelcQuickStatsProps {
  totalExamsTaken: number;
  averageScore: number;
  currentStreak: number;
  totalPracticeMinutes: number;
  sectionScores: {
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
    sprachbausteine: number;
  };
  bestSection: string;
  weakestSection: string;
}

export const TelcQuickStats = ({
  totalExamsTaken = 0,
  averageScore = 0,
  currentStreak = 0,
  totalPracticeMinutes = 0,
  sectionScores = { reading: 0, listening: 0, writing: 0, speaking: 0, sprachbausteine: 0 },
  bestSection = "Reading",
  weakestSection = "Speaking"
}: Partial<TelcQuickStatsProps>) => {
  const { t } = useLanguage();
  
  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return `${hours}h ${remaining}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-500";
    if (score >= 60) return "text-primary";
    if (score >= 45) return "text-amber-500";
    return "text-destructive";
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: t('telc.grade.excellent'), color: "bg-emerald-500" };
    if (percentage >= 75) return { grade: t('telc.grade.good'), color: "bg-primary" };
    if (percentage >= 60) return { grade: t('telc.grade.satisfactory'), color: "bg-amber-500" };
    if (percentage >= 45) return { grade: t('telc.grade.sufficient'), color: "bg-orange-500" };
    return { grade: t('telc.grade.failed'), color: "bg-destructive" };
  };

  const gradeInfo = getGrade(averageScore);

  // Section labels use German exam names intentionally (learning content stays German)
  const sectionLabels = {
    reading: "Lesen",
    sprachbausteine: "Sprach.",
    listening: "Hören",
    writing: "Schreiben",
    speaking: "Sprechen"
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Exams Taken */}
        <Card className="glass group hover:scale-105 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalExamsTaken}</p>
              <p className="text-xs text-muted-foreground">{t('telc.stats.examsTaken')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="glass group hover:scale-105 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${gradeInfo.color}/20`}>
              <Trophy className={`w-5 h-5 ${getScoreColor(averageScore)}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</p>
              <p className="text-xs text-muted-foreground">{gradeInfo.grade}</p>
            </div>
          </CardContent>
        </Card>

        {/* Study Streak */}
        <Card className="glass group hover:scale-105 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">{t('telc.stats.dayStreak')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Practice Time */}
        <Card className="glass group hover:scale-105 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatMinutes(totalPracticeMinutes)}</p>
              <p className="text-xs text-muted-foreground">{t('telc.stats.practiceTime')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Performance */}
      <Card className="glass-luxury border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t('telc.stats.sectionPerformance')}
            </h3>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                <Zap className="w-3 h-3 mr-1" />
                {t('telc.stats.best')}: {bestSection}
              </Badge>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                {t('telc.stats.focus')}: {weakestSection}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { key: "reading", label: sectionLabels.reading, icon: BookOpen, color: "bg-blue-500" },
              { key: "sprachbausteine", label: sectionLabels.sprachbausteine, icon: Award, color: "bg-purple-500" },
              { key: "listening", label: sectionLabels.listening, icon: CheckCircle2, color: "bg-green-500" },
              { key: "writing", label: sectionLabels.writing, icon: Target, color: "bg-orange-500" },
              { key: "speaking", label: sectionLabels.speaking, icon: Trophy, color: "bg-red-500" },
            ].map((section) => {
              const score = sectionScores[section.key as keyof typeof sectionScores] || 0;
              const Icon = section.icon;
              return (
                <div key={section.key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      {section.label}
                    </span>
                    <span className={`font-semibold ${getScoreColor(score)}`}>{score}%</span>
                  </div>
                  <Progress value={score} className={`h-2 [&>div]:${section.color}`} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelcQuickStats;
