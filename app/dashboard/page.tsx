"use client";

import { useAuth } from "@/components/auth-provider";
import Dashboard from "@/components/dashboard";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0); 
  const authSync = searchParams.get('_auth_sync');
  
  // Log auth state for debugging
  useEffect(() => {
    console.log('[DASHBOARD] Auth state:', {
      isLoading,
      hasUser: !!user,
      authSync,
      redirectAttempts
    });
  }, [isLoading, user, authSync, redirectAttempts]);

  // This effect handles auth validation
  useEffect(() => {
    // Wait until auth state is determined
    if (isLoading) {
      console.log('[DASHBOARD] Auth is still loading, waiting...');
      return;
    }

    // To prevent an infinite redirect loop, only allow a limited number of redirect attempts
    if (redirectAttempts >= 2) {
      console.warn('[DASHBOARD] Multiple redirect attempts detected, breaking potential loop. User state:', !!user);
      setIsReady(true);
      return;
    }

    // If not authenticated, redirect to sign-in
    if (!user) {
      console.log('[DASHBOARD] No authenticated user, redirecting to sign-in');
      // Remember we wanted to go to the dashboard
      window.sessionStorage.setItem('redirectAfterLogin', '/dashboard');
      setRedirectAttempts(prev => prev + 1);
      router.push('/auth/signin');
      return;
    }

    // User is authenticated and auth state is loaded
    console.log('[DASHBOARD] User authenticated, ready to show dashboard');
    setIsReady(true);
  }, [user, isLoading, router, redirectAttempts]);

  // Show loading state while checking authentication or waiting for state to stabilize
  if (isLoading || !isReady) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Preparing your dashboard...</p>
        {isLoading && <p className="mt-2 text-sm text-muted-foreground">Verifying authentication...</p>}
        {!isLoading && !isReady && <p className="mt-2 text-sm text-muted-foreground">Stabilizing session state...</p>}
      </div>
    );
  }

  // If after multiple redirect attempts we still have no user,
  // display a more helpful error message instead of a broken dashboard
  if (!user && redirectAttempts >= 2) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-muted-foreground mb-6">
          We're having trouble verifying your login status. This might be due to:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">Session cookies not being properly set</li>
          <li className="mb-2">Browser privacy settings blocking authentication</li>
          <li className="mb-2">A temporary issue with our authentication service</li>
        </ul>
        <button 
          onClick={() => {
            // Clear any problematic state and try again
            window.sessionStorage.removeItem('redirectAfterLogin');
            router.push('/auth/signin');
          }}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  // User is authenticated and ready
  return <Dashboard />;
} 