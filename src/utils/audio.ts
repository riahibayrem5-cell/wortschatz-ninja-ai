import { supabase } from "@/integrations/supabase/client";

let currentAudio: HTMLAudioElement | null = null;

// High-quality text-to-speech with ElevenLabs fallback to Gemini
export const speakText = async (text: string, lang: 'de-DE' | 'en-US' = 'de-DE') => {
  try {
    // Stop any currently playing audio
    stopSpeaking();

    const language = lang === 'de-DE' ? 'de' : 'en';
    
    // Try ElevenLabs first
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { text, language }
    });

    // If ElevenLabs fails (402 payment required), fallback to Gemini TTS
    if (error?.message?.includes('402') || error?.message?.includes('credit')) {
      console.log('ElevenLabs credits exhausted, falling back to Gemini TTS');
      const fallbackResponse = await supabase.functions.invoke('text-to-speech-gemini', {
        body: { text, language }
      });
      
      if (fallbackResponse.error) throw fallbackResponse.error;
      if (!fallbackResponse.data?.audioContent) throw new Error('No audio content received from Gemini');
      
      currentAudio = new Audio(`data:audio/mpeg;base64,${fallbackResponse.data.audioContent}`);
      await currentAudio.play();
      
      currentAudio.onended = () => {
        currentAudio = null;
      };
      return;
    }

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

export const pauseSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
  }
};

export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};