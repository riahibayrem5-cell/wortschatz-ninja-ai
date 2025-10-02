import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TELC B2 official scoring guidelines
const SECTION_WEIGHTS = {
  reading: 25,        // 25 points
  sprachbausteine: 15, // 15 points  
  listening: 25,      // 25 points
  writing: 45,        // 45 points (15 + 30)
  speaking: 60        // 60 points (15 + 15 + 30)
};

const TELC_GRADES = {
  100: 'Sehr gut',
  90: 'Gut',
  75: 'Befriedigend',
  60: 'Ausreichend',
  0: 'Nicht bestanden'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { section, totalQuestions, correctAnswers } = await req.json();

    if (!section || !totalQuestions) {
      throw new Error('Section and totalQuestions are required');
    }

    const maxPoints = SECTION_WEIGHTS[section as keyof typeof SECTION_WEIGHTS] || 100;
    const pointsPerQuestion = maxPoints / totalQuestions;
    const earnedPoints = Math.round(correctAnswers * pointsPerQuestion * 10) / 10;
    const percentage = Math.round((earnedPoints / maxPoints) * 100);
    
    // Determine grade
    let grade = 'Nicht bestanden';
    for (const [threshold, gradeName] of Object.entries(TELC_GRADES).sort((a, b) => Number(b[0]) - Number(a[0]))) {
      if (percentage >= Number(threshold)) {
        grade = gradeName;
        break;
      }
    }

    const passed = percentage >= 60;

    return new Response(
      JSON.stringify({
        section,
        correctAnswers,
        totalQuestions,
        earnedPoints,
        maxPoints,
        percentage,
        grade,
        passed,
        feedback: passed 
          ? `Excellent work! You scored ${percentage}% (${earnedPoints}/${maxPoints} points).`
          : `You scored ${percentage}% (${earnedPoints}/${maxPoints} points). You need at least 60% to pass.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in score-telc-section:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
