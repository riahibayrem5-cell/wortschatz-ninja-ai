import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  User,
  Mic
} from "lucide-react";

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

const DIALECT_GROUPS = [
  { label: 'Hochdeutsch', dialects: ['Hochdeutsch'] },
  { label: 'Bayerisch', dialects: ['Bayerisch'] },
  { label: 'Österreichisch', dialects: ['Österreichisch'] },
  { label: 'Schweizerdeutsch', dialects: ['Schweizerdeutsch'] },
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

  const selectedVoiceData = VOICE_OPTIONS.find(v => v.id === selectedVoice);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
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

      // Create and play audio
      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.playbackRate = speed;
        audioRef.current.volume = isMuted ? 0 : volume;
        await audioRef.current.play();
        setIsPlaying(true);
      }

      toast({ title: "Audio generated!", description: `Voice: ${selectedVoiceData?.name}` });
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

  const handleSeek = (value: number[]) => {
    if (audioRef.current && duration) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(value[0]);
    }
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
    <Card className={`p-6 glass ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Mic className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Text Reader</h3>
            <p className="text-sm text-muted-foreground">Listen with perfect German pronunciation</p>
          </div>
        </div>

        {/* Voice Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Voice & Dialect</label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="w-full bg-background/50">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{selectedVoiceData?.name}</span>
                  <span className="text-muted-foreground text-xs">({selectedVoiceData?.dialect})</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {DIALECT_GROUPS.map(group => {
                const voices = VOICE_OPTIONS.filter(v => group.dialects.includes(v.dialect));
                if (voices.length === 0) return null;
                return (
                  <SelectGroup key={group.label}>
                    <SelectLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </SelectLabel>
                    {voices.map(voice => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex items-center gap-3 py-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            voice.gender === 'female' ? 'bg-pink-500/20' : 'bg-blue-500/20'
                          }`}>
                            <User className={`w-4 h-4 ${
                              voice.gender === 'female' ? 'text-pink-400' : 'text-blue-400'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {voice.name}
                              <span className="text-xs text-muted-foreground">
                                ({voice.gender === 'male' ? 'Male' : 'Female'})
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">{voice.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Speed</label>
            <span className="text-sm text-primary font-mono">{speed.toFixed(1)}x</span>
          </div>
          <Slider
            value={[speed * 100]}
            onValueChange={(v) => setSpeed(v[0] / 100)}
            min={50}
            max={150}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>1.5x</span>
          </div>
        </div>

        {/* Audio Player */}
        <div className="space-y-4 p-4 rounded-xl bg-background/30 border border-border/50">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              disabled={!audioUrl}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Left: Volume */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider
                value={[volume * 100]}
                onValueChange={(v) => setVolume(v[0] / 100)}
                max={100}
                className="w-20"
              />
            </div>

            {/* Center: Play Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRestart}
                disabled={!audioUrl}
                className="h-10 w-10"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                onClick={togglePlayPause}
                disabled={isLoading || !text.trim()}
                size="icon"
                className="h-14 w-14 rounded-full gradient-primary hover:opacity-90"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                disabled={!audioBase64}
                className="h-10 w-10"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Right: Empty for balance */}
            <div className="w-28" />
          </div>
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={!audioBase64}
          variant="outline"
          className="w-full glass gap-2"
        >
          <Download className="w-4 h-4" />
          Download Audio (WAV)
        </Button>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      </div>
    </Card>
  );
};

export default TextReaderPanel;
