import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "primary" | "accent" | "success" | "warning";
  className?: string;
  onClick?: () => void;
}

const StatCard = ({
  icon,
  value,
  label,
  trend,
  trendValue,
  variant = "default",
  className,
  onClick,
}: StatCardProps) => {
  const variantClasses = {
    default: "glass hover:border-border/80",
    primary: "glass-luxury border-primary/20 hover:border-primary/40",
    accent: "glass border-accent/20 hover:border-accent/40",
    success: "glass border-green-500/20 hover:border-green-500/40",
    warning: "glass border-yellow-500/20 hover:border-yellow-500/40",
  };

  const iconVariantClasses = {
    default: "bg-muted text-foreground",
    primary: "bg-primary/20 text-primary",
    accent: "bg-accent/20 text-accent",
    success: "bg-green-500/20 text-green-500",
    warning: "bg-yellow-500/20 text-yellow-500",
  };

  const valueVariantClasses = {
    default: "text-foreground",
    primary: "text-primary",
    accent: "text-accent",
    success: "text-green-500",
    warning: "text-yellow-500",
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
        variantClasses[variant],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={cn("text-3xl md:text-4xl font-bold", valueVariantClasses[variant])}>
              {value}
            </p>
            <p className="text-sm text-muted-foreground mt-1 truncate">{label}</p>
            {trend && trendValue && (
              <p className={cn(
                "text-xs mt-2 flex items-center gap-1",
                trend === "up" && "text-green-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-muted-foreground"
              )}>
                {trend === "up" && "↑"}
                {trend === "down" && "↓"}
                {trendValue}
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", iconVariantClasses[variant])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
