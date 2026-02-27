/**
 * Get the current app URL based on request headers
 * This works on any device automatically (localhost, IP, domain)
 * 
 * @param {object} req - Next.js request object
 * @returns {string} - Base URL (e.g., http://192.168.1.7:3000)
 */
export function getAppUrl(req) {
  // Get the host from request headers
  const host = req.headers.get("host") || req.headers.host
  
  if (!host) {
    console.warn("⚠️  Could not determine host from request headers")
    return "http://localhost:3000"
  }

  // Determine protocol based on environment
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  
  // Construct the base URL
  const baseUrl = `${protocol}://${host}`
  
  console.log(`✓ App URL detected: ${baseUrl}`)
  return baseUrl
}

/**
 * Alternative: Get app URL from environment or request
 * Prioritizes: Env variable > Request header > Localhost fallback
 */
export function getAppUrlWithFallback(req) {
  // Use environment variable if explicitly set (for production)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Otherwise detect from request
  return getAppUrl(req)
}
