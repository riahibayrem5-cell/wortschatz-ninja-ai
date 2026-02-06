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

    const { type, topic, difficulty = 'B2' } = await req.json();

    if (!type || !['quiz', 'translation'].includes(type)) {
      throw new Error('Valid type (quiz or translation) is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const difficultyGuidelines = {
      'A2': 'Use basic vocabulary and simple grammatical structures. Present tense and simple past only. Short, everyday sentences.',
      'B1': 'Use common vocabulary and standard grammatical structures. Include present, past, and future tenses. Moderately complex sentences.',
      'B2': 'Use advanced vocabulary and complex grammatical structures. Include subjunctive, passive voice, and subordinate clauses. Sophisticated sentences.',
      'B2+': 'Use highly sophisticated vocabulary and very complex grammatical structures. Include advanced subjunctive, Konjunktiv II, complex subordinate clauses, and idiomatic expressions.'
    };

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'quiz') {
      systemPrompt = `You are a German language teacher creating ${difficulty} level multiple choice quizzes. 

IMPORTANT - ${difficulty} Level Guidelines:
${difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines] || difficultyGuidelines.B2}

Create a quiz question with 4 options that strictly matches the ${difficulty} level complexity.`;
      
      userPrompt = `Create a ${difficulty} level German quiz question${topic ? ` about ${topic}` : ''}. The question MUST use vocabulary and grammar appropriate for ${difficulty} level ONLY. Format as JSON with: question, options (array of 4 strings), correctAnswer (the correct option string), explanation`;
    } else {
      systemPrompt = `You are a German language teacher creating ${difficulty} level translation exercises.

IMPORTANT - ${difficulty} Level Guidelines:
${difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines] || difficultyGuidelines.B2}

Create translation exercises that strictly match the ${difficulty} level complexity.`;
      
      userPrompt = `Create a ${difficulty} level English sentence${topic ? ` about ${topic}` : ''} for translation to German. The sentence MUST require ${difficulty}-appropriate vocabulary and grammar ONLY. Format as JSON with: english, expectedGerman, notes (hints about grammar/vocabulary to use at ${difficulty} level)`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
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