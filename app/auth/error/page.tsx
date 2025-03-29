"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

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
            {error === "Configuration" && "There is a problem with the server configuration."}
            {error === "AccessDenied" && "You do not have permission to sign in."}
            {error === "Verification" && "The verification token has expired or has already been used."}
            {error === "OAuthSignin" && "Error starting the sign in process. Please try again."}
            {error === "OAuthCallback" && "Error completing the sign in process. Please try again."}
            {error === "OAuthCreateAccount" && "Error creating your account. Please try again."}
            {error === "EmailCreateAccount" && "Error creating your account. Please try again."}
            {error === "Callback" && "An unexpected error occurred when signing you in. Please try again."}
            {error === "OAuthAccountNotLinked" && "This email is already associated with another provider."}
            {error === "EmailSignin" && "The email could not be sent. Please try again."}
            {error === "CredentialsSignin" && "The credentials you provided are invalid. Please try again."}
            {error === "SessionRequired" && "You must be signed in to access this page."}
            {error === "Default" || !error && "An unexpected error occurred. Please try again."}
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

export default function AuthError() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
} 