import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth-server';

export async function GET() {
  try {
    const session = await getCurrentSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      user: session.user,
      expiresAt: new Date(session.expiresAt).toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication check failed' },
      { status: 500 }
    );
  }
}
