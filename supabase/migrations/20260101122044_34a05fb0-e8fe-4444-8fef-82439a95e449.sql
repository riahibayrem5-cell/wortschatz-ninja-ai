-- Create storage bucket for cached audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('audio-cache', 'audio-cache', true, 10485760, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm']);

-- Allow authenticated users to upload their own audio cache
CREATE POLICY "Users can upload own audio cache"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-cache' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view own audio cache
CREATE POLICY "Users can view own audio cache"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-cache' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to audio for playback (since bucket is public)
CREATE POLICY "Public can view audio cache"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-cache');

-- Allow users to delete own audio cache
CREATE POLICY "Users can delete own audio cache"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-cache' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add unique constraint to content_cache for proper upsert
ALTER TABLE content_cache
ADD CONSTRAINT content_cache_key_user_unique UNIQUE (cache_key, user_id);

-- Create index for faster cache lookups
CREATE INDEX IF NOT EXISTS idx_content_cache_lookup 
ON content_cache (user_id, cache_key, content_type);

-- Create index for audio cache by type
CREATE INDEX IF NOT EXISTS idx_content_cache_audio 
ON content_cache (user_id, content_type) 
WHERE audio_url IS NOT NULL;