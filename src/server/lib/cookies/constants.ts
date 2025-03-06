import { CookieOptions } from 'hono/utils/cookie';

/**
 * Cookie name constants
 * Centralized place to define all cookie names used in the application
 *
 * IMPORTANT: The string values (e.g., 'auth_session') are the actual cookie names used in the browser,
 * while the keys (e.g., AUTH_SESSION) are just constants we use in our code.
 */
export const COOKIE_NAMES_AUTH = {
    // Auth related cookies
    AUTH_SESSION: 'auth_session', // Session cookie
    AUTH_REFRESH_TOKEN: 'auth_refresh_token', // Refresh token cookie
    AUTH_OTP_EMAIL: 'auth_otp_email', // Email used for OTP verification
    AUTH_OTP_TOKEN: 'auth_otp_token', // OTP token cookie
} as const;

export const COOKIE_NAMES_SESSION = {
    SESSION: 'session',
} as const;

export const COOKIE_NAMES_PREFERENCES = {
    // User preferences
    THEME: 'theme',
    LANGUAGE: 'language',
    SIDEBAR_STATE: 'sidebar_state',
} as const;

// Type for cookie names
export type TCookieNamesAuth = keyof typeof COOKIE_NAMES_AUTH;
export type TCookieNamesSession = keyof typeof COOKIE_NAMES_SESSION;
export type TCookieNamesPreferences = keyof typeof COOKIE_NAMES_PREFERENCES;
// Create a union of all cookie name literals (not just the types)
export type TCookieNameLiteral = TCookieNamesAuth | TCookieNamesPreferences | TCookieNamesSession;
// Create a map of all cookie names to their string values
export const COOKIE_NAME_VALUES = {
    ...COOKIE_NAMES_AUTH,
    ...COOKIE_NAMES_SESSION,
    ...COOKIE_NAMES_PREFERENCES,
} as const;
// Type for cookie name values (the actual string values used in the cookies)
export type TCookieNameValue = (typeof COOKIE_NAME_VALUES)[TCookieNameLiteral];
export type TCookieType = 'SECURE' | 'PREFERENCES' | 'SESSION';

/**
 * Cookie options for different types of cookies
 */
export const COOKIE_OPTIONS: Record<TCookieType, CookieOptions> = {
    // Secure, HTTP-only cookies for sensitive data (auth)
    SECURE: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },

    // Non-HTTP-only cookies for client-accessible data (theme, etc.)
    PREFERENCES: {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
    },

    // Session cookies that expire when browser is closed
    SESSION: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
    },
} as const;

// Map each cookie name to its appropriate options
export const COOKIE_NAME_TO_OPTIONS: Record<
    TCookieNameLiteral,
    (typeof COOKIE_OPTIONS)[keyof typeof COOKIE_OPTIONS]
> = {
    // Auth cookies
    AUTH_SESSION: COOKIE_OPTIONS.SECURE,
    AUTH_REFRESH_TOKEN: COOKIE_OPTIONS.SECURE,
    AUTH_OTP_EMAIL: COOKIE_OPTIONS.SECURE,
    AUTH_OTP_TOKEN: COOKIE_OPTIONS.SECURE,

    // Session cookies
    SESSION: COOKIE_OPTIONS.SESSION,

    // Preference cookies
    THEME: COOKIE_OPTIONS.PREFERENCES,
    LANGUAGE: COOKIE_OPTIONS.PREFERENCES,
    SIDEBAR_STATE: COOKIE_OPTIONS.PREFERENCES,
} as const;

// Legacy type for backward compatibility
export type TCookieNames = TCookieNameLiteral;
