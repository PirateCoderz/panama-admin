// /src/middleware.js
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth-server';

// ----- CORS config -----
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
// e.g. ALLOWED_ORIGINS="https://panamatravel.co.uk,https://www.panamatravel.co.uk,http://localhost:5173"

const CORS_METHODS = 'GET,POST,PUT,DELETE,OPTIONS';
const CORS_HEADERS = 'Content-Type, Authorization';
const CORS_ALLOW_CREDENTIALS = false; // set true only if you need cross-site cookies

// ----- Public paths -----
const PUBLIC_PAGES = new Set(['/login', '/access-denied' , '/auth']);

function isApiPath(pathname) {
  return pathname.startsWith('/api/');
}
function isStaticPath(pathname) {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets/') ||
    pathname.includes('.') // files with extensions
  );
}
function pickOrigin(origin) {
  if (!origin) return null;
  return ALLOWED_ORIGINS.includes(origin) ? origin : null;
}
function applyCorsHeaders(res, origin) {
  if (origin) res.headers.set('Access-Control-Allow-Origin', origin);
  res.headers.set('Access-Control-Allow-Methods', CORS_METHODS);
  res.headers.set('Access-Control-Allow-Headers', CORS_HEADERS);
  if (CORS_ALLOW_CREDENTIALS) res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Vary', 'Origin');
  return res;
}
function rewriteToAccessDenied(request) {
  const url = request.nextUrl.clone();
  url.pathname = '/access-denied';
  url.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.rewrite(url);
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 0) Skip static Next internals / assets
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  // 1) Public API with CORS
  if (isApiPath(pathname)) {
    const origin = pickOrigin(request.headers.get('origin'));

    // Preflight
    if (request.method === 'OPTIONS') {
      const pre = new NextResponse(null, { status: 204 });
      return applyCorsHeaders(pre, origin);
    }

    // Normal API response (let route handle, attach CORS)
    const nextRes = NextResponse.next();
    return applyCorsHeaders(nextRes, origin);
  }

  // 2) Public pages: /login and /access-denied
  if (PUBLIC_PAGES.has(pathname)) {
    return NextResponse.next();
  }

  // 3) Everything else is ADMIN-ONLY (/, /blogs, /blog/*, /categories, etc.)
  const cookie = request.cookies.get('panama_admin_session');
  if (!cookie) {
    return rewriteToAccessDenied(request);
  }

  const session = verifySession(cookie.value);
  if (!session) {
    const res = rewriteToAccessDenied(request);
    res.cookies.delete('panama_admin_session');
    return res;
  }

  // Session valid → allow
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
