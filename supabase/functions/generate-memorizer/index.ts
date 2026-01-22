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

    const { theme, difficulty = 'B2' } = await req.json();

    if (!theme) {
      throw new Error('Theme is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const difficultyGuidelines = {
      'A2': 'Use simple, everyday vocabulary and basic sentence structures. Present and simple past tenses only. Short sentences with clear, straightforward meaning.',
      'B1': 'Use common vocabulary and standard grammar. Mix of simple and compound sentences. Present, past, and future tenses with some subordinate clauses.',
      'B2': 'Use sophisticated vocabulary and complex grammatical structures. Include subordinate clauses, passive voice, and varied sentence structures.',
      'B2+': 'Use highly advanced vocabulary and very complex grammar. Include Konjunktiv II, complex subordinate clauses, sophisticated conjunctions, and idiomatic expressions.'
    };

    const systemPrompt = `You are a German language teacher creating memorization exercises for ${difficulty} level learners.

CRITICAL - ${difficulty} Level Requirements:
${difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines] || difficultyGuidelines.B2}

Create information-dense paragraphs (4-6 sentences) that STRICTLY match ${difficulty} level complexity. The vocabulary, grammar, and sentence structures must be appropriate for ${difficulty} level ONLY.`;

    const userPrompt = `Create a German paragraph about: ${theme}. The paragraph MUST use ${difficulty}-appropriate vocabulary and grammar structures ONLY. Make it memorable and engaging for ${difficulty} level learners. Format as JSON with: germanText, englishTranslation, keyVocabulary (array of important words with definitions)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse paragraph from AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-memorizer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});