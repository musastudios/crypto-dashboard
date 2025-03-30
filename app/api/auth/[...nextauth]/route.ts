import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Ensure environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const twitterClientId = process.env.TWITTER_CLIENT_ID;
const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;
const nextauthSecret = process.env.NEXTAUTH_SECRET;

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseJwtSecret || !googleClientId || !googleClientSecret || !twitterClientId || !twitterClientSecret || !nextauthSecret) {
    console.error("Missing required environment variables for NextAuth setup.");
    throw new Error("Missing environment variables for NextAuth");
}

// Initialize Supabase client for the adapter
// Note: The adapter uses the service role key for database operations.
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    TwitterProvider({
      clientId: twitterClientId,
      clientSecret: twitterClientSecret,
      // Twitter OAuth 2.0 requires PKCE which NextAuth handles
      version: '2.0', // Use Twitter OAuth 2.0
    }),
  ],
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceRoleKey, // Service role key for adapter DB operations
  }),
  session: {
    strategy: 'jwt', // Use JWT for session management
  },
  jwt: {
    // Supabase JWT secret for encoding/decoding JWTs
    secret: supabaseJwtSecret,
    // Custom encode/decode to match Supabase expectations if needed
    // Usually the default works if the secret matches
    encode: async ({ secret, token, maxAge }) => {
        // Use the Supabase JWT secret
        const encodedToken = jwt.sign(token!, secret, { algorithm: 'HS256' });
        return encodedToken;
    },
    decode: async ({ secret, token }) => {
        if (!token) {
          return null;
        }
        try {
          // Use the Supabase JWT secret
          const decodedToken = jwt.verify(token, secret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
          return decodedToken;
        } catch (error) {
          console.error('JWT decode error:', error);
          return null;
        }
    },
  },
  callbacks: {
    // Include user ID and potentially other Supabase specific fields in the JWT and session
    async jwt({ token, user, account }) {
        if (account && user) {
            // On initial sign-in
            token.id = user.id; // Add Supabase user ID to the JWT
            token.provider = account.provider;
        }
        return token;
    },
    async session({ session, token }) {
        if (session.user && token.id) {
            // Add Supabase user ID to the session object
            session.user.id = token.id as string;
        }
        // Add provider info if needed
        // session.provider = token.provider;
        return session;
    },
  },
  secret: nextauthSecret, // Secret for NextAuth session encryption
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for email provider)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out to disable)
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 