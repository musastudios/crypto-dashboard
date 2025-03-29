import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") || "/";
    
    console.log("Auth callback received. Redirecting to:", next);

    if (code) {
      console.log("Auth code received, exchanging for session");
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Error exchanging code for session:", error.message);
        // Redirect to error page if code exchange fails
        return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
      }
      
      console.log("Session established successfully");
    } else {
      console.log("No auth code provided in callback");
    }

    // Redirect to the requested page or home
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (error) {
    console.error("Unhandled error in auth callback:", error);
    // Redirect to error page on unhandled errors
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }
} 