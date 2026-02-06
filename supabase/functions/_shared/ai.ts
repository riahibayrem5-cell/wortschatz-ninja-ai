// Shared AI utilities for all edge functions
// Centralizes model configuration, usage tracking, and quota enforcement

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Default model - upgraded to latest gemini-3-flash-preview
export const DEFAULT_AI_MODEL = "google/gemini-3-flash-preview";

// AI Gateway URL
export const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface AIRequestOptions {
  model?: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface UsageResult {
  allowed: boolean;
  tier: string;
  current_usage: number;
  max_requests: number | null;
  remaining: number | null;
  message?: string;
}

/**
 * Track AI usage and check if user is within quota
 * Returns usage info and whether the request is allowed
 */
export async function trackAIUsage(userId: string): Promise<UsageResult> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials for usage tracking");
    // Allow request but log error - fail open for better UX
    return {
      allowed: true,
      tier: "unknown",
      current_usage: 0,
      max_requests: null,
      remaining: null,
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  try {
    const { data, error } = await supabase.rpc('track_ai_usage', { p_user_id: userId });
    
    if (error) {
      console.error("Error tracking AI usage:", error);
      // Fail open - allow request on error
      return {
        allowed: true,
        tier: "unknown",
        current_usage: 0,
        max_requests: null,
        remaining: null,
      };
    }

    return data as UsageResult;
  } catch (err) {
    console.error("Exception tracking AI usage:", err);
    return {
      allowed: true,
      tier: "unknown",
      current_usage: 0,
      max_requests: null,
      remaining: null,
    };
  }
}

/**
 * Get current AI usage stats without incrementing
 */
export async function getAIUsageStats(userId: string): Promise<UsageResult> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      allowed: true,
      tier: "unknown",
      current_usage: 0,
      max_requests: null,
      remaining: null,
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  try {
    const { data, error } = await supabase.rpc('get_ai_usage_stats', { p_user_id: userId });
    
    if (error) {
      console.error("Error getting AI usage stats:", error);
      return {
        allowed: true,
        tier: "unknown",
        current_usage: 0,
        max_requests: null,
        remaining: null,
      };
    }

    return { ...data, allowed: true } as UsageResult;
  } catch (err) {
    console.error("Exception getting AI usage stats:", err);
    return {
      allowed: true,
      tier: "unknown",
      current_usage: 0,
      max_requests: null,
      remaining: null,
    };
  }
}

/**
 * Make an AI request with automatic usage tracking
 * Returns the Response object from the AI gateway
 */
export async function makeAIRequest(
  userId: string,
  options: AIRequestOptions,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    return new Response(
      JSON.stringify({ error: "AI service not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Track usage and check quota
  const usage = await trackAIUsage(userId);
  
  if (!usage.allowed) {
    return new Response(
      JSON.stringify({ 
        error: usage.message || "Daily AI request limit reached",
        code: "QUOTA_EXCEEDED",
        usage: {
          current: usage.current_usage,
          max: usage.max_requests,
          tier: usage.tier
        }
      }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Make the AI request with upgraded model
  const response = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_AI_MODEL,
      messages: options.messages,
      stream: options.stream || false,
      ...(options.temperature !== undefined && { temperature: options.temperature }),
      ...(options.max_tokens !== undefined && { max_tokens: options.max_tokens }),
    }),
  });

  // Handle gateway errors
  if (!response.ok) {
    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later.", code: "RATE_LIMITED" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits depleted. Please add credits to continue.", code: "PAYMENT_REQUIRED" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    return new Response(
      JSON.stringify({ error: `AI gateway error: ${response.status}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Return the response (could be streaming or not)
  if (options.stream) {
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  }

  return response;
}

/**
 * Create a quota exceeded response
 */
export function quotaExceededResponse(usage: UsageResult, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({
      error: "Daily AI request limit reached. Upgrade your plan for more requests.",
      code: "QUOTA_EXCEEDED",
      usage: {
        current: usage.current_usage,
        max: usage.max_requests,
        tier: usage.tier
      }
    }),
    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
