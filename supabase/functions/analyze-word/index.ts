import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { word, targetLanguage = 'en' } = await req.json();

    if (!word) {
      throw new Error('Word is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Analyze the German word "${word}" and provide a comprehensive dossier in JSON format with the following structure:
{
  "word": "${word}",
  "article": "der/die/das (if noun, otherwise null)",
  "definition": "detailed definition in German",
  "translation": "translation to ${targetLanguage === 'ar' ? 'Arabic' : targetLanguage === 'de' ? 'German' : 'English'}",
  "wordFamily": [
    {"word": "related word", "type": "noun/verb/adjective/adverb", "meaning": "meaning"}
  ],
  "prefixVerbs": [
    {"verb": "prefix verb", "separable": true/false, "meaning": "meaning", "example": "example sentence"}
  ],
  "synonyms": ["synonym1", "synonym2"],
  "antonyms": ["antonym1", "antonym2"],
  "examples": [
    {"german": "example sentence", "translation": "translation in ${targetLanguage === 'ar' ? 'Arabic' : targetLanguage === 'de' ? 'German' : 'English'}"}
  ]
}

Provide at least 3-5 items for each array. Make the analysis comprehensive and educational.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a German language expert. Always respond with valid JSON only, no additional text.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in analyze-word:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
