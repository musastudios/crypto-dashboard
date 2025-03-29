import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    console.log("Middleware: Refreshing session");
    
    // Refresh session if expired
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Middleware error refreshing session:", error.message);
    } else {
      console.log("Session state:", session ? "Active" : "No session");
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
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}; 