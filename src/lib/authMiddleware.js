import { clerkClient } from "@clerk/nextjs/server"
import User from "@/models/User"
import { connectDB } from "./db"

/**
 * Route to section mapping
 * Maps API routes to the section they belong to
 */
export const ROUTE_SECTION_MAP = {
  "/api/admin/pages": "pages",
  "/api/admin/blogs": "blogs",
  "/api/admin/providers": "providers",
  "/api/admin/courses": "courses",
  "/api/admin/degree-types": "degree-types",
  "/api/admin/specializations": "specializations",
  "/api/admin/provider-courses": "provider-courses",
  "/api/admin/leads": "leads",
  "/api/admin/reviews": "reviews",
  "/api/admin/users": "users",
  "/api/admin/activities": "activities",
  "/api/admin/home-hero-section": "home-hero-section",
  "/api/admin/home-industry-experts-section": "home-industry-experts-section",
  "/api/admin/home-program-experts-section": "home-program-experts-section",
  "/api/admin/home-questions-section": "home-questions-section",
}

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  "/api/auth/send-invite",
  "/api/auth/set-password",
  "/api/leads", // Public lead form submission
]

/**
 * Get the section from a route path
 * @param {string} pathname - The request pathname
 * @returns {string|null} - The section name or null if not found
 */
export function getSectionFromRoute(pathname) {
  // Check exact matches first
  if (ROUTE_SECTION_MAP[pathname]) {
    return ROUTE_SECTION_MAP[pathname]
  }

  // Check pattern matches (e.g., /api/admin/pages/[slug])
  for (const [route, section] of Object.entries(ROUTE_SECTION_MAP)) {
    if (pathname.startsWith(route)) {
      return section
    }
  }

  return null
}

/**
 * Check if user has permission to access a section
 * @param {string} section - The section to check
 * @param {object} user - The user object with role and access array
 * @returns {boolean} - True if user has access
 */
export function hasAccessToSection(section, user) {
  // Admin has access to everything
  if (user.role === "admin") {
    return true
  }

  // Check if section is in user's access array
  return user.access?.includes(section) ?? false
}

/**
 * Authorize a request based on Clerk auth + section permissions
 * @param {object} req - Next.js request object
 * @param {object} auth - Clerk auth object from middleware
 * @returns {object} - { authorized: boolean, user?: object, error?: string }
 */
export async function authorizeRequest(req, auth) {
  try {
    // Get the pathname from the request
    const pathname = new URL(req.url).pathname

    // Check if route is public
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      pathname.startsWith(route)
    )
    if (isPublicRoute) {
      return { authorized: true }
    }

    // Get Clerk user from auth object passed from middleware
    const { userId } = await auth()
    if (!userId) {
      console.log(`❌ No Clerk auth for ${pathname}`)
      return {
        authorized: false,
        error: "Unauthorized: Please log in",
        status: 401,
      }
    }

    console.log(`✓ Clerk auth found: ${userId}`)

    // Connect to database
    await connectDB()

    // Find user in MongoDB using Clerk ID
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      console.log(`❌ User not found in DB for Clerk ID: ${userId}`)
      return {
        authorized: false,
        error: "User not found in system",
        status: 404,
      }
    }

    console.log(`✓ User found: ${user.email}, role: ${user.role}`)

    // Check if user is active
    if (!user.isActive) {
      console.log(`❌ User is inactive: ${user.email}`)
      return {
        authorized: false,
        error: "User account is inactive",
        status: 403,
      }
    }

    // Get section from route
    const section = getSectionFromRoute(pathname)
    if (!section) {
      // Route exists but not in our map — allow (could be a new route)
      console.log(`⚠️ Route not in section map: ${pathname}`, { authorized: true })
      return { authorized: true, user }
    }

    // Check section access
    if (!hasAccessToSection(section, user)) {
      console.log(`❌ Access denied to ${section} for user ${user.email}`)
      return {
        authorized: false,
        error: `Access denied to ${section} section`,
        status: 403,
      }
    }

    console.log(`✓ Access granted to ${section} for user ${user.email}`)
    return { authorized: true, user }
  } catch (err) {
    console.error("❌ Authorization error:", err.message, err.stack)
    return {
      authorized: false,
      error: "Internal server error",
      status: 500,
    }
  }
}

/**
 * Send an unauthorized response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Response}
 */
export function unauthorizedResponse(message, status = 403) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { "Content-Type": "application/json" } }
  )
}
