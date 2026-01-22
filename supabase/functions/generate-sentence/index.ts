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

    const { difficulty = 'B2', topic, grammarFocus } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const difficultyGuidelines = {
      'A2': 'Basic vocabulary and simple grammar. Use present and simple past tenses. Short sentences with straightforward structure.',
      'B1': 'Common vocabulary and standard grammar. Use present, past, and future tenses. Simple subordinate clauses allowed.',
      'B2': 'Advanced vocabulary and complex grammar. Use subordinate clauses, passive voice, and varied sentence structures.',
      'B2+': 'Highly sophisticated vocabulary and very complex grammar. Include Konjunktiv II, complex subordinate clauses, and idiomatic expressions.'
    };

    let prompt = `Generate a single German sentence at EXACTLY ${difficulty} level`;
    if (topic) prompt += ` about ${topic}`;
    if (grammarFocus) prompt += ` that demonstrates ${grammarFocus}`;
    
    prompt += `.

CRITICAL - ${difficulty} Level Requirements:
${difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines] || difficultyGuidelines.B2}

The sentence MUST match ${difficulty} complexity - not easier, not harder.

Provide:
1. The German sentence (matching ${difficulty} level)
2. English translation
3. Detailed grammatical analysis explaining cases, tenses, word order, and any special constructions

Format as JSON with keys: german, english, analysis`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a German language teacher helping ${difficulty} level students understand sentence structure and grammar. Create sentences that EXACTLY match ${difficulty} level complexity.`
          },
          {
            role: 'user',
            content: prompt
          }
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
      throw new Error('Could not parse sentence from AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-sentence:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});