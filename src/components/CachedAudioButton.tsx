import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Pause, Loader2, Check } from "lucide-react";
import { useAudioCache } from "@/hooks/useContentCache";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CachedAudioButtonProps {
  text: string;
  lang?: 'de' | 'en';
  voice?: 'default' | 'female' | 'male';
  speed?: number;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showCacheIndicator?: boolean;
  className?: string;
  disabled?: boolean;
}

const CachedAudioButton = ({ 
  text, 
  lang = 'de', 
  voice = 'default',
  speed = 1.0,
  size = 'icon', 
  variant = 'ghost',
  showCacheIndicator = true,
  className = "",
  disabled = false
}: CachedAudioButtonProps) => {
  const { play, pause, resume, stop, isPlaying, isLoading, isFromCache, currentText } = useAudioCache({
    language: lang,
    voice,
    speed
  });

  const isThisPlaying = isPlaying && currentText === text;

  const handleClick = async () => {
    if (isLoading) return;
    
    if (isThisPlaying) {
      pause();
    } else if (isPlaying) {
      // Stop other audio and play this one
      stop();
      await play(text);
    } else {
      await play(text);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            size={size}
            variant={variant}
            className={cn(
              "relative transition-all",
              isFromCache && showCacheIndicator && "ring-1 ring-green-500/30",
              className
            )}
            disabled={disabled || isLoading}
            title={isThisPlaying ? "Pause" : "Play"}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isThisPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            
            {/* Cache indicator */}
            {showCacheIndicator && isFromCache && !isLoading && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-1.5 h-1.5 text-white" />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">
            {isLoading 
              ? "Generating audio..." 
              : isFromCache 
                ? "Cached audio" 
                : "Play audio"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CachedAudioButton;
