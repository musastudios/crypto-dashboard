-- Create public.users table as a view of next_auth.users
CREATE OR REPLACE VIEW public.users AS
SELECT * FROM next_auth.users;

-- Grant necessary permissions
GRANT SELECT ON public.users TO anon, authenticated, service_role; 