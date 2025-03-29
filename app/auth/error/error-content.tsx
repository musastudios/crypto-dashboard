"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

// This is imported dynamically with { ssr: false } to prevent the Suspense error
export default function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    OAuthSignin: "Error starting the sign in process. Please try again.",
    OAuthCallback: "Error completing the sign in process. Please try again.",
    OAuthCreateAccount: "Error creating your account. Please try again.",
    EmailCreateAccount: "Error creating your account. Please try again.",
    Callback: "An unexpected error occurred when signing you in. Please try again.",
    OAuthAccountNotLinked: "This email is already associated with another provider.",
    EmailSignin: "The email could not be sent. Please try again.",
    CredentialsSignin: "The credentials you provided are invalid. Please try again.",
    SessionRequired: "You must be signed in to access this page.",
    Default: "An unexpected error occurred. Please try again."
  };

  const errorMessage = error ? errorMessages[error as keyof typeof errorMessages] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem signing you in
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              Try again
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 