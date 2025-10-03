import { supabase } from "@/integrations/supabase/client";

// Generate cache key from input parameters
export const generateCacheKey = (params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});
  return btoa(JSON.stringify(sortedParams));
};

// Get cached content
export const getCachedContent = async (cacheKey: string) => {
  try {
    const { data, error } = await supabase
      .from('content_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .single();

    if (error) throw error;

    // Update access count and timestamp
    if (data) {
      await supabase
        .from('content_cache')
        .update({
          accessed_at: new Date().toISOString(),
          access_count: data.access_count + 1
        })
        .eq('id', data.id);
    }

    return data;
  } catch (error) {
    console.error('Error fetching cached content:', error);
    return null;
  }
};

// Store content in cache
export const setCachedContent = async (
  cacheKey: string,
  contentType: string,
  contentData: any,
  metadata?: {
    difficulty?: string;
    topic?: string;
    audioUrl?: string;
  }
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('content_cache')
      .upsert({
        user_id: user.id,
        cache_key: cacheKey,
        content_type: contentType,
        content_data: contentData,
        difficulty: metadata?.difficulty,
        topic: metadata?.topic,
        audio_url: metadata?.audioUrl,
        accessed_at: new Date().toISOString(),
      }, {
        onConflict: 'cache_key,user_id'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error caching content:', error);
    return false;
  }
};

// Clear old cache entries (older than 30 days)
export const clearOldCache = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
      .from('content_cache')
      .delete()
      .lt('accessed_at', thirtyDaysAgo.toISOString());

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing old cache:', error);
    return false;
  }
};

// Get cache statistics
export const getCacheStats = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('content_cache')
      .select('content_type, access_count')
      .eq('user_id', user.id);

    if (error) throw error;

    const stats = data?.reduce((acc: any, item) => {
      if (!acc[item.content_type]) {
        acc[item.content_type] = { count: 0, totalAccess: 0 };
      }
      acc[item.content_type].count += 1;
      acc[item.content_type].totalAccess += item.access_count;
      return acc;
    }, {});

    return stats;
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return null;
  }
};

// Open a page in a new tab
export const openInNewTab = (path: string) => {
  const baseUrl = window.location.origin;
  window.open(`${baseUrl}${path}`, '_blank', 'noopener,noreferrer');
};