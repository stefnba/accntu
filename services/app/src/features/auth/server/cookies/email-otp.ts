import { EMAIL_OTP_LOGIN } from '@features/auth/server/config';
import { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

/**
 *
 */
export const createEmailOtpCookie = async (c: Context, id: string) => {
    setCookie(c, EMAIL_OTP_LOGIN.COOKIE_NAME, id, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: EMAIL_OTP_LOGIN.EXPIRATION * 60
    });
};

export const deleteEmailOtpCookie = async (c: Context) => {
    deleteCookie(c, EMAIL_OTP_LOGIN.COOKIE_NAME);
};

export const getEmailOtpCookie = async (
    c: Context,
    deleteAfterAccess: boolean = true
) => {
    const value = getCookie(c, EMAIL_OTP_LOGIN.COOKIE_NAME);

    if (deleteAfterAccess) {
        deleteEmailOtpCookie(c);
    }

    return value;
};
