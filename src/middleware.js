import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import {
  authorizeRequest,
  PUBLIC_ROUTES,
  getSectionFromRoute,
} from "./lib/authMiddleware"

export default clerkMiddleware(async (auth, req) => {
  const pathname = new URL(req.url).pathname

  // Allow public routes
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protect /api/admin/* routes with section-based access control
  if (pathname.startsWith("/api/admin")) {
    // Check authorization
    const authResult = await authorizeRequest(req, auth)

    console.log(`Auth check for ${pathname}:`, {
      authorized: authResult.authorized,
      error: authResult.error,
      status: authResult.status,
    })

    if (!authResult.authorized) {
      return new NextResponse(
        JSON.stringify({
          error: authResult.error || "Access denied",
        }),
        {
          status: authResult.status || 403,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Add user info to request for use in route handlers
    req.user = authResult.user
  }

  // Protect /admin/* pages (frontend routes)
  if (pathname.startsWith("/admin")) {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif).*)",
  ],
}

// Allow Node.js runtime for database operations
export const runtime = "nodejs"
