import { geminiFetch, geminiErrorResponse } from "../_shared/ai.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const { transcribedText, expectedText, language = 'de' } = await req.json();

    const prompt = `You are a ${language === 'de' ? 'German' : 'English'} pronunciation expert. Compare the student's pronunciation with the expected text.

Expected: "${expectedText}"
Student said: "${transcribedText}"

Provide a JSON response with:
{
  "score": <0-100>,
  "accuracy": "<excellent|good|fair|needs_improvement>",
  "feedback": "<specific feedback on pronunciation>",
  "mistakes": [
    {"word": "<word>", "issue": "<pronunciation issue>", "suggestion": "<how to improve>"}
  ],
  "strengths": ["<what they did well>"]
}`;

    const response = await geminiFetch({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a pronunciation analysis expert. Always respond with valid JSON only, no markdown.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', code: 'RATE_LIMITED' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.', code: 'PAYMENT_REQUIRED' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;
    
    // Parse JSON from response (handle potential markdown code fences)
    const jsonMatch = analysisText?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse analysis from AI response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const providerResponse = geminiErrorResponse(error, corsHeaders);
    if (providerResponse) return providerResponse;
    console.error('Error in analyze-pronunciation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
