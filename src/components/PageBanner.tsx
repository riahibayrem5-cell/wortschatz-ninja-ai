import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

// Import all banners (WebP optimized)
import dashboardBanner from "@/assets/banners/dashboard-banner.webp";
import telcBanner from "@/assets/banners/telc-banner.webp";
import telcExamBanner from "@/assets/banners/telc-exam-banner.webp";
import vocabularyBanner from "@/assets/banners/vocabulary-banner.webp";
import conversationBanner from "@/assets/banners/conversation-banner.webp";
import writingBanner from "@/assets/banners/writing-banner.webp";
import aiCompanionBanner from "@/assets/banners/ai-companion-banner.webp";
import exercisesBanner from "@/assets/banners/exercises-banner.webp";
import memorizerBanner from "@/assets/banners/memorizer-banner.webp";
import achievementsBanner from "@/assets/banners/achievements-banner.webp";
import certificatesBanner from "@/assets/banners/certificates-banner.webp";
import masteryCourserBanner from "@/assets/banners/mastery-course-banner.webp";
import reviewBanner from "@/assets/banners/review-banner.webp";
import learningPathBanner from "@/assets/banners/learning-path-banner.webp";
import textHighlighterBanner from "@/assets/banners/text-highlighter-banner.webp";
import mistakeDiaryBanner from "@/assets/banners/mistake-diary-banner.webp";
import wordAssociationBanner from "@/assets/banners/word-association-banner.webp";
import sentenceGeneratorBanner from "@/assets/banners/sentence-generator-banner.webp";
import wordDossierBanner from "@/assets/banners/word-dossier-banner.webp";

export type BannerType = 
  | "dashboard"
  | "telc"
  | "telc-exam"
  | "vocabulary"
  | "conversation"
  | "writing"
  | "ai-companion"
  | "exercises"
  | "memorizer"
  | "achievements"
  | "certificates"
  | "mastery-course"
  | "review"
  | "learning-path"
  | "text-highlighter"
  | "mistake-diary"
  | "word-association"
  | "sentence-generator"
  | "word-dossier";

const bannerImages: Record<BannerType, string> = {
  dashboard: dashboardBanner,
  telc: telcBanner,
  "telc-exam": telcExamBanner,
  vocabulary: vocabularyBanner,
  conversation: conversationBanner,
  writing: writingBanner,
  "ai-companion": aiCompanionBanner,
  exercises: exercisesBanner,
  memorizer: memorizerBanner,
  achievements: achievementsBanner,
  certificates: certificatesBanner,
  "mastery-course": masteryCourserBanner,
  review: reviewBanner,
  "learning-path": learningPathBanner,
  "text-highlighter": textHighlighterBanner,
  "mistake-diary": mistakeDiaryBanner,
  "word-association": wordAssociationBanner,
  "sentence-generator": sentenceGeneratorBanner,
  "word-dossier": wordDossierBanner,
};

interface PageBannerProps {
  type: BannerType;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  compact?: boolean;
}

export const PageBanner = ({
  type,
  title,
  subtitle,
  badge,
  icon: Icon,
  children,
  compact = false,
}: PageBannerProps) => {
  const bannerImage = bannerImages[type];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${
        compact ? "h-32 md:h-40" : "h-48 md:h-64"
      }`}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImage})` }}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center p-6 md:p-8">
        <div className="max-w-2xl">
          {/* Badge */}
          {badge && (
            <Badge className="mb-3 gradient-primary text-primary-foreground border-0">
              {badge}
            </Badge>
          )}
          
          {/* Title with Icon */}
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className="p-2.5 rounded-xl bg-primary/20 backdrop-blur-sm">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            )}
            <h1 className={`font-bold ${compact ? "text-xl md:text-2xl" : "text-2xl md:text-4xl"}`}>
              {title}
            </h1>
          </div>
          
          {/* Subtitle */}
          {subtitle && (
            <p className={`text-muted-foreground ${compact ? "text-sm" : "text-base md:text-lg"} max-w-xl`}>
              {subtitle}
            </p>
          )}
          
          {/* Additional Content (buttons, stats, etc.) */}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageBanner;
