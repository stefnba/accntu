import { SESSION_COOKIE } from '@features/auth/server/config';
import { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';

/**
 * Set a session cookie with Hono.
 * @param c Hono context.
 * @param token session token value.
 * @param expiresAt expiration of cookie.
 */
export function setSessionTokenCookie(
    c: Context,
    token: string,
    expiresAt: Date
) {
    setCookie(c, SESSION_COOKIE.COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        path: '/'
    });
}

/**
 * Retrieve session token value from cookie.
 * @param c Hono context.
 * @returns
 */
export function getSessionTokenCookie(c: Context): string | null {
    const cookie = getCookie(c, 'session:token') ?? null;
    return cookie;
}

/**
 * Remove valid session cookie by overriding with a empty string.
 * @param c Hono context.
 */
export function deleteSessionTokenCookie(c: Context) {
    setCookie(c, SESSION_COOKIE.COOKIE_NAME, '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/'
    });
}
