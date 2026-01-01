import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Pause, Loader2, Check } from "lucide-react";
import { speakText, pauseSpeaking, stopSpeaking } from "@/utils/audio";
import { cn } from "@/lib/utils";

interface AudioButtonProps {
  text: string;
  lang?: 'de-DE' | 'en-US';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showCacheIndicator?: boolean;
  showPlayer?: boolean; // Legacy prop, ignored
  useCache?: boolean;
  className?: string;
}

const AudioButton = ({ 
  text, 
  lang = 'de-DE', 
  size = 'sm', 
  variant = 'outline',
  showCacheIndicator = true,
  useCache = true,
  className = ""
}: AudioButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wasFromCache, setWasFromCache] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setIsPlaying(true);
      setWasFromCache(false);
      
      try {
        await speakText(text, lang, {
          useCache,
          onCacheHit: () => setWasFromCache(true),
          onEnd: () => {
            setIsPlaying(false);
            setIsLoading(false);
          },
          onError: () => {
            setIsPlaying(false);
            setIsLoading(false);
          }
        });
      } catch (error) {
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Button
      onClick={handleClick}
      size={size}
      variant={variant}
      className={cn(
        "relative transition-all",
        wasFromCache && showCacheIndicator && "ring-1 ring-green-500/30",
        className
      )}
      title={isPlaying ? "Stop audio" : "Play audio"}
      disabled={isLoading && !isPlaying}
    >
      {isLoading && !isPlaying ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
      
      {/* Cache indicator */}
      {showCacheIndicator && wasFromCache && !isLoading && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
      )}
    </Button>
  );
};

export default AudioButton;