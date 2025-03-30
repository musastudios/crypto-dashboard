import { createServerClient } from '@supabase/ssr'
import { type CookieOptions, createServerAction$, cookies } from 'next/headers'

// This should only be used in Server Components, Server Actions, or Route Handlers
export async function createClient() {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            // This will only happen in Route Handlers when the response has been sent
            console.error(`Error setting cookie ${name}:`, error)
          }
        },
        remove(name, options) {
          try {
            cookieStore.delete(name, options)
          } catch (error) {
            // This will only happen in Route Handlers when the response has been sent
            console.error(`Error removing cookie ${name}:`, error)
          }
        },
      },
    }
  )

  return supabase
} 