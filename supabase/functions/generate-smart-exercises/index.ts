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

    const { lessonType, lessonTitle, topics, skill, difficulty = "B2", count = 8 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`Generating ${count} smart exercises for: ${lessonTitle} (${lessonType})`);

    const topicsStr = topics?.join(", ") || "general German";

    const prompt = `Create ${count} German language exercises for ${difficulty} level learners.

Lesson: ${lessonTitle}
Type: ${lessonType}
Topics: ${topicsStr}
Skill focus: ${skill || "general"}

IMPORTANT REQUIREMENTS:
1. Mix of exercise types: use "mcq" (multiple choice) and "fill-blank" types
2. For MCQ: provide exactly 4 options, correctAnswer is the 0-based index (0-3)
3. For fill-blank: correctAnswer is the exact word/phrase needed
4. Vary difficulty: include 3 easy, 3 medium, 2 hard exercises
5. All content must be grammatically correct German at B2 level
6. Explanations should be educational and clear

Return a JSON object with this exact structure:
{
  "exercises": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Clear question in German or about German",
      "context": "Optional context sentence",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct - in German or English",
      "hint": "Helpful hint without giving away the answer",
      "difficulty": "easy"
    },
    {
      "id": 2,
      "type": "fill-blank",
      "question": "Sentence with a gap marked by ___",
      "context": "Optional context",
      "correctAnswer": "the correct word",
      "explanation": "Explanation of the grammar or vocabulary point",
      "hint": "Hint about word type or meaning",
      "difficulty": "medium"
    }
  ]
}

Focus on these B2 grammar and vocabulary areas:
- Cases (Nominativ, Akkusativ, Dativ, Genitiv)
- Verb conjugation and tenses
- Subordinate clauses (weil, obwohl, wenn, nachdem, etc.)
- Konjunktiv II for politeness and hypotheticals
- Passive voice
- Complex prepositions
- Word order in main and subordinate clauses
- B2 vocabulary: work, education, health, environment, society`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert German language teacher creating ACCURATE exercises for TELC B2 exam preparation. Your exercises must be grammatically perfect and educationally valuable. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
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

    let result;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse exercise data");
    }

    // Validate and fix exercises
    if (result.exercises && Array.isArray(result.exercises)) {
      result.exercises = result.exercises.map((ex: any, idx: number) => {
        // Ensure required fields
        const exercise = {
          id: ex.id || idx + 1,
          type: ex.type || "mcq",
          question: ex.question || "Question not generated",
          context: ex.context || undefined,
          options: ex.options || undefined,
          correctAnswer: ex.correctAnswer ?? 0,
          explanation: ex.explanation || "No explanation available",
          hint: ex.hint || undefined,
          difficulty: ex.difficulty || "medium"
        };

        // Validate MCQ
        if (exercise.type === "mcq") {
          if (!Array.isArray(exercise.options) || exercise.options.length !== 4) {
            exercise.options = ["Option A", "Option B", "Option C", "Option D"];
          }
          if (typeof exercise.correctAnswer !== "number" || exercise.correctAnswer < 0 || exercise.correctAnswer > 3) {
            exercise.correctAnswer = 0;
          }
        }

        // Validate fill-blank
        if (exercise.type === "fill-blank") {
          if (typeof exercise.correctAnswer !== "string" || !exercise.correctAnswer) {
            exercise.correctAnswer = "answer";
          }
        }

        return exercise;
      });
    }

    console.log(`Generated ${result.exercises?.length || 0} validated exercises`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in generate-smart-exercises:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
