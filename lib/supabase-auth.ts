"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

// Ensure NEXT_PUBLIC_APP_URL is defined
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
if (!appUrl) {
  console.error("Error: NEXT_PUBLIC_APP_URL environment variable is not set.");
  // Optionally throw an error or provide a default for local dev, but failing fast is often better
  // throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable");
}

// Client-side Supabase instance - using default options
export const supabaseClient = createClientComponentClient();

// Server-side admin Supabase instance
export const supabaseAdmin = (url: string, key: string) => 
  createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });

// Construct the base callback URL
const authCallbackUrl = `${appUrl || 'http://localhost:3000'}/auth/callback`;

// Authentication functions
export const signInWithGoogle = async (redirectTo = "/") => {
  console.log(`Google SignIn: Redirecting AFTER auth to: ${redirectTo}`);
  console.log(`Google SignIn: Using callback URL: ${authCallbackUrl}`);
  
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${authCallbackUrl}?next=${encodeURIComponent(redirectTo)}`,
      queryParams: {
        prompt: 'select_account' // Always show account selector
      }
    },
  });
  
  if (error) {
    console.error("Error initiating Google sign in:", error);
    throw error;
  }
  
  return data;
};

export const signInWithTwitter = async (redirectTo = "/") => {
  console.log(`Twitter SignIn: Redirecting AFTER auth to: ${redirectTo}`);
  console.log(`Twitter SignIn: Using callback URL: ${authCallbackUrl}`);
  
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: "twitter",
    options: {
      redirectTo: `${authCallbackUrl}?next=${encodeURIComponent(redirectTo)}`,
    },
  });
  
  if (error) {
    console.error("Error initiating Twitter sign in:", error);
    throw error;
  }
  
  return data;
};

export const signOut = async () => {
  console.log("Signing out...");
  const { error } = await supabaseClient.auth.signOut();
  
  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
  
  // Instead of using redirect, we'll return a success status
  // The component can handle navigation after sign out
  return { success: true };
};

export const getUser = async () => {
  const { data, error } = await supabaseClient.auth.getUser();
  
  if (error) {
    console.error("Error getting user:", error);
    return null;
  }
  
  return data?.user || null;
};

export const getUserSession = async () => {
  const { data, error } = await supabaseClient.auth.getSession();
  
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  
  return data?.session || null;
}; 