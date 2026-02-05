-- Move extensions to dedicated schema to fix the security warning
-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema to public for function access
GRANT USAGE ON SCHEMA extensions TO PUBLIC;
GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;

-- Note: Moving existing extensions requires dropping and recreating them
-- which could cause temporary downtime. The uuid-ossp extension is commonly in public.
-- For now we'll set the default for new extensions and leave existing ones