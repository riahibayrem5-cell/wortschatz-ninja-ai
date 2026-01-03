import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const difficultyGuidelines: Record<string, string> = {
  A2: "Use simple, everyday German vocabulary and basic sentence structures. Speak slowly and clearly. Use present and simple past tenses only. Ask simple questions and give simple responses.",
  B1: "Use common German vocabulary and standard grammar. Speak at a moderate pace. Use present, past, and future tenses. Include some subordinate clauses but keep sentences relatively simple.",
  B2: "Use advanced German vocabulary and complex grammatical structures. Speak at a natural pace. Include subordinate clauses, passive voice, and varied expressions. Challenge the learner appropriately.",
  "B2+": "Use sophisticated German vocabulary, idiomatic expressions, and very complex grammar. Speak at native speed. Include Konjunktiv II, complex subordinate clauses, and nuanced expressions typical of educated native speakers.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, scenario, message, conversationHistory, difficulty = "B2" } = await req.json();

    if (!action || !["start", "continue"].includes(action)) {
      return new Response(JSON.stringify({ error: "Valid action (start or continue) is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const levelGuide = difficultyGuidelines[difficulty] || difficultyGuidelines.B2;
    const scenarioText = scenario || "Free conversation";

    const systemPrompt = `You are a native German tutor and conversation partner.

CRITICAL - Level Requirements: EXACTLY ${difficulty}
${levelGuide}

Scenario: ${scenarioText}

Rules:
- Keep the conversation natural, friendly, and encouraging.
- If the learner makes major mistakes, correct them naturally inside your reply (don’t overwhelm).
- Stay fully in German unless the learner explicitly asks for English.`;

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (action === "start") {
      messages.push({
        role: "user",
        content: `Start the conversation with a natural German greeting appropriate for this scenario at ${difficulty} level. Then ask ONE short question to continue the conversation.`,
      });
    } else {
      if (!message || typeof message !== "string") {
        return new Response(JSON.stringify({ error: "message is required for continue" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (Array.isArray(conversationHistory)) {
        for (const m of conversationHistory) {
          if (!m?.role || !m?.content) continue;
          if (m.role !== "user" && m.role !== "assistant") continue;
          messages.push({ role: m.role, content: String(m.content) });
        }
      }

      messages.push({ role: "user", content: message });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
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

      return new Response(
        JSON.stringify({ error: `AI API error: ${response.status}`, details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim?.() || "";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in conversation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
