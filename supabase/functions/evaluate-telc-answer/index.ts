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
    const { section, task, userAnswer } = await req.json();
    
    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    let prompt = '';

    if (section === 'writing') {
      prompt = `You are a TELC B2 examiner evaluating a German writing task.

Task: ${task}
Student's answer: ${userAnswer}

Evaluate according to TELC B2 criteria and provide JSON:
{
  "score": <0-25 points>,
  "grade": "<sehr gut|gut|befriedigend|ausreichend|mangelhaft>",
  "taskCompletion": {
    "score": <0-10>,
    "feedback": "<detailed feedback in German>"
  },
  "coherence": {
    "score": <0-10>,
    "feedback": "<feedback on structure and organization>"
  },
  "vocabulary": {
    "score": <0-10>,
    "feedback": "<feedback on word choice and range>"
  },
  "grammar": {
    "score": <0-10>,
    "feedback": "<feedback on accuracy and complexity>"
  },
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "correctedVersion": "<improved version with corrections>",
  "detailedErrors": [
    {"type": "<error type>", "original": "<text>", "correction": "<fix>", "explanation": "<why>"}
  ]
}`;
    } else if (section === 'speaking') {
      prompt = `You are a TELC B2 examiner evaluating a German speaking performance.

Task: ${task}
Transcript: ${userAnswer}

Evaluate according to TELC B2 criteria and provide JSON:
{
  "score": <0-25 points>,
  "grade": "<sehr gut|gut|befriedigend|ausreichend|mangelhaft>",
  "fluency": {
    "score": <0-10>,
    "feedback": "<feedback on flow and hesitations>"
  },
  "vocabulary": {
    "score": <0-10>,
    "feedback": "<feedback on range and appropriacy>"
  },
  "grammar": {
    "score": <0-10>,
    "feedback": "<feedback on accuracy and variety>"
  },
  "pronunciation": {
    "score": <0-10>,
    "feedback": "<feedback on clarity and accent>"
  },
  "taskCompletion": {
    "score": <0-10>,
    "feedback": "<feedback on addressing the task>"
  },
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "keyErrorsAndCorrections": [
    {"error": "<text>", "correction": "<fix>", "explanation": "<why>"}
  ]
}`;
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
    const evaluationText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const evaluation = JSON.parse(evaluationText);

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
