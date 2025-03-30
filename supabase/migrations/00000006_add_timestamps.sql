-- Add timestamp columns to next_auth.users table
ALTER TABLE next_auth.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE next_auth.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Recreate the public.users view to include all columns
DROP VIEW IF EXISTS public.users;
CREATE VIEW public.users AS 
SELECT id, name, email, "emailVerified", image, avatar_url, created_at, updated_at
FROM next_auth.users;

-- Grant necessary permissions
GRANT SELECT ON public.users TO anon, authenticated, service_role; 