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
    const { type, topic, difficulty = 'B2' } = await req.json();

    if (!type || !['quiz', 'translation'].includes(type)) {
      throw new Error('Valid type (quiz or translation) is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'quiz') {
      systemPrompt = `You are a German language teacher creating B2-C1 level multiple choice quizzes. Create a quiz question with 4 options.`;
      userPrompt = `Create a ${difficulty} level German quiz question${topic ? ` about ${topic}` : ''}. Format as JSON with: question, options (array of 4 strings), correctAnswer (the correct option string), explanation`;
    } else {
      systemPrompt = `You are a German language teacher creating B2-C1 level translation exercises. Create nuanced English sentences for translation.`;
      userPrompt = `Create a ${difficulty} level English sentence${topic ? ` about ${topic}` : ''} for translation to German. Format as JSON with: english, expectedGerman, notes (hints about grammar/vocabulary to use)`;
    }

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
      throw new Error('Could not parse exercise from AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ ...result, type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-exercise:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});