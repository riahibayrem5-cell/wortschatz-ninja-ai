import { geminiFetch, geminiErrorResponse } from "../_shared/ai.ts";
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

    const { english, userGerman, expectedGerman } = await req.json();

    if (!english || !userGerman) {
      throw new Error('English and user German translation required');
    }

    const systemPrompt = `You are a German language teacher analyzing B2-C1 level translations. Compare the user's translation to the expected one and provide detailed feedback.`;

    const userPrompt = `English: ${english}
Expected German: ${expectedGerman}
User's German: ${userGerman}

Analyze the translation. Format as JSON with: isCorrect (boolean), correctedVersion, score (0-100), feedback, grammarNotes (array of specific grammar points)`;

    const response = await geminiFetch({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      throw new Error('Could not parse analysis from AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const providerResponse = geminiErrorResponse(error, corsHeaders);
    if (providerResponse) return providerResponse;
    console.error('Error in analyze-translation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});