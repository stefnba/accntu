import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import * as authRoutes from '@/lib/auth/routes';

import { AUTH_COOKIE_NAME } from './lib/auth/config';

export const middleware = async (request: NextRequest) => {
    const { nextUrl } = request;

    const isApiAuthRoute = nextUrl.pathname.startsWith(
        authRoutes.apiAuthPrefix
    );
    const isPublicRoute = authRoutes.publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.authRoutes.includes(nextUrl.pathname);

    // Get sessionId from cookies. It's an indication if a user is logged in
    // validateSession is not possible to be called here because next.js middleware runs on edge environment
    //
    const sessionId = cookies().get(AUTH_COOKIE_NAME)?.value ?? false;
    const isLoggedIn = sessionId ? true : false;

    // If the route is an API route for authentication, don't redirect
    if (isApiAuthRoute) {
        return NextResponse.next();
    }

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
export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
};
