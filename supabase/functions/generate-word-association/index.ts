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

    const { difficulty, round, previousWords } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const difficultySettings: Record<string, { level: string; topics: string; optionsCount: number }> = {
      easy: {
        level: 'A2-B1',
        topics: 'Alltag, Familie, Essen, Hobbys',
        optionsCount: 4
      },
      medium: {
        level: 'B1-B2',
        topics: 'Arbeit, Bildung, Gesundheit, Medien',
        optionsCount: 4
      },
      hard: {
        level: 'B2-C1',
        topics: 'Politik, Wirtschaft, Wissenschaft, Kultur, Philosophie',
        optionsCount: 4
      }
    };

    const settings = difficultySettings[difficulty as string] || difficultySettings.medium;
    const excludeWords = previousWords ? previousWords.join(', ') : '';

    const prompt = `Generate a German vocabulary word association question at ${settings.level} level.

Topic areas: ${settings.topics}
Difficulty: ${difficulty}
Round: ${round}/10
${excludeWords ? `DO NOT use these words (already used): ${excludeWords}` : ''}

REQUIREMENTS:
- Select an interesting German word at ${settings.level} level
- The word should have a clear, unambiguous meaning
- Provide the English translation as the correct answer
- Generate 3 plausible but INCORRECT English translations as distractors
- Distractors should be related to the topic area but clearly wrong
- Include a brief example sentence using the word in German context

Return JSON:
{
  "word": {
    "german": "<German word>",
    "article": "<der/die/das or null>",
    "correctAnswer": "<correct English translation>",
    "category": "<topic category>",
    "example": "<example sentence in German>",
    "level": "${settings.level}"
  },
  "options": [
    "<correct English translation>",
    "<distractor 1>",
    "<distractor 2>",
    "<distractor 3>"
  ],
  "hint": "<helpful hint about word structure/etymology without giving away answer>"
}

SHUFFLE the options array randomly so the correct answer is not always first!`;

    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: 'You are a German language expert creating vocabulary exercises for language learners.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" }
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits to continue.');
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from AI');
    }

    const result = JSON.parse(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-word-association:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
