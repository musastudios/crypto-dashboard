import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const requestUrl = new URL(req.url);
    
    console.log(`Middleware: Processing ${requestUrl.pathname} (${isProd ? 'prod' : 'dev'})`);
    console.log(`Origin: ${requestUrl.origin}`);
    
    // Create a response object to modify
    const res = NextResponse.next();
    
    // Create the Supabase middleware client
    const supabase = createMiddlewareClient({ req, res });

    console.log("Middleware: Refreshing session");
    
    // Refresh session if expired
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Middleware error refreshing session:", error.message);
      console.error("Error details:", JSON.stringify(error, null, 2));
    } else {
      console.log(`Session state: ${session ? 'Active' : 'No session'}`);
      if (session) {
        // Don't log sensitive info, just confirm existence
        console.log(`User logged in: ${!!session.user.email}`);
        if (session.expires_at) {
          console.log(`Session expires: ${new Date(session.expires_at * 1000).toISOString()}`);
        } else {
          console.log('Session expiration not available');
        }
      }
    }

    return res;
  } catch (error) {
    console.error("Middleware unhandled error:", error);
    // Continue the request even if there's an error with session refresh
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - media files
     * - api routes that don't require auth
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}; 