import { ElementType } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Award, Target } from "lucide-react";

interface TelcSectionBannerProps {
  sectionId: string;
  title: string;
  subtitle?: string;
  icon: ElementType;
  color: string;
  maxPoints: number;
  duration: number;
  currentTeil?: number;
  totalTeile?: number;
  timeRemaining?: number;
  isPaused?: boolean;
}

const sectionBackgrounds: Record<string, string> = {
  reading: "from-blue-600/30 via-blue-500/20 to-indigo-500/10",
  sprachbausteine: "from-purple-600/30 via-purple-500/20 to-violet-500/10",
  listening: "from-green-600/30 via-green-500/20 to-emerald-500/10",
  writing: "from-orange-600/30 via-orange-500/20 to-amber-500/10",
  speaking: "from-red-600/30 via-red-500/20 to-rose-500/10",
};

const sectionIconBg: Record<string, string> = {
  reading: "bg-blue-500/20 text-blue-400",
  sprachbausteine: "bg-purple-500/20 text-purple-400",
  listening: "bg-green-500/20 text-green-400",
  writing: "bg-orange-500/20 text-orange-400",
  speaking: "bg-red-500/20 text-red-400",
};

const sectionDescriptions: Record<string, string> = {
  reading: "Analyze texts, understand context, and answer comprehension questions",
  sprachbausteine: "Complete gaps with correct grammar and vocabulary",
  listening: "Listen carefully and answer questions about audio content",
  writing: "Express yourself clearly in written German",
  speaking: "Practice verbal communication and pronunciation",
};

export const TelcSectionBanner = ({
  sectionId,
  title,
  subtitle,
  icon: Icon,
  color,
  maxPoints,
  duration,
  currentTeil,
  totalTeile,
  timeRemaining,
  isPaused = false,
}: TelcSectionBannerProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const bgGradient = sectionBackgrounds[sectionId] || sectionBackgrounds.reading;
  const iconBg = sectionIconBg[sectionId] || sectionIconBg.reading;
  const description = sectionDescriptions[sectionId] || subtitle;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${bgGradient} border border-white/10 p-6 mb-6 animate-fade-in`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Icon and Title */}
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${iconBg}`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{title}</h2>
                {currentTeil !== undefined && totalTeile && (
                  <Badge variant="secondary" className="text-xs">
                    Teil {currentTeil + 1}/{totalTeile}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                {description}
              </p>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="px-3 py-1.5 text-sm bg-background/30 backdrop-blur-sm">
              <Target className="w-4 h-4 mr-1.5" />
              {maxPoints} points
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 text-sm bg-background/30 backdrop-blur-sm">
              <Clock className="w-4 h-4 mr-1.5" />
              {duration} min
            </Badge>
            {timeRemaining !== undefined && (
              <Badge 
                variant="outline" 
                className={`px-3 py-1.5 text-sm font-mono ${
                  isPaused 
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                    : timeRemaining < 300 
                      ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                      : 'bg-background/30 backdrop-blur-sm'
                }`}
              >
                <Clock className="w-4 h-4 mr-1.5" />
                {isPaused ? 'PAUSED' : formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelcSectionBanner;
