"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

// Client-side Supabase instance
export const supabaseClient = createClientComponentClient();

// Server-side admin Supabase instance
export const supabaseAdmin = (url: string, key: string) => 
  createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });

// Authentication functions
export const signInWithGoogle = async (redirectTo = "/") => {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
    },
  });
  
  if (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
  
  return data;
};

export const signInWithTwitter = async (redirectTo = "/") => {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: "twitter",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
    },
  });
  
  if (error) {
    console.error("Error signing in with Twitter:", error);
    throw error;
  }
  
  return data;
};

export const signOut = async () => {
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