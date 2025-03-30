import { NextRequest, NextResponse } from "next/server";

// Basic middleware setup - doesn't interact with auth session directly
// NextAuth.js handles its own session management
export function middleware(req: NextRequest) {
  console.log(`Middleware: Processing ${req.nextUrl.pathname}`);
  
  // Perform any non-auth checks or modifications here if needed
  // e.g., redirect based on pathname, add headers, etc.
  
  // Allow the request to continue
  return NextResponse.next();
}

// Configuration for which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets, images, 
     * API routes specifically excluded (like /api/auth/*), 
     * and the NextAuth API route itself.
     * Adjust this matcher based on your application's needs.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}; 