-- Add avatar_url column to next_auth.users table
ALTER TABLE next_auth.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Recreate the public.users view to include the new column
DROP VIEW IF EXISTS public.users;
CREATE VIEW public.users AS 
SELECT id, name, email, "emailVerified", image, avatar_url 
FROM next_auth.users;

-- Grant necessary permissions
GRANT SELECT ON public.users TO anon, authenticated, service_role; 