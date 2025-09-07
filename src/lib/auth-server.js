import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Simple local authentication credentials (in production, use environment variables)
const AUTH_CREDENTIALS = {
  username: 'admin',
  password: 'admin123', // Change this to a secure password
};

// Session configuration
const SESSION_DURATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
const COOKIE_NAME = 'panama_admin_session';

/**
 * Verify login credentials
 * @param {string} username 
 * @param {string} password 
 * @returns {boolean}
 */
export function verifyCredentials(username, password) {
  return username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password;
}

/**
 * Create a session token with expiration
 * @returns {object}
 */
export function createSession() {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const sessionData = {
    user: AUTH_CREDENTIALS.username,
    createdAt: Date.now(),
    expiresAt: expiresAt.getTime(),
  };
  
  // Simple encoding (in production, use proper JWT or encryption)
  const token = Buffer.from(JSON.stringify(sessionData)).toString('base64');
  
  return {
    token,
    expiresAt,
  };
}

/**
 * Verify session token
 * @param {string} token 
 * @returns {object|null}
 */
export function verifySession(token) {
  try {
    if (!token) return null;
    
    const sessionData = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if session has expired
    if (Date.now() > sessionData.expiresAt) {
      return null;
    }
    
    return sessionData;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is authenticated (server-side)
 * @returns {boolean}
 */
export async function isAuthenticated() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    
    if (!sessionCookie) return false;
    
    const session = verifySession(sessionCookie.value);
    return session !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get current user session (server-side)
 * @returns {object|null}
 */
export async function getCurrentSession() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    
    if (!sessionCookie) return null;
    
    return verifySession(sessionCookie.value);
  } catch (error) {
    return null;
  }
}

/**
 * Set session cookie (response)
 * @param {NextResponse} response 
 * @param {string} token 
 * @param {Date} expiresAt 
 */
export function setSessionCookie(response, token, expiresAt) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/',
  });
}

/**
 * Clear session cookie
 * @param {NextResponse} response 
 */
export function clearSessionCookie(response) {
  response.cookies.delete(COOKIE_NAME);
}
