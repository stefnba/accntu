/**
 * Cookie name constants
 * Centralized place to define all cookie names used in the application
 */
export const COOKIE_NAMES_AUTH = {
    // Auth related cookies
    AUTH_SESSION: 'auth_session', // Session cookie
    AUTH_REFRESH_TOKEN: 'auth_refresh_token', // Refresh token cookie
    AUTH_OTP_EMAIL: 'auth_otp_email', // Email used for OTP verification
    AUTH_OTP_TOKEN: 'auth_otp_token', // OTP token cookie
} as const;
export type TCookieNamesAuth = keyof typeof COOKIE_NAMES_AUTH;

export const COOKIE_NAMES_SESSION = {
    SESSION: 'session',
} as const;
export type TCookieNamesSession = keyof typeof COOKIE_NAMES_SESSION;

export const COOKIE_NAMES_PREFERENCES = {
    // User preferences
    THEME: 'theme',
    LANGUAGE: 'language',
    SIDEBAR_STATE: 'sidebar_state',
} as const;
export type TCookieNamesPreferences = keyof typeof COOKIE_NAMES_PREFERENCES;

export type TCookieNames = TCookieNamesAuth | TCookieNamesPreferences | TCookieNamesSession;

/**
 * Cookie options for different types of cookies
 */
export const COOKIE_OPTIONS = {
    // Secure, HTTP-only cookies for sensitive data (auth)
    SECURE: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },

    // Non-HTTP-only cookies for client-accessible data (theme, etc.)
    PREFERENCES: {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
    },

    // Session cookies that expire when browser is closed
    SESSION: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    },
} as const;
