-- This script fixes the emailVerified column in the users table
-- Run this directly in the Supabase SQL editor

-- First, check if the users table exists in public schema
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        -- Drop and recreate the emailVerified column with proper casing
        BEGIN
            -- Try to drop the column if it exists with any casing
            ALTER TABLE public.users DROP COLUMN IF EXISTS "emailVerified";
            ALTER TABLE public.users DROP COLUMN IF EXISTS "email_verified";
            ALTER TABLE public.users DROP COLUMN IF EXISTS email_verified;
            ALTER TABLE public.users DROP COLUMN IF EXISTS emailverified;
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors if column doesn't exist
        END;

        -- Add the column with proper casing and quotes
        ALTER TABLE public.users ADD COLUMN "emailVerified" TIMESTAMPTZ DEFAULT NULL;
        
        RAISE NOTICE 'Successfully updated the emailVerified column';
    ELSE
        -- Create the users table if it doesn't exist
        CREATE TABLE public.users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            "emailVerified" TIMESTAMPTZ,
            image TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create accounts table if not exists
        CREATE TABLE IF NOT EXISTS public.accounts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            provider TEXT NOT NULL,
            provider_account_id TEXT NOT NULL,
            refresh_token TEXT,
            access_token TEXT,
            expires_at BIGINT,
            token_type TEXT,
            scope TEXT,
            id_token TEXT,
            session_state TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(provider, provider_account_id)
        );
        
        -- Create sessions table if not exists
        CREATE TABLE IF NOT EXISTS public.sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            expires TIMESTAMPTZ NOT NULL,
            session_token TEXT NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create verification tokens table if not exists
        CREATE TABLE IF NOT EXISTS public.verification_tokens (
            identifier TEXT NOT NULL,
            token TEXT NOT NULL,
            expires TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (identifier, token)
        );
        
        RAISE NOTICE 'Created all required tables for NextAuth.js';
    END IF;
END
$$; 