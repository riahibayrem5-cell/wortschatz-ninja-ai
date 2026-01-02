import { supabase } from "@/integrations/supabase/client";
import { getCachedAudio, cacheAudio } from "./advancedCache";

let currentAudio: HTMLAudioElement | null = null;
let audioQueue: string[] = [];
let isPlayingQueue = false;

export interface SpeakOptions {
  voice?: 'default' | 'female' | 'male';
  speed?: number;
  useCache?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onCacheHit?: () => void;
}

// High-quality text-to-speech with Gemini TTS + caching
export const speakText = async (
  text: string, 
  lang: 'de-DE' | 'en-US' = 'de-DE',
  options: SpeakOptions = {}
): Promise<void> => {
  const { 
    voice = 'default', 
    speed = 1.0, 
    useCache = true,
    onStart, 
    onEnd, 
    onError,
    onCacheHit
  } = options;
  
  try {
    // Stop any currently playing audio
    stopSpeaking();

    const language = lang === 'de-DE' ? 'de' : 'en';
    let audioContent: string | null = null;
    let mimeType: string = 'audio/mpeg';

    // Try cache first if enabled
    if (useCache) {
      audioContent = await getCachedAudio(text, language, voice);
      if (audioContent) {
        onCacheHit?.();
        // Heuristic: WAV starts with "RIFF" => base64 starts with "UklGR"
        mimeType = audioContent.startsWith('UklGR') ? 'audio/wav' : 'audio/mpeg';
        console.log('Using cached audio');
      }
    }

    // If not in cache, fetch from Gemini TTS API
    if (!audioContent) {
      const { data, error } = await supabase.functions.invoke('gemini-tts', {
        body: { text, language, voice }
      });

      if (error) {
        console.log('Gemini TTS unavailable, falling back to browser TTS:', error.message);
        return useBrowserTTS(text, lang, options);
      }

      if (!data?.audioContent) {
        console.log('No audio content, falling back to browser TTS');
        return useBrowserTTS(text, lang, options);
      }

      audioContent = data.audioContent;
      mimeType = data.mimeType || 'audio/wav';

      // Cache the audio for future use
      if (useCache) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          cacheAudio(text, language, voice, audioContent, user.id).then(() => {
            console.log('Audio cached successfully');
          }).catch(err => {
            console.log('Audio caching failed:', err);
          });
        }
      }
    }

    // Create audio element and play with data URI
    currentAudio = new Audio(`data:${mimeType};base64,${audioContent}`);
    currentAudio.playbackRate = Math.max(0.5, Math.min(2.0, speed));
    
    onStart?.();
    
    return new Promise<void>((resolve, reject) => {
      if (!currentAudio) {
        reject(new Error('Audio not initialized'));
        return;
      }
      
      currentAudio.onended = () => {
        currentAudio = null;
        onEnd?.();
        resolve();
      };
      
      currentAudio.onerror = (e) => {
        const error = new Error('Audio playback failed');
        currentAudio = null;
        onError?.(error);
        reject(error);
      };
      
      currentAudio.play().catch((err) => {
        console.error('Error playing audio:', err);
        onError?.(err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error with TTS, falling back to browser:', error);
    return useBrowserTTS(text, lang, options);
  }
};

// Speak multiple texts in sequence (useful for vocabulary lists, etc.)
export const speakTextQueue = async (
  texts: string[],
  lang: 'de-DE' | 'en-US' = 'de-DE',
  options: SpeakOptions = {}
): Promise<void> => {
  if (isPlayingQueue) {
    stopSpeaking();
  }
  
  audioQueue = [...texts];
  isPlayingQueue = true;
  
  for (const text of audioQueue) {
    if (!isPlayingQueue) break;
    await speakText(text, lang, options);
    // Small pause between items
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  isPlayingQueue = false;
  audioQueue = [];
};

// Fallback to browser's Web Speech API
const useBrowserTTS = (
  text: string, 
  lang: 'de-DE' | 'en-US' = 'de-DE',
  options: SpeakOptions = {}
): Promise<void> => {
  const { onStart, onEnd, onError } = options;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.cancel();
  
  return new Promise<void>((resolve) => {
    utterance.onstart = () => onStart?.();
    utterance.onend = () => {
      onEnd?.();
      resolve();
    };
    utterance.onerror = (e) => {
      onError?.(new Error(e.error));
      resolve();
    };
    
    window.speechSynthesis.speak(utterance);
  });
};

export const pauseSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
  } else {
    window.speechSynthesis.pause();
  }
};

export const resumeSpeaking = () => {
  if (currentAudio) {
    currentAudio.play();
  } else {
    window.speechSynthesis.resume();
  }
};

export const stopSpeaking = () => {
  isPlayingQueue = false;
  audioQueue = [];
  
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  window.speechSynthesis.cancel();
};

export const isSpeaking = (): boolean => {
  return currentAudio !== null || window.speechSynthesis.speaking;
};