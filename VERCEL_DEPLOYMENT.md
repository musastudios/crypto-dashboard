# Vercel Deployment Instructions

## Environment Variables

Add the following environment variables in the Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://gygqqsteltvimulggcvs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5Z3Fxc3RlbHR2aW11bGdnY3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDU0NjcsImV4cCI6MjA1ODc4MTQ2N30.JwuISrkKT0B_CRljnX_kdGWMygyw1sl6M3aXkzz4CvM
SUPABASE_URL=https://gygqqsteltvimulggcvs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5Z3Fxc3RlbHR2aW11bGdnY3ZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzIwNTQ2NywiZXhwIjoyMDU4NzgxNDY3fQ.qA8m51v0BR1xnJaBo-DCz0X7TQIgeVjg6zlP4icMNiE

# NextAuth.js Configuration
NEXTAUTH_URL=https://crypto-dashboard-olive.vercel.app
NEXTAUTH_SECRET=s9a9bHYnjpV34EmRgPXYMFvM+Vfdw3KfOQJsOgux/Ew=

# Google OAuth
GOOGLE_CLIENT_ID=1023044498320-iqvlovlp7i52hohhtk60p9p278fomoci.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

COINAPI_API_KEY=a175c799-be64-4bad-939a-75c868976754
```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project and go to "APIs & Services" > "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add the following authorized redirect URIs:
   - `https://crypto-dashboard-olive.vercel.app/api/auth/callback/google`
   - `http://localhost:3001/api/auth/callback/google`

## Supabase Schema Setup

Before the first login, you need to set up the Supabase database schema:

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to your project
3. Open the SQL Editor
4. Run the contents of the `fix-supabase-auth.sql` file in your repository

## Deployment

1. Connect your GitHub repository to Vercel
2. Choose the SSO branch for deployment
3. Add all environment variables as mentioned above
4. Deploy the application

## Testing

1. Visit the deployed application
2. Try signing in with Google
3. Check that you are successfully redirected back to the application after authentication 