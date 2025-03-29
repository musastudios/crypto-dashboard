"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { signInWithGoogle, signInWithTwitter, signOut } from "@/lib/supabase-auth";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const { user, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignIn = async (provider: 'google' | 'twitter') => {
    setIsSigningIn(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithTwitter();
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const result = await signOut();
      if (result.success) {
        // Force router refresh to update auth state
        router.refresh();
        // Redirect to home page
        router.push("/");
        toast.success("Successfully signed out");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return <Button variant="ghost" disabled>Loading...</Button>;
  }

  if (user) {
    // Helper function to get user initials
    const getUserInitials = () => {
      if (!user.user_metadata?.name) return <User className="h-4 w-4" />;
      const nameParts = user.user_metadata.name.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return nameParts[0].charAt(0).toUpperCase();
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {user.user_metadata?.avatar_url ? (
                <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata?.name || "User"} />
              ) : (
                <AvatarFallback>
                  {getUserInitials()}
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <span className="font-medium">{user.user_metadata?.name || "User"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-muted-foreground">
            <span className="text-xs">{user.email}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive" disabled={isSigningOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-1">
      <Button 
        onClick={() => handleSignIn('google')} 
        variant="outline" 
        size="sm"
        disabled={isSigningIn}
        className="gap-2"
      >
        {isSigningIn ? (
          <>Loading...</>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 48 48"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Google
          </>
        )}
      </Button>
      <Button 
        onClick={() => handleSignIn('twitter')} 
        variant="outline" 
        size="sm"
        disabled={isSigningIn}
        className="gap-2"
      >
        {isSigningIn ? (
          <>Loading...</>
        ) : (
          <>
            <svg className="h-4 w-4 fill-current text-[#1DA1F2]" viewBox="0 0 24 24">
              <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
            </svg>
            Twitter
          </>
        )}
      </Button>
    </div>
  );
} 