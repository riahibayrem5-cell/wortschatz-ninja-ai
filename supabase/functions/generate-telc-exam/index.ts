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
      reading: `You are creating an authentic TELC B2 German Leseverstehen exam section following official TELC standards.

CRITICAL: Use realistic B2-level topics (work, education, environment, technology, culture, society) and authentic German language patterns.

Generate ALL 3 Teile with 5 questions each (75 points total).

Return JSON:
{
  "title": "Leseverstehen",
  "instructions": "Lesen Sie die Texte sorgfältig und beantworten Sie die Fragen. Sie haben 90 Minuten Zeit.",
  "timeLimit": 90,
  "maxPoints": 75,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Globalverstehen",
      "instructions": "Ordnen Sie die Überschriften den Textabschnitten zu.",
      "maxPoints": 25,
      "pointsPerQuestion": 5,
      "text": "<Authentic 300-350 word German newspaper article about contemporary topic like remote work, sustainability, education reform, etc.>",
      "questions": [5 global understanding questions with realistic options]
    },
    {
      "teilNumber": 2,
      "title": "Detailverstehen",
      "instructions": "Lesen Sie den Text genau und kreuzen Sie an: richtig, falsch oder steht nicht im Text.",
      "maxPoints": 25,
      "pointsPerQuestion": 5,
      "text": "<Authentic 350-400 word magazine article>",
      "questions": [5 detailed comprehension questions]
    },
    {
      "teilNumber": 3,
      "title": "Selektives Verstehen",
      "instructions": "Lesen Sie die Anzeigen und finden Sie die passenden Informationen.",
      "maxPoints": 25,
      "pointsPerQuestion": 5,
      "text": "<6-8 short authentic German notices/ads/announcements>",
      "questions": [5 selective reading questions matching information to texts]
    }
  ]
}`,

      sprachbausteine: `Create authentic TELC B2 Sprachbausteine testing German grammar and vocabulary at B2 level.

FOCUS ON: Articles, prepositions, conjunctions, verb forms, modal particles, word order, collocations.

Generate 2 Teile with 10 questions each (30 points total).

Return JSON:
{
  "title": "Sprachbausteine",
  "instructions": "Ergänzen Sie die Lücken. Wählen Sie die richtige Lösung a, b oder c.",
  "timeLimit": 30,
  "maxPoints": 30,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Grammatik und Wortschatz Teil 1",
      "instructions": "Lesen Sie den Text und ergänzen Sie die Lücken 1-10.",
      "maxPoints": 15,
      "pointsPerQuestion": 1.5,
      "text": "<Formal German text about business/academic topic with [1] through [10] gaps>",
      "questions": [10 grammar/vocabulary questions testing B2 structures]
    },
    {
      "teilNumber": 2,
      "title": "Grammatik und Wortschatz Teil 2",
      "instructions": "Lesen Sie den Text und ergänzen Sie die Lücken 11-20.",
      "maxPoints": 15,
      "pointsPerQuestion": 1.5,
      "text": "<Formal German text with [11] through [20] gaps>",
      "questions": [10 more grammar/vocabulary questions]
    }
  ]
}`,

      listening: `Create authentic TELC B2 Hörverstehen with realistic German audio transcripts.

TOPICS: Radio interviews, lectures, announcements, everyday conversations at B2 level.

Generate 3 Teile (75 points total).

Return JSON:
{
  "title": "Hörverstehen",
  "instructions": "Sie hören jeden Text zweimal. Markieren Sie Ihre Lösungen zuerst auf den Aufgabenblättern.",
  "timeLimit": 20,
  "maxPoints": 75,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Globalverstehen - Interview",
      "instructions": "Sie hören ein Interview im Radio. Zu diesem Text gibt es 5 Aufgaben. Wählen Sie die richtige Lösung.",
      "maxPoints": 25,
      "pointsPerQuestion": 5,
      "text": "<Realistic 250-word German radio interview transcript>",
      "questions": [5 global understanding questions]
    },
    {
      "teilNumber": 2,
      "title": "Detailverstehen - Vortrag",
      "instructions": "Sie hören einen Vortrag. Zu diesem Text gibt es 10 Aufgaben. Kreuzen Sie an: richtig oder falsch.",
      "maxPoints": 25,
      "pointsPerQuestion": 2.5,
      "text": "<Realistic 300-word German lecture transcript>",
      "questions": [10 true/false questions about specific details]
    },
    {
      "teilNumber": 3,
      "title": "Selektives Verstehen",
      "instructions": "Sie hören fünf kurze Texte. Zu jedem Text gibt es eine Aufgabe. Ordnen Sie zu.",
      "maxPoints": 25,
      "pointsPerQuestion": 5,
      "text": "<5 short German announcements or messages, 30-50 words each>",
      "questions": [5 matching questions]
    }
  ]
}`,

      writing: `Create TELC B2 Schriftlicher Ausdruck with realistic formal writing task.

Return JSON:
{
  "title": "Schriftlicher Ausdruck",
  "instructions": "Schreiben Sie einen halbformellen oder formellen Brief zu folgendem Thema. Sie haben 30 Minuten Zeit.",
  "timeLimit": 30,
  "maxPoints": 45,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Formeller Brief",
      "instructions": "Schreiben Sie einen Brief von etwa 150 Wörtern. Vergessen Sie nicht Anrede, Einleitung, Hauptteil, Schluss und Grußformel.",
      "maxPoints": 45,
      "task": "Sie haben in der Zeitung eine Anzeige gelesen, dass Ihre Stadt plant, einen großen Parkplatz im Stadtpark zu bauen. Sie sind dagegen. Schreiben Sie einen Brief an den Bürgermeister. Schreiben Sie etwas zu allen vier Punkten: \n1) Grund für Ihr Schreiben\n2) Ihre Meinung zum Parkplatzprojekt\n3) Alternative Vorschläge\n4) Bitte um Rückmeldung",
      "wordCount": 150
    }
  ]
}`,

      speaking: `Create TELC B2 Mündlicher Ausdruck with realistic conversation tasks.

Return JSON:
{
  "title": "Mündlicher Ausdruck",
  "instructions": "Diese Prüfung besteht aus drei Teilen. Sie haben 15 Minuten Vorbereitungszeit für Teil 1.",
  "timeLimit": 15,
  "maxPoints": 75,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Präsentation",
      "instructions": "Wählen Sie ein Thema aus. Präsentieren Sie Ihren Gesprächspartnern das Thema etwa 3-4 Minuten.",
      "maxPoints": 25,
      "task": "THEMA A: 'Soziale Medien im Alltag' - Beschreiben Sie das Thema, berichten Sie von persönlichen Erfahrungen, nennen Sie Vor- und Nachteile, fassen Sie zusammen.\n\nTHEMA B: 'Umweltschutz im eigenen Leben' - Beschreiben Sie das Thema, berichten Sie von persönlichen Erfahrungen, nennen Sie Vor- und Nachteile, fassen Sie zusammen.",
      "wordCount": 0
    },
    {
      "teilNumber": 2,
      "title": "Diskussion zur Präsentation",
      "instructions": "Nach jeder Präsentation: Stellen Sie Fragen, äußern Sie Ihre Meinung, reagieren Sie auf Argumente.",
      "maxPoints": 25,
      "task": "Diskutieren Sie etwa 4-5 Minuten über die Präsentation. Reagieren Sie auf die Präsentation Ihres Partners, stellen Sie Nachfragen, erzählen Sie von eigenen Erfahrungen, diskutieren Sie Vor- und Nachteile.",
      "wordCount": 0
    },
    {
      "teilNumber": 3,
      "title": "Problemlösung",
      "instructions": "Lösen Sie gemeinsam ein Problem. Alle Teilnehmenden machen Vorschläge und einigen sich am Ende.",
      "maxPoints": 25,
      "task": "SITUATION: Sie und Ihre Kollegen planen ein Sommerfest für Ihre Firma (ca. 50 Personen). Diskutieren Sie folgende Punkte und einigen Sie sich:\n- Datum und Ort\n- Budget (wie viel pro Person?)\n- Programm und Aktivitäten\n- Essen und Getränke\n- Wer organisiert was?",
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
