import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { speakText, stopSpeaking } from "@/utils/audio";

interface AudioButtonProps {
  text: string;
  lang?: 'de-DE' | 'en-US';
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const AudioButton = ({ text, lang = 'de-DE', size = 'sm', variant = 'outline' }: AudioButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(text, lang);
      
      // Reset after speech ends (approximate timing)
      setTimeout(() => {
        setIsPlaying(false);
      }, text.length * 50); // Rough estimate
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
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </Button>
  );
};

export default AudioButton;