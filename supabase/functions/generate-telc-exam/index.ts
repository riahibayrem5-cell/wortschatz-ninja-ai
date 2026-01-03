import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPrompt(section: string, teil?: number) {
  const teilLine = typeof teil === "number" ? `\nONLY generate Teil ${teil}. Return an array with exactly ONE teil object.` : "\nGenerate the FULL section (all Teile).";

  const questionSchema = `Each question MUST follow this schema (no extra keys):\n{
  "id": 1,
  "question": "...",
  "options": ["...", "...", "..."],
  "correctAnswer": "<MUST be EXACTLY one of options>",
  "explanation": "1-2 short sentences in German explaining why"
}`;

  switch (section) {
    case "reading":
      return `You are creating ORIGINAL practice content that matches the TELC Deutsch B2 *format* (do NOT copy any real telc texts, questions, or answer keys).\n${teilLine}

SECTION: Leseverstehen (B2)\nTime limit: 90 minutes\nMax points: 75\n
Teil 1 (Globalverstehen): 5 short texts (A–E, each 60–90 words) + 6 headings (one extra). For each text choose the best heading.\nTeil 2 (Detailverstehen): 1 longer text (350–450 words) + 10 statements. Options MUST be: ["richtig", "falsch", "steht nicht im Text"].\nTeil 3 (Selektives Verstehen): 10 situations + 12 short ads/notices (A–L). For each situation choose the best matching ad label (e.g. "A", "B", ...).\n
Return VALID JSON with this structure:\n{
  "title": "Leseverstehen",
  "instructions": "...",
  "timeLimit": 90,
  "maxPoints": 75,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Globalverstehen",
      "instructions": "...",
      "maxPoints": 25,
      "pointsPerQuestion": 5,
      "text": "Text A: ...\n\nText B: ...\n\nText C: ...\n\nText D: ...\n\nText E: ...",
      "questions": [5 questions]
    },
    {
      "teilNumber": 2,
      "title": "Detailverstehen",
      "instructions": "...",
      "maxPoints": 25,
      "pointsPerQuestion": 2.5,
      "text": "<one longer text>",
      "questions": [10 questions]
    },
    {
      "teilNumber": 3,
      "title": "Selektives Verstehen",
      "instructions": "...",
      "maxPoints": 25,
      "pointsPerQuestion": 2.5,
      "text": "Anzeigen A: ...\nAnzeigen B: ...\n...\nAnzeigen L: ...\n\nSituationen 1-10: ...",
      "questions": [10 questions]
    }
  ]
}\n
${questionSchema}\n
IMPORTANT:\n- Keep B2 language authentic and realistic (topics: work, education, society, health, environment, services).\n- Do NOT use any copyrighted telc content. Everything must be newly written.`;

    case "sprachbausteine":
      return `You are creating ORIGINAL practice content that matches the TELC Deutsch B2 *format* (do NOT copy any real telc texts/questions).\n${teilLine}

SECTION: Sprachbausteine (B2)\nTime limit: 30 minutes\nMax points: 30\n
Teil 1: 10 gaps in a coherent text with options (a/b/c style content).\nTeil 2: 10 gaps in another coherent text with options (a/b/c style content).\nFocus: prepositions, verb forms, conjunctions, word order, collocations, articles, pronouns.\n
Return JSON:\n{
  "title": "Sprachbausteine",
  "instructions": "...",
  "timeLimit": 30,
  "maxPoints": 30,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Sprachbausteine Teil 1",
      "instructions": "...",
      "maxPoints": 15,
      "pointsPerQuestion": 1.5,
      "text": "<text with [1]...[10] gaps>",
      "questions": [10 questions]
    },
    {
      "teilNumber": 2,
      "title": "Sprachbausteine Teil 2",
      "instructions": "...",
      "maxPoints": 15,
      "pointsPerQuestion": 1.5,
      "text": "<text with [11]...[20] gaps>",
      "questions": [10 questions]
    }
  ]
}\n
${questionSchema}\n
IMPORTANT:\n- correctAnswer MUST be the exact option string, not an index.`;

    case "listening":
      return `You are creating ORIGINAL practice content that matches the TELC Deutsch B2 *format* (do NOT copy any real telc transcripts or questions).\n${teilLine}

SECTION: Hörverstehen (B2)\nTime limit: 20 minutes\nMax points: 75\n
Teil 1: 5 tasks (MC) based on a short radio item/interview transcript (200–260 words).\nTeil 2: 10 tasks based on a longer transcript (280–360 words). Options MUST be: ["richtig", "falsch"].\nTeil 3: 5 short messages/announcements (each 30–60 words) with 5 tasks (MC).\n
Return JSON:\n{
  "title": "Hörverstehen",
  "instructions": "...",
  "timeLimit": 20,
  "maxPoints": 75,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Teil 1",
      "instructions": "...",
      "maxPoints": 25,
      "pointsPerQuestion": 5,
      "text": "<transcript>",
      "questions": [5 questions]
    },
    {
      "teilNumber": 2,
      "title": "Teil 2",
      "instructions": "...",
      "maxPoints": 25,
      "pointsPerQuestion": 2.5,
      "text": "<transcript>",
      "questions": [10 questions]
    },
    {
      "teilNumber": 3,
      "title": "Teil 3",
      "instructions": "...",
      "maxPoints": 25,
      "pointsPerQuestion": 5,
      "text": "Nachricht 1: ...\nNachricht 2: ...\nNachricht 3: ...\nNachricht 4: ...\nNachricht 5: ...",
      "questions": [5 questions]
    }
  ]
}\n
${questionSchema}\n
IMPORTANT:\n- Keep the transcripts speakable and natural; no stage directions.\n- correctAnswer MUST be the exact option string.`;

    case "writing":
      return `You are creating ORIGINAL practice content that matches the TELC Deutsch B2 *format* (do NOT copy any real telc tasks).\n${teilLine}

SECTION: Schriftlicher Ausdruck (B2)\nTime limit: 30 minutes\nMax points: 45\n
Return JSON:\n{
  "title": "Schriftlicher Ausdruck",
  "instructions": "...",
  "timeLimit": 30,
  "maxPoints": 45,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Brief/E-Mail",
      "instructions": "Schreiben Sie ca. 150 Wörter.",
      "maxPoints": 45,
      "task": "<a realistic semi-formal/formal prompt with exactly 4 bullet points>",
      "wordCount": 150
    }
  ]
}\n
IMPORTANT:\n- The task must feel like real-life (complaint, request, recommendation, problem).`;

    case "speaking":
      return `You are creating ORIGINAL practice content that matches the TELC Deutsch B2 *format* (do NOT copy any real telc topics/tasks).\n${teilLine}

SECTION: Mündlicher Ausdruck (B2)\nTime limit (exam part): 15 minutes\nMax points: 75\n
Return JSON:\n{
  "title": "Mündlicher Ausdruck",
  "instructions": "...",
  "timeLimit": 15,
  "maxPoints": 75,
  "teile": [
    {
      "teilNumber": 1,
      "title": "Präsentation",
      "instructions": "...",
      "maxPoints": 25,
      "task": "THEMA A: ...\nTHEMA B: ...",
      "wordCount": 0
    },
    {
      "teilNumber": 2,
      "title": "Diskussion",
      "instructions": "...",
      "maxPoints": 25,
      "task": "<discussion prompts and roles>",
      "wordCount": 0
    },
    {
      "teilNumber": 3,
      "title": "Problemlösung",
      "instructions": "...",
      "maxPoints": 25,
      "task": "SITUATION: ...\n- Punkt 1\n- Punkt 2\n- Punkt 3\n- Punkt 4",
      "wordCount": 0
    }
  ]
}`;

    default:
      return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { section, difficulty = "b2", teil } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = buildPrompt(section, teil);
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Invalid section" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating TELC exam for section=${section} difficulty=${difficulty} teil=${teil ?? "all"}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are an expert TELC Deutsch B2 exam content generator. You only output valid JSON. Never include markdown code fences.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment.", code: "RATE_LIMITED" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue.", code: "PAYMENT_REQUIRED" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content;

    if (!contentText) {
      throw new Error("No content received from AI");
    }

    // Parse JSON from the response, handling potential markdown code blocks (just in case)
    let content;
    try {
      const trimmed = String(contentText).trim();
      const jsonMatch =
        trimmed.match(/```json\n?([\s\S]*?)\n?```/) ||
        trimmed.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch?.[1] ?? trimmed;
      content = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", contentText);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-telc-exam:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

