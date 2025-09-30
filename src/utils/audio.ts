import { supabase } from "@/integrations/supabase/client";

let currentAudio: HTMLAudioElement | null = null;

// High-quality text-to-speech using ElevenLabs
export const speakText = async (text: string, lang: 'de-DE' | 'en-US' = 'de-DE') => {
  try {
    // Stop any currently playing audio
    stopSpeaking();

    const language = lang === 'de-DE' ? 'de' : 'en';
    
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { text, language }
    });

    if (error) throw error;
    if (!data?.audioContent) throw new Error('No audio content received');

    // Create audio element and play
    currentAudio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
    await currentAudio.play();
    
    // Clean up when finished
    currentAudio.onended = () => {
      currentAudio = null;
    };
  } catch (error) {
    console.error('Error speaking text:', error);
    throw error;
  }
};

export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};