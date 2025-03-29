-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID REFERENCES auth.users(id) PRIMARY KEY,
    "email" TEXT UNIQUE,
    "name" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now()
);

-- Create user sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" UUID PRIMARY KEY,
    "user_id" UUID REFERENCES "users"(id) ON DELETE CASCADE,
    "expires" TIMESTAMPTZ NOT NULL,
    "session_token" TEXT UNIQUE NOT NULL
);

-- Create accounts table for OAuth providers
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" UUID PRIMARY KEY,
    "user_id" UUID REFERENCES "users"(id) ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" BIGINT,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    UNIQUE("provider", "provider_account_id")
);

-- Create verification tokens table
CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMPTZ NOT NULL,
    UNIQUE("identifier", "token")
);

-- Modify existing tables to include user_id

-- Add user_id to trading_pairs table
ALTER TABLE "trading_pairs" 
ADD COLUMN IF NOT EXISTS "user_id" UUID REFERENCES "users"(id);

-- Add user_id to transactions table
ALTER TABLE "transactions" 
ADD COLUMN IF NOT EXISTS "user_id" UUID REFERENCES "users"(id);

-- Add user_id to price_history table
ALTER TABLE "price_history" 
ADD COLUMN IF NOT EXISTS "user_id" UUID REFERENCES "users"(id);

-- Create RLS (Row Level Security) policies

-- Enable RLS on tables
ALTER TABLE "trading_pairs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "price_history" ENABLE ROW LEVEL SECURITY;

-- Create policies for trading_pairs
CREATE POLICY "Users can view their own trading pairs" 
ON "trading_pairs" FOR SELECT USING (
    auth.uid() = user_id OR user_id IS NULL
);

CREATE POLICY "Users can insert their own trading pairs" 
ON "trading_pairs" FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Users can update their own trading pairs" 
ON "trading_pairs" FOR UPDATE USING (
    auth.uid() = user_id
);

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON "transactions" FOR SELECT USING (
    auth.uid() = user_id OR user_id IS NULL
);

CREATE POLICY "Users can insert their own transactions" 
ON "transactions" FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

-- Create policies for price_history
CREATE POLICY "Users can view their own price history" 
ON "price_history" FOR SELECT USING (
    auth.uid() = user_id OR user_id IS NULL
);

CREATE POLICY "Users can insert their own price history" 
ON "price_history" FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 