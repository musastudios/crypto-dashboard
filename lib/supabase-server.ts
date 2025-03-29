import { createClient } from "@supabase/supabase-js"

let supabaseAdmin: any;

try {
  // Safely get environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate URL and key before creating client
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables for server-side operations. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    
    // Create a mock admin client that won't break the app
    supabaseAdmin = {
      from: () => ({
        select: () => ({
          order: () => ({
            range: () => ({
              data: null, 
              error: { message: "Supabase admin not configured" },
              count: 0
            }),
            data: null, 
            error: { message: "Supabase admin not configured" }
          }),
          eq: () => ({
            single: () => ({ data: null, error: { message: "Supabase admin not configured" } }),
            data: null, 
            error: { message: "Supabase admin not configured" }
          }),
          data: null, 
          error: { message: "Supabase admin not configured" },
          count: 0
        }),
        insert: () => ({
          select: () => ({
            single: () => ({ data: null, error: { message: "Supabase admin not configured" } })
          }),
          data: null, 
          error: { message: "Supabase admin not configured" }
        }),
        update: () => ({
          eq: () => ({ data: null, error: { message: "Supabase admin not configured" } })
        })
      })
    };
  } else {
    try {
      // Basic URL validation
      new URL(supabaseUrl);
      
      // Create the client with proper configuration
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } catch (error) {
      console.error("Invalid Supabase URL for server-side operations:", error);
      // Set up a mock client that won't break the app
      supabaseAdmin = {
        from: () => ({
          select: () => ({
            data: null, 
            error: { message: "Invalid Supabase admin URL" }
          })
        })
      };
    }
  }
} catch (error) {
  console.error("Error initializing Supabase admin client:", error);
  // Set up a mock client that won't break the app
  supabaseAdmin = {
    from: () => ({
      select: () => ({
        data: null, 
        error: { message: "Supabase admin client error" }
      })
    })
  };
}

export { supabaseAdmin }

