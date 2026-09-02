import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "openai/gpt-5.6-sol";

const strObj = (props: Record<string, unknown>) => ({
  type: "object",
  additionalProperties: false,
  required: Object.keys(props),
  properties: props,
});

const S = { type: "string" };
const SA = { type: "array", items: { type: "string" } };

const LESSON_SCHEMA = strObj({
  hook: S,
  overview: S,
  objectives: SA,
  telc: strObj({
    section: S,
    teil: S,
    task_type: S,
    minutes: { type: "integer" },
    points: { type: "integer" },
    why_it_matters: S,
  }),
  key_terms: {
    type: "array",
    items: strObj({
      german: S,
      article: { type: ["string", "null"] },
      plural: { type: ["string", "null"] },
      english: S,
      example: S,
      example_en: S,
    }),
  },
  sections: {
    type: "array",
    items: strObj({
      heading: S,
      heading_de: S,
      body: S,
      bullets: SA,
      examples: {
        type: "array",
        items: strObj({ de: S, en: S, note: { type: ["string", "null"] } }),
      },
    }),
  },
  grammar_boxes: {
    type: "array",
    items: strObj({
      title: S,
      rule: S,
      examples: { type: "array", items: strObj({ de: S, en: S }) },
      pitfall: S,
    }),
  },
  strategy: { type: "array", items: strObj({ title: S, detail: S }) },
  model_text: {
    type: ["object", "null"],
    additionalProperties: false,
    required: ["title", "text", "translation", "notes"],
    properties: { title: S, text: S, translation: S, notes: SA },
  },
  common_mistakes: { type: "array", items: strObj({ wrong: S, right: S, why: S }) },
  practice: {
    type: "array",
    items: strObj({
      type: { type: "string", enum: ["mcq", "gap", "true_false", "open"] },
      question: S,
      options: SA,
      answer_index: { type: ["integer", "null"] },
      answer: S,
      explanation: S,
    }),
  },
  recap: SA,
  exam_tips: SA,
});

function buildPrompt(lesson: any, module: any) {
  return `Create ONE complete, publication-quality lesson for a paid TELC B2 German exam-preparation course.

COURSE WEEK ${module.week_number}: ${module.title} (${module.title_de})
Module description: ${module.description}
Module skills: ${JSON.stringify(module.skills_focus)}

LESSON ${lesson.lesson_number}: ${lesson.title} (${lesson.title_de})
Lesson type: ${lesson.lesson_type}
Estimated study time: ${lesson.estimated_minutes} minutes
Brief: ${lesson.generation_brief}

QUALITY BAR — this must feel like a professionally published Lehrwerk chapter, not AI filler:
- All German must be natural, idiomatic, orthographically correct (ß/umlauts) and genuinely B2 level.
- Explanations are written in clear English; every German example is followed by an English rendering.
- 5 to 7 substantial "sections": each body is 120-220 words of real teaching, no padding, no repetition of the overview.
- 14 to 20 key_terms: real B2 vocabulary tied to this lesson's topic, with article and plural for every noun (use null for non-nouns), and a full authentic sentence example.
- 2 to 4 grammar_boxes with a precise rule, 3 contrastive examples, and the single most common learner pitfall.
- 4 to 6 strategy steps that are concrete and actionable in the exam room, not generic advice.
- model_text: for reading/listening/writing/speaking/exam lessons supply an authentic 180-300 word German text, transcript, model letter or model answer plus a translation and 3-5 annotation notes. Use null ONLY for pure grammar or vocabulary lessons.
- 5 to 8 common_mistakes contrasting a realistic learner error with the correct form and the reason.
- 10 to 14 practice items mixing mcq, gap, true_false and open. For "mcq" and "true_false" give 2-4 options plus the zero-based answer_index and put the correct option text in "answer". For "gap" and "open" set answer_index to null, use "___" inside the question for gaps, leave options as an empty array, and put the expected answer in "answer". Every item needs a teaching explanation.
- telc: map this lesson to the real TELC B2 exam (Leseverstehen / Hörverstehen / Sprachbausteine / Schriftlicher Ausdruck / Mündlicher Ausdruck), the correct Teil, realistic minutes and the official point value.
- recap: 5-7 memorable takeaways. exam_tips: 5-7 sharp, exam-day specific tips.

Write everything now, fully, with no placeholders.`;
}

async function generateLesson(apiKey: string, lesson: any, module: any) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      instructions:
        "You are a senior German-as-a-foreign-language author and official TELC B2 examiner. You write rigorous, accurate, exam-aligned course material.",
      input: buildPrompt(lesson, module),
      reasoning: { effort: "medium", summary: "auto" },
      text: {
        format: {
          type: "json_schema",
          name: "telc_b2_lesson",
          strict: true,
          schema: LESSON_SCHEMA,
        },
      },
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text();
    const err = new Error(detail.slice(0, 500));
    (err as any).status = res.status;
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload);
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          text += evt.delta;
        } else if (evt.type === "response.completed" && !text) {
          text = evt.response?.output_text ?? "";
        }
      } catch {
        // ignore partial frames
      }
    }
  }

  if (!text.trim()) throw new Error("Model returned no lesson text");
  return JSON.parse(text);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || "Authentication required", corsHeaders);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin access required" }, 403);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured" }, 500);

    const { lessonId, force } = await req.json();
    if (!lessonId) return json({ error: "lessonId is required" }, 400);

    const { data: lesson, error: lessonError } = await admin
      .from("course_lessons")
      .select("*")
      .eq("id", lessonId)
      .single();
    if (lessonError || !lesson) return json({ error: "Lesson not found" }, 404);

    if (lesson.content_version >= 2 && !force) {
      return json({ skipped: true, lessonId, reason: "already_v2" });
    }

    const { data: module } = await admin
      .from("course_modules")
      .select("*")
      .eq("id", lesson.module_id)
      .single();

    const generated = await generateLesson(apiKey, lesson, module);

    const content = {
      version: 2,
      generated_at: new Date().toISOString(),
      lesson_type: lesson.lesson_type,
      detailed_content: true,
      ...generated,
    };

    const { error: updateError } = await admin
      .from("course_lessons")
      .update({
        content,
        content_version: 2,
        content_updated_at: new Date().toISOString(),
        estimated_minutes: generated?.telc?.minutes && generated.telc.minutes > 10
          ? lesson.estimated_minutes
          : lesson.estimated_minutes,
      })
      .eq("id", lessonId);

    if (updateError) throw updateError;

    return json({
      success: true,
      lessonId,
      title: lesson.title,
      sections: generated.sections?.length ?? 0,
      terms: generated.key_terms?.length ?? 0,
      practice: generated.practice?.length ?? 0,
    });
  } catch (error: any) {
    const status = error?.status && error.status >= 400 ? error.status : 500;
    console.error("generate-lesson-content failed", status);
    return json({ error: error?.message ?? "Generation failed" }, status);
  }
});
