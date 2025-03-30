import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  // If we don't have a code, redirect to the sign-in page
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/signin`)
  }

  try {
    const supabase = createClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error.message)
      return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(error.message)}`)
    }

    // After successful auth, add cache-busting query parameter to prevent browser caching
    // This ensures the dashboard loads with the latest auth state
    const timestamp = Date.now()
    const redirectUrl = `${origin}${next}${next.includes('?') ? '&' : '?'}_auth_sync=${timestamp}`
    
    console.log('Authentication successful, redirecting to:', redirectUrl)
    
    // Use 303 See Other to ensure a GET request regardless of the original request method
    return NextResponse.redirect(redirectUrl, { status: 303 })
  } catch (err) {
    console.error('Unexpected error in callback handler:', err)
    return NextResponse.redirect(`${origin}/auth/signin?error=An unexpected error occurred`)
  }
} 