import { supabase } from "@/integrations/supabase/client";

// ==========================================
// ADVANCED CACHING SYSTEM
// Multi-layer caching: Memory -> IndexedDB -> Supabase
// ==========================================

const CACHE_VERSION = 1;
const DB_NAME = 'fluentpass-cache';
const AUDIO_STORE = 'audio-cache';
const CONTENT_STORE = 'content-cache';
const MAX_MEMORY_ITEMS = 100;
const MAX_AUDIO_SIZE_MB = 5;

// In-memory cache for fastest access
const memoryCache = new Map<string, { data: any; timestamp: number; hits: number }>();

// ==========================================
// IndexedDB Setup
// ==========================================

let dbPromise: Promise<IDBDatabase> | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, CACHE_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Audio cache store
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        const audioStore = db.createObjectStore(AUDIO_STORE, { keyPath: 'key' });
        audioStore.createIndex('timestamp', 'timestamp', { unique: false });
        audioStore.createIndex('userId', 'userId', { unique: false });
      }

      // Content cache store
      if (!db.objectStoreNames.contains(CONTENT_STORE)) {
        const contentStore = db.createObjectStore(CONTENT_STORE, { keyPath: 'key' });
        contentStore.createIndex('timestamp', 'timestamp', { unique: false });
        contentStore.createIndex('type', 'type', { unique: false });
        contentStore.createIndex('userId', 'userId', { unique: false });
      }
    };
  });

  return dbPromise;
};

// ==========================================
// Cache Key Generation
// ==========================================

export const generateCacheKey = (params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      const value = params[key];
      // Normalize values for consistent keys
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = typeof value === 'string' ? value.toLowerCase().trim() : value;
      }
      return acc;
    }, {} as Record<string, any>);
  
  // Create a hash-like key
  const jsonStr = JSON.stringify(sortedParams);
  let hash = 0;
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `cache_${Math.abs(hash).toString(36)}_${btoa(jsonStr).slice(0, 20)}`;
};

// ==========================================
// Audio Cache Functions
// ==========================================

export interface AudioCacheEntry {
  key: string;
  userId: string;
  audioData: string; // base64
  text: string;
  language: string;
  voice: string;
  timestamp: number;
  storageUrl?: string;
}

export const cacheAudio = async (
  text: string,
  language: string,
  voice: string,
  audioBase64: string,
  userId: string
): Promise<{ key: string; url?: string }> => {
  const key = generateCacheKey({ text: text.slice(0, 100), language, voice, type: 'audio' });
  
  try {
    // 1. Store in memory for instant access
    memoryCache.set(key, {
      data: { audioBase64, text, language, voice },
      timestamp: Date.now(),
      hits: 1
    });
    
    // Trim memory cache if too large
    if (memoryCache.size > MAX_MEMORY_ITEMS) {
      const entries = Array.from(memoryCache.entries());
      entries.sort((a, b) => a[1].hits - b[1].hits);
      entries.slice(0, 20).forEach(([k]) => memoryCache.delete(k));
    }

    // 2. Store in IndexedDB for offline/fast access
    const db = await openDatabase();
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    const store = tx.objectStore(AUDIO_STORE);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({
        key,
        userId,
        audioData: audioBase64,
        text: text.slice(0, 500), // Store truncated text for reference
        language,
        voice,
        timestamp: Date.now()
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    // 3. Upload to Supabase Storage for persistence (background)
    let storageUrl: string | undefined;

    // Only upload to storage if audio is not too large
    const audioSizeBytes = (audioBase64.length * 3) / 4;
    if (audioSizeBytes < MAX_AUDIO_SIZE_MB * 1024 * 1024) {
      try {
        // Detect format (Gemini TTS returns WAV; legacy providers might be MP3)
        const isWav = audioBase64.startsWith('UklGR');
        const contentType = isWav ? 'audio/wav' : 'audio/mpeg';
        const ext = isWav ? 'wav' : 'mp3';

        const blob = base64ToBlob(audioBase64, contentType);
        const filePath = `${userId}/${key}.${ext}`;

        const { data, error } = await supabase.storage
          .from('audio-cache')
          .upload(filePath, blob, {
            contentType,
            upsert: true
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('audio-cache')
            .getPublicUrl(filePath);
          storageUrl = urlData.publicUrl;
        }
      } catch (e) {
        console.log('Storage upload skipped:', e);
      }
    }

    // 4. Update content_cache table with reference
    await supabase.from('content_cache').upsert({
      user_id: userId,
      cache_key: key,
      content_type: 'audio',
      content_data: { text: text.slice(0, 200), language, voice },
      audio_url: storageUrl,
      accessed_at: new Date().toISOString()
    }, { onConflict: 'cache_key,user_id' });

    return { key, url: storageUrl };
  } catch (error) {
    console.error('Error caching audio:', error);
    return { key };
  }
};

export const getCachedAudio = async (
  text: string,
  language: string,
  voice: string
): Promise<string | null> => {
  const key = generateCacheKey({ text: text.slice(0, 100), language, voice, type: 'audio' });

  try {
    // 1. Check memory cache first (fastest)
    const memoryEntry = memoryCache.get(key);
    if (memoryEntry) {
      memoryEntry.hits++;
      memoryEntry.timestamp = Date.now();
      console.log('Audio cache hit: memory');
      return memoryEntry.data.audioBase64;
    }

    // 2. Check IndexedDB (fast, offline-capable)
    try {
      const db = await openDatabase();
      const tx = db.transaction(AUDIO_STORE, 'readonly');
      const store = tx.objectStore(AUDIO_STORE);
      
      const entry = await new Promise<AudioCacheEntry | undefined>((resolve, reject) => {
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      if (entry?.audioData) {
        // Restore to memory cache
        memoryCache.set(key, {
          data: { audioBase64: entry.audioData, text, language, voice },
          timestamp: Date.now(),
          hits: 1
        });
        console.log('Audio cache hit: IndexedDB');
        return entry.audioData;
      }
    } catch (e) {
      console.log('IndexedDB not available:', e);
    }

    // 3. Check Supabase Storage (slowest but persistent)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const candidates = [`${user.id}/${key}.wav`, `${user.id}/${key}.mp3`];

      for (const filePath of candidates) {
        const { data } = await supabase.storage
          .from('audio-cache')
          .download(filePath);

        if (data) {
          const base64 = await blobToBase64(data);

          // Restore to memory and IndexedDB
          memoryCache.set(key, {
            data: { audioBase64: base64, text, language, voice },
            timestamp: Date.now(),
            hits: 1
          });

          console.log('Audio cache hit: Supabase Storage');
          return base64;
        }
      }
    }

    console.log('Audio cache miss');
    return null;
  } catch (error) {
    console.error('Error getting cached audio:', error);
    return null;
  }
};

// ==========================================
// Content Cache Functions
// ==========================================

export interface ContentCacheOptions {
  type: string;
  difficulty?: string;
  topic?: string;
  ttlMinutes?: number; // Time to live
}

export const cacheContent = async <T>(
  key: string,
  data: T,
  options: ContentCacheOptions
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const cacheKey = generateCacheKey({ key, ...options });
    const timestamp = Date.now();

    // 1. Memory cache
    memoryCache.set(cacheKey, { data, timestamp, hits: 1 });

    // 2. IndexedDB
    try {
      const db = await openDatabase();
      const tx = db.transaction(CONTENT_STORE, 'readwrite');
      const store = tx.objectStore(CONTENT_STORE);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          key: cacheKey,
          userId: user.id,
          data,
          type: options.type,
          difficulty: options.difficulty,
          topic: options.topic,
          timestamp,
          ttl: options.ttlMinutes ? options.ttlMinutes * 60 * 1000 : null
        });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (e) {
      console.log('IndexedDB store failed:', e);
    }

    // 3. Supabase (background with proper error handling)
    supabase.from('content_cache').upsert({
      user_id: user.id,
      cache_key: cacheKey,
      content_type: options.type,
      content_data: data as any,
      difficulty: options.difficulty,
      topic: options.topic,
      accessed_at: new Date().toISOString()
    } as any, { onConflict: 'cache_key,user_id' }).then(({ error }) => {
      if (error) {
        console.warn('Background cache sync failed:', error.message);
      }
    });

    return true;
  } catch (error) {
    console.error('Error caching content:', error);
    return false;
  }
};

export const getCachedContent = async <T>(
  key: string,
  options: ContentCacheOptions
): Promise<T | null> => {
  try {
    const cacheKey = generateCacheKey({ key, ...options });
    const now = Date.now();

    // 1. Check memory
    const memoryEntry = memoryCache.get(cacheKey);
    if (memoryEntry) {
      // Check TTL
      if (options.ttlMinutes) {
        const ttlMs = options.ttlMinutes * 60 * 1000;
        if (now - memoryEntry.timestamp > ttlMs) {
          memoryCache.delete(cacheKey);
        } else {
          memoryEntry.hits++;
          console.log('Content cache hit: memory');
          return memoryEntry.data as T;
        }
      } else {
        memoryEntry.hits++;
        return memoryEntry.data as T;
      }
    }

    // 2. Check IndexedDB
    try {
      const db = await openDatabase();
      const tx = db.transaction(CONTENT_STORE, 'readonly');
      const store = tx.objectStore(CONTENT_STORE);
      
      const entry = await new Promise<any>((resolve, reject) => {
        const request = store.get(cacheKey);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      if (entry?.data) {
        // Check TTL
        if (entry.ttl && now - entry.timestamp > entry.ttl) {
          // Expired, delete it
          const deleteTx = db.transaction(CONTENT_STORE, 'readwrite');
          deleteTx.objectStore(CONTENT_STORE).delete(cacheKey);
        } else {
          // Restore to memory
          memoryCache.set(cacheKey, { data: entry.data, timestamp: now, hits: 1 });
          console.log('Content cache hit: IndexedDB');
          return entry.data as T;
        }
      }
    } catch (e) {
      console.log('IndexedDB read failed:', e);
    }

    // 3. Check Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('content_cache')
        .select('content_data, accessed_at')
        .eq('cache_key', cacheKey)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        // Check TTL against accessed_at
        if (options.ttlMinutes) {
          const accessedAt = new Date(data.accessed_at).getTime();
          const ttlMs = options.ttlMinutes * 60 * 1000;
          if (now - accessedAt > ttlMs) {
            return null; // Expired
          }
        }

        // Update access time and restore to caches
        supabase.from('content_cache')
          .update({ accessed_at: new Date().toISOString() })
          .eq('cache_key', cacheKey)
          .eq('user_id', user.id)
          .then(() => {});

        memoryCache.set(cacheKey, { 
          data: data.content_data, 
          timestamp: now, 
          hits: 1 
        });
        
        console.log('Content cache hit: Supabase');
        return data.content_data as T;
      }
    }

    console.log('Content cache miss');
    return null;
  } catch (error) {
    console.error('Error getting cached content:', error);
    return null;
  }
};

// ==========================================
// Cache Management
// ==========================================

export const clearAllCaches = async (): Promise<void> => {
  // Clear memory
  memoryCache.clear();

  // Clear IndexedDB
  try {
    const db = await openDatabase();
    const audioTx = db.transaction(AUDIO_STORE, 'readwrite');
    audioTx.objectStore(AUDIO_STORE).clear();
    
    const contentTx = db.transaction(CONTENT_STORE, 'readwrite');
    contentTx.objectStore(CONTENT_STORE).clear();
  } catch (e) {
    console.log('IndexedDB clear failed:', e);
  }

  // Clear Supabase caches
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('content_cache').delete().eq('user_id', user.id);
    
    // List and delete storage files
    const { data: files } = await supabase.storage
      .from('audio-cache')
      .list(user.id);
    
    if (files?.length) {
      const filePaths = files.map(f => `${user.id}/${f.name}`);
      await supabase.storage.from('audio-cache').remove(filePaths);
    }
  }
};

export const getCacheStatistics = async (): Promise<{
  memoryItems: number;
  indexedDbItems: { audio: number; content: number };
  supabaseItems: number;
  storageUsedMb: number;
}> => {
  let indexedDbAudio = 0;
  let indexedDbContent = 0;

  try {
    const db = await openDatabase();
    
    const audioTx = db.transaction(AUDIO_STORE, 'readonly');
    indexedDbAudio = await new Promise((resolve) => {
      const request = audioTx.objectStore(AUDIO_STORE).count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });

    const contentTx = db.transaction(CONTENT_STORE, 'readonly');
    indexedDbContent = await new Promise((resolve) => {
      const request = contentTx.objectStore(CONTENT_STORE).count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });
  } catch (e) {
    console.log('IndexedDB stats failed:', e);
  }

  let supabaseItems = 0;
  let storageUsedMb = 0;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { count } = await supabase
      .from('content_cache')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    supabaseItems = count || 0;

    const { data: files } = await supabase.storage
      .from('audio-cache')
      .list(user.id);
    
    if (files) {
      storageUsedMb = files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0) / (1024 * 1024);
    }
  }

  return {
    memoryItems: memoryCache.size,
    indexedDbItems: { audio: indexedDbAudio, content: indexedDbContent },
    supabaseItems,
    storageUsedMb: Math.round(storageUsedMb * 100) / 100
  };
};

// ==========================================
// Utility Functions
// ==========================================

const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data URL prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// ==========================================
// Prefetch Functions
// ==========================================

export const prefetchAudio = async (
  texts: string[],
  language: string = 'de',
  voice: string = 'default'
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  for (const text of texts.slice(0, 10)) { // Limit to 10 items
    const cached = await getCachedAudio(text, language, voice);
    if (!cached) {
      try {
        const { data } = await supabase.functions.invoke('gemini-tts', {
          body: { text, language, voice }
        });

        if (data?.audioContent) {
          await cacheAudio(text, language, voice, data.audioContent, user.id);
        }
      } catch (e) {
        console.log('Prefetch failed for:', text.slice(0, 30));
      }
      
      // Small delay between requests
      await new Promise(r => setTimeout(r, 200));
    }
  }
};
