"use client";

import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication is still loading, wait
    if (isLoading) {
      console.log('[ROOT] Auth is still loading, waiting...');
      return;
    }

    if (user) {
      // User is authenticated, redirect to dashboard with a slight delay
      // to ensure all auth state is properly loaded
      console.log('[ROOT] User authenticated, redirecting to dashboard');
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // User is not authenticated, redirect to sign-in
      console.log('[ROOT] No authenticated user, redirecting to sign-in');
      const timer = setTimeout(() => {
        router.push('/auth/signin');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg">Redirecting to the right place...</p>
      {isLoading && <p className="mt-2 text-sm text-muted-foreground">Checking authentication...</p>}
    </div>
  );
}

