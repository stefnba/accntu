import { AppErrors } from '@/server/lib/error';
import { Context } from 'hono';
import { deleteCookie, getCookie, setCookie as honoSetCookie } from 'hono/cookie';
import { ZodSchema } from 'zod';
import {
    COOKIE_NAMES_AUTH,
    COOKIE_NAMES_PREFERENCES,
    COOKIE_NAMES_SESSION,
    COOKIE_NAME_TO_OPTIONS,
    COOKIE_NAME_VALUES,
    COOKIE_OPTIONS,
    TCookieNameLiteral,
    TCookieNamesAuth,
    TCookieNamesPreferences,
    TCookieNamesSession,
    TCookieType,
} from './constants';

// Re-export constants
export {
    COOKIE_NAMES_AUTH,
    COOKIE_NAMES_PREFERENCES,
    COOKIE_NAMES_SESSION,
    COOKIE_NAME_TO_OPTIONS,
    COOKIE_NAME_VALUES,
    COOKIE_OPTIONS,
};

/**
 * Set a cookie with the appropriate options based on the cookie name
 * This is the preferred method for setting cookies as it ensures type safety
 * and automatically applies the correct options
 *
 * @param c - Hono context
 * @param cookieKey - The cookie key (e.g., AUTH_SESSION)
 * @param value - The value to store in the cookie
 * @param cookieType - The type of cookie to set (SECURE, PREFERENCES, SESSION)
 * @param options - Optional override options
 */
export function setCookie(
    c: Context,
    cookieKey: TCookieNameLiteral,
    value: string,
    options?: Partial<(typeof COOKIE_OPTIONS)[keyof typeof COOKIE_OPTIONS] & { type?: TCookieType }>
) {
    const { type: cookieType = 'SECURE', ...overrideOptions } = options || {};

    // Get the actual cookie name (string value) from the key
    const cookieName = COOKIE_NAME_VALUES[cookieKey];
    const baseOptions = COOKIE_OPTIONS[cookieType];

    honoSetCookie(c, cookieName, value, {
        ...baseOptions,
        ...overrideOptions,
    });
}

/**
 * Set a secure cookie (HTTP-only, secure in production)
 */
export function setSecureCookie(
    c: Context,
    cookieKey: TCookieNamesAuth,
    value: string,
    durationInMinutes?: number
) {
    setCookie(c, cookieKey, value, {
        type: 'SECURE',
        maxAge: durationInMinutes ? durationInMinutes * 60 : undefined,
    });
}

/**
 * Set a preference cookie (accessible by client-side JavaScript)
 */
export function setPreferenceCookie(c: Context, cookieKey: TCookieNamesPreferences, value: string) {
    setCookie(c, cookieKey, value, { type: 'PREFERENCES' });
}

/**
 * Set a session cookie (expires when browser is closed)
 */
export function setSessionCookie(c: Context, cookieKey: TCookieNamesSession, value: string) {
    setCookie(c, cookieKey, value, {
        type: 'SESSION',
    });
}

/**
 * Delete a cookie
 */
export function clearCookie(c: Context, cookieKey: TCookieNameLiteral) {
    const cookieName = COOKIE_NAME_VALUES[cookieKey];
    deleteCookie(c, cookieName, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
    });
}

/**
 * Get a cookie value
 * @param c - Hono context
 * @param cookieKey - The cookie key (e.g., AUTH_SESSION)
 * @param outputSchema - Optional Zod schema to parse the cookie value
 * @returns Parsed cookie value or null if cookie is not found or parsing fails
 */
export function getCookieValue<T>(
    c: Context,
    cookieKey: TCookieNameLiteral,
    outputSchema: ZodSchema<T>
): T;
export function getCookieValue(c: Context, cookieKey: TCookieNameLiteral): string | null;
export function getCookieValue<T>(
    c: Context,
    cookieKey: TCookieNameLiteral,
    outputSchema?: ZodSchema<T>
): T | string | null {
    const cookieName = COOKIE_NAME_VALUES[cookieKey];
    const cookieValue = getCookie(c, cookieName);

    if (!cookieValue) {
        return null;
    }

    if (!outputSchema) {
        return cookieValue;
    }

    const parsed = outputSchema.safeParse(cookieValue);

    if (parsed.success) {
        return parsed.data;
    }

    throw AppErrors.cookie('INVALID_VALUE', {
        message: `Invalid cookie value for '${cookieKey}'`,
        cause: parsed.error,
        details: {
            cookieKey,
            zodErrors: parsed.error,
        },
    });
}

/**
 * Get all cookies
 */
export function getAllCookies(c: Context) {
    return getCookie(c);
}
