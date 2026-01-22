import { supabase } from "@/integrations/supabase/client";

// Audio cache with content-based keys to minimize API costs
// Stores audio Base64 directly in content_cache table

const AUDIO_CACHE_TYPE = 'audio_tts';

// Generate a unique cache key for audio based on text content
export const generateAudioCacheKey = (text: string, language: string = 'de', voice: string = 'default'): string => {
  // Create a hash-like key from the first 100 chars + text length for uniqueness
  const textSample = text.substring(0, 100).replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_');
  const params = { text: textSample, len: text.length, lang: language, voice };
  return btoa(JSON.stringify(params));
};

// Get cached audio
export const getCachedAudio = async (text: string, language: string = 'de', voice: string = 'default'): Promise<string | null> => {
  try {
    const cacheKey = generateAudioCacheKey(text, language, voice);
    
    const { data, error } = await supabase
      .from('content_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .eq('content_type', AUDIO_CACHE_TYPE)
      .single();

    if (error || !data) return null;

    // Update access count for cache analytics
    await supabase
      .from('content_cache')
      .update({
        accessed_at: new Date().toISOString(),
        access_count: (data.access_count || 0) + 1
      })
      .eq('id', data.id);

    // Return the audio URL stored in audio_url field or from content_data
    return data.audio_url || (data.content_data as any)?.audioContent || null;
  } catch (error) {
    console.error('Error getting cached audio:', error);
    return null;
  }
};

// Store audio in cache
export const setCachedAudio = async (
  text: string,
  audioBase64: string,
  mimeType: string = 'audio/wav',
  language: string = 'de',
  voice: string = 'default'
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const cacheKey = generateAudioCacheKey(text, language, voice);
    const audioUrl = `data:${mimeType};base64,${audioBase64}`;

    const { error } = await supabase
      .from('content_cache')
      .upsert({
        user_id: user.id,
        cache_key: cacheKey,
        content_type: AUDIO_CACHE_TYPE,
        content_data: { 
          textPreview: text.substring(0, 100),
          textLength: text.length,
          mimeType, 
          language, 
          voice,
          generatedAt: new Date().toISOString()
        },
        audio_url: audioUrl,
        accessed_at: new Date().toISOString(),
        access_count: 1
      }, {
        onConflict: 'cache_key,user_id'
      });

    if (error) throw error;
    console.log('Audio cached successfully for text length:', text.length);
    return true;
  } catch (error) {
    console.error('Error caching audio:', error);
    return false;
  }
};

// Get audio with automatic caching - generates if not cached
export const getOrGenerateAudio = async (
  text: string,
  language: string = 'de',
  voice: string = 'default'
): Promise<{ audioUrl: string | null; fromCache: boolean }> => {
  // Try cache first
  const cached = await getCachedAudio(text, language, voice);
  if (cached) {
    console.log('Audio retrieved from cache');
    return { audioUrl: cached, fromCache: true };
  }

  // Generate new audio
  try {
    const { data, error } = await supabase.functions.invoke('gemini-tts', {
      body: { text, language, voice }
    });

    if (error) throw error;
    if (!data?.audioContent) return { audioUrl: null, fromCache: false };

    const mime = data.mimeType || 'audio/wav';
    const audioUrl = `data:${mime};base64,${data.audioContent}`;

    // Cache the generated audio in background
    setCachedAudio(text, data.audioContent, mime, language, voice);

    return { audioUrl, fromCache: false };
  } catch (error) {
    console.error('Error generating audio:', error);
    return { audioUrl: null, fromCache: false };
  }
};

// Get audio cache statistics
export const getAudioCacheStats = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('content_cache')
      .select('access_count, created_at')
      .eq('user_id', user.id)
      .eq('content_type', AUDIO_CACHE_TYPE);

    if (error) throw error;

    const totalCached = data?.length || 0;
    const totalAccesses = data?.reduce((sum, item) => sum + (item.access_count || 0), 0) || 0;
    const savedCalls = totalAccesses - totalCached; // Each access after first is a saved API call

    return {
      totalCached,
      totalAccesses,
      savedApiCalls: Math.max(0, savedCalls),
      estimatedSavingsPercent: totalAccesses > 0 ? Math.round((savedCalls / totalAccesses) * 100) : 0
    };
  } catch (error) {
    console.error('Error fetching audio cache stats:', error);
    return null;
  }
};

// Clear old audio cache entries (older than 30 days)
export const clearOldAudioCache = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
      .from('content_cache')
      .delete()
      .eq('user_id', user.id)
      .eq('content_type', AUDIO_CACHE_TYPE)
      .lt('accessed_at', thirtyDaysAgo.toISOString());

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing old audio cache:', error);
    return false;
  }
};
