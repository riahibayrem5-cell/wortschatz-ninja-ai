import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, difficulty = 'B2', autoStore = false } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    let user = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert German language teacher analyzing student text at ${difficulty} level. 

Analyze the text and identify ALL mistakes including:
- Grammar errors (articles, cases, verb conjugation, word order)
- Spelling mistakes
- Vocabulary misuse
- Sentence structure issues
- Missing or incorrect punctuation

For each mistake, provide:
1. The incorrect text segment
2. The correction
3. The category (grammar/spelling/vocabulary/syntax/punctuation)
4. A clear explanation

Return JSON with this structure:
{
  "mistakes": [
    {
      "error": "incorrect text",
      "correction": "corrected text",
      "explanation": "detailed explanation",
      "category": "grammar"
    }
  ],
  "alternatives": ["alternative sentence 1", "alternative sentence 2"],
  "overallAssessment": "brief overall feedback",
  "hasErrors": true/false
}`;

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
          { role: 'user', content: `Analyze this German text for mistakes:\n\n${text}` }
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
      throw new Error('Could not parse analysis from AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    // Auto-store mistakes if requested and user is authenticated
    if (autoStore && user && result.mistakes && result.mistakes.length > 0) {
      const mistakesToInsert = result.mistakes.map((m: any) => ({
        user_id: user.id,
        type: m.category || 'grammar',
        content: m.error,
        correction: m.correction,
        explanation: m.explanation,
        category: m.category || 'grammar',
        source: 'auto-detected',
        resolved: false
      }));

      const { error: insertError } = await supabaseClient
        .from('mistakes')
        .insert(mistakesToInsert);

      if (insertError) {
        console.error('Error inserting mistakes:', insertError);
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-mistakes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
