"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabase-auth";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      console.log("Refreshing user data...");
      const { data: { session } } = await supabaseClient.auth.getSession();
      console.log("Session data:", session ? "Session active" : "No active session");
      setUser(session?.user || null);
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("Auth provider mounted");
    
    // Get the current user on mount
    const getInitialUser = async () => {
      await refreshUser();
    };

    getInitialUser();

    // Set up the auth state listener
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("User signed in or token refreshed");
          setUser(session?.user || null);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setUser(null);
          setIsLoading(false);
        } else if (event === 'USER_UPDATED') {
          console.log("User updated");
          setUser(session?.user || null);
          setIsLoading(false);
        }
      }
    );

    // Clean up the subscription
    return () => {
      console.log("Auth provider unmounting, cleaning up subscription");
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  const value = {
    user,
    isLoading,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 