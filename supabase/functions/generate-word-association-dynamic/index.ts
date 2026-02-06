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

    const { difficulty, previousWords, weakCategories, userLevel } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const levelMapping: Record<string, string> = {
      'easy': 'A2-B1',
      'medium': 'B1-B2',
      'hard': 'B2-C1'
    };

    const targetLevel = levelMapping[difficulty] || userLevel || 'B1-B2';
    const excludeWords = previousWords?.slice(-20) || [];
    const focusCategories = weakCategories?.length > 0 
      ? `Focus on these weak areas: ${weakCategories.join(', ')}.` 
      : '';

    const systemPrompt = `You are a German language learning AI that generates word association questions. 
Generate a single German vocabulary word with its English translation for level ${targetLevel}.

${focusCategories}

IMPORTANT RULES:
- Do NOT use any of these words that were already used: ${excludeWords.join(', ')}
- Choose words appropriate for ${targetLevel} level
- Include a helpful hint that doesn't give away the answer
- Provide 3 wrong answer options that are plausible but clearly different
- Include an example sentence in German
- Vary the categories: nouns (with articles), verbs, adjectives, adverbs

Respond ONLY with valid JSON in this exact format:
{
  "word": {
    "german": "the German word",
    "article": "der/die/das (only for nouns, null for others)",
    "correctAnswer": "the English translation",
    "category": "noun|verb|adjective|adverb",
    "example": "Example German sentence using the word",
    "level": "${targetLevel}"
  },
  "options": ["correct answer", "wrong1", "wrong2", "wrong3"],
  "hint": "A helpful hint without giving away the answer",
  "explanation": "Brief linguistic explanation of the word's usage and etymology"
}`;

    console.log('Generating word association for level:', targetLevel);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a new ${targetLevel} level German word for a word association game. Make it interesting and educational.` }
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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      throw new Error('Failed to parse AI response');
    }

    // Shuffle options
    const shuffledOptions = [...parsed.options].sort(() => Math.random() - 0.5);

    return new Response(
      JSON.stringify({
        word: parsed.word,
        options: shuffledOptions,
        hint: parsed.hint,
        explanation: parsed.explanation
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-word-association-dynamic:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
