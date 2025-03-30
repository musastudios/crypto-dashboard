# NextAuth OAuth Troubleshooting Guide

## Error: "Error processing sign in. Please try again."

This is a generic error that can have multiple causes. Follow these steps to troubleshoot:

### 1. Check Server Logs

Review your terminal where the Next.js server is running. Look for specific error messages, especially:
- OAuth callback errors
- JWT errors
- Database connection issues
- Adapter-related errors

### 2. Verify Environment Variables

Ensure all variables in `.env.local` are correctly formatted:

```bash
# Remove any quotes around values
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# OAuth Provider Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
```

### 3. Verify OAuth Provider Configuration

#### Google Cloud Console:
1. Go to https://console.cloud.google.com/apis/credentials
2. Check your OAuth 2.0 Client ID
3. Verify Authorized redirect URIs include:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - Your production URL if applicable

#### Twitter Developer Portal:
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Check your project's OAuth settings
3. Ensure callback URLs include:
   - `http://localhost:3000/api/auth/callback/twitter` (for development)
   - Your production URL if applicable
4. Verify you've selected the OAuth 2.0 Type

### 4. Supabase Configuration

1. Verify the `next_auth` schema exists in your Supabase database
2. Confirm the schema is exposed in Project Settings > API > Settings
3. Check that tables have been created in the `next_auth` schema
4. Verify service role key has permissions to create tables and records

### 5. JWT Configuration

1. Ensure `SUPABASE_JWT_SECRET` matches exactly what's in Supabase settings
2. Check JWT encoding/decoding in your NextAuth configuration
3. Review if JWT format matches what Supabase expects

### 6. Network & Browser Issues

1. Clear browser cookies and localStorage for your domain
2. Try an incognito/private browser window
3. Check for CORS issues or network errors in browser DevTools

### 7. Common Fixes

1. **JWT Secret Format**: Ensure `SUPABASE_JWT_SECRET` is in the correct format (may need to be base64 decoded)
2. **Service Role Key**: Verify the `SUPABASE_SERVICE_ROLE_KEY` has full database access
3. **Schema Issues**: Confirm the migration was applied correctly and schema is exposed
4. **Redirect URIs**: Double-check for exact matches between provider settings and your app

### 8. Testing Authentication Flow

Try this minimum test to isolate the issue:

1. Clear your browser cookies
2. Navigate to `/api/auth/signin` directly
3. Click on a provider (e.g., Google)
4. Watch server logs during the entire process
5. Note any errors during redirect back to your app

Report specific error messages or failed steps for more targeted help. 