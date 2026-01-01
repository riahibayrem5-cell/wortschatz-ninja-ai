import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Premium ElevenLabs voice mapping
// German voices: Lily (warm, natural), Daniel (clear, professional)
// English voices: Sarah (natural), Liam (friendly)
const VOICE_MAP: Record<string, Record<string, string>> = {
  de: {
    female: 'pFZP5JQG7iQjIQuC4Bku', // Lily - warm, natural German
    male: 'onwK4e9ZLuTAKqWW03F9', // Daniel - clear, professional
    default: 'pFZP5JQG7iQjIQuC4Bku'
  },
  en: {
    female: 'EXAVITQu4vr4xnSDxMaL', // Sarah - natural
    male: 'TX3LPaxmHKxFdv7VOQHJ', // Liam - friendly
    default: 'EXAVITQu4vr4xnSDxMaL'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language = 'de', voice = 'default', speed = 1.0 } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    // Get voice ID based on language and voice preference
    const lang = language === 'de' || language === 'de-DE' ? 'de' : 'en';
    const voiceCategory = VOICE_MAP[lang] || VOICE_MAP.de;
    const voiceId = voiceCategory[voice] || voiceCategory.default;

    console.log(`Generating speech: lang=${lang}, voice=${voice}, voiceId=${voiceId}, textLength=${text.length}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.4,
            use_speaker_boost: true,
            speed: Math.max(0.7, Math.min(1.2, speed))
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      // Return a specific error for quota/payment issues
      if (response.status === 402 || response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'API quota exceeded', code: 'QUOTA_EXCEEDED' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Convert array buffer to base64 safely without stack overflow
    const uint8Array = new Uint8Array(audioBuffer);
    let binaryString = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Audio = btoa(binaryString);

    console.log(`Speech generated successfully: ${base64Audio.length} bytes`);

    return new Response(JSON.stringify({ 
      audioContent: base64Audio,
      voiceId,
      language: lang
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
