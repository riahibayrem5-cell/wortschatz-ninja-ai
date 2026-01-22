import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  FileText,
  ChevronRight,
  Clock,
  Target,
  Trophy,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SectionProgress {
  id: string;
  title: string;
  titleDe: string;
  icon: any;
  color: string;
  bgColor: string;
  maxPoints: number;
  duration: number;
  teileCount: number;
  progress: number;
  lastPracticed?: string;
  bestScore?: number;
  practiceCount: number;
}

interface SectionProgressCardsProps {
  sections?: Partial<SectionProgress>[];
}

const defaultSections: SectionProgress[] = [
  {
    id: "reading",
    title: "Reading",
    titleDe: "Leseverstehen",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    maxPoints: 75,
    duration: 90,
    teileCount: 3,
    progress: 0,
    practiceCount: 0
  },
  {
    id: "sprachbausteine",
    title: "Language",
    titleDe: "Sprachbausteine",
    icon: PenTool,
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    maxPoints: 30,
    duration: 30,
    teileCount: 2,
    progress: 0,
    practiceCount: 0
  },
  {
    id: "listening",
    title: "Listening",
    titleDe: "Hörverstehen",
    icon: Headphones,
    color: "text-green-500",
    bgColor: "bg-green-500",
    maxPoints: 75,
    duration: 20,
    teileCount: 3,
    progress: 0,
    practiceCount: 0
  },
  {
    id: "writing",
    title: "Writing",
    titleDe: "Schreiben",
    icon: FileText,
    color: "text-orange-500",
    bgColor: "bg-orange-500",
    maxPoints: 45,
    duration: 30,
    teileCount: 1,
    progress: 0,
    practiceCount: 0
  },
  {
    id: "speaking",
    title: "Speaking",
    titleDe: "Sprechen",
    icon: Mic,
    color: "text-red-500",
    bgColor: "bg-red-500",
    maxPoints: 75,
    duration: 15,
    teileCount: 3,
    progress: 0,
    practiceCount: 0
  }
];

export const SectionProgressCards = ({ sections = defaultSections }: SectionProgressCardsProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handlePractice = (sectionId: string) => {
    navigate(`/telc-vorbereitung?section=${sectionId}`);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-emerald-500";
    if (progress >= 50) return "text-primary";
    if (progress >= 25) return "text-amber-500";
    return "text-muted-foreground";
  };

  const getProgressBadge = (progress: number) => {
    if (progress >= 80) return { label: t('telc.progressCard.advanced'), variant: "default" as const };
    if (progress >= 50) return { label: t('telc.progressCard.intermediate'), variant: "secondary" as const };
    if (progress >= 25) return { label: t('telc.progressCard.beginner'), variant: "outline" as const };
    return { label: t('telc.progressCard.newStart'), variant: "outline" as const };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          {t('telc.examSections')}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => navigate('/telc-vorbereitung')}>
          {t('telc.showAll')}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {(sections as SectionProgress[]).map((section) => {
          const Icon = section.icon;
          const progressBadge = getProgressBadge(section.progress);
          
          return (
            <Card 
              key={section.id}
              className="group glass hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
              onClick={() => handlePractice(section.id)}
            >
              {/* Color accent bar */}
              <div className={`h-1 ${section.bgColor} opacity-50 group-hover:opacity-100 transition-opacity`} />
              
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${section.bgColor}/10`}>
                    <Icon className={`w-5 h-5 ${section.color}`} />
                  </div>
                  <Badge variant={progressBadge.variant} className="text-xs">
                    {progressBadge.label}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">{section.titleDe}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t('telc.progress')}</span>
                    <span className={`font-semibold ${getProgressColor(section.progress)}`}>
                      {section.progress}%
                    </span>
                  </div>
                  <Progress value={section.progress} className="h-1.5" />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {section.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {section.maxPoints} {t('telc.points')}
                  </span>
                </div>

                {/* Best Score */}
                {section.bestScore !== undefined && section.bestScore > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {t('telc.progressCard.bestScore')}
                    </span>
                    <span className="font-semibold text-primary">{section.bestScore}%</span>
                  </div>
                )}

                {/* Practice count */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {t('telc.exercises')}
                  </span>
                  <span>{section.practiceCount}x</span>
                </div>

                {/* CTA */}
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {t('telc.startPractice')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total Points Overview */}
      <Card className="glass border-primary/20 mt-4">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">TELC B2 {t('telc.maxPoints')}</p>
                <p className="text-sm text-muted-foreground">{t('telc.examParts')}: 5</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">300</p>
                <p className="text-xs text-muted-foreground">{t('telc.maxPoints')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">60%</p>
                <p className="text-xs text-muted-foreground">{t('telc.passingScore')}</p>
              </div>
              <Button className="gradient-primary" onClick={() => navigate('/telc-exam')}>
                {t('telc.startExam')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionProgressCards;
