import { NextResponse } from 'next/server';
import { verifyCredentials, createSession, setSessionCookie } from '@/lib/auth-server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    // Verify credentials
    if (!verifyCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Create session
    const { token, expiresAt } = createSession();
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      expiresAt: expiresAt.toISOString(),
    });
    
    // Set session cookie
    setSessionCookie(response, token, expiresAt);
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
