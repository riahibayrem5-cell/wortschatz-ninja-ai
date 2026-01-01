import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice mapping for German and English
// Using Gemini TTS voices: https://ai.google.dev/gemini-api/docs/speech-generation
const VOICE_MAP: Record<string, Record<string, string>> = {
  de: {
    female: 'Kore',      // Clear, professional
    male: 'Charon',      // Informative, firm
    default: 'Kore'
  },
  en: {
    female: 'Zephyr',    // Bright
    male: 'Puck',        // Upbeat
    default: 'Zephyr'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language = 'de', voice = 'default' } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    // Get voice name based on language and preference
    const lang = language === 'de' || language === 'de-DE' ? 'de' : 'en';
    const voiceCategory = VOICE_MAP[lang] || VOICE_MAP.de;
    const voiceName = voiceCategory[voice] || voiceCategory.default;

    console.log(`Generating speech with Gemini TTS: lang=${lang}, voice=${voiceName}, textLength=${text.length}`);

    // Use Gemini's TTS model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName
                }
              }
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini TTS API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', code: 'RATE_LIMITED' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Gemini TTS API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract audio from response
    const audioData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    
    if (!audioData?.data) {
      console.error('No audio data in response:', JSON.stringify(data));
      throw new Error('No audio data returned from Gemini TTS');
    }

    console.log(`Speech generated successfully with Gemini TTS, mimeType: ${audioData.mimeType}`);

    return new Response(JSON.stringify({ 
      audioContent: audioData.data,
      mimeType: audioData.mimeType || 'audio/wav',
      voiceName,
      language: lang
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-tts:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
