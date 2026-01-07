import { ReactNode, ElementType } from "react";
import { Badge } from "@/components/ui/badge";

interface SubsectionBannerProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: ElementType;
  variant?: "default" | "gradient" | "glass" | "minimal";
  color?: "primary" | "accent" | "blue" | "green" | "purple" | "orange";
  children?: ReactNode;
}

const colorStyles = {
  primary: "from-primary/20 to-primary/5 border-primary/30",
  accent: "from-accent/20 to-accent/5 border-accent/30",
  blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  green: "from-green-500/20 to-green-500/5 border-green-500/30",
  purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
  orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
};

const iconColorStyles = {
  primary: "text-primary bg-primary/20",
  accent: "text-accent bg-accent/20",
  blue: "text-blue-500 bg-blue-500/20",
  green: "text-green-500 bg-green-500/20",
  purple: "text-purple-500 bg-purple-500/20",
  orange: "text-orange-500 bg-orange-500/20",
};

export const SubsectionBanner = ({
  title,
  subtitle,
  badge,
  icon: Icon,
  variant = "default",
  color = "primary",
  children,
}: SubsectionBannerProps) => {
  const baseStyles = "relative overflow-hidden rounded-xl p-4 md:p-6 transition-all duration-300";
  
  const variantStyles = {
    default: `bg-gradient-to-r ${colorStyles[color]} border`,
    gradient: `bg-gradient-to-br ${colorStyles[color]} border backdrop-blur-sm`,
    glass: "glass-luxury border-primary/20",
    minimal: "bg-secondary/30 border border-border/50",
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} animate-fade-in`}>
      {/* Decorative elements for gradient variant */}
      {variant === "gradient" && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
        </>
      )}
      
      <div className="relative z-10">
        <div className="flex items-start gap-4">
          {/* Icon */}
          {Icon && (
            <div className={`p-2.5 rounded-lg ${iconColorStyles[color]} shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg truncate">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground line-clamp-2">{subtitle}</p>
            )}
          </div>
          
          {/* Additional content */}
          {children && (
            <div className="shrink-0">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubsectionBanner;
