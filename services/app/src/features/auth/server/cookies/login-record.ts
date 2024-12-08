import { LOGIN_ATTEMPT_COOKIE_NAME } from '@features/auth/server/config';
import { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

/**
 * Create cookie for registering a login attempt.
 */
export const createLoginAttemptCookie = async (c: Context, id: string) => {
    setCookie(c, LOGIN_ATTEMPT_COOKIE_NAME, id, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: 60 * 10 // 10 minutes
    });
};

/**
 * Delete login attempt cookie.
 */
export const deleteLoginAttemptCookie = async (c: Context) => {
    deleteCookie(c, LOGIN_ATTEMPT_COOKIE_NAME);
};

/**
 * Retrieve value of login attempt cookie.
 * @param c Hono context.
 * @param deleteAfterAccess whether or not to delete cookie after retrival.
 */
export const getLoginAttemptCookie = async (
    c: Context,
    deleteAfterAccess: boolean = true
) => {
    const value = getCookie(c, LOGIN_ATTEMPT_COOKIE_NAME);

    if (deleteAfterAccess) {
        deleteLoginAttemptCookie(c);
    }

    return value;
};
