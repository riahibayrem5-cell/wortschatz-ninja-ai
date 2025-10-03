import { supabase } from "@/integrations/supabase/client";
import { createHash } from "crypto";

// Generate a cache key from parameters
export const generateCacheKey = (params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);
  
  return btoa(JSON.stringify(sortedParams));
};

// Store content in cache
export const cacheContent = async (
  contentType: string,
  cacheKey: string,
  contentData: any,
  audioUrl?: string,
  difficulty?: string,
  topic?: string
) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from("content_cache")
      .upsert({
        user_id: user.user.id,
        content_type: contentType,
        cache_key: cacheKey,
        content_data: contentData,
        audio_url: audioUrl,
        difficulty,
        topic,
        accessed_at: new Date().toISOString(),
        access_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error caching content:", error);
    return null;
  }
};

// Retrieve content from cache
export const getCachedContent = async (cacheKey: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from("content_cache")
      .select("*")
      .eq("cache_key", cacheKey)
      .eq("user_id", user.user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    // Update access count and time
    if (data) {
      await supabase
        .from("content_cache")
        .update({
          accessed_at: new Date().toISOString(),
          access_count: (data.access_count || 0) + 1,
        })
        .eq("id", data.id);
    }

    return data;
  } catch (error) {
    console.error("Error getting cached content:", error);
    return null;
  }
};

// Clear old cache entries (older than 30 days)
export const clearOldCache = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await supabase
      .from("content_cache")
      .delete()
      .eq("user_id", user.user.id)
      .lt("accessed_at", thirtyDaysAgo.toISOString());
  } catch (error) {
    console.error("Error clearing old cache:", error);
  }
};

// Open section in new tab
export const openInNewTab = (path: string) => {
  const baseUrl = window.location.origin;
  window.open(`${baseUrl}${path}`, '_blank');
};
