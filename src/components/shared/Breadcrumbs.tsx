import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

// Route to translation key mapping
const routeLabels: Record<string, string> = {
  dashboard: "nav.dashboard",
  vocabulary: "nav.vocabulary",
  "word-dossier": "nav.wordDossier",
  "sentence-generator": "nav.sentenceGenerator",
  review: "nav.review",
  writing: "nav.writing",
  exercises: "nav.exercises",
  memorizer: "nav.memorizer",
  "word-association": "nav.wordAssociation",
  conversation: "nav.conversation",
  highlighter: "nav.textHighlighter",
  diary: "nav.mistakeDiary",
  settings: "nav.settings",
  "telc-exam": "nav.telcExam",
  "telc-vorbereitung": "nav.telcPrep",
  "ai-companion": "nav.aiCompanion",
  history: "nav.history",
  "activity-log": "nav.activityLog",
  subscriptions: "nav.subscription",
  "learning-path": "nav.learningPath",
  achievements: "nav.achievements",
  "mastery-course": "nav.masteryCourse",
  certificates: "nav.certificates",
};

export const Breadcrumbs = ({ 
  items, 
  showHome = true,
  className 
}: BreadcrumbsProps) => {
  const location = useLocation();
  const { t } = useLanguage();

  // Auto-generate breadcrumbs from current path if items not provided
  const breadcrumbs = items || (() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    return pathParts.map((part, index) => {
      const href = "/" + pathParts.slice(0, index + 1).join("/");
      const labelKey = routeLabels[part] || part;
      const label = labelKey.startsWith("nav.") ? t(labelKey) : part.replace(/-/g, " ");
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        href: index < pathParts.length - 1 ? href : undefined
      };
    });
  })();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center text-sm text-muted-foreground mb-4", className)}
    >
      <ol className="flex items-center gap-1">
        {showHome && (
          <>
            <li>
              <Link 
                to="/dashboard" 
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                <span className="sr-only">{t("nav.dashboard")}</span>
              </Link>
            </li>
            {breadcrumbs.length > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            )}
          </>
        )}
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {item.href ? (
              <Link 
                to={item.href} 
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
