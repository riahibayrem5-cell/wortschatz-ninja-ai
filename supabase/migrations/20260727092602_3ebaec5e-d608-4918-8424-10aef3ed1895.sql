-- 1. Restrict public read policies on catalog tables to authenticated users only
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('achievements','subscription_tiers','stripe_product_mappings')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', p.policyname, p.tablename);
  END LOOP;
END $$;

REVOKE SELECT ON public.achievements FROM anon;
REVOKE SELECT ON public.subscription_tiers FROM anon;
REVOKE SELECT ON public.stripe_product_mappings FROM anon;

GRANT SELECT ON public.achievements TO authenticated;
GRANT SELECT ON public.subscription_tiers TO authenticated;
GRANT SELECT ON public.stripe_product_mappings TO authenticated;
GRANT ALL ON public.achievements TO service_role;
GRANT ALL ON public.subscription_tiers TO service_role;
GRANT ALL ON public.stripe_product_mappings TO service_role;

CREATE POLICY "Authenticated users can read achievements"
  ON public.achievements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read subscription tiers"
  ON public.subscription_tiers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read stripe product mappings"
  ON public.stripe_product_mappings FOR SELECT TO authenticated USING (true);

-- 2. Move pg_net out of the public schema (pg_net doesn't support SET SCHEMA, so recreate)
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION pg_net WITH SCHEMA extensions;