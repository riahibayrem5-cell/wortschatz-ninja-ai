-- Delete duplicate user_learning_paths entries, keeping only the most recent one
DELETE FROM public.user_learning_paths a
USING public.user_learning_paths b
WHERE a.user_id = b.user_id 
  AND a.id < b.id;

-- Now add the unique constraint
ALTER TABLE public.user_learning_paths 
ADD CONSTRAINT user_learning_paths_user_id_key UNIQUE (user_id);