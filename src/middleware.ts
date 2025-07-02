import { isPathMatch } from '@/lib/auth/utils';
import { LOGIN_REDIRECT_URL, LOGIN_URL, PUBLIC_ROUTES } from '@/lib/routes';
import { COOKIE_NAMES_SESSION } from '@/server/lib/cookies/constants';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is a public route
    const isPublic = isPathMatch(pathname, PUBLIC_ROUTES);

    // check for session cookie
    const sessionCookie = request.cookies.get(COOKIE_NAMES_SESSION.AUTH_SESSION);

    // If session cookie exists and the path is the root, redirect to the dashboard
    if (sessionCookie && ['/login', '/signup', '/'].includes(pathname)) {
        return NextResponse.redirect(new URL(LOGIN_REDIRECT_URL, request.url));
    }

    // If it's a public route, allow access
    if (isPublic) {
        return NextResponse.next();
    }

    // If no session cookie, redirect to login
    if (!sessionCookie) {
        const loginUrl = new URL(LOGIN_URL, request.url);
        // Add the original URL as a query parameter for redirect after login
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Session cookie exists, allow access
    // Note: This doesn't validate the session, just checks for its existence
    // The actual validation happens in the API routes or server components
    return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - /api/* (API routes handled by Hono)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/).*)',
    ],
};
