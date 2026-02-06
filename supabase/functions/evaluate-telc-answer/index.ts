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

    const { section, task, userAnswer, teil, maxPoints } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let prompt = '';

    if (section === 'writing') {
      prompt = `You are a TELC Deutsch B2 examiner evaluating a German writing task.\n\nTask:\n${task}\n\nStudent's answer:\n${userAnswer}\n\nEvaluate according to TELC B2 criteria. Provide VALID JSON only (no markdown).\n\nReturn JSON exactly in this schema:\n{\n  \"maxPoints\": 45,\n  \"score\": <0-45>,\n  \"percentage\": <0-100>,\n  \"grade\": \"<Sehr gut|Gut|Befriedigend|Ausreichend|Mangelhaft>\",\n  \"taskCompletion\": {\n    \"score\": <0-15>,\n    \"feedback\": \"<detailed feedback in German>\"\n  },\n  \"coherence\": {\n    \"score\": <0-10>,\n    \"feedback\": \"<feedback on structure and organization>\"\n  },\n  \"vocabulary\": {\n    \"score\": <0-10>,\n    \"feedback\": \"<feedback on word choice and range>\"\n  },\n  \"grammar\": {\n    \"score\": <0-10>,\n    \"feedback\": \"<feedback on accuracy and complexity>\"\n  },\n  \"strengths\": [\"<strength 1>\", \"<strength 2>\"],\n  \"improvements\": [\"<improvement 1>\", \"<improvement 2>\"],\n  \"correctedVersion\": \"<improved version with corrections>\",\n  \"detailedErrors\": [\n    {\"type\": \"<error type>\", \"original\": \"<text>\", \"correction\": \"<fix>\", \"explanation\": \"<why>\"}\n  ]\n}`;
    } else if (section === 'speaking') {
      const mp = typeof maxPoints === 'number' && maxPoints > 0 ? maxPoints : 75;
      const perCat = Math.round((mp / 5) * 10) / 10;

      prompt = `You are a TELC Deutsch B2 examiner evaluating a German speaking performance.\n\nTeil: ${teil ?? 'full'}\nTask:\n${task}\n\nTranscript (or notes if transcript is not available):\n${userAnswer}\n\nEvaluate according to TELC B2 criteria. Provide VALID JSON only (no markdown).\n\nReturn JSON exactly in this schema:\n{\n  \"maxPoints\": ${mp},\n  \"score\": <0-${mp}>,\n  \"percentage\": <0-100>,\n  \"grade\": \"<Sehr gut|Gut|Befriedigend|Ausreichend|Mangelhaft>\",\n  \"fluency\": {\n    \"score\": <0-${perCat}>,\n    \"feedback\": \"<feedback on flow and hesitations>\"\n  },\n  \"vocabulary\": {\n    \"score\": <0-${perCat}>,\n    \"feedback\": \"<feedback on range and appropriacy>\"\n  },\n  \"grammar\": {\n    \"score\": <0-${perCat}>,\n    \"feedback\": \"<feedback on accuracy and variety>\"\n  },\n  \"pronunciation\": {\n    \"score\": <0-${perCat}>,\n    \"feedback\": \"<feedback on clarity and accent>\"\n  },\n  \"taskCompletion\": {\n    \"score\": <0-${perCat}>,\n    \"feedback\": \"<feedback on addressing the task>\"\n  },\n  \"strengths\": [\"<strength 1>\", \"<strength 2>\"],\n  \"improvements\": [\"<improvement 1>\", \"<improvement 2>\"],\n  \"keyErrorsAndCorrections\": [\n    {\"error\": \"<text>\", \"correction\": \"<fix>\", \"explanation\": \"<why>\"}\n  ]\n}`;
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
          { role: 'system', content: 'You are an expert TELC Deutsch B2 examiner. Always respond with valid JSON only, no markdown code fences or additional text.' },
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
    const evaluationText = data.choices?.[0]?.message?.content;
    if (!evaluationText) {
      throw new Error('No evaluation returned from model');
    }

    // Parse JSON from response (handle potential markdown code fences)
    const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse evaluation from AI response');
    }

    const evaluation = JSON.parse(jsonMatch[0]);
    if (typeof evaluation.score === 'number' && typeof evaluation.maxPoints === 'number' && typeof evaluation.percentage !== 'number') {
      evaluation.percentage = Math.round((evaluation.score / evaluation.maxPoints) * 100);
    }

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in evaluate-telc-answer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
