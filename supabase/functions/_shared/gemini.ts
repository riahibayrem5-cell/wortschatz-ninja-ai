// Server-only Gemini transport. Keep OpenAI-compatible responses for existing callers.
export const DEFAULT_AI_MODEL = "gemini-3-flash-preview";
const GEMINI_CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

export class GeminiError extends Error {
  constructor(message: string, public status: number, public code: string) {
    super(message);
    this.name = "GeminiError";
  }
}

export function providerError(status: number): GeminiError {
  if (status === 429) return new GeminiError("Google Gemini quota or rate limit reached. Check your Google AI plan or try again later.", status, "RATE_LIMITED");
  if (status === 401 || status === 403) return new GeminiError("Google Gemini rejected the saved API key. Check its permissions and restrictions.", status, "PROVIDER_AUTH_ERROR");
  if (status === 402) return new GeminiError("Google Gemini billing needs attention. Check your Google AI account.", status, "PAYMENT_REQUIRED");
  if (status === 404) return new GeminiError("The configured Gemini model is unavailable for this Google AI account.", status, "MODEL_UNAVAILABLE");
  return new GeminiError("Google Gemini could not complete this request. Please try again.", status >= 400 ? status : 502, "PROVIDER_ERROR");
}

export async function geminiFetch(init: RequestInit): Promise<Response> {
  const key = Deno.env.get("GOOGLE_GEMINI_API_KEY");
  if (!key) throw new GeminiError("Google Gemini is not configured.", 503, "PROVIDER_NOT_CONFIGURED");
  const body = JSON.parse(String(init.body ?? "{}"));
  // Model names in the app used the gateway's names, not Google's model IDs.
  body.model = DEFAULT_AI_MODEL;
  const headers = new Headers({ "Content-Type": "application/json", Authorization: `Bearer ${key}` });
  let response: Response;
  try {
    response = await fetch(GEMINI_CHAT_URL, { ...init, headers, body: JSON.stringify(body) });
  } catch {
    throw new GeminiError("Google Gemini is temporarily unreachable. Please try again.", 503, "PROVIDER_UNAVAILABLE");
  }
  if (!response.ok) {
    // Never propagate raw provider responses: they can include credentials or input.
    await response.body?.cancel();
    throw providerError(response.status);
  }
  return response;
}

export function geminiErrorResponse(error: unknown, corsHeaders: Record<string, string>): Response | null {
  if (!(error instanceof GeminiError)) return null;
  return new Response(JSON.stringify({ error: error.message, code: error.code }), {
    status: error.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}