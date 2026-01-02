import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  cacheContent,
  getCachedContent,
  cacheAudio,
  getCachedAudio,
  getCacheStatistics,
  prefetchAudio,
  ContentCacheOptions
} from '@/utils/advancedCache';

// ==========================================
// Content Cache Hook
// ==========================================

interface UseCachedContentOptions<T> extends ContentCacheOptions {
  key: string;
  fetcher: () => Promise<T>;
  enabled?: boolean;
  onSuccess?: (data: T, fromCache: boolean) => void;
  onError?: (error: Error) => void;
}

export function useCachedContent<T>({
  key,
  type,
  difficulty,
  topic,
  ttlMinutes,
  fetcher,
  enabled = true,
  onSuccess,
  onError
}: UseCachedContentOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  const fetch = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Try cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await getCachedContent<T>(key, { type, difficulty, topic, ttlMinutes });
        if (cached) {
          setData(cached);
          setIsFromCache(true);
          setIsLoading(false);
          onSuccess?.(cached, true);
          return cached;
        }
      }

      // Fetch fresh data
      const freshData = await fetcher();
      setData(freshData);
      setIsFromCache(false);
      
      // Cache the result
      await cacheContent(key, freshData, { type, difficulty, topic, ttlMinutes });
      
      onSuccess?.(freshData, false);
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [key, type, difficulty, topic, ttlMinutes, fetcher, enabled, onSuccess, onError]);

  const refresh = useCallback(() => fetch(true), [fetch]);

  useEffect(() => {
    if (enabled && !fetchedRef.current) {
      fetchedRef.current = true;
      fetch();
    }
  }, [enabled, fetch]);

  return { data, isLoading, isFromCache, error, fetch, refresh };
}

// ==========================================
// Audio Cache Hook
// ==========================================

interface UseAudioCacheOptions {
  language?: 'de' | 'en';
  voice?: 'default' | 'female' | 'male';
  autoPlay?: boolean;
  speed?: number;
}

export function useAudioCache(options: UseAudioCacheOptions = {}) {
  const { language = 'de', voice = 'default', autoPlay = false, speed = 1.0 } = options;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentText(null);
  }, []);

  const play = useCallback(async (text: string): Promise<boolean> => {
    if (!text.trim()) return false;

    // Stop any current playback
    stop();

    setIsLoading(true);
    setCurrentText(text);

    try {
      // Check cache first
      let audioBase64 = await getCachedAudio(text, language, voice);
      let mimeType = audioBase64?.startsWith('UklGR') ? 'audio/wav' : 'audio/mpeg';

      if (audioBase64) {
        setIsFromCache(true);
      } else {
        setIsFromCache(false);

        // Generate new audio
        const { data, error } = await supabase.functions.invoke('gemini-tts', {
          body: { text, language, voice }
        });

        if (error) throw error;
        if (!data?.audioContent) throw new Error('No audio content received');

        audioBase64 = data.audioContent;
        mimeType = data?.mimeType || (audioBase64.startsWith('UklGR') ? 'audio/wav' : 'audio/mpeg');

        // Cache the audio
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await cacheAudio(text, language, voice, audioBase64, user.id);
        }
      }

      // Play the audio
      audioRef.current = new Audio(`data:${mimeType};base64,${audioBase64}`);
      audioRef.current.playbackRate = speed;

      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentText(null);
      };

      audioRef.current.onerror = () => {
        setIsPlaying(false);
        setCurrentText(null);
      };

      await audioRef.current.play();
      setIsPlaying(true);
      return true;
    } catch (err) {
      console.error('Audio playback error:', err);
      setCurrentText(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [language, voice, speed, stop]);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    play,
    pause,
    resume,
    stop,
    isPlaying,
    isLoading,
    isFromCache,
    currentText
  };
}

// ==========================================
// Audio Prefetch Hook
// ==========================================

export function useAudioPrefetch(texts: string[], language: 'de' | 'en' = 'de') {
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [progress, setProgress] = useState(0);
  const prefetchedRef = useRef(false);

  const prefetch = useCallback(async () => {
    if (texts.length === 0 || prefetchedRef.current) return;
    
    prefetchedRef.current = true;
    setIsPrefetching(true);
    setProgress(0);

    const total = Math.min(texts.length, 10);
    let completed = 0;

    for (const text of texts.slice(0, 10)) {
      try {
        const cached = await getCachedAudio(text, language, 'default');
        if (!cached) {
          const { data } = await supabase.functions.invoke('gemini-tts', {
            body: { text, language, voice: 'default' }
          });
          
          if (data?.audioContent) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await cacheAudio(text, language, 'default', data.audioContent, user.id);
            }
          }
        }
      } catch (e) {
        console.log('Prefetch failed:', text.slice(0, 20));
      }
      
      completed++;
      setProgress((completed / total) * 100);
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    }

    setIsPrefetching(false);
  }, [texts, language]);

  return { prefetch, isPrefetching, progress };
}

// ==========================================
// Cache Statistics Hook
// ==========================================

export function useCacheStats() {
  const [stats, setStats] = useState<{
    memoryItems: number;
    indexedDbItems: { audio: number; content: number };
    supabaseItems: number;
    storageUsedMb: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const statistics = await getCacheStatistics();
      setStats(statistics);
    } catch (err) {
      console.error('Failed to get cache stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, isLoading, refresh };
}
