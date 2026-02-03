import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  Download, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Loader2,
  Mic,
  SkipBack,
  SkipForward,
  Gauge
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceOption {
  id: string;
  name: string;
  dialect: string;
  gender: 'male' | 'female';
  description: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  // Hochdeutsch
  { id: 'daniel', name: 'Daniel', dialect: 'Hochdeutsch', gender: 'male', description: 'Clear, professional' },
  { id: 'lily', name: 'Lily', dialect: 'Hochdeutsch', gender: 'female', description: 'Warm, friendly' },
  { id: 'matilda', name: 'Matilda', dialect: 'Hochdeutsch', gender: 'female', description: 'Educational tone' },
  { id: 'callum', name: 'Callum', dialect: 'Hochdeutsch', gender: 'male', description: 'Deep, authoritative' },
  // Regional
  { id: 'liam', name: 'Liam', dialect: 'Bayerisch', gender: 'male', description: 'Southern German' },
  { id: 'chris', name: 'Chris', dialect: 'Österreichisch', gender: 'male', description: 'Austrian German' },
  { id: 'anna', name: 'Anna', dialect: 'Schweizerdeutsch', gender: 'female', description: 'Swiss German' },
];

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5×' },
  { value: 0.75, label: '0.75×' },
  { value: 1, label: '1×' },
  { value: 1.25, label: '1.25×' },
  { value: 1.5, label: '1.5×' },
];

interface TextReaderPanelProps {
  text: string;
  className?: string;
}

const TextReaderPanel = ({ text, className = "" }: TextReaderPanelProps) => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [selectedVoice, setSelectedVoice] = useState<string>('daniel');
  const [speed, setSpeed] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const selectedVoiceData = VOICE_OPTIONS.find(v => v.id === selectedVoice);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl && !audioUrl.startsWith('data:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Update audio playback rate when speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Reset audio when voice changes
  const handleVoiceChange = (newVoice: string) => {
    // Stop and reset current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Clear all audio state
    setIsPlaying(false);
    setAudioUrl(null);
    setAudioBase64(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsGenerated(false);
    
    // Set new voice
    setSelectedVoice(newVoice);
  };

  const generateAudio = async () => {
    if (!text.trim()) {
      toast({ title: "No text to read", description: "Please enter some text first", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setCurrentTime(0);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-tts', {
        body: { 
          text, 
          language: 'de',
          voiceId: selectedVoice
        }
      });

      if (error) throw error;

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Store base64 for download
      setAudioBase64(data.audioContent);

      // Create audio URL from base64
      const mimeType = data.mimeType || 'audio/wav';
      const newAudioUrl = `data:${mimeType};base64,${data.audioContent}`;
      
      // Cleanup old URL
      if (audioUrl && !audioUrl.startsWith('data:')) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(newAudioUrl);
      setIsGenerated(true);

      // Create and play audio
      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.playbackRate = speed;
        audioRef.current.volume = isMuted ? 0 : volume;
        await audioRef.current.play();
        setIsPlaying(true);
      }

      toast({ title: "Audio generated!", description: `Voice: ${selectedVoiceData?.name} (${selectedVoiceData?.dialect})` });
    } catch (error: any) {
      console.error('TTS Error:', error);
      toast({ 
        title: "Audio generation failed", 
        description: error.message || "Please try again", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) {
      generateAudio();
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      const progressPercent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progressPercent || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage * 100);
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
    }
  };

  const skipForward = () => {
    if (audioRef.current && duration) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
    }
  };

  const handleDownload = () => {
    if (!audioBase64) {
      toast({ title: "No audio to download", description: "Generate audio first", variant: "destructive" });
      return;
    }

    try {
      // Convert base64 to blob
      const byteCharacters = atob(audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `german-audio-${selectedVoice}-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "Audio downloaded!" });
    } catch (error) {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-muted/30">
        <div className="p-2.5 rounded-xl bg-primary/15">
          <Mic className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold">Text Reader</h3>
          <p className="text-xs text-muted-foreground">Listen with authentic German pronunciation</p>
        </div>
        {isGenerated && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
        )}
      </div>

      <div className="p-4 space-y-5">
        {/* Voice & Speed Controls */}
        <div className="grid grid-cols-2 gap-3">
          {/* Voice Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Voice</label>
            <Select value={selectedVoice} onValueChange={handleVoiceChange}>
              <SelectTrigger className="h-10 bg-background/60">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      selectedVoiceData?.gender === 'female' ? 'bg-pink-400' : 'bg-blue-400'
                    )} />
                    <span className="font-medium">{selectedVoiceData?.name}</span>
                    <span className="text-muted-foreground text-xs">· {selectedVoiceData?.dialect}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                <SelectGroup>
                  <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                    Hochdeutsch
                  </SelectLabel>
                  {VOICE_OPTIONS.filter(v => v.dialect === 'Hochdeutsch').map(voice => (
                    <SelectItem key={voice.id} value={voice.id} className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold",
                          voice.gender === 'female' ? 'bg-pink-500/15 text-pink-400' : 'bg-blue-500/15 text-blue-400'
                        )}>
                          {voice.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{voice.name}</div>
                          <div className="text-[10px] text-muted-foreground">{voice.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold mt-1">
                    Regional Accents
                  </SelectLabel>
                  {VOICE_OPTIONS.filter(v => v.dialect !== 'Hochdeutsch').map(voice => (
                    <SelectItem key={voice.id} value={voice.id} className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold",
                          voice.gender === 'female' ? 'bg-pink-500/15 text-pink-400' : 'bg-blue-500/15 text-blue-400'
                        )}>
                          {voice.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{voice.name} <span className="text-muted-foreground font-normal">· {voice.dialect}</span></div>
                          <div className="text-[10px] text-muted-foreground">{voice.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Speed Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Speed</label>
            <Select value={speed.toString()} onValueChange={(v) => setSpeed(parseFloat(v))}>
              <SelectTrigger className="h-10 bg-background/60">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-medium">{speed}× Speed</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SPEED_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    <span className={cn(opt.value === 1 && "font-medium")}>{opt.label}</span>
                    {opt.value === 1 && <span className="text-muted-foreground ml-2">Normal</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Audio Player */}
        <div className="rounded-xl bg-muted/40 border border-border/40 p-4 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div 
              className="relative h-2 bg-secondary rounded-full cursor-pointer overflow-hidden group"
              onClick={handleSeek}
            >
              <Progress 
                value={progress} 
                className="h-full transition-none [&>div]:transition-none"
              />
              {/* Hover indicator */}
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-2">
            {/* Skip Back */}
            <Button
              variant="ghost"
              size="icon"
              onClick={skipBackward}
              disabled={!isGenerated}
              className="h-9 w-9 rounded-full"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            {/* Restart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRestart}
              disabled={!isGenerated}
              className="h-9 w-9 rounded-full"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* Play/Pause - Main Button */}
            <Button
              onClick={togglePlayPause}
              disabled={isLoading || !text.trim()}
              size="icon"
              className={cn(
                "h-14 w-14 rounded-full shadow-lg transition-all",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                isLoading && "animate-pulse"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </Button>

            {/* Skip Forward */}
            <Button
              variant="ghost"
              size="icon"
              onClick={skipForward}
              disabled={!isGenerated}
              className="h-9 w-9 rounded-full"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            {/* Volume */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-9 w-9 rounded-full"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>

          {/* Generate hint */}
          {!isGenerated && !isLoading && (
            <p className="text-center text-xs text-muted-foreground">
              Press play to generate audio with <span className="font-medium text-foreground">{selectedVoiceData?.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </Card>
  );
};

export default TextReaderPanel;
