import { createClient } from "@supabase/supabase-js"

let supabase: any;

try {
  // Safely get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate URL and key before creating client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
    
    // Create a mock client for development that won't break the app
    supabase = {
      from: () => ({
        select: () => ({
          order: () => ({
            eq: () => ({
              single: () => ({ data: null, error: { message: "Supabase not configured" } }),
              data: null, 
              error: { message: "Supabase not configured" }
            }),
            data: null, 
            error: { message: "Supabase not configured" }
          }),
          eq: () => ({
            single: () => ({ data: null, error: { message: "Supabase not configured" } }),
            data: null, 
            error: { message: "Supabase not configured" }
          }),
          data: null, 
          error: { message: "Supabase not configured" }
        }),
        insert: () => ({
          select: () => ({
            single: () => ({ data: null, error: { message: "Supabase not configured" } })
          }),
          data: null, 
          error: { message: "Supabase not configured" }
        }),
        update: () => ({
          eq: () => ({ data: null, error: { message: "Supabase not configured" } })
        }),
        delete: () => ({
          eq: () => ({ data: null, error: { message: "Supabase not configured" } })
        })
      })
    };
  } else {
    try {
      // Basic URL validation
      new URL(supabaseUrl);
      // Create the client
      supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error("Invalid Supabase URL:", error);
      // Set up a mock client that won't break the app
      supabase = {
        from: () => ({
          select: () => ({
            data: null, 
            error: { message: "Invalid Supabase URL" }
          })
        })
      };
    }
  }
} catch (error) {
  console.error("Error initializing Supabase client:", error);
  // Set up a mock client that won't break the app
  supabase = {
    from: () => ({
      select: () => ({
        data: null, 
        error: { message: "Supabase client error" }
      })
    })
  };
}

export { supabase }

