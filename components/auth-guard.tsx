"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const isUnauthenticated = status === "unauthenticated";

  useEffect(() => {
    // If not loading and user is not authenticated, redirect to sign-in
    if (!isLoading && isUnauthenticated) {
      console.log("AuthGuard: User unauthenticated, redirecting to signin");
      router.push("/auth/signin"); 
    }
  }, [isLoading, isUnauthenticated, router]);

  if (isLoading) {
    // Show a loading indicator while checking session status
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Verifying session...</p>
      </div>
    );
  }

  // If authenticated, render the children
  if (session) {
    return <>{children}</>;
  }

  // If unauthenticated (and not loading), redirect handled by useEffect
  // Render null briefly while redirect occurs to prevent flashing content
  return null; 
} 