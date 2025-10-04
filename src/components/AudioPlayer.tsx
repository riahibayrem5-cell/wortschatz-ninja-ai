import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Square } from "lucide-react";
import { speakText, stopSpeaking } from "@/utils/audio";

interface AudioPlayerProps {
  text: string;
  lang?: 'de-DE' | 'en-US';
  className?: string;
}

const AudioPlayer = ({ text, lang = "de-DE", className = "" }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = async () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      try {
        await speakText(text, lang);
        setIsPlaying(false);
      } catch (error) {
        console.error('Audio playback error:', error);
        setIsPlaying(false);
      }
    }
  };

  return (
    <Button
      onClick={handleClick}
      size="icon"
      variant="ghost"
      className={`h-8 w-8 ${className}`}
      title={isPlaying ? "Stop audio" : "Play audio"}
    >
      {isPlaying ? (
        <Square className="w-4 h-4 fill-current" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </Button>
  );
};

export default AudioPlayer;
