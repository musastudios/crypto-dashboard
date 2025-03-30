import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error.message)
      return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(error.message)}`)
    }

    // Successful authentication, redirect to dashboard (or the specified next path)
    console.log('Authentication successful, redirecting to:', next)
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Redirect to the requested page or dashboard by default
  return NextResponse.redirect(`${origin}${next}`)
} 