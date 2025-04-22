// /middleware.ts
// Handles authentication and protects routes using Clerk.

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that should be protected
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // Protect all routes under /dashboard
  '/settings(.*)',
  '/billing(.*)',
  // Add any other routes that require authentication
]);

// Define public routes (accessible without login)
const isPublicRoute = createRouteMatcher([
    '/', // Landing page
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks/stripe(.*)', // Stripe webhook needs to be public but secured by signature
    // Add other public API routes or pages if needed
]);

export default clerkMiddleware((auth, req) => {
  // If the route is not public, assume it's protected
  if (!isPublicRoute(req)) {
    auth().protect(); // If user is not logged in, redirect to sign-in page defined in .env.local
  }

  // Note: An alternative approach is to explicitly protect routes:
  // if (isProtectedRoute(req)) {
  //   auth().protect();
  // }
});

export const config = {
  // Matcher specifies which routes the middleware should run on.
  // This pattern covers all routes except for static files (_next/static)
  // and image optimization files (_next/image).
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 