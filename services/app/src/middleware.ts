import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import * as authRoutes from '@/lib/auth/routes';

import { AUTH_COOKIE_NAME } from './lib/auth/config';

const { isUrlPatternMatch } = authRoutes;

export const middleware = async (request: NextRequest) => {
    const { nextUrl } = request;

    const isPublicRoute = isUrlPatternMatch(
        nextUrl.pathname,
        authRoutes.publicRoutes
    );
    const isAuthRoute = isUrlPatternMatch(
        nextUrl.pathname,
        authRoutes.authRoutes
    );

    // Get sessionId from cookies. It's an indication if a user is logged in
    // validateSession is not possible to be called here because next.js middleware runs on edge environment
    //
    const sessionId = cookies().get(AUTH_COOKIE_NAME)?.value ?? false;
    const isLoggedIn = sessionId ? true : false;

    if (isAuthRoute) {
        // If user is logged in and tries to access an auth route, redirect to default login redirect
        // since we don't want to show the login page again
        if (isLoggedIn) {
            return Response.redirect(
                new URL(authRoutes.DEFAULT_LOGIN_REDIRECT, nextUrl)
            );
        }

        // User is not logged in, allow access to auth route, e.g. login, register, etc.
        return NextResponse.next();
    }

    // If route is protected and user is not logged on, redirect to login with callbackUrl
    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname;
        let redirectUrl = authRoutes.LOGIN_URL;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }

        if (callbackUrl !== '/') {
            redirectUrl += `?callbackUrl=${encodeURIComponent(callbackUrl)}`;
        }

        return Response.redirect(new URL(redirectUrl, nextUrl));
    }

    return NextResponse.next();
};

// Optionally, don't invoke Middleware on some paths
// /api or /_next paths and static files are not invoked by default
export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next|api).*)', '/', '/(trpc)(.*)']
};
