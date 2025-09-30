import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Pause } from "lucide-react";
import { speakText, pauseSpeaking } from "@/utils/audio";

interface AudioButtonProps {
  text: string;
  lang?: 'de-DE' | 'en-US';
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const AudioButton = ({ text, lang = 'de-DE', size = 'sm', variant = 'outline' }: AudioButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = async () => {
    if (isPlaying) {
      pauseSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      try {
        await speakText(text, lang);
        setIsPlaying(false);
      } catch (error) {
        setIsPlaying(false);
      }
    }
  };

  return (
    <Button
      onClick={handleClick}
      size={size}
      variant={variant}
      className="glass"
      title={isPlaying ? "Stop audio" : "Play audio"}
    >
      {isPlaying ? (
        <Pause className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </Button>
  );
};

export default AudioButton;