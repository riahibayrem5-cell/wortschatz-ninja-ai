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
    const { section, difficulty = 'b2' } = await req.json();
    
    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    const prompts: Record<string, string> = {
      reading: `Generate a TELC B2 level German reading comprehension exercise. Create:
1. An authentic German text (250-300 words) about a relevant topic (work, education, society, culture)
2. 5 multiple-choice questions testing comprehension
3. Each question should have 4 options (a, b, c, d) with only one correct answer

Return JSON:
{
  "text": "<German text>",
  "title": "<text title>",
  "questions": [
    {
      "id": 1,
      "question": "<question in German>",
      "options": ["a) ...", "b) ...", "c) ...", "d) ..."],
      "correctAnswer": "<a|b|c|d>",
      "explanation": "<why this is correct in German>"
    }
  ],
  "timeLimit": 30,
  "instructions": "<instructions in German>"
}`,

      sprachbausteine: `Generate TELC B2 level Sprachbausteine (language elements) exercise. Create:
1. A German text with 10 gaps
2. Each gap has 4 word/phrase options testing grammar, vocabulary, and context
3. Focus on: articles, prepositions, conjunctions, verb forms, adjective endings

Return JSON:
{
  "title": "<exercise title>",
  "text": "<text with [GAP_1], [GAP_2], etc.>",
  "gaps": [
    {
      "id": 1,
      "options": ["a) ...", "b) ...", "c) ...", "d) ..."],
      "correctAnswer": "<a|b|c|d>",
      "explanation": "<grammar rule explanation in German>"
    }
  ],
  "timeLimit": 20,
  "instructions": "<instructions in German>"
}`,

      listening: `Generate a TELC B2 level listening comprehension script. Create:
1. A dialogue or monologue script (200-250 words) in German
2. Topic: everyday situation, work, or formal context
3. 5 comprehension questions with multiple choice answers

Return JSON:
{
  "script": "<German dialogue/monologue with speaker labels>",
  "title": "<listening title>",
  "context": "<situation description in German>",
  "questions": [
    {
      "id": 1,
      "question": "<question in German>",
      "options": ["a) ...", "b) ...", "c) ...", "d) ..."],
      "correctAnswer": "<a|b|c|d>",
      "explanation": "<explanation in German>"
    }
  ],
  "timeLimit": 25,
  "instructions": "<listening instructions in German>"
}`,

      writing: `Generate a TELC B2 writing task. Create:
1. A realistic writing prompt (formal letter, email, or essay)
2. Specific requirements and constraints
3. Evaluation criteria
4. Sample phrases and structures

Return JSON:
{
  "task": "<task description in German>",
  "type": "<letter|email|essay>",
  "situation": "<context in German>",
  "requirements": ["<requirement 1>", "<requirement 2>", ...],
  "wordCount": 150,
  "timeLimit": 30,
  "tips": ["<tip 1>", "<tip 2>", ...],
  "usefulPhrases": ["<phrase 1>", "<phrase 2>", ...],
  "evaluationCriteria": {
    "taskCompletion": "<description>",
    "coherence": "<description>",
    "vocabulary": "<description>",
    "grammar": "<description>"
  }
}`,

      speaking: `Generate a TELC B2 speaking task. Create:
1. A discussion topic with stimulus material
2. Preparation questions
3. Main discussion points
4. Evaluation criteria

Return JSON:
{
  "task": "<task description in German>",
  "topic": "<topic>",
  "stimulusMaterial": "<text or situation in German>",
  "preparationQuestions": ["<question 1>", "<question 2>", ...],
  "discussionPoints": ["<point 1>", "<point 2>", ...],
  "timeLimit": 15,
  "preparationTime": 3,
  "usefulPhrases": ["<phrase 1>", "<phrase 2>", ...],
  "evaluationCriteria": {
    "fluency": "<description>",
    "vocabulary": "<description>",
    "grammar": "<description>",
    "pronunciation": "<description>",
    "taskCompletion": "<description>"
  }
}`,
    };

    const prompt = prompts[section];
    if (!prompt) {
      throw new Error('Invalid section');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const content = JSON.parse(contentText);

    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-telc-exam:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
