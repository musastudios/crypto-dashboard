import { createBrowserClient } from '@supabase/ssr'

// Create a singleton client instance
let client: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient() {
  if (client) {
    return client;
  }

  // Create a new client if one doesn't exist
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
} 