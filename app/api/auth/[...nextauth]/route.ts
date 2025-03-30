import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import jwt from 'jsonwebtoken';

// Validate essential environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}
if (!process.env.SUPABASE_JWT_SECRET) {
  throw new Error('Missing SUPABASE_JWT_SECRET');
}
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('Missing GOOGLE_CLIENT_ID');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing GOOGLE_CLIENT_SECRET');
}
if (!process.env.TWITTER_CLIENT_ID) {
  throw new Error('Missing TWITTER_CLIENT_ID');
}
if (!process.env.TWITTER_CLIENT_SECRET) {
  throw new Error('Missing TWITTER_CLIENT_SECRET');
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET');
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // Note: Twitter v1.1 provider might be needed if v2 causes issues
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      version: '2.0', // Specify OAuth 2.0
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.SUPABASE_JWT_SECRET, // Use Supabase secret for JWT signing
    encode: async ({ secret, token }) => {
      // Ensure token is not undefined before signing
      if (!token) {
        throw new Error('JWT encode error: Token is undefined');
      }
      // Claims that Supabase expects: aud, iat, exp, sub, email, role
      const claims: jwt.JwtPayload = {
        ...token,
        aud: 'authenticated', 
        role: 'authenticated', // Default role, adjust if needed
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // Example: 7 days expiry
      };
      // Remove default NextAuth claims if they conflict or are not needed by Supabase RLS
      delete claims.iat;
      delete claims.jti;
      
      console.log("Encoding JWT with claims:", claims);
      return jwt.sign(claims, secret, { algorithm: 'HS256' });
    },
    decode: async ({ secret, token }) => {
      if (!token) {
        console.error('JWT decode error: No token provided');
        return null;
      }
      try {
        const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
        console.log("Decoded JWT:", decoded);
        return decoded as jwt.JwtPayload;
      } catch (error) {
        console.error('JWT decode error:', error);
        return null;
      }
    },
  },
  callbacks: {
    // Add Supabase user ID to the session
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub; // token.sub usually holds the user ID from the adapter
      }
      console.log("Session callback, token:", token);
      console.log("Session callback, returning session:", session);
      return session;
    },
    // Optional: Log JWT details
    async jwt({ token, user, account }) {
      console.log("JWT callback, token:", token);
      console.log("JWT callback, user:", user); // Available on first sign in
      console.log("JWT callback, account:", account); // Available on first sign in
      // Ensure the subject ('sub') claim is set correctly on initial sign-in
      if (account && user) {
        token.sub = user.id; // Important: Use the ID provided by the adapter
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    // error: '/auth/error', // Optional error page
  },
  // Enable debug logs in development
  debug: process.env.NODE_ENV === 'development',
  // Add detailed logger for debugging
  logger: {
    error(code, metadata) {
      console.error(`NextAuth Error: ${code}`, metadata);
    },
    warn(code) {
      console.warn(`NextAuth Warning: ${code}`);
    },
    debug(code, metadata) {
      console.log(`NextAuth Debug: ${code}`, metadata);
    }
  },
  // Add events for tracking auth flow
  events: {
    async signIn(message) {
      console.log('NextAuth Event - Sign in attempt:', message);
    },
    async signOut(message) {
      console.log('NextAuth Event - Sign out:', message);
    },
    async createUser(message) {
      console.log('NextAuth Event - User created:', message);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 