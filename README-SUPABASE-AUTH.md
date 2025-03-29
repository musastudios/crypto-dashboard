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

Create a `.env.local` file in the root of your project (for local development) and set up environment variables in your deployment platform (like Vercel) for production.

**Required Variables:**

```bash
# Supabase connection details
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application URL (Crucial for OAuth redirects)
# Development: http://localhost:3000
# Production: https://your-production-domain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000 

# Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Twitter OAuth credentials  
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

See `.env.example` and `.env.production` for templates.

### 2. Supabase Configuration

1. **Database Setup**: 
   - Ensure the `users` table and related triggers/functions are created. You can run the SQL script located at `supabase/migrations/00000001_setup_auth.sql` using the Supabase SQL Editor or the provided `apply-migrations.sh` script (requires `psql` and database password environment variable `SUPABASE_DB_PASSWORD`).

2. **Auth Providers**: 
   - Go to Authentication > Providers in your Supabase dashboard.
   - Enable Google and Twitter.
   - Enter the Client ID and Client Secret for each.
   - **Crucially**, add the following URL to the "Redirect URIs" (or similar field) for **both** Google and Twitter providers in Supabase:
     ```
     https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
     ```
     Replace `[YOUR_SUPABASE_PROJECT_REF]` with your actual Supabase project reference ID.

3. **URL Configuration**: 
   - Go to Authentication > URL Configuration.
   - Set your **Site URL** to your application's base URL (`NEXT_PUBLIC_APP_URL`). 
     - For local development: `http://localhost:3000`
     - For production: `https://your-production-domain.com`
   - Add your application's callback URL to the **Redirect URLs** list:
     - For local development: `http://localhost:3000/auth/callback`
     - For production: `https://your-production-domain.com/auth/callback`

### 3. OAuth Provider Setup (External)

**Important:** The redirect URIs configured here must *exactly* match the ones used by Supabase and your application.

#### Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials.
2. Select your OAuth 2.0 Client ID.
3. Under "Authorized redirect URIs", add **both** of the following:
   ```
   https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback  # For local development
   https://your-production-domain.com/auth/callback # For production
   ```

#### Twitter Developer Portal

1. Go to [Twitter Developer Portal](https://developer.twitter.com/) > Your Project > Your App.
2. Under Authentication settings:
   - Enable 3-legged OAuth.
   - Add **all** of the following callback URLs:
     ```
     https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback # For local development
     https://your-production-domain.com/auth/callback # For production
     ```
   - Ensure your Website URL is set (e.g., to your production domain).

### 4. Running the Setup Script (Optional for Local)

The `setup-supabase-auth.sh` script can help check local environment variables and guide through some Supabase setup steps (but doesn't configure external providers).

```bash
./setup-supabase-auth.sh
```

## Usage

The authentication system provides several components:

- `AuthProvider`: Context provider for authentication state
- `AuthGuard`: Component to protect routes that require authentication (consider renaming to avoid confusion with `ProtectedRoute`)
- `ProtectedRoute`: Component to wrap pages that should only be accessible to authenticated users
- `UserProfile`: Component to display user information and authentication state

### Signing In

Users click the Google or Twitter buttons. The flow:

1. User clicks sign-in.
2. Redirected to OAuth provider.
3. After authenticating, redirected back to Supabase (`/auth/v1/callback`).
4. Supabase verifies and redirects to your application's callback (`/auth/callback`).
5. The `app/auth/callback/route.ts` handler exchanges the code for a session.
6. User is redirected to the dashboard or intended destination (`next` parameter).

### Signing Out

Users click the sign-out option in the `UserProfile` dropdown.

## Troubleshooting

1. **`redirect_uri_mismatch`**: Double-check ALL redirect URIs in:
   - Supabase Auth Provider settings
   - Supabase URL Configuration
   - Google Cloud Console
   - Twitter Developer Portal
   - Ensure `NEXT_PUBLIC_APP_URL` is correct for the environment.
2. **Check Environment Variables**: Ensure Vercel (production) and `.env.local` (local) have the correct Supabase and OAuth keys, and the correct `NEXT_PUBLIC_APP_URL`.
3. **Clear Browser Cookies**: Essential after configuration changes.
4. **Check Supabase Logs**: Authentication > Logs in the Supabase dashboard.
5. **Check Application Logs**: Vercel logs (production) or browser console/terminal (local).
6. **Supabase URL Configuration**: Verify the Site URL and Redirect URLs in Supabase Auth settings.

## Development Notes

- The `AuthStatusDebug` component (visible in development) helps monitor auth state.
- Middleware (`middleware.ts`) refreshes sessions.
- `app/auth/callback/route.ts` handles the final step of the OAuth flow. 