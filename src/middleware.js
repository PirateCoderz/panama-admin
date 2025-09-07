import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth-server';

// Define protected routes - admin dashboard at root and admin routes
const ADMIN_ROUTES_PREFIX = '/admin';

// Define public routes that don't need authentication
const PUBLIC_ROUTES = [
  '/login',
  '/blog',
  '/api/GetBlogs', // Public API for fetching blogs
];

// Define auth-related routes
const AUTH_ROUTES = [
  '/api/auth/login',
  '/api/auth/logout', 
  '/api/auth/check',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.includes('.') || // Skip files with extensions (images, etc.)
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }
  
  // Allow auth-related routes
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  if (isAuthRoute) {
    return NextResponse.next();
  }
  
  // Allow other API routes (except admin APIs)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }
  
  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + '/') && route !== '/') return true;
    return false;
  });
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check if this is an admin route (homepage or any route starting with /admin)
  const isAdminRoute = pathname === '/' || pathname.startsWith(ADMIN_ROUTES_PREFIX);
  
  // If it's not an admin route, allow access
  if (!isAdminRoute) {
    return NextResponse.next();
  }
  
  // Get session cookie
  const sessionCookie = request.cookies.get('panama_admin_session');
  
  // If no session cookie, show access denied
  if (!sessionCookie) {
    return rewriteToAccessDenied(request);
  }
  
  // Verify session
  const session = verifySession(sessionCookie.value);
  
  // If session is invalid or expired, show access denied
  if (!session) {
    const response = rewriteToAccessDenied(request);
    // Clear the invalid cookie
    response.cookies.delete('panama_admin_session');
    return response;
  }
  
  // Session is valid, allow access
  return NextResponse.next();
}

function rewriteToAccessDenied(request) {
  // Create a new URL for the access denied page
  const url = request.nextUrl.clone();
  url.pathname = '/access-denied';
  url.searchParams.set('from', request.nextUrl.pathname);
  
  // Redirect to access denied page instead of showing inline
  return NextResponse.rewrite(url);
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
