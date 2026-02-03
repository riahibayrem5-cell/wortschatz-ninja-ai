import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extended voice mapping for German dialects and styles
// Valid Gemini TTS voices: achernar, achird, algenib, algieba, alnilam, aoede, autonoe, 
// callirrhoe, charon, despina, enceladus, erinome, fenrir, gacrux, iapetus, kore, 
// laomedeia, leda, orus, puck, pulcherrima, rasalgethi, sadachbia, sadaltager, 
// schedar, sulafat, umbriel, vindemiatrix, zephyr, zubenelgenubi
const VOICE_OPTIONS = {
  // Hochdeutsch (Standard German)
  'daniel': { voiceName: 'Charon', dialect: 'Hochdeutsch', gender: 'male', description: 'Clear, professional' },
  'lily': { voiceName: 'Kore', dialect: 'Hochdeutsch', gender: 'female', description: 'Warm, friendly' },
  'matilda': { voiceName: 'Aoede', dialect: 'Hochdeutsch', gender: 'female', description: 'Educational tone' },
  'callum': { voiceName: 'Fenrir', dialect: 'Hochdeutsch', gender: 'male', description: 'Deep, authoritative' },
  // Regional variants (using different voice characteristics)
  'liam': { voiceName: 'Puck', dialect: 'Bayerisch', gender: 'male', description: 'Southern German' },
  'chris': { voiceName: 'Enceladus', dialect: 'Österreichisch', gender: 'male', description: 'Austrian German' },
  'anna': { voiceName: 'Laomedeia', dialect: 'Schweizerdeutsch', gender: 'female', description: 'Swiss German' },
  // English voices
  'sarah': { voiceName: 'Zephyr', dialect: 'English', gender: 'female', description: 'Natural American' },
  'james': { voiceName: 'Gacrux', dialect: 'English', gender: 'male', description: 'Clear British' },
  // Default fallbacks
  'default_de': { voiceName: 'Kore', dialect: 'Hochdeutsch', gender: 'female', description: 'Default German' },
  'default_en': { voiceName: 'Zephyr', dialect: 'English', gender: 'female', description: 'Default English' },
};

// Legacy voice mapping for backward compatibility
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
    // Validate authentication
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) {
      return unauthorizedResponse(authError || "Authentication required", corsHeaders);
    }

    const { text, language = 'de', voice = 'default', voiceId } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    let voiceName: string;
    
    // Check if a specific voiceId is provided (new extended system)
    if (voiceId && VOICE_OPTIONS[voiceId as keyof typeof VOICE_OPTIONS]) {
      voiceName = VOICE_OPTIONS[voiceId as keyof typeof VOICE_OPTIONS].voiceName;
    } else {
      // Fallback to legacy voice mapping
      const lang = language === 'de' || language === 'de-DE' ? 'de' : 'en';
      const voiceCategory = VOICE_MAP[lang] || VOICE_MAP.de;
      voiceName = voiceCategory[voice] || voiceCategory.default;
    }

    console.log(`Generating speech with Gemini TTS: voiceId=${voiceId}, voiceName=${voiceName}, textLength=${text.length}`);

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
    
    // Encode WAV as base64 safely without stack overflow
    const uint8Array = wavBytes;
    let binaryString = '';
    const chunkSize = 8192;

    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }

    const wavBase64 = btoa(binaryString);

    console.log(`Speech generated successfully with Gemini TTS, converted to WAV`);

    return new Response(JSON.stringify({ 
      audioContent: wavBase64,
      mimeType: 'audio/wav',
      voiceName,
      voiceId: voiceId || voice,
      language: language
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
