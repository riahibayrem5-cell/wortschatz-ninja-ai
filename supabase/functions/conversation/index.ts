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
    const { action, scenario, message, conversationHistory } = await req.json();

    if (!action || !['start', 'continue'].includes(action)) {
      throw new Error('Valid action (start or continue) is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let messages = [];

    if (action === 'start') {
      const systemPrompt = `You are a native German speaker having a natural conversation. Adapt your language to B2-C1 level. Stay in character for the scenario: ${scenario}. Be conversational, natural, and encourage the learner.`;
      
      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Start the conversation with a natural German greeting appropriate for this scenario.' }
      ];
    } else {
      // Continue conversation
      const systemPrompt = `You are a native German speaker. Continue the conversation naturally at B2-C1 level. Scenario: ${scenario}. Be encouraging and correct major errors naturally in your response.`;
      
      messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ];
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

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