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
    const { action, scenario, message, conversationHistory, difficulty = 'B2' } = await req.json();

    if (!action || !['start', 'continue'].includes(action)) {
      throw new Error('Valid action (start or continue) is required');
    }

    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured');
    }

    const difficultyGuidelines = {
      'A2': 'Use simple, everyday German vocabulary and basic sentence structures. Speak slowly and clearly. Use present and simple past tenses only. Ask simple questions and give simple responses.',
      'B1': 'Use common German vocabulary and standard grammar. Speak at a moderate pace. Use present, past, and future tenses. Include some subordinate clauses but keep sentences relatively simple.',
      'B2': 'Use advanced German vocabulary and complex grammatical structures. Speak at a natural pace. Include subordinate clauses, passive voice, and varied expressions. Challenge the learner appropriately.',
      'B2+': 'Use sophisticated German vocabulary, idiomatic expressions, and very complex grammar. Speak at native speed. Include Konjunktiv II, complex subordinate clauses, and nuanced expressions typical of educated native speakers.'
    };

    let messages = [];

    if (action === 'start') {
      const systemPrompt = `You are a native German speaker having a natural conversation at EXACTLY ${difficulty} level.

CRITICAL - ${difficulty} Level Requirements:
${difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines] || difficultyGuidelines.B2}

Scenario: ${scenario}

Stay in character for this scenario. Be conversational, natural, and encouraging. Adapt ALL your language (vocabulary, grammar, sentence complexity) to strictly match ${difficulty} level.`;
      
      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Start the conversation with a natural German greeting appropriate for this scenario at ${difficulty} level.` }
      ];
    } else {
      // Continue conversation
      const systemPrompt = `You are a native German speaker continuing a conversation at EXACTLY ${difficulty} level.

CRITICAL - ${difficulty} Level Requirements:
${difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines] || difficultyGuidelines.B2}

Scenario: ${scenario}

Continue naturally. Correct major errors naturally in your response. Match your language complexity to ${difficulty} level ONLY.`;
      
      messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ];
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages.map(msg => ({
            role: msg.role === 'system' ? 'user' : msg.role,
            parts: [{ text: msg.content }]
          })),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.', code: 'RATE_LIMITED' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in conversation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});