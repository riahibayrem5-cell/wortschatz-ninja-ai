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
    const { 
      type, 
      question, 
      userAnswer, 
      correctAnswer, 
      context,
      text 
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let prompt = '';

    if (type === 'hint') {
      prompt = `You are a TELC B2 exam coach. The student is stuck on this question:
Question: ${question}
Context/Text: ${text || 'No additional context'}

Provide a helpful hint in German that:
1. Guides them towards the answer without giving it away
2. Explains what they should look for in the text
3. Highlights key vocabulary or grammar concepts
4. Is encouraging and supportive

Return your hint in this JSON format:
{
  "hint": "Your helpful hint in German",
  "keyVocabulary": ["word1", "word2"],
  "strategy": "Brief strategy tip in German"
}`;
    } else if (type === 'explanation') {
      prompt = `You are a TELC B2 exam coach. Explain why this answer is correct/incorrect:

Question: ${question}
User's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}
Context: ${text || context || 'No additional context'}

Provide a detailed explanation in German that:
1. Explains why the correct answer is right
2. If the user was wrong, explain their mistake
3. Teaches the underlying grammar/vocabulary concept
4. Provides similar examples they might see in the exam
5. Give practical tips to avoid this mistake in the future

Return in this JSON format:
{
  "explanation": "Detailed explanation in German",
  "concept": "The grammar/vocabulary concept being tested",
  "similarExamples": ["Example 1 in German", "Example 2 in German"],
  "tips": ["Tip 1 in German", "Tip 2 in German"]
}`;
    } else if (type === 'feedback') {
      prompt = `You are a TELC B2 exam coach. The student just completed a section. Analyze their performance:

Questions and answers: ${JSON.stringify({ question, userAnswer, correctAnswer, context })}

Provide constructive feedback in German that:
1. Highlights what they did well
2. Points out patterns in their mistakes
3. Suggests specific areas to focus on
4. Provides study recommendations
5. Is encouraging and motivational

Return in JSON format:
{
  "strengths": ["Strength 1 in German", "Strength 2 in German"],
  "areasToImprove": ["Area 1 in German", "Area 2 in German"],
  "studyRecommendations": ["Recommendation 1 in German", "Recommendation 2 in German"],
  "motivationalMessage": "Encouraging message in German"
}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert TELC B2 German exam coach. Always provide helpful, accurate, and encouraging guidance in German.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.', code: 'RATE_LIMITED' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.', code: 'PAYMENT_REQUIRED' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in telc-practice-helper:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
