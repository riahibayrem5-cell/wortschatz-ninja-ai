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

    const { text, difficulty = 'B2' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const difficultyGuidelines = {
      'A2': 'Identify only basic elementary-level vocabulary (everyday objects, simple verbs, basic adjectives). These are foundational words for beginners.',
      'B1': 'Identify intermediate-level vocabulary (common workplace terms, standard expressions, familiar topics). Skip basic A1-A2 words.',
      'B2': 'Identify advanced vocabulary (sophisticated terms, professional language, complex expressions). Skip basic and intermediate words.',
      'B2+': 'Identify highly sophisticated vocabulary (academic terms, idiomatic expressions, literary language, specialized terminology). Only the most advanced words.'
    };

    const systemPrompt = `You are a German language expert analyzing text for ${difficulty} level learners.

CRITICAL - ${difficulty} Level Guidelines:
${difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines] || difficultyGuidelines.B2}

Analyze the text and identify vocabulary words that match ${difficulty} level specifically. For each word, provide its English definition.`;

    const userPrompt = `Analyze this German text and identify ${difficulty} level vocabulary words:\n\n${text}\n\nFormat as JSON with: highlightedWords (array with: word, definition, level). Only include words appropriate for ${difficulty} level learners.`;

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
      throw new Error('Could not parse highlights from AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in highlight-text:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});