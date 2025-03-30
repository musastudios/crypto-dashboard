"use client";

import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (user && !isLoading) {
      router.push('/dashboard');
    } else if (!isLoading && !user) {
      // If user is not authenticated, redirect to sign-in
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg">Redirecting...</p>
    </div>
  );
}

