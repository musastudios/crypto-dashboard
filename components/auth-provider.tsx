"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

// Define the Auth Context type
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (provider: 'google' | 'twitter', callbackUrl?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Loading component for auth state transitions
function AuthLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="ml-2 text-lg">Loading authentication...</p>
    </div>
  );
}

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  // Setup Supabase auth state listener
  useEffect(() => {
    // Set initial loading state
    setIsLoading(true);

    // Store the "intended destination" route
    const storedRedirectPath = sessionStorage.getItem('redirectAfterLogin');
    
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // If the user is authenticated and we have a stored redirect path, navigate there
      if (session?.user && storedRedirectPath && pathname !== storedRedirectPath) {
        console.log('Redirecting to stored path:', storedRedirectPath);
        router.push(storedRedirectPath);
        sessionStorage.removeItem('redirectAfterLogin');
      }
      
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log("Supabase auth event:", event);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Handle specific auth events
      if (event === 'SIGNED_IN') {
        // If we have a stored redirect path, use it
        const storedPath = sessionStorage.getItem('redirectAfterLogin');
        if (storedPath) {
          console.log('Auth state change: redirecting to stored path:', storedPath);
          router.push(storedPath);
          sessionStorage.removeItem('redirectAfterLogin');
        } 
        // If on sign-in page, redirect to dashboard
        else if (pathname === '/auth/signin') {
          console.log('Auth state change: redirecting to dashboard from sign-in page');
          router.push('/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        // Before redirecting to sign-in, store the current path if it's not the sign-in page
        if (pathname !== '/auth/signin' && pathname !== '/') {
          sessionStorage.setItem('redirectAfterLogin', pathname);
        }
        // Redirect to sign in page after sign out
        router.push('/auth/signin');
      }
      
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  // Sign in with OAuth provider
  async function signIn(provider: 'google' | 'twitter', callbackUrl?: string) {
    try {
      // Store the destination to redirect to after login
      if (callbackUrl) {
        sessionStorage.setItem('redirectAfterLogin', callbackUrl);
      }
      
      // Use the provided callbackUrl or default to dashboard
      const redirectPath = callbackUrl || '/dashboard';
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error signing in with OAuth:", error);
      throw error;
    }
  }

  // Sign out
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  // Create a memoized context value
  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
  };

  // Show loading state if the auth state is loading
  if (isLoading) {
    return <AuthLoader />;
  }

  // Provide the auth context to children
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 