-- Fix column names to match NextAuth.js expectations

-- Check if email_verified column exists and rename it to emailVerified
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE public.users RENAME COLUMN email_verified TO "emailVerified";
    ELSIF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'emailVerified'
    ) THEN
        -- Add the column if it doesn't exist at all
        ALTER TABLE public.users ADD COLUMN "emailVerified" TIMESTAMPTZ;
    END IF;
END
$$; 