-- supabase/migrations/00000002_add_user_preferences.sql

-- Add a preferences column to the users table managed by the NextAuth adapter
-- Use JSONB for flexibility in storing various settings
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS preferences JSONB;

-- Optional: Set a default value if needed, e.g., an empty object
-- ALTER TABLE public.users
-- ALTER COLUMN preferences SET DEFAULT '{}'::jsonb;

-- Optional: Add Row Level Security (RLS) if not already implicitly covered
-- Check existing policies first. If users can already update their own row,
-- this might not be strictly necessary, but it's good practice to be explicit.
-- Ensure RLS is enabled: ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Policy to allow users to update their own preferences:
CREATE POLICY "Users can update their own preferences"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to read their own preferences (often covered by a general select policy)
CREATE POLICY "Users can read their own preferences"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id); 