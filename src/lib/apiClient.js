"use client";

/**
 * Robust API client for COP CMS
 * prepends the backend URL and handles authentication headers.
 */
export async function callApi(endpoint, options = {}) {
    const backendUrl = process.env.NEXT_PUBLIC_APP_BACKEND_URL || "http://localhost:5000";

    // Clean endpoint
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${backendUrl}${cleanEndpoint}`;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // If auth is true, we ideally want to add the Clerk token.
    // Since this is a utility function, we either expect the token to be passed 
    // or we need to access it from the Clerk window object if available.
    if (options.auth) {
        if (typeof window !== "undefined") {
            // Function to wait for Clerk session to be ready
            const waitForClerk = async () => {
                let attempts = 0;
                while ((!window.Clerk || !window.Clerk.session) && attempts < 20) {
                    await new Promise(r => setTimeout(r, 100));
                    attempts++;
                }
                return window.Clerk && window.Clerk.session;
            };

            const clerkReady = await waitForClerk();

            if (clerkReady) {
                try {
                    const token = await window.Clerk.session.getToken();
                    if (token) {
                        headers["Authorization"] = `Bearer ${token}`;
                        console.log(`[apiClient] Token attached for ${cleanEndpoint}`);
                    } else {
                        console.warn(`[apiClient] No token found in Clerk session for ${cleanEndpoint}`);
                    }
                } catch (err) {
                    console.error("[apiClient] Failed to retrieve Clerk token:", err);
                }
            } else {
                console.warn(`[apiClient] Clerk not initialized or session missing after wait for ${cleanEndpoint}`);
            }
        }
    }

    const { auth, body, ...fetchOptions } = options;

    return fetch(url, {
        ...fetchOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
}
