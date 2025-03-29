"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabase-auth";
import { usePathname, useRouter } from "next/navigation";

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

function RouteChangeListener({ onRouteChange }: { onRouteChange: () => void }) {
  const pathname = usePathname();
  useEffect(() => {
    console.log("Route changed to:", pathname);
    onRouteChange();
  }, [pathname, onRouteChange]);
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      console.log("AuthProvider: Refreshing user data...");
      const { data: { session }, error } = await supabaseClient.auth.refreshSession();
      if (error) {
        console.error("AuthProvider: Error refreshing session:", error.message);
        const { data: fallbackData, error: fallbackError } = await supabaseClient.auth.getSession();
        if (fallbackError) {
          console.error("AuthProvider: Error getting session after refresh failed:", fallbackError.message);
          setUser(null);
        } else {
          console.log("AuthProvider: Using fallback getSession. Session:", fallbackData.session ? "Active" : "No Session");
          setUser(fallbackData.session?.user ?? null);
        }
      } else {
        console.log("AuthProvider: Session refreshed. Session:", session ? "Active" : "No Session");
        setUser(session?.user ?? null);
      }
    } catch (error) {
      console.error("AuthProvider: Unhandled error during refreshUser:", error);
      setUser(null);
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    console.log("Auth provider mounted");
    
    refreshUser();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: Auth state changed:", event, "Session:", session ? "Present" : "Null");
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

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
      <RouteChangeListener onRouteChange={refreshUser} />
    </AuthContext.Provider>
  );
} 