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

    const { messages, lessonContext, moduleContext, userLevel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert German language tutor specializing in TELC B2 exam preparation. Your name is "FluentPass Tutor".

CURRENT CONTEXT:
- Module: ${moduleContext?.title || 'General TELC B2 Preparation'}
- Lesson: ${lessonContext?.title || 'General Practice'}
- Lesson Type: ${lessonContext?.lesson_type || 'mixed'}
- User Level: ${userLevel || 'B2'}

YOUR ROLE:
1. Help students understand German grammar, vocabulary, and exam strategies
2. Provide clear explanations in English with German examples
3. Give practice exercises when appropriate
4. Correct mistakes gently and explain why
5. Adapt your teaching style based on the lesson type:
   - For 'reading': Focus on text analysis strategies and vocabulary
   - For 'listening': Discuss note-taking and comprehension techniques
   - For 'writing': Help with structure, style, and common phrases
   - For 'speaking': Practice conversation and pronunciation tips
   - For 'grammar': Explain rules clearly with examples
   - For 'vocabulary': Provide context, examples, and mnemonics
   - For 'exam_practice': Share test-taking strategies

GUIDELINES:
- Be encouraging and supportive
- Use examples from real TELC B2 exam scenarios
- When giving German text, always provide translations
- Break down complex concepts into simple steps
- Ask follow-up questions to check understanding
- Celebrate progress and correct answers

Remember: You're helping students pass their TELC B2 exam. Be thorough but keep explanations clear and practical.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error: unknown) {
    console.error("Course AI Tutor error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
