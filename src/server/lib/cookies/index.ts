import { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { ZodSchema } from 'zod';
import {
    COOKIE_NAMES_AUTH,
    COOKIE_NAMES_PREFERENCES,
    COOKIE_NAMES_SESSION,
    COOKIE_OPTIONS,
    TCookieNames,
    TCookieNamesAuth,
    TCookieNamesPreferences,
    TCookieNamesSession,
} from './constants';

// Re-export constants
export { COOKIE_NAMES_AUTH, COOKIE_NAMES_PREFERENCES, COOKIE_NAMES_SESSION, COOKIE_OPTIONS };

/**
 * Set a secure cookie (HTTP-only, secure in production)
 */
export function setSecureCookie(
    c: Context,
    name: TCookieNamesAuth,
    value: string,
    durationInMinutes?: number
) {
    setCookie(c, name, value, {
        ...COOKIE_OPTIONS.SECURE,
        maxAge: durationInMinutes ? durationInMinutes * 60 : COOKIE_OPTIONS.SECURE.maxAge,
    });
}

/**
 * Set a preference cookie (accessible by client-side JavaScript)
 */
export function setPreferenceCookie(c: Context, name: TCookieNamesPreferences, value: string) {
    setCookie(c, name, value, COOKIE_OPTIONS.PREFERENCES);
}

/**
 * Set a session cookie (expires when browser is closed)
 */
export function setSessionCookie(c: Context, name: TCookieNamesSession, value: string) {
    setCookie(c, name, value, COOKIE_OPTIONS.SESSION);
}

/**
 * Delete a cookie
 */
export function clearCookie(c: Context, name: TCookieNames) {
    deleteCookie(c, name, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
    });
}

/**
 * Get a cookie value
 * @param c - Hono context
 * @param name - Cookie name
 * @param outputSchema - Optional Zod schema to parse the cookie value
 * @returns Parsed cookie value or null if cookie is not found or parsing fails
 */
export function getCookieValue(c: Context, name: TCookieNames, outputSchema?: ZodSchema) {
    const cookieValue = getCookie(c, name);

    if (!cookieValue) {
        return null;
    }

    if (!outputSchema) {
        return cookieValue;
    }

    try {
        return outputSchema.parse(cookieValue);
    } catch (error) {
        // todo: error handling
        return null;
    }
}

/**
 * Get all cookies
 */
export function getAllCookies(c: Context) {
    return getCookie(c);
}
