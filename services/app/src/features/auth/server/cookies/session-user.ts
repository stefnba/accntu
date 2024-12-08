import { User, UserPublicSchema } from '@/features/user/schema/get-user';
import { SESSION_USER } from '@features/auth/server/config';
import { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

/**
 * Set a cookie for session user data with Hono.
 * @param c Hono context.
 * @param data user data.
 * @param expiresAt expiration of cookie.
 */
export function setSessionUserCookie(c: Context, data: User, expiresAt: Date) {
    setCookie(c, SESSION_USER.COOKIE_NAME, JSON.stringify(data), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        path: '/'
    });
}

/**
 * Retrieve session user data from cookie.
 * @param c Hono context.
 * @returns public user data with settings.
 */
export function getSessionUserCookie(c: Context): User | null {
    const cookie = getCookie(c, SESSION_USER.COOKIE_NAME);

    const s = UserPublicSchema.safeParse(
        JSON.parse(decodeURIComponent(cookie || ''))
    );
    if (s.error) {
        return null;
    }
    return s.data;
}

/**
 * Delete session user.
 * @param c Hono context.
 */
export function deleteSessionUserCookie(c: Context) {
    deleteCookie(c, SESSION_USER.COOKIE_NAME);
}
