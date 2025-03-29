-- Create users table that extends the auth.users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own data
CREATE POLICY "Users can view their own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create a trigger to automatically sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to handle user metadata updates
CREATE OR REPLACE FUNCTION public.handle_user_update() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    name = new.raw_user_meta_data->>'name',
    avatar_url = new.raw_user_meta_data->>'avatar_url',
    updated_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create the trigger for updates
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION public.handle_user_update();

-- Create a function for users to update their profiles
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_name text,
  user_avatar_url text
) RETURNS json AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Update the user's profile in public.users
  UPDATE public.users
  SET 
    name = user_name,
    avatar_url = user_avatar_url,
    updated_at = now()
  WHERE id = current_user_id;
  
  -- Update the user's metadata in auth.users
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'name', user_name,
    'avatar_url', user_avatar_url
  ) || (raw_user_meta_data - 'name' - 'avatar_url')
  WHERE id = current_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Profile updated successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the update_user_profile function
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated; 