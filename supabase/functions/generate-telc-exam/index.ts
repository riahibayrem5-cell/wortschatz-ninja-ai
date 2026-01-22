import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─────────────────────────────────────────────────────────────
// STRICT TELC B2 Exam Specifications per Teil
// ─────────────────────────────────────────────────────────────
const TELC_SPECS = {
  reading: {
    1: {
      title: "Globalverstehen",
      questionCount: 5,
      optionType: "heading_match", // text A-E matched with 6 headings
      pointsPerQuestion: 5,
      maxPoints: 25,
      optionLabels: ["Überschrift 1", "Überschrift 2", "Überschrift 3", "Überschrift 4", "Überschrift 5", "Überschrift 6"],
      instructions: "Ordnen Sie jedem Text (A–E) eine passende Überschrift zu. Es gibt eine Überschrift zu viel.",
    },
    2: {
      title: "Detailverstehen",
      questionCount: 10,
      optionType: "richtig_falsch_steht_nicht",
      pointsPerQuestion: 2.5,
      maxPoints: 25,
      optionLabels: ["richtig", "falsch", "steht nicht im Text"],
      instructions: "Lesen Sie den Text und entscheiden Sie, ob die Aussagen richtig, falsch sind, oder ob die Information nicht im Text steht.",
    },
    3: {
      title: "Selektives Verstehen",
      questionCount: 10,
      optionType: "ad_match", // situations 1-10 matched with ads A-L
      pointsPerQuestion: 2.5,
      maxPoints: 25,
      optionLabels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
      instructions: "Lesen Sie die Situationen 1–10 und die Anzeigen A–L. Wählen Sie die passende Anzeige für jede Situation.",
    },
  },
  sprachbausteine: {
    1: {
      title: "Grammatik im Kontext",
      questionCount: 10,
      optionType: "abc",
      pointsPerQuestion: 1.5,
      maxPoints: 15,
      optionLabels: ["a", "b", "c"],
      instructions: "Lesen Sie den folgenden Text und wählen Sie für jede Lücke die richtige Lösung (a, b oder c).",
    },
    2: {
      title: "Wortschatz & Struktur",
      questionCount: 10,
      optionType: "abc",
      pointsPerQuestion: 1.5,
      maxPoints: 15,
      optionLabels: ["a", "b", "c"],
      instructions: "Lesen Sie den folgenden Text und wählen Sie für jede Lücke die richtige Lösung (a, b oder c).",
    },
  },
  listening: {
    1: {
      title: "Teil 1",
      questionCount: 5,
      optionType: "multiple_choice",
      pointsPerQuestion: 5,
      maxPoints: 25,
      optionLabels: null, // 4 options generated per question
      instructions: "Sie hören ein Gespräch. Lesen Sie zuerst die Aufgaben. Hören Sie dann den Text zweimal und lösen Sie die Aufgaben.",
    },
    2: {
      title: "Teil 2",
      questionCount: 10,
      optionType: "richtig_falsch",
      pointsPerQuestion: 2.5,
      maxPoints: 25,
      optionLabels: ["richtig", "falsch"],
      instructions: "Sie hören ein Interview. Lesen Sie zuerst die Aufgaben. Hören Sie dann den Text einmal und entscheiden Sie: richtig oder falsch?",
    },
    3: {
      title: "Teil 3",
      questionCount: 5,
      optionType: "multiple_choice",
      pointsPerQuestion: 5,
      maxPoints: 25,
      optionLabels: null, // 3 options generated per question
      instructions: "Sie hören fünf kurze Texte. Lösen Sie die Aufgaben. Hören Sie jeden Text einmal.",
    },
  },
  writing: {
    1: {
      title: "Brief/E-Mail",
      questionCount: 0,
      optionType: "free_text",
      pointsPerQuestion: 0,
      maxPoints: 45,
      optionLabels: null,
      instructions: "Schreiben Sie einen halbformellen oder formellen Brief/E-Mail mit ca. 150 Wörtern.",
    },
  },
  speaking: {
    1: {
      title: "Präsentation",
      questionCount: 0,
      optionType: "speaking",
      pointsPerQuestion: 0,
      maxPoints: 25,
      optionLabels: null,
      instructions: "Wählen Sie ein Thema und halten Sie eine Präsentation von ca. 3–4 Minuten.",
    },
    2: {
      title: "Diskussion",
      questionCount: 0,
      optionType: "speaking",
      pointsPerQuestion: 0,
      maxPoints: 25,
      optionLabels: null,
      instructions: "Diskutieren Sie mit Ihrem Partner/Ihrer Partnerin über ein vorgegebenes Thema.",
    },
    3: {
      title: "Problemlösung",
      questionCount: 0,
      optionType: "speaking",
      pointsPerQuestion: 0,
      maxPoints: 25,
      optionLabels: null,
      instructions: "Lösen Sie gemeinsam mit Ihrem Partner/Ihrer Partnerin eine vorgegebene Aufgabe.",
    },
  },
};

function buildPrompt(section: string, teil: number) {
  const specs = TELC_SPECS[section as keyof typeof TELC_SPECS];
  if (!specs) return null;
  
  const teilSpec = specs[teil as keyof typeof specs];
  if (!teilSpec) return null;

  const baseInstructions = `You are creating ORIGINAL practice content that EXACTLY matches the TELC Deutsch B2 exam format.
CRITICAL: Do NOT copy any real TELC exam content. Generate completely new, original content.

SECTION: ${section.toUpperCase()} - Teil ${teil}
Title: ${teilSpec.title}
Instructions: ${teilSpec.instructions}
Question count: ${teilSpec.questionCount}
Points per question: ${teilSpec.pointsPerQuestion}
Max points: ${teilSpec.maxPoints}
`;

  let contentInstructions = "";
  let jsonSchema = "";

  switch (section) {
    case "reading":
      if (teil === 1) {
        contentInstructions = `
Generate 5 short texts (A-E) about B2-level topics like work, education, health, environment, technology, society.
Each text should be 60-90 words, distinct in topic.
Generate 6 headings (one extra doesn't match any text).
Each question asks "Welche Überschrift passt zu Text X?"
correctAnswer must be the full heading text that matches.`;
        jsonSchema = `{
  "title": "Leseverstehen",
  "instructions": "${teilSpec.instructions}",
  "timeLimit": 30,
  "maxPoints": ${teilSpec.maxPoints},
  "teile": [{
    "teilNumber": ${teil},
    "title": "${teilSpec.title}",
    "instructions": "${teilSpec.instructions}",
    "maxPoints": ${teilSpec.maxPoints},
    "pointsPerQuestion": ${teilSpec.pointsPerQuestion},
    "text": "Text A: [60-90 words]\\n\\nText B: [60-90 words]\\n\\nText C: [60-90 words]\\n\\nText D: [60-90 words]\\n\\nText E: [60-90 words]\\n\\nÜberschriften:\\n1. [heading]\\n2. [heading]\\n3. [heading]\\n4. [heading]\\n5. [heading]\\n6. [heading - extra]",
    "questions": [
      {"id": 1, "question": "Welche Überschrift passt zu Text A?", "options": ["heading1", "heading2", "heading3", "heading4", "heading5", "heading6"], "correctAnswer": "matching heading text", "explanation": "..."},
      ... (5 questions total, one per text)
    ]
  }]
}`;
      } else if (teil === 2) {
        contentInstructions = `
Generate 1 longer text (350-450 words) on a B2-level topic.
Generate exactly 10 statements about the text.
Options MUST ALWAYS be exactly: ["richtig", "falsch", "steht nicht im Text"]
correctAnswer must be EXACTLY one of these three strings.`;
        jsonSchema = `{
  "title": "Leseverstehen",
  "instructions": "${teilSpec.instructions}",
  "timeLimit": 35,
  "maxPoints": ${teilSpec.maxPoints},
  "teile": [{
    "teilNumber": ${teil},
    "title": "${teilSpec.title}",
    "instructions": "${teilSpec.instructions}",
    "maxPoints": ${teilSpec.maxPoints},
    "pointsPerQuestion": ${teilSpec.pointsPerQuestion},
    "text": "[350-450 word text]",
    "questions": [
      {"id": 1, "question": "Statement about the text", "options": ["richtig", "falsch", "steht nicht im Text"], "correctAnswer": "richtig|falsch|steht nicht im Text", "explanation": "..."},
      ... (10 questions total)
    ]
  }]
}`;
      } else if (teil === 3) {
        contentInstructions = `
Generate 12 short ads/notices (A-L), each 30-50 words.
Generate 10 situations describing what someone is looking for.
Options MUST be: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
correctAnswer must be exactly one letter from A-L.`;
        jsonSchema = `{
  "title": "Leseverstehen",
  "instructions": "${teilSpec.instructions}",
  "timeLimit": 25,
  "maxPoints": ${teilSpec.maxPoints},
  "teile": [{
    "teilNumber": ${teil},
    "title": "${teilSpec.title}",
    "instructions": "${teilSpec.instructions}",
    "maxPoints": ${teilSpec.maxPoints},
    "pointsPerQuestion": ${teilSpec.pointsPerQuestion},
    "text": "Anzeige A: [30-50 words]\\nAnzeige B: [30-50 words]\\n... (A through L)",
    "questions": [
      {"id": 1, "question": "Situation 1: Someone looking for...", "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"], "correctAnswer": "A|B|C|...|L", "explanation": "..."},
      ... (10 questions total)
    ]
  }]
}`;
      }
      break;

    case "sprachbausteine":
      contentInstructions = `
Generate a coherent text (200-250 words) with exactly 10 gaps numbered [1]-[10].
Each gap has 3 options (a, b, c) focusing on: prepositions, verb forms, conjunctions, articles, pronouns, collocations.
Options must be realistic alternatives where only one is grammatically/semantically correct.
correctAnswer must be EXACTLY the correct option text (not the letter).`;
      jsonSchema = `{
  "title": "Sprachbausteine",
  "instructions": "${teilSpec.instructions}",
  "timeLimit": 15,
  "maxPoints": ${teilSpec.maxPoints},
  "teile": [{
    "teilNumber": ${teil},
    "title": "${teilSpec.title}",
    "instructions": "${teilSpec.instructions}",
    "maxPoints": ${teilSpec.maxPoints},
    "pointsPerQuestion": ${teilSpec.pointsPerQuestion},
    "text": "Text with [1], [2], ... [10] gaps",
    "questions": [
      {"id": 1, "question": "Lücke 1", "options": ["option a", "option b", "option c"], "correctAnswer": "correct option text", "explanation": "..."},
      ... (10 questions)
    ]
  }]
}`;
      break;

    case "listening":
      if (teil === 1) {
        contentInstructions = `
Generate a radio interview/conversation transcript (200-260 words).
Generate 5 multiple-choice questions with 4 options each.
Questions test understanding of main ideas, opinions, reasons.
correctAnswer must be EXACTLY one of the option texts.`;
        jsonSchema = `{
  "title": "Hörverstehen",
  "instructions": "${teilSpec.instructions}",
  "timeLimit": 7,
  "maxPoints": ${teilSpec.maxPoints},
  "teile": [{
    "teilNumber": ${teil},
    "title": "${teilSpec.title}",
    "instructions": "${teilSpec.instructions}",
    "maxPoints": ${teilSpec.maxPoints},
    "pointsPerQuestion": ${teilSpec.pointsPerQuestion},
    "text": "[transcript 200-260 words - natural spoken German]",
    "questions": [
      {"id": 1, "question": "Was sagt...?", "options": ["option1", "option2", "option3", "option4"], "correctAnswer": "correct option", "explanation": "..."},
      ... (5 questions)
    ]
  }]
}`;
      } else if (teil === 2) {
        contentInstructions = `
Generate a longer interview transcript (280-360 words).
Generate exactly 10 statements.
Options MUST ALWAYS be exactly: ["richtig", "falsch"]
correctAnswer must be EXACTLY "richtig" or "falsch".`;
        jsonSchema = `{
  "title": "Hörverstehen",
  "instructions": "${teilSpec.instructions}",
  "timeLimit": 8,
  "maxPoints": ${teilSpec.maxPoints},
  "teile": [{
    "teilNumber": ${teil},
    "title": "${teilSpec.title}",
    "instructions": "${teilSpec.instructions}",
    "maxPoints": ${teilSpec.maxPoints},
    "pointsPerQuestion": ${teilSpec.pointsPerQuestion},
    "text": "[transcript 280-360 words]",
    "questions": [
      {"id": 1, "question": "Statement", "options": ["richtig", "falsch"], "correctAnswer": "richtig|falsch", "explanation": "..."},
      ... (10 questions)
    ]
  }]
}`;
      } else if (teil === 3) {
        contentInstructions = `
Generate 5 short announcements/messages (each 30-60 words).
Generate 5 multiple-choice questions (1 per message), 3 options each.
Topics: train announcements, voicemails, radio notices, etc.
correctAnswer must be EXACTLY one of the option texts.`;
        jsonSchema = `{
  "title": "Hörverstehen",
  "instructions": "${teilSpec.instructions}",
  "timeLimit": 5,
  "maxPoints": ${teilSpec.maxPoints},
  "teile": [{
    "teilNumber": ${teil},
    "title": "${teilSpec.title}",
    "instructions": "${teilSpec.instructions}",
    "maxPoints": ${teilSpec.maxPoints},
    "pointsPerQuestion": ${teilSpec.pointsPerQuestion},
    "text": "Nachricht 1: [30-60 words]\\nNachricht 2: [30-60 words]\\nNachricht 3: [30-60 words]\\nNachricht 4: [30-60 words]\\nNachricht 5: [30-60 words]",
    "questions": [
      {"id": 1, "question": "Was wird gesagt?", "options": ["option1", "option2", "option3"], "correctAnswer": "correct option", "explanation": "..."},
      ... (5 questions)
    ]
  }]
}`;
      }
      break;

    case "writing":
      contentInstructions = `
Generate a realistic semi-formal/formal writing task.
Include a scenario (e.g., complaint, request, application, recommendation).
Provide exactly 4 bullet points the learner must address.
Topics: work, services, education, everyday situations.`;
      jsonSchema = `{
  "title": "Schriftlicher Ausdruck",
  "instructions": "${teilSpec.instructions}",
  "timeLimit": 30,
  "maxPoints": ${teilSpec.maxPoints},
  "teile": [{
    "teilNumber": 1,
    "title": "${teilSpec.title}",
    "instructions": "${teilSpec.instructions}",
    "maxPoints": ${teilSpec.maxPoints},
    "task": "Sie haben [scenario]...\\n\\nSchreiben Sie einen Brief/eine E-Mail.\\n• Punkt 1\\n• Punkt 2\\n• Punkt 3\\n• Punkt 4",
    "wordCount": 150
  }]
}`;
      break;

    case "speaking":
      if (teil === 1) {
        contentInstructions = `
Generate 2 presentation topics (Thema A and Thema B) - learner chooses one.
Each topic should be a B2-level discussion topic (work-life balance, technology, education, environment, health).
Include 4-5 guiding points to structure the presentation.`;
      } else if (teil === 2) {
        contentInstructions = `
Generate a discussion scenario with two different positions.
Include 3-4 arguments for each side.
Topic should encourage debate (advantages/disadvantages of something).`;
      } else if (teil === 3) {
        contentInstructions = `
Generate a problem-solving scenario.
Include a situation description and 4 specific points to discuss/decide.
E.g., planning an event, solving a conflict, making a decision.`;
      }
      jsonSchema = `{
  "title": "Mündlicher Ausdruck",
  "instructions": "${teilSpec.instructions}",
  "timeLimit": 5,
  "maxPoints": ${teilSpec.maxPoints},
  "teile": [{
    "teilNumber": ${teil},
    "title": "${teilSpec.title}",
    "instructions": "${teilSpec.instructions}",
    "maxPoints": ${teilSpec.maxPoints},
    "task": "[Task description with structure points]",
    "wordCount": 0
  }]
}`;
      break;
  }

  return `${baseInstructions}
${contentInstructions}

CRITICAL RULES:
1. correctAnswer MUST be EXACTLY one of the options strings (not an index number)
2. Generate EXACTLY ${teilSpec.questionCount} questions (unless it's writing/speaking)
3. Use authentic B2-level German language
4. All content must be original - never copy real exam content
5. Output valid JSON only - no markdown code blocks

JSON SCHEMA:
${jsonSchema}`;
}

// ─────────────────────────────────────────────────────────────
// Validation & Auto-Fix Functions
// ─────────────────────────────────────────────────────────────
function validateAndFixContent(content: any, section: string, teil: number): any {
  const specs = TELC_SPECS[section as keyof typeof TELC_SPECS];
  if (!specs) return content;
  
  const teilSpec = specs[teil as keyof typeof specs];
  if (!teilSpec || !content.teile?.[0]) return content;

  const teilData = content.teile[0];
  const questions = teilData.questions || [];

  // Fix question count
  const expectedCount = teilSpec.questionCount;
  if (questions.length !== expectedCount && expectedCount > 0) {
    console.log(`Fixing question count: got ${questions.length}, expected ${expectedCount}`);
    // Trim or pad questions
    if (questions.length > expectedCount) {
      teilData.questions = questions.slice(0, expectedCount);
    }
  }

  // Fix options based on optionType
  if (teilSpec.optionLabels && questions.length > 0) {
    teilData.questions = questions.map((q: any, idx: number) => {
      // Ensure correct options
      if (teilSpec.optionType === "richtig_falsch_steht_nicht") {
        q.options = ["richtig", "falsch", "steht nicht im Text"];
        // Fix correctAnswer if it's not one of the valid options
        if (!q.options.includes(q.correctAnswer)) {
          // Try to match by similarity
          const lowerAnswer = String(q.correctAnswer).toLowerCase().trim();
          if (lowerAnswer.includes("richtig") && !lowerAnswer.includes("falsch")) {
            q.correctAnswer = "richtig";
          } else if (lowerAnswer.includes("falsch")) {
            q.correctAnswer = "falsch";
          } else {
            q.correctAnswer = "steht nicht im Text";
          }
        }
      } else if (teilSpec.optionType === "richtig_falsch") {
        q.options = ["richtig", "falsch"];
        if (!q.options.includes(q.correctAnswer)) {
          const lowerAnswer = String(q.correctAnswer).toLowerCase().trim();
          q.correctAnswer = lowerAnswer.includes("richtig") ? "richtig" : "falsch";
        }
      } else if (teilSpec.optionType === "ad_match") {
        q.options = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
        // Ensure correctAnswer is a valid letter
        const validLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
        if (!validLetters.includes(q.correctAnswer)) {
          // Extract letter from answer if possible
          const match = String(q.correctAnswer).match(/[A-L]/i);
          q.correctAnswer = match ? match[0].toUpperCase() : validLetters[idx % 12];
        }
      } else if (teilSpec.optionType === "abc") {
        // Ensure 3 options
        if (q.options?.length !== 3) {
          q.options = q.options?.slice(0, 3) || ["a", "b", "c"];
        }
        // Ensure correctAnswer is one of the options
        if (!q.options.includes(q.correctAnswer)) {
          // Default to first option if invalid
          q.correctAnswer = q.options[0];
        }
      }

      // Ensure correctAnswer is in options for MC questions
      if (q.options && !q.options.includes(q.correctAnswer)) {
        // Try to find closest match
        const matchingOption = q.options.find((opt: string) => 
          String(opt).toLowerCase() === String(q.correctAnswer).toLowerCase()
        );
        if (matchingOption) {
          q.correctAnswer = matchingOption;
        }
      }

      // Ensure explanation exists
      if (!q.explanation) {
        q.explanation = "Siehe Text für Erklärung.";
      }

      return q;
    });
  }

  // Ensure metadata
  teilData.maxPoints = teilSpec.maxPoints;
  teilData.pointsPerQuestion = teilSpec.pointsPerQuestion;
  teilData.teilNumber = teil;

  return content;
}

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

    const { section, difficulty = "b2", teil } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate teil
    const parsedTeil = typeof teil === "number" ? teil : 1;
    
    const prompt = buildPrompt(section, parsedTeil);
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Invalid section or teil" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating TELC exam: section=${section}, difficulty=${difficulty}, teil=${parsedTeil}`);

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
            content: "You are an expert TELC Deutsch B2 exam content generator. Output ONLY valid JSON. Never include markdown code fences, explanatory text, or anything other than the JSON object.",
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
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue.", code: "PAYMENT_REQUIRED" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content;

    if (!contentText) {
      throw new Error("No content received from AI");
    }

    // Parse JSON from the response
    let content;
    try {
      const trimmed = String(contentText).trim();
      // Handle potential markdown code blocks
      const jsonMatch =
        trimmed.match(/```json\n?([\s\S]*?)\n?```/) ||
        trimmed.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch?.[1] ?? trimmed;
      content = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", contentText);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate and fix the content
    const validatedContent = validateAndFixContent(content, section, parsedTeil);
    
    console.log(`Generated content validated: ${validatedContent.teile?.[0]?.questions?.length || 0} questions`);

    return new Response(JSON.stringify(validatedContent), {
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
