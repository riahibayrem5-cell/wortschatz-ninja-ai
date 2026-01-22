import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) {
      return unauthorizedResponse(authError || "Authentication required", corsHeaders);
    }

    const body = await req.json();
    
    // Support both old and new API formats
    const { 
      exerciseType, 
      lessonType, 
      lessonTitle, 
      topics, 
      skill, 
      format, 
      difficulty = "B2",
      // Old format support
      topic,
      count = 5
    } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // If old format (topic only), use legacy behavior
    if (topic && !exerciseType) {
      return await handleLegacyRequest(LOVABLE_API_KEY, topic, difficulty, count, corsHeaders);
    }

    console.log(`Generating ${exerciseType} exercises for ${lessonTitle}`);

    const topicsStr = topics?.join(", ") || "general German B2 topics";
    const contextInfo = `
      Lesson: ${lessonTitle}
      Type: ${lessonType}
      Skill focus: ${skill || "general"}
      Format: ${format || "varied"}
      Topics: ${topicsStr}
      Level: ${difficulty}
    `;

    let prompt = "";

    switch (exerciseType) {
      case "fill-blank":
        prompt = `Create 5 fill-in-the-blank German sentences for B2 level learners.

Context: ${contextInfo}

Generate sentences where one important word is missing. The missing word should test vocabulary or grammar relevant to B2 level.

Return a JSON array with this exact structure:
[
  {
    "id": 1,
    "sentence": "Full sentence with ___ as the blank marker",
    "blank": "___",
    "correctAnswer": "the correct word",
    "hint": "Optional hint about the word type or meaning"
  }
]

Requirements:
- Use ___ to mark where the blank should be
- Sentences should be realistic B2-level German
- Include variety (nouns with articles, verbs in correct form, adjectives, etc.)
- Hints should be helpful but not give away the answer`;
        break;

      case "mcq":
        prompt = `Create 5 multiple-choice questions about German language at B2 level.

Context: ${contextInfo}

Return a JSON array with this exact structure:
[
  {
    "id": 1,
    "question": "The question in German or about German",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this answer is correct"
  }
]

Requirements:
- Mix of grammar, vocabulary, and usage questions
- All 4 options should be plausible
- correctIndex is 0-based (0 for first option, 3 for last)
- Questions should be challenging but fair for B2 level`;
        break;

      case "matching":
        prompt = `Create 6 German-English word/phrase pairs for a matching exercise at B2 level.

Context: ${contextInfo}

Return a JSON array with this exact structure:
[
  {
    "id": 1,
    "left": "German word or phrase",
    "right": "English translation"
  }
]

Requirements:
- Include a mix of vocabulary relevant to the lesson topics
- Use B2-level vocabulary (not too basic, not too advanced)
- Include some compound words or expressions typical for B2
- Translations should be accurate and commonly used`;
        break;

      case "translation":
        prompt = `Create 5 sentences for German-English translation practice at B2 level.

Context: ${contextInfo}

Return a JSON array with this exact structure:
[
  {
    "id": 1,
    "sourceText": "The sentence to translate",
    "sourceLang": "de",
    "acceptedTranslations": ["Main translation", "Alternative translation 1", "Alternative translation 2"],
    "explanation": "Brief note about grammar or vocabulary used"
  }
]

Requirements:
- Mix of German→English (sourceLang: "de") and English→German (sourceLang: "en")
- Include 2-4 accepted translations for each (accounting for word order flexibility)
- Sentences should demonstrate B2 grammar (subjunctive, passive, complex sentences)
- Topics should relate to: ${topicsStr}`;
        break;

      default:
        throw new Error(`Unknown exercise type: ${exerciseType}`);
    }

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
            content: `You are an expert German language teacher specializing in TELC B2 exam preparation. Generate high-quality practice exercises that help students prepare for the exam. Always return valid JSON arrays only, no markdown or additional text.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let exercises;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      exercises = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse exercise data");
    }

    console.log(`Generated ${exercises.length} exercises of type ${exerciseType}`);

    return new Response(JSON.stringify({ exercises }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in generate-gap-fill:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Legacy handler for old API format
async function handleLegacyRequest(apiKey: string, topic: string, difficulty: string, count: number, corsHeaders: Record<string, string>) {
  const difficultyGuidelines: Record<string, string> = {
    "A2": "Use basic vocabulary and simple grammatical structures. Present tense and simple past only. Short, everyday sentences with common words.",
    "B1": "Use common vocabulary and standard grammatical structures. Include present, past, and future tenses. Moderately complex sentences.",
    "B2": "Use advanced vocabulary and complex grammatical structures. Include subjunctive, passive voice, and subordinate clauses. Sophisticated sentences.",
    "B2+": "Use highly sophisticated vocabulary and very complex grammatical structures. Include advanced subjunctive, Konjunktiv II, complex subordinate clauses, and idiomatic expressions."
  };

  const systemPrompt = `You are a German language teacher creating ${difficulty} level gap-fill exercises.

IMPORTANT - ${difficulty} Level Guidelines:
${difficultyGuidelines[difficulty] || difficultyGuidelines["B2"]}

Create ${count} gap-fill sentences where students must fill in the missing word. Focus on:
- Articles (der/die/das)
- Prepositions
- Verb conjugations
- Adjective endings
- Common grammatical structures at ${difficulty} level

Each gap should test a specific grammatical concept at ${difficulty} level ONLY.`;

  const userPrompt = `Create ${count} ${difficulty} level German gap-fill exercises${topic ? ` about ${topic}` : ''}. 

Format as JSON with:
- sentences: array of objects with { sentence: "text with ___ for gap", answer: "correct word", explanation: "why this is correct", grammarPoint: "what grammar rule this tests" }

Make sure sentences strictly match ${difficulty} level complexity.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse gap-fill from AI response");
  }
  
  const result = JSON.parse(jsonMatch[0]);

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
