-- Fix foreign key relationship for diagnostics table
-- Change from auth.users to profiles so PostgREST can join properly

-- Drop existing foreign key constraint
ALTER TABLE public.diagnostics
DROP CONSTRAINT IF EXISTS diagnostics_user_id_fkey;

-- Add new foreign key to profiles table
ALTER TABLE public.diagnostics
ADD CONSTRAINT diagnostics_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
