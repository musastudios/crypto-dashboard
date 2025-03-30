"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, Settings, User as UserIcon, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import Link from 'next/link'; // Import Link for navigation

// Helper to get initials
const getUserInitials = (name?: string | null): string => {
  if (!name) return "?";
  const nameParts = name.split(" ");
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  return name[0].toUpperCase();
};

export function UserProfile() {
  const { user, signOut, isLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // Toast might not show before redirect
    } catch (error) { 
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (!user) {
    return (
      <Link href="/auth/signin">
        <Button variant="outline" size="sm">
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </Link>
    );
  }

  // Extract user info from the Supabase user object
  const userEmail = user.email;
  const userName = user.user_metadata?.full_name || 
                   user.user_metadata?.name || 
                   user.email?.split('@')[0] || 
                   'User';
  const userImage = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  // Logged-in user view
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {userImage ? (
              <AvatarImage src={userImage} alt={userName} />
            ) : (
              <AvatarFallback>{getUserInitials(userName)}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem className="flex flex-col items-start focus:bg-transparent cursor-default">
          <span className="font-medium text-sm truncate" title={userName}>{userName}</span>
          {userEmail && (
            <span className="text-xs text-muted-foreground truncate" title={userEmail}>
              {userEmail}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Settings Link */}
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
             <Settings className="mr-2 h-4 w-4" />
             <span>Settings</span>
           </Link>
         </DropdownMenuItem> 
         <DropdownMenuSeparator /> 
        <DropdownMenuItem 
          onClick={handleSignOut} 
          disabled={isSigningOut} 
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          {isSigningOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 