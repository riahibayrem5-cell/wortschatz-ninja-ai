import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  image: string;
  title: string;
  subtitle?: string;
  badge?: string;
  children?: ReactNode;
  className?: string;
  overlay?: "dark" | "light" | "gradient";
  height?: "sm" | "md" | "lg";
}

const HeroBanner = ({
  image,
  title,
  subtitle,
  badge,
  children,
  className,
  overlay = "gradient",
  height = "md",
}: HeroBannerProps) => {
  const heightClasses = {
    sm: "h-32 md:h-40",
    md: "h-48 md:h-64",
    lg: "h-64 md:h-80",
  };

  const overlayClasses = {
    dark: "bg-gradient-to-r from-background/95 via-background/80 to-transparent",
    light: "bg-gradient-to-r from-background/80 via-background/60 to-transparent",
    gradient: "bg-gradient-to-r from-background/90 via-background/70 to-background/30",
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        heightClasses[height],
        className
      )}
    >
      {/* Background Image */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay */}
      <div className={cn("absolute inset-0", overlayClasses[overlay])} />
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-6 md:px-10 z-10">
        {badge && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30 w-fit mb-3 animate-fade-in">
            {badge}
          </span>
        )}
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gradient-luxury mb-2 animate-fade-in">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl animate-fade-in animation-delay-100">
            {subtitle}
          </p>
        )}
        {children && (
          <div className="mt-4 animate-fade-in animation-delay-200">
            {children}
          </div>
        )}
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-4 right-20 w-16 h-16 bg-accent/10 rounded-full blur-xl animate-pulse animation-delay-500" />
    </div>
  );
};

export default HeroBanner;
