import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { mistakes, progress } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `You are a German language learning analyst. Analyze the following student data and provide personalized insights:

Student Progress:
- Words Learned: ${progress?.words_learned || 0}
- Exercises Completed: ${progress?.exercises_completed || 0}
- Current Streak: ${progress?.streak_days || 0} days

Recent Mistakes (${mistakes.length} total):
${mistakes.slice(0, 20).map((m: any) => `- Type: ${m.type}, Category: ${m.category}, Content: ${m.content}`).join('\n')}

Provide a JSON response with:
1. weakSpots: Array of top 3-5 areas needing focus with {name, severity (1-10), recommendation}
2. strengths: Array of 2-3 areas where student excels
3. nextSteps: Array of 3-4 specific actionable recommendations
4. overallAssessment: Brief summary of student's current level

Focus on TELC B2 exam preparation. Be encouraging but honest.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert German language learning analyst specializing in TELC B2 exam preparation. Provide insights in JSON format only.' 
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-progress:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
