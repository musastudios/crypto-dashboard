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
  const [authInitialized, setAuthInitialized] = useState(false);
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  // Special debug function to help diagnose auth issues
  const logAuthDebug = (message: string, data?: any) => {
    console.log(`[AUTH DEBUG] ${message}`, data || '');
  };

  // Setup Supabase auth state listener
  useEffect(() => {
    // Set initial loading state
    setIsLoading(true);
    logAuthDebug('Auth provider initializing', { pathname });

    // Store the "intended destination" route
    const storedRedirectPath = window.sessionStorage.getItem('redirectAfterLogin');
    logAuthDebug('Found stored redirect path', storedRedirectPath || 'none');
    
    // Force a check for an existing session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      logAuthDebug('Initial session check', { 
        hasSession: !!session, 
        user: session?.user?.email || 'none'
      });

      setSession(session);
      setUser(session?.user ?? null);
      
      // Flag that we've completed initial auth check
      setAuthInitialized(true);
      
      // Handle redirect logic only after we have determined the session state
      if (session?.user) {
        logAuthDebug('User is authenticated');
        
        // User is logged in - determine where to send them
        if (pathname === '/auth/signin') {
          // If on login page, send to dashboard or stored path
          const targetPath = storedRedirectPath || '/dashboard';
          logAuthDebug(`Redirecting from sign-in to ${targetPath}`);
          setTimeout(() => router.push(targetPath), 100);
          if (storedRedirectPath) {
            window.sessionStorage.removeItem('redirectAfterLogin');
          }
        } else if (storedRedirectPath && pathname !== storedRedirectPath) {
          // If we have a stored path and we're not on it, go there
          logAuthDebug(`Redirecting to stored path: ${storedRedirectPath}`);
          setTimeout(() => router.push(storedRedirectPath), 100);
          window.sessionStorage.removeItem('redirectAfterLogin');
        }
      } else {
        // No user session found
        logAuthDebug('No authenticated user found');
        
        // If on a protected route, redirect to sign-in
        if (pathname !== '/auth/signin' && pathname !== '/' && pathname !== '/auth/callback') {
          logAuthDebug(`Redirecting to sign-in from ${pathname}`);
          window.sessionStorage.setItem('redirectAfterLogin', pathname);
          setTimeout(() => router.push('/auth/signin'), 100);
        }
      }
      
      setIsLoading(false);
    }).catch((err: Error) => {
      logAuthDebug('Error checking session', err);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, newSession: Session | null) => {
      logAuthDebug('Auth state change event', { event, hasSession: !!newSession });
      
      // Update our state with the new session
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Handle redirect logic based on the auth event
      if (event === 'SIGNED_IN') {
        logAuthDebug('SIGNED_IN event fired');
        
        // If we have a stored redirect path, use it
        const storedPath = window.sessionStorage.getItem('redirectAfterLogin');
        const targetPath = storedPath || '/dashboard';
        
        // Delay the redirect slightly to ensure state updates first
        setTimeout(() => {
          logAuthDebug(`Redirecting after sign-in to ${targetPath}`);
          router.push(targetPath);
          if (storedPath) {
            window.sessionStorage.removeItem('redirectAfterLogin');
          }
        }, 200);
      } 
      else if (event === 'SIGNED_OUT') {
        logAuthDebug('SIGNED_OUT event fired');
        
        // Before redirecting to sign-in, store the current path
        if (pathname !== '/auth/signin' && pathname !== '/' && pathname !== '/auth/callback') {
          window.sessionStorage.setItem('redirectAfterLogin', pathname);
        }
        
        // Redirect to sign-in page after sign-out
        setTimeout(() => router.push('/auth/signin'), 100);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      logAuthDebug('Cleaning up auth subscription');
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
    isLoading: isLoading || !authInitialized,
    signIn,
    signOut,
  };

  // Show loading state if the auth state is loading
  if (isLoading || !authInitialized) {
    return <AuthLoader />;
  }

  // Provide the auth context to children
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 