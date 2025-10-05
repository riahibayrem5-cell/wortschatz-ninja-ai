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
      reading: `Generate a complete TELC B2 Leseverstehen section with all 3 Teile. Create authentic German texts and comprehension questions.

Return JSON with this EXACT structure:
{
  "title": "Leseverstehen",
  "instructions": "Lesen Sie die Texte und beantworten Sie die Fragen.",
  "timeLimit": 90,
  "maxPoints": 25,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Globalverstehen",
      "instructions": "Ordnen Sie die Überschriften den Textabschnitten zu.",
      "text": "<authentic German text 200-250 words about work/society>",
      "questions": [
        {
          "id": 1,
          "question": "Welche Überschrift passt zu diesem Abschnitt?",
          "options": ["a) Option 1", "b) Option 2", "c) Option 3", "d) Option 4"],
          "correctAnswer": "a",
          "explanation": "Explanation in German"
        }
      ]
    },
    {
      "teilNumber": 2,
      "title": "Detailverstehen",
      "instructions": "Lesen Sie den Text und beantworten Sie die Fragen.",
      "text": "<authentic German text 300-350 words>",
      "questions": [
        {
          "id": 6,
          "question": "Question about details",
          "options": ["a) ...", "b) ...", "c) ...", "d) ..."],
          "correctAnswer": "b",
          "explanation": "..."
        }
      ]
    },
    {
      "teilNumber": 3,
      "title": "Selektives Verstehen",
      "instructions": "Lesen Sie die kurzen Texte und finden Sie die passenden Informationen.",
      "text": "<6-8 short texts or notices in German>",
      "questions": [
        {
          "id": 11,
          "question": "Wo finden Sie...?",
          "options": ["a) Text A", "b) Text B", "c) Text C", "d) Text D"],
          "correctAnswer": "c",
          "explanation": "..."
        }
      ]
    }
  ]
}`,

      sprachbausteine: `Generate TELC B2 Sprachbausteine section with 2 Teile (20 questions total).

Return JSON:
{
  "title": "Sprachbausteine",
  "instructions": "Ergänzen Sie die Lücken im Text.",
  "timeLimit": 30,
  "maxPoints": 15,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Grammatik",
      "instructions": "Wählen Sie die richtige grammatische Form.",
      "text": "<German text with [GAP_1] through [GAP_10] placeholders>",
      "questions": [
        {
          "id": 1,
          "question": "Lücke 1",
          "options": ["a) der", "b) die", "c) das", "d) dem"],
          "correctAnswer": "a",
          "explanation": "Grammar explanation"
        }
      ]
    },
    {
      "teilNumber": 2,
      "title": "Wortschatz",
      "instructions": "Wählen Sie das passende Wort.",
      "text": "<German text with [GAP_11] through [GAP_20] placeholders>",
      "questions": [
        {
          "id": 11,
          "question": "Lücke 11",
          "options": ["a) word1", "b) word2", "c) word3", "d) word4"],
          "correctAnswer": "b",
          "explanation": "Vocabulary explanation"
        }
      ]
    }
  ]
}`,

      listening: `Generate TELC B2 Hörverstehen section with 3 Teile.

Return JSON:
{
  "title": "Hörverstehen",
  "instructions": "Hören Sie die Texte und beantworten Sie die Fragen.",
  "timeLimit": 20,
  "maxPoints": 25,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Globalverstehen - Radiointerview",
      "instructions": "Hören Sie das Interview und beantworten Sie die Fragen zum Hauptthema.",
      "text": "<German radio interview script 200 words>",
      "questions": [
        {
          "id": 1,
          "question": "Worum geht es hauptsächlich?",
          "options": ["a) ...", "b) ...", "c) ...", "d) ..."],
          "correctAnswer": "a",
          "explanation": "..."
        }
      ]
    },
    {
      "teilNumber": 2,
      "title": "Detailverstehen - Vortrag",
      "instructions": "Hören Sie den Vortrag und beantworten Sie die detaillierten Fragen.",
      "text": "<German lecture script 250 words>",
      "questions": [
        {
          "id": 6,
          "question": "Was sagt der Sprecher über...?",
          "options": ["a) ...", "b) ...", "c) ...", "d) ..."],
          "correctAnswer": "b",
          "explanation": "..."
        }
      ]
    },
    {
      "teilNumber": 3,
      "title": "Selektives Verstehen - Durchsagen",
      "instructions": "Hören Sie die Durchsagen und finden Sie die passenden Informationen.",
      "text": "<5 short German announcements>",
      "questions": [
        {
          "id": 11,
          "question": "Welche Durchsage passt zu...?",
          "options": ["a) 1", "b) 2", "c) 3", "d) 4"],
          "correctAnswer": "c",
          "explanation": "..."
        }
      ]
    }
  ]
}`,

      writing: `Generate TELC B2 Schriftlicher Ausdruck section with 2 Teile.

Return JSON:
{
  "title": "Schriftlicher Ausdruck",
  "instructions": "Bearbeiten Sie beide Aufgaben.",
  "timeLimit": 30,
  "maxPoints": 45,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Formeller Brief",
      "instructions": "Schreiben Sie einen formellen Brief (ca. 80 Wörter).",
      "task": "Sie haben in der Zeitung eine Anzeige für eine Wohnung gesehen. Schreiben Sie einen Brief an den Vermieter. Berücksichtigen Sie alle vier Punkte: 1) Grund für Ihr Schreiben, 2) Informationen über sich selbst, 3) Fragen zur Wohnung, 4) Bitte um einen Besichtigungstermin.",
      "wordCount": 80
    },
    {
      "teilNumber": 2,
      "title": "Meinungsäußerung",
      "instructions": "Schreiben Sie einen Text zu einem aktuellen Thema (ca. 180 Wörter).",
      "task": "In Ihrer Stadt wird diskutiert, ob ein neues Einkaufszentrum gebaut werden soll. Schreiben Sie Ihre Meinung dazu. Berücksichtigen Sie: 1) Ihre persönliche Meinung, 2) Argumente dafür und dagegen, 3) Beispiele aus Ihrer Erfahrung, 4) Ihre Schlussfolgerung.",
      "wordCount": 180
    }
  ]
}`,

      speaking: `Generate TELC B2 Mündlicher Ausdruck section with 3 Teile.

Return JSON:
{
  "title": "Mündlicher Ausdruck",
  "instructions": "Bearbeiten Sie alle drei Aufgaben.",
  "timeLimit": 15,
  "maxPoints": 60,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Präsentation",
      "instructions": "Präsentieren Sie ein Thema (ca. 3-4 Minuten). Vorbereitungszeit: 3 Minuten.",
      "task": "Sie sollen Ihren Gesprächspartnern ein aktuelles Thema präsentieren. Wählen Sie eines von zwei Themen aus. Strukturieren Sie Ihre Präsentation so: 1) Beschreiben Sie das Thema, 2) Berichten Sie von Ihren persönlichen Erfahrungen, 3) Nennen Sie Vor- und Nachteile, 4) Fassen Sie zusammen.",
      "wordCount": 0
    },
    {
      "teilNumber": 2,
      "title": "Diskussion",
      "instructions": "Diskutieren Sie mit Ihren Partnern über die Präsentation (ca. 4-5 Minuten).",
      "task": "Nach der Präsentation diskutieren Sie mit Ihren Gesprächspartnern. Reagieren Sie auf die Präsentation, stellen Sie Fragen, äußern Sie Ihre Meinung, geben Sie Beispiele aus eigener Erfahrung.",
      "wordCount": 0
    },
    {
      "teilNumber": 3,
      "title": "Problemlösung",
      "instructions": "Lösen Sie gemeinsam ein Problem (ca. 5-6 Minuten).",
      "task": "Sie und Ihre Gesprächspartner sollen ein gemeinsames Problem lösen. Sie planen ein Fest für Ihre Deutschklasse. Diskutieren Sie: Wann und wo findet das Fest statt? Was wird gegessen und getrunken? Wer organisiert was? Budget? Am Ende sollten Sie zu einer gemeinsamen Lösung kommen.",
      "wordCount": 0
    }
  ]
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
