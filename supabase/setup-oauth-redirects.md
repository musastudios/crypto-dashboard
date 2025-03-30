# Setting Up OAuth Redirects for Supabase Auth

To get social login working properly with Supabase Auth, you need to configure the OAuth redirect URLs in both the Supabase dashboard and the OAuth provider dashboards (Google, Twitter).

## Supabase Configuration

1. **Log into your Supabase dashboard**
2. **Go to Authentication > Providers**
3. **For each provider (Google, Twitter):**
   - Enable the provider
   - Add your Client ID and Client Secret
   - Make sure "Redirect URL" is set to the default Supabase auth callback

## OAuth Provider Configuration

### Google

1. **Go to Google Cloud Console**: https://console.cloud.google.com/apis/credentials
2. **Find your OAuth 2.0 Client ID**
3. **Edit the "Authorized redirect URIs" to include:**
   - Development: `https://[your-project].supabase.co/auth/v1/callback`
   - Production: `https://[your-production-domain]/auth/v1/callback`

### Twitter

1. **Go to Twitter Developer Portal**: https://developer.twitter.com/en/portal/dashboard
2. **Find your project/app**
3. **Go to Settings > Authentication settings**
4. **Add Callback URLs:**
   - Development: `https://[your-project].supabase.co/auth/v1/callback`
   - Production: `https://[your-production-domain]/auth/v1/callback`

## Application Routes

In your Next.js application, ensure you have these routes implemented:

- `/app/auth/callback/route.ts` - Handles the OAuth exchange code flow
- `/app/auth/signin/page.tsx` - Shows the sign-in UI
- `/components/auth-provider.tsx` - Provides authentication context

## Testing

1. Clear all browser cookies for your local domain
2. Start your development server
3. Visit `/auth/signin`
4. Click one of the social login buttons
5. You should be redirected to the provider, and then back to your app

## Troubleshooting

If you're experiencing issues:

1. Check browser developer console for errors
2. Verify the Supabase project URL in your environment variables
3. Ensure callback URLs are correctly configured in both Supabase and OAuth providers
4. Confirm your OAuth provider credentials are valid and have the necessary permissions 