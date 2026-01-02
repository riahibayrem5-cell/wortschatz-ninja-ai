import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice mapping for German and English
const VOICE_MAP: Record<string, Record<string, string>> = {
  de: {
    female: 'Kore',
    male: 'Charon',
    default: 'Kore'
  },
  en: {
    female: 'Zephyr',
    male: 'Puck',
    default: 'Zephyr'
  }
};

// Convert PCM to WAV format
function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): Uint8Array {
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcmData.length;
  const headerSize = 44;
  const wavBuffer = new Uint8Array(headerSize + dataSize);
  const view = new DataView(wavBuffer.buffer);

  // RIFF header
  wavBuffer.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
  view.setUint32(4, 36 + dataSize, true); // file size - 8
  wavBuffer.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"

  // fmt subchunk
  wavBuffer.set([0x66, 0x6d, 0x74, 0x20], 12); // "fmt "
  view.setUint32(16, 16, true); // subchunk size
  view.setUint16(20, 1, true); // audio format (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data subchunk
  wavBuffer.set([0x64, 0x61, 0x74, 0x61], 36); // "data"
  view.setUint32(40, dataSize, true);
  wavBuffer.set(pcmData, 44);

  return wavBuffer;
}

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

    const lang = language === 'de' || language === 'de-DE' ? 'de' : 'en';
    const voiceCategory = VOICE_MAP[lang] || VOICE_MAP.de;
    const voiceName = voiceCategory[voice] || voiceCategory.default;

    console.log(`Generating speech with Gemini TTS: lang=${lang}, voice=${voiceName}, textLength=${text.length}`);

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
    const audioData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    
    if (!audioData?.data) {
      console.error('No audio data in response:', JSON.stringify(data));
      throw new Error('No audio data returned from Gemini TTS');
    }

    // Decode the base64 PCM audio
    const pcmBytes = Uint8Array.from(atob(audioData.data), c => c.charCodeAt(0));
    
    // Convert PCM to WAV (Gemini returns 24kHz 16-bit mono PCM)
    const wavBytes = pcmToWav(pcmBytes, 24000, 1, 16);
    
    // Encode WAV as base64
    const wavBase64 = btoa(String.fromCharCode(...wavBytes));

    console.log(`Speech generated successfully with Gemini TTS, converted to WAV`);

    return new Response(JSON.stringify({ 
      audioContent: wavBase64,
      mimeType: 'audio/wav',
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