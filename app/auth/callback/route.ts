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
    
    console.log(`Auth callback received (${isProd ? 'prod' : 'dev'}). Redirecting to: ${next}`);
    console.log(`Full request URL: ${request.url}`);
    console.log(`Origin: ${requestUrl.origin}`);

    if (code) {
      console.log("Auth code received, exchanging for session");
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Error exchanging code for session:", error.message);
        console.error("Error details:", JSON.stringify(error));
        
        // Redirect to error page if code exchange fails
        return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
      }
      
      console.log("Session established successfully");
      
      // Log cookie names for debugging (in a simpler way)
      if (!isProd) {
        // Use request headers directly since they're more readily available
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
          console.log('Cookie header present with length:', cookieHeader.length);
          // Just log that cookies exist, not their values for security
          console.log('Cookie header contains supabase session:', 
            cookieHeader.includes('sb-') ? 'Yes' : 'No');
        } else {
          console.log('No cookies found in request');
        }
      }
    } else {
      console.log("No auth code provided in callback");
    }

    // Construct the final redirect URL
    const redirectUrl = new URL(next, requestUrl.origin);
    console.log(`Redirecting to: ${redirectUrl.toString()}`);

    // Redirect to the requested page or home
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Unhandled error in auth callback:", error);
    // Redirect to error page on unhandled errors
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }
} 