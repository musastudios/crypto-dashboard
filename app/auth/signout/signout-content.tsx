"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export default function SignOutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // If redirected from a specific page, go back there, otherwise home
  const callbackUrl = searchParams.get("callbackUrl") || "/"; 
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // Use NextAuth's signOut, redirecting back to home page
      await signOut({ callbackUrl: '/', redirect: true }); 
      toast.success("Successfully signed out");
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Failed to sign out. Please try again.");
      setIsLoading(false); // Reset on error
    }
  };

  const handleCancel = () => {
    // Go back to the previous page or the specified callbackUrl
    if (callbackUrl && callbackUrl !== window.location.pathname) {
      router.push(callbackUrl);
    } else {
      router.back(); // Fallback to just going back
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <LogOut className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign Out</CardTitle>
          <CardDescription>
            Are you sure you want to sign out?
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleCancel} 
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSignOut} 
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </div>
              ) : (
                "Sign Out"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 