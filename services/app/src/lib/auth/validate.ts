import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { cache } from 'react';

import lucia from './authenticate';
import { AUTH_COOKIE_NAME } from './config';
import type { TValiDateRequest } from './types';

export const validateRequest = cache(async (): Promise<TValiDateRequest> => {
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
    } catch (e) {
        console.error('Error validating session', e);
    }
    return result;
});

export const getSessionIdFromCookie = () =>
    cookies().get(AUTH_COOKIE_NAME)?.value ?? null;

export const getUser = cache(async () => {
    const { user } = await validateRequest();

    if (!user) {
        redirect('/login');
    }

    return user;
});

export const getSession = cache(async () => {
    const { session } = await validateRequest();

    if (!session) {
        redirect('/login');
    }

    return session;
});
