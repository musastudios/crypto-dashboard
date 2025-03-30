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
  const authSync = searchParams.get('_auth_sync');
  
  // Log auth state for debugging
  useEffect(() => {
    console.log('[DASHBOARD] Auth state:', {
      isLoading,
      hasUser: !!user,
      authSync
    });
  }, [isLoading, user, authSync]);

  // This effect handles auth validation
  useEffect(() => {
    // Wait until auth state is determined
    if (isLoading) {
      console.log('[DASHBOARD] Auth is still loading, waiting...');
      return;
    }

    // If not authenticated, redirect to sign-in
    if (!user) {
      console.log('[DASHBOARD] No authenticated user, redirecting to sign-in');
      // Remember we wanted to go to the dashboard
      window.sessionStorage.setItem('redirectAfterLogin', '/dashboard');
      router.push('/auth/signin');
      return;
    }

    // User is authenticated and auth state is loaded
    console.log('[DASHBOARD] User authenticated, ready to show dashboard');
    setIsReady(true);
  }, [user, isLoading, router]);

  // Show loading state while checking authentication or waiting for state to stabilize
  if (isLoading || !isReady) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Preparing your dashboard...</p>
        {isLoading && <p className="mt-2 text-sm text-muted-foreground">Verifying authentication...</p>}
      </div>
    );
  }

  // User is authenticated and ready
  return <Dashboard />;
} 