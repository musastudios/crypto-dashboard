import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  console.log('Auth callback route called:', { 
    hasCode: !!code, 
    redirectTarget: next,
    url: request.url,
  })

  // If we don't have a code, redirect to the sign-in page
  if (!code) {
    console.error('No code parameter found in callback URL')
    return NextResponse.redirect(`${origin}/auth/signin?error=No authentication code received`)
  }

  try {
    console.log('Callback route: Exchanging code for session')
    const supabase = createClient()

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error.message, error)
      return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(error.message)}`)
    }

    if (!data.session) {
      console.error('No session returned after code exchange')
      return NextResponse.redirect(`${origin}/auth/signin?error=Authentication failed`)
    }

    console.log('Authentication successful, session established', {
      userId: data.session.user.id,
      email: data.session.user.email,
    })
    
    // After successful auth, add cache-busting query parameter to prevent browser caching
    // This ensures the dashboard loads with the latest auth state
    const timestamp = Date.now()
    const redirectUrl = `${origin}${next}${next.includes('?') ? '&' : '?'}_auth_sync=${timestamp}`
    
    console.log('Redirecting to:', redirectUrl)
    
    // Use 303 See Other to ensure a GET request regardless of the original request method
    // Add additional security headers to force a fresh page load
    return NextResponse.redirect(redirectUrl, { 
      status: 303,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (err) {
    console.error('Unexpected error in callback handler:', err)
    return NextResponse.redirect(`${origin}/auth/signin?error=An unexpected error occurred`)
  }
} 