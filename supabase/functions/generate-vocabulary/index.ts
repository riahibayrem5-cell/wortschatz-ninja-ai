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

    const { topic, count = 10, difficulty = 'B2' } = await req.json();

    if (!topic) {
      throw new Error('Topic is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const difficultyGuidelines = {
      'A2': 'Use only basic, everyday vocabulary that elementary learners know (common nouns, simple verbs, basic adjectives). Avoid complex or specialized words.',
      'B1': 'Use common vocabulary that intermediate learners would encounter (standard workplace words, common idioms, familiar topics). Avoid highly specialized or literary terms.',
      'B2': 'Use advanced vocabulary including less common words, professional terminology, and sophisticated expressions appropriate for upper-intermediate learners.',
      'B2+': 'Use highly sophisticated vocabulary including academic terms, idiomatic expressions, literary language, and specialized professional vocabulary for advanced learners.'
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a German language teacher helping ${difficulty} level students learn vocabulary.

CRITICAL - ${difficulty} Level Guidelines:
${difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines] || difficultyGuidelines.B2}

Generate ${count} German words that are STRICTLY appropriate for ${difficulty} level. For each word, provide:
1. The word (with article for nouns: der/die/das)
2. English definition
3. A natural German example sentence using the word (complexity matching ${difficulty} level)

Format your response as a JSON array of objects with these exact keys: word, definition, example`
          },
          {
            role: 'user',
            content: `Generate ${count} ${difficulty} level German vocabulary words related to: ${topic}. Remember: words must match ${difficulty} complexity exactly.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse vocabulary list from AI response');
    }
    
    const vocabularyList = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ vocabularyList }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-vocabulary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});