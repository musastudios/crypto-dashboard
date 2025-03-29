# Supabase Auth Integration

This document provides instructions for setting up and using Supabase Authentication in the Crypto Dashboard application.

## Overview

The application now uses Supabase Authentication for user management, providing:

- Google OAuth integration
- Twitter OAuth integration
- Session management
- Secure user authentication
- User profile data synchronization

## Prerequisites

1. A Supabase account and project (free tier works fine)
2. Google Developer OAuth credentials
3. Twitter Developer OAuth credentials

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# Supabase connection details
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Twitter OAuth credentials  
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

### 2. Supabase Configuration

1. **Create a Table**:
   - In your Supabase dashboard, create a new table named `users` with the following schema:

   ```sql
   CREATE TABLE public.users (
     id UUID PRIMARY KEY REFERENCES auth.users(id),
     email TEXT NOT NULL,
     name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
   );
   ```

2. **Set Up Trigger**:
   - Create a trigger to synchronize Supabase Auth users with your application users table:

   ```sql
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

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

3. **Configure OAuth Providers**:
   - In Supabase dashboard, go to Authentication > Providers
   - Enable Google OAuth provider:
     - Add your Google Client ID and Client Secret
     - Set redirect URL to `http://localhost:3000/auth/callback` (for local development)
   - Enable Twitter OAuth provider:
     - Add your Twitter API Key and API Secret
     - Set redirect URL to `http://localhost:3000/auth/callback` (for local development)

### 3. OAuth Provider Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use an existing one
3. Navigate to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID
5. Add the following authorized redirect URIs:
   - `https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`

#### Twitter OAuth

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new application
3. Set the callback URLs to:
   - `https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`
4. Get your API Key and API Secret from the application settings

### 4. Running the Setup Script

For convenience, we've created a setup script that helps configure everything:

```bash
# Make the script executable (if needed)
chmod +x setup-supabase-auth.sh

# Run the script
./setup-supabase-auth.sh
```

The script will:
- Check for required environment variables
- Help set up database triggers
- Configure OAuth providers
- Restart the development server

## Usage

The authentication system provides several components:

- `AuthProvider`: Context provider for authentication state
- `AuthGuard`: Component to protect routes that require authentication
- `ProtectedRoute`: Component to wrap pages that should only be accessible to authenticated users
- `UserProfile`: Component to display user information and authentication state

### Signing In

Users can sign in using the Google or Twitter buttons provided in the UI. The authentication flow is as follows:

1. User clicks the sign-in button
2. They're redirected to the OAuth provider
3. After authenticating, they're redirected back to the application
4. The Supabase Auth middleware handles the callback and creates a session
5. User is redirected to the dashboard or intended destination

### Signing Out

Users can sign out by clicking their profile picture and selecting "Sign out" from the dropdown menu.

## Troubleshooting

If you encounter issues:

1. **Check Environment Variables**: Ensure all required variables are set correctly
2. **Clear Browser Cookies**: Authentication issues can often be resolved by clearing cookies for localhost
3. **Check Supabase Dashboard**: Look for any authentication errors in the Supabase dashboard
4. **Check Redirect URIs**: Make sure the redirect URIs are correctly set in both Supabase and OAuth providers
5. **Check Console Logs**: The application logs authentication events and errors to the console

## Development Notes

- The authentication state is managed through the `AuthProvider` component
- The Supabase middleware refreshes sessions automatically
- Protected routes redirect unauthenticated users to the sign-in page
- User metadata from OAuth providers is stored in Supabase Auth and synced to the application database 