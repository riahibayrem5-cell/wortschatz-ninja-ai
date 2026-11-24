import { afterEach, describe, expect, test } from "bun:test";
import { geminiFetch, geminiErrorResponse, providerError } from "./gemini.ts";

const originalFetch = globalThis.fetch;
const originalDeno = Reflect.get(globalThis, "Deno");
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalDeno) Reflect.set(globalThis, "Deno", originalDeno);
  else Reflect.deleteProperty(globalThis, "Deno");
});

function mockKey(present = true) {
  Reflect.set(globalThis, "Deno", { env: { get: (name: string) => name === "GOOGLE_GEMINI_API_KEY" && present ? "test-only-not-a-real-key" : undefined } });
}

describe("direct Gemini transport", () => {
  test("uses Google directly with the saved secret name and preserves request options", async () => {
    mockKey();
    let endpoint = "";
    let payload: Record<string, unknown> = {};
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      endpoint = url;
      payload = JSON.parse(String(init.body));
      return Response.json({ choices: [{ message: { content: '{"german":"Guten Tag"}' } }] });
    }) as typeof fetch;
    const response = await geminiFetch({ method: "POST", body: JSON.stringify({
      messages: [{ role: "user", content: "Generate a German greeting as JSON." }],
      max_tokens: 300, temperature: 0.7, response_format: { type: "json_object" },
    }) });
    expect(endpoint).toBe("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions");
    expect(payload.model).toBe("gemini-3-flash-preview");
    expect(payload.max_tokens).toBe(300);
    expect(payload.temperature).toBe(0.7);
    expect(payload.response_format).toEqual({ type: "json_object" });
    expect((await response.json()).choices[0].message.content).toBe('{"german":"Guten Tag"}');
  });

  test("preserves SSE streaming instead of buffering the tutor answer", async () => {
    mockKey();
    const stream = new Response('data: {"choices":[{"delta":{"content":"Hallo"}}]}\n\ndata: [DONE]\n\n', { headers: { "Content-Type": "text/event-stream" } });
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      expect(JSON.parse(String(init.body)).stream).toBe(true);
      return stream;
    }) as typeof fetch;
    const response = await geminiFetch({ method: "POST", body: JSON.stringify({ stream: true, messages: [] }) });
    expect(response).toBe(stream);
    expect(await response.text()).toContain('"content":"Hallo"');
  });

  test("preserves structured lesson schemas", async () => {
    mockKey();
    const format = { type: "json_schema", json_schema: { name: "lesson", strict: true, schema: { type: "object", properties: { overview: { type: "string" } }, required: ["overview"], additionalProperties: false } } };
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      expect(JSON.parse(String(init.body)).response_format).toEqual(format);
      return Response.json({ choices: [] });
    }) as typeof fetch;
    await geminiFetch({ method: "POST", body: JSON.stringify({ response_format: format, messages: [] }) });
  });

  for (const [status, code] of [[429, "RATE_LIMITED"], [403, "PROVIDER_AUTH_ERROR"], [402, "PAYMENT_REQUIRED"]] as const) {
    test(`preserves provider status ${status} without exposing raw error details`, async () => {
      mockKey();
      globalThis.fetch = (async () => new Response("private provider details", { status })) as typeof fetch;
      try {
        await geminiFetch({ body: "{}" });
        throw new Error("Expected provider failure");
      } catch (error) {
        const response = geminiErrorResponse(error, { "Access-Control-Allow-Origin": "*" });
        expect(response?.status).toBe(status);
        expect(response?.headers.get("Access-Control-Allow-Origin")).toBe("*");
        const body = await response?.json();
        expect(body.code).toBe(code);
        expect(JSON.stringify(body)).not.toContain("private provider details");
      }
    });
  }

  test("missing key fails clearly without calling any provider", async () => {
    mockKey(false);
    let calls = 0;
    globalThis.fetch = (async () => { calls++; return Response.json({}); }) as typeof fetch;
    await expect(geminiFetch({ body: "{}" })).rejects.toMatchObject({ status: 503, code: "PROVIDER_NOT_CONFIGURED" });
    expect(calls).toBe(0);
  });

  test("ordinary errors are not mislabeled as provider failures", () => {
    expect(geminiErrorResponse(new Error("parse error"), {})).toBeNull();
    expect(providerError(404).code).toBe("MODEL_UNAVAILABLE");
  });
});