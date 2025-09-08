import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifySession } from './auth-server';

/**
 * Server-side authentication check for API routes
 * @param {Request} request 
 * @returns {Promise<{authenticated: boolean, session: object|null, response: NextResponse|null}>}
 */
export async function authenticateApiRequest() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('panama_admin_session');
    
    if (!sessionCookie) {
      return {
        authenticated: false,
        session: null,
        response: NextResponse.json(
          { error: 'Authentication required', message: error.message },
          { status: 401 }
        )
      };
    }
    
    const session = verifySession(sessionCookie.value);
    
    if (!session) {
      // Clear invalid cookie
      const response = NextResponse.json(
        { error: 'Invalid or expired session', message: error.message },
        { status: 401 }
      );
      response.cookies.delete('panama_admin_session');
      
      return {
        authenticated: false,
        session: null,
        response
      };
    }
    
    return {
      authenticated: true,
      session,
      response: null
    };
  } catch (error) {
    return {
      authenticated: false,
      session: null,
      response: NextResponse.json(
        { error: 'Authentication check failed', message: error.message },
        { status: 500 }
      )
    };
  }
}

/**
 * HOC (Higher Order Component) for protecting API routes
 * @param {Function} handler - The API route handler
 * @returns {Function} - Protected API route handler
 */
export function withAuth(handler) {
  return async function (request, context) {
    const authResult = await authenticateApiRequest(request);
    
    if (!authResult.authenticated) {
      return authResult.response;
    }
    
    // Add session to request context
    request.session = authResult.session;
    
    return handler(request, context);
  };
}

/**
 * Middleware function to check authentication in page components
 * @returns {Promise<{authenticated: boolean, session: object|null}>}
 */
export async function getServerAuth() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('panama_admin_session');
    
    if (!sessionCookie) {
      return { authenticated: false, session: null };
    }
    
    const session = verifySession(sessionCookie.value);
    
    return {
      authenticated: session !== null,
      session
    };
  } catch (error) {
    return { authenticated: false, session: null, error: error.message };
  }
}
