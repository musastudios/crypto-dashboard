"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CandlestickChart, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

export default function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"; 
  const error = searchParams.get("error"); // Errors can be passed as query params
  const [isLoading, setIsLoading] = useState<'google' | 'twitter' | null>(null);
  const { signIn } = useAuth();

  const handleSignIn = async (provider: 'google' | 'twitter') => {
    try {
      setIsLoading(provider);
      await signIn(provider, callbackUrl);
      // The redirect is handled automatically by Supabase Auth
    } catch (error) {
      console.error(`${provider} sign in initiation failed:`, error);
      toast.error(`${provider} sign in failed. Please try again.`);
      setIsLoading(null);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <CandlestickChart className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Crypto Analytics</CardTitle>
          <CardDescription>
            Please sign in to access your dashboard
          </CardDescription>
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mt-4">
              {/* Display any errors from the auth process */}
              {error}
            </div>
          )}
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Google Button */}
            <Button
              onClick={() => handleSignIn('google')}
              className="w-full"
              variant="outline"
              disabled={isLoading !== null}
            >
              {isLoading === "google" ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            {/* Twitter Button */}
            <Button
              onClick={() => handleSignIn('twitter')}
              className="w-full"
              variant="outline"
              disabled={isLoading !== null}
            >
              {isLoading === "twitter" ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Sign in with Twitter
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-xs text-muted-foreground text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 