import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, difficulty = 'B2', count = 10 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const difficultyGuidelines = {
      'A2': 'Use basic vocabulary and simple grammatical structures. Present tense and simple past only. Short, everyday sentences with common words.',
      'B1': 'Use common vocabulary and standard grammatical structures. Include present, past, and future tenses. Moderately complex sentences.',
      'B2': 'Use advanced vocabulary and complex grammatical structures. Include subjunctive, passive voice, and subordinate clauses. Sophisticated sentences.',
      'B2+': 'Use highly sophisticated vocabulary and very complex grammatical structures. Include advanced subjunctive, Konjunktiv II, complex subordinate clauses, and idiomatic expressions.'
    };

    const systemPrompt = `You are a German language teacher creating ${difficulty} level gap-fill exercises.

IMPORTANT - ${difficulty} Level Guidelines:
${difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines] || difficultyGuidelines.B2}

Create ${count} gap-fill sentences where students must fill in the missing word. Focus on:
- Articles (der/die/das)
- Prepositions
- Verb conjugations
- Adjective endings
- Common grammatical structures at ${difficulty} level

Each gap should test a specific grammatical concept at ${difficulty} level ONLY.`;

    const userPrompt = `Create ${count} ${difficulty} level German gap-fill exercises${topic ? ` about ${topic}` : ''}. 

Format as JSON with:
- sentences: array of objects with { sentence: "text with ___ for gap", answer: "correct word", explanation: "why this is correct", grammarPoint: "what grammar rule this tests" }

Make sure sentences strictly match ${difficulty} level complexity.`;

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
      throw new Error('Could not parse gap-fill from AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-gap-fill:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
