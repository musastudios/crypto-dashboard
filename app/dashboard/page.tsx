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

  // This effect handles auth validation
  useEffect(() => {
    // Wait until auth state is determined
    if (isLoading) return;

    // If not authenticated, redirect to sign-in
    if (!user) {
      const callbackUrl = encodeURIComponent("/dashboard");
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
      return;
    }

    // User is authenticated and auth state is loaded
    setIsReady(true);
  }, [user, isLoading, router]);

  // Show loading state while checking authentication or waiting for state to stabilize
  if (isLoading || !isReady) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Preparing your dashboard...</p>
      </div>
    );
  }

  // User is authenticated and ready
  return <Dashboard />;
} 