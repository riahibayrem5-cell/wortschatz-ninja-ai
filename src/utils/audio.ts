import { supabase } from "@/integrations/supabase/client";

let currentAudio: HTMLAudioElement | null = null;

// High-quality text-to-speech with ElevenLabs fallback to browser TTS
export const speakText = async (text: string, lang: 'de-DE' | 'en-US' = 'de-DE') => {
  try {
    // Stop any currently playing audio
    stopSpeaking();

    const language = lang === 'de-DE' ? 'de' : 'en';
    
    // Try ElevenLabs first
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { text, language }
    });

    // If ElevenLabs fails (402 payment required or other error), fallback to browser TTS
    if (error) {
      console.log('ElevenLabs unavailable, falling back to browser TTS:', error.message);
      return useBrowserTTS(text, lang);
    }

    if (!data?.audioContent) {
      console.log('No audio content, falling back to browser TTS');
      return useBrowserTTS(text, lang);
    }

    // Create audio element and play
    currentAudio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
    await currentAudio.play();
    
    // Clean up when finished
    currentAudio.onended = () => {
      currentAudio = null;
    };
  } catch (error) {
    console.error('Error with TTS, falling back to browser:', error);
    return useBrowserTTS(text, lang);
  }
};

// Fallback to browser's Web Speech API
const useBrowserTTS = (text: string, lang: 'de-DE' | 'en-US' = 'de-DE') => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  
  return new Promise<void>((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
  });
};

export const pauseSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
  } else {
    window.speechSynthesis.pause();
  }
};

export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  window.speechSynthesis.cancel();
};