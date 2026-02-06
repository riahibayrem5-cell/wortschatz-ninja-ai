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

    const { mistakes, progress } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Analyze mistake patterns
    const mistakesByType = mistakes.reduce((acc: any, m: any) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {});

    const mistakesByCategory = mistakes.reduce((acc: any, m: any) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {});

    const recentMistakes = mistakes.slice(0, 15).map((m: any) => ({
      type: m.type,
      category: m.category,
      content: m.content?.substring(0, 100)
    }));

    const prompt = `You are an expert German language learning coach and TELC B2 exam specialist. Analyze this student's learning data and provide actionable, personalized insights.

STUDENT PROGRESS:
- Words Learned: ${progress?.words_learned || 0}
- Exercises Completed: ${progress?.exercises_completed || 0}
- Current Streak: ${progress?.streak_days || 0} days
- Total Mistakes: ${mistakes.length}

MISTAKE PATTERNS:
By Type: ${JSON.stringify(mistakesByType)}
By Category: ${JSON.stringify(mistakesByCategory)}

RECENT MISTAKES (Sample):
${recentMistakes.map((m: any, i: number) => `${i + 1}. Type: ${m.type}, Category: ${m.category}\n   Content: "${m.content}"`).join('\n')}

ANALYSIS REQUIREMENTS:
Provide a detailed JSON response with:

1. "weakSpots": Array of 3-5 specific areas needing focus. For each:
   - "name": Specific skill/topic (e.g., "Dativ/Akkusativ Prepositions", "Subjunctive II", "Separable Verbs")
   - "severity": Integer 1-10 (base on frequency and importance for B2)
   - "recommendation": Specific, actionable advice (e.g., "Practice 10 Dativ exercises daily focusing on 'in, an, auf'")
   - "priority": "High", "Medium", or "Low"

2. "strengths": Array of 2-3 areas where student excels (be specific, don't be generic)

3. "nextSteps": Array of 4-5 concrete action items with:
   - "text": Clear action (e.g., "🎯 Complete 5 gap-fill exercises on modal verbs")
   - "path": Relevant page (/exercises, /vocabulary, /telc-exam, etc.)
   - "icon": lucide icon name (Brain, BookOpen, Target, etc.)
   - "description": Why this helps (brief, 1 sentence)

4. "overallAssessment": 2-3 sentence honest evaluation of current B2 level and exam readiness

IMPORTANT GUIDELINES:
- Be specific, not generic (avoid "practice more grammar" - say "practice Konjunktiv II with würde + infinitive")
- Base severity on both frequency AND importance for TELC B2
- If mistakes are low, suggest proactive learning (vocabulary expansion, exam practice)
- Consider the student's streak and consistency
- Recommendations should be immediately actionable
- If mistakes show confusion between similar concepts, point that out
- Prioritize exam-relevant skills (formal writing, reading comprehension, listening)

Return ONLY valid JSON, no markdown formatting.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are an expert German language tutor and TELC B2 exam specialist. Provide detailed, specific, and actionable learning insights.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    const analysis = JSON.parse(analysisText);

    // Ensure proper structure
    if (!analysis.weakSpots) analysis.weakSpots = [];
    if (!analysis.strengths) analysis.strengths = [];
    if (!analysis.nextSteps) analysis.nextSteps = [];
    if (!analysis.overallAssessment) analysis.overallAssessment = "Keep practicing to improve your German skills.";

    console.log('AI Analysis generated successfully');

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-progress:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        weakSpots: [],
        strengths: [],
        nextSteps: [],
        overallAssessment: "Unable to generate analysis at this time."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
