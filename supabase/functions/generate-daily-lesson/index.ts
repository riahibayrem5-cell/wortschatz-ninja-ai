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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { availableMinutes, focusArea } = await req.json();

    // Fetch user's learning path
    const { data: learningPath } = await supabaseClient
      .from('user_learning_paths')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Fetch user's progress
    const { data: progress } = await supabaseClient
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Fetch recent mistakes for weak area analysis
    const { data: recentMistakes } = await supabaseClient
      .from('mistakes')
      .select('type, category')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Analyze weak areas from mistakes
    const weakAreas: Record<string, number> = {};
    recentMistakes?.forEach(m => {
      weakAreas[m.category] = (weakAreas[m.category] || 0) + 1;
    });
    const sortedWeakAreas = Object.entries(weakAreas)
      .sort((a, b) => b[1] - a[1])
      .map(([area]) => area);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const currentWeek = learningPath?.current_week || 1;
    const targetLevel = learningPath?.target_level || 'B2';
    const minutes = availableMinutes || learningPath?.daily_goal_minutes || 30;
    const focus = focusArea || learningPath?.preferred_focus || sortedWeakAreas[0] || 'grammar';

    const systemPrompt = `You are a German language learning curriculum designer for TELC B2 exam preparation.
Create a personalized daily lesson plan based on:
- Target level: ${targetLevel}
- Current week: ${currentWeek} of 12
- Available time: ${minutes} minutes
- Focus area: ${focus}
- Weak areas from mistakes: ${sortedWeakAreas.slice(0, 3).join(', ') || 'none identified yet'}
- Words learned: ${progress?.words_learned || 0}
- Exercises completed: ${progress?.exercises_completed || 0}
- Current streak: ${progress?.streak_days || 0} days

Generate a lesson plan with 3-5 activities that:
1. Addresses the weak areas
2. Fits within the time constraint
3. Progresses through TELC B2 curriculum
4. Balances different skill types (reading, writing, listening, speaking, grammar)

Respond ONLY with valid JSON in this exact format:
{
  "title": "Day X: Lesson Title",
  "estimatedMinutes": ${minutes},
  "weekProgress": "Week ${currentWeek}/12",
  "focusArea": "${focus}",
  "tasks": [
    {
      "type": "vocabulary|exercise|writing|reading|listening|review|conversation",
      "title": "Task title",
      "description": "Brief description of what to do",
      "duration": 5,
      "path": "/path-to-feature",
      "xpReward": 25
    }
  ],
  "why": "Explanation of why these tasks were chosen based on user's progress",
  "tips": ["Tip 1 for today's practice", "Tip 2"],
  "motivation": "A short motivational message in German with translation"
}`;

    console.log('Generating daily lesson for user:', user.id);

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
          { role: 'user', content: `Generate today's personalized German learning lesson for a student preparing for TELC B2 exam.` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response
    let parsed;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      throw new Error('Failed to parse AI response');
    }

    // Save to daily_lessons table
    const today = new Date().toISOString().split('T')[0];
    await supabaseClient
      .from('daily_lessons')
      .upsert({
        user_id: user.id,
        learning_path_id: learningPath?.id,
        lesson_date: today,
        lesson_data: parsed,
        completed: false
      }, { onConflict: 'user_id,lesson_date' });

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-daily-lesson:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
