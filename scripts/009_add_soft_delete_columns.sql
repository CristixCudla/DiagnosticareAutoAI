-- Added soft delete columns to all tables
-- Add deleted_at column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_at column to subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_at column to diagnostics
ALTER TABLE public.diagnostics
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_deleted_at ON public.subscriptions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_diagnostics_deleted_at ON public.diagnostics(deleted_at);

-- Update RLS policies to exclude soft-deleted records
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "subscriptions_select_all" ON public.subscriptions;
CREATE POLICY "subscriptions_select_all"
  ON public.subscriptions FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "diagnostics_select_own" ON public.diagnostics;
CREATE POLICY "diagnostics_select_own"
  ON public.diagnostics FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
