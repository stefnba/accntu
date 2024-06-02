import { LOGIN_ATTEMPT_COOKIE_NAME } from '@auth/config';
import { boolean } from 'drizzle-orm/mysql-core';
import { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

/**
 *
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

export const deleteLoginAttemptCookie = async (c: Context) => {
    deleteCookie(c, LOGIN_ATTEMPT_COOKIE_NAME);
};

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
