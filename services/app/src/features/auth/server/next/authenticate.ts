import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { lucia } from '@features/auth/server/lucia';
import { cache } from 'react';

import { getSessionIdFromCookie } from './utils';

/**
 * Check if the user is logged in for Next server side rendering.
 * Get the session id from the cookie.
 */
export const validateRequest = cache(async () => {
    const sessionId = getSessionIdFromCookie();
    if (!sessionId) {
        return {
            user: null,
            session: null
        };
    }

    const result = await lucia.validateSession(sessionId);

    if (!result.user || !result.session) {
        redirect('/logout');
    }

    try {
        if (result.session && result.session.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id);
            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        }
        return result;
    } catch (e) {
        console.error('Error validating session', e);
        redirect('/logout');
    }
});

/**
 * Get the user object within a Nextjs server-side rendering page.
 */
export const getUser = cache(async () => {
    const { user } = await validateRequest();

    if (!user) {
        redirect('/login');
    }

    return user;
});

/**
 * Get the session object within a Nextjs server-side rendering page.
 */
export const getSession = cache(async () => {
    const { session } = await validateRequest();

    if (!session) {
        redirect('/login');
    }

    return session;
});
