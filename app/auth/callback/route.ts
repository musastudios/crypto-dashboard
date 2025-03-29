import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const dynamic = 'force-dynamic'; // Ensure the route is always dynamic

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") || "/";
    const isProd = process.env.NODE_ENV === 'production';
    
    console.log(`Auth callback received (${isProd ? 'prod' : 'dev'}). Code: ${code ? 'Present' : 'Missing'}. Redirecting to: ${next}`);
    console.log(`Full request URL: ${request.url}`);
    console.log(`Origin: ${requestUrl.origin}`);

    if (code) {
      console.log("Auth code received, exchanging for session...");
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Exchange the code for a session
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError.message);
        console.error("Exchange Error details:", JSON.stringify(exchangeError));
        // Redirect to error page if code exchange fails
        return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin));
      }
      
      console.log("Session exchange successful. Session data received:", !!sessionData);
      
      // *** Add check for session *after* exchange ***
      const { data: { session: postExchangeSession }, error: getSessionError } = await supabase.auth.getSession();
      if (getSessionError) {
          console.error("Callback: Error getting session immediately after exchange:", getSessionError.message);
      } else {
          console.log("Callback: Session state immediately after exchange:", postExchangeSession ? `User ${postExchangeSession.user.email}` : "No Session");
      }
      // *** End added check ***
      
      // Log cookie names for debugging (in a simpler way)
      if (!isProd) {
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
          console.log('Callback: Cookie header present with length:', cookieHeader.length);
          console.log('Callback: Cookie header contains supabase session:', 
            cookieHeader.includes('sb-') ? 'Yes' : 'No');
        } else {
          console.log('Callback: No cookies found in request');
        }
      }
    } else {
      console.warn("Auth callback called without an authorization code.");
    }

    // Construct the final redirect URL
    const redirectUrl = new URL(next, requestUrl.origin);
    console.log(`Callback: Attempting final redirect to: ${redirectUrl.toString()}`);

    // Redirect to the requested page or home
    return NextResponse.redirect(redirectUrl);

  } catch (error: any) { // Add type annotation
    console.error("Unhandled error in auth callback:", error?.message || error);
    // Redirect to error page on unhandled errors
    return NextResponse.redirect(new URL(`/auth/error?message=Callback%20Error`, request.url));
  }
} 