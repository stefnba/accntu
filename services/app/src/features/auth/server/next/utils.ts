import { cookies } from 'next/headers';

import { AUTH_COOKIE_NAME } from '@features/auth/server/config';

export const getSessionIdFromCookie = () =>
    cookies().get(AUTH_COOKIE_NAME)?.value ?? null;

/**
 * Set a secure cookie.
 * @param name name of the cookie.
 * @param value value of the cookie.
 * @param lifetime valid period in minutes.
 */
export const setSecureNextCookie = (
    name: string,
    value: any,
    lifetime: number
) => {
    cookies().set(name, value, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * lifetime,
        sameSite: 'lax'
    });
};
