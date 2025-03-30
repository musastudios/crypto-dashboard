"use client";

import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  useEffect(() => {
    // If authentication is still loading, wait
    if (isLoading) {
      console.log('[ROOT] Auth is still loading, waiting...');
      return;
    }

    // Prevent potential redirect loops
    if (redirectAttempts >= 2) {
      console.warn('[ROOT] Multiple redirect attempts detected, breaking potential loop. User state:', !!user);
      return;
    }

    if (user) {
      // User is authenticated, redirect to dashboard with a slight delay
      // to ensure all auth state is properly loaded
      console.log('[ROOT] User authenticated, redirecting to dashboard');
      const timer = setTimeout(() => {
        setRedirectAttempts(prev => prev + 1);
        router.push('/dashboard');
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // User is not authenticated, redirect to sign-in
      console.log('[ROOT] No authenticated user, redirecting to sign-in');
      const timer = setTimeout(() => {
        setRedirectAttempts(prev => prev + 1);
        router.push('/auth/signin');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, router, redirectAttempts]);

  // Show helpful error message if we're stuck in a loop
  if (!isLoading && redirectAttempts >= 2) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4">Navigation Issue Detected</h1>
        <p className="text-muted-foreground mb-6 max-w-md text-center">
          We're having trouble directing you to the right page. This might be due to
          authentication issues or browser settings.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/90"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg">Redirecting to the right place...</p>
      {isLoading && <p className="mt-2 text-sm text-muted-foreground">Checking authentication...</p>}
    </div>
  );
}

